@echo off
echo Encerrando todos os processos Node.js...
taskkill /F /IM node.exe >nul 2>&1

echo Aguardando 3 segundos...
timeout /t 3 /nobreak >nul

echo Iniciando backend na porta 3008...
start cmd /k "cd backend && set PORT=3008 && set CORS_ORIGIN=http://localhost:5181 && npm run dev"

echo Aguardando 5 segundos para o backend inicializar...
timeout /t 5 /nobreak >nul

echo Iniciando frontend na porta 5181...
start cmd /k "cd frontend && set PORT=5181 && npm run dev"

echo Sistema iniciado!
echo Backend: http://localhost:3008
echo Frontend: http://localhost:5181
pause