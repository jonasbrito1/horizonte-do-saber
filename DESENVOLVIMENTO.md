# 🎓 Horizonte do Saber - Guia de Desenvolvimento

## 🚀 Início Rápido

### Opção 1: Script Automático (Recomendado)
```bash
# Duplo clique no arquivo ou execute:
start-dev.bat
```

### Opção 2: Manual
```bash
# Terminal 1 - Backend
cd backend
set PORT=3002
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🌐 URLs do Sistema

### 📱 Frontend
- **URL Principal**: http://localhost:5180
- **Login Admin**: http://localhost:5180/login
- **Gestão de Usuários**: http://localhost:5180/admin/users
- **Gestão de Conteúdo**: http://localhost:5180/admin/content

### 🔧 Backend
- **API Base**: http://localhost:3002
- **Health Check**: http://localhost:3002/health
- **Documentação**: http://localhost:3002/api-docs

## 🔐 Credenciais de Teste

### Admin Padrão
- **Email**: admin@horizontedosaber.com
- **Senha**: admin123

## 📁 Estrutura de Portas

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| Frontend | 5180 | Interface do usuário (React + Vite) |
| Backend | 3002 | API REST (Node.js + Express) |
| MySQL | 3310 | Banco de dados |

## ⚙️ Configurações Importantes

### Backend (.env)
```env
PORT=3002
CORS_ORIGIN=http://localhost:5180
DATABASE_URL="mysql://root:horizonte123@localhost:3310/horizontedosaber"
```

### Frontend (vite.config.ts)
```typescript
server: {
  port: 5173, // Fallback automático para 5180 se ocupada
  proxy: {
    '/api': 'http://localhost:3002'
  }
}
```

## 🎯 Funcionalidades Implementadas

### ✅ Gestão de Usuários
- [x] Criação de usuários
- [x] Edição de dados
- [x] Reset de senha manual/automático
- [x] Ativação/desativação
- [x] Envio de credenciais por email
- [x] Tipos: Admin, Professor, Responsável

### ✅ Sistema de Autenticação
- [x] Login/logout
- [x] Proteção de rotas
- [x] Tokens JWT
- [x] Middleware de autorização

### ✅ Gestão de Conteúdo
- [x] Edição de seções do site
- [x] Upload de imagens
- [x] Galeria de fotos
- [x] Depoimentos

## 🧪 Para Testes

### Testar Gestão de Usuários
1. Acesse: http://localhost:5180/admin/users
2. Clique em "Novo Usuário"
3. Preencha os dados e teste:
   - Geração automática de senha
   - Envio de email
   - Edição de usuário
   - Reset de senha

### Testar APIs Backend
```bash
# Health check
curl http://localhost:3002/health

# Login
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@horizontedosaber.com","password":"admin123"}'
```

## 🐛 Solução de Problemas

### Erro de Porta em Uso
```bash
# Parar todos os processos Node.js
taskkill /F /IM node.exe

# Ou verificar portas específicas
netstat -ano | findstr :3002
netstat -ano | findstr :5179
```

### Erro de CORS
- Verificar se CORS_ORIGIN no .env está correto
- Verificar se frontend está na porta configurada

### Erro de Banco de Dados
- Verificar se MySQL está rodando na porta 3310
- Verificar credenciais no .env

## 📝 Preparação para Produção

### Checklist Pré-Produção
- [ ] Atualizar variáveis de ambiente
- [ ] Configurar domínio real no CORS
- [ ] Configurar SSL/HTTPS
- [ ] Ajustar portas para produção
- [ ] Configurar banco de produção
- [ ] Testar funcionalidades completas

### Build de Produção
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
```

---

**Desenvolvido com ❤️ para Horizonte do Saber**