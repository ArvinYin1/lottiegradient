# tests/ — 真实浏览器冒烟测试（puppeteer-core + 系统 Chrome）

给 Lottie 渐变编辑器（纯静态站，**无构建步骤**）用的一套「真实浏览器交互」冒烟测试。
目的：UI 改版 / 重构后，一条命令确认导入、选中、改色、增删色标、搜索、播放、导出、响应式都没坏。

不修改产品代码：所有文件都在 `tests/` 内，站点通过 `file://` 直接打开 `index.html`。

## 快速开始

```bash
cd tests
npm install          # 只装 puppeteer-core（不下载 Chromium，用系统 Chrome）
npm test             # 10 条用例，退出码 0 = 全绿，1 = 有失败
```

依赖前提：

| 项 | 要求 / 本机实测 |
|---|---|
| Chrome | macOS 默认 `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`（实测 Chrome 156） |
| Node | ≥ 18（本机实测 v25.8.2 / npm 11.11.1） |
| 网络 | 需要访问 CDN：lucide、bodymovin、monaco（`file://` 页面联网加载） |
| 系统 | 无头启动必须带 `--no-sandbox --disable-breakpad --disable-crash-reporter --user-data-dir=…`（已内置，否则本机 sandbox 报错） |

## 目录

```
tests/
├── smoke.mjs            # 单文件测试（可 node 直接跑）
├── package.json         # scripts.test = node smoke.mjs
├── smoke.mjs 的 SELECTORS 常量  # 唯一的「改版适配点」
├── fixtures/master.json # 自己造的合法 Lottie：3 个渐变、90 帧 30fps、bm=0
├── README.md
├── BASELINE.md          # 首次基线结果 + 已发现的现有 bug（只报告不修）
├── .npmrc               # 公共 registry + 本地缓存（绕过本机 npm 配置问题）
├── .gitignore           # node_modules/artifacts/.chrome-profile/.baseline-src/.npm-cache
└── artifacts/           # 运行产物（gitignored）：截图、下载文件、last-run.json
```

## 环境变量

| 变量 | 默认 | 说明 |
|---|---|---|
| `CHROME_PATH` | `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` | 自定义 Chrome 可执行文件 |
| `SITE_ROOT` | 仓库根目录 | 被测站点根目录；可指向任意 checkout（基线对比用） |
| `ARTIFACTS_DIR` | `tests/artifacts` | 截图 / 下载 / `last-run.json` 输出目录 |
| `HEADFUL` | 无（无头） | `HEADFUL=1` 有头模式，方便肉眼调试 |
| `WAIT_TIMEOUT` | `8000` | 单个等待条件的超时（ms） |

## 用例清单（10 条）

| # | 用例 | 主要断言 |
|---|---|---|
| 01 | 页面加载 | 5 个核心 id 存在（`lottie-file`/`export-btn`/`gradient-file`/`gradient-search`/`play-pause-btn`）；加载阶段 console error=0、pageerror=0；bodymovin 可用 |
| 02 | 导入 JSON | `input.files` 上传 fixture 后：`.gradient-item` 数量=3、`#gradient-count` 从 0 变 3、`#file-info` 由隐藏变可见、`#filename` 有值、bodymovin 动画渲染且总帧数>30 并自动播放 |
| 03 | 选中渐变 | 点击第 2 项 → `.selected` 移动；点回第 1 项 → 恢复；`#editor` 出现 `input[type=color]` 且色标行数=颜色输入数；找到「添加色标」按钮且在色标行之外 |
| 04 | 编辑颜色 | 第一个色标改 `#ff0000` → 行内 hex 输入框同步含 `ff0000`；动画 JSON（Monaco 隐藏区）内该渐变首色标 RGB≈[1,0,0]。取不到 JSON 时按约定降级为只断言 UI，并在结果里注明 |
| 05 | 添加色标 | 点击「添加色标」→ `#editor` 内色标行数 +1 |
| 06 | 删除色标 | 点击最后一个色标行的删除按钮 → 行数恢复 |
| 07 | 搜索过滤 | 在 `#gradient-search` 输入 `alpha` → 可见项=1（仅 Grad-Alpha）、DOM 节点数不变=3、可见项名称都含搜索词；清空后恢复 3 |
| 08 | 播放控制 | 播放中 `#time-display`/`currentFrame` 前进；再点一次 → `animation.isPaused===true` 且进度冻结 |
| 09 | 导出 JSON | 点 `#export-btn`，通过 CDP `Browser.setDownloadBehavior` 捕获真实下载文件；文件名以 `.json` 结尾、`JSON.parse` 成功、含 layers、含全部 3 个渐变、`op` 与 fixture 一致 |
| 10 | 响应式 | 1280×900 与 900×1200 两个视口：`documentElement.scrollWidth` 与 `body.scrollWidth` 均 ≤ `innerWidth + 2`；各存一张截图 |

