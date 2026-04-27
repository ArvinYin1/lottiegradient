# 画布式工作区实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将三个面板（动画预览、渐变列表、颜色编辑器）重构为可自由拖动画布式布局，面板之间用贝塞尔曲线连线，支持标题栏拖拽移动和右下角手柄调整大小。

**Architecture:** 绝对定位 DOM + SVG 连线（纯 JS/CSS，无外部依赖）。画布容器使用 `position: relative`，面板使用 `position: absolute` + `transform: translate` 控制位置。连线使用 SVG `<path>` 贝塞尔曲线。拖拽和调整大小通过原生 mousedown/mousemove/mouseup 事件实现。

**Tech Stack:** HTML5, Vanilla JS (ES6+), Tailwind CSS (CDN), 原生 DOM 事件

---

## 文件结构

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `index.html` | 修改 | 将 `grid grid-cols-1 lg:grid-cols-2` 替换为 `canvas-container` + 三个 `canvas-panel` |
| `css/style.css` | 新增 | 画布背景、面板外壳、标题栏、调整手柄、连线层样式 |
| `js/main.js` | 新增 | `CanvasWorkspace` 类（~220 行），初始化位置、拖拽、调整大小、连线绘制 |

**不变更的文件：**
- 面板内部的所有 DOM ID（`#lottie-animation`、`#gradient-names-list`、`#editor` 等）保持不变
- 面板内部的业务逻辑（渐变编辑、动画预览等）保持不变
- 头部导航栏（`header`）保持不变

---

## Task 1: HTML 结构调整

**Files:**
- Modify: `index.html:81-155`

将现有的 `grid` 布局替换为画布容器和三个面板。

- [ ] **Step 1: 替换 main 区域的 grid 布局**

将 `index.html` 第 81-155 行的内容：

