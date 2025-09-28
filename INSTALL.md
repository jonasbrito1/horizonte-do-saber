# 🚀 Guia de Instalação - Horizonte do Saber

Este guia irá te ajudar a configurar o sistema Horizonte do Saber do zero.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js 18+** ([Download](https://nodejs.org/))
- **MySQL 8.0+** ([Download](https://dev.mysql.com/downloads/mysql/))
- **Git** ([Download](https://git-scm.com/))
- **NPM** ou **Yarn** (vem com Node.js)

## 🔧 Instalação Passo a Passo

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/horizontedosaber.git
cd horizontedosaber
```

### 2. Instale as Dependências

```bash
# Instalar dependências do workspace raiz
npm install

# Instalar dependências do backend
cd backend
npm install

# Instalar dependências do frontend
cd ../frontend
npm install

# Voltar para o diretório raiz
cd ..
```

### 3. Configure o Banco de Dados

#### 3.1 Criar o Banco de Dados MySQL

```sql
-- Conecte-se ao MySQL como root
mysql -u root -p

-- Criar banco de dados
CREATE DATABASE horizontedosaber CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar usuário (opcional, mas recomendado)
CREATE USER 'horizonte_user'@'localhost' IDENTIFIED BY 'sua_senha_segura';
GRANT ALL PRIVILEGES ON horizontedosaber.* TO 'horizonte_user'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

#### 3.2 Configurar Variáveis de Ambiente

```bash
# No diretório backend
cd backend
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database Configuration
DATABASE_URL="mysql://horizonte_user:sua_senha_segura@localhost:3306/horizontedosaber"

# JWT Configuration
JWT_SECRET="gere-uma-chave-super-secreta-aqui"
JWT_REFRESH_SECRET="gere-outra-chave-super-secreta-aqui"

# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"

# Email Configuration (opcional para desenvolvimento)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu-email@gmail.com"
SMTP_PASSWORD="sua-senha-de-app"
SMTP_SECURE=false
```

### 4. Execute as Migrações do Banco

```bash
# No diretório backend
cd backend

# Gerar o cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev --name init

# (Opcional) Popular com dados de exemplo
npx prisma db seed
```

### 5. Criar Usuário Administrador

```bash
# No diretório backend
npm run seed:admin
```

Isso criará um usuário administrador com:
- **Email**: admin@horizontedosaber.com.br
- **Senha**: admin123

### 6. Inicie o Sistema

#### Opção 1: Desenvolvimento (recomendado)

```bash
# No diretório raiz
npm run dev
```

Isso iniciará:
- **Backend** em `http://localhost:3001`
- **Frontend** em `http://localhost:3000`

#### Opção 2: Separadamente

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🌐 Primeiro Acesso

1. Abra seu navegador em `http://localhost:3000`
2. Clique em "Login" ou acesse `http://localhost:3000/login`
3. Use as credenciais:
   - **Email**: admin@horizontedosaber.com.br
   - **Senha**: admin123

## 🔒 Configurações de Segurança

### Gerar Chaves JWT Seguras

```bash
# No Node.js ou terminal
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Use a saída como suas chaves JWT no arquivo `.env`.

### Configurar SMTP (Email)

Para funcionalidades de email (reset de senha, notificações):

1. Configure uma conta Gmail com **Senha de App**
2. Ou use outro provedor SMTP
3. Atualize as configurações no `.env`

## 📊 Configuração de Produção

### Variáveis de Ambiente para Produção

```env
NODE_ENV=production
DATABASE_URL="mysql://usuario:senha@host:porta/banco"
CORS_ORIGIN="https://seudominio.com"
JWT_SECRET="chave-ultra-secreta-producao"
```

### Build para Produção

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
```

### Deploy com PM2

```bash
# Instalar PM2
npm install -g pm2

# No diretório backend
pm2 start dist/server.js --name "horizonte-backend"

# Servir frontend com servidor web (nginx, apache)
```

## 🛠️ Comandos Úteis

```bash
# Resetar banco de dados
npx prisma migrate reset

# Visualizar banco de dados
npx prisma studio

# Fazer backup do banco
mysqldump -u usuario -p horizontedosaber > backup.sql

# Restaurar backup
mysql -u usuario -p horizontedosaber < backup.sql

# Logs do sistema
pm2 logs horizonte-backend

# Reiniciar serviços
pm2 restart horizonte-backend
```

## 🐛 Solução de Problemas

### Erro de Conexão com Banco

```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Testar conexão
mysql -u seu_usuario -p -h localhost
```

### Erro de Portas Ocupadas

```bash
# Verificar processos na porta 3000
lsof -i :3000

# Verificar processos na porta 3001
lsof -i :3001

# Matar processo se necessário
kill -9 PID_DO_PROCESSO
```

### Erro de Dependências

```bash
# Limpar cache npm
npm cache clean --force

# Deletar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro de Permissões (Linux/Mac)

```bash
# Dar permissões corretas
sudo chmod -R 755 uploads/
sudo chown -R $USER:$USER .
```

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do sistema
2. Consulte a [documentação](README.md)
3. Abra uma [issue no GitHub](https://github.com/seu-usuario/horizontedosaber/issues)
4. Entre em contato: suporte@horizontedosaber.com.br

---

**✅ Instalação concluída! Seu sistema está pronto para uso.**