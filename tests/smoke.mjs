#!/usr/bin/env node
/**
 * Lottie Gradient Editor - 真实浏览器冒烟测试
 *
 * 用系统 Chrome（puppeteer-core 连接）跑一遍核心交互，验证 UI 重写没有破坏功能。
 * 不依赖构建步骤：直接 file:// 打开站点根目录的 index.html。
 *
 * 运行：
 *   cd tests && npm test
 *   SITE_ROOT=/path/to/checkout npm test     # 跑另一份代码（如改版前基线）
 *   CHROME_PATH=/path/to/chrome npm test     # 覆盖 Chrome 路径
 *   HEADFUL=1 npm test                       # 有头模式调试
 *   ARTIFACTS_DIR=artifacts/baseline npm test # 结果/截图/下载输出到指定目录
 *
 * 退出码：0 = 全部 PASS，1 = 有 FAIL（失败自动截图到 artifacts/）
 *
 * 设计约束（见 task-2）：
 *  - 不断言界面文案：定位用 id / 结构 / input[type=color] / 按钮在容器内的相对位置；
 *    关键选择器集中在 SELECTORS，改版后只需微调这里。
 *  - 等待条件统一 8s 超时（可用 WAIT_TIMEOUT 覆盖），CDN（lucide/bodymovin/monaco）需要网络。
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TESTS_DIR = __dirname;
const REPO_ROOT = path.resolve(__dirname, '..');
// 被测站点根目录：默认仓库根，可用 SITE_ROOT 指向任意 checkout（基线对比用）
const SITE_ROOT = process.env.SITE_ROOT ? path.resolve(process.env.SITE_ROOT) : REPO_ROOT;
const INDEX_URL = 'file://' + path.join(SITE_ROOT, 'index.html');
const FIXTURE = path.join(TESTS_DIR, 'fixtures', 'master.json');
const ARTIFACTS = process.env.ARTIFACTS_DIR
  ? path.resolve(TESTS_DIR, process.env.ARTIFACTS_DIR)
  : path.join(TESTS_DIR, 'artifacts');
const DOWNLOADS = path.join(ARTIFACTS, 'downloads');
const CHROME_PROFILE = path.join(TESTS_DIR, '.chrome-profile');
const CHROME_PATH = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const HEADLESS = process.env.HEADFUL === '1' ? false : true;
const WAIT_TIMEOUT = Number(process.env.WAIT_TIMEOUT || 8000);

/* ------------------------------------------------------------------ */
/* 选择器：UI 改版后如需微调，只改这里                                 */
/* ------------------------------------------------------------------ */
const SELECTORS = {
  // 顶部工具栏 / 核心控件（有 id，最稳）
  lottieFileInput: '#lottie-file',
  gradientFileInput: '#gradient-file',
  exportButton: '#export-btn',
  gradientSearch: '#gradient-search',
  playPauseButton: '#play-pause-btn',
  progressBar: '#animation-progress',
  timeDisplay: '#time-display',
  animationContainer: '#lottie-animation',

  // 渐变列表
  gradientList: '#gradient-names-list',
  gradientItem: '.gradient-item',
  gradientName: '.gradient-name', // 仅用于取名字；取不到时回退到 item 文本（去掉序号前缀）
  gradientCount: '#gradient-count',
  selectedClass: 'selected',

  // 文件信息
  fileInfo: '#file-info',
  filename: '#filename',

  // 渐变编辑器：色标行 = 含 input[type=color] 且含 input[type=text] 的最近祖先，
  // 与文案/class 无关；新旧两版 DOM 都满足。
  editor: '#editor',
  editorTitle: '#editor-title',
  colorInput: 'input[type="color"]',
  hexInput: 'input[type="text"]',

  // 按钮：null = 结构自动识别（见 installPageHelpers 里的规则）；改版后可填 CSS 选择器
  addStopButton: null, // 默认：plus 图标按钮 > 色标行之后、非开关类按钮中的最后一个
  deleteButton: null, // 默认：色标行内 .row-del > 第一个 button

  // 动画 JSON 镜像（Monaco 隐藏区 / 隐藏 textarea）
  monacoContainer: '#monaco-editor-container',
  jsonMirror: '#json-editor',
};

/* ------------------------------------------------------------------ */
/* fixture 事实                                                        */
/* ------------------------------------------------------------------ */
const fixtureJson = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));
const FIXTURE_GRADIENT_NAMES = collectGradientNames(fixtureJson);
const FIXTURE_FRAMES = fixtureJson.op - fixtureJson.ip;
const SEARCH_TERM = 'alpha'; // 只应匹配 Grad-Alpha
const SEARCH_EXPECTED = FIXTURE_GRADIENT_NAMES.filter((n) => n.toLowerCase().includes(SEARCH_TERM));

/* ------------------------------------------------------------------ */
/* 小工具                                                              */
/* ------------------------------------------------------------------ */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (msg) => process.stdout.write(msg + '\n');
const rel = (p) => path.relative(REPO_ROOT, p);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function collectGradientNames(json) {
  const names = new Set();
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if ((node.ty === 'gf' || node.ty === 'gs') && node.nm) names.add(node.nm);
    for (const v of Object.values(node)) if (v && typeof v === 'object') walk(v);
  };
  walk(json);
  return [...names];
}

function findGradientStops(json, name) {
  let found = null;
  const walk = (node) => {
    if (found || !node || typeof node !== 'object') return;
    if ((node.ty === 'gf' || node.ty === 'gs') && node.nm === name && node.g && node.g.k) {
      const k = node.g.k;
      const arr = Array.isArray(k) ? k : k.k;
      if (Array.isArray(arr)) found = arr;
      return;
    }
    for (const v of Object.values(node)) if (v && typeof v === 'object') walk(v);
  };
  walk(json);
  return found;
}

