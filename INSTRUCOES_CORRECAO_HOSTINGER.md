# 🚨 INSTRUÇÕES PARA CORRIGIR SITE EM BRANCO - HOSTINGER

## PROBLEMA IDENTIFICADO
O site está carregando em branco no Hostinger devido a problemas de configuração do .htaccess e possível falta de arquivos.

## SOLUÇÕES (Testar nesta ordem):

### 1. DIAGNÓSTICO INICIAL
Primeiro, acesse: `https://horizontedosaber.com.br/debug.php`
- Se não funcionar, **faça upload do arquivo `debug.php`** da pasta `upload-hostinger/public_html/`
- Este arquivo irá mostrar exatamente o que está faltando

### 2. TESTAR .HTACCESS SIMPLES
Substitua o arquivo `.htaccess` atual pelo arquivo `.htaccess_simple`:

```apache
DirectoryIndex index.html

# API Routes
RewriteEngine On
RewriteRule ^api/content/public/?$ api/content.php [L]
RewriteRule ^api/content/upload/?$ api/upload.php [L]
RewriteRule ^api/content/?$ api/content.php [L]

# React SPA - redirect to index.html for all non-existing files
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . index.html [L]
```

### 3. TESTAR ACESSO DIRETO
Teste acessar diretamente: `https://horizontedosaber.com.br/index.html`
- Se funcionar, o problema é na configuração do .htaccess
- Se não funcionar, faltam arquivos

### 4. VERIFICAR ARQUIVOS NECESSÁRIOS
Certifique-se que estes arquivos estão no servidor:
- ✅ `index.html` (arquivo principal do React)
- ✅ `assets/` (pasta com CSS e JS compilados)
- ✅ `api/content.php` (API funcionando)
- ✅ `api/upload.php` (API de upload)
- ✅ `uploads/` (pasta de uploads)
- ✅ `data/` (pasta de dados)

### 5. SOLUÇÃO ALTERNATIVA (Se ainda não funcionar)
Use o `.htaccess_fixed` que tem configurações mais robustas.

## ARQUIVOS PARA UPLOAD
Certifique-se de que estes arquivos estão no servidor:
1. `debug.php` - Para diagnóstico
2. `index.html` - Página principal
3. `assets/` - Todos os arquivos CSS/JS
4. `api/content.php` - API principal
5. `.htaccess_simple` - Configuração simplificada

## TESTE FINAL
Depois de corrigir, teste:
1. Site principal: https://horizontedosaber.com.br
2. API: https://horizontedosaber.com.br/api/content/public
3. Administração: https://horizontedosaber.com.br/admin

---
**Nota**: A API já está funcionando corretamente. O problema é na configuração do frontend.