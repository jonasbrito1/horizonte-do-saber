# Guia de Deploy para Hostinger - Sistema Horizonte do Saber

## Pré-requisitos

1. **Conta na Hostinger** com acesso a:
   - Painel de controle (hPanel)
   - Banco de dados MySQL
   - Gerenciador de arquivos ou FTP
   - Node.js habilitado

2. **Informações do Banco de Dados fornecidas:**
   - Banco: `u674882802_horizonte`
   - Usuário: `u674882802_horizonteds`
   - Senha: [VOCÊ PRECISA DEFINIR NO PAINEL DA HOSTINGER]

## Etapa 1: Configurar o Banco de Dados

### 1.1 No painel da Hostinger:
1. Acesse **Bancos de Dados > Gerenciar**
2. Clique no banco `u674882802_horizonte`
3. Defina uma senha para o usuário `u674882802_horizonteds`
4. Anote a senha para usar na configuração

### 1.2 Executar as migrações do banco:
1. No painel, abra o **phpMyAdmin**
2. Selecione o banco `u674882802_horizonte`
3. Execute o arquivo `init.sql` (localizado na raiz do projeto)

## Etapa 2: Preparar os Arquivos para Upload

### 2.1 Frontend (Já construído):
- Pasta: `frontend/dist/` (arquivos prontos para produção)

### 2.2 Backend:
- Pasta: `backend/` (código fonte completo)

### 2.3 Arquivos de Configuração:

#### Criar `.env` para produção no backend:
```env
# Configuração do Banco de Dados - PRODUÇÃO HOSTINGER
DATABASE_URL="mysql://u674882802_horizonteds:SUA_SENHA_AQUI@localhost:3306/u674882802_horizonte"

# Configurações da API
PORT=3000
NODE_ENV=production

# JWT Secret - ALTERE PARA UM SECRET MAIS SEGURO
JWT_SECRET=horizonte_saber_jwt_production_2024_[GERAR_STRING_ALEATORIA]
JWT_EXPIRES_IN=7d

# Upload Settings
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads

# CORS Settings - ALTERE PARA SEU DOMÍNIO
CORS_ORIGIN=https://seudominio.com

# Log Level
LOG_LEVEL=error
```

## Etapa 3: Upload dos Arquivos

### 3.1 Estrutura de pastas na Hostinger:
```
public_html/
├── index.html (do frontend/dist)
├── assets/ (do frontend/dist)
├── api/ (todo o conteúdo do backend)
└── uploads/ (pasta para arquivos enviados)
```

### 3.2 Upload via Gerenciador de Arquivos:
1. **Frontend:**
   - Copie todo o conteúdo de `frontend/dist/` para `public_html/`

2. **Backend:**
   - Crie a pasta `public_html/api/`
   - Copie todo o conteúdo de `backend/` para `public_html/api/`

3. **Configurações:**
   - Coloque o arquivo `.env` em `public_html/api/.env`
   - Crie a pasta `public_html/uploads/` com permissões 755

## Etapa 4: Configurar Node.js na Hostinger

### 4.1 No painel da Hostinger:
1. Acesse **Avançado > Node.js**
2. Clique em **Criar Aplicativo Node.js**
3. Configure:
   - **Versão Node.js:** 18.x ou superior
   - **Pasta da Aplicação:** `api`
   - **Arquivo de Inicialização:** `dist/server.js`
   - **Porta:** 3000

### 4.2 Instalar dependências:
No terminal Node.js da Hostinger, execute:
```bash
cd public_html/api
npm install --production
npm run generate
```

## Etapa 5: Configurar o Banco de Dados

### 5.1 Executar migrações:
No terminal Node.js:
```bash
npx prisma db push
```

### 5.2 Criar usuário administrador:
```bash
npm run seed:admin
```

## Etapa 6: Configurar Redirecionamentos

### 6.1 Criar arquivo `.htaccess` em `public_html/`:
```apache
# Redirecionar API para Node.js
RewriteEngine On

# Redirecionar /api para aplicação Node.js
RewriteRule ^api/(.*)$ http://localhost:3000/$1 [P,L]

# SPA - Redirecionar tudo para index.html (exceto arquivos existentes)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]
```

## Etapa 7: Testar a Aplicação

### 7.1 Verificar se está funcionando:
1. Acesse `https://seudominio.com` (frontend)
2. Acesse `https://seudominio.com/api/health` (backend)
3. Teste o login com as credenciais padrão

### 7.2 Credenciais padrão do admin:
- **Email:** admin@horizontedosaber.edu.br
- **Senha:** admin123

## Etapa 8: Configurações Adicionais

### 8.1 SSL (HTTPS):
- A Hostinger geralmente fornece SSL gratuito
- Ative no painel de controle

### 8.2 Domínio personalizado:
- Configure seu domínio no painel da Hostinger
- Atualize a variável `CORS_ORIGIN` no `.env`

### 8.3 Backups automáticos:
- Configure backups automáticos no painel da Hostinger
- Faça backup regular do banco de dados

## Solução de Problemas

### Erro de conexão com banco:
1. Verifique as credenciais no `.env`
2. Confirme que o banco existe no painel
3. Teste a conexão via phpMyAdmin

### Aplicação Node.js não inicia:
1. Verifique os logs no painel Node.js
2. Confirme que as dependências foram instaladas
3. Verifique se o arquivo `dist/server.js` existe

### Frontend não carrega:
1. Verifique se os arquivos estão em `public_html/`
2. Confirme o arquivo `.htaccess`
3. Verifique se o SSL está ativo

## Arquivos Importantes

### Frontend (dist/):
- ✅ index.html
- ✅ assets/
- ✅ Todos os arquivos estáticos

### Backend (api/):
- 📝 package.json
- 📝 .env (configure com suas credenciais)
- 📝 prisma/schema.prisma
- 📝 src/ (código fonte)
- ⚠️  dist/ (será criado após build - opcional para deploy direto)

## Próximos Passos

1. **Definir a senha do banco de dados no painel da Hostinger**
2. **Fazer upload dos arquivos seguindo a estrutura**
3. **Configurar a aplicação Node.js**
4. **Testar e ajustar conforme necessário**

---

**Importante:** Sempre faça backup antes de qualquer alteração em produção!

**Suporte:** Em caso de dúvidas, consulte a documentação da Hostinger ou entre em contato com o suporte técnico.