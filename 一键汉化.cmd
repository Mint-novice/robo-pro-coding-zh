@echo off
chcp 65001 >nul
setlocal
rem ============================================================
rem  一键安装：ROBO Pro Coding 中文界面
rem  需要：Windows 10/11 + 已安装 Microsoft Store 版 ROBO Pro Coding + Node.js 18+
rem  不改系统目录、不改授权状态；只在你自己的用户目录生成一份独立副本
rem ============================================================
echo.
echo   即将为本机安装 ROBO Pro Coding 中文界面（独立副本，不影响原版）
echo.
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0scripts\install-zh.ps1" -Force
echo.
pause
