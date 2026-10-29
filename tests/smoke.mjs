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
const INDEX_URL = 'file://' + path.join(SITE_ROOT, 'editor.html');
const FIXTURE = path.join(TESTS_DIR, 'fixtures', 'master.json');
// 用例 11-14 专用 fixture（新功能覆盖，不改动 master.json）
const FIXTURE_DUPLICATE_NAMES = path.join(TESTS_DIR, 'fixtures', 'duplicate-names.json');
const FIXTURE_STOP_MODES = path.join(TESTS_DIR, 'fixtures', 'stop-modes.json');
const FIXTURE_KEYFRAMED = path.join(TESTS_DIR, 'fixtures', 'keyframed.json');
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

  /* ------------------------------------------------------------------ */
  /* 线上版（13d5c54+）新增的稳定钩子：Lead 重写 UI 时保证不变。          */
  /* 用例 11-14 优先用这些钩子断言；当前基线 DOM 还没有它们时，           */
  /* window.__smoke 里的 *Rows() / *Button() 会退化为结构识别，并在         */
  /* 结果 detail 里标注 [降级]，不把缺失钩子包装成通过。                   */
  /* ------------------------------------------------------------------ */
  hooks: {
    gradientType: '#gradient-type',
    editorColorRow: '[data-row="color"]',
    editorAlphaRow: '[data-row="alpha"]',
    addColorStop: '[data-action="add-color-stop"]',
    addAlphaStop: '[data-action="add-alpha-stop"]',
    toggleAlpha: '[data-action="toggle-alpha"]',
    railColor: '.rail[data-rail="color"]',
    railAlpha: '.rail[data-rail="alpha"]',
    railStop: '.rail-stop',
    keyframedNotice: '[data-editor-notice="keyframed"]',
  },

  // 动画 JSON 镜像（Monaco 隐藏区 / 隐藏 textarea；线上版已不再内嵌 Monaco）
  monacoContainer: '#monaco-editor-container',
  jsonMirror: '#json-editor',
};

