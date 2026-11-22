@echo off
chcp 65001 >nul
setlocal
rem ============================================================
rem   ROBO Pro Coding 6.5.4 简体中文汉化版 启动器
rem   汉化文件位置：%LOCALAPPDATA%\Programs\ROBOProCoding-zh
rem   原来的 Microsoft Store 版本不受影响，仍可照常使用
rem ============================================================

set "APPDIR=%LOCALAPPDATA%\Programs\ROBOProCoding-zh\app"
set "EXE=%APPDIR%\ROBO Pro Coding.exe"
set "UDD=%LOCALAPPDATA%\ROBOProCoding-zh-data"

rem 某些工具环境（如 DeepSeek Harness / 某些 Node 安装）会设置这个变量，
rem 它会让 Electron 退化成 Node 进程，导致程序一闪就退出，这里必须清掉。
set "ELECTRON_RUN_AS_NODE="

if not exist "%EXE%" (
  echo [错误] 找不到汉化版程序：
  echo        %EXE%
  echo        请先运行安装流程，或查看 说明-汉化版.md
  pause
  exit /b 1
)

start "" "%EXE%" --user-data-dir="%UDD%"
exit /b 0
