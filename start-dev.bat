@echo off
echo ======================================
echo    HORIZONTE DO SABER - DEV MODE
echo ======================================
echo.
echo Iniciando sistema de desenvolvimento...
echo.

REM Parar processos existentes
echo [1/4] Parando processos Node.js existentes...
taskkill /F /IM node.exe 2>nul
timeout /t 3 /nobreak >nul

echo [2/4] Iniciando Backend (Porta 3001)...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 4 /nobreak >nul

echo [3/4] Iniciando Frontend (Porta 5173)...
start "Frontend Server" cmd /k "cd frontend && npm run dev"
timeout /t 6 /nobreak >nul

echo [4/4] Abrindo navegador...
start http://localhost:5180

echo.
echo ======================================
echo    SISTEMA INICIADO COM SUCESSO!
echo ======================================
echo.
echo Frontend: http://localhost:5180
echo Backend:  http://localhost:3002
echo.
echo Admin: http://localhost:5180/admin/users
echo Login: http://localhost:5180/login
echo.
echo Pressione qualquer tecla para continuar...
pause >nul