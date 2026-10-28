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

const i18n = {
    zh: {
        backfill: '渐变回填',
        help: '说明',
        theme: '切换主题',
        backToEditor: '编辑器',
        jsonTitle: 'Lottie JSON',
        aepTitle: 'AE 工程',
        pickFile: '选择文件',
        parse: '解析并比对',
        statusPick: '选择两个文件',
        statusReady: '文件就绪',
        statusNeedOther: '还需要选择另一个文件',
        statusPyLoading: '正在加载 Python 运行时（首次约 13 MB）…',
        statusUnpacking: '正在解包 py-aep 依赖…',
        statusParsing: '正在解析 .aep…',
        statusDone: '完成 · 耗时 {ms} ms',
        loadingTitle: '正在准备运行环境',
        loadingHint: '首次加载约 15 MB，之后走浏览器缓存',
        loadingPy: '加载 Python 运行时',
        loadingUnpack: '解包 py-aep 依赖',
        loadingParse: '解析工程文件',
        loadingElapsed: '{s} 秒',
        loadingMB: '已下载 {got} MB',
        runtimeTimeout: '运行时加载超时，请刷新重试',
        statusFailed: '解析失败：{msg}',
        onlyPending: '只看待修正',
        showAll: '显示全部',
        apply: '应用勾选项',
        applyWithCount: '应用勾选项（{n}）',
        exportJson: '导出 JSON',
        reportTitle: '比对报告',
        thGradient: '渐变',
        thType: '类型',
        thAE: 'AE 真值',
        thJSON: '当前 JSON',
        thStatus: '状态',
        stPending: '待修正',
        stIdentical: '一致',
        stKeyframed: '关键帧 · 跳过',
        stNoArray: '无法解析',
        stMissing: 'JSON 中缺失',
        stExtra: 'JSON 多出',
        typeFill: '填充',
        typeStroke: '描边',
        badgeNameMatch: '按名匹配',
        stops: '{c} 色标',
        stopsWithAlpha: '{c} 色标 · {a} 透明度',
        keyframedShort: '（关键帧）',
        applied: '已回填 {n} 个渐变，共 {total} 个',
        nothingSelected: '没有勾选可应用的项',
        emptyNoData: '还没有数据',
        emptyAllMatch: '两侧渐变已经一致，没有需要回填的项。',
        toastAllMatch: '两侧渐变已经一致',
        toastApplied: '已回填 {n} 个渐变',
        toastFailed: '解析失败：{msg}',
        helpTitle: '关于渐变回填',
        helpDesc: '从 .aep 读取真实色标',
        help1Title: '它做什么',
        help1Body: '把 After Effects 工程里真实存在的渐变（色标位置、颜色、透明度）读出来，与你手上的 Lottie JSON 比对。你确认之后，才把工程里的值回填进 JSON。文件不会上传，解析全部在本机浏览器里完成。',
        help2Title: '匹配规则',
        help2Body: '先按「合成 / 图层 / 组 / 渐变名」完整路径精确匹配；路径对不上时退回「同名 + 出现顺序」匹配，并在类型列标注「按名匹配」。两侧数量不一致时，摘要里会分别列出「JSON 缺失」与「JSON 多出」。',
        help3Title: '不会处理的情况',
        help3Body: '关键帧渐变只提示、不回填；JSON 里缺失的渐变不会凭空插入；工程未存盘时无法解析。'
    },
    en: {
        backfill: 'Gradient backfill',
        help: 'Help',
        theme: 'Toggle theme',
        backToEditor: 'Editor',
        jsonTitle: 'Lottie JSON',
        aepTitle: 'AE project',
        pickFile: 'Choose file',
        parse: 'Parse and compare',
        statusPick: 'Choose two files',
        statusReady: 'Files ready',
        statusNeedOther: 'Pick the other file too',
        statusPyLoading: 'Loading Python runtime (about 13 MB on first run)…',
        statusUnpacking: 'Unpacking py-aep…',
        statusParsing: 'Parsing .aep…',
        statusDone: 'Done · {ms} ms',
        loadingTitle: 'Preparing runtime',
        loadingHint: 'About 15 MB on first run, cached afterwards',
        loadingPy: 'Loading Python runtime',
        loadingUnpack: 'Unpacking py-aep',
        loadingParse: 'Parsing project',
        loadingElapsed: '{s}s',
        loadingMB: '{got} MB downloaded',
        runtimeTimeout: 'Runtime loading timed out; please reload',
        statusFailed: 'Failed: {msg}',
        onlyPending: 'Only pending',
        showAll: 'Show all',
        apply: 'Apply selected',
        applyWithCount: 'Apply selected ({n})',
        exportJson: 'Export JSON',
        reportTitle: 'Comparison',
        thGradient: 'Gradient',
        thType: 'Type',
        thAE: 'From AE',
        thJSON: 'Current JSON',
        thStatus: 'Status',
        stPending: 'To fix',
        stIdentical: 'Matched',
        stKeyframed: 'Keyframed · skipped',
        stNoArray: 'Unreadable',
        stMissing: 'Missing in JSON',
        stExtra: 'Extra in JSON',
        typeFill: 'Fill',
        typeStroke: 'Stroke',
        badgeNameMatch: 'matched by name',
        stops: '{c} stops',
        stopsWithAlpha: '{c} stops · {a} alpha',
        keyframedShort: '(keyframed)',
        applied: 'Applied {n} gradients ({total} total)',
        nothingSelected: 'Nothing selected',
        emptyNoData: 'No data yet',
        emptyAllMatch: 'All gradients already match.',
        toastAllMatch: 'All gradients already match',
        toastApplied: 'Applied {n} gradients',
        toastFailed: 'Failed: {msg}',
        helpTitle: 'About gradient backfill',
        helpDesc: 'Read real stops from .aep',
        help1Title: 'What it does',
        help1Body: 'Reads the gradients that really exist in the After Effects project (stop positions, colors, alpha) and compares them with your Lottie JSON. Nothing is written back until you confirm. Files never leave your machine — parsing happens in the browser.',
        help2Title: 'Matching',
        help2Body: 'First an exact match on the full "comp / layer / group / gradient" path; if that fails it falls back to "same name + occurrence order" and marks the row "matched by name". When the two sides differ in count, the summary lists "missing in JSON" and "extra in JSON".',
        help3Title: 'Not handled',
        help3Body: 'Keyframed gradients are reported but never written; gradients missing from the JSON are never inserted; an unsaved .aep cannot be parsed.'
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
    jsonData: null,
    jsonName: '',
    aepBytes: null,
    aepName: '',
    py: null,
    rows: [],
    showIdentical: true,
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

const RUNTIME_TIMEOUT_MS = 90000;
const ASSET_TIMEOUT_MS = 30000;
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

/** 下载单个资源，带字节进度与 30s 超时（避免网络卡住时无限等） */
async function downloadAsset(url, onBytes) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ASSET_TIMEOUT_MS);
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
        return merged;
    } finally {
        clearTimeout(timer);
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

/* ============ 渲染 ============ */

const STATUS_KEY = {
    identical: 'stIdentical',
    pending: 'stPending',
    keyframed: 'stKeyframed',
    noarray: 'stNoArray',
    missing: 'stMissing',
    extra: 'stExtra',
};

const STATUS_CLASS = {
    identical: 'badge--outline',
    pending: 'badge--warn',
    keyframed: 'badge--outline',
    noarray: 'badge--outline',
    missing: 'badge--warn',
    extra: 'badge--outline',
};

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
}

