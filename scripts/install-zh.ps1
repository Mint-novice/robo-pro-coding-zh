﻿﻿# 一键部署 ROBO Pro Coding 简体中文汉化版（不修改 Microsoft Store 原版）
# 用法: powershell -ExecutionPolicy Bypass -File scripts\install-zh.ps1 [-Force]
param([switch]$Force)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$tools = Join-Path $root 'tools'
$work = Join-Path $root '.work'
$dest = Join-Path $env:LOCALAPPDATA 'Programs\ROBOProCoding-zh'
$udd  = Join-Path $env:LOCALAPPDATA 'ROBOProCoding-zh-data'
$pkgName = 'beemo.ROBOProCoding'

function Step($m) { Write-Host "==> $m" -ForegroundColor Cyan }
function Die($m) { Write-Host "[失败] $m" -ForegroundColor Red; exit 1 }

# 0) 定位官方安装
Step '定位 Microsoft Store 安装目录'
$pkg = Get-AppxPackage $pkgName
if (-not $pkg) { Die "未找到 store 包 $pkgName，请先从商店安装 ROBO Pro Coding" }
$src = $pkg.InstallLocation
$ver = $pkg.Version
Write-Host "    版本 $ver  ->  $src"
$repoVer = (Get-Content (Join-Path $root 'VERSION') -Raw).Trim()
$shortVer = (@("$ver".Split('.'))[0..2]) -join '.'
if ($repoVer -ne $shortVer) {
  Write-Host "    [注意] 仓库 VERSION=$repoVer，本机软件=$ver；译文将用旧版本兜底，缺译回退英文" -ForegroundColor Yellow
}

# 1) 复制到可写位置（EFS / ACL 保护，不能就地改）
Step "复制到 $dest"
if ((Test-Path $dest) -and -not $Force) {
  Write-Host '    已存在，跳过复制（-Force 可强制重刷）'
} else {
  if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
  node (Join-Path $tools 'copy-app.js') $src $dest
  if ($LASTEXITCODE -ne 0) { Die 'copy-app 失败' }
}

# 2) 解包 asar 到工作区
Step '解包 app.asar'
$srcAsar = Join-Path $dest 'app\resources\app.asar'
if (-not (Test-Path $srcAsar)) { Die "找不到 $srcAsar" }
if (Test-Path $work) { Remove-Item $work -Recurse -Force }
node (Join-Path $tools 'asar.js') $srcAsar $work 'extract'
if ($LASTEXITCODE -ne 0) { Die 'asar 解包失败' }
$www = Join-Path $work 'client\www'

# 3) 生成三份 messages.zh.xlf
Step '生成 messages.zh.xlf（缺译自动回退英文）'
$groups = @(
  @{ dir = 'npx-robo-pro-coding'; maps = (Get-ChildItem (Join-Path $root 'i18n\zh\rpc-*.zh.json') | ForEach-Object FullName) },
  @{ dir = 'npx-controller';     maps = @(Join-Path $root 'i18n\zh\ctrl-01.zh.json') },
  @{ dir = 'ngx-codemirror';     maps = @(Join-Path $root 'i18n\zh\cm-01.zh.json') }
)
foreach ($g in $groups) {
  $i18nDir = Join-Path $www "assets\$($g.dir)\i18n"
  $en = Join-Path $i18nDir 'messages.en.xlf'
  if (-not (Test-Path $en)) { Die "找不到 $en" }
  $zh = Join-Path $i18nDir 'messages.zh.xlf'
  node (Join-Path $tools 'build-xlf.js') $en $zh @($g.maps)
  if ($LASTEXITCODE -ne 0) { Die "build-xlf 失败: $($g.dir)" }
}

# 4) main.*.js 语言改动（zh 枚举 + 设置页语言下拉）
Step '对 main.*.js 做语言改动'
$main = Get-ChildItem $www -Filter 'main.*.js' | Where-Object { $_.Name -notlike '*.orig.js' } | Select-Object -First 1
if (-not $main) { Die '找不到 main.*.js' }
Copy-Item $main.FullName ($main.FullName -replace '\.js$', '.orig.js') -Force
node (Join-Path $tools 'patch-main.js') $main.FullName
if ($LASTEXITCODE -ne 0) { Die 'patch-main 断言失败：模板结构变了，见 docs/4-版本升级SOP.md §4.2' }

# 5) 重打包 + 回读校验
Step '重打包 app.asar 并逐文件校验'
$newAsar = Join-Path $work 'app.asar'
node (Join-Path $tools 'pack-asar.js') $work $newAsar
if ($LASTEXITCODE -ne 0) { Die 'pack-asar 失败' }
$out = node (Join-Path $tools 'verify.js') $newAsar $work
$out
if ($LASTEXITCODE -ne 0 -or ($out -match 'mismatched=[1-9]') -or ($out -match 'missingSrc=[1-9]')) {
  Die '校验未通过，未覆盖安装目录'
}

# 6) 覆盖副本里的 asar（原件留 .orig）
Step '写入汉化版 asar'
if (-not (Test-Path "$srcAsar.orig")) { Copy-Item $srcAsar "$srcAsar.orig" }
Copy-Item $newAsar $srcAsar -Force

# 7) 启动器
Step '生成启动器'
$bat = @"
@echo off
chcp 65001 >nul
setlocal
set "APPDIR=%LOCALAPPDATA%\Programs\ROBOProCoding-zh\app"
set "EXE=%APPDIR%\ROBO Pro Coding.exe"
set "UDD=%LOCALAPPDATA%\ROBOProCoding-zh-data"
rem 某些工具环境会设置 ELECTRON_RUN_AS_NODE=1，会让 Electron 退化成 Node 进程，表现为一闪即退
set "ELECTRON_RUN_AS_NODE="
start "" "%EXE%" --user-data-dir="%UDD%"
"@
$batPath = Join-Path $dest '启动-汉化版 ROBO Pro Coding.bat'
Set-Content -Path $batPath -Value $bat -Encoding UTF8

Write-Host ''
Write-Host '完成。启动：' -ForegroundColor Green
Write-Host "  $batPath"
Write-Host '回滚：'
Write-Host "  powershell -ExecutionPolicy Bypass -File scripts\uninstall-zh.ps1"
