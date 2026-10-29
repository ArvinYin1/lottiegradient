/**
 * 渐变回填 · backfill.html
 * ------------------------------------------------------------
 * 用 Pyodide 在浏览器里跑 py-aep，从 .aep 读出真实渐变色标，
 * 与 Bodymovin 导出的 Lottie JSON 逐条比对，由用户确认后回填。
 *
 * 全部在本机完成，文件不上传。Pyodide 与 Python 依赖均按需加载。
 */

/**
 * 运行时资源来源。自建 nginx 的带宽有限（实测 ~0.3 MB/s），15 MB 要等 40 多秒；
 * GitHub Pages 走 CDN（实测 ~2.7 MB/s）且带 Access-Control-Allow-Origin: *，
 * 所以默认优先从 Pages 取，失败再回落到同源，保证离线/内网也能用。
 * 加 ?local=1 可强制只用同源（测试用）。
 */
const LOCAL_VENDOR = new URL('./vendor/', import.meta.url).href;
const CDN_VENDOR = 'https://arvinyin1.github.io/lottiegradient/js/vendor/';
const FORCE_LOCAL = new URLSearchParams(location.search).has('local');

const PYODIDE_URL = new URL('pyodide/', LOCAL_VENDOR).href;
const LIBS_ZIP = new URL('pyaep-libs.zip', LOCAL_VENDOR).href;
const EXTRACT_PY = new URL('pyaep/extract.py', LOCAL_VENDOR).href;

/* ============ i18n ============ */
/* ============ i18n ============ */

const i18n = {
    zh: {
        backfill: '渐变回填',
        help: '说明',
        theme: '切换主题',
        backToEditor: '编辑器',
        jsonTitle: 'Lottie JSON',
        aepTitle: 'AE 工程',
        pickFile: '选择文件',
        parse: '解析并修复',
        exportJson: '导出 JSON',
        statusPick: '选择两个文件',
        statusReady: '文件就绪',
        statusNeedOther: '还需要选择另一个文件',
        statusPyLoading: '正在加载 Python 运行时…',
        statusUnpacking: '正在解包 py-aep 依赖…',
        statusParsing: '正在解析 .aep…',
        statusDone: '完成 · 耗时 {ms} ms',
        statusFailed: '解析失败：{msg}',
        loadingTitle: '正在准备运行环境',
        loadingHint: '首次加载约 15 MB，之后走浏览器缓存',
        loadingPy: '加载 Python 运行时',
        loadingUnpack: '解包 py-aep 依赖',
        loadingParse: '解析工程文件',
        loadingElapsed: '{s} 秒',
        loadingMB: '已下载 {got} MB',
        loadingFallback: '当前来源不可用，正在切换备用来源…',
        runtimeTimeout: '运行时加载超时，请刷新重试',
        before: '修复前',
        after: '修复后',
        previewEmpty: '解析后在这里对比',
        play: '播放',
        pause: '暂停',
        summaryFixed: '已修复 {n} 个渐变',
        summaryNothing: '两侧渐变已经一致，无需修改',
        summarySkipped: '{n} 项未处理',
        summaryMatchedByName: '{n} 个按名称匹配',
        focusLabel: '聚焦',
        focusAll: '全部渐变',
        focusOption: '{n}. {name}',
        skipTitle: '未处理的项',
        skipDesc: '这些渐变没有回填',
        reasonKeyframed: '关键帧渐变',
        reasonMissing: 'JSON 中缺失',
        reasonExtra: 'JSON 中多出',
        reasonNoArray: '无法解析',
        toastApplied: '已修复 {n} 个渐变',
        toastNothing: '两侧渐变已经一致',
        toastFailed: '解析失败：{msg}',
        helpTitle: '关于渐变回填',
        helpDesc: '自动修复 + 前后对比',
        help1Title: '它做什么',
        help1Body: '从 After Effects 工程里读出真实的渐变（色标位置、颜色、透明度），自动替换到你的 Lottie JSON 中，并把修复前后的动画并排播放给你看。文件不会上传，解析全部在本机浏览器里完成。',
        help2Title: '匹配规则',
        help2Body: '先按「合成 / 图层 / 组 / 渐变名」完整路径精确匹配；路径对不上时退回「同名 + 出现顺序」匹配。匹配上的渐变会被直接改写，不需要手动挑选。',
        help3Title: '不会处理的情况',
        help3Body: '关键帧渐变、JSON 里缺失或多出的渐变不会改动，会汇总在「未处理项」里供你确认。工程未存盘时无法解析。'
    },
    en: {
        backfill: 'Gradient backfill',
        help: 'Help',
        theme: 'Toggle theme',
        backToEditor: 'Editor',
        jsonTitle: 'Lottie JSON',
        aepTitle: 'AE project',
        pickFile: 'Choose file',
        parse: 'Parse and fix',
        exportJson: 'Export JSON',
        statusPick: 'Choose two files',
        statusReady: 'Files ready',
        statusNeedOther: 'Pick the other file too',
        statusPyLoading: 'Loading Python runtime…',
        statusUnpacking: 'Unpacking py-aep…',
        statusParsing: 'Parsing .aep…',
        statusDone: 'Done · {ms} ms',
        statusFailed: 'Failed: {msg}',
        loadingTitle: 'Preparing runtime',
        loadingHint: 'About 15 MB on first run, cached afterwards',
        loadingPy: 'Loading Python runtime',
        loadingUnpack: 'Unpacking py-aep',
        loadingParse: 'Parsing project',
        loadingElapsed: '{s}s',
        loadingMB: '{got} MB downloaded',
        loadingFallback: 'Source unavailable, switching to the fallback…',
        runtimeTimeout: 'Runtime loading timed out; please reload',
        before: 'Before',
        after: 'After',
        previewEmpty: 'Compare here after parsing',
        play: 'Play',
        pause: 'Pause',
        summaryFixed: 'Fixed {n} gradients',
        summaryNothing: 'All gradients already match',
        summarySkipped: '{n} not handled',
        summaryMatchedByName: '{n} matched by name',
        focusLabel: 'Focus',
        focusAll: 'All gradients',
        focusOption: '{n}. {name}',
        skipTitle: 'Not handled',
        skipDesc: 'These gradients were left untouched',
        reasonKeyframed: 'Keyframed gradient',
        reasonMissing: 'Missing in JSON',
        reasonExtra: 'Extra in JSON',
        reasonNoArray: 'Unreadable',
        toastApplied: 'Fixed {n} gradients',
        toastNothing: 'All gradients already match',
        toastFailed: 'Failed: {msg}',
        helpTitle: 'About gradient backfill',
        helpDesc: 'Auto-fix with before/after preview',
        help1Title: 'What it does',
        help1Body: 'Reads the real gradients from the After Effects project (stop positions, colors, alpha), applies them to your Lottie JSON automatically, and plays the before/after animations side by side. Files never leave your machine.',
        help2Title: 'Matching',
        help2Body: 'First an exact match on the full "comp / layer / group / gradient" path; if that fails it falls back to "same name + occurrence order". Matched gradients are rewritten directly — no manual selection.',
        help3Title: 'Not handled',
        help3Body: 'Keyframed gradients, gradients missing from the JSON, and extra gradients are left untouched and listed under "Not handled". An unsaved project cannot be parsed.'
    }
};

