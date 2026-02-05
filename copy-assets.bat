@echo off
echo ================================================
echo   AskMe - Копирование файлов из WordPress
echo ================================================
echo.

set WP_PATH=C:\Users\x\Desktop\otvetai\_live.mis507nz.test3.quadvector.ru.1files.3056032.tar\_live.mis507nz.test3.quadvector.ru.1files.3056032\test3.quadvector.ru\public_html\wp-content\themes\askme
set NEXT_PATH=C:\Users\x\Desktop\otvetai\nextjs-askme

echo [1/3] Копирование CSS файлов...
xcopy "%WP_PATH%\assets\css\*.*" "%NEXT_PATH%\src\styles\" /Y /I
echo ✓ CSS файлы скопированы

echo.
echo [2/3] Копирование шрифтов...
xcopy "%WP_PATH%\assets\fonts\*.*" "%NEXT_PATH%\public\fonts\" /Y /I /S
echo ✓ Шрифты скопированы

echo.
echo [3/3] Копирование изображений...
xcopy "%WP_PATH%\assets\img\*.*" "%NEXT_PATH%\public\images\" /Y /I /S
echo ✓ Изображения скопированы

echo.
echo ================================================
echo   Все файлы успешно скопированы!
echo ================================================
echo.
echo Следующие шаги:
echo 1. Откройте src\app\globals.css
echo 2. Раскомментируйте импорты CSS файлов
echo 3. Запустите: npm install
echo 4. Запустите: npm run dev
echo.
pause
