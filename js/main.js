// Lottie Gradient Editor - Main JavaScript

// ========== 国际化 (i18n) ==========
const i18n = {
    zh: {
        help: '帮助',
        noFileSelected: '未选择文件',
        importJson: '导入 JSON',
        exportJson: '导出 JSON',
        syncGradient: '同步渐变',
        animationPreview: '动画预览',
        background: '背景',
        dropZoneTitle: '拖拽 JSON 文件到此处',
        dropZoneSubtitle: '或点击上方"导入 JSON"按钮',
        gradientList: '渐变列表',
        searchGradient: '搜索渐变...',
        uploadToSeeGradients: '上传 JSON 文件以查看渐变',
        noGradientSelected: '未选择渐变',
        clickGradientToEdit: '点击左侧渐变开始编辑',
        backgroundProblem: '背景问题',
        backgroundProblemDesc: '在使用 After Effects 配合 Bodymovin 插件导出 Lottie 动画时，经常会遇到<strong>渐变色丢失</strong>的问题：渐变色变成黑白或纯色、透明度信息丢失、颜色位置偏移。本工具专为解决此问题而生。',
        features: '功能特性',
        jsonImport: 'JSON 导入',
        dragOrClick: '拖拽或点击上传',
        animationPreview2: '动画预览',
        realtimePlayback: '实时播放与进度控制',
        gradientEdit: '渐变编辑',
        visualAdjust: '可视化调整颜色和透明度',
        gradientSync: '渐变同步',
        batchApply: '批量应用到其他动画',
        quickStart: '快速开始',
        step1: '点击「导入 JSON」上传 Lottie 动画文件',
        step2: '点击「渐变列表」中需要修改的渐变项',
        step3: '在右侧编辑器中调整颜色、位置、透明度',
        step4: '点击「导出 JSON」保存修复后的文件',
        tips: '使用技巧',
        tip1: '点击「背景」按钮可切换透明棋盘格，方便查看透明动画',
        tip2: '「同步渐变」功能可将一个动画的渐变配置批量应用到其他动画',
        gotIt: '知道了',
        subtitle: '渐变色编辑器',
        enableAlpha: '启用透明度',
        addStop: '添加色标',
        addAlphaStop: '添加透明度色标',
        colorStops: '颜色色标',
        alphaStopsLabel: '透明度色标',
        position: '位置',
        alpha: '透明度',
        noGradientsFound: 'JSON 文件中未找到渐变',
        noJsonUploaded: '上传 JSON 文件以查看渐变',
        selectToEdit: '点击左侧渐变开始编辑',
        gradientEditor: '渐变编辑器',
        unnamedGradient: '未命名渐变',
        keyframedBadge: '关键帧',
        animatedGradientNotice: '该渐变包含关键帧动画，暂不支持可视化编辑；本工具不会修改它',
        minStopsWarning: '至少需要保留 2 个色标',
        invalidFileType: '仅支持 .json 文件',
        alertNoContent: '没有可导出的内容',
        alertNoAnimation: '请先导入动画 JSON 文件',
        alertNoGradient: '未在文件中找到渐变数据',
        alertInvalidJson: '无效的 JSON 文件',
        syncSuccess: '成功同步 {count} 个渐变',
        syncFailed: '同步渐变失败',
        exportFailed: '导出失败',
        exportFrame: '导出帧',
        exportGif: '导出 GIF',
        exportGifDesc: '将 Lottie 动画导出为 GIF 格式',
        exportGifDone: 'GIF 已导出',
        fps: '帧率 (FPS)',
        scale: '缩放比例',
        startFrame: '起始帧',
        endFrame: '结束帧',
        quality: '质量',
        qualityTip: '数值越小质量越好，文件越大',
        exporting: '导出中...',
        cancel: '取消',
        startExport: '开始导出',
        exportGifFailed: '导出 GIF 失败',
        noAnimationForGif: '请先导入动画再导出 GIF',
        demoVideo: '使用演示',
        videoTutorial: '视频教程',
        aboutTool: '关于本工具',
        aboutAuthor: '关于我',
        gradientPreview: '渐变预览',
        stops: '色标',
        color: '颜色',
        opacity: '不透明度',
        supportBodymovin: '支持 Bodymovin 导出的 .json 文件',
        hintDrag: '颜色色标与透明度色标相互独立：拖动圆点调整位置，也可直接输入数值。',
        alphaOffHint: '开启后可为透明度单独添加色标',
        themeDark: '切换为深色主题',
        themeLight: '切换为浅色主题',
        alphaChannel: '透明度色标',
        removeStop: '删除色标'
    },
    en: {
        help: 'Help',
        noFileSelected: 'No file selected',
        importJson: 'Import JSON',
        exportJson: 'Export JSON',
        syncGradient: 'Sync Gradient',
        animationPreview: 'Animation Preview',
        background: 'Background',
        dropZoneTitle: 'Drop JSON file here',
        dropZoneSubtitle: 'Or click "Import JSON" button above',
        gradientList: 'Gradient List',
        searchGradient: 'Search gradients...',
        uploadToSeeGradients: 'Upload JSON file to view gradients',
        noGradientSelected: 'No gradient selected',
        clickGradientToEdit: 'Click a gradient on the left to start editing',
        backgroundProblem: 'Background',
        backgroundProblemDesc: 'When exporting Lottie animations from After Effects using the Bodymovin plugin, <strong>gradient colors are often lost</strong>: gradients turn black/white or solid colors, transparency information is lost, and color positions are offset. This tool is designed to solve these issues.',
        features: 'Features',
        jsonImport: 'JSON Import',
        dragOrClick: 'Drag or click to upload',
        animationPreview2: 'Animation Preview',
        realtimePlayback: 'Real-time playback with progress control',
        gradientEdit: 'Gradient Edit',
        visualAdjust: 'Visually adjust colors and transparency',
        gradientSync: 'Gradient Sync',
        batchApply: 'Batch apply to other animations',
        quickStart: 'Quick Start',
        step1: 'Click "Import JSON" to upload a Lottie animation file',
        step2: 'Click a gradient in the "Gradient List" to modify',
        step3: 'Adjust colors, positions, and transparency in the editor',
        step4: 'Click "Export JSON" to save the fixed file',
        tips: 'Tips',
        tip1: 'Click the "Background" button to toggle the transparency checkerboard',
        tip2: 'The "Sync Gradient" feature can batch apply gradient configurations from one animation to others',
        gotIt: 'Got it',
        subtitle: 'Gradient Editor',
        enableAlpha: 'Enable Alpha',
        addStop: 'Add Color Stop',
        addAlphaStop: 'Add Alpha Stop',
        colorStops: 'Color Stops',
        alphaStopsLabel: 'Alpha Stops',
        position: 'Position',
        alpha: 'Alpha',
        noGradientsFound: 'No gradients found in JSON file',
        noJsonUploaded: 'Upload JSON file to view gradients',
        selectToEdit: 'Click a gradient on the left to start editing',
        gradientEditor: 'Gradient Editor',
        unnamedGradient: 'Unnamed Gradient',
        keyframedBadge: 'animated',
        animatedGradientNotice: 'This gradient is keyframe-animated and cannot be edited visually yet; it will be left untouched',
        minStopsWarning: 'At least 2 stops are required',
        invalidFileType: 'Only .json files are supported',
        alertNoContent: 'No content to export',
        alertNoAnimation: 'Please import animation JSON file first',
        alertNoGradient: 'No gradient data found in file',
        alertInvalidJson: 'Invalid JSON file',
        syncSuccess: 'Successfully synced {count} gradients',
        syncFailed: 'Failed to sync gradients',
        exportFailed: 'Export failed',
        exportFrame: 'Export Frame',
        exportGif: 'Export GIF',
        exportGifDesc: 'Export Lottie animation as GIF',
        exportGifDone: 'GIF exported',
        fps: 'FPS',
        scale: 'Scale',
        startFrame: 'Start Frame',
        endFrame: 'End Frame',
        quality: 'Quality',
        qualityTip: 'Lower value = better quality, larger file',
        exporting: 'Exporting...',
        cancel: 'Cancel',
        startExport: 'Start Export',
        exportGifFailed: 'Export GIF failed',
        noAnimationForGif: 'Please import an animation first',
        demoVideo: 'Demo',
        videoTutorial: 'Video Tutorial',
        aboutTool: 'About This Tool',
        aboutAuthor: 'About Me',
        gradientPreview: 'Gradient Preview',
        stops: 'Stops',
        color: 'Color',
        opacity: 'Opacity',
        supportBodymovin: 'Supports .json files exported by Bodymovin',
        hintDrag: 'Color stops and alpha stops are independent: drag the handles or type exact values.',
        alphaOffHint: 'Enable alpha to add independent alpha stops',
        themeDark: 'Switch to dark theme',
        themeLight: 'Switch to light theme',
        alphaChannel: 'Alpha Stops',
        removeStop: 'Remove stop'
    }
};

