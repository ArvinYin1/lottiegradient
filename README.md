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
| 🛠️ **渐变修复** | Lottie 渐变丢失/变黑白/错位时，带上 `.aep` 与 JSON（可多选），从工程里读真实色标自动修复，附修复前/后对比播放 |

---

| Feature | Description |
|---------|-------------|
| 📂 **JSON Import** | Drag or click to upload Lottie JSON files |
| ▶️ **Animation Preview** | Real-time playback with progress control and background switching |
| 🎨 **Gradient Edit** | Visually edit colors, positions, and transparency of each gradient |
| 🔄 **Gradient Sync** | Import gradient configs from other JSON files for batch syncing |
| 💾 **One-click Export** | Export fixed JSON files ready for production |
| 🔍 **Gradient Search** | Quickly locate specific gradients in animations |
| 🛠️ **Gradient Fix** | When gradients are lost, black-and-white or shifted, load a `.aep` plus one or more JSON files, auto-fix from the project and preview before/after |

---

> 首页（渐变修复）首次使用需加载约 15 MB 的浏览器内 Python 运行时（之后走缓存），页面会显示加载进度。

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

- **前端**：原生 HTML + JavaScript（无构建步骤）
- **样式**：手写 CSS 设计系统（shadcn 风格 token + 深浅主题）
- **动画渲染**：Lottie Web (Bodymovin)，自托管
- **图标 / GIF**：Lucide、gif.js，自托管
- **渐变修复**：Pyodide + py-aep（浏览器内跑 Python 解析 `.aep`，按需加载）

---

- **Frontend**: Vanilla HTML + JavaScript (no build step)
- **Styling**: Hand-written CSS design system (shadcn-style tokens, light/dark)
- **Animation Rendering**: Lottie Web (Bodymovin), self-hosted
- **Icons / GIF**: Lucide, gif.js, self-hosted
- **Gradient backfill**: Pyodide + py-aep (Python in the browser to parse `.aep`, lazy-loaded)

---

## 本地运行 / Local Development

```bash
# 克隆仓库
git clone https://github.com/ArvinYin1/lottiegradient.git

# 进入目录
cd lottiegradient

# 首页（渐变修复）要加载 wasm，必须走本地服务器
python3 -m http.server 8080
open http://localhost:8080/

# 渐变编辑器在 /editor.html
```

---

```bash
# Clone the repository
git clone https://github.com/ArvinYin1/lottiegradient.git

# Enter the directory
cd lottiegradient

# The homepage (gradient backfill) loads wasm, so it needs a local server
python3 -m http.server 8080
open http://localhost:8080/

# The editor lives at /editor.html
```

---

## 部署 / Deployment

本项目是纯静态站点，同时托管在 GitHub Pages 与自建 nginx 服务器上。

- **GitHub Pages**：推送到 `main` 分支后自动更新，备用地址 https://arvinyin1.github.io/lottiegradient/
- **自建服务器**：通过仓库根目录的 `deploy.sh` 用 rsync over SSH 同步到 nginx 站点目录（HTTPS 由 Let's Encrypt 自动续期）

> **首页运行时来源**：默认从 GitHub Pages（CDN）加载 Pyodide，失败自动回落同源 `js/vendor/`；自建服务器带宽有限时可显著提速。需要强制同源时给页面加 `?local=1`。

> **nginx MIME 建议**（首页已在前端兜底，配了可启用 wasm 流式编译并省一次内存拷贝）：
> ```nginx
> types { application/wasm wasm; }
> gzip on; gzip_types application/wasm application/javascript;
> ```

### 手动部署

在任意已检出仓库、安装 rsync 并持有部署密钥的机器上运行：

```bash
SSH_KEY=/path/to/key ./deploy.sh            # 同步静态文件并自动验收
SSH_KEY=/path/to/key ./deploy.sh --dry-run  # 只预览，不改动服务器
```

默认服务器为 `root@43.155.27.82`，目标目录为 `/var/www/lottiegradient`，验收地址为 `https://www.lottie.uno/`。可用 `HOST`、`REMOTE_DIR`、`SITE_URL` 环境变量覆盖。脚本只同步 `index.html editor.html backfill.html css js svg`，并启用 SSH 严格主机校验；本机 `known_hosts` 必须包含可信的服务器主机公钥。

### GitHub Actions 自动部署

在 **Settings > Secrets and variables > Actions > Secrets** 中配置：

| Secret | 内容 |
|--------|------|
| `DEPLOY_SSH_KEY` | 部署私钥的完整内容，仅保存在 GitHub Secrets，不提交到仓库 |
| `DEPLOY_SSH_HOST_KEY` | 经核对的服务器 known_hosts 行，例如 `43.155.27.82 ssh-ed25519 AAAA...` |

配置后，每次推送 `main` 都会自动执行 `.github/workflows/deploy.yml`，也可在 **Actions > Deploy production > Run workflow** 手动触发。工作流调用同一个 `deploy.sh`，线上验收失败会使任务失败。

---

This is a pure static site, hosted on both GitHub Pages and a self-managed nginx server.

> **Runtime source**: the backfill page loads Pyodide from GitHub Pages (CDN) by default and falls back to `js/vendor/` on the same origin; append `?local=1` to force same-origin.

> **Recommended nginx MIME** (the backfill page works without it, but this enables streaming wasm compilation and gzip):
> ```nginx
> types { application/wasm wasm; }
> gzip on; gzip_types application/wasm application/javascript;
> ```

### Manual deployment

Run this on any machine with a repository checkout, rsync, and the deployment key:

```bash
SSH_KEY=/path/to/key ./deploy.sh            # Sync static files and verify the live site
SSH_KEY=/path/to/key ./deploy.sh --dry-run  # Preview without changing the server
```

Defaults are `root@43.155.27.82`, `/var/www/lottiegradient`, and `https://www.lottie.uno/`; override them with `HOST`, `REMOTE_DIR`, and `SITE_URL`. Only `index.html editor.html backfill.html css js svg` are synced. Strict SSH host checking is enabled, so the local `known_hosts` must contain the verified server host key.

### Automatic deployment with GitHub Actions

Under **Settings > Secrets and variables > Actions > Secrets**, configure:

| Secret | Contents |
|--------|----------|
| `DEPLOY_SSH_KEY` | Full deployment private key; store it only in GitHub Secrets, never in Git |
| `DEPLOY_SSH_HOST_KEY` | Verified server known_hosts line, such as `43.155.27.82 ssh-ed25519 AAAA...` |

Every push to `main` then runs `.github/workflows/deploy.yml`. You can also use **Actions > Deploy production > Run workflow**. The workflow runs the same `deploy.sh` and fails when live verification fails.

---

## 相关链接 / Related Links

- [Lottie 官方文档](https://airbnb.io/lottie/)
- [Bodymovin 插件](https://github.com/airbnb/lottie-web)

---

- [Lottie Documentation](https://airbnb.io/lottie/)
- [Bodymovin Plugin](https://github.com/airbnb/lottie-web)

---

MIT License © 2024
