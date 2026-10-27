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
        tip1: '点击「网格」按钮可切换透明背景，方便查看透明动画',
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
        aboutAuthor: '关于我'
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
        tip1: 'Click the "Grid" button to toggle transparent background for viewing transparent animations',
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
        aboutAuthor: 'About Me'
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
        const { keyframed } = unwrapGradientK(node.g);
        list.push({ index, node, name: node.nm || t('unnamedGradient'), keyframed });
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

    render() {
        const self = this;
        this.parent.innerHTML = '';
        const container = document.createElement('div');
        container.className = 'space-y-4';
        this.parent.appendChild(container);

        // 渐变预览条
        const previewWrapper = document.createElement('div');
        previewWrapper.className = 'alpha-checkered rounded-lg p-1';
        this.preview = document.createElement('div');
        this.preview.className = 'gradient-preview-bar';
        this.preview.style.background = this.to_css();
        previewWrapper.appendChild(this.preview);
        container.appendChild(previewWrapper);

        // 颜色色标区
        const colorSection = document.createElement('div');
        colorSection.className = 'space-y-2';
        const colorHeader = document.createElement('p');
        colorHeader.className = 'text-xs font-medium text-slate-500';
        colorHeader.textContent = t('colorStops');
        colorSection.appendChild(colorHeader);
        this.colorsContainer = document.createElement('div');
        this.colorsContainer.className = 'space-y-2';
        colorSection.appendChild(this.colorsContainer);
        this.colors.forEach(c => this.colorsContainer.appendChild(this._buildColorRow(c)));

        const addColorBtn = document.createElement('button');
        addColorBtn.type = 'button';
        addColorBtn.className = 'w-full py-2 rounded-lg border-2 border-dashed border-slate-300 text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2 text-sm';
        addColorBtn.innerHTML = `<i data-lucide="plus" class="w-4 h-4"></i> ${t('addStop')}`;
        addColorBtn.addEventListener('click', () => {
            const color = { offset: 1, color: '#000000' };
            self.colors.push(color);
            self.colorsContainer.appendChild(self._buildColorRow(color));
            self._on_change();
            lucide.createIcons();
        });
        colorSection.appendChild(addColorBtn);
        container.appendChild(colorSection);

        // 透明度色标区（与颜色色标相互独立）
        const alphaSection = document.createElement('div');
        alphaSection.className = 'space-y-2';
        const alphaHeader = document.createElement('div');
        alphaHeader.className = 'flex items-center justify-between';
        const alphaLabel = document.createElement('p');
        alphaLabel.className = 'text-xs font-medium text-slate-500';
        alphaLabel.textContent = t('alphaStopsLabel');
        this.alphaToggle = document.createElement('button');
        this.alphaToggle.type = 'button';
        this.alphaToggle.textContent = t('enableAlpha');
        alphaHeader.appendChild(alphaLabel);
        alphaHeader.appendChild(this.alphaToggle);
        alphaSection.appendChild(alphaHeader);

        this.alphaRowsWrapper = document.createElement('div');
        this.alphaRowsWrapper.className = 'space-y-2';
        alphaSection.appendChild(this.alphaRowsWrapper);
        container.appendChild(alphaSection);

        this._updateAlphaToggleStyle();
        this._renderAlphaRows();

        this.alphaToggle.addEventListener('click', () => {
            self.with_alpha = !self.with_alpha;
            if (self.with_alpha && self.alphaStops.length === 0) {
                // 首次开启：按颜色色标位置生成全不透明的透明度色标
                self.alphaStops = self.colors.map(c => ({ offset: c.offset, alpha: 1 }));
                if (self.alphaStops.length < 2) {
                    self.alphaStops = [{ offset: 0, alpha: 1 }, { offset: 1, alpha: 1 }];
                }
            }
            self._updateAlphaToggleStyle();
            self._renderAlphaRows();
            self._on_change();
            lucide.createIcons();
        });

        lucide.createIcons();
    }

    _updateAlphaToggleStyle() {
        if (this.with_alpha) {
            this.alphaToggle.className = 'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100';
        } else {
            this.alphaToggle.className = 'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0 bg-white text-slate-500 border-slate-200 hover:bg-slate-50';
        }
    }

    _renderAlphaRows() {
        const self = this;
        this.alphaRowsWrapper.innerHTML = '';
        if (!this.with_alpha) return;
        this.alphaStops.forEach(a => this.alphaRowsWrapper.appendChild(this._buildAlphaRow(a)));
        const addAlphaBtn = document.createElement('button');
        addAlphaBtn.type = 'button';
        addAlphaBtn.className = 'w-full py-2 rounded-lg border-2 border-dashed border-slate-300 text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2 text-sm';
        addAlphaBtn.innerHTML = `<i data-lucide="plus" class="w-4 h-4"></i> ${t('addAlphaStop')}`;
        addAlphaBtn.addEventListener('click', () => {
            const stop = { offset: 1, alpha: 1 };
            self.alphaStops.push(stop);
            addAlphaBtn.before(self._buildAlphaRow(stop));
            self._on_change();
            lucide.createIcons();
        });
        this.alphaRowsWrapper.appendChild(addAlphaBtn);
    }

    // 位置控制组（滑杆 + 数字输入），颜色行与透明度行共用
    _buildSliderGroup(labelText, initialValue, onUpdate) {
        const group = document.createElement('div');
        group.className = 'flex items-center gap-2 flex-1 min-w-[180px]';
        const label = document.createElement('span');
        label.className = 'text-xs text-slate-500 shrink-0';
        label.textContent = labelText;
        group.appendChild(label);

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = 0; slider.max = 100; slider.step = 1;
        slider.value = initialValue;
        slider.className = 'flex-1 min-w-[60px]';
        group.appendChild(slider);

        const num = document.createElement('input');
        num.type = 'number';
        num.min = 0; num.max = 100;
        num.value = initialValue;
        num.className = 'w-12 px-1 py-1 rounded-md bg-white border border-slate-200 text-xs text-center';
        group.appendChild(num);
        group.appendChild(document.createTextNode('%'));

        const update = (value) => {
            let v = Number(value);
            if (isNaN(v) || v < 0) v = 0;
            if (v > 100) v = 100;
            slider.value = v;
            num.value = v;
            onUpdate(v / 100);
        };
        slider.addEventListener('input', () => update(slider.value));
        num.addEventListener('input', () => update(num.value));
        return group;
    }

    _buildColorRow(color) {
        const self = this;
        const row = document.createElement('div');
        row.className = 'bg-slate-50 rounded-xl p-2 flex flex-wrap items-center gap-x-3 gap-y-2';

        const leftGroup = document.createElement('div');
        leftGroup.className = 'flex items-center gap-1 shrink-0';
        row.appendChild(leftGroup);

        const colorPickerWrapper = document.createElement('div');
        colorPickerWrapper.className = 'w-7 h-7 rounded-lg border border-slate-300 overflow-hidden flex-shrink-0';
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = color.color;
        colorPicker.className = 'w-full h-full p-0 cursor-pointer border-0';
        colorPickerWrapper.appendChild(colorPicker);
        leftGroup.appendChild(colorPickerWrapper);

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50';
        deleteBtn.innerHTML = '<i data-lucide="trash-2" class="w-3.5 h-3.5"></i>';
        deleteBtn.addEventListener('click', () => {
            if (self.colors.length <= 2) { showToast(t('minStopsWarning'), 'info'); return; }
            row.remove();
            self.colors.splice(self.colors.indexOf(color), 1);
            self._on_change();
        });
        leftGroup.appendChild(deleteBtn);

        const hexInput = document.createElement('input');
        hexInput.type = 'text';
        hexInput.value = color.color.slice(1);
        hexInput.className = 'w-16 px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono uppercase text-center shrink-0';
        row.appendChild(hexInput);

        row.appendChild(this._buildSliderGroup(t('position'), Math.round(color.offset * 100), (v) => {
            color.offset = v;
            self._debounced_change();
        }));

        colorPicker.addEventListener('input', () => {
            color.color = colorPicker.value;
            hexInput.value = colorPicker.value.slice(1);
            self._debounced_change();
        });

        hexInput.addEventListener('input', () => {
            const match = hexInput.value.match(/^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);
            if (match) {
                let hexValue = '#' + match[1];
                if (hexValue.length === 4) {
                    hexValue = '#' + hexValue[1] + hexValue[1] + hexValue[2] + hexValue[2] + hexValue[3] + hexValue[3];
                }
                color.color = hexValue;
                colorPicker.value = hexValue;
                self._debounced_change();
            }
        });

        return row;
    }

    _buildAlphaRow(stop) {
        const self = this;
        const row = document.createElement('div');
        row.className = 'bg-slate-50 rounded-xl p-2 flex flex-wrap items-center gap-x-3 gap-y-2';

        row.appendChild(this._buildSliderGroup(t('position'), Math.round(stop.offset * 100), (v) => {
            stop.offset = v;
            self._debounced_change();
        }));
        row.appendChild(this._buildSliderGroup(t('alpha'), Math.round(stop.alpha * 100), (v) => {
            stop.alpha = v;
            self._debounced_change();
        }));

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 shrink-0';
        deleteBtn.innerHTML = '<i data-lucide="trash-2" class="w-3.5 h-3.5"></i>';
        deleteBtn.addEventListener('click', () => {
            if (self.alphaStops.length <= 2) { showToast(t('minStopsWarning'), 'info'); return; }
            row.remove();
            self.alphaStops.splice(self.alphaStops.indexOf(stop), 1);
            self._on_change();
        });
        row.appendChild(deleteBtn);

        return row;
    }

    _debounced_change() {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => this._on_change(), 100);
    }

    _on_change() {
        this.preview.style.background = this.to_css();
        if (this.on_change) this.on_change(this.to_lottie());
    }

    to_css() {
        const colors = [...this.colors].sort((a, b) => a.offset - b.offset);
        if (colors.length === 0) return 'transparent';
        const alphas = this.with_alpha && this.alphaStops.length > 0
            ? [...this.alphaStops].sort((a, b) => a.offset - b.offset)
            : null;
        const offsets = [...new Set([
            ...colors.map(c => c.offset),
            ...(alphas ? alphas.map(a => a.offset) : [])
        ])].sort((a, b) => a - b);
        const stops = offsets.map(o => {
            const rgb = samplePiecewise(colors, o, c => hexToRgbArr(c.color));
            const alpha = alphas ? samplePiecewise(alphas, o, a => a.alpha) : 1;
            const [r, g, b] = rgb.map(Math.round);
            return `rgba(${r}, ${g}, ${b}, ${truncate_float(alpha)}) ${Math.round(o * 100)}%`;
        });
        return `linear-gradient(90deg, ${stops.join(', ')})`;
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
    listEl.innerHTML = `<div class="text-center py-8 text-slate-400"><i data-lucide="sparkles" class="w-10 h-10 mx-auto mb-2 opacity-50"></i><p class="text-sm">${t('noJsonUploaded')}</p></div>`;
    lucide.createIcons();
}