```html
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
            <div id="preview-card" class="card bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-full w-full animate-enter-card enter-d4">
                <div class="p-4 border-b border-slate-200 flex items-center justify-between">
                    <h2 class="font-semibold text-slate-800 flex items-center gap-2">
                        <i data-lucide="play" class="w-4 h-4 text-blue-500"></i><span data-i18n="animationPreview">动画预览</span>
                    </h2>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-slate-500" data-i18n="background">背景</span>
                        <button id="bg-alpha-btn" class="w-8 h-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                            <i data-lucide="grid-3x3" class="w-4 h-4"></i>
                        </button>
                        <div class="w-8 h-8 rounded-lg border border-slate-300 overflow-hidden flex-shrink-0">
                            <input type="color" id="bg-color-picker" class="w-full h-full p-0 cursor-pointer border-0" value="#ffffff">
                        </div>
                    </div>
                </div>
                <div class="flex-1 p-4 flex items-center justify-center drop-zone relative overflow-hidden" id="drop-zone">
                    <div id="lottie-animation" class="alpha-checkered rounded-xl overflow-hidden flex items-center justify-center lottie-1x1">
                        <div class="text-center text-slate-400">
                            <i data-lucide="image" class="w-16 h-16 mx-auto mb-4 opacity-50"></i>
                            <p data-i18n="dropZoneTitle">拖拽 JSON 文件到此处</p>
                            <p class="text-sm mt-2" data-i18n="dropZoneSubtitle">或点击上方"导入 JSON"按钮</p>
                        </div>
                    </div>
                </div>
                <div class="p-4 border-t border-slate-200 bg-slate-50/50">
                    <div class="flex items-center gap-4">
                        <button id="play-pause-btn" class="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-blue-600 hover:scale-105 transition-transform">
                            <i data-lucide="pause" class="w-5 h-5"></i>
                        </button>
                        <div class="flex-1">
                            <input type="range" id="animation-progress" min="0" max="100" value="0" step="0.1" class="w-full">
                        </div>
                        <span id="time-display" class="text-sm font-mono text-slate-600 min-w-[100px] text-right">0 / 0</span>
                    </div>
                </div>
            </div>

            <div id="right-column" class="flex flex-col gap-4 h-full">
                <div class="card bg-white rounded-2xl shadow-lg border border-slate-200 flex flex-col gradient-list-panel animate-enter-card enter-d4">
                    <div class="p-4 border-b border-slate-200">
                        <div class="flex items-center justify-between mb-3">
                            <h2 class="font-semibold text-slate-800 flex items-center gap-2">
                                <i data-lucide="layers" class="w-4 h-4 text-purple-500"></i><span data-i18n="gradientList">渐变列表</span>
                            </h2>
                            <span id="gradient-count" class="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">0</span>
                        </div>
                        <div class="relative">
                            <i data-lucide="search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            <input type="text" id="gradient-search" data-i18n-placeholder="searchGradient" placeholder="搜索渐变..." class="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                        </div>
                    </div>
                    <div id="gradient-names-list" class="p-2 overflow-y-auto gradient-list-content">
                        <div class="text-center py-8 text-slate-400">
                            <i data-lucide="sparkles" class="w-10 h-10 mx-auto mb-2 opacity-50"></i>
                            <p class="text-sm" data-i18n="uploadToSeeGradients">上传 JSON 文件以查看渐变</p>
                        </div>
                    </div>
                </div>

                <div class="card bg-white rounded-2xl shadow-lg border border-slate-200 flex flex-col editor-panel animate-enter-card enter-d4">
                    <div class="p-4 border-b border-slate-200">
                        <h2 id="editor-title" class="font-semibold text-slate-800 flex items-center gap-2">
                            <i data-lucide="sliders" class="w-4 h-4 text-green-500"></i><span data-i18n="noGradientSelected">未选择渐变</span>
                        </h2>
                    </div>
                    <div id="editor" class="p-4 overflow-y-auto editor-content">
                        <div class="text-center py-8 text-slate-400">
                            <i data-lucide="mouse-pointer-click" class="w-10 h-10 mx-auto mb-2 opacity-50"></i>
                            <p class="text-sm" data-i18n="clickGradientToEdit">点击左侧渐变开始编辑</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
```

替换为：

