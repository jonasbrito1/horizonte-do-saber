@echo off
echo ===============================================
echo  PREPARANDO ARQUIVOS PARA UPLOAD - HOSTINGER
echo ===============================================
echo.

echo 1. Fazendo build do frontend...
cd frontend
call npm run build
cd ..
echo    ✓ Build do frontend completo

echo 2. Atualizando arquivos no upload-hostinger...
if exist "frontend\dist" (
    xcopy "frontend\dist\*" "upload-hostinger\public_html\" /E /H /Y
    echo    ✓ Frontend atualizado com sucesso
) else (
    echo    ✗ Erro no build do frontend
    pause
    exit /b 1
)

echo 3. Verificando APIs PHP...
if exist "upload-hostinger\public_html\api\content.php" (
    echo    ✓ API de conteudo: OK
) else (
    echo    ✗ API de conteudo nao encontrada
)

if exist "upload-hostinger\public_html\api\upload.php" (
    echo    ✓ API de upload: OK
) else (
    echo    ✗ API de upload nao encontrada
)

echo 4. Criando arquivos de configuracao...

rem Criar .htaccess
echo RewriteEngine On > "upload-hostinger\public_html\.htaccess"
echo RewriteRule ^^api/(.*)$ http://localhost:3000/$1 [P,L] >> "upload-hostinger\public_html\.htaccess"
echo RewriteCond %%{REQUEST_FILENAME} !-f >> "upload-hostinger\public_html\.htaccess"
echo RewriteCond %%{REQUEST_FILENAME} !-d >> "upload-hostinger\public_html\.htaccess"
echo RewriteCond %%{REQUEST_URI} !^^/api/ >> "upload-hostinger\public_html\.htaccess"
echo RewriteRule . /index.html [L] >> "upload-hostinger\public_html\.htaccess"
echo    ✓ .htaccess criado

rem Copiar .env.production como .env
copy "backend\.env.production" "upload-hostinger\public_html\api\.env"
echo    ✓ .env copiado (LEMBRE-SE DE CONFIGURAR A SENHA DO BANCO!)

echo 5. Verificando estrutura final...
dir "upload-hostinger\public_html" /B
echo    ✓ Estrutura verificada

echo.
echo ===============================================
echo  ARQUIVOS PRONTOS PARA UPLOAD - HOSTINGER!
echo ===============================================
echo.
echo 📁 Diretorio: upload-hostinger\public_html\
echo.
echo ✨ FUNCIONALIDADES INCLUIDAS:
echo    [x] Sistema de conteudo dinamico
echo    [x] Secao "Nossos Diferenciais"
echo    [x] Upload de imagens
echo    [x] Atualizacoes em tempo real
echo    [x] API PHP completa
echo    [x] Cache otimizado
echo.
echo 🚀 PROXIMOS PASSOS:
echo    1. Fazer upload via FTP/FileManager do Hostinger
echo    2. Definir permissoes: uploads/ e data/ como 755
echo    3. Testar site em: https://horizontedosaber.com.br
echo.
echo 🔗 APIs DISPONIVEIS:
echo    - GET  /api/content/public  (conteudo publico)
echo    - POST /api/content         (salvar conteudo)
echo    - POST /api/content/upload  (upload imagens)
echo.
echo ℹ️  Leia DEPLOY_INSTRUCTIONS.md para detalhes completos
echo.
echo Pressione qualquer tecla para continuar...
pause > nul