function gitInfo() {
  const read = (cmd) => {
    try {
      return execSync(cmd, { cwd: REPO_ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    } catch {
      return '';
    }
  };
  return {
    branch: read('git rev-parse --abbrev-ref HEAD'),
    commit: read('git rev-parse --short HEAD'),
    dirty: read('git status --porcelain') !== '',
  };
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

function assertClose(actual, expected, eps, message) {
  if (typeof actual !== 'number' || Math.abs(actual - expected) > eps) {
    throw new Error(`${message}（实际 ${JSON.stringify(actual)}，期望 ${expected}±${eps}）`);
  }
}

/* ------------------------------------------------------------------ */
/* 浏览器 / 页面                                                       */
/* ------------------------------------------------------------------ */
let browser;
let page;
const runtime = {
  consoleErrors: [],
  consoleWarnings: [],
  pageErrors: [],
  requestFailures: [],
  dialogs: [],
};

async function launch() {
  if (!fs.existsSync(CHROME_PATH)) {
    throw new Error(
      `Chrome 不存在: ${CHROME_PATH}\n` + '请安装 Chrome，或用环境变量指定：CHROME_PATH="/path/to/Google Chrome" npm test'
    );
  }
  ensureDir(ARTIFACTS);
  fs.rmSync(CHROME_PROFILE, { recursive: true, force: true });

  browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: HEADLESS,
    userDataDir: CHROME_PROFILE,
    defaultViewport: { width: 1280, height: 900, deviceScaleFactor: 1 },
    protocolTimeout: 180000,
    args: [
      // 本机沙箱环境必需（否则 Chrome 启动即崩）
      '--no-sandbox',
      '--disable-breakpad',
      '--disable-crash-reporter',
      `--user-data-dir=${CHROME_PROFILE}`,
      '--disable-dev-shm-usage',
      // 保证无头环境动画 rAF / 定时器不被降频
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--mute-audio',
      '--no-first-run',
      '--no-default-browser-check',
    ],
  });

  page = await browser.newPage();
  page.setDefaultTimeout(WAIT_TIMEOUT);
  page.setDefaultNavigationTimeout(30000);

  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') runtime.consoleErrors.push({ text, url: msg.location()?.url || '' });
    else if (type === 'warning' || type === 'warn') runtime.consoleWarnings.push(text); // puppeteer 24 返回 'warn'
  });
  page.on('pageerror', (err) => runtime.pageErrors.push(String(err && err.stack ? err.stack : err)));
  page.on('requestfailed', (req) => {
    const failure = req.failure();
    runtime.requestFailures.push({ url: req.url(), error: failure ? failure.errorText : '' });
  });
  page.on('dialog', async (dialog) => {
    runtime.dialogs.push(`${dialog.type()}: ${dialog.message()}`);
    try {
      await dialog.dismiss();
    } catch {
      /* ignore */
    }
  });
}

/**
 * 往页面注入结构识别辅助函数（与文案/class 无关）。
 * monacoEditor / animation 是 main.js 顶层 let 绑定，页面上下文里可直接按名访问。
 */
