# AGENTS.md - Lottie Gradient Editor

> 本文档供 AI 编程助手阅读，用于快速了解本项目架构和开发规范。

## 项目概述

本项目是一个 **Lottie 渐变色编辑器**，用于解决 After Effects 通过 Bodymovin 插件导出 Lottie JSON 动画时经常丢失渐变色（颜色、透明度、位置）的问题。

用户可以通过本工具：
- 上传和预览 Lottie JSON 动画文件
- 可视化编辑动画中的渐变色（色标颜色 / 位置 / 透明度）
- 同步其他文件的渐变配置
- 导出修复后的 JSON（或导出当前帧 PNG / GIF）

**在线地址**: https://www.lottie.uno
**备用地址**: https://arvinyin1.github.io/lottiegradient/

## 技术栈

纯前端静态站点，**无构建步骤**：

| 技术 | 用途 | 来源 |
|------|------|------|
| HTML5 + Vanilla JS | 页面结构和逻辑 | 原生 |
| 手写 CSS 设计系统 | UI 样式与主题 tokens | `css/style.css` |
| Lottie Web (bodymovin) | Lottie 动画渲染 | `js/vendor/lottie.min.js`（自托管） |
| gif.js | GIF 导出（含 worker） | `js/vendor/gif.js`（自托管） |
| Lucide Icons | 图标库 | `js/vendor/lucide.min.js`（自托管） |
| Pyodide + py-aep | 浏览器内解析 `.aep`，读取真实渐变色标 | `js/vendor/pyodide/`、`js/vendor/pyaep-libs.zip`（自托管，按需加载） |

> 历史说明：UI 重写后已去掉 Tailwind CDN / 构建链（`tailwind.config.js`、`tailwind-input.css`、`css/tailwind.min.css` 均已删除）。样式全部收敛到 `css/style.css` 的设计系统，便于切主题与做深浅色。

## 项目结构

```
lottiegradient/
├── .github/workflows/deploy.yml # main 推送 / 手动触发的自动部署
├── deploy.sh           # 统一手动部署脚本（rsync + 线上验收）
├── index.html          # 编辑器（顶栏 + 三栏工作台 + 两个弹窗）
├── backfill.html       # 渐变回填页（.aep + JSON → 比对 → 回填）
├── css/
│   └── style.css       # 设计系统：tokens / 组件 / 响应式 / 深色主题 / 回填页
├── js/
│   ├── main.js         # 编辑器逻辑：i18n、渐变编辑器、导入导出、GIF 导出
│   ├── backfill.js     # 回填页逻辑：Pyodide 启动、路径匹配、比对与回填
│   └── vendor/         # 自托管依赖：lucide / lottie / gif.js + pyodide / py-aep
├── tests/
│   ├── smoke.mjs       # 编辑器冒烟测试（14 条用例，file://）
│   ├── backfill.mjs    # 回填页测试（25 条用例，自带静态服务器）
│   ├── fixtures/       # 测试用 Lottie JSON + sample.aep
│   └── README.md       # 跑测说明 / 改版适配
├── svg/                # 本地 SVG 图标备用资源（运行时实际用 js/vendor/lucide）
├── README.md / AGENTS.md / CLAUDE.md
└── package.json        # 仅提供 serve / test 脚本，无运行时依赖
```

## 界面结构（三栏工作台）

```
┌ topbar: 品牌 · 文件名 chip · 导入/导出/同步 · 帮助/语言/主题/GitHub ┐
├ gradient list (272px) │ preview canvas (flex) │ editor panel (344px) ┤
└───────────────────────┴──────────────────────┴──────────────────────┘
```

- **左栏** `#gradient-names-list`：每个渐变显示真实渐变缩略图、`gf/gs` 类型、色标数；搜索框 `#gradient-search` 做本地过滤。
- **中栏** `#drop-zone`：画布 + 背景切换（棋盘格/纯色）+ 播放条（`#play-pause-btn` / `#animation-progress` / `#time-display`）。
- **右栏** `#editor`：渐变预览条（色标可拖动）+ 色标表格 + 添加色标 + 透明度开关。
- 弹窗：`#help-modal`（帮助）、`#gif-modal`（GIF 导出），统一 `.modal-root` + `.is-open` 过渡。

