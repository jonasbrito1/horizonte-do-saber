@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     SISTEMA ESCOLAR HORIZONTE DO SABER - INICIANDO...     ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Matar processos node antigos
echo [PASSO 1/5] Finalizando processos Node.js anteriores...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo              ✓ Processos anteriores finalizados
) else (
    echo              ○ Nenhum processo anterior encontrado
)
timeout /t 2 /nobreak >nul

REM Aguardar liberação das portas
echo.
echo [PASSO 2/5] Aguardando liberação das portas...
timeout /t 3 /nobreak >nul
echo              ✓ Portas liberadas

REM Iniciar Backend
echo.
echo [PASSO 3/5] Iniciando Backend (porta 4600)...
cd /d "%~dp0backend"
start "★ Backend - Porta 4600 ★" cmd /k "npm run dev"
timeout /t 6 /nobreak >nul
echo              ✓ Backend iniciado

REM Iniciar Frontend
echo.
echo [PASSO 4/5] Iniciando Frontend (porta 5176)...
cd /d "%~dp0frontend"
start "★ Frontend - Porta 5176 ★" cmd /k "npm run dev"
timeout /t 6 /nobreak >nul
echo              ✓ Frontend iniciado

REM Abrir navegador
echo.
echo [PASSO 5/5] Abrindo navegador...
timeout /t 3 /nobreak >nul
start http://localhost:5176
echo              ✓ Navegador aberto

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                  SISTEMA INICIADO COM SUCESSO!             ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║                                                            ║
echo ║  Backend:  http://localhost:4600                          ║
echo ║  Frontend: http://localhost:5176                          ║
echo ║                                                            ║
echo ║  Credenciais de teste:                                    ║
echo ║  Email: admin@horizontedosaber.com                        ║
echo ║  Senha: admin123                                          ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo IMPORTANTE: Não feche as janelas do Backend e Frontend!
echo             Elas devem permanecer abertas para o sistema funcionar.
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul
