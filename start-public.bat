@echo off
echo Starting FullMark Academy Project...

:: تشغيل سيرفر بايثون في نافذة منفصلة
start "FullMark Server" cmd /k "python -m http.server 8000"

:: تشغيل ngrok في النافذة الحالية
echo.
echo Starting ngrok tunnel...
ngrok http 8000

pause