失败时：该用例截图到 `artifacts/FAIL-<编号>.png`，其余用例继续跑，最后打印失败清单并以退出码 1 结束。

## 输出与产物

- 控制台：`PASS/FAIL` 表 + 每条用例的实际观察（渐变名、帧数、行数变化、下载文件大小……）。
- `artifacts/last-run.json`：机器可读结果（每条用例状态/耗时/明细、console error、warning、pageerror、弹窗、请求失败、git 分支/commit、Chrome 路径、Monaco 是否就绪）。改版前后可直接 diff 这个文件。
- `artifacts/*.png`：加载/导入/选中/搜索/两个响应式视口的截图。
- `artifacts/downloads/lottie_animation.json`：用例 09 真实下载到的导出文件。

## 改版后如何适配（只改 SELECTORS）

测试刻意**不断言任何界面文案**，定位原则：

1. 优先 `id`（顶部工具栏、列表、编辑器、播放器都有稳定 id）；
2. 色标行：从 `#editor input[type=color]` 向上找「最近同时包含 `input[type=text]` 的祖先」——不依赖 class 名，文案改成英文/改布局都不受影响；
3. 「添加色标」按钮自动识别（按优先级）：
   a. `SELECTORS.addStopButton`（手动指定时优先）；
   b. 含 plus 图标的按钮（`[data-lucide="plus"]` / `.lucide-plus`）；
   c. 位于最后一个色标行之后、且不是开关类（`role=switch` / `aria-checked` / class 含 `switch`）的最后一个按钮；
   d. 兜底：不在色标行内的最后一个非开关按钮。
4. 「删除」按钮：`SELECTORS.deleteButton` → 行内 `.row-del` → 行内第一个 `button`；
5. 渐变名：`.gradient-name` 取不到时回退到条目文本并去掉序号前缀。

如果改版后某条用例因定位失败而 FAIL，通常只需改 `smoke.mjs` 顶部的 `SELECTORS`：

```js
const SELECTORS = {
  // ...
  addStopButton: '#editor .add-stop',   // 改版后固定选择器
  deleteButton: '.stop-row .row-del',
  gradientName: '.item-title',
};
```

## 基线对比（改版前 vs 改版后）

```bash
cd tests
# 1) 导出改版前的干净代码树（不碰当前工作区）
git archive <baseline-commit> | tar -x -C .baseline-src
# 2) 跑基线
SITE_ROOT="$PWD/.baseline-src" ARTIFACTS_DIR=artifacts/baseline npm test
# 3) 跑当前工作区
npm test
# 4) 对比
node -e "const a=require('./artifacts/baseline/last-run.json'),b=require('./artifacts/last-run.json');
console.log(a.results.map(r=>r.id+':'+r.status).join(' '));console.log(b.results.map(r=>r.id+':'+r.status).join(' '))"
```

见 [BASELINE.md](BASELINE.md)：基线（commit `afc4c09`，与 `main` 同一棵树）**10 PASS / 0 FAIL**。

## 常见问题

- **`npm install` 报 EPERM / 401**：本机全局 npm 指向需要鉴权的内网 registry，且 `~/.npm` 缓存里有 root 拥有的文件。`tests/.npmrc` 已固定为公共 registry + 本地缓存目录（`.npm-cache/`），在 `tests/` 内直接 `npm install` 即可。
- **Chrome 启动即崩**：确认启用了 `--no-sandbox` 等参数（已内置）；也可用 `CHROME_PATH` 指向别的 Chrome。
- **用例 04 只断言 UI**：说明 Monaco 没就绪（CDN 慢/被墙）。日志会打印 `Monaco: 未就绪`，此时跳过 JSON 断言并在结果里注明，不算失败。
- **用例 09 找不到下载文件**：确认 `artifacts/downloads/` 可写；Chrome 会先写 `.crdownload` 再改名，测试已轮询 15s。失败信息里会附带拦截到的 blob / 文件名，便于判断是导出逻辑还是下载环境问题。
- **不要并行跑两个 `npm test`**：共用 `tests/.chrome-profile` 与 `artifacts/downloads`，会互相踩。
