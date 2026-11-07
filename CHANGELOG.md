# CHANGELOG

版本号只跟随软件版本：软件 `x.y.z` → 本仓库 tag `vx.y.z`。内容修订直接更新这一版，不额外编号。

## v6.5.4 — 2026-11-06

对应 ROBO Pro Coding **6.5.4**（Microsoft Store 包 `beemo.ROBOProCoding_6.5.4.0_x64__1fkxabkbxp2f6`）。

**译文**

- 中文界面 **1017 条**：主程序 861（`rpc-01…08`）/ 控制器面板 128（`ctrl-01`）/ 代码编辑器内建串 28（`cm-01`）。
- 占位符 `%1…%6`、富文本 `<x id="…"/>` 全对齐；无空值、无缺键、无多余键。
- 官方原文瑕疵 4 处按语义处理，记录在 `docs/2-术语表.md §2.6`。

**语言改动**

- `main.*.js`：语言枚举加 `ZH="zh"`；设置页 AOT 模板插入第 9 个 `mat-option`「中文」，同步改 `decls 62→64`、`vars 41→42`、create/update 索引 ≥33 整体 +2、绑定链插入。
- 三份 `messages.zh.xlf` 由官方 `messages.en.xlf` 派生，`target-language="zh-CN"`。
- `app.asar` 按规范重打包，逐文件回读 `entries=1953 checked=1953 mismatched=0 missingSrc=0`。

**交付**

- 安装到 `%LOCALAPPDATA%\Programs\ROBOProCoding-zh` 独立副本，Store 原版零改动；回滚 = 删两个目录。
- 安装脚本自动创建**桌面 / 开始菜单「ROBO Pro Coding 中文」快捷方式**（指向副本，带独立用户数据目录）；双击即中文，不必记路径。
- `一键汉化.cmd` 双击即装；AI 也可直接照 README 装。
- README 增加「打开方式」与「没看到中文？」排错表：区分商店原版图标 / 中文图标，覆盖一闪即退（`ELECTRON_RUN_AS_NODE`）、语言未生效、与原版并存等情况。
- 措辞与行为收敛：README 只陈述事实与使用条件；NOTICE 写明仓库不含原程序、脚本不写系统目录、不改授权/更新/签名；LICENSE 仅覆盖自写代码。

**未覆盖**

- TXT 4.0 控制器本机触摸屏 UI（固件资源）、在线文档与示例描述、代码生成器/Python 报错的运行时拼接串。