let currentLang = localStorage.getItem('lottie-lang') || 'zh';

function t(key, params = {}) {
    let text = (i18n[currentLang] && i18n[currentLang][key]) || i18n.zh[key] || key;
    Object.keys(params).forEach((name) => {
        text = text.replace(`{${name}}`, params[name]);
    });
    return text;
}

function applyStaticText() {
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        const value = i18n[currentLang][key];
        if (value) el.textContent = value;
    });
    document.querySelectorAll('[data-i18n-tip]').forEach((el) => {
        const key = el.getAttribute('data-i18n-tip');
        el.setAttribute('data-tip', i18n[currentLang][key] || '');
        el.setAttribute('aria-label', i18n[currentLang][key] || '');
    });
    const langText = document.getElementById('lang-text');
    if (langText) langText.textContent = currentLang === 'zh' ? 'EN' : '中文';
}

/* ============ 状态 ============ */

const state = {
    jsonData: null,        // 会被就地修复的数据（导出用）
    originalJson: null,    // 解析时的原始副本（预览「修复前」用）
    jsonName: '',
    aepBytes: null,
    aepName: '',
    py: null,
    rows: [],
    jsonGradients: [],
    appliedCount: 0,
    status: { key: 'statusPick', params: {} },
};

const $ = (id) => document.getElementById(id);

function setStatus(key, params = {}) {
    state.status = { key, params };
    const el = $('status-text');
    if (el) el.textContent = t(key, params);
}

function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
}

function toast(message, type = 'info') {
    let host = $('toast-container');
    if (!host) {
        host = document.createElement('div');
        host.id = 'toast-container';
        document.body.appendChild(host);
    }
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = message;
    host.appendChild(el);
    void el.offsetHeight;
    el.classList.add('toast-show');
    setTimeout(() => {
        el.classList.remove('toast-show');
        setTimeout(() => el.remove(), 300);
    }, 3200);
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
}

/* ============ 加载状态 ============ */

let loadingTicker = null;
let loadingStartedAt = 0;
let loadingPhase = { key: 'loadingPy', params: {} };
let loadingBytes = null;

function renderLoadingPhase() {
    const el = $('loading-phase');
    if (!el) return;
    const parts = [t(loadingPhase.key, loadingPhase.params)];
    if (loadingBytes && loadingBytes.got > 0) {
        parts.push(t('loadingMB', { got: (loadingBytes.got / 1048576).toFixed(1) }));
    }
    const seconds = ((performance.now() - loadingStartedAt) / 1000).toFixed(0);
    parts.push(t('loadingElapsed', { s: seconds }));
    el.textContent = parts.join(' · ');
}

function showLoading(key, params = {}) {
    loadingPhase = { key, params };
    loadingBytes = null;
    loadingStartedAt = performance.now();
    const mask = $('bf-loading');
    mask.classList.add('is-visible');
    mask.setAttribute('aria-busy', 'true');
    renderLoadingPhase();
    setLoadingProgress(null);
    if (loadingTicker) clearInterval(loadingTicker);
    loadingTicker = setInterval(renderLoadingPhase, 250);
}

function setLoadingBytes(got) {
    loadingBytes = { got: got || 0 };
    renderLoadingPhase();
}

function setLoadingProgress(ratio) {
    const bar = $('loading-bar');
    if (!bar) return;
    const wrap = bar.parentElement;
    if (ratio === null || ratio === undefined) {
        wrap.classList.add('is-indeterminate');
        bar.style.width = '';
    } else {
        wrap.classList.remove('is-indeterminate');
        bar.style.width = `${Math.round(Math.max(0, Math.min(1, ratio)) * 100)}%`;
    }
}