function renderEditorEmptyState() {
    const titleEl = document.getElementById('editor-title');
    const editorEl = document.getElementById('editor');
    gradientEditorInstance = null;
    if (titleEl) {
        titleEl.innerHTML = '<i data-lucide="sliders" class="w-4 h-4 text-green-500"></i>';
        titleEl.appendChild(document.createTextNode(t('noGradientSelected')));
    }
    if (editorEl) {
        editorEl.innerHTML = `<div class="text-center py-8 text-slate-400"><i data-lucide="mouse-pointer-click" class="w-10 h-10 mx-auto mb-2 opacity-50"></i><p class="text-sm">${t('clickGradientToEdit')}</p></div>`;
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
        listEl.innerHTML = `<div class="text-center py-8 text-slate-400"><p class="text-sm">${t('noGradientsFound')}</p></div>`;
        selectedGradient = null;
        renderEditorEmptyState();
        return;
    }

    listEl.innerHTML = '';
    let selectionStillValid = false;
    gradients.forEach(g => {
        const item = document.createElement('div');
        item.className = 'gradient-item rounded-lg p-3 cursor-pointer';
        item.tabIndex = 0;
        item.setAttribute('role', 'button');

        const inner = document.createElement('div');
        inner.className = 'flex items-center gap-3';
        const num = document.createElement('span');
        num.className = 'text-xs font-mono text-slate-400 w-6 shrink-0';
        num.textContent = String(g.index + 1);
        const nameSpan = document.createElement('span');
        nameSpan.className = 'gradient-name flex-1 text-sm font-medium text-slate-700 truncate';
        nameSpan.textContent = g.displayName;
        nameSpan.title = g.displayName;
        inner.appendChild(num);
        inner.appendChild(nameSpan);
        if (g.keyframed) {
            const badge = document.createElement('span');
            badge.className = 'text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 shrink-0';
            badge.textContent = t('keyframedBadge');
            inner.appendChild(badge);
        }
        const chevron = document.createElement('i');
        chevron.setAttribute('data-lucide', 'chevron-right');
        chevron.className = 'w-4 h-4 text-slate-400 shrink-0';
        inner.appendChild(chevron);
        item.appendChild(inner);

        if (selectedGradient && selectedGradient.index === g.index) {
            item.classList.add('selected');
            selectionStillValid = true;
        }

        const select = () => {
            selectedGradient = { index: g.index, displayName: g.displayName };
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

    titleEl.innerHTML = '<i data-lucide="sliders" class="w-4 h-4 text-green-500"></i>';
    titleEl.appendChild(document.createTextNode(selectedGradient.displayName));

    const { arr, keyframed } = unwrapGradientK(target.g);
    if (keyframed) {
        editorEl.innerHTML = `<div class="text-center py-8 px-4 text-slate-400"><i data-lucide="film" class="w-10 h-10 mx-auto mb-2 opacity-50"></i><p class="text-sm">${t('animatedGradientNotice')}</p></div>`;
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
                item.style.display = name.includes(searchTerm) ? 'block' : 'none';
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
        bgAlphaBtn.classList.remove('bg-blue-100', 'text-blue-600');
        bgAlphaBtn.classList.add('text-slate-400');
    });
    bgAlphaBtn.addEventListener('click', () => {
        animationContainer.style.backgroundColor = '';
        animationContainer.classList.add('alpha-checkered');
        bgAlphaBtn.classList.add('bg-blue-100', 'text-blue-600');
        bgAlphaBtn.classList.remove('text-slate-400');
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
        requestAnimationFrame(() => {
            gifModalOverlay.classList.remove('opacity-0');
            const content = gifModal.querySelector('.gif-modal-content');
            if (content) {
                content.classList.remove('scale-95', 'opacity-0');
                content.classList.add('scale-100', 'opacity-100');
            }
        });
        lucide.createIcons();
    }

    function closeGifModal() {
        if (!gifModal) return;
        gifModalOverlay.classList.add('opacity-0');
        const content = gifModal.querySelector('.gif-modal-content');
        if (content) {
            content.classList.remove('scale-100', 'opacity-100');
            content.classList.add('scale-95', 'opacity-0');
        }
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
        requestAnimationFrame(() => {
            modalOverlay.classList.remove('opacity-0');
            const modalContent = helpModal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.classList.remove('scale-95', 'opacity-0');
                modalContent.classList.add('scale-100', 'opacity-100');
            }
        });
        lucide.createIcons();
    }

    function closeHelpModal() {
        modalOverlay.classList.add('opacity-0');
        const modalContent = helpModal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.remove('scale-100', 'opacity-100');
            modalContent.classList.add('scale-95', 'opacity-0');
        }
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

    // ----- 预览容器保持正方形 -----
    // 桌面锁高布局下 CSS 无法同时受宽、高约束并保持比例，
    // 取可用区域的 min(宽, 高) 作为边长
    const lottieBox = document.getElementById('lottie-animation');
    if (lottieBox && dropZone) {
        function fitPreviewBox() {
            if (window.matchMedia('(min-width: 1024px)').matches) {
                const cs = getComputedStyle(dropZone);
                const contentW = dropZone.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
                const contentH = dropZone.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
                const side = Math.floor(Math.min(contentW, contentH));
                if (side > 0) {
                    lottieBox.style.width = side + 'px';
                    lottieBox.style.height = side + 'px';
                }
            } else {
                lottieBox.style.width = '';
                lottieBox.style.height = '';
            }
        }
        new ResizeObserver(fitPreviewBox).observe(dropZone);
        window.addEventListener('resize', fitPreviewBox);
        fitPreviewBox();
    }

    // ----- gif.js 空闲预加载 -----
    if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => preloadGifJs().catch(() => {}), { timeout: 5000 });
    } else {
        setTimeout(() => preloadGifJs().catch(() => {}), 3000);
    }
});

