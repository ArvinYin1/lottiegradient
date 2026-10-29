# tests/ — 真实浏览器冒烟测试（puppeteer-core + 系统 Chrome）

给 Lottie 渐变编辑器（纯静态站，**无构建步骤**）用的一套「真实浏览器交互」冒烟测试。
目的：UI 改版 / 重构后，一条命令确认导入、选中、改色、增删色标、搜索、播放、导出、响应式都没坏。

不修改产品代码：所有文件都在 `tests/` 内，站点通过 `file://` 直接打开 `index.html`。

## 快速开始

```bash
cd tests
npm install          # 只装 puppeteer-core（不下载 Chromium，用系统 Chrome）
npm test             # 14 条用例，退出码 0 = 全绿，1 = 有失败
```

依赖前提：

| 项 | 要求 / 本机实测 |
|---|---|
| Chrome | macOS 默认 `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`（实测 Chrome 156） |
| Node | ≥ 18（本机实测 v25.8.2 / npm 11.11.1） |
| 网络 | 不需要外网：重写后 lucide / lottie / gif.js 均为 `js/vendor/` 自托管；测试仍会等 Monaco 约 12s（取不到就用例 04 降级为只断言 UI） |
| 系统 | 无头启动必须带 `--no-sandbox --disable-breakpad --disable-crash-reporter --user-data-dir=…`（已内置，否则本机 sandbox 报错） |

## 目录

```
tests/
├── smoke.mjs            # 单文件测试（可 node 直接跑）
├── package.json         # scripts.test = node smoke.mjs
├── smoke.mjs 的 SELECTORS 常量  # 唯一的「改版适配点」
├── fixtures/master.json          # 自己造的合法 Lottie：3 个渐变、90 帧 30fps、bm=0
├── fixtures/duplicate-names.json # 用例 11：两个同名（nm="Name"）渐变
├── fixtures/stop-modes.json      # 用例 12：3 个颜色色标 + 2 个透明度色标（数量不等）
├── fixtures/keyframed.json       # 用例 14：1 个静态渐变 + 1 个 g.k={a:1,k:[…]} 关键帧渐变
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

## 用例清单（14 条）

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
| 11 | 同名渐变 | `duplicate-names.json`（2 个 `nm="Name"`）：列表出现 2 条、名字分别是 `Name #1` / `Name #2`；点第 1 条改首色标 `#00ff00`，导出 JSON 中**只有第 1 条**变色（RGB≈[0,1,0]），第 2 条保持 [0.3,0.6,0.9] |
| 12 | 色标分离 | `stop-modes.json`（3 颜色 / 2 透明度）：颜色行=3、透明度行=2（数量可不同）；点「加透明度」→ alpha +1、color 不变；点「加颜色」→ color +1、alpha 不变 |
| 13 | 改色保状态 | 播放中拖到中间并暂停，记录 `#time-display`；改一个色标颜色后等 900ms：仍为暂停（`animation.isPaused`/按钮信号）、时间显示与帧号不跳回 0、进度完全冻结 |
| 14 | 关键帧渐变 | `keyframed.json`：静态渐变可正常编辑（对照组）；选中 `g.k={a:1,k:[…]}` 的关键帧渐变后出现提示、编辑区**没有**任何色标行；导出后 `g.k.a` 仍为 1、关键帧数组原样保留 |

失败时：该用例截图到 `artifacts/FAIL-<编号>.png`，其余用例继续跑，最后打印失败清单并以退出码 1 结束。

### 用例 11-14 的稳定钩子与降级机制

线上版（`13d5c54+`）为 UI 重写预留了一批**稳定选择器钩子**，用例 11-14 优先用它们断言，不依赖 Tailwind 类名/文案/视觉顺序：

| 钩子 | 用途 |
|---|---|
| `.gradient-item` / `.gradient-name` / `.selected` | 列表条目、显示名（同名 `Name #1`/`Name #2`）、选中态 |
| `#editor [data-row="color"]` / `[data-row="alpha"]` | 颜色色标行 / 透明度色标行 |
| `[data-action="add-color-stop"]` / `[data-action="add-alpha-stop"]` | 添加颜色/透明度色标按钮 |
| `[data-action="toggle-alpha"]` | 透明度开关 |
| `.rail[data-rail="color"]` / `.rail[data-rail="alpha"]` + `.rail-stop` | 预览条颜色轨/透明度轨及其圆点（信息采集） |
| `#editor [data-editor-notice="keyframed"]` | 关键帧渐变「只提示不编辑」提示块 |
| `#gradient-type` | 渐变类型徽标（`gf`/`gs`，信息采集） |

当前**生产基线 DOM 还没有这些钩子**（旧视觉）。所以 `window.__smoke` 里每个钩子都带向后兼容 fallback：

- 颜色行：`[data-row="color"]` 缺失 → 退化为「含 `input[type=color]` 的行容器」；
- 透明度行：`[data-row="alpha"]` 缺失 → 退化为「含 ≥2 个 range 滑杆且不含颜色输入的行容器」；
- 加按钮：`[data-action=…]` 缺失 → 退化为 plus 图标按钮与 alpha 行同父容器的结构识别；
- 关键帧提示：`[data-editor-notice="keyframed"]` 缺失 → 退化为「编辑区无任何色标行且提示文本非空」的结构近似断言。

