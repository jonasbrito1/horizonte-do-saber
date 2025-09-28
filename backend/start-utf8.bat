@echo off
chcp 65001 > nul
set LANG=pt_BR.UTF-8
set LC_ALL=pt_BR.UTF-8
set NODE_OPTIONS=--max-old-space-size=4096
cd /d "%~dp0"
npm run dev