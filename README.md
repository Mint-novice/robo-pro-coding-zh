# ROBO Pro Coding 中文界面 · 可复现工程包

> 适用：fischertechnik **ROBO Pro Coding 6.5.4**（Microsoft Store 包 `beemo.ROBOProCoding_6.5.4.0_x64__1fkxabkbxp2f6`）
> 版本号规则：**只跟随软件版本号** —— 软件 `6.5.4` → 标签 `v6.5.4`。内容修订直接更新这一版，不额外编号。
> 性质：**非官方、未获授权、与 fischertechnik GmbH / beemo GmbH 无任何关联**，详见 [NOTICE.md](NOTICE.md)

---

## 一、怎么装

**交给 AI**：把仓库链接丢给它，一句话就够——

```text
https://github.com/Mint-novice/robo-pro-coding-zh
按 README 把 ROBO Pro Coding 的中文界面装到我本机，装完把校验结果贴给我。
```

**自己动手**：双击 `一键汉化.cmd`，或 `powershell -ExecutionPolicy Bypass -File .\scripts\install-zh.ps1 -Force`。

前提三条：Windows 10/11、**你自己已从商店安装并启动过** ROBO Pro Coding 6.5.x、Node.js ≥ 18。
缺哪条脚本会直接停下说缺什么——它不会去替你下载原程序。

---

## 二、这个工程包里有什么

| 项 | 数值 / 说明 |
|---|---|
| 中文译文 | **1017 条**：主程序 861 + 控制器面板 128 + 代码编辑器内建串 28 |
| 覆盖面 | 主界面、菜单、对话框、积木块标题与提示、控制器面板、代码编辑器提示、设置页（含语言下拉第 9 项「中文」） |
| 条目层校验 | `TOTAL_ENTRIES 1017 PROBLEMS 0`（键集 / 占位符 `%1…%6` / 富文本 `<x id="…"/>` 全对齐） |
| 打包层校验 | 逐文件回读 `entries=1953 checked=1953 mismatched=0 missingSrc=0`，三份 `messages.zh.xlf` |
| 装配方式 | 复制官方副本到 `%LOCALAPPDATA%\Programs\ROBOProCoding-zh`，只在副本内改显示语言 |
| 原版影响 | **零改动**：Microsoft Store 原版照常可用；回滚 = 删两个目录 |

---

## 三、为什么能改（原理 30 秒）

`resources/app.asar` 是 Electron + Angular 应用，界面语言**不是编译期固化**的：

```
ngx-translate 自定义 XLF loader → messages.<lang>.xlf → client/www/assets/<组件>/i18n/
```

官方只提供 8 种语言（de / en / es / fr / nl / pt / ru / ua），没有 `zh`。所以本地化只需三步：

1. 放一份 `messages.zh.xlf`（三处 i18n 目录各一份）；
2. 让语言枚举认识 `zh`；
3. 让设置页语言下拉多出第 9 项「中文」（Angular **AOT 编译产物**里插 2 个节点并重排索引）。

第 3 步是全工程唯一的硬骨头：AOT 模板是预编译的指令调用序列、节点索引硬编码，插入必须同步改 `decls/vars`、重排 create 块（≥33 整体 +2）、重排 update 块的 `Xe(N,…)` 引用、并接入绑定链。手改必错，本项目用**带断言**的脚本完成，断言不通过就中止而不是产出坏包——完整推导见 [docs/1-方法论.md §5.3](docs/1-方法论.md)。

---

## 四、目录结构