// 稳定钩子短别名，供页面辅助函数直接引用
Object.assign(SELECTORS, {
  gradientType: SELECTORS.hooks.gradientType,
  editorColorRow: SELECTORS.hooks.editorColorRow,
  editorAlphaRow: SELECTORS.hooks.editorAlphaRow,
  addColorStop: SELECTORS.hooks.addColorStop,
  addAlphaStop: SELECTORS.hooks.addAlphaStop,
  toggleAlpha: SELECTORS.hooks.toggleAlpha,
  railColor: SELECTORS.hooks.railColor,
  railAlpha: SELECTORS.hooks.railAlpha,
  railStop: SELECTORS.hooks.railStop,
  keyframedNotice: SELECTORS.hooks.keyframedNotice,
});

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

    const uniq = (arr) => arr.filter((el, i) => arr.indexOf(el) === i);

    /* ---------- 色标行：优先稳定钩子，基线 DOM 退化为结构识别 ---------- */

    // 颜色行：优先 [data-row="color"]；兜底 = 含 input[type=color] 且含文本输入的行
    const colorRows = () => {
      const root = document.querySelector(s.editor);
      if (!root) return [];
      const hooked = [...root.querySelectorAll(s.editorColorRow)];
      if (hooked.length) return hooked;
      return [...root.querySelectorAll('input[type="color"]')].map(rowOf).filter(Boolean);
    };

    // 透明度行：优先 [data-row="alpha"]；兜底 = 含 ≥2 个 range 且不含颜色输入的行
    // （基线 DOM：alpha 行 = 两个「位置/透明度」滑杆组，颜色行只有 1 个 range）
    const alphaRows = () => {
      const root = document.querySelector(s.editor);
      if (!root) return [];
      const hooked = [...root.querySelectorAll(s.editorAlphaRow)];
      if (hooked.length) return hooked;
      const findRow = (rangeEl) => {
        let el = rangeEl;
        for (let i = 0; i < 8; i++) {
          el = el.parentElement;
          if (!el || el === root || el === document.body) return null;
          const ranges = el.querySelectorAll('input[type="range"]');
          if (ranges.length >= 2 && !el.querySelector('input[type="color"]')) return el;
        }
        return null;
      };
      return uniq([...root.querySelectorAll('input[type="range"]')].map(findRow).filter(Boolean));
    };

    const rowMode = {
      color: () => (document.querySelector(s.editorColorRow) ? 'hook' : 'fallback'),
      alpha: () => (document.querySelector(s.editorAlphaRow) ? 'hook' : 'fallback'),
      addColor: () => (document.querySelector(s.addColorStop) ? 'hook' : 'fallback'),
      addAlpha: () => (document.querySelector(s.addAlphaStop) ? 'hook' : 'fallback'),
      notice: () => (document.querySelector(s.keyframedNotice) ? 'hook' : 'fallback'),
    };

    // 基线 DOM 里「添加透明度色标」按钮 = 与 alpha 行同父容器的 plus 图标按钮
    const alphaAddButtonByStructure = () => {
      const plus = plusIconButtons();
      const aRows = alphaRows();
      return (
        plus.find((b) => b.parentElement && aRows.some((r) => b.parentElement.contains(r))) || null
      );
    };

    /* ---------- 页面辅助对象 ---------- */

    window.__smoke = {
      selectors: s,

      rowOf,
      rows: rowsOf,
      rowCount: () => rowsOf().length,

      /** 颜色色标行（钩子优先，基线退化） */
      colorRows,
      /** 透明度色标行（钩子优先，基线退化） */
      alphaRows,
      /** 断言用的行计数与识别方式，便于在报告里说明是否降级 */
      rowCounts() {
        const colors = colorRows();
        const alphas = alphaRows();
        return {
          colors: colors.length,
          alphas: alphas.length,
          colorMode: rowMode.color(),
          alphaMode: rowMode.alpha(),
        };
      },

      /** 添加颜色色标按钮 */
      addColorStopButton() {
        const hooked = document.querySelector(s.addColorStop);
        if (hooked) return hooked;
        const plus = plusIconButtons();
        if (!plus.length) return null;
        const alphaAdd = alphaAddButtonByStructure();
        const remaining = plus.filter((b) => b !== alphaAdd);
        return remaining[remaining.length - 1] || null;
      },

      /** 添加透明度色标按钮（需要当前渐变已启用透明度/已有 alpha 行） */
      addAlphaStopButton() {
        const hooked = document.querySelector(s.addAlphaStop);
        if (hooked) return hooked;
        return alphaAddButtonByStructure();
      },

      /** 透明度开关（仅用于信息采集，用例不硬依赖） */
      alphaToggleButton() {
        const hooked = document.querySelector(s.toggleAlpha);
        if (hooked) return hooked;
        const root = document.querySelector(s.editor);
        if (!root) return null;
        return (
          [...root.querySelectorAll('button')].find(
            (b) =>
              b.matches('[role="switch"],[aria-checked],[aria-pressed]') ||
              /switch/i.test(typeof b.className === 'string' ? b.className : '')
          ) || null
        );
      },

      /**
       * 关键帧提示状态。
       * hook 模式：存在 [data-editor-notice="keyframed"]；
       * 基线无此钩子 → structural 模式：编辑区非空且没有任何可编辑色标行（即"只提示不编辑"）。
       * 注意：structural 只用于基线降级，会在结果里标注 [降级]；改版后钩子应在则应走 hook。
       */
      keyframedState() {
        const root = document.querySelector(s.editor);
        if (!root) return { found: false, mode: 'none', reason: '找不到 #editor' };
        const hooked =
          root.querySelector(s.keyframedNotice) || document.querySelector(s.keyframedNotice);
        const colorCount = colorRows().length;
        const alphaCount = alphaRows().length;
        const text = (root.textContent || '').replace(/\s+/g, ' ').trim();
        if (hooked) {
          return {
            found: true,
            mode: 'hook',
            colorRows: colorCount,
            alphaRows: alphaCount,
            text: (hooked.textContent || text).replace(/\s+/g, ' ').trim().slice(0, 160),
          };
        }
        return {
          found: colorCount === 0 && alphaCount === 0 && text.length > 0,
          mode: 'structural',
          colorRows: colorCount,
          alphaRows: alphaCount,
          text: text.slice(0, 160),
        };
      },

      /** 预览条导轨（新 UI 才有，信息采集用，用例不硬依赖） */
      rails() {
        const color = document.querySelector(s.railColor);
        const alpha = document.querySelector(s.railAlpha);
        // .rail-stop 可能挂在 .rail 内，也可能与其并列在 .rail-track 里，两种都兼容
        const count = (el) => {
          if (!el) return null;
          const inRail = el.querySelectorAll(s.railStop).length;
          if (inRail) return inRail;
          const track = el.parentElement;
          return track ? track.querySelectorAll(s.railStop).length : inRail;
        };
        return {
          colorRail: !!color,
          alphaRail: !!alpha,
          colorStops: count(color),
          alphaStops: count(alpha),
        };
      },

      /** 稳定钩子存在性快照（报告用） */
      hookProbe() {
        const out = {};
        for (const [name, sel] of Object.entries(s.hooks)) out[name] = !!document.querySelector(sel);
        return out;
      },

      /** 播放状态多信号采集：实例最准，其次按钮 UI，最后靠 #time-display 冻结 */
      playbackSignals() {
        const btn = document.querySelector(s.playPauseButton);
        let pausedByUi = null;
        let uiSignal = null;
        if (btn) {
          const aria = btn.getAttribute('aria-pressed');
          const state = btn.getAttribute('data-state');
          const icons = [...btn.querySelectorAll('svg,i')].map(
            (el) => el.getAttribute('data-lucide') || (typeof el.className === 'string' ? el.className : '')
          );
          const hasPlay = icons.some((x) => /play/i.test(x));
          const hasPause = icons.some((x) => /pause/i.test(x));
          if (aria === 'true' || state === 'paused') {
            pausedByUi = true;
            uiSignal = 'aria/data-state';
          } else if (hasPlay && !hasPause) {
            pausedByUi = true;
            uiSignal = 'play-icon';
          } else if (hasPause && !hasPlay) {
            pausedByUi = false;
            uiSignal = 'pause-icon';
          }
        }
        return { timeText: this.timeText(), anim: this.playback().anim, pausedByUi, uiSignal };
      },

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

/* ------------------------------------------------------------------ */
/* 用例 11-14 专用辅助                                                  */
/* ------------------------------------------------------------------ */

/** 降级登记：基线 DOM 缺稳定钩子时，用结构近似断言替代，并如实记录 */
const degradations = [];
function noteDegrade(id, message) {
  degradations.push({ case: id, message });
  return `[降级] ${message}`;
}

/** 钩子存在性快照：在「可正常编辑的渐变被选中」时采集，避免受后续关键帧空态影响 */
let hookSnapshot = null;
let railsSnapshot = null;

/** 上传 fixture 并等待列表更新为期望条数 + 文件名正确 */
async function importFixture(filePath, expectedCount, label) {
  const input = await page.$(SELECTORS.lottieFileInput);
  assert(input, `找不到文件输入 ${SELECTORS.lottieFileInput}`);
  await input.uploadFile(filePath);
  const expectedName = path.basename(filePath);
  const items = await poll(
    (arg) => {
      const items = window.__smoke.items();
      const fn = document.querySelector(window.__smoke.selectors.filename);
      const okName = fn && fn.textContent.trim() === arg.file;
      return items.length === arg.expected && okName ? items : false;
    },
    { expected: expectedCount, file: expectedName },
    { label: label || `导入 ${expectedName} 后列表出现 ${expectedCount} 项` }
  );
  return items;
}

/** 下载导出的 JSON（每次导出用独立目录，避免与用例 09 的文件混淆） */
const cdpSessions = [];
async function setDownloadDir(dir) {
  ensureDir(dir);
  const cdp = await page.createCDPSession();
  cdpSessions.push(cdp);
  try {
    await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: dir, eventsEnabled: true });
  } catch {
    await cdp.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: dir });
  }
  return cdp;
}

