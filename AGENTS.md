# AGENTS.md - Lottie Gradient Editor

> 本文档供 AI 编程助手阅读，用于快速了解本项目架构和开发规范。

## 项目概述

本项目是一个 **Lottie 渐变色编辑器**，用于解决 After Effects 通过 Bodymovin 插件导出 Lottie JSON 动画时经常丢失渐变色（颜色、透明度、位置）的问题。

用户可以通过本工具：
- 上传和预览 Lottie JSON 动画文件
- 可视化编辑动画中的渐变色
- 导出修复后的 JSON 文件

**在线地址**: https://www.lottie.uno  
**备用地址**: https://arvinyin1.github.io/lottiegradient/

## 技术栈

本项目是一个纯前端静态网站，无需构建工具：

| 技术 | 用途 | 来源 |
|------|------|------|
| HTML5 + Vanilla JS | 页面结构和逻辑 | 原生 |
| Tailwind CSS | UI 样式框架 | CDN |
| Lottie Web (bodymovin) | Lottie 动画渲染 | CDN |
| Monaco Editor | JSON 代码编辑器 | CDN |
| Lucide Icons | 图标库 | CDN |

## 项目结构

```
lottiegradient/
├── index.html          # 主 HTML 文件（约 288 行）
├── css/
│   └── style.css       # 样式文件（约 193 行）
├── js/
│   └── main.js         # JavaScript 逻辑（约 930 行）
├── CNAME               # GitHub Pages 自定义域名配置 (www.lottie.uno)
├── README.md           # 项目说明文档（中文）
├── AGENTS.md           # AI 助手文档
├── CLAUDE.md           # AI 助手文档（副本）
└── svg/                # 本地 SVG 图标资源（备用）
    └── ...
```

**注意**: 实际运行时使用 CDN 加载的 Lucide 图标，本地 SVG 文件为备用资源。

## 核心功能模块

### 1. 文件操作模块
- **导入 JSON**: 通过文件选择器或拖拽上传 `.json` 文件
- **导出 JSON**: 将编辑后的动画导出为压缩格式的 JSON 文件
- **同步渐变**: 从另一个 JSON 文件中提取并应用渐变数据

### 2. 动画预览模块
- 使用 `bodymovin.loadAnimation()` 渲染动画
- 播放/暂停控制
- 进度条拖拽
- 帧数显示 (current / total)
- 背景切换（透明棋盘格/纯色）

### 3. 渐变编辑模块

#### 数据结构
Lottie 渐变数据存储在图层属性中：
```javascript
{
  "ty": "gf",  // gf = 渐变填充, gs = 渐变描边
  "nm": "渐变名称",
  "g": {
    "p": 2,    // 色标数量
    "k": {     // 渐变数据
      "k": [   // 实际颜色值数组
        0,      // 第一个色标位置 (0-1)
        0.2, 0.5, 0.8,  // 第一个色标 RGB (0-1)
        1,      // 第二个色标位置
        0.9, 0.3, 0.1,  // 第二个色标 RGB
        // ... 可选透明度数据
      ]
    }
  }
}
```

#### GradientPreviewEditor 类
核心编辑器类，位于 `js/main.js` 中：
- 支持 RGB 和 Alpha 通道编辑
- 动态添加/删除色标
- 实时预览渐变效果
- 防抖更新（100ms）

#### 颜色格式转换
```javascript
// Lottie 格式 (0-1) -> Hex 格式
function color_lottie_to_hex(lottie) { }

// Hex 格式 -> Lottie 格式
function color_hex_to_lottie(hex) { }
```

### 4. 渐变列表模块
- 自动扫描 JSON 中所有渐变（`ty === 'gf' || ty === 'gs'`）
- 按名称去重显示
- 搜索过滤功能
- 点击定位到 Monaco Editor 对应位置
- **自动选择第一个渐变**

### 5. Monaco Editor 集成
- JSON 语法高亮和验证
- 自动格式化
- 实时同步动画预览
- 防抖更新（500ms）

### 6. 帮助弹窗模块
- 点击右上角「帮助」按钮触发
- 毛玻璃背景效果
- 动画过渡效果（scale + opacity）
- ESC 键关闭支持
- 点击遮罩层关闭

## 主题与样式

### 颜色方案
- 主色调：蓝色渐变（#3b82f6 -> #2563eb）
- 背景色：slate-50（浅灰）
- 卡片背景：白色 + 阴影

### 响应式设计
项目支持响应式字体缩放（位于 `css/style.css`）：
```css
/* 基础设置（笔记本/小屏幕） */
html { font-size: 14px; }

/* 大屏幕笔记本 / 外接显示器 */
@media (min-width: 1440px) { html { font-size: 15px; } }

/* 1080p 显示器 */
@media (min-width: 1920px) { html { font-size: 16px; } }

/* 4K 显示器 */
@media (min-width: 2400px) { html { font-size: 20px; } }
```