```html
        <div id="canvas-container" class="flex-1 relative overflow-hidden">
            <div class="canvas-bg"></div>
            <svg id="connection-lines" class="absolute inset-0 pointer-events-none" width="100%" height="100%"></svg>

            <!-- 动画预览面板 -->
            <div id="panel-preview" class="canvas-panel" data-panel="preview">
                <div class="panel-header" data-panel="preview">
                    <div class="flex items-center gap-2">
                        <i data-lucide="play" class="w-4 h-4 text-blue-500"></i>
                        <span class="font-semibold text-slate-800 text-sm" data-i18n="animationPreview">动画预览</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-slate-500" data-i18n="background">背景</span>
                        <button id="bg-alpha-btn" class="w-8 h-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                            <i data-lucide="grid-3x3" class="w-4 h-4"></i>
                        </button>
                        <div class="w-8 h-8 rounded-lg border border-slate-300 overflow-hidden flex-shrink-0">
                            <input type="color" id="bg-color-picker" class="w-full h-full p-0 cursor-pointer border-0" value="#ffffff">
                        </div>
                        <span class="connection-dot" style="background:#3b82f6;"></span>
                    </div>
                </div>
                <div class="panel-body">
                    <div class="flex-1 p-4 flex items-center justify-center drop-zone relative overflow-hidden h-full" id="drop-zone">
                        <div id="lottie-animation" class="alpha-checkered rounded-xl overflow-hidden flex items-center justify-center lottie-1x1">
                            <div class="text-center text-slate-400">
                                <i data-lucide="image" class="w-16 h-16 mx-auto mb-4 opacity-50"></i>
                                <p data-i18n="dropZoneTitle">拖拽 JSON 文件到此处</p>
                                <p class="text-sm mt-2" data-i18n="dropZoneSubtitle">或点击上方"导入 JSON"按钮</p>
                            </div>
                        </div>
                    </div>
                    <div class="p-4 border-t border-slate-200 bg-slate-50/50">
                        <div class="flex items-center gap-4">
                            <button id="play-pause-btn" class="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-blue-600 hover:scale-105 transition-transform">
                                <i data-lucide="pause" class="w-5 h-5"></i>
                            </button>
                            <div class="flex-1">
                                <input type="range" id="animation-progress" min="0" max="100" value="0" step="0.1" class="w-full">
                            </div>
                            <span id="time-display" class="text-sm font-mono text-slate-600 min-w-[100px] text-right">0 / 0</span>
                        </div>
                    </div>
                </div>
                <div class="resize-handle"></div>
            </div>

            <!-- 渐变列表面板 -->
            <div id="panel-list" class="canvas-panel" data-panel="list">
                <div class="panel-header" data-panel="list">
                    <div class="flex items-center gap-2">
                        <i data-lucide="layers" class="w-4 h-4 text-purple-500"></i>
                        <span class="font-semibold text-slate-800 text-sm" data-i18n="gradientList">渐变列表</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span id="gradient-count" class="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">0</span>
                        <span class="connection-dot" style="background:#a855f7;"></span>
                    </div>
                </div>
                <div class="panel-body flex flex-col">
                    <div class="p-4 border-b border-slate-200">
                        <div class="relative">
                            <i data-lucide="search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            <input type="text" id="gradient-search" data-i18n-placeholder="searchGradient" placeholder="搜索渐变..." class="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                        </div>
                    </div>
                    <div id="gradient-names-list" class="p-2 overflow-y-auto flex-1 gradient-list-content">
                        <div class="text-center py-8 text-slate-400">
                            <i data-lucide="sparkles" class="w-10 h-10 mx-auto mb-2 opacity-50"></i>
                            <p class="text-sm" data-i18n="uploadToSeeGradients">上传 JSON 文件以查看渐变</p>
                        </div>
                    </div>
                </div>
                <div class="resize-handle"></div>
            </div>

            <!-- 颜色编辑器面板 -->
            <div id="panel-editor" class="canvas-panel" data-panel="editor">
                <div class="panel-header" data-panel="editor">
                    <div class="flex items-center gap-2">
                        <i data-lucide="sliders" class="w-4 h-4 text-green-500"></i>
                        <span id="editor-title" class="font-semibold text-slate-800 text-sm" data-i18n="noGradientSelected">未选择渐变</span>
                    </div>
                    <span class="connection-dot" style="background:#22c55e;"></span>
                </div>
                <div class="panel-body">
                    <div id="editor" class="p-4 overflow-y-auto editor-content h-full">
                        <div class="text-center py-8 text-slate-400">
                            <i data-lucide="mouse-pointer-click" class="w-10 h-10 mx-auto mb-2 opacity-50"></i>
                            <p class="text-sm" data-i18n="clickGradientToEdit">点击左侧渐变开始编辑</p>
                        </div>
                    </div>
                </div>
                <div class="resize-handle"></div>
            </div>
        </div>
```

- [ ] **Step 2: 验证 HTML 结构**

打开浏览器访问 `index.html`，确认三个面板都显示在页面上，没有语法错误。

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: replace grid layout with canvas container and panels"
```

---

## Task 2: CSS 样式 — 画布背景、面板外壳、标题栏、调整手柄

**Files:**
- Modify: `css/style.css`（在文件末尾追加）

- [ ] **Step 1: 追加画布工作区样式**

在 `css/style.css` 末尾追加以下样式：

```css
/* ===== 画布工作区 ===== */

/* 画布容器 */
#canvas-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

