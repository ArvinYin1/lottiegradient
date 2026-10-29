#!/usr/bin/env node
/**
 * Lottie Gradient Editor - 渐变回填页测试
 *
 * 覆盖 backfill.html：从 .aep 读取真实色标 → 自动修复 JSON → 修复前/后对比预览。
 *
 * 这页用 Pyodide 在浏览器里跑 Python，需要 http(s) 加载 wasm/zip，所以测试自带
 * 一个静态文件服务器（随机端口），并故意按线上 nginx 的 MIME 返回 .mjs / .wasm，
 * 以保证「不依赖服务器 MIME 配置」这条一直成立。
 *
 * 运行：
 *   cd tests && npm run test:backfill
 *   CHROME_PATH=/path/to/chrome npm run test:backfill
 *   HEADFUL=1 npm run test:backfill
 *
 * 退出码：0 = 全部 PASS，1 = 有 FAIL
 */

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const FIXTURE_MATCH = path.join(__dirname, 'fixtures', 'gradient-match.json');
const FIXTURE_LOST = path.join(__dirname, 'fixtures', 'gradient-lost.json');
const FIXTURE_MULTI = path.join(__dirname, 'fixtures', 'gradient-multi.json');
const FIXTURE_NO_GRADIENTS = path.join(__dirname, 'fixtures', 'no-gradients.json');
const FIXTURE_MASTER = path.join(__dirname, 'fixtures', 'master.json');
const FIXTURE_AEP = path.join(__dirname, 'fixtures', 'sample.aep');

const ARTIFACTS = process.env.ARTIFACTS_DIR
    ? path.resolve(__dirname, process.env.ARTIFACTS_DIR)
    : path.join(__dirname, 'artifacts', 'backfill');
const CHROME_PROFILE = path.join(__dirname, '.chrome-profile-backfill');
const CHROME_PATH = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const HEADLESS = process.env.HEADFUL === '1' ? false : true;
const WAIT_TIMEOUT = Number(process.env.WAIT_TIMEOUT || 60000);

const SELECTORS = {
    jsonInput: '#json-file',
    aepInput: '#aep-file',
    primaryAction: '#primary-action',
    statusText: '#status-text',
    summary: '#summary',
    stageBefore: '#stage-before',
    stageAfter: '#stage-after',
    playButton: '#play-btn',
    timeline: '#timeline',
    fixedCount: '#fixed-count',
    helpButton: '#help-btn',
    helpModal: '#help-modal',
    themeButton: '#theme-btn',
    langButton: '#lang-btn',
    editorEntry: 'a[href="index.html"]',
    editorPageLink: 'a[href="editor.html"]',
    overview: '#overview',
    detail: '#detail',
    cardGrid: '#card-grid',
    backButton: '#back-btn',
    guideBar: '#guide-bar',
    guideText: '#status-text',
    loadingMask: '#bf-loading',
    loadingPhase: '#loading-phase',
};

/* ------------------------------------------------------------------ */
/* 静态服务器（模拟线上 nginx 的 MIME）                                 */
/* ------------------------------------------------------------------ */
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.py': 'text/plain; charset=utf-8',
    '.zip': 'application/zip',
    // 线上 nginx 的 mime.types 不含 mjs，wasm 也不在默认表里
    '.mjs': 'application/octet-stream',
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
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
}

for (const file of [FIXTURE_MATCH, FIXTURE_LOST, FIXTURE_MULTI, FIXTURE_NO_GRADIENTS, FIXTURE_AEP]) {
    if (!fs.existsSync(file)) {
        console.error(`缺少测试素材：${file}`);
        process.exit(1);
    }
}
if (!fs.existsSync(CHROME_PATH)) {
    console.error(`Chrome 不存在: ${CHROME_PATH}\n可用 CHROME_PATH 指定`);
    process.exit(1);
}

fs.mkdirSync(ARTIFACTS, { recursive: true });
fs.rmSync(CHROME_PROFILE, { recursive: true, force: true });