```
robo-pro-coding-zh/
├─ VERSION                    ← 6.5.4（= 软件版本号）
├─ 一键汉化.cmd               ← 双击即装
├─ CHANGELOG.md · NOTICE.md · LICENSE
├─ docs/
│  ├─ 1-方法论.md             六步流水线 + AOT 节点插入推导（可迁移到别的 Electron+Angular 应用）
│  ├─ 2-术语表.md             术语一致性表 + 官方原文瑕疵记录
│  ├─ 3-校验与验收.md         三层校验判据 + 已知坑
│  └─ 4-版本升级SOP.md        软件升级后重建：10 项锚点表
├─ i18n/
│  ├─ en/                     从官方 messages.en.xlf 抽出的 id+source（复核译文所需的最小引用）
│  ├─ zh/                     1017 条译文（*.zh.json）
│  └─ manifest.json           条目数 / sha256 / 对应版本
├─ tools/                     9 个纯 Node 脚本，零依赖
│  asar.js · dump-units.js · split.js · build-xlf.js · patch-main.js ·
│  pack-asar.js · verify.js · copy-app.js · validate-i18n.js
├─ scripts/
│  ├─ install-zh.ps1          安装（内含三层校验，未通过不覆盖）
│  └─ uninstall-zh.ps1        回滚
└─ launcher/启动-汉化版 ROBO Pro Coding.bat
```

---

## 五、安装 / 回滚

```powershell
# 安装（已下载仓库）
powershell -ExecutionPolicy Bypass -File .\scripts\install-zh.ps1 -Force

# 回滚
powershell -ExecutionPolicy Bypass -File .\scripts\uninstall-zh.ps1
```

安装位置与数据位置分离，方便整体删除：

- 程序：`%LOCALAPPDATA%\Programs\ROBOProCoding-zh`
- 用户数据：`%LOCALAPPDATA%\ROBOProCoding-zh-data`

---

## 六、已知边界（不是遗漏，是物理上不在这里）

| 位置 | 原因 |
|---|---|
| TXT 4.0 控制器本机触摸屏 UI | 属固件资源（设备端 Linux + Web 根目录），不在桌面 asar 内 |
| 在线内容 | GitLab 示例项目描述、官方文档站等网络内容仍是原文 |
| 运行时拼接串 | 代码生成器输出、Python 报错、固件回传信息来自控制器/编译器本身 |
| 应用名 / 图标 / 安装包 | 本项目不改名、不换标、不做重签名分发 |

---

## 七、使用条件（四句话）

本项目就是一个**界面语言包**：不含原程序、不做破解、不碰授权，只装在你自己的副本上。

1. **先有官方版本。** 需要你自己已从 Microsoft Store 安装并启动过；仓库里没有 `app.asar` / `main.*.js` / 字体 / exe / 安装包。
2. **只改显示语言。** 不改授权、激活、"关于"页署名、更新通道、签名；不写系统目录。
3. **非官方。** 与 fischertechnik / beemo GmbH 无关联，别当官方中文版宣传。
4. **风险自担、异议即删。** 按"现状"提供、无担保；界面文本与商标归权利人，收到有效异议就删对应内容（含历史）。

---

## 八、可复核的背景事实

- 官方语言包共 8 种（de / en / es / fr / nl / pt / ru / ua），安装包内无 `zh` 资源。
- 2026-11 检索公开仓库（关键词：`fischertechnik TXT`、`ROBO Pro Coding`、`fischertechnik chinese`、`TXT 4.0 fischertechnik`）命中的项目均为固件、Python 控制库、I2C 驱动、SofTXT 模拟器一类（如 `fischertechnik/TXT40-Controller-I2C`、`ftrobopy/ftrobopy`、`harbaum/SofTXT`），未见该软件的中文本地化实现。
- 本仓库的流水线与验收数字可由任何人按 [docs/3-校验与验收.md](docs/3-校验与验收.md) 在本机复现。

## 九、文档索引

| 想知道 | 看 |
|---|---|
| 让 AI 一步装好 | 本文第一节 |
| 方法能不能复用到别的应用 | [docs/1-方法论.md](docs/1-方法论.md) |
| 译文为什么这么译 | [docs/2-术语表.md](docs/2-术语表.md) |
| 怎么证明"真的好了" | [docs/3-校验与验收.md](docs/3-校验与验收.md) |
| 官方升版后怎么重建 | [docs/4-版本升级SOP.md](docs/4-版本升级SOP.md) |
