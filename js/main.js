// Lottie Gradient Editor - Main JavaScript

lucide.createIcons();

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

        const alphaToggle = document.createElement('label');
        alphaToggle.className = 'flex items-center gap-2 cursor-pointer';
        alphaToggle.innerHTML = `<input type="checkbox" ${this.with_alpha ? 'checked' : ''} class="w-4 h-4 rounded border-slate-300 text-blue-600"><span class="text-sm text-slate-600">启用透明度</span>`;
        container.appendChild(alphaToggle);

        this.check_alpha = alphaToggle.querySelector('input');
        this.check_alpha.addEventListener('change', () => {
            self.with_alpha = self.check_alpha.checked;
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
            addBtn.innerHTML = '<i data-lucide="plus" class="w-4 h-4"></i> 添加色标';
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

        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = color.color;
        colorPicker.className = 'w-8 h-8 rounded-lg border-0 cursor-pointer shrink-0';
        leftGroup.appendChild(colorPicker);

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
        posContainer.innerHTML = '<span class="text-xs text-slate-500 shrink-0">位置</span>';
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
        alphaContainer.innerHTML = '<span class="alpha-label text-xs text-slate-500 shrink-0">透明度</span>';
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
}

let animation = null;
let monacoEditor = null;
let gradientEditorInstance = null;
let selectedGradientInfo = null;
let isProgrammaticUpdate = false;

document.addEventListener('DOMContentLoaded', function() {
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
                gradientNamesList.innerHTML = '<div class="text-center py-8 text-slate-400"><i data-lucide="sparkles" class="w-10 h-10 mx-auto mb-2 opacity-50"></i><p class="text-sm">上传 JSON 文件以查看渐变</p></div>';
                if (gradientCount) gradientCount.textContent = '0';
                lucide.createIcons();
                return;
            }

            const gradients = findAdobeGradientNames(jsonData);
            if (gradientCount) gradientCount.textContent = gradients.length;

            if (gradients.length === 0) {
                gradientNamesList.innerHTML = '<div class="text-center py-8 text-slate-400"><p>JSON 文件中未找到渐变</p></div>';
                clearSelectedGradient();
            } else {
                gradientNamesList.innerHTML = '';
                gradients.forEach((gradient, index) => {
                    const gradientItem = document.createElement('div');
                    gradientItem.className = 'gradient-item rounded-lg p-3 cursor-pointer';
                    if (selectedGradientInfo && selectedGradientInfo.name === gradient.name) {
                        gradientItem.classList.add('selected');
                    }
                    gradientItem.innerHTML = `<div class="flex items-center gap-3"><span class="text-xs font-mono text-slate-400 w-6">${index + 1}</span><span class="gradient-name flex-1 text-sm font-medium text-slate-700">${gradient.name}</span><i data-lucide="chevron-right" class="w-4 h-4 text-slate-400"></i></div>`;

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
            gradientNamesList.innerHTML = '<div class="text-center py-8 text-slate-400"><p>JSON 文件中未找到渐变</p></div>';
            clearSelectedGradient();
        }
    }

    function clearSelectedGradient() {
        selectedGradientInfo = null;
        const editorTitle = document.getElementById('editor-title');
        const editor = document.getElementById('editor');
        if (editorTitle) editorTitle.innerHTML = '<i data-lucide="sliders" class="w-4 h-4 text-green-500"></i>未选择渐变';
        if (editor) {
            editor.innerHTML = '<div class="text-center py-8 text-slate-400"><i data-lucide="mouse-pointer-click" class="w-10 h-10 mx-auto mb-2 opacity-50"></i><p class="text-sm">点击左侧渐变开始编辑</p></div>';
        }
        lucide.createIcons();
    }

    function updateAnimationFromEditor() {
        const jsonText = getJsonContent();
        if (!jsonText.trim()) { alert('请先输入或上传 JSON 文件'); return; }
        try {
            const jsonData = JSON.parse(jsonText);
            loadAnimation(jsonData);
            updateGradientNamesList();
        } catch (error) {
            console.error('JSON parse error:', error);
            alert('编辑器中的 JSON 无效: ' + error.message);
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
                    updateGradientNamesList();
                } catch (error) {
                    console.error('JSON parse error:', error);
                    alert('无效的 JSON 文件: ' + error.message);
                    fileInfo.classList.add('hidden');
                }
            };
            reader.readAsText(file);
        }
    });

    document.getElementById('export-btn').addEventListener('click', () => {
        const jsonText = getJsonContent();
        if (!jsonText.trim()) { alert('没有可导出的内容'); return; }
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
            alert('导出失败: ' + error.message);
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
                if (gradients.length === 0) { alert('未在文件中找到渐变数据'); return; }

                const currentJsonText = getJsonContent();
                if (!currentJsonText.trim()) { alert('请先导入动画 JSON 文件'); return; }
                const currentJsonData = JSON.parse(currentJsonText);

                gradients.forEach(gradient => {
                    applyGradientToAnimation(currentJsonData, gradient.name, gradient.data, gradient.colorCount);
                });

                const updatedJsonContent = JSON.stringify(currentJsonData, null, 2);
                if (monacoEditor) monacoEditor.setValue(updatedJsonContent);
                document.getElementById('json-editor').value = updatedJsonContent;
                updateAnimationFromEditor();
                alert(`成功同步 ${gradients.length} 个渐变`);
            } catch (error) {
                console.error('Error syncing gradients:', error);
                alert('同步渐变失败: ' + error.message);
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

    progressBar.addEventListener('input', () => { isDragging = true; });
    progressBar.addEventListener('change', () => {
        if (animation) {
            const frame = (progressBar.value / 100) * animation.totalFrames;
            animation.goToAndStop(frame, true);
        }
        isDragging = false;
    });

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
});