/* 点阵背景 */
.canvas-bg {
    position: absolute;
    inset: 0;
    background-color: #f8fafc;
    background-image: radial-gradient(#94a3b8 1px, transparent 1px);
    background-size: 20px 20px;
}

/* 画布面板外壳 */
.canvas-panel {
    position: absolute;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    user-select: none;
}

/* 面板标题栏 */
.panel-header {
    height: 40px;
    padding: 0 12px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    border-radius: 0.75rem 0.75rem 0 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: grab;
    flex-shrink: 0;
}

.panel-header:active {
    cursor: grabbing;
}

/* 连接点 */
.connection-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
}

/* 面板内容区 */
.panel-body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

/* 调整大小手柄 */
.resize-handle {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 16px;
    height: 16px;
    cursor: nwse-resize;
    background: linear-gradient(
        135deg,
        transparent 45%,
        #94a3b8 45%,
        #94a3b8 50%,
        transparent 50%,
        transparent 60%,
        #94a3b8 60%,
        #94a3b8 65%,
        transparent 65%
    );
    border-bottom-right-radius: 0.75rem;
    z-index: 2;
}

/* 拖拽时提升层级 */
.canvas-panel.dragging {
    z-index: 100;
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
}

/* 连线层 */
#connection-lines {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
}

.connection-line {
    fill: none;
    stroke: #cbd5e1;
    stroke-width: 2;
}