let currentLang = localStorage.getItem('lottie-lang') || 'zh';

function t(key, params = {}) {
    let text = i18n[currentLang][key] || i18n['zh'][key] || key;
    Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param]);
    });
    return text;
}

function updateLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lottie-lang', lang);
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

    const langText = document.getElementById('lang-text');
    if (langText) {
        langText.textContent = lang === 'zh' ? 'EN' : '中文';
    }

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const val = i18n[lang][key];
        if (!val) return;
        if (val.includes('<')) el.innerHTML = val;
        else el.textContent = val;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (i18n[lang][key]) {
            el.placeholder = i18n[lang][key];
        }
    });

    refreshDynamicTexts();

    const themeBtnEl = document.getElementById('theme-btn');
    if (themeBtnEl) {
        const dark = document.documentElement.classList.contains('dark');
        const label = i18n[lang][dark ? 'themeLight' : 'themeDark'];
        themeBtnEl.setAttribute('aria-label', label);
        themeBtnEl.setAttribute('data-tip', label);
    }
}

// 更新由 JS 动态生成的文案（工具提示、列表、编辑器）
function refreshDynamicTexts() {
    const frameBtn = document.getElementById('export-frame-btn');
    if (frameBtn) frameBtn.title = t('exportFrame');
    const gifBtn = document.getElementById('export-gif-btn');
    if (gifBtn) gifBtn.title = t('exportGif');

    if (!currentJsonData) {
        renderListEmptyState();
        renderEditorEmptyState();
    } else {
        updateGradientNamesList();
        renderEditorForSelection();
    }
}

function toggleLanguage() {
    updateLanguage(currentLang === 'zh' ? 'en' : 'zh');
}

// ========== 通用工具 ==========

function truncate_float(num) { return Math.round(num * 1000) / 1000; }

function clamp01(v) {
    v = Number(v);
    if (!isFinite(v)) return 0;
    return Math.min(1, Math.max(0, v));
}

function color_lottie_to_hex(rgb) {
    const c = v => Math.round(clamp01(v) * 255).toString(16).padStart(2, '0');
    return `#${c(rgb[0])}${c(rgb[1])}${c(rgb[2])}`;
}

function color_hex_to_lottie(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
}

// 通过 replacer 控制数字精度，不会误伤字符串里的数字
function compressJson(obj, precision = 3) {
    const factor = Math.pow(10, precision);
    return JSON.stringify(obj, (key, value) =>
        typeof value === 'number' && isFinite(value) ? Math.round(value * factor) / factor : value
    );
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// 非阻塞的提示（替代 alert）
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    void toast.offsetHeight; // 强制 reflow，保证过渡动画触发（不依赖 rAF，后台标签页也可靠）
    toast.classList.add('toast-show');
    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ========== 渐变数据模型 ==========
// Lottie 渐变 k 数组 = 颜色色标 (offset,r,g,b) × p 个，之后是透明度色标 (offset,alpha) 对，
// 透明度色标数量可以与颜色色标不同，两者相互独立。

// 解包 g.k，返回静态数组或标记为关键帧动画
function unwrapGradientK(g) {
    if (!g || !g.k) return { arr: null, keyframed: false };
    let raw = g.k;
    if (typeof raw === 'object' && !Array.isArray(raw) && 'k' in raw) {
        if (raw.a === 1) return { arr: null, keyframed: true };
        raw = raw.k;
    }
    if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'object') {
        return { arr: null, keyframed: true };
    }
    if (!Array.isArray(raw)) return { arr: null, keyframed: false };
    return { arr: raw, keyframed: false };
}

function setGradientK(g, arr, colorCount) {
    if (g.k && typeof g.k === 'object' && !Array.isArray(g.k) && 'k' in g.k) {
        g.k.k = arr;
    } else {
        g.k = arr;
    }
    g.p = colorCount;
}

// 深度遍历，按出现顺序为每个渐变分配稳定索引（同名渐变互不干扰的关键）
function forEachGradient(root, cb) {
    let index = 0;
    (function walk(node) {
        if (!node || typeof node !== 'object') return;
        if ((node.ty === 'gf' || node.ty === 'gs') && node.g) cb(node, index++);
        if (Array.isArray(node)) {
            for (const item of node) walk(item);
        } else {
            for (const key of Object.keys(node)) walk(node[key]);
        }
    })(root);
}

function getGradientList(jsonData) {
    const list = [];
    forEachGradient(jsonData, (node, index) => {
        const { arr, keyframed } = unwrapGradientK(node.g);
        let colorCount = 0;
        let hasAlpha = false;
        if (!keyframed && arr) {
            const parsed = parseGradientArray(arr, node.g.p);
            colorCount = parsed.colors.length;
            hasAlpha = parsed.alphaStops.length > 0;
        }
        list.push({ index, node, name: node.nm || t('unnamedGradient'), type: node.ty, keyframed, colorCount, hasAlpha });
    });
    // 同名渐变追加序号后缀，方便区分
    const counts = {};
    list.forEach(g => { counts[g.name] = (counts[g.name] || 0) + 1; });
    const seen = {};
    list.forEach(g => {
        seen[g.name] = (seen[g.name] || 0) + 1;
        g.displayName = counts[g.name] > 1 ? `${g.name} #${seen[g.name]}` : g.name;
    });
    return list;
}

// 把平铺数组解析为独立的颜色色标与透明度色标
function parseGradientArray(arr, declaredCount) {
    let colorCount;
    if (Number.isInteger(declaredCount) && declaredCount > 0 && arr.length >= declaredCount * 4) {
        colorCount = declaredCount;
    } else if (arr.length % 6 === 0) {
        colorCount = arr.length / 6;
    } else {
        colorCount = Math.floor(arr.length / 4);
    }
    const colors = [];
    for (let i = 0; i < colorCount; i++) {
        colors.push({
            offset: clamp01(arr[i * 4]),
            color: color_lottie_to_hex(arr.slice(i * 4 + 1, i * 4 + 4))
        });
    }
    const alphaStops = [];
    for (let i = colorCount * 4; i + 1 < arr.length; i += 2) {
        alphaStops.push({ offset: clamp01(arr[i]), alpha: clamp01(arr[i + 1]) });
    }
    return { colors, alphaStops };
}

// 分段线性插值采样（用于合并颜色/透明度的 CSS 预览）
function samplePiecewise(stops, offset, get) {
    if (stops.length === 0) return null;
    if (offset <= stops[0].offset) return get(stops[0]);
    const last = stops[stops.length - 1];
    if (offset >= last.offset) return get(last);
    for (let i = 0; i < stops.length - 1; i++) {
        const a = stops[i], b = stops[i + 1];
        if (offset >= a.offset && offset <= b.offset) {
            const span = b.offset - a.offset;
            const tt = span === 0 ? 0 : (offset - a.offset) / span;
            const va = get(a), vb = get(b);
            if (Array.isArray(va)) return va.map((v, j) => v + (vb[j] - v) * tt);
            return va + (vb - va) * tt;
        }
    }
    return get(last);
}