async function installPageHelpers() {
  await page.evaluate((s) => {
    const rowOf = (ci) => {
      let el = ci;
      for (let i = 0; i < 10 && el; i++) {
        el = el.parentElement;
        if (el && el.querySelector('input[type="text"]')) return el;
      }
      return null;
    };

    const rowsOf = () => {
      const root = document.querySelector(s.editor);
      if (!root) return [];
      return [...root.querySelectorAll('input[type="color"]')].map(rowOf).filter(Boolean);
    };

    const isSwitchLike = (btn) => {
      if (!btn) return false;
      if (btn.matches('[role="switch"],[aria-checked],[aria-pressed]')) return true;
      const cls = typeof btn.className === 'string' ? btn.className : '';
      return /switch/i.test(cls);
    };

    const plusIconButtons = () =>
      [...document.querySelectorAll(s.editor + ' button')].filter((b) =>
        b.querySelector('[data-lucide="plus"], .lucide-plus')
      );

    window.__smoke = {
      selectors: s,

      rowOf,
      rows: rowsOf,
      rowCount: () => rowsOf().length,

      /** 添加色标按钮 */
      addStopButton() {
        const root = document.querySelector(s.editor);
        if (!root) return null;
        if (s.addStopButton) return root.querySelector(s.addStopButton);

        const rows = rowsOf();

        // 1) plus 图标按钮（旧 UI / 新 UI 都用 lucide plus）
        const plus = plusIconButtons().filter((b) => !rows.some((r) => r.contains(b)));
        if (plus.length) return plus[plus.length - 1];

        // 2) 色标行之后、非开关类按钮中的最后一个
        const lastRow = rows[rows.length - 1] || null;
        const candidates = [...root.querySelectorAll('button')].filter((b) => {
          if (rows.some((r) => r.contains(b))) return false;
          if (isSwitchLike(b)) return false;
          if (!lastRow) return true;
          // 必须位于最后一个色标行之后
          return Boolean(lastRow.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
        });
        if (candidates.length) return candidates[candidates.length - 1];

        // 3) 兜底：非色标行、非开关按钮中的最后一个
        const fallback = [...root.querySelectorAll('button')].filter(
          (b) => !rows.some((r) => r.contains(b)) && !isSwitchLike(b)
        );
        return fallback[fallback.length - 1] || null;
      },

      /** 色标行内的删除按钮（默认取最后一个色标行） */
      deleteButton(rowIndex = -1) {
        const rows = rowsOf();
        if (!rows.length) return null;
        const row = rowIndex < 0 ? rows[rows.length - 1] : rows[rowIndex];
        if (!row) return null;
        if (s.deleteButton) return row.querySelector(s.deleteButton);
        return row.querySelector('.row-del') || row.querySelector('button') || null;
      },

      itemName(item) {
        const nameEl = item.querySelector(s.gradientName);
        const text = (nameEl ? nameEl.textContent : item.textContent) || '';
        return text.replace(/^\s*\d+\s*/, '').trim();
      },

      items() {
        return [...document.querySelectorAll(s.gradientItem)].map((item) => ({
          name: this.itemName(item),
          selected: item.classList.contains(s.selectedClass),
          visible: (() => {
            const cs = getComputedStyle(item);
            return cs.display !== 'none' && cs.visibility !== 'hidden';
          })(),
        }));
      },

      /** 页面内可见的动画 JSON 文本（优先 Monaco，其次隐藏 textarea） */
      jsonText() {
        try {
          if (typeof monacoEditor !== 'undefined' && monacoEditor && typeof monacoEditor.getValue === 'function') {
            const v = monacoEditor.getValue() || '';
            if (v) return { value: v, source: 'monaco' };
          }
        } catch {
          /* ignore */
        }
        const el = document.querySelector(s.jsonMirror);
        if (el && typeof el.value === 'string' && el.value.trim()) return { value: el.value, source: 'textarea' };
        return { value: '', source: 'none' };
      },

      timeText() {
        const el = document.querySelector(s.timeDisplay);
        return el ? el.textContent.trim() : null;
      },

      playback() {
        let anim = null;
        try {
          if (typeof animation !== 'undefined' && animation) {
            anim = {
              paused: animation.isPaused,
              currentFrame: animation.currentFrame,
              totalFrames: animation.totalFrames,
              frameRate: animation.frameRate,
            };
          }
        } catch {
          /* ignore */
        }
        return { timeText: this.timeText(), anim };
      },
    };
  }, SELECTORS);
}

/* ------------------------------------------------------------------ */
/* 等待 / 读取                                                         */
/* ------------------------------------------------------------------ */
/** 轮询页面条件，返回最后一次真值；超时报错 */
async function poll(fn, arg, { timeout = WAIT_TIMEOUT, interval = 150, label = 'condition' } = {}) {
  const start = Date.now();
  let last;
  for (;;) {
    last = await page.evaluate(fn, arg);
    if (last) return last;
    if (Date.now() - start > timeout) throw new Error(`等待超时(${timeout}ms): ${label}`);
    await sleep(interval);
  }
}

/** 轮询动画 JSON，直到 predicate 返回真值 */
async function pollJson(predicate, { timeout = 6000, interval = 120, label = 'JSON 条件' } = {}) {
  const start = Date.now();
  let lastState = '未读取到 JSON';
  for (;;) {
    const mirror = await page.evaluate(() => window.__smoke.jsonText());
    if (mirror.value) {
      try {
        const parsed = JSON.parse(mirror.value);
        const hit = predicate(parsed, mirror);
        if (hit) return { ...hit, source: mirror.source };
        lastState = 'JSON 可解析但不满足条件';
      } catch (err) {
        lastState = 'JSON 解析失败: ' + err.message;
      }
    } else {
      lastState = `取不到动画 JSON（source=${mirror.source}）`;
    }
    if (Date.now() - start > timeout) throw new Error(`等待超时(${timeout}ms): ${label}；最后状态=${lastState}`);
    await sleep(interval);
  }
}

async function readPlayback() {
  return page.evaluate(() => window.__smoke.playback());
}

async function screenshot(name) {
  const file = path.join(ARTIFACTS, name);
  try {
    ensureDir(ARTIFACTS);
    await page.screenshot({ path: file, fullPage: false });
    return rel(file);
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* 测试骨架                                                            */
/* ------------------------------------------------------------------ */
const results = [];
const startedAt = new Date();

async function runCase(id, title, fn) {
  const t0 = Date.now();
  try {
    const detail = await fn();
    results.push({ id, title, status: 'PASS', ms: Date.now() - t0, detail: detail || '' });
    log(`  PASS  ${id}  ${title}`);
    if (detail) log(`        ├ ${detail}`);
  } catch (err) {
    const shot = await screenshot(`FAIL-${id}.png`);
    results.push({
      id,
      title,
      status: 'FAIL',
      ms: Date.now() - t0,
      detail: err && err.message ? err.message : String(err),
      screenshot: shot,
    });
    log(`  FAIL  ${id}  ${title}`);
    log(`        ├ ${err && err.message ? err.message : err}`);
    if (shot) log(`        ├ 截图: ${shot}`);
  }
}

/* ------------------------------------------------------------------ */
/* 用例 1：页面加载                                                    */
/* ------------------------------------------------------------------ */
async function case01() {
  const ids = [
    SELECTORS.lottieFileInput,
    SELECTORS.exportButton,
    SELECTORS.gradientFileInput,
    SELECTORS.gradientSearch,
    SELECTORS.playPauseButton,
  ];
  const found = await page.evaluate((list) => list.map((sel) => ({ sel, ok: !!document.querySelector(sel) })), ids);
  const missing = found.filter((f) => !f.ok).map((f) => f.sel);
  assert(missing.length === 0, `缺少核心元素: ${missing.join(', ')}`);

  const benign = [/favicon/i, /ERR_ABORTED/i];
  const badErrors = runtime.consoleErrors.filter((e) => !benign.some((re) => re.test(e.text + ' ' + e.url)));
  assert(
    badErrors.length === 0,
    `加载阶段出现 console error ${badErrors.length} 条: ` + badErrors.map((e) => e.text.slice(0, 160)).join(' | ')
  );
  assert(
    runtime.pageErrors.length === 0,
    '加载阶段出现 pageerror: ' + runtime.pageErrors.map((e) => e.slice(0, 160)).join(' | ')
  );

  const ready = await page.evaluate(() => ({
    bodymovin: typeof bodymovin === 'object' && bodymovin !== null,
    lucide: typeof lucide === 'object' && lucide !== null,
    monaco: (() => {
      try {
        return typeof monacoEditor !== 'undefined' && !!monacoEditor;
      } catch {
        return false;
      }
    })(),
    title: document.title,
  }));
  assert(ready.bodymovin, 'bodymovin(lottie) 未加载，页面无法渲染动画');

  await screenshot('01-loaded.png');
  return `核心 id 全部存在；console error=0，pageerror=0；bodymovin=${ready.bodymovin}，lucide=${ready.lucide}，monaco=${ready.monaco}，title="${ready.title}"`;
}

/* ------------------------------------------------------------------ */
/* 用例 2：导入 JSON                                                   */
/* ------------------------------------------------------------------ */
async function case02() {
  const before = await page.evaluate((s) => {
    const count = document.querySelector(s.gradientCount);
    const fileInfo = document.querySelector(s.fileInfo);
    return {
      countText: count ? count.textContent.trim() : null,
      items: document.querySelectorAll(s.gradientItem).length,
      fileInfoVisible: !!fileInfo && getComputedStyle(fileInfo).display !== 'none' && fileInfo.getClientRects().length > 0,
    };
  }, SELECTORS);

  const input = await page.$(SELECTORS.lottieFileInput);
  assert(input, `找不到文件输入 ${SELECTORS.lottieFileInput}`);
  await input.uploadFile(FIXTURE);

  await poll(
    (s) => document.querySelectorAll(s.gradientItem).length === s.expected,
    { ...SELECTORS, expected: FIXTURE_GRADIENT_NAMES.length },
    { label: `渐变列表出现 ${FIXTURE_GRADIENT_NAMES.length} 个 .gradient-item` }
  );

  const after = await page.evaluate((s) => {
    const items = window.__smoke.items();
    const count = document.querySelector(s.gradientCount);
    const fileInfo = document.querySelector(s.fileInfo);
    const filename = document.querySelector(s.filename);
    const playback = window.__smoke.playback();
    return {
      names: items.map((i) => i.name),
      countText: count ? count.textContent.trim() : null,
      fileInfoVisible: !!fileInfo && getComputedStyle(fileInfo).display !== 'none' && fileInfo.getClientRects().length > 0,
      fileInfoHiddenClass: fileInfo ? fileInfo.classList.contains('hidden') : null,
      filenameText: filename ? filename.textContent.trim() : null,
      anim: playback.anim,
      selectedCount: items.filter((i) => i.selected).length,
    };
  }, SELECTORS);

  assert(
    after.names.length === FIXTURE_GRADIENT_NAMES.length,
    `渐变条目数量 ${after.names.length}，期望 ${FIXTURE_GRADIENT_NAMES.length}`
  );
  assert(
    FIXTURE_GRADIENT_NAMES.every((n) => after.names.some((got) => got.includes(n))),
    `渐变名称不符：页面=${JSON.stringify(after.names)}，fixture=${JSON.stringify(FIXTURE_GRADIENT_NAMES)}`
  );
  assert(
    after.countText !== before.countText && after.countText === String(FIXTURE_GRADIENT_NAMES.length),
    `#gradient-count 未更新：导入前='${before.countText}'，导入后='${after.countText}'`
  );
  assert(after.fileInfoVisible && !after.fileInfoHiddenClass, `#file-info 未从隐藏变为可见（visible=${after.fileInfoVisible}）`);
  assert(after.anim, 'animation 未创建：bodymovin 没有渲染');
  assert(after.anim.totalFrames > 30, `动画总帧数 ${after.anim.totalFrames} 应 > 30`);
  assert(after.anim.paused === false, `导入后动画应自动播放（isPaused=${after.anim.paused}）`);

  await screenshot('02-imported.png');
  return `导入 ${FIXTURE_GRADIENT_NAMES.length} 个渐变 ${JSON.stringify(after.names)}；count '${before.countText}'→'${after.countText}'；file-info 可见；文件名=${after.filenameText}；动画 ${after.anim.totalFrames} 帧/${after.anim.frameRate}fps 自动播放`;
}

/* ------------------------------------------------------------------ */
/* 用例 3：选中渐变                                                    */
/* ------------------------------------------------------------------ */
async function case03() {
  const items = await page.$$(SELECTORS.gradientItem);
  assert(items.length >= 2, `渐变条目不足（${items.length}），无法测试选中切换`);

  // 点第二个，再点回第一个：验证 .selected 会移动
  await items[1].click();
  await poll(
    () => {
      const els = window.__smoke.items();
      return els[1] && els[1].selected;
    },
    undefined,
    { label: '第二个渐变获得 .selected' }
  );
  const switched = await page.evaluate(() => {
    const els = window.__smoke.items();
    return { first: els[0].selected, second: els[1].selected };
  });
  assert(!switched.first && switched.second, `连续点击第二个渐变后选中态异常：${JSON.stringify(switched)}`);

  await items[0].click();
  await poll(
    () => {
      const els = window.__smoke.items();
      return els[0] && els[0].selected;
    },
    undefined,
    { label: '第一个渐变获得 .selected' }
  );

  // 编辑器：颜色输入 + 添加色标按钮
  const editor = await page.evaluate((s) => {
    const root = document.querySelector(s.editor);
    if (!root) return { ok: false, reason: '找不到 #editor' };
    const addBtn = window.__smoke.addStopButton();
    const rows = window.__smoke.rows();
    return {
      ok: true,
      colorInputs: root.querySelectorAll(s.colorInput).length,
      rows: rows.length,
      addBtnFound: !!addBtn,
      addBtnText: addBtn ? addBtn.textContent.trim() : '',
      addBtnInRow: addBtn ? rows.some((r) => r.contains(addBtn)) : null,
      title: (document.querySelector(s.editorTitle) || {}).textContent || '',
    };
  }, SELECTORS);

  assert(editor.ok, editor.reason);
  assert(editor.colorInputs > 0, '#editor 内没有 input[type=color]');
  assert(editor.rows === editor.colorInputs, `色标行数(${editor.rows})与颜色输入数(${editor.colorInputs})不一致`);
  assert(editor.addBtnFound, '未找到「添加色标」按钮（plus 图标 / 色标行之后的非开关按钮）');
  assert(editor.addBtnInRow === false, '识别到的「添加色标」按钮位于色标行内，定位规则失效');

  await screenshot('03-selected.png');
  return `选中态可从第 2 项移回第 1 项；#editor 色标行=${editor.rows}，颜色输入=${editor.colorInputs}，添加按钮 text='${editor.addBtnText}'；标题="${editor.title.trim()}"`;
}

/* ------------------------------------------------------------------ */
/* 用例 4：编辑颜色                                                    */
/* ------------------------------------------------------------------ */
async function case04() {
  const edit = await page.evaluate((s) => {
    const root = document.querySelector(s.editor);
    const ci = root && root.querySelector(s.colorInput);
    if (!ci) return { ok: false };
    ci.value = '#ff0000';
    ci.dispatchEvent(new Event('input', { bubbles: true }));
    ci.dispatchEvent(new Event('change', { bubbles: true }));
    return { ok: true };
  }, SELECTORS);
  assert(edit.ok, '未找到第一个色标的 input[type=color]');

  // UI 内 hex 同步
  const hex = await poll(
    () => {
      const root = document.querySelector(window.__smoke.selectors.editor);
      const ci = root && root.querySelector(window.__smoke.selectors.colorInput);
      if (!ci) return false;
      const row = window.__smoke.rowOf(ci);
      if (!row) return false;
      const v = (row.querySelector('input[type="text"]') || {}).value || '';
      return /ff0000/i.test(v) ? { value: v } : false;
    },
    undefined,
    { label: '颜色 hex 输入框同步为 FF0000' }
  );

  // 动画 JSON 内的渐变数据（Monaco 隐藏区）；取不到时按任务书降级为只断言 UI 同步
  const mirror = await page.evaluate(() => window.__smoke.jsonText());
  const gradientName = FIXTURE_GRADIENT_NAMES[0];
  if (!mirror.value) {
    return `input[type=color] → #ff0000 后 hex 输入框同步为 '${hex.value}'；页面内取不到动画 JSON（source=${mirror.source}），按约定仅断言 UI 同步`;
  }

  // 渐变编辑走 100ms 防抖 + Monaco setValue，轮询等待 JSON 更新
  const hit = await pollJson(
    (json) => {
      const stops = findGradientStops(json, gradientName);
      if (!stops || stops.length < 7) return false;
      if (Math.abs(stops[1] - 1) > 0.002 || Math.abs(stops[2]) > 0.002 || Math.abs(stops[3]) > 0.002) return false;
      return { stops, name: gradientName };
    },
    { label: `动画 JSON 中 "${gradientName}" 首色标变红` }
  );
  assertClose(hit.stops[1], 1, 0.002, 'JSON 中第一个色标 R');
  assertClose(hit.stops[2], 0, 0.002, 'JSON 中第一个色标 G');
  assertClose(hit.stops[3], 0, 0.002, 'JSON 中第一个色标 B');

  await sleep(700); // 等 Monaco 500ms 程序化更新防抖走完，避免干扰后续用例
  return `hex 输入框='${hex.value}'；动画 JSON（source=${hit.source}）内 "${gradientName}" 首色标 RGB=[${hit.stops[1].toFixed(3)}, ${hit.stops[2].toFixed(3)}, ${hit.stops[3].toFixed(3)}]`;
}

/* ------------------------------------------------------------------ */
/* 用例 5：添加色标                                                    */
/* ------------------------------------------------------------------ */
async function case05() {
  const before = await page.evaluate(() => window.__smoke.rowCount());
  assert(before >= 2, `起始色标数异常: ${before}`);

  const handle = await page.evaluateHandle(() => window.__smoke.addStopButton());
  const el = handle.asElement();
  assert(el, '未找到「添加色标」按钮');
  await el.click();

  const after = await poll(
    (arg) => {
      const n = document.querySelectorAll(arg.s.editor + ' ' + arg.s.colorInput).length;
      return n === arg.expected ? n : false;
    },
    { s: SELECTORS, expected: before + 1 },
    { label: `色标行数从 ${before} 增加到 ${before + 1}` }
  );

  await sleep(600); // 等 JSON 更新与 Monaco 防抖
  return `色标行数 ${before} → ${after}`;
}

/* ------------------------------------------------------------------ */
/* 用例 6：删除色标                                                    */
/* ------------------------------------------------------------------ */
async function case06() {
  const before = await page.evaluate(() => window.__smoke.rowCount());
  assert(before >= 2, `起始色标数异常: ${before}`);

  const handle = await page.evaluateHandle(() => window.__smoke.deleteButton());
  const el = handle.asElement();
  assert(el, '未找到色标行内的删除按钮');
  const iconInfo = await el.evaluate((b) => ({
    text: b.textContent.trim(),
    hasSvg: !!b.querySelector('svg'),
    aria: b.getAttribute('aria-label') || '',
  }));
  await el.click();

  const after = await poll(
    (arg) => {
      const n = document.querySelectorAll(arg.s.editor + ' ' + arg.s.colorInput).length;
      return n === arg.expected ? n : false;
    },
    { s: SELECTORS, expected: before - 1 },
    { label: `色标行数从 ${before} 恢复到 ${before - 1}` }
  );

  await sleep(600);
  return `删除按钮(text='${iconInfo.text}', svg=${iconInfo.hasSvg}, aria='${iconInfo.aria}') 点击后色标行数 ${before} → ${after}`;
}

/* ------------------------------------------------------------------ */
/* 用例 7：搜索过滤                                                    */
/* ------------------------------------------------------------------ */
async function case07() {
  await sleep(900); // 让上一轮 Monaco 500ms 防抖带来的列表重渲染先结束
  const total = await page.evaluate(() => window.__smoke.items().length);
  assert(total === FIXTURE_GRADIENT_NAMES.length, `搜索前渐变条目数 ${total}，期望 ${FIXTURE_GRADIENT_NAMES.length}`);
  assert(SEARCH_EXPECTED.length > 0, `fixture 中没有包含 "${SEARCH_TERM}" 的渐变，用例前提不成立`);

  const handle = await page.$(SELECTORS.gradientSearch);
  assert(handle, `找不到搜索框 ${SELECTORS.gradientSearch}`);
  await handle.click();
  await page.evaluate((s) => {
    const el = document.querySelector(s.gradientSearch);
    if (el) el.value = '';
  }, SELECTORS);
  await handle.type(SEARCH_TERM, { delay: 30 });

  const filtered = await poll(
    (arg) => {
      const items = window.__smoke.items();
      const visible = items.filter((i) => i.visible);
      if (visible.length !== arg.expected) return false;
      return { visibleCount: visible.length, names: visible.map((i) => i.name), total: items.length };
    },
    { expected: SEARCH_EXPECTED.length },
    { label: `搜索 "${SEARCH_TERM}" 后可见项为 ${SEARCH_EXPECTED.length}` }
  );

  assert(filtered.total === FIXTURE_GRADIENT_NAMES.length, `搜索不应删除 DOM 节点（总数 ${filtered.total}）`);
  assert(
    filtered.names.every((n) => n.toLowerCase().includes(SEARCH_TERM)),
    `可见项与搜索词不匹配: ${JSON.stringify(filtered.names)}`
  );

  // 清空后恢复全部
  await page.evaluate((s) => {
    const el = document.querySelector(s.gradientSearch);
    el.value = '';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, SELECTORS);
  await poll(
    (arg) => {
      const items = window.__smoke.items();
      return items.filter((i) => i.visible).length === arg.expected;
    },
    { expected: FIXTURE_GRADIENT_NAMES.length },
    { label: '清空搜索后恢复全部渐变' }
  );

  await screenshot('07-search.png');
  return `输入 "${SEARCH_TERM}"：可见 ${filtered.visibleCount}/${filtered.total} → ${JSON.stringify(filtered.names)}；清空后恢复 ${FIXTURE_GRADIENT_NAMES.length}`;
}

/* ------------------------------------------------------------------ */
/* 用例 8：播放控制                                                    */
/* ------------------------------------------------------------------ */
async function case08() {
  const btn = await page.$(SELECTORS.playPauseButton);
  assert(btn, `找不到播放按钮 ${SELECTORS.playPauseButton}`);

  // 统一从「播放中」开始
  let state = await readPlayback();
  assert(state.anim, 'animation 实例不可用，无法验证播放状态');
  if (state.anim.paused) {
    await btn.click();
    await sleep(400);
    state = await readPlayback();
    assert(!state.anim.paused, '点击播放按钮后动画仍处于暂停');
  }

  const t0 = await readPlayback();
  await sleep(800);
  const t1 = await readPlayback();
  const timeChanged = t0.timeText !== t1.timeText;
  const frameAdvanced = t0.anim && t1.anim && t1.anim.currentFrame !== t0.anim.currentFrame;
  assert(
    timeChanged || frameAdvanced,
    `播放中进度未变化（time '${t0.timeText}'→'${t1.timeText}'，frame ${t0.anim && t0.anim.currentFrame}→${t1.anim && t1.anim.currentFrame}）`
  );

  // 再点一次 → 暂停
  await btn.click();
  await sleep(350);
  const paused = await readPlayback();
  assert(paused.anim && paused.anim.paused, `第二次点击播放按钮后动画未暂停（isPaused=${paused.anim && paused.anim.paused}）`);
  await sleep(700);
  const pausedLater = await readPlayback();
  assert(paused.timeText === pausedLater.timeText, `暂停后进度仍在变化（'${paused.timeText}' → '${pausedLater.timeText}'）`);

  return `播放中进度 '${t0.timeText}'→'${t1.timeText}'；暂停后保持 '${paused.timeText}'`;
}

/* ------------------------------------------------------------------ */
/* 用例 9：导出 JSON                                                   */
/* ------------------------------------------------------------------ */
async function case09() {
  fs.rmSync(DOWNLOADS, { recursive: true, force: true });
  ensureDir(DOWNLOADS);

  // 让 Chrome 把下载落到 artifacts/downloads
  const cdp = await page.createCDPSession();
  try {
    await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: DOWNLOADS, eventsEnabled: true });
  } catch {
    try {
      await cdp.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: DOWNLOADS });
    } catch (err2) {
      throw new Error('无法设置下载目录: ' + err2.message);
    }
  }

  // 旁路观测导出用的 blob / 文件名（不改行为）
  await page.evaluate(() => {
    window.__smokeExport = { blobs: [], anchors: [] };
    const origCreate = URL.createObjectURL.bind(URL);
    URL.createObjectURL = (blob) => {
      try {
        window.__smokeExport.blobs.push(blob);
      } catch {
        /* ignore */
      }
      return origCreate(blob);
    };
    const origClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      try {
        window.__smokeExport.anchors.push({ href: this.href, download: this.download });
      } catch {
        /* ignore */
      }
      return origClick.call(this);
    };
  });

  const btn = await page.$(SELECTORS.exportButton);
  assert(btn, `找不到导出按钮 ${SELECTORS.exportButton}`);
  await btn.click();

  // 等下载文件出现且内容可解析（Chrome 先写 .crdownload 再改名）
  const deadline = Date.now() + 15000;
  let file = null;
  let parsed = null;
  let parseError = null;
  while (Date.now() < deadline) {
    const files = fs.existsSync(DOWNLOADS) ? fs.readdirSync(DOWNLOADS).filter((f) => !f.endsWith('.crdownload')) : [];
    const jsonFile = files.find((f) => f.toLowerCase().endsWith('.json'));
    if (jsonFile) {
      const full = path.join(DOWNLOADS, jsonFile);
      const text = fs.readFileSync(full, 'utf8');
      try {
        parsed = JSON.parse(text);
        file = { name: jsonFile, size: text.length, path: full };
        break;
      } catch (err) {
        parseError = err.message; // 可能还在写，稍后重试
      }
    }
    await sleep(150);
  }

  if (!file) {
    const captured = await page.evaluate(async () => {
      const out = { blobs: 0, anchors: [], parsed: false };
      try {
        const cap = window.__smokeExport || { blobs: [], anchors: [] };
        out.blobs = cap.blobs.length;
        out.anchors = cap.anchors;
        if (cap.blobs[0]) {
          const text = await cap.blobs[0].text();
          try {
            JSON.parse(text);
            out.parsed = true;
          } catch {
            out.parsed = false;
          }
        }
      } catch {
        /* ignore */
      }
      return out;
    });
    throw new Error(
      `15s 内没有在 ${rel(DOWNLOADS)} 找到可解析的 .json 下载文件` +
        (parseError ? `（最后一次解析错误: ${parseError}）` : '') +
        `；旁路观测: blobs=${captured.blobs}, anchors=${JSON.stringify(captured.anchors)}, blob可解析=${captured.parsed}`
    );
  }

  assert(/\.json$/i.test(file.name), `下载文件名不是 .json: ${file.name}`);
  assert(parsed && typeof parsed === 'object', '导出内容不是合法 JSON 对象');
  assert(Array.isArray(parsed.layers) && parsed.layers.length > 0, '导出 JSON 缺少 layers');
  const exportedNames = collectGradientNames(parsed);
  assert(
    FIXTURE_GRADIENT_NAMES.every((n) => exportedNames.includes(n)),
    `导出 JSON 中渐变缺失：导出=${JSON.stringify(exportedNames)}，期望包含=${JSON.stringify(FIXTURE_GRADIENT_NAMES)}`
  );
  assert(Math.abs((parsed.op || 0) - fixtureJson.op) < 1e-6, `导出 JSON 的 op(${parsed.op}) 与 fixture(${fixtureJson.op}) 不一致`);

  return `下载 ${rel(file.path)}（${file.name}, ${file.size}B, ${exportedNames.length} 个渐变）且 JSON.parse 成功`;
}