/* 拖拽时禁用文本选择 */
.canvas-panel.dragging .panel-body,
.canvas-panel.resizing .panel-body {
    pointer-events: none;
}
```

- [ ] **Step 2: 验证样式**

打开浏览器刷新页面，确认：
- 画布背景显示点阵图案
- 三个面板显示为白色圆角卡片
- 标题栏有左侧图标+标题、右侧连接点
- 右下角有斜线纹理的调整手柄

- [ ] **Step 3: Commit**

```bash
git add css/style.css
git commit -m "feat: add canvas workspace styles"
```

---

## Task 3: CanvasWorkspace 类 — 初始化与位置管理

**Files:**
- Modify: `js/main.js`（在文件末尾追加）

- [ ] **Step 1: 追加 CanvasWorkspace 类的基础结构**

在 `js/main.js` 文件末尾追加：

```javascript
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
}
```

- [ ] **Step 2: 在 DOMContentLoaded 中初始化 CanvasWorkspace**

在 `js/main.js` 中搜索 `document.addEventListener('DOMContentLoaded'` 或 `DOMContentLoaded`，在对应的初始化代码中添加 CanvasWorkspace 的初始化。

找到现有的 DOMContentLoaded 处理代码（约在第 930+ 行附近），在其内部添加：

```javascript
    // 初始化画布工作区
    const canvasWorkspace = new CanvasWorkspace('canvas-container');
```

如果没有现有的 DOMContentLoaded，则在文件末尾 `initializeLottiePlayer()` 调用附近添加：

```javascript
// 初始化画布工作区
const canvasWorkspace = new CanvasWorkspace('canvas-container');
```

- [ ] **Step 3: 验证**

刷新浏览器，确认三个面板按照默认布局（左中右）排列在画布上。

- [ ] **Step 4: Commit**

```bash
git add js/main.js
git commit -m "feat: add CanvasWorkspace class with panel initialization"
```

---

## Task 4: CanvasWorkspace 类 — 标题栏拖拽功能

**Files:**
- Modify: `js/main.js`（在 CanvasWorkspace 类中追加方法）

- [ ] **Step 1: 追加拖拽相关方法**

在 `CanvasWorkspace` 类的 `onWindowResize` 方法之后（类结束之前）追加以下方法：

```javascript
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
```

- [ ] **Step 2: 验证拖拽功能**

刷新浏览器，测试：
- 按住动画预览面板的标题栏拖拽，面板跟随鼠标移动
- 连线实时跟随面板位置变化
- 释放鼠标后面板停留在新位置
- 面板不能拖出画布边界（至少保留 40px）

- [ ] **Step 3: Commit**

```bash
git add js/main.js
git commit -m "feat: add panel drag functionality"
```

---

## Task 5: CanvasWorkspace 类 — 右下角调整大小功能

**Files:**
- Modify: `js/main.js`（在 CanvasWorkspace 类中追加方法）

- [ ] **Step 1: 追加调整大小相关方法**

在 `CanvasWorkspace` 类的 `onDragEnd` 方法之后（类结束之前）追加以下方法：

```javascript
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
```

- [ ] **Step 2: 验证调整大小功能**

刷新浏览器，测试：
- 拖拽动画预览面板右下角的斜线手柄，面板宽高随之变化
- 连线实时跟随面板尺寸变化
- 面板最小宽度不能小于 200px，最小高度不能小于 150px
- 释放鼠标后调整完成

- [ ] **Step 3: Commit**

```bash
git add js/main.js
git commit -m "feat: add panel resize functionality"
```

---

## Task 6: CanvasWorkspace 类 — 贝塞尔连线绘制

**Files:**
- Modify: `js/main.js`（在 CanvasWorkspace 类中追加方法）

- [ ] **Step 1: 追加连线绘制方法**

在 `CanvasWorkspace` 类的 `onResizeEnd` 方法之后（类结束之前）追加以下方法：

```javascript
    drawConnections() {
        if (!this.svg) return;

        // 清空现有连线
        this.svg.innerHTML = '';

        for (const conn of this.connections) {
            const fromPanel = this.panels[conn.from];
            const toPanel = this.panels[conn.to];
            if (!fromPanel || !toPanel) continue;

            const path = this.getConnectionPath(fromPanel, toPanel);

            // 创建 path 元素
            const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            pathEl.setAttribute('d', path);
            pathEl.setAttribute('class', 'connection-line');
            this.svg.appendChild(pathEl);

            // 绘制连接点
            this.drawConnectionDot(fromPanel.x + fromPanel.w, fromPanel.y + fromPanel.h / 2, this.getPanelColor(conn.from));
            this.drawConnectionDot(toPanel.x, toPanel.y + toPanel.h / 2, this.getPanelColor(conn.to));
        }
    }

    getConnectionPath(a, b) {
        const sx = a.x + a.w;       // A 右边缘
        const sy = a.y + a.h / 2;   // A 垂直中点
        const ex = b.x;             // B 左边缘
        const ey = b.y + b.h / 2;   // B 垂直中点

        const offset = Math.abs(ex - sx) * 0.5;
        return `M ${sx} ${sy} C ${sx + offset} ${sy}, ${ex - offset} ${ey}, ${ex} ${ey}`;
    }

    getPanelColor(name) {
        const colors = {
            preview: '#3b82f6',
            list:    '#a855f7',
            editor:  '#22c55e'
        };
        return colors[name] || '#94a3b8';
    }

    drawConnectionDot(cx, cy, color) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', 4);
        circle.setAttribute('fill', color);
        this.svg.appendChild(circle);
    }
}
```

注意：确保 `drawConnections` 方法的调用在 `init()` 中存在（已在 Task 3 中添加），并且在 `onDragMove`、`onDragEnd`、`onResizeMove`、`onResizeEnd` 中都有调用。

检查确认以下位置已调用 `this.drawConnections()`：
- `init()` 方法末尾
- `onDragMove()` 方法末尾
- `onResizeMove()` 方法末尾
- `onWindowResize()` 方法末尾

- [ ] **Step 2: 验证连线功能**

刷新浏览器，确认：
- 三个面板之间有贝塞尔曲线连线
- 连线从面板 A 右侧中点连接到面板 B 左侧中点
- 连线两端有对应颜色的圆点
- 拖拽面板时连线实时跟随
- 调整面板大小时连线实时跟随

- [ ] **Step 3: Commit**

```bash
git add js/main.js
git commit -m "feat: add bezier curve connections between panels"
```

---

## Task 7: 端到端测试

**Files:**
- 无文件修改，纯验证

- [ ] **Step 1: 功能完整性测试**

打开浏览器，逐项验证：

| 测试项 | 预期结果 |
|--------|----------|
| 页面加载后布局 | 三个面板左中右排列，有连线 |
| 画布背景 | 显示点阵图案 |
| 拖拽动画预览面板 | 面板跟随鼠标，连线实时更新 |
| 拖拽渐变列表面板 | 面板跟随鼠标，连线实时更新 |
| 拖拽颜色编辑器面板 | 面板跟随鼠标，连线实时更新 |
| 调整动画预览面板大小 | 宽高变化，连线实时更新，最小 200×150 |
| 调整渐变列表面板大小 | 宽高变化，连线实时更新，最小 200×150 |
| 调整颜色编辑器面板大小 | 宽高变化，连线实时更新，最小 200×150 |
| 导入 JSON | 动画正常加载到预览面板 |
| 点击渐变列表项 | 颜色编辑器正常显示编辑界面 |
| 编辑渐变颜色 | 渐变预览正常更新 |
| 导出 JSON | 正常导出 |
| 窗口 resize | 面板不丢失在可视区域外 |

- [ ] **Step 2: 修复发现的问题**

根据测试结果，修复任何发现的问题。常见问题：

**问题 A：面板内容区溢出**
如果面板内容在调整大小后溢出，检查 `.panel-body` 的 `overflow` 设置。渐变列表和编辑器面板的内容区需要 `overflow-y: auto`：

在 CSS 中为需要滚动的内容区添加：
```css
#gradient-names-list,
#editor {
    overflow-y: auto;
}
```

**问题 B：拖拽事件与面板内部点击冲突**
如果点击面板内部的按钮/输入框时触发了拖拽，检查 `onDragStart` 中的 `e.target` 判断。确保只有点击标题栏时才触发拖拽（已在事件绑定中通过选择器限制）。

**问题 C：Lottie 动画容器尺寸异常**
如果 Lottie 动画在调整面板大小后显示异常，检查 `#lottie-animation` 的 CSS。`.lottie-1x1` 已有 `width: 100%` 和 `aspect-ratio: 1/1`，在面板 resize 后应该自动适应。