async function exportAndParse(tag) {
  const dir = path.join(DOWNLOADS, tag);
  fs.rmSync(dir, { recursive: true, force: true });
  ensureDir(dir);
  await setDownloadDir(dir);
  // 清掉用例 09 旁路观测到的旧 blob/anchor，避免兜底时拿到上一轮内容
  await page.evaluate(() => {
    if (window.__smokeExport) {
      window.__smokeExport.blobs.length = 0;
      window.__smokeExport.anchors.length = 0;
    }
  });

  const btn = await page.$(SELECTORS.exportButton);
  assert(btn, `找不到导出按钮 ${SELECTORS.exportButton}`);
  await btn.click();

  const deadline = Date.now() + 15000;
  let lastParseError = null;
  while (Date.now() < deadline) {
    const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => !f.endsWith('.crdownload')) : [];
    const jsonFile = files.find((f) => f.toLowerCase().endsWith('.json'));
    if (jsonFile) {
      const full = path.join(dir, jsonFile);
      const text = fs.readFileSync(full, 'utf8');
      try {
        return { tag, file: jsonFile, path: full, size: text.length, json: JSON.parse(text), source: 'download' };
      } catch (err) {
        lastParseError = err.message;
      }
    }
    await sleep(150);
  }

  // 下载落盘失败时，用用例 09 安装的 URL.createObjectURL 旁路兜底
  const blobText = await page.evaluate(async () => {
    try {
      const cap = window.__smokeExport;
      if (!cap || !cap.blobs || !cap.blobs.length) return null;
      for (const b of cap.blobs) {
        try {
          const text = await b.text();
          JSON.parse(text);
          return text;
        } catch {
          /* 不是完整 JSON，继续 */
        }
      }
    } catch {
      /* ignore */
    }
    return null;
  });
  if (blobText) {
    return { tag, file: null, path: null, size: blobText.length, json: JSON.parse(blobText), source: 'blob' };
  }
  throw new Error(
    `导出(${tag}): 15s 内没有可解析的 JSON 下载文件（${rel(dir)}）` +
      (lastParseError ? `，最后解析错误: ${lastParseError}` : '')
  );
}