const { server, port } = await startServer();
const BASE = `http://127.0.0.1:${port}`;
// 测试只跑同源路径（?local=1），避免依赖外网 CDN；CDN 路径由线上 E2E 覆盖
const PAGE_URL = `${BASE}/index.html?local=1`;
const PAGE_URL_AUTO = `${BASE}/index.html`;

const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: HEADLESS,
    userDataDir: CHROME_PROFILE,
    args: ['--no-sandbox', '--disable-breakpad', '--disable-crash-reporter'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 1000 });
page.on('pageerror', (error) => console.log('[page exception]', error.message));
const requestedUrls = [];
page.on('request', (request) => requestedUrls.push(request.url()));

async function uploadJson(...jsonFixtures) {
    await (await page.$(SELECTORS.jsonInput)).uploadFile(...jsonFixtures);
}

async function uploadAep() {
    await (await page.$(SELECTORS.aepInput)).uploadFile(FIXTURE_AEP);
    await page.waitForFunction(
        () => {
            const btn = document.getElementById('primary-action');
            return btn && btn.dataset.action === 'parse' && !btn.disabled;
        },
        { timeout: WAIT_TIMEOUT }
    );
}

async function upload(jsonFixture) {
    await uploadJson(jsonFixture);
    await uploadAep();
}

async function waitDone() {
    await page.waitForFunction(() => {
        const btn = document.getElementById('primary-action');
        const action = btn ? btn.dataset.action : 'none';
        const status = document.getElementById('status-text').textContent;
        return ['export', 'retry', 'none'].includes(action) || /失败|Failed/.test(status);
    }, { timeout: WAIT_TIMEOUT });
    return page.evaluate(() => {
        const btn = document.getElementById('primary-action');
        const guide = document.getElementById('status-text');
        return {
            status: guide.textContent,
            guide: guide.textContent,
            summary: document.getElementById('summary').textContent.replace(/\s+/g, ' ').trim(),
            fixedBadge: (() => {
                const el = document.getElementById('fixed-count');
                return el && !el.hidden ? el.textContent : null;
            })(),
            svgBefore: !!document.querySelector('#stage-before svg'),
            svgAfter: !!document.querySelector('#stage-after svg'),
            action: btn ? btn.dataset.action : 'none',
            actionLabel: btn ? btn.textContent.trim() : '',
            actionHidden: btn ? btn.hidden : true,
            actionDisabled: btn ? btn.disabled : false,
            total: window.__backfillPreview.total,
            overviewVisible: !document.getElementById('overview').hidden,
            detailVisible: !document.getElementById('detail').hidden,
        };
    });
}