function hideLoading() {
    const mask = $('bf-loading');
    if (mask) {
        mask.classList.remove('is-visible');
        mask.setAttribute('aria-busy', 'false');
    }
    if (loadingTicker) {
        clearInterval(loadingTicker);
        loadingTicker = null;
    }
    loadingBytes = null;
}

const RUNTIME_TIMEOUT_MS = 150000;
const STALL_TIMEOUT_MS = 25000;   // 连续 25s 没有新字节才算卡住
const ASSET_TIMEOUT_MS = 240000;  // 单文件硬上限（慢速网络也能下完）
// 运行时三个必需文件：一起预取，进度才真实（之前只统计 wasm，进度条跑完了还在下别的）
const RUNTIME_ASSETS = [
    { key: 'asm', path: 'pyodide/pyodide.asm.esm.js' },
    { key: 'wasm', path: 'pyodide/pyodide.asm.wasm' },
    { key: 'stdlib', path: 'pyodide/python_stdlib.zip' },
];
let activeVendorBase = LOCAL_VENDOR;

function assetUrl(base, path) {
    return new URL(path, base).href;
}

/* ---------- 运行时缓存（Cache Storage） ----------
 * 15 MB 的运行时只该下一次。缓存后即使网络抽风/超时，刷新也能秒开。
 */
const RUNTIME_CACHE = 'backfill-runtime-v1';

async function cacheMatch(url) {
    if (!('caches' in window)) return null;
    try {
        const cache = await caches.open(RUNTIME_CACHE);
        const hit = await cache.match(url);
        if (!hit) return null;
        return new Uint8Array(await hit.arrayBuffer());
    } catch (error) {
        return null;
    }
}

async function cachePut(url, bytes) {
    if (!('caches' in window)) return;
    try {
        const cache = await caches.open(RUNTIME_CACHE);
        await cache.put(url, new Response(bytes, {
            headers: { 'Content-Type': 'application/octet-stream' },
        }));
    } catch (error) { /* 配额不足等情况忽略 */ }
}

/** 下载单个资源，带字节进度与停滞超时（避免网络卡住时无限等） */
async function downloadAsset(url, onBytes) {
    const cached = await cacheMatch(url);
    if (cached) {
        onBytes(cached.length, cached.length);
        return cached;
    }
    const controller = new AbortController();
    let stallTimer = setTimeout(() => controller.abort(), STALL_TIMEOUT_MS);
    const hardTimer = setTimeout(() => controller.abort(), ASSET_TIMEOUT_MS);
    const touch = () => {
        clearTimeout(stallTimer);
        stallTimer = setTimeout(() => controller.abort(), STALL_TIMEOUT_MS);
    };
    try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
        const total = Number(response.headers.get('content-length') || 0);
        if (!response.body) {
            const buffer = new Uint8Array(await response.arrayBuffer());
            onBytes(buffer.length, total || buffer.length);
            return buffer;
        }
        const reader = response.body.getReader();
        const chunks = [];
        let received = 0;
        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            touch();
            chunks.push(value);
            received += value.length;
            onBytes(received, total);
        }
        const merged = new Uint8Array(received);
        let offset = 0;
        for (const chunk of chunks) {
            merged.set(chunk, offset);
            offset += chunk.length;
        }
        await cachePut(url, merged);
        return merged;
    } finally {
        clearTimeout(stallTimer);
        clearTimeout(hardTimer);
    }
}

/** 先拿各文件的 Content-Length，进度条与「x MB / y MB」才能从一开始就准确 */
async function headSize(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
        const response = await fetch(url, { method: 'HEAD', signal: controller.signal });
        if (!response.ok) return 0;
        return Number(response.headers.get('content-length') || 0);
    } catch (error) {
        return 0;
    } finally {
        clearTimeout(timer);
    }
}

/**
 * 依次预取运行时资源。
 * 进度按「已完成的文件比例 + 当前文件比例」平均，而不是字节总和：
 * 有的 CDN 会 gzip，Content-Length 是压缩后大小，而流式读出来的是解压后字节，
 * 直接相除会算出 >100%（曾出现「7.4 MB / 6.1 MB」）。
 */
async function prefetchRuntime(base, onProgress) {
    const assets = RUNTIME_ASSETS.map((asset) => ({ ...asset, url: assetUrl(base, asset.path) }));
    const sizes = await Promise.all(assets.map((asset) => headSize(asset.url)));

    const received = {};
    const totals = {};
    assets.forEach((asset, index) => {
        received[asset.key] = 0;
        totals[asset.key] = sizes[index];
    });

    const report = () => {
        let done = 0;
        let downloaded = 0;
        assets.forEach((asset) => {
            const got = received[asset.key] || 0;
            const total = totals[asset.key] || 0;
            downloaded += got;
            done += total > 0 ? Math.min(1, got / total) : 0;
        });
        onProgress(done / assets.length, downloaded, 0);
    };

    const buffers = {};
    for (const asset of assets) {
        buffers[asset.key] = await downloadAsset(asset.url, (got, total) => {
            received[asset.key] = got;
            if (total) totals[asset.key] = total;
            report();
        });
        received[asset.key] = buffers[asset.key].length;
        report();
    }
    return buffers;
}

/**
 * 用预取到的字节构造 MIME 正确的响应交给 Pyodide：
 * - wasm：nginx 常返回 octet-stream，会让 instantiateStreaming 抛错且不降级（卡死）
 * - stdlib：已经在我们手里，直接给，避免 Pyodide 再去网络上等
 */