/** 按遍历顺序收集所有渐变的原始数据（与页面 forEachGradient 顺序一致） */
function collectGradients(json) {
  const out = [];
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if ((node.ty === 'gf' || node.ty === 'gs') && node.g) {
      const raw = node.g.k;
      let keyframed = false;
      let arr = null;
      if (Array.isArray(raw)) {
        if (raw.length && typeof raw[0] === 'object') keyframed = true;
        else arr = raw;
      } else if (raw && typeof raw === 'object') {
        if (raw.a === 1) keyframed = true;
        else if (Array.isArray(raw.k)) {
          if (raw.k.length && typeof raw.k[0] === 'object') keyframed = true;
          else arr = raw.k;
        }
      }
      out.push({ name: node.nm, p: node.g.p, keyframed, raw, k: arr });
    }
    if (Array.isArray(node)) node.forEach(walk);
    else Object.values(node).forEach((v) => { if (v && typeof v === 'object') walk(v); });
  };
  walk(json);
  return out;
}

/** "#time-display" → { current, total }（取不到返回 null） */
function parseTimeText(text) {
  const m = /(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/.exec(text || '');
  if (!m) return null;
  return { current: Number(m[1]), total: Number(m[2]) };
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
/* 用例 11：同名渐变逐条列出，编辑只影响选中的那一条                    */
/* ------------------------------------------------------------------ */
async function case11() {
  // 用例 10 把视口改成了 900x1200，恢复默认，避免影响后续布局
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
  await sleep(300);

  const items = await importFixture(
    FIXTURE_DUPLICATE_NAMES,
    2,
    '导入 duplicate-names.json 后出现 2 条同名渐变'
  );
  const names = items.map((i) => i.name);
  assert(
    names.length === 2 && names[0] === 'Name #1' && names[1] === 'Name #2',
    `同名渐变未逐条列出为 Name #1 / Name #2：${JSON.stringify(names)}`
  );
  const nameHook = await page.evaluate((sel) => !!document.querySelector(sel), SELECTORS.gradientName);

  // 选中第 1 条（不依赖 nth-child，按列表顺序取第一个 .gradient-item）
  const clicked = await page.evaluate(() => {
    const el = document.querySelectorAll(window.__smoke.selectors.gradientItem)[0];
    if (!el) return false;
    el.click();
    return true;
  });
  assert(clicked, '找不到第一个 .gradient-item');
  await poll(
    () => {
      const items = window.__smoke.items();
      return items[0] && items[0].selected;
    },
    undefined,
    { label: '第 1 个同名渐变获得 .selected' }
  );

  const counts = await poll(
    () => {
      const c = window.__smoke.rowCounts();
      return c.colors >= 2 ? c : false;
    },
    undefined,
    { label: '同名渐变编辑器出现 ≥2 个颜色色标行' }
  );

  // 改第 1 条的首色标为 #00ff00
  const edited = await page.evaluate(() => {
    const row = window.__smoke.colorRows()[0];
    const ci = row && row.querySelector('input[type="color"]');
    if (!ci) return false;
    ci.value = '#00ff00';
    ci.dispatchEvent(new Event('input', { bubbles: true }));
    ci.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  });
  assert(edited, '同名渐变编辑区找不到首个颜色 input[type=color]');
  await sleep(450); // 100ms 编辑防抖 + 动画重建

  const exported = await exportAndParse('case11');
  const same = collectGradients(exported.json).filter((g) => g.name === 'Name');
  assert(same.length === 2, `导出 JSON 中名为 "Name" 的渐变应为 2 个，实际 ${same.length} 个`);
  assert(!same[0].keyframed && !same[1].keyframed, '导出 JSON 中同名渐变不应变成关键帧');
  const first = same[0].k;
  const second = same[1].k;
  assert(first && first.length >= 8 && second && second.length >= 8, '同名渐变的色标数组长度异常');

  assertClose(first[1], 0, 0.002, '第 1 个同名渐变首色标 R');
  assertClose(first[2], 1, 0.002, '第 1 个同名渐变首色标 G（应为 #00ff00）');
  assertClose(first[3], 0, 0.002, '第 1 个同名渐变首色标 B');
  assertClose(second[1], 0.3, 0.002, '第 2 个同名渐变首色标 R（应保持原值）');
  assertClose(second[2], 0.6, 0.002, '第 2 个同名渐变首色标 G（应保持原值）');
  assertClose(second[3], 0.9, 0.002, '第 2 个同名渐变首色标 B（应保持原值）');

  await screenshot('11-duplicate-names.png');
  return (
    `列表=${JSON.stringify(names)}（.gradient-name ${nameHook ? '命中' : '缺失→回退 item 文本'}，颜色行=${counts.colors}）；` +
    `改第 1 条首色标 #00ff00 后导出：第 1 条 RGB=[${first[1]},${first[2]},${first[3]}]，` +
    `第 2 条仍为 RGB=[${second[1]},${second[2]},${second[3]}]（source=${exported.source}）`
  );
}

/* ------------------------------------------------------------------ */
/* 用例 12：颜色色标与透明度色标相互独立                                */
/* ------------------------------------------------------------------ */
async function case12() {
  const items = await importFixture(FIXTURE_STOP_MODES, 1, '导入 stop-modes.json 后出现 1 条渐变');
  assert(items.length === 1, `stop-modes.json 应只有 1 条渐变，实际 ${items.length}`);
  assert(items[0].selected, '导入后应自动选中唯一的渐变');

  const base = await poll(
    () => {
      const c = window.__smoke.rowCounts();
      return c.colors === 3 && c.alphas === 2 ? c : false;
    },
    undefined,
    { label: '颜色行=3、透明度行=2（两种色标数量可以不同）' }
  );
  assert(base.colors !== base.alphas, `颜色行(${base.colors})与透明度行(${base.alphas})应可不同`);

  // 透明度轨（新 UI 才有的稳定钩子；仅信息采集）
  const rails = await page.evaluate(() => window.__smoke.rails());
  // 在「普通渐变可编辑」状态下采集钩子快照（末尾关键帧空态会让部分钩子暂时不在 DOM 里）
  hookSnapshot = await page.evaluate(() => window.__smoke.hookProbe());
  railsSnapshot = rails;

  // 加一个透明度色标：alpha 行 +1，color 行不变
  const alphaHandle = await page.evaluateHandle(() => window.__smoke.addAlphaStopButton());
  const alphaBtn = alphaHandle.asElement();
  assert(alphaBtn, '未找到「添加透明度色标」按钮');
  await alphaBtn.click();
  const afterAlpha = await poll(
    (arg) => {
      const c = window.__smoke.rowCounts();
      return c.alphas === arg.expected ? c : false;
    },
    { expected: base.alphas + 1 },
    { label: `透明度行从 ${base.alphas} 增加到 ${base.alphas + 1}` }
  );
  assert(afterAlpha.colors === base.colors, `添加透明度色标不应改变颜色行数（实际 ${afterAlpha.colors}）`);

  // 加一个颜色色标：color 行 +1，alpha 行不变
  const colorHandle = await page.evaluateHandle(() => window.__smoke.addColorStopButton());
  const colorBtn = colorHandle.asElement();
  assert(colorBtn, '未找到「添加颜色色标」按钮');
  await colorBtn.click();
  const afterColor = await poll(
    (arg) => {
      const c = window.__smoke.rowCounts();
      return c.colors === arg.expected ? c : false;
    },
    { expected: base.colors + 1 },
    { label: `颜色行从 ${base.colors} 增加到 ${base.colors + 1}` }
  );
  assert(afterColor.alphas === afterAlpha.alphas, `添加颜色色标不应改变透明度行数（实际 ${afterColor.alphas}）`);

  const notes = [];
  if (base.colorMode !== 'hook') {
    notes.push(noteDegrade('12', '基线无 [data-row="color"]，颜色行按「含颜色输入的行容器」计数'));
  }
  if (base.alphaMode !== 'hook') {
    notes.push(noteDegrade('12', '基线无 [data-row="alpha"]，透明度行按「含 ≥2 个滑杆且无颜色输入的行容器」计数'));
  }
  const railNote = rails.colorRail
    ? `；预览条颜色轨=${rails.colorStops} 个 .rail-stop、透明度轨=${rails.alphaStops} 个`
    : '；基线无 .rail 预览条（信息采集跳过）';

  await screenshot('12-stop-modes.png');
  return (
    `颜色行=${base.colors}、透明度行=${base.alphas}（可不等；识别=${base.colorMode}/${base.alphaMode}）；` +
    `点「加透明度」→ alpha ${base.alphas}→${afterAlpha.alphas}、color 保持 ${afterAlpha.colors}；` +
    `点「加颜色」→ color ${base.colors}→${afterColor.colors}、alpha 保持 ${afterColor.alphas}` +
    railNote +
    (notes.length ? ' ' + notes.join(' ') : '')
  );
}

/* ------------------------------------------------------------------ */
/* 用例 13：改色保留播放状态（不跳回 0、不自动播放）                    */
/* ------------------------------------------------------------------ */
async function case13() {
  await importFixture(FIXTURE, 3, '重新导入 master.json 供播放状态用例使用');
  await poll(
    () => window.__smoke.rowCounts().colors >= 2,
    undefined,
    { label: '编辑器颜色行出现（默认选中第一个渐变）' }
  );

  const btn = await page.$(SELECTORS.playPauseButton);
  assert(btn, `找不到播放按钮 ${SELECTORS.playPauseButton}`);
  const readSignals = () => page.evaluate(() => window.__smoke.playbackSignals());
  const isPaused = (s) => (s.anim ? s.anim.paused === true : s.pausedByUi === true);
  const isPlaying = (s) => (s.anim ? s.anim.paused === false : s.pausedByUi === false);

  // 1) 统一从「播放中」开始
  let state = await readSignals();
  if (!isPlaying(state)) {
    await btn.click();
    await sleep(400);
    state = await readSignals();
  }
  assert(isPlaying(state), `无法让动画进入播放状态（anim=${JSON.stringify(state.anim)}, ui=${state.pausedByUi}）`);

  // 2) 拖进度条到中间（input 开始 scrub + change 结束 scrub 并恢复拖前状态）
  const hasProgress = await page.evaluate((sel) => {
    const bar = document.querySelector(sel);
    if (!bar) return false;
    bar.value = '50';
    bar.dispatchEvent(new Event('input', { bubbles: true }));
    bar.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }, SELECTORS.progressBar);
  assert(hasProgress, `找不到进度条 ${SELECTORS.progressBar}`);
  await sleep(500);

  // 3) 点击播放/暂停暂停（scrub 后若已暂停则不再点）
  for (let i = 0; i < 3; i++) {
    state = await readSignals();
    if (isPaused(state)) break;
    await btn.click();
    await sleep(300);
  }
  state = await readSignals();
  assert(isPaused(state), `点击播放/暂停后仍未暂停（anim=${JSON.stringify(state.anim)}, ui=${state.pausedByUi}/${state.uiSignal}）`);

  const beforeTime = state.timeText;
  const parsedBefore = parseTimeText(beforeTime);
  assert(parsedBefore && parsedBefore.total > 0, `#time-display 无法解析：'${beforeTime}'`);
  assert(
    parsedBefore.current > parsedBefore.total * 0.1,
    `拖到中间后当前帧应远离 0：'${beforeTime}'（总帧数 ${parsedBefore.total}）`
  );
  const beforeFrame = state.anim ? state.anim.currentFrame : parsedBefore.current;

  // 4) 改一个色标颜色
  const edited = await page.evaluate(() => {
    const row = window.__smoke.colorRows()[0];
    const ci = row && row.querySelector('input[type="color"]');
    if (!ci) return null;
    ci.value = '#ff00ff';
    ci.dispatchEvent(new Event('input', { bubbles: true }));
    ci.dispatchEvent(new Event('change', { bubbles: true }));
    const hex = row.querySelector('input[type="text"]');
    return { hex: hex ? hex.value : null };
  });
  assert(edited, '播放状态用例：找不到颜色 input[type=color]');
  await sleep(900);

  const after = await readSignals();
  const parsedAfter = parseTimeText(after.timeText);
  // 与实例无关的旁证：进度条没被重置、动画 DOM 还在（防止"动画被销毁所以看起来冻结"的假通过）
  const domState = await page.evaluate((sel) => {
    const bar = document.querySelector(sel.progressBar);
    return {
      progressValue: bar ? Number(bar.value) : null,
      hasSvg: !!document.querySelector(sel.animationContainer + ' svg'),
    };
  }, SELECTORS);
  assert(
    domState.progressValue !== null && domState.progressValue > 5,
    `改色后进度条被重置（value=${domState.progressValue}），播放进度未保留`
  );
  assert(domState.hasSvg, '改色后预览区没有 SVG，动画可能未正确重建');

  // 暂停语义：实例最准；否则按钮 UI；都拿不到才降级为「时间冻结」
  if (after.anim) {
    assert(after.anim.paused === true, `改色后 animation.isPaused=${after.anim.paused}，暂停状态未被保留`);
  } else if (after.pausedByUi !== null) {
    assert(after.pausedByUi === true, `改色后播放按钮显示为播放中（ui=${after.uiSignal}），暂停状态未被保留`);
  }

  assert(parsedAfter, `改色后 #time-display 无法解析：'${after.timeText}'`);
  assert(
    parsedAfter.current > parsedAfter.total * 0.1,
    `改色后帧跳回开头：'${beforeTime}' → '${after.timeText}'`
  );
  assert(after.timeText === beforeTime, `改色后暂停帧未冻结：'${beforeTime}' → '${after.timeText}'`);

  let degradeNote = '';
  if (!after.anim && after.pausedByUi === null) {
    degradeNote =
      ' ' +
      noteDegrade(
        '13',
        '拿不到 animation 实例与按钮暂停语义，仅用 #time-display 900ms 冻结 + 当前帧非 0 判断播放状态'
      );
  }
  const hexNote = edited.hex ? `，hex 同步='${edited.hex}'` : '';

  await screenshot('13-preserve-playback.png');
  return (
    `暂停在 '${beforeTime}'（frame=${beforeFrame}）；改首色标 #ff00ff 后 900ms 仍为 '${after.timeText}'，` +
    `anim.isPaused=${after.anim ? after.anim.paused : 'n/a'}，按钮信号=${after.pausedByUi}/${after.uiSignal}${hexNote}${degradeNote}`
  );
}

/* ------------------------------------------------------------------ */
/* 用例 14：关键帧渐变只提示、不提供编辑                                */
/* ------------------------------------------------------------------ */
async function case14() {
  const items = await importFixture(FIXTURE_KEYFRAMED, 2, '导入 keyframed.json 后出现 2 条渐变');
  assert(items.length === 2, `keyframed.json 应有 2 条渐变，实际 ${items.length}`);

  // 默认选中第 1 条（静态渐变）：编辑器应正常出现颜色行
  const staticCounts = await poll(
    () => {
      const c = window.__smoke.rowCounts();
      return c.colors >= 2 ? c : false;
    },
    undefined,
    { label: '静态渐变编辑器出现颜色行（对照组）' }
  );

  // 选中第 2 条（关键帧渐变）
  const clicked = await page.evaluate(() => {
    const els = document.querySelectorAll(window.__smoke.selectors.gradientItem);
    if (!els[1]) return false;
    els[1].click();
    return true;
  });
  assert(clicked, '找不到第 2 个 .gradient-item（关键帧渐变）');

  const state = await poll(
    () => {
      const s = window.__smoke.keyframedState();
      return s.found ? s : false;
    },
    undefined,
    { label: '选中关键帧渐变后编辑区出现提示' }
  );

  assert(
    state.colorRows === 0,
    `关键帧渐变的编辑区不应有颜色色标行（实际 ${state.colorRows}）`
  );
  assert(
    state.alphaRows === 0,
    `关键帧渐变的编辑区不应有透明度色标行（实际 ${state.alphaRows}）`
  );
  if (state.mode !== 'hook') {
    noteDegrade(
      '14',
      `基线无 [data-editor-notice="keyframed"]，降级为结构近似断言：编辑区无任何色标行且有提示文本（'${state.text.slice(0, 40)}…'）`
    );
  } else if (hookSnapshot) {
    // 关键帧提示只在选中关键帧渐变时存在于 DOM：这里把两态快照合并
    hookSnapshot.keyframedNotice = true;
  }

  // 数据层：导出后关键帧结构应原样保留（只提示不编辑）
  const exported = await exportAndParse('case14');
  const animated = collectGradients(exported.json).find((g) => g.name === 'Grad-Animated');
  assert(animated, '导出 JSON 中找不到 Grad-Animated');
  assert(animated.keyframed, '关键帧渐变被改成了静态数组（不再识别为关键帧）');
  assert(animated.raw && animated.raw.a === 1, `关键帧渐变 g.k.a=${animated.raw && animated.raw.a}，应保持为 1`);
  assert(
    Array.isArray(animated.raw.k) && animated.raw.k.length === 2,
    '关键帧数组长度应保持 2 帧不变'
  );

  await screenshot('14-keyframed.png');
  return (
    `提示方式=${state.mode === 'hook' ? '[data-editor-notice="keyframed"] 命中' : '结构近似（无钩子）'}，` +
    `颜色行=${state.colorRows}、透明度行=${state.alphaRows}（静态渐变对照组颜色行=${staticCounts.colors}）；` +
    `导出后 Grad-Animated 仍为 a=1、${animated.raw.k.length} 个关键帧（提示='${state.text.slice(0, 60)}'）`
  );
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
  await runCase('11', '同名渐变：逐条列出 Name #1 / Name #2，改第 1 条不影响第 2 条', case11);
  await runCase('12', '色标分离：颜色行与透明度行独立增删、互不影响', case12);
  await runCase('13', '改色保状态：暂停在中段改色后不跳回 0、不自动播放', case13);
  await runCase('14', '关键帧渐变：出现提示且无编辑行，导出后关键帧原样保留', case14);

  // 稳定钩子覆盖快照（给 Lead 看改版进度：哪些钩子已就位、哪些还缺）
  // 优先用用例 12 在「普通渐变可编辑」状态采集的快照；否则退回当前 DOM 探测。
  let hookProbe = hookSnapshot;
  if (!hookProbe) {
    try {
      hookProbe = await page.evaluate(() => window.__smoke.hookProbe());
    } catch {
      /* ignore */
    }
  }
  if (hookProbe) {
    const missing = Object.entries(hookProbe).filter(([, ok]) => !ok).map(([name]) => name);
    log('');
    log(
      `稳定钩子（普通渐变编辑态）：${
        missing.length === 0 ? '全部就位' : `缺 ${missing.length} 个 → ${missing.join(', ')}`
      }` +
        `（就位: ${Object.entries(hookProbe).filter(([, ok]) => ok).map(([n]) => n).join(', ') || '无'}）`
    );
    if (railsSnapshot && (railsSnapshot.colorRail || railsSnapshot.alphaRail)) {
      log(
        `预览条导轨：颜色轨=${railsSnapshot.colorRail ? '有' : '无'}（${railsSnapshot.colorStops} 个 .rail-stop），` +
          `透明度轨=${railsSnapshot.alphaRail ? '有' : '无'}（${railsSnapshot.alphaStops} 个 .rail-stop）`
      );
    } else if (railsSnapshot) {
      log('预览条导轨：基线 DOM 无 .rail[data-rail] 钩子（信息采集跳过）');
    }
  }

  if (degradations.length) {
    log('');
    log(`因基线 DOM 缺稳定钩子而降级的断言（${degradations.length} 处，用例仍按结构近似断言判定）:`);
    for (const d of degradations) log(`  - 用例 ${d.case}: ${d.message}`);
  }

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
    hookProbe,
    railsSnapshot,
    degradations,
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