## 核心模块

### 1. 文件操作
- 导入：`#lottie-file`（点击或拖拽到 `#drop-zone`），`handleLottieFile()`
- 导出：`#export-btn` → `compressJson(currentJsonData)`，文件名沿用导入名
- 同步渐变：`#gradient-file` → `extractGradientsFromJson()` / `applyGradientByName()`

### 2. 动画预览
- `bodymovin.loadAnimation()`，容器 `#lottie-animation`（内部 svg 强制 100% 填充）
- 背景：`#bg-alpha-btn` 切换 `.alpha-checkered` 棋盘格；`#bg-color-picker` 选纯色
- 播放：`#play-pause-btn`、`#animation-progress`（拖拽时暂停、结束后恢复原播放状态）、`#time-display`

### 3. 渐变数据结构

```javascript
{
  "ty": "gf",           // gf = 渐变填充, gs = 渐变描边
  "nm": "渐变名称",
  "g": {
    "p": 2,             // 色标数量
    "k": { "k": [       // 实际数据
      0, 0.2, 0.5, 0.8, // 位置, R, G, B
      1, 0.9, 0.3, 0.1
      // 若含 alpha：追加 p 组 [位置, alpha]
    ]}
  }
}
```

### 4. GradientPreviewEditor（`js/main.js`）

右栏全部 DOM 与交互由这个类生成，**颜色色标与透明度色标相互独立**：

```javascript
constructor(parent, lottieArr, colorCount, on_change)
render()                      // 预览条 + 颜色区 + 透明度区整体重建
_buildColorRow(color)         // 颜色行：色块 / HEX / 位置 / 删除
_buildAlphaRow(stop)          // 透明度行：位置 / 不透明度 / 删除
_refreshColorRail()           // 颜色轨圆点（可拖动、←/→ 微调）
_refreshAlphaRail()           // 透明度轨圆点（黑色 → 透明）
to_css() / to_lottie()        // 合并预览 CSS / Lottie 平铺数组
```

- Lottie 的 `g.k` 是「p 组颜色色标 (offset,r,g,b) + 若干组透明度色标 (offset,alpha)」，两段数量可以不同。解析见 `parseGradientArray()`，合并预览见 `gradient_css_from_stops()` / `samplePiecewise()`。
- 最少保留 2 个色标，越界时用 `showToast(t('minStopsWarning'))` 提示。
- 行与按钮带稳定钩子供测试使用：`data-row="color|alpha"`、`data-action="add-color-stop|add-alpha-stop|delete-color-stop|delete-alpha-stop|toggle-alpha"`。

### 5. 渐变列表

- `getGradientList()` 用 `forEachGradient()` 按**出现顺序给每个渐变分配 index**；同名渐变不合并，显示为 `Name #1` / `Name #2`。
- 选中态保存 `{ index, displayName, type }`，编辑时按 index 精确回写（`applyEditToSelected()`），因此同名渐变可分别修改。
- 列表项左侧 `.g-swatch` 用 `gradient_swatch_css()` 渲染真实渐变；关键帧渐变用斜纹占位并显示「关键帧」徽标。
- 搜索过滤：`item.style.display = '' | 'none'`（不要写成 `'block'`，会破坏 flex 布局）。

### 5.1 关键帧渐变

`unwrapGradientK()` 会把 `g.k.a === 1` 或数组元素为对象的渐变标记为关键帧；这类渐变只展示提示（`[data-editor-notice="keyframed"]`），不改写、不参与同步。

### 6. i18n
- 文案字典在 `js/main.js` 顶部（`zh` / `en`），静态节点用 `data-i18n` / `data-i18n-placeholder`，JS 动态文案用 `t(key)`。
- 新增文案必须同时补 `zh` 与 `en`；动态生成的表头 / 按钮在 `refreshLanguage()` 里更新。