**降级是显式记录的**：用例详情里带 `[降级]`，控制台末尾汇总「因基线 DOM 缺稳定钩子而降级的断言」，`artifacts/last-run.json` 里有 `degradations` 与 `hookProbe`（每个钩子是否就位）。改版后钩子就位时会自动走 hook 路径，不再产生降级记录；若某条用例仍降级，说明对应钩子还没接上。

## 回填页测试（`backfill.mjs`，50 条）

`backfill.html` 用 Pyodide 在浏览器里跑 Python 解析 `.aep`，需要 http(s) 加载 wasm / zip，
所以这套测试**自带一个静态文件服务器**（随机端口），不走 `file://`。

```bash
cd tests && npm run test:backfill     # 只跑回填页
cd tests && npm run test:all          # 编辑器 + 回填页
```

素材：`fixtures/sample.aep`（AE 2026 存的小工程）+ `fixtures/gradient-match.json`（与工程一致）
+ `fixtures/gradient-lost.json`（渐变被写成白→黑的坏文件）。

覆盖：编辑器顶栏入口 → 页面加载 → 只传 JSON 时立即渲染「修复前」→ 加载遮罩 → nginx MIME 兼容（.mjs 不再被请求）（出现/阶段文案/消失）→ 一致场景（状态/禁用/摘要）→ 失配场景（待修正/默认勾选）
→ 深色主题 → 回填（状态变化/计数/导出可用/`g.k` 逐值等于 AE 真值/`g.p` 同步）
→ 说明弹窗开关 → 中英切换 → CDN 被阻断时回退同源。

断言依赖页面暴露的 `window.__backfillState`（回填后的 JSON 与行状态），比读 DOM 更可靠。

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
# 1b) 线上版把拉取/导出依赖放在 js/vendor/，其中 gif.js / gif.worker.js 可能未纳入 git：
#     基线副本要补齐，否则页面会报 ERR_FILE_NOT_FOUND、用例 01 会失败
cp ../js/vendor/gif.js ../js/vendor/gif.worker.js .baseline-src/js/vendor/ 2>/dev/null || true
# 2) 跑基线
SITE_ROOT="$PWD/.baseline-src" ARTIFACTS_DIR=artifacts/baseline npm test
# 3) 跑当前工作区（同一时间只能跑一个 npm test）
npm test
# 4) 对比
node -e "const a=require('./artifacts/baseline/last-run.json'),b=require('./artifacts/last-run.json');
console.log(a.results.map(r=>r.id+':'+r.status).join(' '));console.log(b.results.map(r=>r.id+':'+r.status).join(' '))"
```

当前生产基线（commit `13d5c54`，ui/redesign-v3 起点）实测：**14 PASS / 0 FAIL**（用时 27.1s），
产物在 `artifacts/prod-baseline/`。其中用例 12/14 因基线 DOM 缺稳定钩子各产生一条 `[降级]` 记录（见上节），
其余断言均为真实数据/DOM 断言；同名渐变独立性（用例 11）与改色保留播放状态（用例 13）在基线已是修复后的行为。

UI 重写后的工作区实测：**14 PASS / 0 FAIL**（用时 27.6s），`hookProbe` 显示 10 个稳定钩子**全部就位**，
用例 12/14 自动走 hook 路径、不再产生任何 `[降级]` 记录；预览条导轨计数为颜色 3 / 透明度 2 个 `.rail-stop`。
产物在 `artifacts/last-run.json`。

> 早期的 10 条基线（commit `afc4c09`，与 `main` 同一棵树）见 [BASELINE.md](BASELINE.md)：**10 PASS / 0 FAIL**。
> 该文档里的 BUG-2（改色跳帧自动播放）与 BUG-5（同名渐变无法分别编辑）在 `13d5c54` 已修复，用例 11/13 就是回归护栏。

## 常见问题

- **`npm install` 报 EPERM / 401**：本机全局 npm 指向需要鉴权的内网 registry，且 `~/.npm` 缓存里有 root 拥有的文件。`tests/.npmrc` 已固定为公共 registry + 本地缓存目录（`.npm-cache/`），在 `tests/` 内直接 `npm install` 即可。
- **Chrome 启动即崩**：确认启用了 `--no-sandbox` 等参数（已内置）；也可用 `CHROME_PATH` 指向别的 Chrome。
- **用例 04 只断言 UI**：说明 Monaco 没就绪（CDN 慢/被墙）。日志会打印 `Monaco: 未就绪`，此时跳过 JSON 断言并在结果里注明，不算失败。
- **用例 09 找不到下载文件**：确认 `artifacts/downloads/` 可写；Chrome 会先写 `.crdownload` 再改名，测试已轮询 15s。失败信息里会附带拦截到的 blob / 文件名，便于判断是导出逻辑还是下载环境问题。
- **不要并行跑两个 `npm test`**：共用 `tests/.chrome-profile` 与 `artifacts/downloads`，会互相踩。