function installRuntimeFetchBridge(buffers) {
    const originalFetch = window.fetch.bind(window);
    const served = [
        { suffix: '/pyodide.asm.wasm', bytes: buffers.wasm, type: 'application/wasm' },
        { suffix: '/python_stdlib.zip', bytes: buffers.stdlib, type: 'application/zip' },
    ];
    window.fetch = async (input, init) => {
        const url = input instanceof Request
            ? input.url
            : (typeof input === 'string' ? input : String(input && input.href ? input.href : input));
        for (const item of served) {
            if (url.endsWith(item.suffix) && item.bytes) {
                return new Response(item.bytes, {
                    status: 200,
                    headers: {
                        'Content-Type': item.type,
                        'Content-Length': String(item.bytes.length),
                    },
                });
            }
        }
        return originalFetch(input, init);
    };
    return () => { window.fetch = originalFetch; };
}

/** 带下载进度的 fetch（能拿到 Content-Length 时给出百分比） */
async function fetchWithProgress(url, onProgress, asText = false) {
    if (!asText) {
        const cached = await cacheMatch(url);
        if (cached) {
            onProgress(1);
            return cached.buffer;
        }
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    const total = Number(response.headers.get('content-length') || 0);
    if (!response.body || !total) {
        onProgress(null);
        return asText ? response.text() : response.arrayBuffer();
    }
    const reader = response.body.getReader();
    const chunks = [];
    let received = 0;
    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        onProgress(received / total);
    }
    const merged = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
    }
    return asText ? new TextDecoder('utf-8').decode(merged) : merged.buffer;
}

/* ============ 渐变数据工具 ============ */

function round3(value) {
    const out = Math.round(Number(value) * 1000) / 1000;
    return out === 0 ? 0 : out;
}

function parseJsonK(node) {
    const g = node && node.g;
    if (!g) return { arr: null, p: 0, keyframed: false };
    let raw = g.k;
    let keyframed = false;
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        if (raw.a === 1) keyframed = true;
        raw = raw.k;
    }
    if (Array.isArray(raw) && raw.length && typeof raw[0] === 'object') keyframed = true;
    const arr = Array.isArray(raw) ? raw : null;
    let p = Number.isInteger(g.p) && g.p > 0 ? g.p : 0;
    if (!p && arr) p = arr.length % 6 === 0 ? arr.length / 6 : Math.floor(arr.length / 4);
    return { arr, p, keyframed };
}

function splitK(arr, declaredP) {
    if (!arr || !arr.length) return { colors: [], alphas: [] };
    const p = Number.isInteger(declaredP) && declaredP > 0 && arr.length >= declaredP * 4
        ? declaredP
        : (arr.length % 6 === 0 ? arr.length / 6 : Math.floor(arr.length / 4));
    const colors = [];
    for (let i = 0; i < p; i++) {
        colors.push({ offset: arr[i * 4], rgb: [arr[i * 4 + 1], arr[i * 4 + 2], arr[i * 4 + 3]] });
    }
    const alphas = [];
    for (let i = p * 4; i + 1 < arr.length; i += 2) {
        alphas.push({ offset: arr[i], alpha: arr[i + 1] });
    }
    return { colors, alphas };
}

function sample(stops, offset, pick) {
    if (!stops.length) return null;
    if (offset <= stops[0].offset) return pick(stops[0]);
    const last = stops[stops.length - 1];
    if (offset >= last.offset) return pick(last);
    for (let i = 0; i < stops.length - 1; i++) {
        const a = stops[i];
        const b = stops[i + 1];
        if (offset >= a.offset && offset <= b.offset) {
            const span = b.offset - a.offset;
            const ratio = span === 0 ? 0 : (offset - a.offset) / span;
            const va = pick(a);
            const vb = pick(b);
            if (Array.isArray(va)) return va.map((v, j) => v + (vb[j] - v) * ratio);
            return va + (vb - va) * ratio;
        }
    }
    return pick(last);
}