function hexToRgbArr(hex) {
    return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

// ========== 渐变编辑器 ==========

// 把颜色色标 + 透明度色标合成为一条 CSS 渐变（用于列表缩略图与预览条）
function gradient_css_from_stops(colors, alphaStops) {
    const cs = [...colors].sort((a, b) => a.offset - b.offset);
    if (!cs.length) return 'var(--muted)';
    const as = alphaStops && alphaStops.length ? [...alphaStops].sort((a, b) => a.offset - b.offset) : null;
    const offsets = [...new Set([
        ...cs.map(c => c.offset),
        ...(as ? as.map(a => a.offset) : [])
    ])].sort((a, b) => a - b);
    const stops = offsets.map(o => {
        const rgb = samplePiecewise(cs, o, c => hexToRgbArr(c.color));
        const alpha = as ? samplePiecewise(as, o, a => a.alpha) : 1;
        const [r, g, b] = rgb.map(Math.round);
        return `rgba(${r}, ${g}, ${b}, ${truncate_float(alpha)}) ${Math.round(o * 100)}%`;
    });
    return `linear-gradient(90deg, ${stops.join(', ')})`;
}

function gradient_swatch_css(node) {
    try {
        const { arr } = unwrapGradientK(node.g);
        if (!arr || !arr.length) return 'var(--muted)';
        const parsed = parseGradientArray(arr, node.g.p);
        return gradient_css_from_stops(parsed.colors, parsed.alphaStops);
    } catch (e) {
        return 'var(--muted)';
    }
}

class GradientPreviewEditor {
    constructor(parent, lottieArr, colorCount, on_change) {
        this.parent = parent;
        this.on_change = on_change;
        this.debounceTimer = null;
        if (!Array.isArray(lottieArr) || lottieArr.length === 0) {
            lottieArr = [0, 0.231, 0.51, 0.965, 1, 0.976, 0.451, 0.086]; // 默认：蓝到橙
            colorCount = 2;
        }
        const parsed = parseGradientArray(lottieArr, colorCount);
        this.colors = parsed.colors;
        this.alphaStops = parsed.alphaStops;
        this.with_alpha = this.alphaStops.length > 0;
        this.render();
    }

    // ---------- 渲染 ----------
    render() {
        const self = this;
        this.parent.innerHTML = '';
        const container = document.createElement('div');
        container.className = 'editor-stack';
        this.parent.appendChild(container);

        // 合并预览条
        const previewBlock = document.createElement('div');
        const previewLabel = document.createElement('div');
        previewLabel.className = 'section-label';
        previewLabel.innerHTML = `<span>${t('gradientPreview')}</span><span class="spacer"></span><span class="count">${this.colors.length} ${t('stops')}</span>`;
        previewBlock.appendChild(previewLabel);
        const previewRail = document.createElement('div');
        previewRail.className = 'rail-block';
        const previewTrack = document.createElement('div');
        previewTrack.className = 'rail-track';
        this.preview = document.createElement('div');
        this.preview.className = 'rail';
        this.preview.style.background = this.to_css();
        previewTrack.appendChild(this.preview);
        previewRail.appendChild(previewTrack);
        previewBlock.appendChild(previewRail);
        container.appendChild(previewBlock);

        // ---- 颜色色标 ----
        const colorSection = document.createElement('div');
        const colorLabel = document.createElement('div');
        colorLabel.className = 'section-label';
        colorLabel.innerHTML = `<span>${t('colorStops')}</span><span class="spacer"></span><span class="count" data-count="color">${this.colors.length}</span>`;
        colorSection.appendChild(colorLabel);

        const colorRailBlock = document.createElement('div');
        colorRailBlock.className = 'rail-block';
        const colorTrack = document.createElement('div');
        colorTrack.className = 'rail-track';
        this.colorRail = document.createElement('div');
        this.colorRail.className = 'rail';
        this.colorRail.dataset.rail = 'color';
        this.colorRail.style.background = gradient_css_from_stops(this.colors, null);
        colorTrack.appendChild(this.colorRail);
        this.colorRailStops = document.createElement('div');
        this.colorRailStops.className = 'rail-stops';
        colorTrack.appendChild(this.colorRailStops);
        colorRailBlock.appendChild(colorTrack);
        colorSection.appendChild(colorRailBlock);

        const colorHead = document.createElement('div');
        colorHead.className = 'stops-head stops-head--color';
        colorHead.innerHTML = `<span></span><span>${t('color')}</span><span>${t('position')}</span><span></span>`;
        colorSection.appendChild(colorHead);

        this.colorsContainer = document.createElement('div');
        this.colorsContainer.className = 'stops-rows';
        colorSection.appendChild(this.colorsContainer);
        this.colors.forEach(c => this.colorsContainer.appendChild(this._buildColorRow(c)));
        colorSection.appendChild(this._buildAddButton('add-color-stop', t('addStop'), () => {
            const color = { offset: 1, color: '#000000' };
            self.colors.push(color);
            self.colorsContainer.appendChild(self._buildColorRow(color));
            self._refreshColorRail();
            self._syncCounts();
            self._on_change();
            lucide.createIcons();
        }));
        container.appendChild(colorSection);

        container.appendChild(Object.assign(document.createElement('div'), { className: 'divider' }));

        // ---- 透明度色标（与颜色色标相互独立）----
        const alphaSection = document.createElement('div');
        const alphaHeadRow = document.createElement('div');
        alphaHeadRow.className = 'section-label';
        alphaHeadRow.innerHTML = `<span>${t('alphaStopsLabel')}</span><span class="spacer"></span>`;
        const alphaToggle = document.createElement('button');
        alphaToggle.type = 'button';
        alphaToggle.className = 'switch';
        alphaToggle.dataset.action = 'toggle-alpha';
        alphaToggle.setAttribute('role', 'switch');
        alphaToggle.setAttribute('aria-checked', String(this.with_alpha));
        alphaToggle.setAttribute('aria-label', t('enableAlpha'));
        alphaHeadRow.appendChild(alphaToggle);
        alphaSection.appendChild(alphaHeadRow);
        this.alphaToggle = alphaToggle;

        if (!this.with_alpha) {
            const off = document.createElement('div');
            off.className = 'rail-empty';
            off.textContent = t('alphaOffHint');
            alphaSection.appendChild(off);
        } else {
            const alphaRailBlock = document.createElement('div');
            alphaRailBlock.className = 'rail-block rail-block--alpha';
            const alphaTrack = document.createElement('div');
            alphaTrack.className = 'rail-track';
            this.alphaRail = document.createElement('div');
            this.alphaRail.className = 'rail rail--alpha';
            this.alphaRail.dataset.rail = 'alpha';
            alphaTrack.appendChild(this.alphaRail);
            this.alphaRailStops = document.createElement('div');
            this.alphaRailStops.className = 'rail-stops';
            alphaTrack.appendChild(this.alphaRailStops);
            alphaRailBlock.appendChild(alphaTrack);
            alphaSection.appendChild(alphaRailBlock);

            const alphaHead = document.createElement('div');
            alphaHead.className = 'stops-head stops-head--alpha';
            alphaHead.innerHTML = `<span>${t('position')}</span><span>${t('opacity')}</span><span></span>`;
            alphaSection.appendChild(alphaHead);

            this.alphaRowsWrapper = document.createElement('div');
            this.alphaRowsWrapper.className = 'stops-rows';
            alphaSection.appendChild(this.alphaRowsWrapper);
            this.alphaStops.forEach(a => this.alphaRowsWrapper.appendChild(this._buildAlphaRow(a)));
            alphaSection.appendChild(this._buildAddButton('add-alpha-stop', t('addAlphaStop'), () => {
                const stop = { offset: 1, alpha: 1 };
                self.alphaStops.push(stop);
                self.alphaRowsWrapper.appendChild(self._buildAlphaRow(stop));
                self._refreshAlphaRail();
                self._on_change();
                lucide.createIcons();
            }));
        }
        container.appendChild(alphaSection);

        alphaToggle.addEventListener('click', () => {
            self.with_alpha = !self.with_alpha;
            if (self.with_alpha && self.alphaStops.length === 0) {
                // 首次开启：按颜色色标位置生成全不透明的透明度色标
                self.alphaStops = self.colors.map(c => ({ offset: c.offset, alpha: 1 }));
                if (self.alphaStops.length < 2) {
                    self.alphaStops = [{ offset: 0, alpha: 1 }, { offset: 1, alpha: 1 }];
                }
            }
            self.render();
            self._on_change();
            lucide.createIcons();
        });

        this._refreshColorRail();
        this._refreshAlphaRail();
        this._syncCounts();
        lucide.createIcons();
    }

    _buildAddButton(action, label, handler) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'add-stop';
        btn.dataset.action = action;
        btn.innerHTML = `<i data-lucide="plus"></i> ${label}`;
        btn.addEventListener('click', handler);
        return btn;
    }

    // ---------- 缩略轨与圆点 ----------
    _refreshColorRail() {
        if (this.colorRail) this.colorRail.style.background = gradient_css_from_stops(this.colors, null);
        if (this.colorRailStops) this.colorRailStops.innerHTML = '';
        this.colors.forEach(color => {
            const handle = this._buildRailStop(color, this.colorRail, (pct) => {
                color.offset = pct;
                if (color.pos_input) color.pos_input.value = Math.round(pct * 100);
                this._updatePreview();
                this._debounced_change();
            });
            if (this.colorRailStops) this.colorRailStops.appendChild(handle);
            color.rail_stop = handle;
        });
    }

    _refreshAlphaRail() {
        if (!this.alphaRail || !this.alphaRailStops) return;
        const stops = [...this.alphaStops].sort((a, b) => a.offset - b.offset);
        const css = stops.map(s => `rgba(0, 0, 0, ${truncate_float(s.alpha)}) ${Math.round(s.offset * 100)}%`);
        this.alphaRail.style.backgroundImage = stops.length
            ? `linear-gradient(90deg, ${css.join(', ')})`
            : 'none';
        this.alphaRailStops.innerHTML = '';
        this.alphaStops.forEach(stop => {
            const handle = this._buildRailStop(stop, this.alphaRail, (pct) => {
                stop.offset = pct;
                if (stop.pos_input) stop.pos_input.value = Math.round(pct * 100);
                this._refreshAlphaRail();
                this._updatePreview();
                this._debounced_change();
            });
            this.alphaRailStops.appendChild(handle);
            stop.rail_stop = handle;
        });
    }

    _buildRailStop(item, railEl, applyPct) {
        const self = this;
        const handle = document.createElement('button');
        handle.type = 'button';
        handle.className = 'rail-stop';
        handle.style.setProperty('--p', Math.round(item.offset * 100) + '%');
        handle.setAttribute('aria-label', `${t('position')} ${Math.round(item.offset * 100)}%`);

        let dragging = false;
        const moveTo = (clientX) => {
            const rect = railEl.getBoundingClientRect();
            if (!rect.width) return;
            const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
            applyPct(pct);
            handle.style.setProperty('--p', Math.round(pct * 100) + '%');
        };
        handle.addEventListener('pointerdown', (ev) => {
            ev.preventDefault();
            dragging = true;
            try { handle.setPointerCapture(ev.pointerId); } catch (e) {}
            handle.classList.add('is-active');
            handle.focus();
        });
        handle.addEventListener('pointermove', (ev) => { if (dragging) moveTo(ev.clientX); });
        handle.addEventListener('pointerup', (ev) => {
            dragging = false;
            handle.classList.remove('is-active');
            try { handle.releasePointerCapture(ev.pointerId); } catch (e) {}
        });
        handle.addEventListener('pointercancel', () => { dragging = false; handle.classList.remove('is-active'); });
        handle.addEventListener('keydown', (ev) => {
            if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
            ev.preventDefault();
            const step = (ev.shiftKey ? 10 : 1) / 100;
            const pct = Math.min(1, Math.max(0, item.offset + (ev.key === 'ArrowRight' ? step : -step)));
            applyPct(pct);
            handle.style.setProperty('--p', Math.round(pct * 100) + '%');
        });
        return handle;
    }

    _updatePreview() {
        this.preview.style.background = this.to_css();
    }

    _syncCounts() {
        const colorCountEl = this.parent.querySelector('[data-count="color"]');
        if (colorCountEl) colorCountEl.textContent = String(this.colors.length);
        const previewCount = this.parent.querySelector('.section-label .count');
        if (previewCount) previewCount.textContent = `${this.colors.length} ${t('stops')}`;
    }

    // ---------- 行构建 ----------
    _buildNumField(value, ariaLabel, onInput) {
        const wrap = document.createElement('div');
        wrap.className = 'num-wrap';
        const input = document.createElement('input');
        input.type = 'number';
        input.min = 0; input.max = 100; input.step = 1;
        input.value = value;
        input.className = 'num-input';
        input.setAttribute('aria-label', ariaLabel);
        wrap.appendChild(input);
        const suffix = document.createElement('span');
        suffix.className = 'num-suffix';
        suffix.textContent = '%';
        wrap.appendChild(suffix);

        const apply = (raw) => {
            let v = Number(raw);
            if (!isFinite(v) || v < 0) v = 0;
            if (v > 100) v = 100;
            input.value = v;
            onInput(v / 100);
        };
        input.addEventListener('input', () => apply(input.value));
        return { wrap, input };
    }

    _buildColorRow(color) {
        const self = this;
        const row = document.createElement('div');
        row.className = 'stop-row stop-row--color';
        row.dataset.row = 'color';

        const swatch = document.createElement('input');
        swatch.type = 'color';
        swatch.value = color.color;
        swatch.className = 'swatch-input';
        swatch.setAttribute('aria-label', t('color'));
        row.appendChild(swatch);

        const hexInput = document.createElement('input');
        hexInput.type = 'text';
        hexInput.value = color.color.slice(1);
        hexInput.className = 'hex-input';
        hexInput.spellcheck = false;
        hexInput.setAttribute('aria-label', 'HEX');
        row.appendChild(hexInput);

        const pos = this._buildNumField(Math.round(color.offset * 100), t('position'), (v) => {
            color.offset = v;
            if (color.rail_stop) color.rail_stop.style.setProperty('--p', Math.round(v * 100) + '%');
            this._updatePreview();
            this._debounced_change();
        });
        row.appendChild(pos.wrap);
        color.pos_input = pos.input;

        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'row-del';
        del.dataset.action = 'delete-color-stop';
        del.setAttribute('aria-label', t('removeStop') || 'remove stop');
        del.innerHTML = '<i data-lucide="trash-2"></i>';
        del.addEventListener('click', () => {
            if (this.colors.length <= 2) { showToast(t('minStopsWarning'), 'info'); return; }
            row.remove();
            this.colors.splice(this.colors.indexOf(color), 1);
            this._refreshColorRail();
            this._syncCounts();
            this._on_change();
        });
        row.appendChild(del);

        const applyColor = (hexValue) => {
            color.color = hexValue;
            swatch.value = hexValue;
            hexInput.value = hexValue.slice(1);
            if (this.colorRail) this.colorRail.style.background = gradient_css_from_stops(this.colors, null);
            this._updatePreview();
            this._debounced_change();
        };

        swatch.addEventListener('input', () => applyColor(swatch.value));
        hexInput.addEventListener('input', () => {
            const match = hexInput.value.match(/^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);
            if (!match) return;
            let hexValue = '#' + match[1];
            if (hexValue.length === 4) {
                hexValue = '#' + hexValue[1] + hexValue[1] + hexValue[2] + hexValue[2] + hexValue[3] + hexValue[3];
            }
            applyColor(hexValue);
        });

        color.swatch = swatch;
        color.hex_input = hexInput;
        return row;
    }

    _buildAlphaRow(stop) {
        const row = document.createElement('div');
        row.className = 'stop-row stop-row--alpha';
        row.dataset.row = 'alpha';

        const pos = this._buildNumField(Math.round(stop.offset * 100), t('position'), (v) => {
            stop.offset = v;
            if (stop.rail_stop) stop.rail_stop.style.setProperty('--p', Math.round(v * 100) + '%');
            this._refreshAlphaRail();
            this._updatePreview();
            this._debounced_change();
        });
        row.appendChild(pos.wrap);
        stop.pos_input = pos.input;

        const alpha = this._buildNumField(Math.round(stop.alpha * 100), t('opacity'), (v) => {
            stop.alpha = v;
            this._refreshAlphaRail();
            this._updatePreview();
            this._debounced_change();
        });
        row.appendChild(alpha.wrap);
        stop.alpha_input = alpha.input;

        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'row-del';
        del.dataset.action = 'delete-alpha-stop';
        del.setAttribute('aria-label', t('removeStop') || 'remove stop');
        del.innerHTML = '<i data-lucide="trash-2"></i>';
        del.addEventListener('click', () => {
            if (this.alphaStops.length <= 2) { showToast(t('minStopsWarning'), 'info'); return; }
            row.remove();
            this.alphaStops.splice(this.alphaStops.indexOf(stop), 1);
            this._refreshAlphaRail();
            this._on_change();
        });
        row.appendChild(del);
        return row;
    }

    // ---------- 数据输出 ----------
    _debounced_change() {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => this._on_change(), 100);
    }

    _on_change() {
        this._updatePreview();
        if (this.on_change) this.on_change(this.to_lottie());
    }

    to_css() {
        return gradient_css_from_stops(this.colors, this.with_alpha ? this.alphaStops : null);
    }

    // 返回 { k: 平铺数组, p: 颜色色标数 }；透明度色标独立保留
    to_lottie() {
        const colors = [...this.colors].sort((a, b) => a.offset - b.offset);
        const result = [];
        for (const c of colors) {
            result.push(truncate_float(c.offset), ...color_hex_to_lottie(c.color));
        }
        if (this.with_alpha && this.alphaStops.length > 0) {
            const alphas = [...this.alphaStops].sort((a, b) => a.offset - b.offset);
            for (const a of alphas) {
                result.push(truncate_float(a.offset), truncate_float(a.alpha));
            }
        }
        return { k: result, p: colors.length };
    }
}