### CSS 类命名规范
```
.btn-primary      # 主按钮（渐变蓝色背景）
.btn-secondary    # 次级按钮（浅灰背景）
.btn-export       # 导出按钮（白色背景带边框）
.card             # 卡片容器（悬浮效果）
.glass            # 毛玻璃效果（header）
.animate-fade-in  # 淡入动画
.alpha-checkered  # 透明棋盘格背景
.gradient-item    # 渐变列表项（hover 效果）
.selected         # 选中状态（左侧蓝色边框）
.drop-zone        # 拖拽区域（drag-over 状态）
.content-max-w    # 内容区域最大宽度（响应式）
.lottie-1x1       # Lottie 容器 1:1 固定比例
```

## 关键函数说明

### 文件处理（js/main.js）
```javascript
loadAnimation(jsonData)              // 加载并播放动画
compressJson(obj, precision = 3)     // 压缩导出 JSON（精度控制）
updateGradientInJson(newGradientData) // 更新 JSON 中的渐变数据
```

### 渐变操作（js/main.js）
```javascript
findAdobeGradientNames(jsonData)          // 查找所有渐变
updateGradientInJsonData(...)             // 递归更新指定渐变数据
extractGradientsFromJson(jsonData)        // 提取渐变用于同步
applyGradientToAnimation(...)             // 应用渐变到动画
```

### GradientPreviewEditor 类方法
```javascript
constructor(parent, lottie, color_count, on_change, dynamic_count)
add_color(offset, hex, alpha, dynamic_count)  // 添加色标
update(lottie, color_count)                   // 更新编辑器
 Debounced_change()                            // 防抖更新（100ms）
to_css()                                      // 转 CSS 渐变
 to_lottie()                                   // 转 Lottie 格式
```

### 帮助弹窗
```javascript
// DOMContentLoaded 中初始化
openModal()    // 打开弹窗（带动画）
closeModal()   // 关闭弹窗（带动画）
```

## 部署说明

### GitHub Pages 部署
本项目配置为 GitHub Pages 静态站点：

1. 将代码推送到 GitHub 仓库
2. 在 Settings > Pages 中启用 GitHub Pages
3. 选择 main 分支作为源

### 自定义域名
- `CNAME` 文件内容为 `www.lottie.uno`
- 需要在域名 DNS 配置中添加 CNAME 记录指向 GitHub Pages 域名

## 开发指南

### 本地开发
由于项目无构建步骤，直接打开 `index.html` 即可预览：

```bash
# 使用 Python 简易服务器（推荐，支持模块加载）
python -m http.server 8000

# 或使用 Node.js serve
npx serve .
```

然后访问 `http://localhost:8000`

### 代码规范

#### JavaScript
- 使用 ES6+ 语法（类、箭头函数、const/let）
- 事件监听使用 `addEventListener`
- 防抖处理频繁触发的事件（输入、拖拽）

#### CSS
- Tailwind CSS 工具类为主
- 自定义样式放在 `css/style.css` 中
- 使用 `lucide.createIcons()` 初始化图标

### 文件组织
- **index.html**: 只包含 HTML 结构，通过 `<link>` 和 `<script>` 引入外部资源
- **css/style.css**: 所有自定义样式，包括响应式设计和组件样式
- **js/main.js**: 所有 JavaScript 逻辑，按功能模块组织

### 注意事项
1. **编码问题**: 读取文件时处理 BOM 头 (`\ufeff`)
2. **防抖优化**: 渐变编辑使用 100ms 防抖，JSON 编辑使用 500ms 防抖
3. **循环引用**: 遍历 JSON 时注意处理嵌套结构
4. **空数据处理**: 处理无效/空渐变数据时提供默认值
5. **图标初始化**: 动态添加的内容需要调用 `lucide.createIcons()`
6. **程序化更新**: 使用 `isProgrammaticUpdate` 标志避免循环更新

## 浏览器兼容性

- Chrome/Edge 80+
- Firefox 75+
- Safari 13+

需要支持：
- ES6 Modules
- CSS Custom Properties
- Web Animations API
- File API
- CSS Grid & Flexbox

## 相关链接

- [使用演示 (Bilibili)](https://www.bilibili.com/video/BV1xcBRBREWL/)
- [GitHub 仓库](https://github.com/ArvinYin1/lottiegradient)
- [Lottie 官方文档](https://airbnb.io/lottie/)
- [Bodymovin 插件](https://github.com/airbnb/lottie-web)
- [Tailwind CSS](https://tailwindcss.com/)