/* ------------------------------------------------------------------ */
/* 用例 10：响应式                                                     */
/* ------------------------------------------------------------------ */
async function case10() {
  const viewports = [
    { width: 1280, height: 900 },
    { width: 900, height: 1200 },
  ];
  const measured = [];
  for (const vp of viewports) {
    await page.setViewport({ ...vp, deviceScaleFactor: 1 });
    await sleep(500); // 等 ResizeObserver / media query 生效
    const m = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight,
    }));
    const shot = await screenshot(`10-responsive-${vp.width}x${vp.height}.png`);
    measured.push({ ...vp, ...m, shot });
    assert(
      m.scrollWidth <= m.innerWidth + 2,
      `${vp.width}x${vp.height} 出现横向溢出：documentElement.scrollWidth=${m.scrollWidth} > innerWidth=${m.innerWidth}`
    );
    assert(
      m.bodyScrollWidth <= m.innerWidth + 2,
      `${vp.width}x${vp.height} 出现横向溢出：body.scrollWidth=${m.bodyScrollWidth} > innerWidth=${m.innerWidth}`
    );
  }
  return measured
    .map(
      (m) =>
        `${m.width}x${m.height}: scrollWidth=${m.scrollWidth}/innerWidth=${m.innerWidth} 无横向溢出${m.shot ? `，截图 ${m.shot}` : ''}`
    )
    .join('；');
}

