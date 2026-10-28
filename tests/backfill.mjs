#!/usr/bin/env node
/**
 * Lottie Gradient Editor - 渐变回填页测试
 *
 * 覆盖 backfill.html：从 .aep 读取真实色标 → 与 JSON 比对 → 勾选回填。
 *
 * 与其他冒烟测试的区别：这页用 Pyodide 在浏览器里跑 Python，需要 http(s) 加载
 * wasm/zip，所以测试自带一个静态文件服务器（随机端口），不用 file://。
 *
 * 运行：
 *   cd tests && npm run test:backfill
 *   CHROME_PATH=/path/to/chrome npm run test:backfill
 *   HEADFUL=1 npm run test:backfill
 *   ARTIFACTS_DIR=artifacts/backfill npm run test:backfill
 *
 * 退出码：0 = 全部 PASS，1 = 有 FAIL
 */

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TESTS_DIR = __dirname;
const REPO_ROOT = path.resolve(__dirname, '..');

const FIXTURE_MATCH = path.join(TESTS_DIR, 'fixtures', 'gradient-match.json');
const FIXTURE_LOST = path.join(TESTS_DIR, 'fixtures', 'gradient-lost.json');
const FIXTURE_AEP = path.join(TESTS_DIR, 'fixtures', 'sample.aep');

const ARTIFACTS = process.env.ARTIFACTS_DIR
    ? path.resolve(TESTS_DIR, process.env.ARTIFACTS_DIR)
    : path.join(TESTS_DIR, 'artifacts', 'backfill');
const CHROME_PROFILE = path.join(TESTS_DIR, '.chrome-profile-backfill');
const CHROME_PATH = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const HEADLESS = process.env.HEADFUL === '1' ? false : true;
// 首次要下载/解包 Pyodide，给足时间
const WAIT_TIMEOUT = Number(process.env.WAIT_TIMEOUT || 60000);

/* ------------------------------------------------------------------ */
/* 选择器：页面结构变化时只改这里                                      */
/* ------------------------------------------------------------------ */
const SELECTORS = {
    jsonInput: '#json-file',
    aepInput: '#aep-file',
    parseButton: '#parse-btn',
    applyButton: '#apply-btn',
    downloadButton: '#download-btn',
    toggleIdentical: '#toggle-identical',
    statusText: '#status-text',
    summary: '#summary',
    reportBody: '#report-body',
    rowCount: '#row-count',
    applyStatus: '#apply-status',
    helpButton: '#help-btn',
    helpModal: '#help-modal',
    themeButton: '#theme-btn',
    langButton: '#lang-btn',
    backfillEntry: 'a[href="backfill.html"]',
    loadingMask: '#bf-loading',
    loadingPhase: '#loading-phase',
    loadingBar: '#loading-bar',
};

/* ------------------------------------------------------------------ */
/* 静态服务器                                                          */
/* ------------------------------------------------------------------ */
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    // 故意与线上 nginx 保持一致：mime.types 里没有 mjs，wasm 也不在默认表里
    '.mjs': 'application/octet-stream',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.py': 'text/plain; charset=utf-8',
    '.zip': 'application/zip',
    '.wasm': 'application/octet-stream',
    '.aep': 'application/octet-stream',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
};

