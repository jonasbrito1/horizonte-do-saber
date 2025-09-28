# 🚀 ARQUIVOS PRONTOS PARA UPLOAD - HOSTINGER
## Sistema de Gestão de Usuários Implementado ✅

**🆕 NOVIDADES NESTA VERSÃO:**
- ✅ Sistema completo de gestão de usuários
- ✅ Criação de usuários com diferentes permissões (admin, professor, responsável)
- ✅ Envio automático de credenciais por email
- ✅ Menu "Usuários" visível apenas para administradores
- ✅ Interface moderna para gerenciar usuários
- ✅ Senhas geradas automaticamente ou definidas manualmente
- ✅ Relacionamento entre responsáveis e alunos

## 📋 CHECKLIST ANTES DO UPLOAD

### 1. Configurar Senha do Banco de Dados
- Acesse o painel da Hostinger
- Vá em **Bancos de Dados > Gerenciar**
- Defina uma senha para o usuário `u674882802_horizonteds`
- **EDITE o arquivo `api/.env`** e substitua a senha na linha 2

### 2. Verificar Domínio
- **Arquivo `api/.env`** já está configurado para:
  - `horizontedosaber.com.br`
  - `app.horizontedosaber.com.br`
  - `www.horizontedosaber.com.br`

## 📁 ESTRUTURA DE UPLOAD

Esta pasta `public_html/` deve ser copiada integralmente para o `public_html/` da sua Hostinger:

```
public_html/
├── index.html ← Página principal do site
├── assets/ ← CSS e JS do frontend
├── images/ ← Imagens do site
├── .htaccess ← Configuração de redirecionamento
├── uploads/ ← Pasta para arquivos enviados (vazia)
└── api/ ← Backend Node.js
    ├── .env ← CONFIGURE A SENHA DO BANCO!
    ├── package.json
    ├── prisma/
    └── src/
```

## 🔧 PASSOS NO PAINEL DA HOSTINGER

### 1. Upload dos Arquivos
- Faça upload de **TODO o conteúdo** de `public_html/` para o `public_html/` da Hostinger

### 2. Configurar Node.js
- Acesse **Avançado > Node.js**
- Clique em **Criar Aplicativo Node.js**
- Configure:
  - **Versão:** 18.x ou superior
  - **Pasta:** `api`
  - **Arquivo inicial:** `src/server.ts` (ou `server.js` se compilado)
  - **Porta:** 3000

### 3. Instalar Dependências
No terminal Node.js da Hostinger:
```bash
cd public_html/api
npm install --production
npx prisma generate
```

### 4. Configurar Banco de Dados
```bash
# Executar migrações
npx prisma db push

# Criar usuário administrador padrão
npm run seed:admin
```

### 5. Configurar Email (OPCIONAL - Para envio de credenciais)
Se quiser ativar o envio automático de emails com credenciais de acesso:

**Edite o arquivo `api/.env` e adicione:**
```env
# Configurações de Email (Gmail como exemplo)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app
EMAIL_FROM_NAME=Horizonte do Saber
EMAIL_FROM_EMAIL=noreply@horizontedosaber.com.br
```

**📧 Como obter senha de app no Gmail:**
1. Acesse sua conta Google
2. Vá em Segurança > Verificação em duas etapas
3. Em "Senhas de app", gere uma nova senha
4. Use essa senha no campo `EMAIL_PASS`

## 🏃‍♂️ TESTE FINAL

1. **Site:** https://[seu-dominio]
2. **API:** https://[seu-dominio]/api/health
3. **Login:** admin@horizontedosaber.com / admin123
4. **Gestão de Usuários:** https://[seu-dominio]/dashboard/usuarios (somente admins)

## 👥 SISTEMA DE GESTÃO DE USUÁRIOS

### Como usar após o deploy:

1. **Fazer login como administrador**
   - Email: admin@horizontedosaber.com
   - Senha: admin123

2. **Acessar gestão de usuários**
   - No menu lateral, clique em "Usuários" (visível apenas para admins)
   - Visualize estatísticas de usuários, filtros e lista completa

3. **Criar novos usuários**
   - Clique em "Novo Usuário"
   - Escolha o tipo: Administrador, Professor ou Responsável
   - A senha pode ser gerada automaticamente ou definida manualmente
   - Se email estiver configurado, credenciais são enviadas automaticamente

4. **Gerenciar usuários existentes**
   - Visualizar detalhes
   - Editar informações
   - Ativar/Inativar usuários
   - Resetar senhas
   - Enviar credenciais por email

### Tipos de usuários:
- **👑 Administrador**: Acesso total ao sistema, pode gerenciar usuários
- **👩‍🏫 Professor**: Acesso às funcionalidades de ensino
- **👨‍👩‍👧‍👦 Responsável**: Vinculado aos alunos, acesso às informações dos filhos

## ⚠️ IMPORTANTE

### Arquivos que DEVEM ser editados antes do upload:
- `api/.env` - Configurar senha do banco e domínio

### Pastas que devem ter permissões especiais:
- `uploads/` - Permissão 755 (leitura, escrita, execução)

### Primeiro acesso:
- **Email:** admin@horizontedosaber.com
- **Senha:** admin123
- **Recomendação:** Alterar a senha após primeiro login

### 🆕 Sistema de Usuários:
- **Menu "Usuários"** visível apenas para administradores
- **Criação automática** de senhas seguras
- **Envio por email** das credenciais (se configurado)
- **Três tipos** de usuários: Admin, Professor, Responsável

## 🆘 SOLUÇÃO DE PROBLEMAS

### Site não carrega:
1. Verifique se todos os arquivos foram enviados
2. Confirme que `.htaccess` está na raiz
3. Ative SSL no painel da Hostinger

### API não funciona:
1. Verifique configuração Node.js no painel
2. Confirme que dependências foram instaladas
3. Verifique logs na seção Node.js do painel

### Erro de banco de dados:
1. Confirme senha no arquivo `.env`
2. Execute `npx prisma db push` no terminal
3. Verifique se o banco existe no painel

---

**✅ TUDO PRONTO PARA UPLOAD!**

**Documentação completa:** Consulte `DEPLOY_HOSTINGER.md` na raiz do projeto