/* ------------------------------------------------------------------ */
/* 主流程                                                              */
/* ------------------------------------------------------------------ */
async function main() {
  log('');
  log('=== Lottie Gradient Editor · 真实浏览器冒烟测试 ===');
  const git = gitInfo();
  log(`仓库: ${REPO_ROOT}`);
  log(`被测站点: ${SITE_ROOT}${SITE_ROOT === REPO_ROOT ? '（仓库根，当前工作区）' : '（SITE_ROOT 覆盖）'}`);
  log(`分支: ${git.branch || '-'} @ ${git.commit || '-'}${git.dirty ? '（有未提交改动）' : ''}`);
  log(`Chrome: ${CHROME_PATH}`);
  log(`页面: ${INDEX_URL}`);
  log(`fixture: ${rel(FIXTURE)}（渐变 ${JSON.stringify(FIXTURE_GRADIENT_NAMES)}，${FIXTURE_FRAMES} 帧）`);
  log(`输出目录: ${rel(ARTIFACTS)}`);
  log('');

  try {
    await launch();
  } catch (err) {
    log('启动 Chrome 失败: ' + err.message);
    process.exit(1);
  }

  log('加载页面（等待 CDN: lucide / bodymovin / monaco）…');
  await page.goto(INDEX_URL, { waitUntil: 'load' });
  await sleep(2500); // monaco 在 DOMContentLoaded 后 2s 才动态注入
  let monacoReady = false;
  try {
    await poll(
      () => {
        try {
          return typeof monacoEditor !== 'undefined' && !!monacoEditor;
        } catch {
          return false;
        }
      },
      undefined,
      { timeout: 12000, label: 'Monaco 编辑器初始化' }
    );
    monacoReady = true;
  } catch {
    monacoReady = false;
  }
  await sleep(500);
  await installPageHelpers();
  log(`Monaco: ${monacoReady ? '已就绪（渐变编辑会同步到动画 JSON）' : '未就绪（用例 4 将降级为只断言 UI）'}`);
  log('');

  await runCase('01', '页面加载：核心元素存在、无 console error / pageerror', case01);
  await runCase('02', '导入 JSON：列表出现 3 个渐变、count 更新、file-info 可见、动画渲染', case02);
  await runCase('03', '选中渐变：.selected 随点击移动、编辑器出现颜色输入与添加色标按钮', case03);
  await runCase('04', '编辑颜色：改 #ff0000 后 hex 同步，动画 JSON 内首色标变红', case04);
  await runCase('05', '添加色标：色标行数 +1', case05);
  await runCase('06', '删除色标：点击删除按钮后色标行数恢复', case06);
  await runCase('07', '搜索过滤：输入子串后只显示匹配项，清空恢复', case07);
  await runCase('08', '播放控制：播放时进度前进，再次点击暂停并冻结进度', case08);
  await runCase('09', '导出 JSON：生成可 JSON.parse 的文件且含全部渐变', case09);
  await runCase('10', '响应式：1280x900 与 900x1200 无横向溢出（并截图）', case10);

  const elapsed = Date.now() - startedAt.getTime();
  const pass = results.filter((r) => r.status === 'PASS').length;
  const fail = results.length - pass;

  log('');
  log('---------------------------------------------------------------');
  log(`用例结果：${pass} PASS / ${fail} FAIL（共 ${results.length} 条，用时 ${(elapsed / 1000).toFixed(1)}s）`);
  log('---------------------------------------------------------------');
  if (fail > 0) {
    log('失败用例：');
    results.filter((r) => r.status === 'FAIL').forEach((r) => log(`  - ${r.id} ${r.title}\n    ${r.detail}`));
  }
  if (runtime.consoleErrors.length) {
    log('');
    log(`运行期间 console error（${runtime.consoleErrors.length} 条，未计入断言）:`);
    runtime.consoleErrors.slice(0, 10).forEach((e) => log(`  - ${e.text.slice(0, 200)}${e.url ? ' @ ' + e.url : ''}`));
  }
  if (runtime.dialogs.length) {
    log('');
    log(`运行期间弹窗（${runtime.dialogs.length} 个）:`);
    runtime.dialogs.forEach((d) => log(`  - ${d}`));
  }
  const lucideWarnCount = runtime.consoleWarnings.filter((w) => /icon name was not found/i.test(w)).length;
  if (lucideWarnCount) log(`\n提示：lucide 图标缺失告警 ${lucideWarnCount} 条（现有代码问题，非测试失败）`);

  const summary = {
    startedAt: startedAt.toISOString(),
    elapsedMs: elapsed,
    siteRoot: SITE_ROOT,
    git,
    chrome: CHROME_PATH,
    monacoReady,
    fixture: { path: rel(FIXTURE), gradients: FIXTURE_GRADIENT_NAMES, frames: FIXTURE_FRAMES },
    totals: { pass, fail, total: results.length },
    results,
    consoleErrors: runtime.consoleErrors,
    pageErrors: runtime.pageErrors,
    warnings: runtime.consoleWarnings,
    dialogs: runtime.dialogs,
    requestFailures: runtime.requestFailures,
  };
  ensureDir(ARTIFACTS);
  fs.writeFileSync(path.join(ARTIFACTS, 'last-run.json'), JSON.stringify(summary, null, 2));
  log(`\n机器可读结果: ${rel(path.join(ARTIFACTS, 'last-run.json'))}`);

  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
}

main().catch(async (err) => {
  log('\n测试执行异常: ' + (err && err.stack ? err.stack : String(err)));
  try {
    if (page) await screenshot('FAIL-fatal.png');
    if (browser) await browser.close();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