function startServer() {
    const server = http.createServer((req, res) => {
        const urlPath = decodeURIComponent(req.url.split('?')[0]);
        const filePath = path.join(REPO_ROOT, urlPath === '/' ? 'index.html' : urlPath);
        if (!filePath.startsWith(REPO_ROOT)) {
            res.writeHead(403).end('forbidden');
            return;
        }
        fs.readFile(filePath, (error, data) => {
            if (error) {
                res.writeHead(404).end('not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
            res.end(data);
        });
    });
    return new Promise((resolve) => {
        server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
    });
}

/* ------------------------------------------------------------------ */
/* 断言                                                                */
/* ------------------------------------------------------------------ */
const results = [];
function check(name, ok, detail = '') {
    results.push({ name, ok });
    const mark = ok ? 'PASS' : 'FAIL';
    console.log(`${mark}  ${name}${detail ? `  — ${detail}` : ''}`);
}

function requireFixtures() {
    for (const file of [FIXTURE_MATCH, FIXTURE_LOST, FIXTURE_AEP]) {
        if (!fs.existsSync(file)) {
            console.error(`缺少测试素材：${file}`);
            process.exit(1);
        }
    }
    if (!fs.existsSync(CHROME_PATH)) {
        console.error(`Chrome 不存在: ${CHROME_PATH}\n可用 CHROME_PATH 指定`);
        process.exit(1);
    }
}

/* ------------------------------------------------------------------ */
/* 主流程                                                              */
/* ------------------------------------------------------------------ */
requireFixtures();
fs.mkdirSync(ARTIFACTS, { recursive: true });
fs.rmSync(CHROME_PROFILE, { recursive: true, force: true });

const { server, port } = await startServer();
const BASE = `http://127.0.0.1:${port}`;

const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: HEADLESS,
    userDataDir: CHROME_PROFILE,
    args: ['--no-sandbox', '--disable-breakpad', '--disable-crash-reporter'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 940 });
page.on('pageerror', (error) => console.log('[page exception]', error.message));
const requestedUrls = [];
page.on('request', (request) => requestedUrls.push(request.url()));

try {
    /* ---------- 0. 主站入口 ---------- */
    await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
    const entry = await page.$eval(SELECTORS.backfillEntry, (el) => ({
        text: el.textContent.trim(),
        visible: el.getBoundingClientRect().width > 0,
    })).catch(() => null);
    check('编辑器顶栏有回填入口', !!entry && entry.visible && entry.text.length > 0,
        entry ? JSON.stringify(entry) : '未找到');

    /* ---------- 1. 页面加载 ---------- */
    await page.goto(`${BASE}/backfill.html`, { waitUntil: 'networkidle0' });
    check('回填页加载', await page.$eval('.brand-name', (el) => el.textContent.includes('Lottie')));
    requestedUrls.length = 0;   // 只统计本次页面产生的请求
    check('两个文件选择区', (await page.$$('.bf-drop')).length === 2);

    async function upload(jsonFixture) {
        await (await page.$(SELECTORS.jsonInput)).uploadFile(jsonFixture);
        await (await page.$(SELECTORS.aepInput)).uploadFile(FIXTURE_AEP);
        await page.waitForFunction(
            (selector) => !document.querySelector(selector).disabled,
            { timeout: WAIT_TIMEOUT },
            SELECTORS.parseButton
        );
    }

    async function parse() {
        await page.click(SELECTORS.parseButton);
        await page.waitForFunction(
            (selector) => !document.querySelector(selector).disabled
                && /完成|Done|失败|Failed/.test(document.querySelector('#status-text').textContent),
            { timeout: WAIT_TIMEOUT },
            SELECTORS.parseButton
        );
        return page.evaluate(() => ({
            count: document.querySelectorAll('#report-body tr').length,
            rows: [...document.querySelectorAll('#report-body tr')].map((tr) => ({
                name: tr.querySelector('.bf-path .nm')?.textContent || '',
                status: tr.querySelector('td[data-status] .badge')?.textContent || '',
                checked: tr.querySelector('.row-check')?.checked ?? null,
                disabled: tr.querySelector('.row-check')?.disabled ?? null,
            })),
            summary: document.querySelector('#summary').textContent.replace(/\s+/g, ' ').trim(),
        }));
    }

    /* ---------- 2. JSON 与 AE 一致 ---------- */
    await upload(FIXTURE_MATCH);
    let out = await parse();
    check('一致场景：出表 1 行', out.count === 1, `count=${out.count}`);
    check('一致场景：状态一致', out.rows[0]?.status === '一致', out.rows[0]?.status);
    check('一致场景：勾选框禁用', out.rows[0]?.disabled === true);
    check('一致场景：摘要只显示必要项', /待修正 0/.test(out.summary), out.summary);
    check('一致场景：导出按钮禁用', await page.$eval(SELECTORS.downloadButton, (el) => el.disabled));

    /* ---------- 3. 渐变丢失（白→黑） ---------- */
    await page.goto(`${BASE}/backfill.html`, { waitUntil: 'networkidle0' });
    await upload(FIXTURE_LOST);

    // 加载遮罩：点解析后应立即出现（首次要下载/编译 Pyodide），完成后消失
    await page.click(SELECTORS.parseButton);
    const maskShown = await page
        .waitForFunction(
            (selector) => document.querySelector(selector).classList.contains('is-visible'),
            { timeout: 5000 },
            SELECTORS.loadingMask
        )
        .then(() => true)
        .catch(() => false);
    const maskInfo = maskShown
        ? await page.evaluate((selectors) => ({
            visible: document.querySelector(selectors.loadingMask).classList.contains('is-visible'),
            phase: document.querySelector(selectors.loadingPhase).textContent.trim(),
            hint: document.querySelector('.bf-loading-hint').textContent.trim(),
        }), SELECTORS)
        : null;
    check('解析时出现加载遮罩', maskShown && maskInfo.visible, maskInfo ? maskInfo.phase : '未出现');
    check('加载遮罩显示阶段与体积提示',
        !!maskInfo && maskInfo.phase.length > 0 && /MB/.test(maskInfo.hint),
        maskInfo ? `phase="${maskInfo.phase}" hint="${maskInfo.hint}"` : '');
    await page.screenshot({ path: path.join(ARTIFACTS, 'backfill-loading.png') });

    await page.waitForFunction(
        (selector) => !document.querySelector(selector).disabled,
        { timeout: WAIT_TIMEOUT },
        SELECTORS.parseButton
    );
    check('加载完成后遮罩消失', await page.evaluate(
        (selector) => !document.querySelector(selector).classList.contains('is-visible'),
        SELECTORS.loadingMask
    ));
    const mjsRequests = requestedUrls.filter((url) => url.endsWith('.mjs'));
    check('不依赖 .mjs（兼容 nginx 未配置 mjs MIME）', mjsRequests.length === 0,
        mjsRequests.length ? mjsRequests.join(', ') : '0 个 .mjs 请求');
    out = await page.evaluate(() => ({
        count: document.querySelectorAll('#report-body tr').length,
        rows: [...document.querySelectorAll('#report-body tr')].map((tr) => ({
            name: tr.querySelector('.bf-path .nm')?.textContent || '',
            status: tr.querySelector('td[data-status] .badge')?.textContent || '',
            checked: tr.querySelector('.row-check')?.checked ?? null,
            disabled: tr.querySelector('.row-check')?.disabled ?? null,
        })),
        summary: document.querySelector('#summary').textContent.replace(/\s+/g, ' ').trim(),
    }));
    check('坏文件场景：状态待修正', out.rows[0]?.status === '待修正', out.rows[0]?.status);
    check('坏文件场景：默认勾选', out.rows[0]?.checked === true);
    check('坏文件场景：摘要待修正 1', /待修正 1/.test(out.summary), out.summary);

    const before = await page.evaluate(() => {
        const row = window.__backfillState.rows[0];
        return { ae: row.ae.k, json: row.jsonArr };
    });
    check('回填前两侧数值不同', JSON.stringify(before.ae) !== JSON.stringify(before.json));

    /* ---------- 4. 深色主题 ---------- */
    await page.click(SELECTORS.themeButton);
    await new Promise((r) => setTimeout(r, 240));
    check('深色主题可切换', await page.evaluate(() => document.documentElement.classList.contains('dark')));
    await page.click(SELECTORS.themeButton);
    await new Promise((r) => setTimeout(r, 200));

    /* ---------- 5. 回填 ---------- */
    await page.click(SELECTORS.applyButton);
    await new Promise((r) => setTimeout(r, 300));
    const after = await page.evaluate(() => {
        const row = window.__backfillState.rows[0];
        const walk = (node) => {
            if (node && typeof node === 'object') {
                if (node.ty === 'gf' || node.ty === 'gs') return node.g;
                for (const value of Object.values(node)) {
                    const hit = walk(value);
                    if (hit) return hit;
                }
            }
            return null;
        };
        const gradientNode = walk(window.__backfillState.jsonData);
        const raw = gradientNode && gradientNode.k && !Array.isArray(gradientNode.k)
            ? gradientNode.k.k
            : gradientNode && gradientNode.k;
        return {
            status: document.querySelector('#report-body td[data-status] .badge')?.textContent,
            applyStatus: document.querySelector('#apply-status').textContent,
            downloadDisabled: document.querySelector('#download-btn').disabled,
            jsonK: raw,
            jsonP: gradientNode && gradientNode.p,
            aeK: row.ae.k,
            aeP: row.ae.p,
        };
    });
    check('回填后状态变一致', after.status === '一致', after.status);
    check('回填计数提示', /已回填 1 个渐变/.test(after.applyStatus), after.applyStatus);
    check('导出按钮可用', after.downloadDisabled === false);
    check('JSON 的 g.k 被替换为 AE 真值',
        JSON.stringify(after.jsonK.map((v) => Math.round(v * 1000) / 1000)) === JSON.stringify(after.aeK),
        `json=${JSON.stringify(after.jsonK)}`);
    check('JSON 的 g.p 同步为展开后色标数', after.jsonP === after.aeP, `p=${after.jsonP} vs ${after.aeP}`);

    /* ---------- 6. 说明弹窗 ---------- */
    await page.click(SELECTORS.helpButton);
    await new Promise((r) => setTimeout(r, 260));
    check('说明弹窗可打开', await page.evaluate(() => {
        const modal = document.querySelector('#help-modal');
        return !modal.classList.contains('hidden') && modal.classList.contains('is-open');
    }));
    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 260));
    check('说明弹窗可关闭', await page.evaluate(
        () => document.querySelector('#help-modal').classList.contains('hidden')
    ));

    /* ---------- 7. 语言切换 ---------- */
    const zhHeader = await page.$eval('.bf-table thead th:nth-child(2)', (el) => el.textContent.trim());
    await page.click(SELECTORS.langButton);
    await new Promise((r) => setTimeout(r, 220));
    const enHeader = await page.$eval('.bf-table thead th:nth-child(2)', (el) => el.textContent.trim());
    check('中英切换生效', zhHeader === '渐变' && enHeader === 'Gradient', `${zhHeader} → ${enHeader}`);
    await page.click(SELECTORS.langButton);
    await new Promise((r) => setTimeout(r, 200));
    check('切回中文', (await page.$eval('.bf-table thead th:nth-child(2)', (el) => el.textContent.trim())) === '渐变');

    /* ---------- 8. 截图 ---------- */
    await page.goto(`${BASE}/backfill.html`, { waitUntil: 'networkidle0' });
    await upload(FIXTURE_LOST);
    await parse();
    await page.screenshot({ path: path.join(ARTIFACTS, 'backfill-pending.png') });
} catch (error) {
    console.error('测试过程异常：', error);
    check('测试未异常中断', false, error.message);
    await page.screenshot({ path: path.join(ARTIFACTS, 'backfill-error.png') }).catch(() => {});
} finally {
    await browser.close();
    server.close();
    fs.rmSync(CHROME_PROFILE, { recursive: true, force: true });
}

const failed = results.filter((result) => !result.ok);
console.log(`\n${results.length - failed.length} PASS / ${failed.length} FAIL`);
process.exit(failed.length ? 1 : 0);