function gradientCss(arr, p) {
    const { colors, alphas } = splitK(arr, p);
    if (!colors.length) return 'var(--muted)';
    const offsets = [...new Set([
        ...colors.map((c) => c.offset),
        ...alphas.map((a) => a.offset),
    ])].sort((a, b) => a - b);
    const stops = offsets.map((offset) => {
        const rgb = sample(colors, offset, (c) => c.rgb).map((v) => Math.round(v * 255));
        const alpha = alphas.length ? sample(alphas, offset, (a) => a.alpha) : 1;
        return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${round3(alpha)}) ${Math.round(offset * 100)}%`;
    });
    return `linear-gradient(90deg, ${stops.join(', ')})`;
}

function stopsText(arr, p) {
    if (!arr) return '—';
    const { colors, alphas } = splitK(arr, p);
    return alphas.length
        ? t('stopsWithAlpha', { c: colors.length, a: alphas.length })
        : t('stops', { c: colors.length });
}

/* ============ 读取 JSON 侧渐变（带路径） ============ */

function collectJsonGradients(root) {
    const out = [];

    function walkShapes(shapes, trail) {
        for (const node of shapes || []) {
            if (!node || typeof node !== 'object') continue;
            if (node.ty === 'gf' || node.ty === 'gs') {
                out.push({ node, path: [...trail, node.nm || '(gradient)'] });
            } else if (Array.isArray(node.it)) {
                walkShapes(node.it, [...trail, node.nm || '(group)']);
            }
        }
    }

    function walkLayers(layers, compName) {
        for (const layer of layers || []) {
            if (!layer || !Array.isArray(layer.shapes)) continue;
            walkShapes(layer.shapes, [compName, layer.nm || '(layer)']);
        }
    }

    walkLayers(root.layers, root.nm || '(comp)');
    for (const asset of root.assets || []) {
        if (Array.isArray(asset.layers)) walkLayers(asset.layers, asset.nm || asset.id || '(precomp)');
    }
    return out;
}

/* ============ 匹配 ============ */

const PATH_SEP = '\u0000';

function makeRow(aeGrad, jsonItem, matchMode) {
    const row = { ae: aeGrad, json: jsonItem, matchMode, status: 'pending', checked: false };
    if (!jsonItem) {
        row.status = 'missing';
        return row;
    }
    const { arr, p, keyframed } = parseJsonK(jsonItem.node);
    row.jsonArr = arr;
    row.jsonP = p;
    if (keyframed) {
        row.status = 'keyframed';
        return row;
    }
    if (!arr) {
        row.status = 'noarray';
        return row;
    }
    const aeK = aeGrad.k.map(round3);
    const jsonK = arr.map(round3);
    const same = aeK.length === jsonK.length && aeK.every((v, i) => v === jsonK[i]);
    row.status = same ? 'identical' : 'pending';
    row.checked = !same;
    return row;
}

function matchGradients(aeList, jsonList) {
    const buckets = new Map();
    jsonList.forEach((item, index) => {
        const key = item.path.join(PATH_SEP);
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(index);
    });

    const used = new Set();
    const rows = [];

    for (const aeGrad of aeList) {
        const bucket = buckets.get(aeGrad.path.join(PATH_SEP));
        if (bucket && bucket.length) {
            const index = bucket.shift();
            used.add(index);
            rows.push(makeRow(aeGrad, jsonList[index], 'path'));
        } else {
            rows.push(makeRow(aeGrad, null, 'none'));
        }
    }

    const leftovers = jsonList
        .map((item, index) => ({ item, index }))
        .filter((entry) => !used.has(entry.index));

    for (let i = 0; i < rows.length; i++) {
        if (rows[i].json) continue;
        const hit = leftovers.findIndex((entry) => !used.has(entry.index)
            && (entry.item.node.nm || '') === (rows[i].ae.nm || '')
            && entry.item.node.ty === rows[i].ae.ty);
        if (hit === -1) continue;
        const picked = leftovers[hit];
        used.add(picked.index);
        rows[i] = makeRow(rows[i].ae, picked.item, 'name');
    }

    jsonList.forEach((item, index) => {
        if (used.has(index)) return;
        rows.push({ ae: null, json: item, matchMode: 'extra', status: 'extra', checked: false });
    });

    return rows;
}

/* ============ Pyodide ============ */

/** 候选来源顺序：优先 10 分钟内成功的那个，否则默认 CDN → 同源 */
const VENDOR_MEMORY_MS = 10 * 60 * 1000;

function readVendorMemory() {
    try {
        const raw = JSON.parse(localStorage.getItem('backfill-vendor') || 'null');
        if (!raw || typeof raw !== 'object') return null;
        if (Date.now() - (raw.at || 0) > VENDOR_MEMORY_MS) return null;
        return raw.vendor;
    } catch (error) {
        return null;
    }
}

function writeVendorMemory(vendor) {
    try {
        localStorage.setItem('backfill-vendor', JSON.stringify({ vendor, at: Date.now() }));
    } catch (error) { /* 隐私模式下忽略 */ }
}

function vendorCandidates() {
    if (FORCE_LOCAL) return [LOCAL_VENDOR];
    const remembered = readVendorMemory();
    return remembered === 'local' ? [LOCAL_VENDOR, CDN_VENDOR] : [CDN_VENDOR, LOCAL_VENDOR];
}

async function loadRuntimeFrom(base) {
    activeVendorBase = base;
    const buffers = await prefetchRuntime(base, (ratio, got) => {
        setLoadingProgress(ratio);
        setLoadingBytes(got);
    });

    const pyodideDir = new URL('pyodide/', base).href;
    // 用 .js 而不是 .mjs：nginx 的 mime.types 不含 mjs，会按 octet-stream 返回，
    // 浏览器会拒绝把非 JS MIME 的文件当模块加载（Failed to fetch dynamically imported module）。
    const { loadPyodide } = await import(`${pyodideDir}pyodide.esm.js`);

    const restoreFetch = installRuntimeFetchBridge(buffers);
    try {
        return await Promise.race([
            loadPyodide({ indexURL: pyodideDir }),
            new Promise((_, reject) => setTimeout(
                () => reject(new Error(t('runtimeTimeout'))), RUNTIME_TIMEOUT_MS
            )),
        ]);
    } finally {
        restoreFetch();
    }
}

async function ensurePyodide() {
    if (state.py) return state.py;
    setStatus('statusPyLoading');
    showLoading('loadingPy', {});

    const candidates = vendorCandidates();
    let lastError = null;
    for (let ci = 0; ci < candidates.length && !state.py; ci++) {
        const base = candidates[ci];
        for (let attempt = 0; attempt < 2 && !state.py; attempt++) {
            try {
                state.py = await loadRuntimeFrom(base);
                writeVendorMemory(base === CDN_VENDOR ? 'cdn' : 'local');
            } catch (error) {
                lastError = error;
                console.warn(`runtime load failed from ${base} (attempt ${attempt + 1})`, error);
            }
        }
        if (!state.py && ci < candidates.length - 1) {
            setStatus('statusPyLoading');
            showLoading('loadingFallback', {});
        }
    }
    const py = state.py;
    if (!py) throw lastError || new Error(t('runtimeTimeout'));

    setStatus('statusUnpacking');
    showLoading('loadingUnpack');
    const zipUrls = [new URL('pyaep-libs.zip', activeVendorBase).href, LIBS_ZIP];
    let zipBuf = null;
    for (const url of new Set(zipUrls)) {
        try {
            zipBuf = await fetchWithProgress(url, (ratio) => setLoadingProgress(ratio));
            break;
        } catch (error) {
            console.warn('fetch py-aep libs failed:', url, error);
        }
    }
    if (!zipBuf) throw new Error(t('toastFailed', { msg: 'py-aep libs' }));
    await py.unpackArchive(new Uint8Array(zipBuf), 'zip', { extractDir: '/libs' });
    py.runPython("import sys; sys.path.insert(0, '/libs')");

    const code = await (await fetch(EXTRACT_PY)).text();
    py.runPython(code);
    hideLoading();
    return py;
}

async function extractFromAep() {
    const py = await ensurePyodide();
    setStatus('statusParsing');
    showLoading('loadingParse');
    py.FS.writeFile('/proj.aep', new Uint8Array(state.aepBytes));
    const json = py.runPython(
        "import json as _j\n_j.dumps(collect('/proj.aep'), ensure_ascii=False)"
    );
    return JSON.parse(json);
}

/* ============ 自动修复 ============ */

function applyAllFixes() {
    let count = 0;
    for (const row of state.rows) {
        if (!row.json || row.status !== 'pending') continue;
        const target = row.json.node.g;
        const arr = row.ae.k;
        if (target.k && typeof target.k === 'object' && !Array.isArray(target.k)) {
            target.k.k = arr;
        } else {
            target.k = arr;
        }
        target.p = row.ae.p;
        row.status = 'identical';
        count++;
    }
    state.appliedCount = count;
    return count;
}

/* ============ 修复前 / 修复后预览 ============ */

const PREVIEW = { before: null, after: null, playing: false, raf: null, frame: 0, total: 0, fps: 30, lastTs: 0 };

function updateTime() {
    const total = Math.max(0, Math.round(PREVIEW.total) - 1);
    $('time-display').textContent = `${Math.round(PREVIEW.frame)} / ${total}`;
}

function seek(frame) {
    PREVIEW.frame = frame;
    if (PREVIEW.before) PREVIEW.before.goToAndStop(frame, true);
    if (PREVIEW.after) PREVIEW.after.goToAndStop(frame, true);
    const denom = Math.max(1, PREVIEW.total - 1);
    $('timeline').value = String(Math.round((frame / denom) * 1000));
    updateTime();
}

// 用实心图标：lucide 的 play/pause 是描边，16px 下看起来像空心
const ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
const ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';

function updatePlayIcon() {
    const btn = $('play-btn');
    const key = PREVIEW.playing ? 'pause' : 'play';
    btn.innerHTML = PREVIEW.playing ? ICON_PAUSE : ICON_PLAY;
    btn.setAttribute('data-tip', t(key));
    btn.setAttribute('aria-label', t(key));
}

function stopPlay() {
    PREVIEW.playing = false;
    if (PREVIEW.raf) cancelAnimationFrame(PREVIEW.raf);
    PREVIEW.raf = null;
    updatePlayIcon();
}

function tickClient(ts) {
    if (!PREVIEW.playing) return;
    if (!PREVIEW.lastTs) PREVIEW.lastTs = ts;
    const dt = Math.min(0.1, (ts - PREVIEW.lastTs) / 1000);
    PREVIEW.lastTs = ts;
    PREVIEW.frame += dt * PREVIEW.fps;
    if (PREVIEW.frame >= PREVIEW.total - 1) PREVIEW.frame = 0;
    seek(PREVIEW.frame);
    PREVIEW.raf = requestAnimationFrame(tickClient);
}

function startPlay() {
    if (PREVIEW.playing || !PREVIEW.total) return;
    PREVIEW.playing = true;
    PREVIEW.lastTs = 0;
    updatePlayIcon();
    PREVIEW.raf = requestAnimationFrame(tickClient);
}

function emptyStageHtml() {
    return `<span class="bf-stage-empty">${escapeHtml(t('previewEmpty'))}</span>`;
}

function clearAnimations() {
    stopPlay();
    for (const key of ['before', 'after']) {
        const anim = PREVIEW[key];
        if (anim) {
            try { anim.destroy(); } catch (error) { /* 忽略 */ }
            PREVIEW[key] = null;
        }
    }
}

function destroyPreview() {
    clearAnimations();
    $('stage-before').innerHTML = emptyStageHtml();
    $('stage-after').innerHTML = emptyStageHtml();
    $('play-btn').disabled = true;
    $('timeline').disabled = true;
    PREVIEW.total = 0;
    PREVIEW.frame = 0;
    updateTime();
}

function mountAnimation(stage, data) {
    stage.innerHTML = '';
    return window.bodymovin.loadAnimation({
        container: stage,
        renderer: 'svg',
        loop: true,
        autoplay: false,
        animationData: JSON.parse(JSON.stringify(data)),
    });
}

function enableTransport(totalFrames, frameRate) {
    PREVIEW.total = Math.max(1, totalFrames || 1);
    PREVIEW.fps = frameRate || 30;
    $('play-btn').disabled = false;
    $('timeline').disabled = false;
}

/** 只渲染「修复前」：JSON 一上传就先给用户看到动画，不等解析 */
function renderBeforeOnly() {
    if (!window.bodymovin || !state.originalJson) return;
    destroyPreview();
    const stageBefore = $('stage-before');
    stageBefore.innerHTML = '';
    PREVIEW.before = mountAnimation(stageBefore, state.originalJson);
    enableTransport(PREVIEW.before.totalFrames, PREVIEW.before.frameRate);
    applyFocus(null);
    seek(0);
    startPlay();
}

function renderPreview() {
    destroyPreview();
    if (!window.bodymovin) {
        console.warn('lottie 未加载，跳过预览');
        return;
    }
    PREVIEW.before = mountAnimation($('stage-before'), state.originalJson);
    PREVIEW.after = mountAnimation($('stage-after'), state.jsonData);
    enableTransport(
        Math.min(PREVIEW.before.totalFrames || 1, PREVIEW.after.totalFrames || 1),
        PREVIEW.before.frameRate
    );
    applyFocus(null);
    seek(0);
    startPlay();
}

/* ============ 聚焦单个渐变 ============ */

const FOCUS_DIM = 0.18;

function gradientElements(container) {
    const svg = container.querySelector('svg');
    if (!svg) return null;
    const defs = [...svg.querySelectorAll('defs linearGradient, defs radialGradient')];
    const ids = new Map(defs.map((node, index) => [node.id, index]));
    const shapes = [...svg.querySelectorAll('[fill], [stroke]')].filter(
        (node) => !node.closest('defs')
    );
    return { svg, ids, shapes };
}

/** 只高亮第 index 个渐变，其余压暗；index 为 null 时恢复 */
function applyFocus(index) {
    for (const key of ['before', 'after']) {
        const anim = PREVIEW[key];
        const container = key === 'before' ? $('stage-before') : $('stage-after');
        if (!anim || !container) continue;
        const info = gradientElements(container);
        if (!info) continue;
        for (const shape of info.shapes) {
            const refs = [];
            for (const attr of ['fill', 'stroke']) {
                const value = shape.getAttribute(attr) || '';
                const match = value.match(/url\(["']?#([^"')]+)/);
                if (match && info.ids.has(match[1])) refs.push(info.ids.get(match[1]));
            }
            if (index === null) {
                shape.style.opacity = '';
            } else if (!refs.length) {
                shape.style.opacity = String(FOCUS_DIM);
            } else {
                shape.style.opacity = refs.includes(index) ? '' : String(FOCUS_DIM);
            }
        }
    }
}

function buildFocusSelect() {
    const host = $('summary');
    const gradients = state.jsonGradients;
    if (!host || gradients.length < 2) {
        const existing = $('focus-select');
        if (existing) existing.closest('.bf-focus').remove();
        return;
    }
    let wrap = host.querySelector('.bf-focus');
    if (!wrap) {
        wrap = document.createElement('label');
        wrap.className = 'bf-focus';
        host.appendChild(wrap);
    }
    wrap.innerHTML = `<span>${escapeHtml(t('focusLabel'))}</span>`;
    const select = document.createElement('select');
    select.id = 'focus-select';
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = t('focusAll');
    select.appendChild(allOption);
    gradients.forEach((gradient, index) => {
        const option = document.createElement('option');
        option.value = String(index);
        option.textContent = t('focusOption', {
            n: index + 1,
            name: gradient.node.nm || '(gradient)',
        });
        select.appendChild(option);
    });
    select.addEventListener('change', () => {
        const value = select.value === '' ? null : Number(select.value);
        applyFocus(value);
    });
    wrap.appendChild(select);
}

/* ============ 摘要 / 未处理项 ============ */

const SKIP_REASON = {
    keyframed: 'reasonKeyframed',
    missing: 'reasonMissing',
    extra: 'reasonExtra',
    noarray: 'reasonNoArray',
};

function skippedRows() {
    return state.rows.filter((row) => SKIP_REASON[row.status]);
}

function renderSkipList() {
    const rows = skippedRows();
    $('skip-list').innerHTML = rows.map((row) => {
        const path = row.ae ? row.ae.path : row.json.path;
        return `<div><code>${escapeHtml(path.join(' / '))}</code> · ${t(SKIP_REASON[row.status])}</div>`;
    }).join('');
}

function showModal(id) {
    const modal = $(id);
    modal.classList.remove('hidden');
    requestAnimationFrame(() => modal.classList.add('is-open'));
}

function closeModal(id) {
    const modal = $(id);
    modal.classList.remove('is-open');
    setTimeout(() => modal.classList.add('hidden'), 180);
}

function openSkipModal() {
    renderSkipList();
    showModal('skip-modal');
}

function renderSummary() {
    const host = $('summary');
    const skipped = skippedRows();
    const byName = state.rows.filter((row) => row.matchMode === 'name').length;
    const parts = [
        `<span>${state.appliedCount ? t('summaryFixed', { n: state.appliedCount }) : t('summaryNothing')}</span>`,
    ];
    if (byName) {
        parts.push(`<span class="badge badge--outline">${t('summaryMatchedByName', { n: byName })}</span>`);
    }
    if (skipped.length) {
        parts.push(`<button class="btn btn-ghost" id="skip-btn"><i data-lucide="alert-triangle"></i>${t('summarySkipped', { n: skipped.length })}</button>`);
    }
    host.innerHTML = parts.join('');
    const skipBtn = $('skip-btn');
    if (skipBtn) skipBtn.addEventListener('click', openSkipModal);

    const badge = $('fixed-count');
    if (state.appliedCount) {
        badge.hidden = false;
        badge.textContent = `+${state.appliedCount}`;
    } else {
        badge.hidden = true;
        badge.textContent = '';
    }
    refreshIcons();
}

/* ============ 主流程 ============ */

async function runCompare() {
    if (!state.jsonData || !state.aepBytes) return;
    const btn = $('parse-btn');
    const label = btn.querySelector('span');
    const originalLabel = label.textContent;
    btn.disabled = true;
    label.textContent = t('statusParsing');
    const startedAt = performance.now();
    try {
        const aeGradients = await extractFromAep();
        state.jsonGradients = collectJsonGradients(state.jsonData);
        const jsonGradients = state.jsonGradients;
        state.rows = matchGradients(aeGradients, jsonGradients);
        const fixed = applyAllFixes();

        $('download-btn').disabled = fixed === 0;
        renderSummary();
        renderPreview();
        buildFocusSelect();
        setStatus('statusDone', { ms: Math.round(performance.now() - startedAt) });
        toast(fixed ? t('toastApplied', { n: fixed }) : t('toastNothing'), fixed ? 'success' : 'info');
    } catch (error) {
        console.error(error);
        setStatus('statusFailed', { msg: error.message });
        toast(t('toastFailed', { msg: error.message }), 'error');
    } finally {
        hideLoading();
        btn.disabled = false;
        label.textContent = originalLabel;
        refreshIcons();
    }
}

function downloadJson() {
    const name = (state.jsonName || 'animation').replace(/\.json$/i, '');
    const blob = new Blob([JSON.stringify(state.jsonData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}-fixed.json`;
    a.click();
    URL.revokeObjectURL(url);
}

/* ============ 文件选择 ============ */

function bindDrop(zoneId, inputId, nameId, onFile) {
    const zone = $(zoneId);
    const input = $(inputId);
    const nameEl = $(nameId);

    async function take(file) {
        if (!file) return;
        try {
            await onFile(file);
        } catch (error) {
            toast(t('toastFailed', { msg: error.message }), 'error');
            return;
        }
        zone.classList.add('is-ready');
        nameEl.innerHTML = `<i data-lucide="file-check-2"></i> ${escapeHtml(file.name)}`;
        refreshIcons();
        $('parse-btn').disabled = !(state.jsonData && state.aepBytes);
        if (state.jsonData && state.aepBytes) setStatus('statusReady');
        else setStatus('statusNeedOther');
    }

    input.addEventListener('change', (event) => take(event.target.files[0]));

    ['dragenter', 'dragover'].forEach((type) => zone.addEventListener(type, (event) => {
        event.preventDefault();
        zone.classList.add('is-drag');
    }));
    ['dragleave', 'drop'].forEach((type) => zone.addEventListener(type, (event) => {
        event.preventDefault();
        zone.classList.remove('is-drag');
    }));
    zone.addEventListener('drop', (event) => {
        take(event.dataTransfer && event.dataTransfer.files[0]);
    });
}

/* ============ 初始化 ============ */

function boot() {
    applyStaticText();
    destroyPreview();

    bindDrop('drop-json', 'json-file', 'json-name', async (file) => {
        const text = await file.text();
        const parsed = JSON.parse(text.replace(/^\ufeff/, ''));
        state.jsonData = parsed;
        state.originalJson = JSON.parse(JSON.stringify(parsed));
        state.jsonName = file.name;

        // 换文件后先把上一次的修复结果清掉，避免看到旧结论
        state.rows = [];
        state.appliedCount = 0;
        state.jsonGradients = collectJsonGradients(parsed);
        $('summary').innerHTML = '';
        $('download-btn').disabled = true;
        $('fixed-count').hidden = true;

        // 不等解析，先把「修复前」画出来
        renderBeforeOnly();
        buildFocusSelect();
    });

    bindDrop('drop-aep', 'aep-file', 'aep-name', async (file) => {
        state.aepBytes = await file.arrayBuffer();
        state.aepName = file.name;
    });

    $('parse-btn').addEventListener('click', runCompare);
    $('download-btn').addEventListener('click', downloadJson);

    $('play-btn').addEventListener('click', () => {
        if (PREVIEW.playing) stopPlay();
        else startPlay();
    });
    $('timeline').addEventListener('input', (event) => {
        const denom = Math.max(1, PREVIEW.total - 1);
        const frame = (Number(event.target.value) / 1000) * denom;
        stopPlay();
        seek(frame);
    });

    $('help-btn').addEventListener('click', () => showModal('help-modal'));
    $('help-modal').querySelectorAll('[data-close]').forEach((el) => {
        el.addEventListener('click', () => closeModal('help-modal'));
    });
    $('skip-modal').querySelectorAll('[data-close]').forEach((el) => {
        el.addEventListener('click', () => closeModal('skip-modal'));
    });
    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        for (const id of ['help-modal', 'skip-modal']) {
            const modal = document.getElementById(id);
            if (modal.classList.contains('is-open')) closeModal(id);
        }
    });

    $('lang-btn').addEventListener('click', () => {
        currentLang = currentLang === 'zh' ? 'en' : 'zh';
        localStorage.setItem('lottie-lang', currentLang);
        applyStaticText();
        setStatus(state.status.key, state.status.params);
        if (state.rows.length) {
            renderSummary();
            if (document.getElementById('skip-modal').classList.contains('is-open')) renderSkipList();
        }
        if (state.jsonGradients.length >= 2) buildFocusSelect();
        if (PREVIEW.before) updatePlayIcon();
        else destroyPreview();
    });

    $('theme-btn').addEventListener('click', () => {
        const dark = document.documentElement.classList.toggle('dark');
        try { localStorage.setItem('lottie-theme', dark ? 'dark' : 'light'); } catch (e) {}
    });

    refreshIcons();
}

window.__backfillState = state;
window.__backfillPreview = PREVIEW;
boot();