// ========== 全局状态 ==========

let animation = null;
let currentJsonData = null;   // 唯一数据源；传给 bodymovin 前会深拷贝
let currentFileName = '';
let selectedGradient = null;  // { index, displayName }
let gradientEditorInstance = null;
let isScrubbing = false;

const playIcon = '<i data-lucide="play" class="w-5 h-5"></i>';
const pauseIcon = '<i data-lucide="pause" class="w-5 h-5"></i>';

// ========== 动画加载与播放 ==========

function updateTimeDisplay() {
    const timeDisplay = document.getElementById('time-display');
    if (!animation || !timeDisplay) return;
    const current = Math.round(animation.currentFrame);
    const total = Math.round(animation.totalFrames);
    timeDisplay.textContent = `${current} / ${total}`;
}

function loadAnimation(jsonData, preserveState = false) {
    const container = document.getElementById('lottie-animation');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const progressBar = document.getElementById('animation-progress');
    const dropZone = document.getElementById('drop-zone');
    let resumeFrame = 0;
    let wasPaused = false;
    if (preserveState && animation) {
        resumeFrame = animation.currentFrame;
        wasPaused = animation.isPaused;
    }
    try {
        if (animation) { animation.destroy(); animation = null; }
        container.innerHTML = '';
        if (dropZone) dropZone.classList.remove('empty');
        animation = bodymovin.loadAnimation({
            container,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            // 深拷贝：bodymovin 会修改传入的数据，保证 currentJsonData 始终干净
            animationData: JSON.parse(JSON.stringify(jsonData))
        });
        animation.addEventListener('enterFrame', () => {
            if (!isScrubbing && animation && progressBar) {
                progressBar.value = (animation.currentFrame / animation.totalFrames) * 100;
                updateTimeDisplay();
            }
        });
        if (preserveState) {
            if (wasPaused) {
                animation.goToAndStop(resumeFrame, true);
                if (playPauseBtn) playPauseBtn.innerHTML = playIcon;
            } else {
                animation.goToAndPlay(resumeFrame, true);
                if (playPauseBtn) playPauseBtn.innerHTML = pauseIcon;
            }
        } else {
            if (playPauseBtn) playPauseBtn.innerHTML = pauseIcon;
            if (progressBar) progressBar.value = 0;
        }
        updateTimeDisplay();
        lucide.createIcons();
    } catch (error) {
        console.error('Error loading animation:', error);
        showToast(t('alertInvalidJson') + ': ' + error.message, 'error');
    }
}