### 7. 渐变回填页（`backfill.html` + `js/backfill.js`）

独立页面，入口是编辑器顶栏的「渐变回填」链接。解决的是「手里还有 AE 工程，想直接拿工程里的真实渐变」的场景：

- **原理**：AE 脚本 API 读不到渐变（`ADBE Vector Grad Colors` 是 `NO_VALUE`），Bodymovin 自己也是把 `.aep` 当文本搜索。这里改用 **Pyodide 在浏览器里跑 py-aep**，直接解析 `.aep` 里的渐变 XML，拿到色标（offset / 中点 / RGB）与透明度色标。
- **懒加载**：`js/vendor/pyodide/`（约 13 MB）与 `js/vendor/pyaep-libs.zip`（约 2.8 MB）只在用户点「解析并比对」时才加载；编辑器首屏零新增请求。
- **加载态**：`#bf-loading` 遮罩（spinner + 阶段文案 + 进度条 + 已用时）。py-aep 依赖包带真实下载百分比（`fetchWithProgress`），Pyodide 内部加载无法测量，走不确定进度 + 计时。
- **关键规则**：Bodymovin 会把 AE 的「中点」展开成额外色标（N → 2N−1），颜色与透明度各自独立展开；所有 alpha 为 1 时不写透明度段。补丁生成照抄了这套规则（`js/vendor/pyaep/extract.py` 的 `expand_stops()`），因此回填值与 Bodymovin 导出值逐位一致。
- **匹配**：先按「合成 / 图层 / 组 / 渐变名」完整路径精确匹配；失败则退回「同名 + 出现顺序」，并在类型列标注「按名匹配」。关键帧渐变只提示不回填；JSON 缺失/多出的渐变只统计不增删。
- **i18n**：回填页有自己的字典（`js/backfill.js` 顶部），与编辑器共用 `localStorage['lottie-lang']` 和 `localStorage['lottie-theme']`，两个页面语言/主题同步。
- **测试钩子**：`window.__backfillState` 暴露内部状态，供 `tests/backfill.mjs` 断言回填后的 `g.k` / `g.p`。
- **样式**：页面级样式以 `.bf-*` 前缀写在 `css/style.css` 末尾，只允许用 token。

## 主题与样式

### 设计 token（`css/style.css`）

shadcn 风格，light 在 `:root`，dark 在 `html.dark`：

```css
--background / --foreground / --card / --popover
--muted / --muted-foreground / --secondary / --accent
--primary / --primary-foreground / --destructive
--border / --input / --ring / --surface / --surface-2
--radius: 10px（派生 sm 6 / md 8 / lg 10 / xl 14）
--shadow-xs / sm / md / lg
--font-sans / --font-mono
```

- 面板之间用 1px 描边分隔，不用悬浮卡片；中间画布是视觉主角。
- 深浅主题由 `<html class="dark">` 驱动；`index.html` 头部内联脚本在首帧前读取 `localStorage['lottie-theme']`，避免闪白。
- 切换入口：`#theme-btn`（`js/main.js` 末尾的「主题切换」块）。

### 关键类名
```
.btn / .btn-primary / .btn-outline / .btn-ghost / .btn-icon
.input / .select-wrap / .badge / .seg / .switch
.panel / .panel-head / .empty / .empty--fill
.gradient-item / .selected / .g-swatch / .gradient-name
.canvas-frame / .alpha-checkered / .lottie-1x1 / .drag-over
.rail / .rail--alpha / .rail-track / .rail-stop
.stop-row--color / .stop-row--alpha / .stops-head--color / .stops-head--alpha
.toast / #toast-container / .editor-notice / .badge--warn
.modal-root / .is-open / .modal-overlay / .modal-content
```

### 响应式
- ≥1281px：272 / flex / 344 三栏
- ≤1080px：收窄两侧
- ≤760px：纵向堆叠，画布限宽，顶栏只留图标

## 开发指南

```bash
# 本地预览（无需构建）
npm run serve          # python3 -m http.server 8000
open http://localhost:8000

# 冒烟测试（需要系统 Chrome；依赖已本地化，离线可跑）
npm test               # 等价于 cd tests && npm test
```