try {
    /* ---------- 0. 首页 ↔ 编辑器互跳 ---------- */
    await page.goto(`${BASE}/editor.html`, { waitUntil: 'domcontentloaded' });
    const entry = await page.$eval(SELECTORS.editorEntry, (el) => ({
        text: el.textContent.trim(),
        visible: el.getBoundingClientRect().width > 0,
    })).catch(() => null);
    check('编辑器顶栏有返回首页（渐变回填）入口', !!entry && entry.visible && entry.text.length > 0,
        entry ? JSON.stringify(entry) : '未找到');

    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
    const toEditor = await page.$eval(SELECTORS.editorPageLink, (el) => ({
        text: el.textContent.trim(),
        visible: el.getBoundingClientRect().width > 0,
    })).catch(() => null);
    check('首页有「渐变编辑器」入口按钮', !!toEditor && toEditor.visible && /编辑器|editor/i.test(toEditor.text),
        toEditor ? JSON.stringify(toEditor) : '未找到');

    /* ---------- 1. 页面加载 ---------- */
    await page.goto(PAGE_URL, { waitUntil: 'networkidle0' });
    check('回填页加载', await page.$eval('.brand-name', (el) => el.textContent.includes('Lottie')));
    check('两个文件选择区', (await page.$$('.bf-drop')).length === 2);
    const initial = await page.evaluate(() => {
        const btn = document.getElementById('primary-action');
        return {
            action: btn.dataset.action,
            label: btn.textContent.trim(),
            hidden: btn.hidden,
            text: document.getElementById('status-text').textContent.trim(),
        };
    });
    check('初始状态主按钮就是「选择 JSON」', initial.action === 'pick-json' && !initial.hidden,
        JSON.stringify(initial));
    check('默认有修复前/修复后两块画布',
        (await page.$('#stage-before')) !== null && (await page.$('#stage-after')) !== null);

    /* ---------- 2. 只上传 JSON：修复前先渲染 ---------- */
    const yStart = await page.evaluate(
        () => Math.round(document.getElementById('stage-before').getBoundingClientRect().top)
    );
    await uploadJson(FIXTURE_LOST);
    await page.waitForFunction(
        () => !!document.querySelector('#stage-before svg'),
        { timeout: 15000 }
    );
    const preParse = await page.evaluate(() => ({
        svgBefore: !!document.querySelector('#stage-before svg'),
        afterPlaceholder: /解析后在这里对比/.test(document.querySelector('#stage-after').textContent),
        total: window.__backfillPreview.total,
        playing: window.__backfillPreview.playing,
        action: document.getElementById('primary-action').dataset.action,
    }));
    check('上传 JSON 后立刻显示「修复前」', preParse.svgBefore && preParse.total > 1,
        JSON.stringify(preParse));
    check('此时「修复后」仍是空态', preParse.afterPlaceholder === true);
    check('未解析时主按钮指向还缺的文件', preParse.action === 'pick-aep', preParse.action);

    /* ---------- 2a. 缺 AE 工程时的引导 ---------- */
    const needAep = await page.evaluate(() => {
        const btn = document.getElementById('primary-action');
        return {
            action: btn.dataset.action,
            actionLabel: btn.textContent.trim(),
            actionDisabled: btn.disabled,
            text: document.getElementById('status-text').textContent.trim(),
            guideAction: document.getElementById('guide-bar').classList.contains('is-action'),
            aepRequired: document.getElementById('drop-aep').classList.contains('is-required'),
            aepBadge: !document.getElementById('aep-required').hidden,
            jsonRequired: document.getElementById('drop-json').classList.contains('is-required'),
        };
    });
    const yAfterJson = await page.evaluate(
        () => Math.round(document.getElementById('stage-before').getBoundingClientRect().top)
    );
    check('引导行出现不引起布局位移（画布位置不变）', yAfterJson === yStart, `${yStart} → ${yAfterJson}`);
    check('只传 JSON 时引导行提示还需要 AE 工程',
        /AE 工程/.test(needAep.text) && needAep.guideAction === true, needAep.text);
    check('主按钮直接变成「选择 .aep 工程」（不是置灰的解析）',
        needAep.action === 'pick-aep' && /aep/i.test(needAep.actionLabel) && needAep.actionDisabled === false,
        `${needAep.action} / ${needAep.actionLabel}`);
    check('缺失的 AE 工程区域被高亮 + 必选徽标',
        needAep.aepRequired === true && needAep.aepBadge === true && needAep.jsonRequired === false);

    /* ---------- 2b. 选好工程 → 自动修复 → 双侧预览 ---------- */
    await uploadAep();
    const hintGone = await page.evaluate(() => {
        const btn = document.getElementById('primary-action');
        return {
            action: btn.dataset.action,
            actionDisabled: btn.disabled,
            text: document.getElementById('status-text').textContent.trim(),
            guideAction: document.getElementById('guide-bar').classList.contains('is-action'),
            aepRequired: document.getElementById('drop-aep').classList.contains('is-required'),
        };
    });
    const yAfterAep = await page.evaluate(
        () => Math.round(document.getElementById('stage-before').getBoundingClientRect().top)
    );
    check('引导收起也不引起布局位移', yAfterAep === yStart, `${yStart} → ${yAfterAep}`);
    check('补齐 AE 工程后主按钮变成「解析并修复」',
        hintGone.action === 'parse' && hintGone.actionDisabled === false
        && !hintGone.guideAction && !hintGone.aepRequired,
        JSON.stringify(hintGone));
    await page.click(SELECTORS.primaryAction);

    const maskShown = await page
        .waitForFunction(
            (selector) => document.querySelector(selector).classList.contains('is-visible'),
            { timeout: 5000 },
            SELECTORS.loadingMask
        ).then(() => true).catch(() => false);
    const maskInfo = maskShown
        ? await page.evaluate((selectors) => ({
            visible: document.querySelector(selectors.loadingMask).classList.contains('is-visible'),
            phase: document.querySelector(selectors.loadingPhase).textContent.trim(),
        }), SELECTORS)
        : null;
    check('解析时出现加载遮罩', maskShown && maskInfo.visible, maskInfo ? maskInfo.phase : '未出现');
    await page.waitForFunction(
        (selector) => !document.querySelector(selector).classList.contains('is-visible'),
        { timeout: WAIT_TIMEOUT },
        SELECTORS.loadingMask
    );
    check('加载完成后遮罩消失', await page.evaluate(
        (selector) => !document.querySelector(selector).classList.contains('is-visible'),
        SELECTORS.loadingMask
    ));
    const mjsRequests = requestedUrls.filter((url) => url.endsWith('.mjs'));
    check('不依赖 .mjs（兼容 nginx 未配置 mjs MIME）', mjsRequests.length === 0,
        mjsRequests.length ? mjsRequests.join(', ') : '0 个 .mjs 请求');

    let out = await waitDone();
    check('自动修复：摘要显示共修复 1 个渐变', /共修复 1 个渐变/.test(out.guide), out.guide);
    check('自动修复：数量徽标 +1', out.fixedBadge === '+1', String(out.fixedBadge));
    check('预览：修复前后都渲染出 svg', out.svgBefore && out.svgAfter);
    check('预览：时间轴拿到总帧数', out.total > 1, `total=${out.total}`);
    check('解析完成后主按钮变成「导出 JSON」',
        out.action === 'export' && !out.actionDisabled && /导出|Export/.test(out.actionLabel),
        `${out.action} / ${out.actionLabel}`);
    check('单文件：直接进细节视图（无总览）', out.overviewVisible === false && out.detailVisible === true,
        `overview=${out.overviewVisible} detail=${out.detailVisible}`);

    const data = await page.evaluate(() => {
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
        const file = window.__backfillState.files[0];
        const current = walk(file.json);
        const original = walk(file.original);
        const raw = (g) => (g.k && !Array.isArray(g.k) ? g.k.k : g.k);
        return {
            currentK: raw(current),
            currentP: current.p,
            originalK: raw(original),
            aeK: file.rows[0].ae.k,
            aeP: file.rows[0].ae.p,
        };
    });
    check('JSON 的 g.k 被自动替换为 AE 真值',
        JSON.stringify(data.currentK.map((v) => Math.round(v * 1000) / 1000)) === JSON.stringify(data.aeK),
        `current=${JSON.stringify(data.currentK)}`);
    check('JSON 的 g.p 同步为展开后色标数', data.currentP === data.aeP, `p=${data.currentP} vs ${data.aeP}`);
    check('「修复前」保留原始数据（未被改写）',
        JSON.stringify(data.originalK) === JSON.stringify([0, 1, 1, 1, 1, 0, 0, 0]),
        JSON.stringify(data.originalK));

    /* ---------- 3. 播放控制 ---------- */
    const frames = await page.evaluate(async () => {
        document.getElementById('play-btn').click();       // 暂停
        const paused = window.__backfillPreview.playing === false;
        document.getElementById('timeline').value = '500';  // 拖到中间
        document.getElementById('timeline').dispatchEvent(new Event('input', { bubbles: true }));
        const mid = window.__backfillPreview.frame;
        document.getElementById('play-btn').click();       // 继续播放
        // headless 下 rAF 有节流，轮询等待推进，避免偶发假失败
        const startedAt = Date.now();
        let after = mid;
        while (Date.now() - startedAt < 5000) {
            await new Promise((r) => setTimeout(r, 250));
            after = window.__backfillPreview.frame;
            if (after > mid + 1) break;
        }
        return { paused, mid, after, playing: window.__backfillPreview.playing };
    });
    check('播放/暂停可切换', frames.paused === true, JSON.stringify(frames));
    check('拖动时间轴能定位到中间帧', frames.mid > 0, `frame=${frames.mid}`);
    check('继续播放后帧数推进', frames.playing && frames.after > frames.mid + 1,
        `${frames.mid} → ${frames.after}`);

    /* ---------- 3b. 窄屏下按钮降级为图标，行高不变 ---------- */
    await page.setViewport({ width: 480, height: 800 });
    await new Promise((r) => setTimeout(r, 200));
    const narrow = await page.evaluate(() => {
        const guide = document.getElementById('guide-bar');
        const btn = document.getElementById('primary-action');
        const span = btn ? btn.querySelector('span') : null;
        return {
            guideHeight: Math.round(guide.getBoundingClientRect().height),
            btnWidth: btn ? Math.round(btn.getBoundingClientRect().width) : 0,
            spanHidden: span ? getComputedStyle(span).display === 'none' : true,
        };
    });
    check('窄屏下主按钮缩成图标且行高不变',
        narrow.spanHidden === true && narrow.btnWidth <= 40 && narrow.guideHeight === 46,
        JSON.stringify(narrow));
    await page.setViewport({ width: 1280, height: 1000 });
    await new Promise((r) => setTimeout(r, 200));

    /* ---------- 4. 深色主题 ---------- */
    await page.click(SELECTORS.themeButton);
    await new Promise((r) => setTimeout(r, 240));
    check('深色主题可切换', await page.evaluate(() => document.documentElement.classList.contains('dark')));
    await page.click(SELECTORS.themeButton);
    await new Promise((r) => setTimeout(r, 200));

    /* ---------- 5. 弹窗 ---------- */
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

    /* ---------- 6. 语言切换 ---------- */
    const zhLabel = await page.$eval('#primary-action span', (el) => el.textContent.trim());
    await page.click(SELECTORS.langButton);
    await new Promise((r) => setTimeout(r, 240));
    const enLabel = await page.$eval('#primary-action span', (el) => el.textContent.trim());
    check('中英切换生效（含主按钮文案）', zhLabel === '导出 JSON' && enLabel === 'Export JSON',
        `${zhLabel} → ${enLabel}`);
    await page.click(SELECTORS.langButton);
    await new Promise((r) => setTimeout(r, 220));

    /* ---------- 6b. 只传 AE 工程时提示缺少 JSON ---------- */
    await page.goto(PAGE_URL, { waitUntil: 'networkidle0' });
    await (await page.$(SELECTORS.aepInput)).uploadFile(FIXTURE_AEP);
    const needJson = await page.evaluate(() => {
        const btn = document.getElementById('primary-action');
        return {
            action: btn.dataset.action,
            actionLabel: btn.textContent.trim(),
            text: document.getElementById('status-text').textContent.trim(),
            jsonRequired: document.getElementById('drop-json').classList.contains('is-required'),
            aepRequired: document.getElementById('drop-aep').classList.contains('is-required'),
        };
    });
    check('只传 AE 工程时提示缺少 JSON',
        /JSON/.test(needJson.text) && needJson.jsonRequired === true && needJson.aepRequired === false
        && needJson.action === 'pick-json',
        JSON.stringify(needJson));

    /* ---------- 6c. 工程里找不到对应渐变时给出原因 ---------- */
    await uploadJson(FIXTURE_MASTER);
    await page.click(SELECTORS.primaryAction);
    out = await waitDone();
    check('工程与 JSON 对不上时提示来源不一致', /没找到对应渐变/.test(out.guide), out.guide);

    /* ---------- 6d. 文件里没有渐变时给出原因 ---------- */
    await page.goto(PAGE_URL, { waitUntil: 'networkidle0' });
    await uploadJson(FIXTURE_NO_GRADIENTS);
    await uploadAep();
    await page.click(SELECTORS.primaryAction);
    out = await waitDone();
    check('没有渐变时提示无需修复', /没有渐变色/.test(out.guide), out.guide);

    /* ---------- 7. 已一致的文件：不修复、导出禁用 ---------- */
    await page.goto(PAGE_URL, { waitUntil: 'networkidle0' });
    await upload(FIXTURE_MATCH);
    await page.click(SELECTORS.primaryAction);
    out = await waitDone();
    check('已一致：摘要提示无需修改', /无需修改/.test(out.guide), out.guide);
    check('已一致：不显示导出按钮', out.action === 'none' && out.actionHidden === true,
        `${out.action} hidden=${out.actionHidden}`);
    check('已一致：预览仍然渲染', out.svgBefore && out.svgAfter);

    /* ---------- 8. 聚焦单个渐变 ---------- */
    await page.goto(PAGE_URL, { waitUntil: 'networkidle0' });
    await upload(FIXTURE_MULTI);
    await page.click(SELECTORS.primaryAction);
    await waitDone();
    const focusInfo = await page.evaluate(() => {
        const select = document.getElementById('focus-select');
        if (!select) return null;
        const options = [...select.options].map((option) => option.textContent.trim());
        select.value = '1';
        select.dispatchEvent(new Event('change', { bubbles: true }));
        const opacityOf = (id) => [...document.querySelectorAll(`#${id} svg [fill]`)]
            .filter((el) => !el.closest('defs'))
            .map((el) => el.style.opacity || '1');
        const focused = opacityOf('stage-after');
        select.value = '';
        select.dispatchEvent(new Event('change', { bubbles: true }));
        const cleared = opacityOf('stage-after');
        return { options, focused, cleared };
    });
    check('多渐变时出现聚焦下拉', !!focusInfo && focusInfo.options.length === 3,
        focusInfo ? JSON.stringify(focusInfo.options) : '没有下拉');
    check('选择某个渐变后其余被压暗',
        !!focusInfo && focusInfo.focused.some((v) => v !== '1') && focusInfo.cleared.every((v) => v === '1'),
        focusInfo ? `focused=${JSON.stringify(focusInfo.focused)} cleared=${JSON.stringify(focusInfo.cleared)}` : '');

    /* ---------- 9. 一次上传多个 JSON ---------- */
    await page.goto(PAGE_URL, { waitUntil: 'networkidle0' });
    await uploadJson(FIXTURE_LOST, FIXTURE_MULTI);
    await page.waitForFunction(() => document.querySelectorAll('.bf-card').length === 2, { timeout: 15000 });
    const beforeParse = await page.evaluate(() => ({
        overviewVisible: !document.getElementById('overview').hidden,
        detailHidden: document.getElementById('detail').hidden,
        cards: [...document.querySelectorAll('.bf-card')].map((el) => ({
            name: el.querySelector('.bf-card-name').textContent,
            status: el.querySelector('.bf-card-status').textContent.trim(),
            thumb: !!el.querySelector('.bf-card-stage svg'),
        })),
    }));
    check('多文件：上传后默认就是总览', beforeParse.overviewVisible && beforeParse.detailHidden,
        JSON.stringify({ overview: beforeParse.overviewVisible, detailHidden: beforeParse.detailHidden }));
    check('多文件：总览显示 2 张卡片（待解析状态 + 缩略图）',
        beforeParse.cards.length === 2 && beforeParse.cards.every((card) => card.thumb)
        && /待解析/.test(beforeParse.cards[0]?.status || ''),
        JSON.stringify(beforeParse.cards));

    await uploadAep();
    await page.click(SELECTORS.primaryAction);
    out = await waitDone();
    check('多文件：汇总按所有文件统计', /共修复 1 个渐变/.test(out.guide), out.guide);
    check('多文件：解析后先进结果总览', out.overviewVisible === true && out.detailVisible === false,
        `overview=${out.overviewVisible} detail=${out.detailVisible}`);

    const cards = await page.evaluate(() => [...document.querySelectorAll('.bf-card')].map((el) => ({
        name: el.querySelector('.bf-card-name').textContent,
        status: el.querySelector('.bf-card-status').textContent.trim(),
        thumb: !!el.querySelector('.bf-card-stage svg'),
    })));
    check('多文件：总览显示每个文件的缩略图与结果',
        cards.length === 2 && cards.every((card) => card.thumb)
        && /已修复 1/.test(cards[0]?.status || '') && /无需修改/.test(cards[1]?.status || ''),
        JSON.stringify(cards));

    const opened = await page.evaluate(async () => {
        document.querySelectorAll('.bf-card')[1].click();
        await new Promise((r) => setTimeout(r, 400));
        return {
            selected: window.__backfillState.selected,
            overviewHidden: document.getElementById('overview').hidden,
            detailVisible: !document.getElementById('detail').hidden,
            svg: !!document.querySelector('#stage-after svg'),
            detailName: document.getElementById('detail-name').textContent,
        };
    });
    check('多文件：点卡片进入该文件的细节对比',
        opened.selected === 1 && opened.overviewHidden === true && opened.detailVisible === true
        && opened.svg === true && /gradient-multi/.test(opened.detailName),
        JSON.stringify(opened));

    const back = await page.evaluate(async () => {
        document.getElementById('back-btn').click();
        await new Promise((r) => setTimeout(r, 300));
        return {
            overviewVisible: !document.getElementById('overview').hidden,
            detailHidden: document.getElementById('detail').hidden,
            cards: document.querySelectorAll('.bf-card').length,
        };
    });
    check('多文件：可以从细节返回总览', back.overviewVisible && back.detailHidden && back.cards === 2,
        JSON.stringify(back));

    /* ---------- 9b. 文件很多时，细节视图可以整页滚动 ---------- */
    const manyDir = path.join(ARTIFACTS, 'many');
    fs.mkdirSync(manyDir, { recursive: true });
    const manyFixtures = Array.from({ length: 8 }, (_, index) => {
        const target = path.join(manyDir, `copy-${index + 1}.json`);
        fs.copyFileSync(FIXTURE_MATCH, target);
        return target;
    });
    await page.goto(PAGE_URL, { waitUntil: 'networkidle0' });
    await uploadJson(...manyFixtures);
    await uploadAep();
    await page.click(SELECTORS.primaryAction);
    await waitDone();
    await page.evaluate(() => document.querySelectorAll('.bf-card')[0].click());
    await new Promise((r) => setTimeout(r, 500));
    const scroll = await page.evaluate(async () => {
        const info = {
            overflowY: getComputedStyle(document.body).overflowY,
            scrollHeight: document.body.scrollHeight,
            innerHeight: window.innerHeight,
            rows: document.querySelectorAll('.bf-file-row').length,
        };
        window.scrollTo(0, 400);
        await new Promise((r) => setTimeout(r, 120));
        return { ...info, scrollY: window.scrollY };
    });
    check('文件多时页面可以向下滚动', scroll.overflowY === 'auto' && scroll.scrollY > 0,
        JSON.stringify(scroll));

    /* ---------- 10. CDN 不可用时回退同源 ---------- */
    await page.setRequestInterception(true);
    const blockCdn = (request) => {
        if (request.url().includes('arvinyin1.github.io')) request.abort();
        else request.continue();
    };
    page.on('request', blockCdn);
    await page.goto(PAGE_URL_AUTO, { waitUntil: 'networkidle0' });
    await upload(FIXTURE_LOST);
    await page.click(SELECTORS.primaryAction);
    out = await waitDone();
    check('CDN 被阻断时回退同源并能完成修复', /共修复 1 个渐变/.test(out.guide), out.guide);
    page.off('request', blockCdn);
    await page.setRequestInterception(false);

    /* ---------- 11. 截图 ---------- */
    await page.goto(PAGE_URL, { waitUntil: 'networkidle0' });
    await upload(FIXTURE_LOST);
    await page.click(SELECTORS.primaryAction);
    await waitDone();
    await page.evaluate(() => document.getElementById('play-btn').click());
    await page.screenshot({ path: path.join(ARTIFACTS, 'backfill-compare.png') });
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
