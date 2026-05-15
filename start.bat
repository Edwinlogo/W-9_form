@echo off
title W-9 Form Server
echo ============================================
echo    W-9 Form - Servidor Local
echo    http://localhost:6875
echo ============================================
echo.
echo Abriendo navegador...
start http://localhost:6875
echo Servidor activo. Cierra esta ventana para detenerlo.
echo.
python -m http.server 6875
