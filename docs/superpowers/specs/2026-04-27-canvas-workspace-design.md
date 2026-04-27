# 画布式工作区设计文档

> Lottie Gradient Editor — 将三个面板重构为可自由拖动的画布式布局

## 背景

当前界面使用 `grid grid-cols-1 lg:grid-cols-2` 固定布局，左侧为动画预览，右侧上下排列渐变列表和颜色编辑器。用户希望将这三个面板改为类似节点编辑器的自由画布式布局，面板之间用贝塞尔曲线连线，每个面板可独立拖动和调整大小。

## 设计目标

- 三个面板（动画预览、渐变列表、颜色编辑器）在同一画布上自由摆放
- 面板之间有贝塞尔曲线连线，实时跟随面板位置变化
- 通过标题栏拖拽移动面板
- 通过右下角手柄调整面板宽高
- 保持现有业务逻辑不变（DOM ID、事件绑定、渐变编辑功能）

## 技术方案

**方案：绝对定位 DOM + SVG 连线（纯 JS/CSS，无外部依赖）**

- 画布容器使用 `position: relative`，面板使用 `position: absolute`
- 面板位置通过 `transform: translate(x, y)` 控制
- 连线使用 SVG `<path>` 元素的贝塞尔曲线（`C` 命令）
- 拖拽和调整大小通过原生 mousedown/mousemove/mouseup 事件实现

## 详细设计

### 画布容器

```html
<div id="canvas-container" class="flex-1 relative overflow-hidden">
  <div class="canvas-bg"></div>
  <svg id="connection-lines" class="absolute inset-0 pointer-events-none"></svg>
  <!-- 三个面板 -->
</div>
```

**背景样式**：`radial-gradient` 点阵图案，`#f8fafc` 底色，点颜色 `#94a3b8`，间距 20px。

### 面板结构

每个面板统一结构：

```html
<div id="panel-{name}" class="canvas-panel" style="width: {w}px; height: {h}px;">
  <div class="panel-header" data-panel="{name}">
    <span class="panel-icon">...</span>
    <span class="panel-title">...</span>
    <span class="connection-dot"></span>
  </div>
  <div class="panel-body">
    <!-- 原有内容 -->
  </div>
  <div class="resize-handle"></div>
</div>
```

**标题栏**：高度 40px，圆角顶部（继承面板圆角），左侧图标 + 标题，右侧 12px 连接点圆点（颜色标识面板类型：蓝色=预览、紫色=列表、绿色=编辑器）。`cursor: grab`，拖拽时变为 `grabbing`。

**内容区**：继承原有面板的全部内容和样式。

**调整手柄**：右下角 16×16px 区域，`cursor: nwse-resize`，视觉上用斜线纹理标识。

### 初始布局

```javascript
const DEFAULT_LAYOUT = {
  preview: { x: 40,  y: 60,  w: 400, h: 420 },
  list:    { x: 500, y: 80,  w: 280, h: 360 },
  editor:  { x: 820, y: 60,  w: 320, h: 400 }
};
```

三个面板从左到右排列，垂直居中偏上，间距约 60-100px。

### 连线关系

```javascript
const CONNECTIONS = [
  { from: 'preview', to: 'list' },
  { from: 'list',    to: 'editor' }
];
```

连线关系固定，用户不可更改。

### 贝塞尔连线绘制

从面板 A 右侧中点 → 面板 B 左侧中点：

```javascript
function getConnectionPath(a, b) {
  const sx = a.x + a.w;      // A 右边缘
  const sy = a.y + a.h / 2;  // A 垂直中点
  const ex = b.x;            // B 左边缘
  const ey = b.y + b.h / 2;  // B 垂直中点

  const offset = Math.abs(ex - sx) * 0.5;
  return `M ${sx} ${sy} C ${sx + offset} ${sy}, ${ex - offset} ${ey}, ${ex} ${ey}`;
}
```

控制点水平偏移量为两面板间距的 50%，创造平滑的 S 形曲线。

### 拖拽逻辑