// ========== 渐变列表与编辑器渲染 ==========

function renderListEmptyState() {
    const listEl = document.getElementById('gradient-names-list');
    if (!listEl) return;
    listEl.innerHTML = `<div class="empty"><div class="empty-icon"><i data-lucide="sparkles"></i></div><div class="empty-title">${t('noJsonUploaded')}</div></div>`;
    lucide.createIcons();
}

function renderEditorEmptyState() {
    const titleEl = document.getElementById('editor-title');
    const editorEl = document.getElementById('editor');
    const typeBadge = document.getElementById('gradient-type');
    gradientEditorInstance = null;
    if (titleEl) titleEl.textContent = t('noGradientSelected');
    if (typeBadge) typeBadge.classList.add('hidden');
    if (editorEl) {
        editorEl.innerHTML = `<div class="empty empty--fill"><div class="empty-icon"><i data-lucide="mouse-pointer-click"></i></div><div class="empty-title">${t('clickGradientToEdit')}</div></div>`;
    }
    lucide.createIcons();
}

function updateGradientNamesList() {
    const listEl = document.getElementById('gradient-names-list');
    const countEl = document.getElementById('gradient-count');
    const searchEl = document.getElementById('gradient-search');
    if (!listEl) return;
    if (searchEl) searchEl.value = '';

    if (!currentJsonData) {
        renderListEmptyState();
        if (countEl) countEl.textContent = '0';
        selectedGradient = null;
        renderEditorEmptyState();
        return;
    }

    const gradients = getGradientList(currentJsonData);
    if (countEl) countEl.textContent = String(gradients.length);

    if (gradients.length === 0) {
        listEl.innerHTML = `<div class="empty"><div class="empty-icon"><i data-lucide="search-x"></i></div><div class="empty-title">${t('noGradientsFound')}</div></div>`;
        selectedGradient = null;
        renderEditorEmptyState();
        return;
    }

    listEl.innerHTML = '';
    let selectionStillValid = false;
    gradients.forEach(g => {
        const item = document.createElement('div');
        item.className = 'gradient-item';
        item.tabIndex = 0;
        item.setAttribute('role', 'button');
        item.dataset.index = String(g.index);

        const swatch = document.createElement('div');
        swatch.className = 'g-swatch' + (g.keyframed ? ' is-animated' : '');
        if (!g.keyframed) swatch.style.background = gradient_swatch_css(g.node);

        const text = document.createElement('div');
        text.className = 'g-text';
        const nameSpan = document.createElement('div');
        nameSpan.className = 'gradient-name';
        nameSpan.textContent = g.displayName;
        nameSpan.title = g.displayName;
        const meta = document.createElement('div');
        meta.className = 'g-meta';
        const typeTag = document.createElement('span');
        typeTag.className = 'type';
        typeTag.textContent = g.type || 'gf';
        meta.appendChild(typeTag);
        if (g.colorCount) {
            const countTag = document.createElement('span');
            countTag.textContent = `${g.colorCount} ${t('stops')}${g.hasAlpha ? ' · α' : ''}`;
            meta.appendChild(countTag);
        }
        if (g.keyframed) {
            const badge = document.createElement('span');
            badge.className = 'badge badge--warn';
            badge.textContent = t('keyframedBadge');
            meta.appendChild(badge);
        }
        text.appendChild(nameSpan);
        text.appendChild(meta);

        const chevron = document.createElement('i');
        chevron.setAttribute('data-lucide', 'chevron-right');
        chevron.className = 'chev';
        item.appendChild(swatch);
        item.appendChild(text);
        item.appendChild(chevron);

        if (selectedGradient && selectedGradient.index === g.index) {
            item.classList.add('selected');
            selectionStillValid = true;
        }

        const select = () => {
            selectedGradient = { index: g.index, displayName: g.displayName, type: g.type };
            listEl.querySelectorAll('.gradient-item').forEach(el => el.classList.remove('selected'));
            item.classList.add('selected');
            renderEditorForSelection();
        };
        item.addEventListener('click', select);
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); }
        });
        listEl.appendChild(item);
    });

    if (!selectionStillValid) {
        selectedGradient = null;
        const first = listEl.querySelector('.gradient-item');
        if (first) first.click();
    }
    lucide.createIcons();
}

