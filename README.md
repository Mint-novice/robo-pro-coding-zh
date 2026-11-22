# ROBO Pro Coding 6.5.4 · 简体中文界面

非官方界面语言包：只改显示语言，不动 Microsoft Store 原版。

- 适用：`beemo.ROBOProCoding_6.5.4.0_x64__1fkxabkbxp2f6`
- 版本号只跟随软件版本：6.5.4 → `v6.5.4`，内容修订直接更新本版
- 与 fischertechnik GmbH / beemo GmbH 无关联，见 [NOTICE.md](NOTICE.md)

## 安装

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-zh.ps1 -Force
```

或双击 `一键汉化.cmd`。前提三条：Windows 10/11；已从 Microsoft Store 安装并启动过 6.5.x；Node.js ≥ 18。缺项时脚本原地停下并说明，不代下原程序。

装完用桌面 / 开始菜单的 **「ROBO Pro Coding 中文」** 启动。商店里的「ROBO Pro Coding」图标是未改动的原版，恒为英文。
回滚：`scripts\uninstall-zh.ps1`（等价于删 `%LOCALAPPDATA%\Programs\ROBOProCoding-zh` 与 `%LOCALAPPDATA%\ROBOProCoding-zh-data`）。

也可把本仓库地址发给 AI：「按 README 把中文界面装到我本机，装完贴校验结果」。

## 改了什么

界面文案由 ngx-translate 从 `messages.<lang>.xlf` 加载，位置 `client/www/assets/<组件>/i18n/`；官方只发 de / en / es / fr / nl / pt / ru / ua。本地化三步：

1. 放 `messages.zh.xlf`，三处 i18n 目录各一份，缺译回退英文；
2. 语言枚举加 `ZH="zh"`；
3. 设置页语言下拉插第 9 项「中文」。

第 3 步落在 AOT 编译产物 `main.*.js` 上：模板已是硬编码节点索引的指令序列，插 2 个节点要同步改 `decls/vars`、重排 create 块（≥33 整体 +2）、重排 update 块 `Xe(N,…)`、接绑定链。由带断言的脚本执行，断言不过即中止。推导见 [docs/1-方法论.md](docs/1-方法论.md) §5.3。

安装不就地改 Store 目录：复制到 `%LOCALAPPDATA%\Programs\ROBOProCoding-zh`，用户数据独立在 `%LOCALAPPDATA%\ROBOProCoding-zh-data`。

## 数值

| 项 | 值 |
|---|---|
| 译文 | 1017 条（主程序 861 + 控制器面板 128 + 代码编辑器 28） |
| 条目层 | `TOTAL_ENTRIES 1017 PROBLEMS 0`：键集、占位符 `%1…%6`、富文本 `<x id="…"/>` 全对齐 |
| 打包层 | 逐文件回读 `entries=1953 checked=1953 mismatched=0 missingSrc=0`，三份 `messages.zh.xlf` |
| 原版 | 零改动；回滚 = 删两个目录 |

复核方法见 [docs/3-校验与验收.md](docs/3-校验与验收.md)。

## 边界

| 位置 | 原因 |
|---|---|
| TXT 4.0 控制器本机触摸屏 UI | 固件资源，不在桌面 asar 内 |
| GitLab 示例、官方文档站 | 在线内容，仍为原文 |
| 代码生成器输出、Python 报错、固件回传 | 运行时拼接串 |
| 应用名、图标、安装包 | 不改名、不换标、不重签名 |

仓库不含 `app.asar` / `main.*.js` / exe / 字体 / 安装包；不含原程序，不做破解，不碰授权与更新通道。

## 排错

| 现象 | 处理 |
|---|---|
| 语言下拉里没有「中文」 | 开的是商店原版，改用「ROBO Pro Coding 中文」 |
| 有下拉，界面仍英文 | 设置 → 语言 → 中文 → 应用；或删用户数据目录重开（跟随系统语言） |
| 双击一闪即退（退出码 9） | 环境带 `ELECTRON_RUN_AS_NODE`，改用 `启动-汉化版 ROBO Pro Coding.bat` |
| 要与原版并存 | 两份各用独立用户数据目录，互不影响 |

## 目录

```text
VERSION · 一键汉化.cmd · CHANGELOG.md · NOTICE.md · LICENSE
docs/     1-方法论 · 2-术语表 · 3-校验与验收 · 4-版本升级SOP
i18n/     en/（id+source）· zh/（1017 条）· manifest.json（条目数 / sha256 / 版本）
tools/    9 个零依赖 Node 脚本
scripts/  install-zh.ps1 · uninstall-zh.ps1
launcher/ 启动-汉化版 ROBO Pro Coding.bat
```

| 想知道 | 看 |
|---|---|
| 换一个 Electron + Angular 应用怎么汉化 | [docs/1-方法论.md](docs/1-方法论.md) |
| 某个词为什么这么译 | [docs/2-术语表.md](docs/2-术语表.md) |
| 怎么验证装好了 | [docs/3-校验与验收.md](docs/3-校验与验收.md) |
| 官方升版后怎么重建 | [docs/4-版本升级SOP.md](docs/4-版本升级SOP.md) |