1. **mousedown on 标题栏**：
   - 记录鼠标起始位置 `(mouseX, mouseY)`
   - 记录面板起始位置 `(panelX, panelY)`
   - 设置 `isDragging = true`
   - 标题栏添加 `cursor: grabbing`
   - 面板提升 `z-index` 到 100（最上层）
   - 添加 document 级 `mousemove` 和 `mouseup` 监听

2. **mousemove**：
   - 计算偏移：`newX = panelX + (e.clientX - mouseX)`
   - 计算偏移：`newY = panelY + (e.clientY - mouseY)`
   - 边界约束：`newX >= -w + 40`，`newY >= 0`，确保面板至少保留 40px 可见
   - 更新面板 `transform: translate(newX, newY)`
   - 同步重绘所有 SVG 连线

3. **mouseup**：
   - `isDragging = false`
   - 移除 document 级监听
   - 恢复 `cursor: grab`
   - 恢复默认 `z-index`

### 调整大小逻辑

1. **mousedown on 调整手柄**：
   - 记录鼠标起始位置
   - 记录面板起始宽高 `(startW, startH)`
   - 添加 document 级 `mousemove` 和 `mouseup` 监听

2. **mousemove**：
   - 计算新宽高：`newW = startW + (e.clientX - mouseX)`
   - 计算新宽高：`newH = startH + (e.clientY - mouseY)`
   - 最小尺寸约束：`newW >= 200`，`newH >= 150`
   - 更新面板 `width` / `height` 样式
   - 同步重绘所有 SVG 连线

3. **mouseup**：
   - 移除 document 级监听

### 边界情况

| 场景 | 处理方式 |
|------|----------|
| 窗口 resize | 监听 `window.resize`，面板超出可视区域时自动移回 |
| 面板重叠 | 拖拽时提升 z-index，释放后恢复默认层级 |
| 快速拖拽鼠标移出面板 | 使用 document 级事件监听，确保不丢失 |
| 面板内容滚动 | 标题栏拖拽事件阻止冒泡，不影响内容区滚动 |
| 最小尺寸 | 宽度 ≥ 200px，高度 ≥ 150px |

### 与现有代码的整合

- **DOM ID 保持不变**：`#lottie-animation`、`#gradient-names-list`、`#editor` 等 ID 不变
- **业务逻辑完全复用**：渐变编辑、动画预览、文件导入导出等现有功能不受影响
- **新增 `CanvasWorkspace` 类**：封装画布管理、拖拽、调整大小、连线绘制的全部逻辑
- **CSS 新增区块**：画布相关样式放在 `style.css` 末尾的新区块

### 文件变更

| 文件 | 变更内容 | 预估行数 |
|------|----------|----------|
| `index.html` | 将 grid 布局替换为 canvas-container + 三个 canvas-panel | ~30 行修改 |
| `css/style.css` | 新增画布背景、面板、标题栏、调整手柄、连线样式 | ~80 行新增 |
| `js/main.js` | 新增 `CanvasWorkspace` 类（初始化、拖拽、调整大小、连线绘制） | ~250 行新增 |

## 视觉规范

- **画布背景**：`#f8fafc` 底色 + `#94a3b8` 20px 间距点阵
- **面板样式**：白色背景、`#e2e8f0` 边框、12px 圆角、`shadow-lg`
- **标题栏**：`#f8fafc` 背景、1px 底部边框、40px 高度
- **连接点颜色**：预览=蓝色 `#3b82f6`、列表=紫色 `#a855f7`、编辑器=绿色 `#22c55e`
- **连线样式**：`#cbd5e1` 颜色、2px 宽度、无填充

## 验收标准

- [ ] 页面加载后三个面板以左中右布局自动排列在画布上
- [ ] 画布背景显示点阵图案
- [ ] 拖拽标题栏可以移动面板，连线实时跟随
- [ ] 拖拽右下角手柄可以调整面板宽高，连线实时跟随
- [ ] 面板之间有贝塞尔曲线连线
- [ ] 现有功能（导入 JSON、渐变编辑、导出 JSON）正常工作
- [ ] 窗口 resize 后面板不会丢失在可视区域外
