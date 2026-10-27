# BASELINE — 首次基线运行结果（改版前代码）

## 结论

**10 PASS / 0 FAIL**（用时 14.5s），基线全绿。后续 UI 重写完成后，用同一套用例再跑一次即可对比。

## 被测基线是哪个 commit

`HEAD = afc4c09`，与 `main` 完全同一棵树（`git diff --stat main HEAD` 为空），即 UI 重写开始前的代码。

> 说明：搭建测试期间 Lead 的重写已经落到工作区（`index.html` / `css/style.css` / `js/main.js` 均被修改），
> 因此基线不是直接在仓库根跑的，而是用 `git archive` 导出一份**纯净副本**跑，避免读写冲突、也绝不碰 Lead 的写区。

## 环境

| 项 | 值 |
|---|---|
| 时间 | 2026-10-27 18:13（Asia/Shanghai） |
| 系统 | macOS |
| Chrome | `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`，Chrome 156.0.8078.48，无头 |
| Node / npm | v25.8.2 / 11.11.1 |
| 视口 | 默认 1280×900，用例 10 额外切 900×1200 |
| Monaco | 已就绪（CDN 正常，用例 04 的 JSON 断言走真实 Monaco 值） |
| fixture | `tests/fixtures/master.json`：3 个渐变（Grad-Blue 2 色标 / Grad-Sunset 3 色标 + 描边 gs / Grad-Alpha 3 色标且带 alpha 数据），90 帧 @30fps，`bm=0`，bodymovin 真实渲染 |

## 运行命令

```bash
cd tests
git archive afc4c09 | tar -x -C .baseline-src          # 导出纯净基线（.baseline-src 已 gitignore）
SITE_ROOT="$PWD/.baseline-src" ARTIFACTS_DIR=artifacts/baseline npm test
```

产物：`tests/artifacts/baseline/`（截图、`downloads/lottie_animation.json`、`last-run.json`、`run.log`）。

## 逐条结果

| # | 用例 | 结果 | 实际观察 |
|---|---|---|---|
| 01 | 页面加载：核心元素 + 无 console error / pageerror | **PASS** | 5 个核心 id 全部存在；`console error=0`，`pageerror=0`；bodymovin / lucide / monaco 均加载；title="Lottie Gradient Editor" |
| 02 | 导入 JSON | **PASS** | 列表出现 3 项 `["Grad-Blue","Grad-Sunset","Grad-Alpha"]`；`#gradient-count` `0`→`3`；`#file-info` 由 hidden 变可见；`#filename`=master.json；动画 90 帧/30fps 自动播放；自动选中第一个渐变 |
| 03 | 选中渐变 | **PASS** | 点第 2 项 → `.selected` 移动（第 1 项失去、第 2 项获得）；点回第 1 项恢复；`#editor` 色标行=2、颜色输入=2；「添加色标」按钮在色标行外 |
| 04 | 编辑颜色 | **PASS** | 首色标改 `#ff0000` → 行内 hex 输入框=`ff0000`；Monaco 中的动画 JSON 内 `Grad-Blue` 首色标 RGB=[1.000, 0.000, 0.000] |
| 05 | 添加色标 | **PASS** | 色标行数 2 → 3 |
| 06 | 删除色标 | **PASS** | 点最后一个色标行的删除按钮（svg 图标、无文案）→ 行数 3 → 2 |
| 07 | 搜索过滤 | **PASS** | 输入 `alpha` → 可见 1/3（仅 Grad-Alpha），DOM 节点仍为 3；清空后恢复 3 |
| 08 | 播放控制 | **PASS** | 播放中 `time-display` `53 / 90`→`77 / 90`；再点一次 `isPaused=true`，进度冻结在 `78 / 90` |
| 09 | 导出 JSON | **PASS** | 真实下载到 `artifacts/baseline/downloads/lottie_animation.json`（3218 B，3 个渐变），`JSON.parse` 成功，`op=90` 与 fixture 一致 |
| 10 | 响应式 | **PASS** | 1280×900：scrollWidth=1280 ≤ innerWidth=1280；900×1200：900 ≤ 900。均无横向溢出，两张截图已存 |

运行日志全文：`tests/artifacts/baseline/run.log`；机器可读：`tests/artifacts/baseline/last-run.json`。

## 测试自身健壮性验证

同一套用例（同一份 `smoke.mjs`）在 Lead 重写中/后**尚未合并**的工作区也跑过一遍：**10 PASS / 0 FAIL**。
说明自动定位规则（`input[type=color]` 结构、plus 图标 / 色标行之后找「添加色标」、行内找删除按钮、`.gradient-name` 回退）对两版 DOM 都成立；
改版后如果再 FAIL，优先检查 `smoke.mjs` 顶部 `SELECTORS`（见 README「改版后如何适配」）。