function renderSummary() {
    const counts = state.rows.reduce((acc, row) => {
        acc[row.status] = (acc[row.status] || 0) + 1;
        return acc;
    }, {});
    const items = [['stPending', counts.pending || 0]];
    if (counts.identical) items.push(['stIdentical', counts.identical]);
    if (counts.missing) items.push(['stMissing', counts.missing]);
    if (counts.extra) items.push(['stExtra', counts.extra]);
    if (counts.keyframed) items.push(['stKeyframed', counts.keyframed]);
    $('summary').innerHTML = items
        .map(([key, value]) => `<span class="badge badge--outline">${t(key)} <strong>${value}</strong></span>`)
        .join('');
}

function pathHtml(row) {
    const path = row.ae ? row.ae.path : row.json.path;
    const name = path[path.length - 1];
    const dir = path.slice(0, -1).join(' / ');
    return `<div class="bf-path"><span class="nm">${escapeHtml(name)}</span><span class="dir">${escapeHtml(dir)}</span></div>`;
}

function renderRows() {
    const body = $('report-body');
    const rows = state.showIdentical
        ? state.rows
        : state.rows.filter((row) => row.status !== 'identical');
    $('row-count').textContent = String(rows.length);

    if (!rows.length) {
        const message = state.rows.length ? t('emptyAllMatch') : t('emptyNoData');
        body.innerHTML = `<tr><td colspan="6" class="bf-empty">${escapeHtml(message)}</td></tr>`;
        return;
    }

    body.innerHTML = rows.map((row) => {
        const statusText = t(STATUS_KEY[row.status] || 'stPending');
        const statusClass = STATUS_CLASS[row.status] || 'badge--warn';
        const aeCell = row.ae
            ? `<div class="bf-swatch" style="background:${gradientCss(row.ae.k, row.ae.p)}"></div>
               <div class="bf-stops">${escapeHtml(stopsText(row.ae.k, row.ae.p))}</div>`
            : '<span class="bf-stops">—</span>';
        const jsonCell = row.json && row.jsonArr
            ? `<div class="bf-swatch" style="background:${gradientCss(row.jsonArr, row.jsonP)}"></div>
               <div class="bf-stops">${escapeHtml(stopsText(row.jsonArr, row.jsonP))}</div>`
            : `<span class="bf-stops">${row.json ? escapeHtml(t('keyframedShort')) : '—'}</span>`;
        const typeRaw = row.ae ? row.ae.ty : (row.json.node.ty || '');
        const typeLabel = typeRaw === 'gf' ? t('typeFill') : (typeRaw === 'gs' ? t('typeStroke') : typeRaw);
        const nameHint = row.matchMode === 'name'
            ? ` <span class="badge badge--outline">${t('badgeNameMatch')}</span>`
            : '';
        const canCheck = !!row.json && row.status === 'pending';
        return `
        <tr class="is-${row.status}" data-idx="${state.rows.indexOf(row)}">
            <td><input type="checkbox" class="row-check" ${row.checked ? 'checked' : ''} ${canCheck ? '' : 'disabled'}></td>
            <td>${pathHtml(row)}</td>
            <td><code>${escapeHtml(typeLabel)} · ${escapeHtml(typeRaw)}</code>${nameHint}</td>
            <td>${aeCell}</td>
            <td>${jsonCell}</td>
            <td data-status><span class="badge ${statusClass}">${statusText}</span></td>
        </tr>`;
    }).join('');

    body.querySelectorAll('.row-check').forEach((box) => {
        box.addEventListener('change', (event) => {
            const idx = Number(event.target.closest('tr').dataset.idx);
            state.rows[idx].checked = event.target.checked;
            updateApplyButton();
        });
    });
}