function renderEditorForSelection() {
    const editorEl = document.getElementById('editor');
    const titleEl = document.getElementById('editor-title');
    const typeBadge = document.getElementById('gradient-type');
    if (!editorEl || !titleEl) return;
    gradientEditorInstance = null;

    if (!currentJsonData || !selectedGradient) {
        renderEditorEmptyState();
        return;
    }
    let target = null;
    forEachGradient(currentJsonData, (node, idx) => {
        if (idx === selectedGradient.index) target = node;
    });
    if (!target) {
        selectedGradient = null;
        renderEditorEmptyState();
        return;
    }

    titleEl.textContent = selectedGradient.displayName;
    if (typeBadge) {
        typeBadge.textContent = target.ty || 'gf';
        typeBadge.classList.remove('hidden');
    }

    const { arr, keyframed } = unwrapGradientK(target.g);
    if (keyframed) {
        editorEl.innerHTML = `
            <div class="empty empty--fill" data-editor-notice="keyframed">
                <div class="empty-icon"><i data-lucide="film"></i></div>
                <div class="empty-title">${t('keyframedBadge')}</div>
                <div class="empty-desc">${t('animatedGradientNotice')}</div>
            </div>`;
        lucide.createIcons();
        return;
    }

    gradientEditorInstance = new GradientPreviewEditor(editorEl, arr, target.g.p, (result) => {
        applyEditToSelected(result);
    });
    lucide.createIcons();
}

// 仅更新选中的那一个渐变（按索引定位，同名渐变互不影响）
function applyEditToSelected(result) {
    if (!currentJsonData || !selectedGradient) return;
    forEachGradient(currentJsonData, (node, idx) => {
        if (idx === selectedGradient.index) setGradientK(node.g, result.k, result.p);
    });
    loadAnimation(currentJsonData, true);
}

// ========== 文件导入 ==========

function handleLottieFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            let content = e.target.result;
            if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
            const jsonData = JSON.parse(content);
            currentJsonData = jsonData;
            currentFileName = file.name.replace(/\.json$/i, '');
            const fileInfo = document.getElementById('file-info');
            const filename = document.getElementById('filename');
            if (fileInfo) fileInfo.classList.remove('hidden');
            if (filename) filename.textContent = file.name;
            selectedGradient = null;
            loadAnimation(currentJsonData);
            updateGradientNamesList();
            lucide.createIcons();
        } catch (error) {
            console.error('JSON parse error:', error);
            showToast(t('alertInvalidJson') + ': ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

// ========== 渐变同步（按名称匹配，作用于所有同名渐变）==========

function extractGradientsFromJson(jsonData) {
    if (jsonData.gradients && Array.isArray(jsonData.gradients)) return jsonData.gradients;
    const gradients = [];
    const seen = new Set();
    forEachGradient(jsonData, (node) => {
        if (!node.nm || seen.has(node.nm)) return;
        const { arr, keyframed } = unwrapGradientK(node.g);
        if (keyframed || !arr || arr.length === 0) return;
        seen.add(node.nm);
        const p = Number.isInteger(node.g.p) && node.g.p > 0
            ? node.g.p
            : (arr.length % 6 === 0 ? arr.length / 6 : Math.floor(arr.length / 4));
        gradients.push({ name: node.nm, data: arr, colorCount: p });
    });
    return gradients;
}

function applyGradientByName(jsonData, gradient) {
    let applied = 0;
    forEachGradient(jsonData, (node) => {
        if (node.nm === gradient.name) {
            const { keyframed } = unwrapGradientK(node.g);
            if (keyframed) return;
            setGradientK(node.g, gradient.data, gradient.colorCount);
            applied++;
        }
    });
    return applied;
}

// ========== GIF 导出：gif.js 加载（本地 vendor，无外部依赖）==========

let gifJsPromise = null;
function preloadGifJs() {
    if (window.GIF) return Promise.resolve();
    if (gifJsPromise) return gifJsPromise;
    gifJsPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'js/vendor/gif.js';
        script.onload = () => resolve();
        script.onerror = () => {
            gifJsPromise = null;
            reject(new Error('Failed to load gif.js'));
        };
        document.head.appendChild(script);
    });
    return gifJsPromise;
}

// ========== 初始化 ==========