// 响应式缩放 - 综合视口宽度 + 高分屏放大
(function () {
    function updateResponsiveScale() {
        const innerW = window.innerWidth;
        const screenW = window.screen.width;
        const dpr = window.devicePixelRatio || 1;

        // 按视口宽度取基准字号（对应 CSS 媒体查询断点）
        let baseSize = 14;
        if (innerW >= 4800) baseSize = 32;
        else if (innerW >= 3200) baseSize = 26;
        else if (innerW >= 2400) baseSize = 20;
        else if (innerW >= 1920) baseSize = 16;
        else if (innerW >= 1440) baseSize = 15;

        // 高分屏额外放大
        const is4K = (screenW >= 3840) || (screenW >= 2560 && dpr >= 2);
        const is2K = screenW >= 2560 && screenW < 3840;

        if (is4K) {
            document.documentElement.style.fontSize = Math.round(baseSize * 1.3) + 'px';
        } else if (is2K) {
            document.documentElement.style.fontSize = Math.round(baseSize * 1.15) + 'px';
        } else {
            // 普通屏幕：移除内联样式，让 CSS 媒体查询完全接管
            document.documentElement.style.fontSize = '';
        }
    }

    updateResponsiveScale();
    window.addEventListener('resize', updateResponsiveScale);
})();
