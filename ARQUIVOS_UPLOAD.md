# Lista de Arquivos para Upload - Hostinger

## 📁 FRONTEND (para public_html/)
**Origem:** `frontend/dist/`
**Destino:** `public_html/`

✅ **Arquivos construídos com sucesso:**
- index.html (1.09 kB)
- assets/index-DZ-8UHls.css (43.53 kB)
- assets/query-CFZ9c_90.js (0.96 kB)
- assets/router-CMjJHhQP.js (20.84 kB)
- assets/vendor-Q3K9tvtn.js (141.43 kB)
- assets/index-C6yQszA5.js (744.77 kB)

## 📁 BACKEND (para public_html/api/)
**Origem:** `backend/`
**Destino:** `public_html/api/`

### Arquivos essenciais:
- ✅ package.json
- ✅ prisma/ (pasta completa)
- ✅ src/ (pasta completa)
- ✅ uploads/ (criar vazia)
- 📝 .env (criar com configurações de produção)

### Arquivos opcionais (não enviar):
- ❌ node_modules/ (instalar via npm na Hostinger)
- ❌ dist/ (pode ser criado no servidor se necessário)
- ❌ .env.local
- ❌ logs/
- ❌ .git/

## 📝 CONFIGURAÇÕES

### 1. Arquivo .env (criar em public_html/api/.env):
```env
DATABASE_URL="mysql://u674882802_horizonteds:[SUA_SENHA]@localhost:3306/u674882802_horizonte"
PORT=3000
NODE_ENV=production
JWT_SECRET=horizonte_saber_jwt_production_2024_[GERAR_RANDOM]
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads
CORS_ORIGIN=https://[SEU_DOMINIO]
LOG_LEVEL=error
```

### 2. Arquivo .htaccess (criar em public_html/.htaccess):
```apache
RewriteEngine On
RewriteRule ^api/(.*)$ http://localhost:3000/$1 [P,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]
```

## 🗂️ ESTRUTURA FINAL NA HOSTINGER

```
public_html/
├── index.html ← frontend/dist/index.html
├── assets/ ← frontend/dist/assets/
│   ├── index-DZ-8UHls.css
│   ├── query-CFZ9c_90.js
│   ├── router-CMjJHhQP.js
│   ├── vendor-Q3K9tvtn.js
│   └── index-C6yQszA5.js
├── .htaccess (criar)
├── uploads/ (criar pasta vazia, chmod 755)
└── api/ ← backend/
    ├── package.json
    ├── .env (criar com config produção)
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.ts
    └── src/
        ├── server.ts
        ├── controllers/
        ├── routes/
        ├── models/
        ├── middleware/
        ├── services/
        └── utils/
```

## ⚡ COMANDOS APÓS UPLOAD

No terminal Node.js da Hostinger (pasta api/):

```bash
# Instalar dependências
npm install --production

# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma db push

# Criar usuário admin
npm run seed:admin
```

## 📋 CHECKLIST DE UPLOAD

### Frontend:
- [ ] Fazer upload de todos os arquivos de frontend/dist/ para public_html/
- [ ] Verificar que index.html está na raiz de public_html/
- [ ] Verificar que assets/ está na raiz de public_html/

### Backend:
- [ ] Fazer upload da pasta backend/ para public_html/api/
- [ ] Criar arquivo .env com configurações de produção
- [ ] Criar pasta uploads/ com permissões 755
- [ ] Configurar aplicação Node.js no painel da Hostinger

### Configurações:
- [ ] Criar arquivo .htaccess na raiz
- [ ] Definir senha do banco no painel da Hostinger
- [ ] Ativar SSL/HTTPS
- [ ] Testar acesso à aplicação

### Banco de Dados:
- [ ] Executar arquivo init.sql no phpMyAdmin
- [ ] Rodar migrações via Prisma
- [ ] Criar usuário administrador

## 🎯 TESTE FINAL

1. **Frontend:** https://[seu-dominio].com
2. **API Health:** https://[seu-dominio].com/api/health
3. **Login:** admin@horizontedosaber.edu.br / admin123

---

**Status do Build:**
- ✅ Frontend: Build concluído (6.85s, 6 arquivos gerados)
- ⚠️  Backend: Erros de TypeScript (deploy direto recomendado)

**Recomendação:** Fazer deploy direto do código TypeScript, pois a Hostinger pode compilar automaticamente ou usar ts-node em produção.