function setApplyStatus(text) {
    $('apply-status').textContent = text;
    $('panel-foot').classList.toggle('is-visible', !!text);
}

function updateApplyButton() {
    const count = state.rows.filter((row) => row.checked && row.json && row.status === 'pending').length;
    const btn = $('apply-btn');
    btn.disabled = count === 0;
    btn.querySelector('span').textContent = count ? t('applyWithCount', { n: count }) : t('apply');
}

/* ============ Pyodide ============ */

/** 快速探测某个来源是否可用（避免回退时被浏览器超时拖住） */
async function probeVendor(base, timeoutMs = 2500) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(new URL('pyodide/pyodide.esm.js', base).href, {
            method: 'HEAD',
            signal: controller.signal,
        });
        return response.ok;
    } catch (error) {
        return false;
    } finally {
        clearTimeout(timer);
    }
}

async function pickVendorBase() {
    if (FORCE_LOCAL) return LOCAL_VENDOR;
    const remembered = localStorage.getItem('backfill-vendor');
    const order = remembered === 'local'
        ? [LOCAL_VENDOR, CDN_VENDOR]
        : [CDN_VENDOR, LOCAL_VENDOR];
    for (const base of order) {
        if (await probeVendor(base)) return base;
    }
    return LOCAL_VENDOR;
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

    const base = await pickVendorBase();
    let py;
    try {
        py = await loadRuntimeFrom(base);
        localStorage.setItem('backfill-vendor', base === CDN_VENDOR ? 'cdn' : 'local');
    } catch (error) {
        if (base === LOCAL_VENDOR) throw error;
        console.warn('CDN runtime failed, falling back to same-origin', error);
        showLoading('loadingPy', {});
        py = await loadRuntimeFrom(LOCAL_VENDOR);
    }

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
    state.py = py;
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
        const jsonGradients = collectJsonGradients(state.jsonData);
        state.rows = matchGradients(aeGradients, jsonGradients);
        state.appliedCount = 0;
        setApplyStatus('');
        $('download-btn').disabled = true;
        renderSummary();
        renderRows();
        updateApplyButton();
        setStatus('statusDone', { ms: Math.round(performance.now() - startedAt) });
        if (!state.rows.some((row) => row.status === 'pending')) toast(t('toastAllMatch'), 'success');
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

function applyChecked() {
    let count = 0;
    for (const row of state.rows) {
        if (!row.checked || !row.json || row.status !== 'pending') continue;
        const target = row.json.node.g;
        const arr = row.ae.k;
        if (target.k && typeof target.k === 'object' && !Array.isArray(target.k)) {
            target.k.k = arr;
        } else {
            target.k = arr;
        }
        target.p = row.ae.p;
        row.jsonArr = arr;
        row.jsonP = row.ae.p;
        row.status = 'identical';
        row.checked = false;
        count++;
    }
    state.appliedCount += count;
    renderSummary();
    renderRows();
    updateApplyButton();
    $('download-btn').disabled = count === 0 && state.appliedCount === 0;
    setApplyStatus(count ? t('applied', { n: count, total: state.appliedCount }) : t('nothingSelected'));
    if (count) toast(t('toastApplied', { n: count }), 'success');
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

    bindDrop('drop-json', 'json-file', 'json-name', async (file) => {
        const text = await file.text();
        state.jsonData = JSON.parse(text.replace(/^\ufeff/, ''));
        state.jsonName = file.name;
    });

    bindDrop('drop-aep', 'aep-file', 'aep-name', async (file) => {
        state.aepBytes = await file.arrayBuffer();
        state.aepName = file.name;
    });

    $('parse-btn').addEventListener('click', runCompare);
    $('apply-btn').addEventListener('click', applyChecked);
    $('download-btn').addEventListener('click', downloadJson);

    const toggleBtn = $('toggle-identical');
    const syncToggleLabel = () => {
        toggleBtn.textContent = state.showIdentical ? t('onlyPending') : t('showAll');
    };
    syncToggleLabel();
    toggleBtn.addEventListener('click', () => {
        state.showIdentical = !state.showIdentical;
        syncToggleLabel();
        renderRows();
    });

    const helpModal = $('help-modal');
    const openHelp = () => {
        helpModal.classList.remove('hidden');
        requestAnimationFrame(() => helpModal.classList.add('is-open'));
    };
    const closeHelp = () => {
        helpModal.classList.remove('is-open');
        setTimeout(() => helpModal.classList.add('hidden'), 180);
    };
    $('help-btn').addEventListener('click', openHelp);
    helpModal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeHelp));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && helpModal.classList.contains('is-open')) closeHelp();
    });

    $('lang-btn').addEventListener('click', () => {
        currentLang = currentLang === 'zh' ? 'en' : 'zh';
        localStorage.setItem('lottie-lang', currentLang);
        applyStaticText();
        syncToggleLabel();
        setStatus(state.status.key, state.status.params);
        if (state.rows.length) {
            renderSummary();
            renderRows();
            updateApplyButton();
        }
    });

    $('theme-btn').addEventListener('click', () => {
        const dark = document.documentElement.classList.toggle('dark');
        try { localStorage.setItem('lottie-theme', dark ? 'dark' : 'light'); } catch (e) {}
    });

    refreshIcons();
}

window.__backfillState = state;
boot();
