# 4 · 版本升级 SOP（官方更新后 15 分钟内重建）

## 4.0 原则

**升级 = 重跑流水线，不是手改产物。** 数据（译文）和代码（脚本）分开放，升级只影响"骨架"：

```
骨架（随版本变）        ：en.xlf、main.*.js 里的锚点与节点索引、asar
数据（跨版本稳定）      ：i18n/zh/*.zh.json（1017 条）
```

`build-xlf.js` 缺译自动回退英文 ⇒ 新版本新条目先显示英文，跑通不阻塞；补译只是增量。

---

## 4.1 步骤

```powershell
# 0) 记下新版本号
(Get-AppxPackage beemo.ROBOProCoding).Version          # 例如 6.6.0.0

# 1) 抓新骨架（只读系统目录，写副本）
node tools/copy-app.js "$((Get-AppxPackage beemo.ROBOProCoding).InstallLocation)" "$env:LOCALAPPDATA\Programs\ROBOProCoding-zh"
node tools/asar.js "$env:LOCALAPPDATA\Programs\ROBOProCoding-zh\app\resources\app.asar" .work\build extract

# 2) 抽新条目，和旧译文对差
node tools/dump-units.js .work\build\client\www\assets\npx-robo-pro-coding\i18n\messages.en.xlf .work\en\rpc.all.json
node tools/validate-i18n.js i18n        # 旧译文自检仍须 PROBLEMS 0

# 3) 生成三份 zh.xlf（缺译回退英文，missing 就是待补条数）
node tools/build-xlf.js .work\build\client\www\assets\npx-robo-pro-coding\i18n\messages.en.xlf `
     .work\build\client\www\assets\npx-robo-pro-coding\i18n\messages.zh.xlf i18n\zh\rpc-0*.zh.json
# npx-controller、ngx-codemirror 同理（分别用 ctrl-01、cm-01）

# 4) 对 main.*.js 做语言改动（带断言）
copy .work\build\client\www\main.*.js .work\build\client\www\main.orig.js
node tools\patch-main.js .work\build\client\www\main.*.js

# 5) 重打包 + 回读校验
node tools/pack-asar.js .work\build .work\app.asar
node tools/verify.js .work\app.asar .work\build

# 6) 覆盖副本并启动验收（docs/3 第 3 层）
```

---

## 4.2 锚点表（新版本必须先核对这些）

`tools/patch-main.js` 里全部是"找不到就 FAIL"，不会默默打错。升级后如果 FAIL，按下表重定位：

| # | 锚点/变量 | 现值（6.5.4） | 变了怎么办 |
|---|---|---|---|
| 1 | 语言枚举 | `,u.UA="ua",u}(nd||{})` | 搜最后一种语言码 + `}(<缩写>||{})`；官方加语言时这里必然变 |
| 2 | 组件区间起点 | `selectors:[["app-settings"]],features:[Ln],decls:62,vars:41,consts:[` | 搜 `selectors:[["app-settings"]]`，只取后面紧跟的 `decls/vars/consts` |
| 3 | 组件区间终点 | `dependencies:[Gr,po,nu,aG,Fa,RO,Nl,p5,Gg,G1,U7,O5,Yy,lue,Ao]` | 搜该 block 的 `dependencies:[`，取**本 block 的**第一个 |
| 4 | decls / vars | `62 / 41` | 读实际值；插入 1 个 mat-option（含文本节点）⇒ `decls += 2`；新增 1 个绑定 ⇒ `vars += 1` |
| 5 | 重排阈值 | `33` | = 官方语言下拉最后一项的索引 + 1 |
| 6 | create 重排命中数 | `> 20` | 记录实际值并改成等值断言（本例 `>` 保守） |
| 7 | 链式调用命中数 | `4` | 必须改成本次实际值，否则断言失去意义 |
| 8 | update 重排命中数 | `7` | 同上 |
| 9 | UA option 正则 | `v(31,"mat-option",12),Ce(32,[^)]*),L()` | 索引随 #5 变化；文字可能被改成转义形式 |
| 10 | 绑定链 | `Wn("value",h.LANGUAGE.UA),` | 语言枚举改名时同步 |

**判定规则**：只有 #1~#4、#9、#10 命中，且 #6~#8 的数量与脚本一致，才能继续。任何一项数量变化 = 模板结构变了，必须重新读这一段 AOT 产物再决定插几个节点（有时官方会把语言做成数据驱动，那就根本不需要改模板，直接删掉 5.3 那步）。

---

## 4.3 三种常见升级结果

| 情况 | 症状 | 处理 |
|---|---|---|
| 只加文案 | `patch-main` 全 OK，`build-xlf` 的 `missing>0` | 直接发布，`missing` 条数写进 CHANGELOG，下一修订补译 |
| 页面结构微调 | #6~#8 数量变了 | 重读 AOT 片段，改断言与插入点，跑第 3 层验收 |
| 语言机制重写 | #1 或 #2 找不到；或 `messages.*.xlf` 消失 | 停下来重新做第 1 步侦察，别硬改 |

---

## 4.4 发布

```bash
# 版本号跟随软件版本号
echo 6.6.0 > VERSION
git commit -am "sync: ROBO Pro Coding 6.6.0"
git tag v6.6.0
git push origin main --tags
```

`CHANGELOG.md` 里写清：软件版本、译文条目数、`missing` 条数、锚点是否变化。
