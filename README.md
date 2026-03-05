# Lottie Gradient Editor / Lottie 渐变色编辑器

> 一个用于修复和编辑 Lottie 动画渐变色的在线工具  
> An online tool for fixing and editing gradient colors in Lottie animations

[🌐 在线使用 / Live Demo](https://www.lottie.uno) | [📺 视频演示 / Video Demo](https://www.bilibili.com/video/BV1xcBRBREWL/)

---

## 背景问题 / Background

在使用 After Effects 配合 Bodymovin 插件导出 Lottie 动画时，经常会遇到**渐变色丢失**的问题：
- 渐变色变成黑白或纯色
- 透明度信息丢失
- 颜色位置偏移或错乱

虽然网上有一些解决方法，但在某些导出环境下仍然无法完全修复。本工具就是为了解决这个痛点而生。

---

When exporting Lottie animations from After Effects using the Bodymovin plugin, **gradient colors are often lost**:
- Gradients turn black/white or solid colors
- Transparency information is lost
- Color positions are offset or scrambled

Although there are some solutions online, they don't always work in certain export environments. This tool was created to solve this pain point.

---

## 功能特性 / Features

| 功能 | 说明 |
|------|------|
| 📂 **JSON 导入** | 拖拽或点击上传 Lottie JSON 文件 |
| ▶️ **动画预览** | 实时播放动画，支持进度控制和背景切换 |
| 🎨 **渐变色编辑** | 可视化编辑每个渐变的颜色、位置、透明度 |
| 🔄 **渐变同步** | 导入其他 JSON 文件的渐变配置进行批量同步 |
| 💾 **一键导出** | 导出修复后的 JSON 文件，直接投入使用 |
| 🔍 **渐变搜索** | 快速定位动画中的特定渐变 |

---

| Feature | Description |
|---------|-------------|
| 📂 **JSON Import** | Drag or click to upload Lottie JSON files |
| ▶️ **Animation Preview** | Real-time playback with progress control and background switching |
| 🎨 **Gradient Edit** | Visually edit colors, positions, and transparency of each gradient |
| 🔄 **Gradient Sync** | Import gradient configs from other JSON files for batch syncing |
| 💾 **One-click Export** | Export fixed JSON files ready for production |
| 🔍 **Gradient Search** | Quickly locate specific gradients in animations |

---

## 快速开始 / Quick Start

### 1. 打开工具
访问在线地址：https://www.lottie.uno

### 2. 导入动画
- 点击「导入 JSON」按钮，或
- 直接将 `.json` 文件拖拽到左侧预览区域

### 3. 编辑渐变
- 在「渐变列表」中点击需要修改的渐变项
- 在右侧编辑器中调整颜色、位置、透明度
- 左侧预览区实时查看效果

### 4. 导出文件
点击「导出 JSON」按钮，下载修复后的动画文件

---

### 1. Open the Tool
Visit the live demo: https://www.lottie.uno

### 2. Import Animation
- Click the "Import JSON" button, or
- Directly drag and drop a `.json` file into the preview area on the left

### 3. Edit Gradients
- Click the gradient item you want to modify in the "Gradient List"
- Adjust colors, positions, and transparency in the editor on the right
- View the effect in real-time in the preview area on the left

### 4. Export File
Click the "Export JSON" button to download the fixed animation file.

---

## 使用技巧 / Tips

- **背景切换**：点击「网格」按钮切换透明背景，或使用颜色选择器设置纯色背景
- **渐变同步**：如果你有多个动画需要统一渐变色，可以先在一个动画中调好，然后使用「同步渐变」功能应用到其他动画
- **播放控制**：拖动进度条可以精确查看动画某一帧的效果

---

- **Background Toggle**: Click the "Grid" button to toggle transparent background, or use the color picker to set a solid background
- **Gradient Sync**: If you have multiple animations that need unified gradients, adjust one first, then use the "Sync Gradient" feature to apply to others
- **Playback Control**: Drag the progress bar to precisely view the animation at any frame

---

## 技术栈 / Tech Stack

- **前端**：原生 HTML + JavaScript
- **样式**：Tailwind CSS
- **动画渲染**：Lottie Web (Bodymovin)
- **代码编辑**：Monaco Editor

---

- **Frontend**: Vanilla HTML + JavaScript
- **Styling**: Tailwind CSS
- **Animation Rendering**: Lottie Web (Bodymovin)
- **Code Editing**: Monaco Editor

---

## 本地运行 / Local Development

```bash
# 克隆仓库
git clone https://github.com/ArvinYin1/lottiegradient.git

# 进入目录
cd lottiegradient

# 直接用浏览器打开，或使用本地服务器
open index.html
# 或
python3 -m http.server 8080
```

---

```bash
# Clone the repository
git clone https://github.com/ArvinYin1/lottiegradient.git

# Enter the directory
cd lottiegradient

# Open directly in browser, or use a local server
open index.html
# or
python3 -m http.server 8080
```

---

## 相关链接 / Related Links

- [Lottie 官方文档](https://airbnb.io/lottie/)
- [Bodymovin 插件](https://github.com/airbnb/lottie-web)

---

- [Lottie Documentation](https://airbnb.io/lottie/)
- [Bodymovin Plugin](https://github.com/airbnb/lottie-web)

---

MIT License © 2024
