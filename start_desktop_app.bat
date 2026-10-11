@echo off
chcp 65001 >nul
title كىتابخۇمار - KitabXumar App Mode
cd /d "%~dp0"

echo ========================================================
echo        كىتابخۇمار - ئەقلىي ئىقتىدارلىق PDF ئوقۇغۇچ
echo ========================================================
echo.
echo سىستېما تېز قوزغىلىۋاتىدۇ...
echo.

start /b "" node server.js >nul 2>&1
timeout /t 1 /nobreak >nul

if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app="http://127.0.0.1:3210" --window-size=1280,850
) else if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="http://127.0.0.1:3210" --window-size=1280,850
) else (
    start "" "http://127.0.0.1:3210"
)

exit