### 规范
- JavaScript：ES6+，事件用 `addEventListener`；频繁触发的交互做防抖（编辑 100ms、JSON 500ms）。
- CSS：新样式写进 `css/style.css`，用 token 而不是硬编码颜色；不要在 HTML 里写内联颜色。
- 图标：`lucide.createIcons()` 初始化；动态插入的图标需再次调用。已知 `lucide@1.21.0` 没有 `github` 图标，仓库/帮助里的 GitHub 图标使用内联 SVG。
- **不要**给 JS 会写成 `display:block` 的元素加 flex/grid（搜索过滤已改为 `''`）。

### 注意事项
1. **编码**：读取文件要处理 BOM（`\ufeff`）。
2. **单一数据源**：`currentJsonData` 是唯一真相；传给 bodymovin 前会深拷贝，避免渲染过程改坏数据。
3. **改色保留播放状态**：`loadAnimation(data, true)` 会恢复播放进度与暂停状态（preserveState）。
4. **同名渐变**：按 index 精确定位，编辑一个不影响另一个；「同步渐变」按 `nm` 匹配，会同时写入所有同名渐变（符合该功能语义）。
5. **关键帧渐变**：只识别、不编辑、不参与同步。
6. **DOM 契约**：`#drop-zone`、`#editor`、`#lottie-file` 缺一个会让初始化静默中断，改结构先跑 `npm test`。
7. **vendor 依赖**：lucide / lottie / gif.js 走本地 `js/vendor/`，离线可用。

## 测试

两套测试都用 puppeteer-core + 系统 Chrome，选择器集中在文件顶部 `SELECTORS`：

| 文件 | 覆盖 | 条数 | 运行方式 |
|---|---|---|---|
| `tests/smoke.mjs` | 编辑器：加载 / 导入 / 选中 / 改色 / 增删色标 / 搜索 / 播放 / 导出 / 响应式 / 同名渐变 / 色标分离 / 播放状态保持 / 关键帧 | 14 | `file://` 直接打开 |
| `tests/backfill.mjs` | 回填页：入口 / 加载态 / 解析 / 一致 / 失配 / 回填 / 主题 / 说明弹窗 / 中英切换 | 25 | 自带静态服务器（Pyodide 需要 http） |

```bash
cd tests && npm test            # 编辑器
cd tests && npm run test:backfill
cd tests && npm run test:all    # 两套都跑
```

详见 `tests/README.md`、基线报告 `tests/BASELINE.md`。

## 部署

### GitHub Pages
推送到 `main` 后自动更新（Settings > Pages，源为 `main`）。

### 自建服务器
- 手动部署：`SSH_KEY=/path/to/key ./deploy.sh`，通过 rsync over SSH 同步 `index.html backfill.html css js svg` 到 nginx 目录并验收线上 HTTP 状态；`--dry-run` 只预览。
- 自动部署：`.github/workflows/deploy.yml` 在推送 `main` 或手动触发时调用同一个 `deploy.sh`。
- CI 需要 Secrets：`DEPLOY_SSH_KEY`（部署私钥）与 `DEPLOY_SSH_HOST_KEY`（可信 known_hosts 行）。私钥不得提交到仓库。
- 脚本启用 `StrictHostKeyChecking=yes`，手动部署机器的 `known_hosts` 也必须包含可信主机公钥；线上验收失败返回非零状态。

## 浏览器兼容性

Chrome/Edge 100+、Firefox 110+、Safari 15.4+（使用 `:has()`、`color-mix()` 等现代 CSS；不支持 `:has()` 的旧浏览器会退化为普通实线画布边框，功能不受影响）。

## 相关链接

- [使用演示 (Bilibili)](https://www.bilibili.com/video/BV1xcBRBREWL/)
- [GitHub 仓库](https://github.com/ArvinYin1/lottiegradient)
- [Lottie 官方文档](https://airbnb.io/lottie/)
- [Bodymovin 插件](https://github.com/airbnb/lottie-web)