## 现有 bug（只报告，未修改任何产品代码）

### BUG-1（较严重）Monaco 延迟 2s 初始化竞态：2 秒内导入文件后，编辑渐变静默失效、导出报错

- **复现**：打开 `index.html` 后在 2s 内上传任意 JSON → 等 Monaco 初始化完成 → 修改第一个色标颜色 → 点「导出 JSON」。
- **原因**：`initMonacoEditor()` 用 `setTimeout(..., 2000)` 注入 Monaco，`monaco.editor.create({ value: '' })` 创建空文档；
  如果导入发生在此之前，JSON 只写进了隐藏 `#json-editor`，Monaco 创建后拿不到它。
  之后 `updateGradientInJson()` 里 `JSON.parse(monacoEditor.getValue())` 解析空串抛错，被 `catch` 吞成一条 console error。
- **实测证据**（基线代码）：`monacoEditor.getValue().length === 0`，`#json-editor` 长度 13126；改色后 console 出现
  `Error updating gradient: SyntaxError: Unexpected end of JSON input`；再点导出会 `alert("没有可导出的内容")`。
  （这是我在写用例 04 时发现并确认过的真实行为；默认用例不会触发，因为用例会先等 Monaco 就绪再导入。）
- **影响**：首屏 2 秒内操作的用户会「改了颜色但 JSON 没变、导出失败」。建议方向（供参考）：`create()` 时用已有 `#json-editor` 的值初始化，或 `updateGradientInJson` 在 monaco 为空时回退到 textarea 并写回。

### BUG-2 改任意渐变色都会重建动画：进度跳回 0 并自动播放

- **复现**：导入 → 把动画定位到第 45 帧并暂停 → 改任意色标颜色 → 观察 `animation.currentFrame` / 预览。
- **原因**：`updateGradientInJson()` 每次都 `animation.destroy()` 再 `bodymovin.loadAnimation({ autoplay: true, ... })`。
- **实测**：改色前 `currentFrame=45`（暂停），改色后 900ms 时 `currentFrame≈24`、`isPaused=false`——即跳回开头并开始播放。
- **影响**：对帧调色时预览不断跳帧；暂停状态被强制打断；播放按钮图标可能与真实状态不一致。

### BUG-3（基线已存在，重写版已修）「启用透明度」开关视觉与状态不同步

- **复现**：导入 → 选中第 3 个渐变 `Grad-Alpha`（带 alpha 数据）→ 看右侧「启用透明度」开关。
- **现象**：`with_alpha=true`、alpha 输入框已启用且数值正确（0/45/100），但开关仍是「关」样式
  （class 为 `bg-white text-slate-500 border-slate-200`，无 `bg-blue-50 text-blue-600`）。因为 `update()` 里改了 `with_alpha` 却没有调用 `updateAlphaToggleStyle()`。
  此时点这个开关会把 `with_alpha` 置回 `false` 并禁用 alpha 编辑，语义反直觉。
- **重写版验证**：`<button role="switch">` 的 `aria-checked="true"`、alpha 行 `is-dim` 正确，已修复。此处仅作为基线问题记录。

### BUG-4 lucide 1.21.0 没有 `github` 图标：每次 `createIcons()` 打 warning，帮助弹窗 GitHub 图标缺失

- 基线运行共 **28 条** `icon name was not found in the provided icons object.` 警告，全部来自 `<i data-lucide="github">`。
- 重写版运行 **0 条** 同类警告（该图标已移除/替换）。基线上仅控制台噪音 + 帮助弹窗底部 GitHub 图标不显示。

### BUG-5（设计限制）渐变按 `nm` 去重 / 按 `nm` 匹配，同名渐变无法分别编辑

- `findAdobeGradientNames()` 用渐变名去重，`updateGradientInJsonData()` 也按名字匹配。
- 结果：同一 JSON 里两个同名渐变只会出现一个列表项，编辑时会**同时写入所有同名渐变**；无法只改其中一个。
  属于既有设计限制，需求若要求支持同名渐变需要改数据结构（用路径/索引定位）。

## 改版后怎么对比

```bash
cd tests
npm test        # 当前工作区；结果写入 artifacts/last-run.json
```

- 逐条对比 `artifacts/baseline/last-run.json` 与 `artifacts/last-run.json` 的 `results[].status`；
- 关注 `consoleErrors` / `pageErrors` / `warnings`（基线 0 error、28 warning），以及每条的 `detail`（帧数、行数、下载大小等实际观察）；
- 若某条因选择器变化而 FAIL，按 README 的「改版后如何适配」调整 `SELECTORS` 后重跑。