document.addEventListener('DOMContentLoaded', function () {
    updateLanguage(currentLang);
    lucide.createIcons();

    const langBtn = document.getElementById('lang-btn');
    if (langBtn) langBtn.addEventListener('click', toggleLanguage);

    const fileInput = document.getElementById('lottie-file');
    const dropZone = document.getElementById('drop-zone');
    const animationContainer = document.getElementById('lottie-animation');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const progressBar = document.getElementById('animation-progress');
    const bgColorPicker = document.getElementById('bg-color-picker');
    const bgAlphaBtn = document.getElementById('bg-alpha-btn');

    // ----- 拖拽导入 -----
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(e => {
        dropZone.addEventListener(e, (ev) => { ev.preventDefault(); ev.stopPropagation(); }, false);
        document.body.addEventListener(e, (ev) => { ev.preventDefault(); ev.stopPropagation(); }, false);
    });
    ['dragenter', 'dragover'].forEach(e => dropZone.addEventListener(e, () => dropZone.classList.add('drag-over'), false));
    ['dragleave', 'drop'].forEach(e => dropZone.addEventListener(e, () => dropZone.classList.remove('drag-over'), false));

    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (!files.length) return;
        const file = files[0];
        if (!/\.json$/i.test(file.name)) {
            showToast(t('invalidFileType'), 'error');
            return;
        }
        handleLottieFile(file);
    }, false);

    // 空状态下点击预览区也可打开文件选择
    dropZone.classList.add('empty');
    dropZone.addEventListener('click', () => {
        if (!animation) fileInput.click();
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) handleLottieFile(file);
        // 重置 value，保证重新选择同名文件也能触发 change
        fileInput.value = '';
    });

    // ----- 搜索过滤 -----
    const gradientSearch = document.getElementById('gradient-search');
    if (gradientSearch) {
        gradientSearch.addEventListener('input', function () {
            const searchTerm = gradientSearch.value.toLowerCase().trim();
            document.querySelectorAll('.gradient-item').forEach(item => {
                const name = item.querySelector('.gradient-name').textContent.toLowerCase();
                item.style.display = name.includes(searchTerm) ? '' : 'none';
            });
        });
    }

    // ----- 导出 JSON -----
    document.getElementById('export-btn').addEventListener('click', () => {
        if (!currentJsonData) { showToast(t('alertNoContent'), 'error'); return; }
        try {
            const compressed = compressJson(currentJsonData);
            const blob = new Blob([compressed], { type: 'application/json' });
            downloadBlob(blob, `${currentFileName || 'lottie_animation'}.json`);
        } catch (error) {
            showToast(t('exportFailed') + ': ' + error.message, 'error');
        }
    });

    // ----- 同步渐变 -----
    const gradientFileInput = document.getElementById('gradient-file');
    gradientFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        gradientFileInput.value = '';
        if (!file) return;
        if (!currentJsonData) { showToast(t('alertNoAnimation'), 'error'); return; }
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                let fileContent = e.target.result;
                if (fileContent.charCodeAt(0) === 0xFEFF) fileContent = fileContent.slice(1);
                const jsonData = JSON.parse(fileContent);
                const gradients = extractGradientsFromJson(jsonData);
                if (gradients.length === 0) { showToast(t('alertNoGradient'), 'error'); return; }

                gradients.forEach(gradient => applyGradientByName(currentJsonData, gradient));

                loadAnimation(currentJsonData, true);
                updateGradientNamesList();
                renderEditorForSelection();
                showToast(t('syncSuccess', { count: gradients.length }), 'success');
            } catch (error) {
                console.error('Error syncing gradients:', error);
                showToast(t('syncFailed') + ': ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    });

    // ----- 播放控制 -----
    playPauseBtn.addEventListener('click', () => {
        if (!animation) return;
        if (animation.isPaused) { animation.play(); playPauseBtn.innerHTML = pauseIcon; }
        else { animation.pause(); playPauseBtn.innerHTML = playIcon; }
        lucide.createIcons();
    });

    let wasPlayingBeforeScrub = false;
    progressBar.addEventListener('input', () => {
        if (!animation) return;
        if (!isScrubbing) {
            isScrubbing = true;
            wasPlayingBeforeScrub = !animation.isPaused;
        }
        const frame = (progressBar.value / 100) * animation.totalFrames;
        animation.goToAndStop(frame, true);
        updateTimeDisplay();
    });
    progressBar.addEventListener('change', () => {
        if (animation && isScrubbing) {
            // 拖拽结束后恢复拖拽前的播放状态
            if (wasPlayingBeforeScrub) {
                animation.play();
                playPauseBtn.innerHTML = pauseIcon;
            } else {
                playPauseBtn.innerHTML = playIcon;
            }
            lucide.createIcons();
        }
        isScrubbing = false;
    });

    // ----- 背景切换 -----
    bgColorPicker.addEventListener('input', () => {
        animationContainer.style.backgroundColor = bgColorPicker.value;
        animationContainer.classList.remove('alpha-checkered');
        bgAlphaBtn.classList.remove('is-active');
        bgAlphaBtn.setAttribute('aria-pressed', 'false');
    });
    bgAlphaBtn.addEventListener('click', () => {
        animationContainer.style.backgroundColor = '';
        animationContainer.classList.add('alpha-checkered');
        bgAlphaBtn.classList.add('is-active');
        bgAlphaBtn.setAttribute('aria-pressed', 'true');
    });

    // ----- 导出当前帧 PNG -----
    const exportFrameBtn = document.getElementById('export-frame-btn');
    if (exportFrameBtn) {
        exportFrameBtn.addEventListener('click', () => {
            const svg = animationContainer.querySelector('svg');
            if (!svg) { showToast(t('alertNoAnimation'), 'error'); return; }

            const wasPlaying = animation && !animation.isPaused;
            const currentFrame = animation ? Math.round(animation.currentFrame) : 0;
            if (animation && !animation.isPaused) animation.pause();

            let svgWidth, svgHeight;
            const viewBox = svg.getAttribute('viewBox');
            if (viewBox) {
                const parts = viewBox.split(/\s+/);
                svgWidth = parseFloat(parts[2]);
                svgHeight = parseFloat(parts[3]);
            } else {
                svgWidth = parseFloat(svg.getAttribute('width')) || svg.clientWidth;
                svgHeight = parseFloat(svg.getAttribute('height')) || svg.clientHeight;
            }
            if (!svgWidth || !svgHeight) {
                const rect = svg.getBoundingClientRect();
                svgWidth = rect.width;
                svgHeight = rect.height;
            }

            const dpr = window.devicePixelRatio || 1;
            const clonedSvg = svg.cloneNode(true);
            clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            clonedSvg.setAttribute('width', svgWidth);
            clonedSvg.setAttribute('height', svgHeight);

            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(clonedSvg);

            const canvas = document.createElement('canvas');
            canvas.width = Math.round(svgWidth * dpr);
            canvas.height = Math.round(svgHeight * dpr);
            const ctx = canvas.getContext('2d');
            ctx.scale(dpr, dpr);

            if (animationContainer.classList.contains('alpha-checkered')) {
                const tileSize = 16;
                for (let y = 0; y < svgHeight; y += tileSize) {
                    for (let x = 0; x < svgWidth; x += tileSize) {
                        ctx.fillStyle = ((Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0) ? '#ffffff' : '#e5e7eb';
                        ctx.fillRect(x, y, tileSize, tileSize);
                    }
                }
            } else {
                ctx.fillStyle = animationContainer.style.backgroundColor || '#ffffff';
                ctx.fillRect(0, 0, svgWidth, svgHeight);
            }

            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, svgWidth, svgHeight);
                canvas.toBlob(blob => {
                    downloadBlob(blob, `${currentFileName || 'lottie'}_frame_${currentFrame}.png`);
                    URL.revokeObjectURL(url);
                    if (wasPlaying && animation) animation.play();
                }, 'image/png');
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                showToast(t('exportFailed'), 'error');
                if (wasPlaying && animation) animation.play();
            };
            img.src = url;
        });
    }

    // ----- GIF 导出 -----
    const exportGifBtn = document.getElementById('export-gif-btn');
    const gifModal = document.getElementById('gif-modal');
    const gifModalOverlay = document.getElementById('gif-modal-overlay');
    const closeGifModalBtn = document.getElementById('close-gif-modal');
    const cancelGifBtn = document.getElementById('cancel-gif-btn');
    const startGifBtn = document.getElementById('start-gif-btn');
    const gifFps = document.getElementById('gif-fps');
    const gifScale = document.getElementById('gif-scale');
    const gifStart = document.getElementById('gif-start');
    const gifEnd = document.getElementById('gif-end');
    const gifQuality = document.getElementById('gif-quality');
    const gifStartVal = document.getElementById('gif-start-val');
    const gifEndVal = document.getElementById('gif-end-val');
    const gifQualityVal = document.getElementById('gif-quality-val');
    const gifProgressArea = document.getElementById('gif-progress-area');
    const gifProgressBar = document.getElementById('gif-progress-bar');
    const gifProgressText = document.getElementById('gif-progress-text');

    let gifExportAbort = false;
    let currentGif = null;

    if (exportGifBtn) {
        exportGifBtn.addEventListener('click', () => {
            if (!animation) { showToast(t('noAnimationForGif'), 'error'); return; }
            openGifModal();
        });
    }

    function openGifModal() {
        if (!gifModal) return;
        const totalFrames = Math.round(animation.totalFrames);
        gifStart.max = totalFrames;
        gifEnd.max = totalFrames;
        gifStart.value = 0;
        gifEnd.value = totalFrames;
        gifStartVal.textContent = gifStart.value;
        gifEndVal.textContent = gifEnd.value;
        gifModal.classList.remove('hidden');
        requestAnimationFrame(() => gifModal.classList.add('is-open'));
        lucide.createIcons();
    }

    function closeGifModal() {
        if (!gifModal) return;
        gifModal.classList.remove('is-open');
        setTimeout(() => {
            gifModal.classList.add('hidden');
            resetGifModal();
        }, 200);
    }

    function resetGifModal() {
        gifProgressArea.classList.add('hidden');
        startGifBtn.disabled = false;
        startGifBtn.textContent = t('startExport');
        cancelGifBtn.textContent = t('cancel');
        gifExportAbort = false;
    }

    // 取消/关闭：导出进行中先中止导出
    function cancelGifExport() {
        if (currentGif) { gifExportAbort = true; }
        else { closeGifModal(); }
    }

    if (gifStart) {
        gifStart.addEventListener('input', () => {
            const val = parseInt(gifStart.value);
            const endVal = parseInt(gifEnd.value);
            if (val > endVal) { gifEnd.value = val; gifEndVal.textContent = val; }
            gifStartVal.textContent = val;
        });
    }
    if (gifEnd) {
        gifEnd.addEventListener('input', () => {
            const val = parseInt(gifEnd.value);
            const startVal = parseInt(gifStart.value);
            if (val < startVal) { gifStart.value = val; gifStartVal.textContent = val; }
            gifEndVal.textContent = val;
        });
    }
    if (gifQuality) {
        gifQuality.addEventListener('input', () => { gifQualityVal.textContent = gifQuality.value; });
    }
    if (closeGifModalBtn) closeGifModalBtn.addEventListener('click', cancelGifExport);
    if (cancelGifBtn) cancelGifBtn.addEventListener('click', cancelGifExport);
    if (gifModalOverlay) gifModalOverlay.addEventListener('click', cancelGifExport);

    if (startGifBtn) {
        startGifBtn.addEventListener('click', async () => {
            if (!animation) { showToast(t('noAnimationForGif'), 'error'); return; }
            const fps = parseInt(gifFps.value) || 20;
            const scale = parseFloat(gifScale.value) || 1;
            const startFrame = parseInt(gifStart.value) || 0;
            const endFrame = parseInt(gifEnd.value) || Math.round(animation.totalFrames);
            const quality = parseInt(gifQuality.value) || 10;

            startGifBtn.disabled = true;
            startGifBtn.textContent = t('exporting');
            gifProgressArea.classList.remove('hidden');
            gifProgressBar.style.width = '0%';
            gifProgressText.textContent = '0%';
            gifExportAbort = false;

            try {
                const finished = await exportGif(fps, scale, startFrame, endFrame, quality);
                if (finished) showToast(t('exportGifDone'), 'success');
            } catch (error) {
                console.error('GIF export error:', error);
                if (!gifExportAbort) showToast(t('exportGifFailed') + ': ' + error.message, 'error');
            } finally {
                currentGif = null;
                resetGifModal();
                closeGifModal();
            }
        });
    }

    async function exportGif(fps, scale, startFrame, endFrame, quality) {
        await preloadGifJs();
        let svg = animationContainer.querySelector('svg');
        if (!svg) throw new Error('No SVG found');

        let svgWidth, svgHeight;
        const viewBox = svg.getAttribute('viewBox');
        if (viewBox) {
            const parts = viewBox.split(/\s+/);
            svgWidth = parseFloat(parts[2]);
            svgHeight = parseFloat(parts[3]);
        } else {
            svgWidth = parseFloat(svg.getAttribute('width')) || svg.clientWidth;
            svgHeight = parseFloat(svg.getAttribute('height')) || svg.clientHeight;
        }
        if (!svgWidth || !svgHeight) {
            const rect = svg.getBoundingClientRect();
            svgWidth = rect.width;
            svgHeight = rect.height;
        }

        let exportWidth = Math.round(svgWidth * scale);
        let exportHeight = Math.round(svgHeight * scale);
        const MAX_SIZE = 800;
        if (exportWidth > MAX_SIZE || exportHeight > MAX_SIZE) {
            const ratio = Math.min(MAX_SIZE / exportWidth, MAX_SIZE / exportHeight);
            exportWidth = Math.round(exportWidth * ratio);
            exportHeight = Math.round(exportHeight * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = exportWidth;
        canvas.height = exportHeight;
        const ctx = canvas.getContext('2d');

        const isAlphaBg = animationContainer.classList.contains('alpha-checkered');
        const bgColor = animationContainer.style.backgroundColor || '#ffffff';

        const animFrameRate = animation.frameRate || 30;
        const frameStep = Math.max(1, Math.round(animFrameRate / fps));
        // 帧延迟按实际步长计算，保证 GIF 播放速度与原动画一致
        const frameDelay = Math.round((frameStep / animFrameRate) * 1000);
        const framesToRender = [];
        for (let f = startFrame; f <= endFrame; f += frameStep) {
            framesToRender.push(f);
        }

        const gif = new GIF({
            workers: 2,
            quality: quality,
            width: exportWidth,
            height: exportHeight,
            workerScript: 'js/vendor/gif.worker.js'
        });
        currentGif = gif;

        const wasPlaying = animation && !animation.isPaused;
        if (wasPlaying) animation.pause();

        for (let i = 0; i < framesToRender.length; i++) {
            if (gifExportAbort) break;
            const frame = framesToRender[i];
            animation.goToAndStop(frame, true);
            await new Promise(r => requestAnimationFrame(r));

            const currentSvg = animationContainer.querySelector('svg');
            if (!currentSvg) continue;

            const clonedSvg = currentSvg.cloneNode(true);
            clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            clonedSvg.setAttribute('width', svgWidth);
            clonedSvg.setAttribute('height', svgHeight);

            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(clonedSvg);

            ctx.clearRect(0, 0, exportWidth, exportHeight);
            if (isAlphaBg) {
                const tileSize = Math.max(8, Math.round(16 * scale));
                for (let y = 0; y < exportHeight; y += tileSize) {
                    for (let x = 0; x < exportWidth; x += tileSize) {
                        ctx.fillStyle = ((Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0) ? '#ffffff' : '#e5e7eb';
                        ctx.fillRect(x, y, tileSize, tileSize);
                    }
                }
            } else {
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, exportWidth, exportHeight);
            }

            await new Promise((resolve, reject) => {
                const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);
                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, exportWidth, exportHeight);
                    URL.revokeObjectURL(url);
                    resolve();
                };
                img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Frame render failed')); };
                img.src = url;
            });

            gif.addFrame(canvas, { delay: frameDelay, copy: true });

            const progress = Math.round(((i + 1) / framesToRender.length) * 100);
            gifProgressBar.style.width = progress + '%';
            gifProgressText.textContent = progress + '%';
        }

        let finished = false;
        if (!gifExportAbort) {
            await new Promise((resolve, reject) => {
                gif.on('finished', (blob) => {
                    downloadBlob(blob, `${currentFileName || 'lottie_animation'}.gif`);
                    finished = true;
                    resolve();
                });
                gif.on('error', reject);
                gif.render();
            });
        }

        currentGif = null;
        if (wasPlaying && animation) animation.play();
        return finished;
    }

    // ----- 帮助弹窗 -----
    const helpModal = document.getElementById('help-modal');
    const helpBtn = document.getElementById('help-btn');
    const closeModalBtn = document.getElementById('close-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const closeModalBtnBottom = document.getElementById('close-modal-btn');

    function openHelpModal() {
        helpModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => helpModal.classList.add('is-open'));
        lucide.createIcons();
    }

    function closeHelpModal() {
        helpModal.classList.remove('is-open');
        setTimeout(() => {
            helpModal.classList.add('hidden');
            document.body.style.overflow = '';
        }, 200);
    }

    if (helpBtn && helpModal) {
        helpBtn.addEventListener('click', openHelpModal);
        if (closeModalBtn) closeModalBtn.addEventListener('click', closeHelpModal);
        if (closeModalBtnBottom) closeModalBtnBottom.addEventListener('click', closeHelpModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeHelpModal();
        });
    }

    // ESC 关闭弹窗（GIF 弹窗导出中则先中止导出）
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (gifModal && !gifModal.classList.contains('hidden')) {
            cancelGifExport();
        } else if (helpModal && !helpModal.classList.contains('hidden')) {
            closeHelpModal();
        }
    });

    // 右侧列高度无需 JS 同步：锁高布局下网格行高确定，
    // CSS 拉伸 + h-full 已保证左右列等高

    // ----- gif.js 空闲预加载 -----
    if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => preloadGifJs().catch(() => {}), { timeout: 5000 });
    } else {
        setTimeout(() => preloadGifJs().catch(() => {}), 3000);
    }
});

// ========== 主题切换 ==========
document.addEventListener('DOMContentLoaded', function () {
    const themeBtn = document.getElementById('theme-btn');
    const root = document.documentElement;

    function syncThemeButton() {
        if (!themeBtn) return;
        const dark = root.classList.contains('dark');
        const label = i18n[currentLang][dark ? 'themeLight' : 'themeDark'];
        themeBtn.innerHTML = `<i data-lucide="${dark ? 'sun' : 'moon'}"></i>`;
        themeBtn.setAttribute('aria-label', label);
        themeBtn.setAttribute('data-tip', label);
        lucide.createIcons();
    }

    syncThemeButton();

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const dark = root.classList.toggle('dark');
            try { localStorage.setItem('lottie-theme', dark ? 'dark' : 'light'); } catch (e) {}
            syncThemeButton();
        });
    }
});
