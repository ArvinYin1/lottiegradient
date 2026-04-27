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
        position: '位置',
        alpha: '透明度',
        noGradientsFound: 'JSON 文件中未找到渐变',
        noJsonUploaded: '上传 JSON 文件以查看渐变',
        selectToEdit: '点击左侧渐变开始编辑',
        gradientEditor: '渐变编辑器',
        alertNoContent: '没有可导出的内容',
        alertNoAnimation: '请先导入动画 JSON 文件',
        alertNoGradient: '未在文件中找到渐变数据',
        alertInvalidJson: '无效的 JSON 文件',
        alertJsonError: '编辑器中的 JSON 无效',
        syncSuccess: '成功同步 {count} 个渐变',
        syncFailed: '同步渐变失败',
        exportFailed: '导出失败',
        demoVideo: '使用演示',
        videoTutorial: '视频教程',
        aboutTool: '关于本工具',
        exportGif: '导出 GIF',
        exporting: '正在导出...',
        cancelExport: '取消导出',
        fps: '帧率 (FPS)',
        width: '宽度 (px)',
        height: '高度 (px)',
        colors: '颜色数量',
        exportSettings: '导出设置',
        startExport: '开始导出',
        maxFramesWarning: '帧数过多，已限制为 500 帧',
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
        position: 'Position',
        alpha: 'Alpha',
        noGradientsFound: 'No gradients found in JSON file',
        noJsonUploaded: 'Upload JSON file to view gradients',
        selectToEdit: 'Click a gradient on the left to start editing',
        gradientEditor: 'Gradient Editor',
        alertNoContent: 'No content to export',
        alertNoAnimation: 'Please import animation JSON file first',
        alertNoGradient: 'No gradient data found in file',
        alertInvalidJson: 'Invalid JSON file',
        alertJsonError: 'Invalid JSON in editor',
        syncSuccess: 'Successfully synced {count} gradients',
        syncFailed: 'Failed to sync gradients',
        exportFailed: 'Export failed',
        demoVideo: 'Demo',
        videoTutorial: 'Video Tutorial',
        aboutTool: 'About This Tool',
        exportGif: 'Export GIF',
        exporting: 'Exporting...',
        cancelExport: 'Cancel',
        fps: 'FPS',
        width: 'Width (px)',
        height: 'Height (px)',
        colors: 'Colors',
        exportSettings: 'Export Settings',
        startExport: 'Start Export',
        maxFramesWarning: 'Too many frames, limited to 500',
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
    
    // 更新 lang 属性
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    
    // 更新语言按钮文本
    const langText = document.getElementById('lang-text');
    if (langText) {
        langText.textContent = lang === 'zh' ? 'EN' : '中文';
    }
    
    // 更新所有带 data-i18n 的元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang][key]) {
            // 保留内部 HTML 标签
            if (el.innerHTML.includes('<')) {
                const temp = document.createElement('div');
                temp.innerHTML = i18n[lang][key];
                // 只替换文本节点，保留子元素
                const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
                const textNodes = [];
                while (walker.nextNode()) {
                    textNodes.push(walker.currentNode);
                }
                // 简单替换整个内容
                el.innerHTML = i18n[lang][key];
            } else {
                el.textContent = i18n[lang][key];
            }
        }
    });
    
    // 更新 placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (i18n[lang][key]) {
            el.placeholder = i18n[lang][key];
        }
    });
    
    // 更新副标题
    const subtitleEl = document.querySelector('header p.text-xs');
    if (subtitleEl && subtitleEl.getAttribute('data-i18n') === 'subtitle') {
        subtitleEl.textContent = i18n[lang].subtitle;
    }
    
    // 更新空状态消息
    const gradientNamesList = document.getElementById('gradient-names-list');
    if (gradientNamesList) {
        const emptyState = gradientNamesList.querySelector('.text-center.py-8');
        if (emptyState && emptyState.querySelector('[data-lucide="sparkles"]')) {
            const p = emptyState.querySelector('p');
            if (p) p.textContent = i18n[lang].noJsonUploaded;
        }
    }
    
    // 更新编辑器空状态
    const editor = document.getElementById('editor');
    if (editor) {
        const emptyState = editor.querySelector('.text-center.py-8');
        if (emptyState && emptyState.querySelector('[data-lucide="mouse-pointer-click"]')) {
            const p = emptyState.querySelector('p');
            if (p) p.textContent = i18n[lang].selectToEdit;
        }
    }
    
    // 更新帮助按钮弹窗中的副标题
    const modalSubtitle = document.querySelector('#help-modal p.text-xs.text-slate-500');
    if (modalSubtitle && modalSubtitle.textContent.includes('Lottie Gradient Editor')) {
        // 保持版本号，只更新工具名
    }
    
    // 刷新渐变编辑器语言
    if (gradientEditorInstance) {
        gradientEditorInstance.refreshLanguage();
    }
}

function toggleLanguage() {
    const newLang = currentLang === 'zh' ? 'en' : 'zh';
    updateLanguage(newLang);
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    updateLanguage(currentLang);
    lucide.createIcons();
});

function truncate_float(num) { return Math.round(num * 1000) / 1000; }