**问题 D：面板重叠时 z-index**
如果拖拽面板时被其他面板遮挡，检查 `.canvas-panel.dragging` 的 `z-index: 100` 是否生效。

- [ ] **Step 3: 最终 Commit**

```bash
git add -A
git commit -m "feat: complete canvas workspace with draggable panels and connections"
```

---

## Self-Review Checklist

### Spec Coverage

| 设计文档要求 | 实现任务 |
|-------------|---------|
| 画布容器 + 点阵背景 | Task 1 (HTML), Task 2 (CSS) |
| 三个面板绝对定位 | Task 1 (HTML), Task 3 (JS init) |
| 标题栏拖拽移动 | Task 4 |
| 右下角调整大小 | Task 5 |
| 贝塞尔曲线连线 | Task 6 |
| 连线实时更新 | Task 4, 5, 6 |
| 边界约束 | Task 4 (drag), Task 5 (resize min) |
| 窗口 resize 处理 | Task 3 (onWindowResize) |
| DOM ID 不变 | Task 1 (确认所有 ID 保留) |

### Placeholder Scan

- [ ] 无 TBD/TODO
- [ ] 无 "添加适当错误处理" 等模糊描述
- [ ] 无 "类似 Task X" 的引用
- [ ] 每个代码步骤包含完整代码

### Type Consistency

- [ ] `CanvasWorkspace` 类名在所有任务中一致
- [ ] `panels` 数据结构 `{element, x, y, w, h}` 在所有方法中一致
- [ ] `connections` 数组结构 `{from, to}` 一致
- [ ] `dragState` / `resizeState` 结构一致
