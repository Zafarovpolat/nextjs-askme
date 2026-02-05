@echo off
echo Исправление ошибки в main.css...
cd /d C:\Users\x\Desktop\otvetai\nextjs-askme\src\styles

powershell -Command "(Get-Content main.css -Raw) -replace '\.nav_mob_wrapper_nav div button svg \{[^}]*\}', '.nav_mob_wrapper_nav div button svg { fill: rgb(98, 106, 255) !important; }' | Set-Content main.css"

echo Готово!
pause