function color_lottie_to_hex(lottie) {
    let r = Math.round(lottie[0] * 255).toString(16).padStart(2, '0');
    let g = Math.round(lottie[1] * 255).toString(16).padStart(2, '0');
    let b = Math.round(lottie[2] * 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}

function color_hex_to_lottie(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
}

function compressJson(obj, precision = 3) {
    let jsonStr = JSON.stringify(obj, null, 0);
    const regex = new RegExp(`\\b\\d+\\.\\d{${precision + 1},}\\b`, 'g');
    jsonStr = jsonStr.replace(regex, (match) => parseFloat(match).toFixed(precision));
    return jsonStr;
}

class GradientPreviewEditor {
    constructor(parent, lottie, color_count, on_change, dynamic_count = false) {
        this.on_change = on_change;
        let rgbStopCount;
        this.with_alpha = false;
        
        // Handle empty or invalid lottie data
        if (!lottie || lottie.length === 0) {
            lottie = [0, 0.231, 0.51, 0.965, 1, 0.976, 0.451, 0.086]; // Default gradient: Blue to Orange
            color_count = 2;
        }
        
        if (lottie.length === color_count * 6) {
            this.with_alpha = true;
            rgbStopCount = color_count;
        } else if (lottie.length === color_count * 4) {
            this.with_alpha = false;
            rgbStopCount = color_count;
        } else {
            if (lottie.length % 6 === 0) {
                this.with_alpha = true;
                color_count = lottie.length / 6;
                rgbStopCount = color_count;
            } else if (lottie.length % 4 === 0) {
                this.with_alpha = false;
                color_count = lottie.length / 4;
                rgbStopCount = color_count;
            } else {
                this.with_alpha = false;
                color_count = Math.floor(lottie.length / 4);
                rgbStopCount = color_count;
            }
        }
        let self = this;
        this.colors = [];
        this.debounceTimer = null;

        // Clear parent element (remove any placeholder content)
        parent.innerHTML = '';

        const container = document.createElement('div');
        container.className = 'space-y-4';
        parent.appendChild(container);

        const previewWrapper = document.createElement('div');
        previewWrapper.className = 'alpha-checkered rounded-lg p-1';
        container.appendChild(previewWrapper);

        this.preview = document.createElement('div');
        this.preview.className = 'gradient-preview-bar';
        this.preview.style.background = this.to_css();
        previewWrapper.appendChild(this.preview);

        const alphaToggleWrapper = document.createElement('div');
        alphaToggleWrapper.className = 'flex justify-end';
        const alphaToggle = document.createElement('button');
        alphaToggle.type = 'button';
        alphaToggle.textContent = t('enableAlpha');
        alphaToggleWrapper.appendChild(alphaToggle);
        container.appendChild(alphaToggleWrapper);

        function updateAlphaToggleStyle() {
            if (self.with_alpha) {
                alphaToggle.className = 'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100';
            } else {
                alphaToggle.className = 'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0 bg-white text-slate-500 border-slate-200 hover:bg-slate-50';
            }
        }
        updateAlphaToggleStyle();

        this.check_alpha = alphaToggle;
        alphaToggle.addEventListener('click', () => {
            self.with_alpha = !self.with_alpha;
            updateAlphaToggleStyle();
            for (let color of self.colors) {
                color.alpha_input.disabled = !self.with_alpha;
                if (color.alpha_slider) color.alpha_slider.disabled = !self.with_alpha;
                color.alpha_label.classList.toggle('opacity-50', !self.with_alpha);
            }
            self._on_change();
        });

        this.colorsContainer = document.createElement('div');
        this.colorsContainer.className = 'space-y-2';
        container.appendChild(this.colorsContainer);

        if (lottie && lottie.length > 0) {
            for (let i = 0; i < color_count; i++) {
                const offset = lottie[i * 4];
                const rgb = lottie.slice(i * 4 + 1, i * 4 + 4);
                let alpha = 1;
                if (this.with_alpha) {
                    const alphaOffsetIndex = color_count * 4 + i * 2;
                    alpha = lottie[alphaOffsetIndex + 1];
                }
                this.add_color(offset, color_lottie_to_hex(rgb), alpha, dynamic_count);
            }
        }

        if (dynamic_count) {
            const addBtn = document.createElement('button');
            addBtn.className = 'w-full py-2 rounded-lg border-2 border-dashed border-slate-300 text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2';
            addBtn.innerHTML = `<i data-lucide="plus" class="w-4 h-4"></i> ${t('addStop')}`;
            addBtn.addEventListener('click', () => {
                self.add_color(1, '#000000', 1, true);
                self._on_change();
                lucide.createIcons();
            });
            container.appendChild(addBtn);
        }
        lucide.createIcons();
    }

    add_color(offset, hex, alpha, dynamic_count) {
        let self = this;
        let color = { offset: offset, color: hex, alpha: alpha };
        this.colors.push(color);

        const colorRow = document.createElement('div');
        colorRow.className = 'bg-slate-50 rounded-xl p-2 flex items-center gap-3';
        this.colorsContainer.appendChild(colorRow);

        // 左侧：颜色选择器 + 删除按钮
        const leftGroup = document.createElement('div');
        leftGroup.className = 'flex items-center gap-1 shrink-0';
        colorRow.appendChild(leftGroup);

        const colorPickerWrapper = document.createElement('div');
        colorPickerWrapper.className = 'w-7 h-7 rounded-lg border border-slate-300 overflow-hidden flex-shrink-0';
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = color.color;
        colorPicker.className = 'w-full h-full p-0 cursor-pointer border-0';
        colorPickerWrapper.appendChild(colorPicker);
        leftGroup.appendChild(colorPickerWrapper);

        if (dynamic_count) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50';
            deleteBtn.innerHTML = '<i data-lucide="trash-2" class="w-3.5 h-3.5"></i>';
            deleteBtn.addEventListener('click', () => {
                colorRow.remove();
                self.colors.splice(self.colors.indexOf(color), 1);
                self._on_change();
            });
            leftGroup.appendChild(deleteBtn);
        }

        // 中间：HEX 输入
        const hexInput = document.createElement('input');
        hexInput.type = 'text';
        hexInput.value = color.color;
        hexInput.className = 'w-20 px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono uppercase text-center shrink-0';
        colorRow.appendChild(hexInput);

        // 右侧：位置和透明度控制
        const rightGroup = document.createElement('div');
        rightGroup.className = 'flex-1 flex items-center gap-3';
        colorRow.appendChild(rightGroup);

        // 位置控制
        const posContainer = document.createElement('div');
        posContainer.className = 'flex-1 flex items-center gap-2';
        posContainer.innerHTML = `<span class="text-xs text-slate-500 shrink-0">${t('position')}</span>`;
        rightGroup.appendChild(posContainer);

        const posSlider = document.createElement('input');
        posSlider.type = 'range';
        posSlider.min = 0;
        posSlider.max = 100;
        posSlider.step = 1;
        posSlider.value = Math.round(color.offset * 100);
        posSlider.className = 'flex-1 min-w-[60px]';
        posContainer.appendChild(posSlider);

        const posInput = document.createElement('input');
        posInput.type = 'number';
        posInput.min = 0;
        posInput.max = 100;
        posInput.value = Math.round(color.offset * 100);
        posInput.className = 'w-12 px-1 py-1 rounded-md bg-white border border-slate-200 text-xs text-center';
        posContainer.appendChild(posInput);

        posContainer.appendChild(document.createTextNode('%'));

        // 透明度控制
        const alphaContainer = document.createElement('div');
        alphaContainer.className = 'flex-1 flex items-center gap-2';
        alphaContainer.innerHTML = `<span class="alpha-label text-xs text-slate-500 shrink-0">${t('alpha')}</span>`;
        rightGroup.appendChild(alphaContainer);

        const alphaSlider = document.createElement('input');
        alphaSlider.type = 'range';
        alphaSlider.min = 0;
        alphaSlider.max = 100;
        alphaSlider.step = 1;
        alphaSlider.value = Math.round(color.alpha * 100);
        alphaSlider.disabled = !this.with_alpha;
        alphaSlider.className = 'flex-1 min-w-[60px]';
        alphaContainer.appendChild(alphaSlider);

        const alphaInput = document.createElement('input');
        alphaInput.type = 'number';
        alphaInput.min = 0;
        alphaInput.max = 100;
        alphaInput.value = Math.round(color.alpha * 100);
        alphaInput.disabled = !this.with_alpha;
        alphaInput.className = 'w-12 px-1 py-1 rounded-md bg-white border border-slate-200 text-xs text-center disabled:opacity-50';
        alphaContainer.appendChild(alphaInput);

        alphaContainer.appendChild(document.createTextNode('%'));

        colorPicker.addEventListener('input', () => {
            color.color = colorPicker.value;
            hexInput.value = colorPicker.value;
            self._debounced_change();
        });

        hexInput.addEventListener('input', () => {
            const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            const match = hexInput.value.match(hexRegex);
            if (match) {
                let hexValue = match[1];
                if (!hexInput.value.startsWith('#')) hexValue = '#' + hexValue;
                if (hexValue.length === 4) {
                    hexValue = '#' + hexValue[1] + hexValue[1] + hexValue[2] + hexValue[2] + hexValue[3] + hexValue[3];
                }
                color.color = hexValue;
                colorPicker.value = hexValue;
                hexInput.value = hexValue;
                self._debounced_change();
            }
        });

        function updatePos(value) {
            let v = Number(value);
            if (isNaN(v) || v < 0) v = 0;
            if (v > 100) v = 100;
            color.offset = v / 100;
            posSlider.value = v;
            posInput.value = v;
            self._debounced_change();
        }

        posSlider.addEventListener('input', () => updatePos(posSlider.value));
        posInput.addEventListener('input', () => updatePos(posInput.value));

        function updateAlpha(value) {
            let v = Number(value);
            if (isNaN(v) || v < 0) v = 0;
            if (v > 100) v = 100;
            color.alpha = v / 100;
            alphaSlider.value = v;
            alphaInput.value = v;
            self._debounced_change();
        }

        alphaSlider.addEventListener('input', () => updateAlpha(alphaSlider.value));
        alphaInput.addEventListener('input', () => updateAlpha(alphaInput.value));

        color.alpha_input = alphaInput;
        color.alpha_slider = alphaSlider;
        color.alpha_label = alphaContainer.querySelector('.alpha-label');
        lucide.createIcons();
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
        let stops = this.colors.map(c => {
            let r = parseInt(c.color.slice(1, 3), 16);
            let g = parseInt(c.color.slice(3, 5), 16);
            let b = parseInt(c.color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${c.alpha}) ${Math.round(c.offset * 100)}%`;
        });
        return `linear-gradient(90deg, ${stops.join(', ')})`;
    }

    to_lottie() {
        let result = [];
        for (let color of this.colors) {
            result.push(truncate_float(color.offset));
            result.push(...color_hex_to_lottie(color.color));
        }
        if (this.with_alpha) {
            for (let color of this.colors) {
                result.push(truncate_float(color.offset));
                result.push(truncate_float(color.alpha));
            }
        }
        return result;
    }

    update(lottie, color_count) {
        // Clear existing colors and UI
        this.colorsContainer.innerHTML = '';
        this.colors = [];
        
        // If no gradient data is provided, just clear the editor
        if (!lottie || lottie.length === 0) {
            this.preview.style.background = 'transparent';
            return;
        }
        
        // Determine if gradient has alpha based on array length
        if (lottie.length === color_count * 6) {
            this.with_alpha = true;
            this.check_alpha.checked = true;
        } else if (lottie.length === color_count * 4) {
            this.with_alpha = false;
            this.check_alpha.checked = false;
        }
        
        for (let i = 0; i < color_count; i++) {
            const offset = lottie[i * 4];
            const rgb = lottie.slice(i * 4 + 1, i * 4 + 4);
            let alpha = 1;
            if (this.with_alpha) {
                const alphaOffsetIndex = color_count * 4 + i * 2;
                alpha = lottie[alphaOffsetIndex + 1];
            }
            this.add_color(offset, color_lottie_to_hex(rgb), alpha, true);
        }
        this.preview.style.background = this.to_css();
        lucide.createIcons();
    }

    static stand_alone(parent, on_change) {
        return new GradientPreviewEditor(parent, [0, 0.231, 0.51, 0.965, 1, 0.976, 0.451, 0.086], 2, on_change, true);
    }

    refreshLanguage() {
        // 更新"启用透明度"按钮文本
        if (this.check_alpha) {
            this.check_alpha.textContent = t('enableAlpha');
        }
        
        // 更新"添加色标"按钮文本
        const addBtn = this.colorsContainer?.parentElement?.querySelector('button:last-child');
        if (addBtn && addBtn.innerHTML.includes('plus')) {
            addBtn.innerHTML = `<i data-lucide="plus" class="w-4 h-4"></i> ${t('addStop')}`;
            lucide.createIcons();
        }
        
        // 更新每个颜色行的"位置"和"透明度"标签
        const colorRows = this.colorsContainer?.querySelectorAll(':scope > div');
        if (colorRows) {
            colorRows.forEach(row => {
                const labels = row.querySelectorAll('.text-xs.text-slate-500.shrink-0');
                labels.forEach((label, index) => {
                    if (index === 0) {
                        label.textContent = t('position');
                    } else if (index === 1) {
                        label.textContent = t('alpha');
                    }
                });
            });
        }
    }
}

// ========== GIF 导出器 ==========

class GifExporter {
    constructor(animationData) {
        this.animationData = JSON.parse(JSON.stringify(animationData));
        this.cancelled = false;
        this.worker = null;
        this.exportAnimation = null;
    }

    getAnimationInfo() {
        const data = this.animationData;
        return {
            width: data.w || 512,
            height: data.h || 512,
            frameRate: data.fr || 30,
            totalFrames: data.op - data.ip || 30,
            duration: (data.op - data.ip) / (data.fr || 30)
        };
    }

    createWorker() {
        const workerCode = `
            self.onmessage = async function(e) {
                const { frames, width, height } = e.data;
                try {
                    const { encode } = await import('https://unpkg.com/modern-gif@2.0.3/dist/index.mjs');
                    const gif = await encode({
                        width: width,
                        height: height,
                        frames: frames.map(f => ({
                            data: new Uint8Array(f.data),
                            delay: f.delay
                        }))
                    });
                    self.postMessage({ type: 'complete', blob: gif }, [gif]);
                } catch (err) {
                    self.postMessage({ type: 'error', message: err.message });
                }
            };
        `;
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        return new Worker(URL.createObjectURL(blob), { type: 'module' });
    }

    async export(options = {}) {
        const info = this.getAnimationInfo();
        const fps = Math.min(options.fps || info.frameRate, info.frameRate);
        const width = options.width || info.width;
        const height = options.height || info.height;
        const maxFrames = 500;

        const duration = info.totalFrames / info.frameRate;
        const totalFrames = Math.min(Math.round(duration * fps), maxFrames);
        const frameDelay = Math.round(100 / fps); // 单位为 0.01 秒

        // 创建隐藏 Canvas 容器
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.width = width + 'px';
        container.style.height = height + 'px';
        document.body.appendChild(container);

        // 用 Canvas 渲染器加载动画
        this.exportAnimation = bodymovin.loadAnimation({
            container: container,
            renderer: 'canvas',
            loop: false,
            autoplay: false,
            animationData: this.animationData
        });

        // 等待动画加载完成
        await new Promise((resolve) => {
            const onLoad = () => { resolve(); };
            this.exportAnimation.addEventListener('DOMLoaded', onLoad);
            // 兜底：最多等 3 秒
            setTimeout(resolve, 3000);
        });

        const canvas = container.querySelector('canvas');
        if (!canvas) {
            document.body.removeChild(container);
            throw new Error('Failed to create canvas renderer');
        }

        const frames = [];
        const onProgress = options.onProgress || (() => {});

        try {
            for (let i = 0; i < totalFrames; i++) {
                if (this.cancelled) throw new Error('Cancelled');

                const frameNum = (i / totalFrames) * (this.animationData.op - this.animationData.ip) + this.animationData.ip;
                this.exportAnimation.goToAndStop(frameNum, true);

                // 确保 Canvas 已更新
                await new Promise(r => requestAnimationFrame(r));
                await new Promise(r => setTimeout(r, 50));

                const ctx = canvas.getContext('2d');
                const imageData = ctx.getImageData(0, 0, width, height);

                frames.push({
                    data: imageData.data.buffer,
                    delay: frameDelay
                });

                onProgress(i + 1, totalFrames);
            }
        } finally {
            this.exportAnimation.destroy();
            if (container.parentNode) document.body.removeChild(container);
        }

        if (this.cancelled) throw new Error('Cancelled');

        // Worker 编码
        return await this.encodeInWorker(frames, width, height);
    }

    encodeInWorker(frames, width, height) {
        return new Promise((resolve, reject) => {
            this.worker = this.createWorker();

            this.worker.onmessage = (e) => {
                if (e.data.type === 'complete') {
                    resolve(e.data.blob);
                } else if (e.data.type === 'error') {
                    reject(new Error(e.data.message));
                }
                this.cleanup();
            };

            this.worker.onerror = (err) => {
                reject(err);
                this.cleanup();
            };

            this.worker.postMessage({
                frames: frames.map(f => ({ data: f.data, delay: f.delay })),
                width,
                height
            }, frames.map(f => f.data));
        });
    }

    cancel() {
        this.cancelled = true;
        this.cleanup();
    }

    cleanup() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
}

let animation = null;
let monacoEditor = null;
let gradientEditorInstance = null;
let selectedGradientInfo = null;
let isProgrammaticUpdate = false;

document.addEventListener('DOMContentLoaded', function() {
    // 语言切换按钮
    const langBtn = document.getElementById('lang-btn');
    if (langBtn) {
        langBtn.addEventListener('click', toggleLanguage);
    }
    
    const dropZone = document.getElementById('drop-zone');

    ['dragenter','dragover','dragleave','drop'].forEach(e => {
        dropZone.addEventListener(e, (ev) => { ev.preventDefault(); ev.stopPropagation(); }, false);
        document.body.addEventListener(e, (ev) => { ev.preventDefault(); ev.stopPropagation(); }, false);
    });

    ['dragenter','dragover'].forEach(e => dropZone.addEventListener(e, () => dropZone.classList.add('drag-over'), false));
    ['dragleave','drop'].forEach(e => dropZone.addEventListener(e, () => dropZone.classList.remove('drag-over'), false));

    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].name.endsWith('.json')) {
            document.getElementById('lottie-file').files = files;
            document.getElementById('lottie-file').dispatchEvent(new Event('change'));
        }
    }, false);

    gradientEditorInstance = GradientPreviewEditor.stand_alone(document.getElementById('editor'), (lottie) => {
        if (selectedGradientInfo) updateGradientInJson(lottie);
    });

    initializeLottiePlayer();
});

function updateGradientInJson(newGradientData) {
    if (!monacoEditor) return;
    try {
        const jsonContent = monacoEditor.getValue();
        const jsonData = JSON.parse(jsonContent);
        updateGradientInJsonData(jsonData, selectedGradientInfo, newGradientData, gradientEditorInstance.colors.length);
        const updatedJsonContent = JSON.stringify(jsonData, null, 2);
        if (updatedJsonContent !== jsonContent) {
            isProgrammaticUpdate = true;
            monacoEditor.setValue(updatedJsonContent);
            // Update animation directly without calling updateAnimationFromEditor
            const newJsonData = JSON.parse(updatedJsonContent);
            if (animation) {
                animation.destroy();
                const animationContainer = document.getElementById('lottie-animation');
                const progressBar = document.getElementById('animation-progress');
                animation = bodymovin.loadAnimation({
                    container: animationContainer,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    animationData: newJsonData
                });
                // Re-bind event listeners for the new animation
                animation.addEventListener('enterFrame', () => {
                    const isDragging = false; // Local state
                    if (!isDragging && animation && progressBar) {
                        progressBar.value = (animation.currentFrame / animation.totalFrames) * 100;
                        const timeDisplay = document.getElementById('time-display');
                        if (timeDisplay) {
                            const current = Math.round(animation.currentFrame);
                            const total = Math.round(animation.totalFrames);
                            timeDisplay.textContent = `${current} / ${total}`;
                        }
                    }
                });
            }
        }
    } catch (error) { console.error('Error updating gradient:', error); }
}

function updateGradientInJsonData(jsonData, gradientInfo, newGradientData, colorCount) {
    let updated = false;
    if (typeof jsonData === 'object' && jsonData !== null) {
        if ((jsonData.ty === 'gf' || jsonData.ty === 'gs') && jsonData.nm === gradientInfo.name) {
            if (jsonData.g) {
                if (jsonData.g.k && typeof jsonData.g.k === 'object' && 'k' in jsonData.g.k) {
                    jsonData.g.k.k = newGradientData;
                    if (jsonData.g.p !== undefined) jsonData.g.p = colorCount;
                } else {
                    jsonData.g.k = newGradientData;
                    if (jsonData.g.p !== undefined) jsonData.g.p = colorCount;
                }
                updated = true;
            }
        }
        if (!Array.isArray(jsonData)) {
            for (const key in jsonData) {
                if (jsonData.hasOwnProperty(key) && typeof jsonData[key] === 'object' && jsonData[key] !== null) {
                    if (updateGradientInJsonData(jsonData[key], gradientInfo, newGradientData, colorCount)) updated = true;
                }
            }
        } else {
            for (const item of jsonData) {
                if (updateGradientInJsonData(item, gradientInfo, newGradientData, colorCount)) updated = true;
            }
        }
    }
    return updated;
}

function initializeLottiePlayer() {
    let debounceTimer = null;
    const fileInput = document.getElementById('lottie-file');
    const fileInfo = document.getElementById('file-info');
    const filename = document.getElementById('filename');
    const animationContainer = document.getElementById('lottie-animation');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const progressBar = document.getElementById('animation-progress');
    const timeDisplay = document.getElementById('time-display');
    const bgColorPicker = document.getElementById('bg-color-picker');
    const bgAlphaBtn = document.getElementById('bg-alpha-btn');
    const editorTitle = document.getElementById('editor-title');
    const playIcon = '<i data-lucide="play" class="w-5 h-5"></i>';
    const pauseIcon = '<i data-lucide="pause" class="w-5 h-5"></i>';
    let isDragging = false;
    const exportGifBtn = document.getElementById('export-gif-btn');
    const gifExportPanel = document.getElementById('gif-export-panel');
    const closeGifPanel = document.getElementById('close-gif-panel');
    const startGifExport = document.getElementById('start-gif-export');
    const cancelGifExport = document.getElementById('cancel-gif-export');
    const gifProgressOverlay = document.getElementById('gif-progress-overlay');
    const gifProgressBar = document.getElementById('gif-progress-bar');
    const gifProgressText = document.getElementById('gif-progress-text');
    const gifFpsInput = document.getElementById('gif-fps');
    const gifWidthInput = document.getElementById('gif-width');
    const gifHeightInput = document.getElementById('gif-height');
    const gifColorsInput = document.getElementById('gif-colors');
    const gifFrameInfo = document.getElementById('gif-frame-info');
    let gifExporter = null;

    function initMonacoEditor() {
        require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.41.0/min/vs' } });
        require(['vs/editor/editor.main'], function() {
            const container = document.getElementById('monaco-editor-container');
            container.style.display = 'block';
            container.style.width = '100%';
            container.style.height = '400px';
            monacoEditor = monaco.editor.create(container, {
                value: '', language: 'json', theme: document.body.classList.contains('dark') ? 'vs-dark' : 'vs',
                automaticLayout: true, minimap: { enabled: true }, scrollBeyondLastLine: false, wordWrap: 'on',
                formatOnPaste: true, formatOnType: true, tabSize: 2
            });
            monaco.languages.json.jsonDefaults.setDiagnosticsOptions({ validate: true, schemas: [] });
            window.addEventListener('resize', () => monacoEditor.layout());
            monacoEditor.onDidChangeModelContent(() => {
                if (debounceTimer) clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    if (!isProgrammaticUpdate) updateAnimationFromEditor();
                    updateGradientNamesList();
                    isProgrammaticUpdate = false;
                }, 500);
            });
        });
    }
    if (typeof require !== 'undefined') setTimeout(initMonacoEditor, 100);

    const gradientSearch = document.getElementById('gradient-search');
    if (gradientSearch) {
        gradientSearch.addEventListener('input', function() {
            const searchTerm = gradientSearch.value.toLowerCase().trim();
            const gradientItems = document.querySelectorAll('.gradient-item');
            let visibleItems = 0;
            gradientItems.forEach(item => {
                const gradientName = item.querySelector('.gradient-name').textContent.toLowerCase();
                item.style.display = gradientName.includes(searchTerm) ? 'block' : 'none';
                if (gradientName.includes(searchTerm)) visibleItems++;
            });
        });
    }

    function loadAnimation(jsonData) {
        try {
            if (animation) { animation.destroy(); animation = null; }
            if (playPauseBtn) playPauseBtn.innerHTML = pauseIcon;
            if (progressBar) progressBar.value = 0;
            // Clear the container to remove placeholder content immediately
            animationContainer.innerHTML = '';
            animation = bodymovin.loadAnimation({
                container: animationContainer, renderer: 'svg', loop: true, autoplay: true, animationData: jsonData
            });
            animation.addEventListener('enterFrame', () => {
                if (!isDragging && animation && progressBar) {
                    progressBar.value = (animation.currentFrame / animation.totalFrames) * 100;
                    updateTimeDisplay();
                }
            });
            lucide.createIcons();
        } catch (error) {
            console.error('Error loading animation:', error);
            alert('Error loading animation: ' + error.message);
        }
    }

    function updateTimeDisplay() {
        if (!animation) return;
        const current = Math.round(animation.currentFrame);
        const total = Math.round(animation.totalFrames);
        timeDisplay.textContent = `${current} / ${total}`;
    }

    function updateJsonEditor(jsonData) {
        const jsonString = JSON.stringify(jsonData, null, 2);
        if (monacoEditor) monacoEditor.setValue(jsonString);
        document.getElementById('json-editor').value = jsonString;
    }

    function getJsonContent() {
        if (monacoEditor) return monacoEditor.getValue();
        return document.getElementById('json-editor').value;
    }

    function findAdobeGradientNames(jsonData) {
        const gradients = [];
        const foundNames = new Set();
        function traverse(obj, parent = null) {
            if (obj === null || typeof obj !== 'object') return;
            if ((obj.ty === 'gf' || obj.ty === 'gs') && obj.nm) {
                const name = obj.nm;
                if (!foundNames.has(name)) {
                    foundNames.add(name);
                    gradients.push({ name: name, gradientData: obj.g || {}, parent: parent });
                }
            }
            if (obj.shapes && Array.isArray(obj.shapes)) obj.shapes.forEach(s => traverse(s, obj));
            if (Array.isArray(obj)) obj.forEach(item => traverse(item, obj));
            else if (typeof obj === 'object') Object.values(obj).forEach(v => traverse(v, obj));
        }
        traverse(jsonData);
        return gradients;
    }

    function updateGradientNamesList() {
        const gradientNamesList = document.getElementById('gradient-names-list');
        const gradientSearch = document.getElementById('gradient-search');
        const gradientCount = document.getElementById('gradient-count');
        if (gradientSearch) gradientSearch.value = '';

        try {
            let jsonData = null;
            if (animation && animation.animationData) {
                jsonData = animation.animationData;
            } else {
                const jsonText = getJsonContent();
                if (jsonText.trim()) jsonData = JSON.parse(jsonText);
            }

            if (!jsonData) {
                gradientNamesList.innerHTML = `<div class="text-center py-8 text-slate-400"><i data-lucide="sparkles" class="w-10 h-10 mx-auto mb-2 opacity-50"></i><p class="text-sm">${t('noJsonUploaded')}</p></div>`;
                if (gradientCount) gradientCount.textContent = '0';
                lucide.createIcons();
                return;
            }

            const gradients = findAdobeGradientNames(jsonData);
            if (gradientCount) gradientCount.textContent = gradients.length;

            if (gradients.length === 0) {
                gradientNamesList.innerHTML = `<div class="text-center py-8 text-slate-400"><p>${t('noGradientsFound')}</p></div>`;
                clearSelectedGradient();
            } else {
                gradientNamesList.innerHTML = '';
                gradients.forEach((gradient, index) => {
                    const gradientItem = document.createElement('div');
                    gradientItem.className = 'gradient-item rounded-lg p-3 cursor-pointer';
                    if (selectedGradientInfo && selectedGradientInfo.name === gradient.name) {
                        gradientItem.classList.add('selected');
                    }
                    gradientItem.innerHTML = `<div class="flex items-center gap-3"><span class="text-xs font-mono text-slate-400 w-6">${index + 1}</span><span class="gradient-name flex-1 text-sm font-medium text-slate-700 truncate" title="${gradient.name}">${gradient.name}</span><i data-lucide="chevron-right" class="w-4 h-4 text-slate-400"></i></div>`;

                    gradientItem.addEventListener('click', () => {
                        selectedGradientInfo = { name: gradient.name, gradientData: gradient.gradientData };
                        if (editorTitle) editorTitle.innerHTML = `<i data-lucide="sliders" class="w-4 h-4 text-green-500"></i>${gradient.name}`;
                        document.querySelectorAll('.gradient-item').forEach(i => i.classList.remove('selected'));
                        gradientItem.classList.add('selected');

                        if (gradientEditorInstance && gradient.gradientData && gradient.gradientData.k) {
                            let gradientK = gradient.gradientData.k;
                            // Handle nested k structure
                            if (typeof gradientK === 'object' && gradientK !== null && gradientK.k) {
                                gradientK = gradientK.k;
                            }
                            // Ensure gradientK is an array
                            if (Array.isArray(gradientK) && gradientK.length > 0) {
                                const colorCount = gradient.gradientData.p || Math.floor(gradientK.length / 4);
                                gradientEditorInstance.update(gradientK, colorCount);
                            }
                        }

                        if (monacoEditor) {
                            const content = monacoEditor.getValue();
                            const searchText = `"nm":"${gradient.name}"`;
                            const idx = content.indexOf(searchText);
                            if (idx !== -1) {
                                const lines = content.substring(0, idx).split('\n');
                                const line = lines.length;
                                const column = lines[lines.length - 1].length + 1;
                                monacoEditor.setPosition({ lineNumber: line, column: column });
                                monacoEditor.revealPositionInCenter({ lineNumber: line, column: column });
                                monacoEditor.focus();
                            }
                        }
                        lucide.createIcons();
                    });
                    gradientNamesList.appendChild(gradientItem);
                });
                
                // Auto-select first gradient if none is selected
                if (!selectedGradientInfo && gradients.length > 0) {
                    const firstGradientItem = gradientNamesList.querySelector('.gradient-item');
                    if (firstGradientItem) {
                        firstGradientItem.click();
                    }
                }
            }
            lucide.createIcons();
        } catch (error) {
            console.error('updateGradientNamesList error:', error.message);
            gradientNamesList.innerHTML = `<div class="text-center py-8 text-slate-400"><p>${t('noGradientsFound')}</p></div>`;
            clearSelectedGradient();
        }
    }

    function clearSelectedGradient() {
        selectedGradientInfo = null;
        const editorTitle = document.getElementById('editor-title');
        const editor = document.getElementById('editor');
        if (editorTitle) editorTitle.innerHTML = `<i data-lucide="sliders" class="w-4 h-4 text-green-500"></i>${t('noGradientSelected')}`;
        if (editor) {
            editor.innerHTML = `<div class="text-center py-8 text-slate-400"><i data-lucide="mouse-pointer-click" class="w-10 h-10 mx-auto mb-2 opacity-50"></i><p class="text-sm">${t('clickGradientToEdit')}</p></div>`;
        }
        lucide.createIcons();
    }

    function updateAnimationFromEditor() {
        const jsonText = getJsonContent();
        if (!jsonText.trim()) { alert(t('alertNoAnimation')); return; }
        try {
            const jsonData = JSON.parse(jsonText);
            loadAnimation(jsonData);
            updateGradientNamesList();
        } catch (error) {
            console.error('JSON parse error:', error);
            alert(t('alertJsonError') + ': ' + error.message);
        }
    }

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            fileInfo.classList.remove('hidden');
            filename.textContent = file.name;
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    let fileContent = e.target.result;
                    if (fileContent.startsWith('\ufeff')) fileContent = fileContent.slice(1);
                    const jsonData = JSON.parse(fileContent);
                    updateJsonEditor(jsonData);
                    loadAnimation(jsonData);
                    if (exportGifBtn) exportGifBtn.disabled = false;
                    updateGradientNamesList();
                } catch (error) {
                    console.error('JSON parse error:', error);
                    alert(t('alertInvalidJson') + ': ' + error.message);
                    fileInfo.classList.add('hidden');
                }
            };
            reader.readAsText(file);
        }
    });

    document.getElementById('export-btn').addEventListener('click', () => {
        const jsonText = getJsonContent();
        if (!jsonText.trim()) { alert(t('alertNoContent')); return; }
        try {
            const jsonData = JSON.parse(jsonText);
            const compressed = compressJson(jsonData);
            const blob = new Blob([compressed], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'lottie_animation.json';
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            alert(t('exportFailed') + ': ' + error.message);
        }
    });

    const gradientFileInput = document.getElementById('gradient-file');
    gradientFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                let fileContent = e.target.result;
                if (fileContent.startsWith('\ufeff')) fileContent = fileContent.slice(1);
                const jsonData = JSON.parse(fileContent);
                const gradients = extractGradientsFromJson(jsonData);
                if (gradients.length === 0) { alert(t('alertNoGradient')); return; }

                const currentJsonText = getJsonContent();
                if (!currentJsonText.trim()) { alert(t('alertNoAnimation')); return; }
                const currentJsonData = JSON.parse(currentJsonText);

                gradients.forEach(gradient => {
                    applyGradientToAnimation(currentJsonData, gradient.name, gradient.data, gradient.colorCount);
                });

                const updatedJsonContent = JSON.stringify(currentJsonData, null, 2);
                if (monacoEditor) monacoEditor.setValue(updatedJsonContent);
                document.getElementById('json-editor').value = updatedJsonContent;
                updateAnimationFromEditor();
                alert(t('syncSuccess', { count: gradients.length }));
            } catch (error) {
                console.error('Error syncing gradients:', error);
                alert(t('syncFailed') + ': ' + error.message);
            }
        };
        reader.readAsText(file);
    });

    function extractGradientsFromJson(jsonData) {
        if (jsonData.gradients && Array.isArray(jsonData.gradients)) return jsonData.gradients;
        const gradients = [];
        const foundNames = new Set();
        function traverse(obj) {
            if (obj === null || typeof obj !== 'object') return;
            if ((obj.ty === 'gf' || obj.ty === 'gs') && obj.nm && obj.g) {
                const name = obj.nm;
                if (!foundNames.has(name)) {
                    foundNames.add(name);
                    let gradientData = obj.g;
                    let gradientK = gradientData.k;
                    if (typeof gradientK === 'object' && gradientK !== null && gradientK.k) gradientK = gradientK.k;
                    gradients.push({ name: name, data: gradientK, colorCount: gradientData.p || Math.floor(gradientK.length / 4) });
                }
            }
            if (Array.isArray(obj)) obj.forEach(traverse);
            else if (typeof obj === 'object') Object.values(obj).forEach(traverse);
        }
        traverse(jsonData);
        return gradients;
    }

    function applyGradientToAnimation(jsonData, gradientName, gradientData, colorCount) {
        function traverse(obj) {
            if (obj === null || typeof obj !== 'object') return false;
            if ((obj.ty === 'gf' || obj.ty === 'gs') && obj.nm === gradientName) {
                if (obj.g) {
                    if (obj.g.k && typeof obj.g.k === 'object' && 'k' in obj.g.k) {
                        obj.g.k.k = gradientData;
                        if (obj.g.p !== undefined) obj.g.p = colorCount;
                    } else {
                        obj.g.k = gradientData;
                        if (obj.g.p !== undefined) obj.g.p = colorCount;
                    }
                    return true;
                }
            }
            if (Array.isArray(obj)) return obj.some(traverse);
            if (typeof obj === 'object') return Object.values(obj).some(traverse);
            return false;
        }
        return traverse(jsonData);
    }

    playPauseBtn.addEventListener('click', () => {
        if (!animation) return;
        if (animation.isPaused) { animation.play(); playPauseBtn.innerHTML = pauseIcon; }
        else { animation.pause(); playPauseBtn.innerHTML = playIcon; }
        lucide.createIcons();
    });

    progressBar.addEventListener('input', () => {
        isDragging = true;
        if (animation) {
            const frame = (progressBar.value / 100) * animation.totalFrames;
            animation.goToAndStop(frame, true);
            updateTimeDisplay();
        }
    });
    progressBar.addEventListener('change', () => {
        isDragging = false;
    });

    bgColorPicker.addEventListener('input', () => {
        animationContainer.style.backgroundColor = bgColorPicker.value;
        animationContainer.classList.remove('alpha-checkered');
        bgAlphaBtn.classList.remove('bg-blue-100', 'text-blue-600');
        bgAlphaBtn.classList.add('text-slate-400');
    });

    if (exportGifBtn) {
        exportGifBtn.addEventListener('click', () => {
            if (!animation) { alert(t('alertNoAnimation')); return; }
            gifExportPanel.classList.toggle('hidden');
            if (!gifExportPanel.classList.contains('hidden')) {
                const data = animation.animationData;
                const fr = data.fr || 30;
                const w = data.w || 512;
                const h = data.h || 512;
                const totalFrames = Math.round(data.op - data.ip);
                if (gifFpsInput) gifFpsInput.value = Math.min(fr, 30);
                if (gifWidthInput) gifWidthInput.value = w;
                if (gifHeightInput) gifHeightInput.value = h;
                if (gifFrameInfo) {
                    const fps = parseInt(gifFpsInput?.value || fr);
                    const frames = Math.min(Math.round((totalFrames / fr) * fps), 500);
                    gifFrameInfo.textContent = `${frames} 帧 / ${(frames / fps).toFixed(1)} 秒`;
                }
            }
        });
    }

    if (closeGifPanel) {
        closeGifPanel.addEventListener('click', () => {
            gifExportPanel.classList.add('hidden');
        });
    }

    let lastRatio = 1;
    if (gifWidthInput && gifHeightInput) {
        gifWidthInput.addEventListener('focus', () => {
            const w = parseInt(gifWidthInput.value) || 1;
            const h = parseInt(gifHeightInput.value) || 1;
            lastRatio = h / w;
        });
        gifWidthInput.addEventListener('input', () => {
            const w = parseInt(gifWidthInput.value) || 1;
            gifHeightInput.value = Math.round(w * lastRatio);
            updateFrameInfo();
        });
        gifHeightInput.addEventListener('focus', () => {
            const w = parseInt(gifWidthInput.value) || 1;
            const h = parseInt(gifHeightInput.value) || 1;
            lastRatio = w / h;
        });
        gifHeightInput.addEventListener('input', () => {
            const h = parseInt(gifHeightInput.value) || 1;
            gifWidthInput.value = Math.round(h * lastRatio);
            updateFrameInfo();
        });
    }

    function updateFrameInfo() {
        if (!gifFrameInfo || !animation) return;
        const data = animation.animationData;
        const fr = data.fr || 30;
        const totalFrames = Math.round(data.op - data.ip);
        const fps = parseInt(gifFpsInput?.value || fr);
        const frames = Math.min(Math.round((totalFrames / fr) * fps), 500);
        const duration = (frames / fps).toFixed(1);
        gifFrameInfo.textContent = `${frames} 帧 / ${duration} 秒`;
    }

    if (gifFpsInput) {
        gifFpsInput.addEventListener('input', updateFrameInfo);
    }

    if (startGifExport) {
        startGifExport.addEventListener('click', async () => {
            if (!animation) return;

            const jsonData = animation.animationData;
            const fps = parseInt(gifFpsInput?.value) || 30;
            const width = parseInt(gifWidthInput?.value) || jsonData.w || 512;
            const height = parseInt(gifHeightInput?.value) || jsonData.h || 512;
            const colors = parseInt(gifColorsInput?.value) || 128;

            const maxW = (jsonData.w || 512) * 2;
            const maxH = (jsonData.h || 512) * 2;
            const finalW = Math.min(width, maxW);
            const finalH = Math.min(height, maxH);

            const fr = jsonData.fr || 30;
            const totalFrames = Math.round(jsonData.op - jsonData.ip);
            const exportFrames = Math.min(Math.round((totalFrames / fr) * fps), 500);
            if (exportFrames >= 500) {
                alert(t('maxFramesWarning'));
            }

            gifProgressOverlay.classList.remove('hidden');
            gifProgressBar.style.width = '0%';
            gifProgressText.textContent = `0 / ${exportFrames}`;
            gifExportPanel.classList.add('hidden');

            const wasPlaying = !animation.isPaused;
            if (wasPlaying) animation.pause();

            try {
                gifExporter = new GifExporter(jsonData);
                const blob = await gifExporter.export({
                    fps: fps,
                    width: finalW,
                    height: finalH,
                    colors: colors,
                    onProgress: (current, total) => {
                        const pct = (current / total) * 100;
                        gifProgressBar.style.width = pct + '%';
                        gifProgressText.textContent = `${current} / ${total}`;
                    }
                });

                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'animation.gif';
                a.click();
                URL.revokeObjectURL(url);

            } catch (err) {
                if (err.message !== 'Cancelled') {
                    console.error('GIF export error:', err);
                    alert(t('exportFailed') + ': ' + err.message);
                }
            } finally {
                gifProgressOverlay.classList.add('hidden');
                if (wasPlaying && animation) animation.play();
                gifExporter = null;
            }
        });
    }

    if (cancelGifExport) {
        cancelGifExport.addEventListener('click', () => {
            if (gifExporter) {
                gifExporter.cancel();
            }
        });
    }

    bgAlphaBtn.addEventListener('click', () => {
        animationContainer.style.backgroundColor = '';
        animationContainer.classList.add('alpha-checkered');
        bgAlphaBtn.classList.add('bg-blue-100', 'text-blue-600');
        bgAlphaBtn.classList.remove('text-slate-400');
    });
}

// 高分屏检测 - 4K屏幕自动放大
(function() {
    // 检测物理屏幕分辨率
    const width = window.screen.width;
    const height = window.screen.height;
    const dpr = window.devicePixelRatio || 1;
    
    // 4K 屏幕检测：物理分辨率宽度 >= 3840 或 (宽度 >= 2560 且 DPR >= 2)
    const is4K = (width >= 3840) || (width >= 2560 && dpr >= 2);
    const is2K = width >= 2560 && width < 3840;
    
    if (is4K) {
        // 4K 屏幕：使用 1.3 倍缩放
        document.documentElement.style.fontSize = '18px';
    } else if (is2K) {
        // 2K 屏幕：使用 1.15 倍缩放
        document.documentElement.style.fontSize = '16px';
    }
    // 其他屏幕使用 CSS 默认的 14px
})();

// 右侧列高度与预览卡片同步
(function() {
    const previewCard = document.getElementById('preview-card');
    const rightColumn = document.getElementById('right-column');
    if (!previewCard || !rightColumn) return;

    function syncHeight() {
        rightColumn.style.height = previewCard.offsetHeight + 'px';
    }

    new ResizeObserver(syncHeight).observe(previewCard);
    syncHeight();
})();

// 帮助弹窗控制
document.addEventListener('DOMContentLoaded', function() {
    const helpModal = document.getElementById('help-modal');
    const helpBtn = document.getElementById('help-btn');
    const closeModalBtn = document.getElementById('close-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const closeModalBtnBottom = document.getElementById('close-modal-btn');

    if (!helpModal || !helpBtn) return;

    function openModal() {
        helpModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => {
            modalOverlay.classList.remove('opacity-0');
            const modalContent = modalOverlay.nextElementSibling.querySelector('.modal-content');
            if (modalContent) {
                modalContent.classList.remove('scale-95', 'opacity-0');
                modalContent.classList.add('scale-100', 'opacity-100');
            }
        });
    }

    function closeModal() {
        modalOverlay.classList.add('opacity-0');
        const modalContent = modalOverlay.nextElementSibling.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.remove('scale-100', 'opacity-100');
            modalContent.classList.add('scale-95', 'opacity-0');
        }
        setTimeout(() => {
            helpModal.classList.add('hidden');
            document.body.style.overflow = '';
        }, 200);
    }

    helpBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (closeModalBtnBottom) closeModalBtnBottom.addEventListener('click', closeModal);
    
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !helpModal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // 弹窗内图标在打开弹窗时初始化
    helpBtn.addEventListener('click', function() {
        setTimeout(function() {
            lucide.createIcons();
        }, 10);
    });

    // 初始化画布工作区
    const canvasWorkspace = new CanvasWorkspace('canvas-container');
});

// ========== 画布工作区 ==========

class CanvasWorkspace {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Canvas container not found:', containerId);
            return;
        }

        this.svg = document.getElementById('connection-lines');

        // 面板默认布局（x, y, w, h）
        this.defaultLayout = {
            preview: { x: 40,  y: 60,  w: 400, h: 420 },
            list:    { x: 500, y: 80,  w: 280, h: 360 },
            editor:  { x: 820, y: 60,  w: 320, h: 400 }
        };

        // 固定连线关系
        this.connections = [
            { from: 'preview', to: 'list' },
            { from: 'list',    to: 'editor' }
        ];

        // 当前面板状态
        this.panels = {};

        // 拖拽状态
        this.dragState = null;

        // 调整大小状态
        this.resizeState = null;

        this.init();
    }

    init() {
        // 初始化三个面板
        for (const [name, layout] of Object.entries(this.defaultLayout)) {
            const panel = document.getElementById(`panel-${name}`);
            if (!panel) continue;

            this.panels[name] = {
                element: panel,
                x: layout.x,
                y: layout.y,
                w: layout.w,
                h: layout.h
            };

            // 应用初始位置和尺寸
            this.applyPanelStyle(name);

            // 绑定标题栏拖拽事件
            const header = panel.querySelector('.panel-header');
            if (header) {
                header.addEventListener('mousedown', (e) => this.onDragStart(e, name));
            }

            // 绑定调整大小事件
            const handle = panel.querySelector('.resize-handle');
            if (handle) {
                handle.addEventListener('mousedown', (e) => this.onResizeStart(e, name));
            }
        }

        // 监听窗口 resize
        window.addEventListener('resize', () => this.onWindowResize());

        // 初始绘制连线
        this.drawConnections();
    }

    applyPanelStyle(name) {
        const p = this.panels[name];
        if (!p) return;
        p.element.style.transform = `translate(${p.x}px, ${p.y}px)`;
        p.element.style.width = `${p.w}px`;
        p.element.style.height = `${p.h}px`;
    }

    onWindowResize() {
        const containerRect = this.container.getBoundingClientRect();
        for (const [name, p] of Object.entries(this.panels)) {
            // 确保面板至少保留 40px 在可视区域内
            if (p.x + p.w < 40) {
                p.x = Math.min(40, containerRect.width - 40);
            }
            if (p.x > containerRect.width - 40) {
                p.x = Math.max(0, containerRect.width - p.w);
            }
            if (p.y + p.h < 40) {
                p.y = Math.min(40, containerRect.height - 40);
            }
            if (p.y > containerRect.height - 40) {
                p.y = Math.max(0, containerRect.height - p.h);
            }
            this.applyPanelStyle(name);
        }
        this.drawConnections();
    }

    drawConnections() {
        // Stub: will be implemented in Task 6
    }

    onDragStart(e, panelName) {
        // 只响应左键
        if (e.button !== 0) return;

        const p = this.panels[panelName];
        if (!p) return;

        e.preventDefault();
        e.stopPropagation();

        this.dragState = {
            name: panelName,
            startX: e.clientX,
            startY: e.clientY,
            panelStartX: p.x,
            panelStartY: p.y
        };

        p.element.classList.add('dragging');

        // 使用 document 级事件监听，防止鼠标移出面板时丢失
        this._onDragMove = (e) => this.onDragMove(e);
        this._onDragEnd = (e) => this.onDragEnd(e);
        document.addEventListener('mousemove', this._onDragMove);
        document.addEventListener('mouseup', this._onDragEnd);
    }

    onDragMove(e) {
        if (!this.dragState) return;

        const p = this.panels[this.dragState.name];
        if (!p) return;

        const dx = e.clientX - this.dragState.startX;
        const dy = e.clientY - this.dragState.startY;

        let newX = this.dragState.panelStartX + dx;
        let newY = this.dragState.panelStartY + dy;

        // 边界约束：至少保留 40px 可见
        const containerRect = this.container.getBoundingClientRect();
        newX = Math.max(-p.w + 40, Math.min(newX, containerRect.width - 40));
        newY = Math.max(0, Math.min(newY, containerRect.height - 40));

        p.x = newX;
        p.y = newY;

        this.applyPanelStyle(this.dragState.name);
        this.drawConnections();
    }

    onDragEnd(e) {
        if (!this.dragState) return;

        const p = this.panels[this.dragState.name];
        if (p) {
            p.element.classList.remove('dragging');
        }

        this.dragState = null;

        document.removeEventListener('mousemove', this._onDragMove);
        document.removeEventListener('mouseup', this._onDragEnd);
        this._onDragMove = null;
        this._onDragEnd = null;
    }

    onResizeStart(e, panelName) {
        // 只响应左键
        if (e.button !== 0) return;

        const p = this.panels[panelName];
        if (!p) return;

        e.preventDefault();
        e.stopPropagation();

        this.resizeState = {
            name: panelName,
            startX: e.clientX,
            startY: e.clientY,
            startW: p.w,
            startH: p.h
        };

        p.element.classList.add('resizing');

        this._onResizeMove = (e) => this.onResizeMove(e);
        this._onResizeEnd = (e) => this.onResizeEnd(e);
        document.addEventListener('mousemove', this._onResizeMove);
        document.addEventListener('mouseup', this._onResizeEnd);
    }

    onResizeMove(e) {
        if (!this.resizeState) return;

        const p = this.panels[this.resizeState.name];
        if (!p) return;

        const dx = e.clientX - this.resizeState.startX;
        const dy = e.clientY - this.resizeState.startY;

        // 最小尺寸约束
        const minW = 200;
        const minH = 150;

        p.w = Math.max(minW, this.resizeState.startW + dx);
        p.h = Math.max(minH, this.resizeState.startH + dy);

        this.applyPanelStyle(this.resizeState.name);
        this.drawConnections();
    }

    onResizeEnd(e) {
        if (!this.resizeState) return;

        const p = this.panels[this.resizeState.name];
        if (p) {
            p.element.classList.remove('resizing');
        }

        this.resizeState = null;

        document.removeEventListener('mousemove', this._onResizeMove);
        document.removeEventListener('mouseup', this._onResizeEnd);
        this._onResizeMove = null;
        this._onResizeEnd = null;
    }
}
