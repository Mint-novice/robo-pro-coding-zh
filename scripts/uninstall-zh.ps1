# 回滚：删除汉化副本与用户数据目录。Microsoft Store 原版从未被修改，不受影响。
# 用法: powershell -ExecutionPolicy Bypass -File scripts\uninstall-zh.ps1 [-Yes]
param([switch]$Yes)

$ErrorActionPreference = 'Stop'
$dest = Join-Path $env:LOCALAPPDATA 'Programs\ROBOProCoding-zh'
$udd  = Join-Path $env:LOCALAPPDATA 'ROBOProCoding-zh-data'

Write-Host '将删除：'
Write-Host "  $dest"
Write-Host "  $udd"
if (-not $Yes) {
  $ans = Read-Host '确认删除？(y/N)'
  if ($ans -notmatch '^(y|Y|yes|YES)$') { Write-Host '已取消'; exit 0 }
}

foreach ($p in @($dest, $udd)) {
  if (Test-Path $p) {
    Remove-Item $p -Recurse -Force
    Write-Host "已删除 $p"
  } else {
    Write-Host "不存在，跳过 $p"
  }
}
Write-Host '完成。原版 ROBO Pro Coding 仍可从开始菜单正常启动。'
