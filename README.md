# 🎓 Horizonte do Saber - Sistema Escolar Moderno

Sistema de gestão escolar completo desenvolvido com tecnologias modernas, oferecendo uma solução integrada para administração educacional.

## 🚀 Stack Tecnológica

### Frontend
- **React 18** + TypeScript
- **Vite** (build tool ultrarrápido)
- **TailwindCSS** (estilização moderna)
- **React Query** (gerenciamento de estado)
- **React Hook Form** + Zod (formulários)
- **React Router** (roteamento)
- **Framer Motion** (animações)
- **Recharts** (gráficos e dashboards)

### Backend
- **Node.js** + Express + TypeScript
- **Prisma ORM** (banco de dados)
- **JWT** (autenticação segura)
- **Multer** + Sharp (upload e processamento de imagens)
- **Zod** (validação de dados)
- **CORS, Helmet, Rate Limiting** (segurança)

### Banco de Dados
- **MySQL** com schema Prisma otimizado
- Relacionamentos complexos e indexes otimizados
- Suporte a transações e migrations

## 📋 Funcionalidades

### 🏠 **Website Institucional**
- Homepage moderna e responsiva
- Seções: Hero, Sobre, Serviços, Atividades, Depoimentos, Contato
- Galeria de atividades com carrossel
- SEO otimizado e performance alta

### 🔐 **Sistema de Autenticação**
- Login seguro com JWT
- Diferentes níveis de acesso (Admin, Professor, Responsável)
- Refresh tokens para sessões prolongadas
- Reset de senha por email

### 📊 **Dashboard Administrativo**
- Métricas em tempo real
- Gráficos interativos
- Cards de estatísticas
- Atividades recentes
- Ações rápidas

### 👥 **Gestão de Usuários**
- **Alunos**: Cadastro completo, documentos, informações médicas
- **Professores**: Perfil profissional, disciplinas, turmas
- **Responsáveis**: Dados de contato, relacionamento com alunos

### 🏫 **Gestão Acadêmica**
- **Turmas**: Criação, capacidade, horários, status
- **Disciplinas**: Cadastro, carga horária, professores
- **Matrículas**: Relacionamento aluno-turma

### 🎯 **Atividades Escolares**
- Cadastro de eventos e projetos
- Upload de múltiplas fotos
- Galeria pública no site
- Organização por tipo e data

### 🎨 **Gestão de Conteúdo**
- Editor visual para o site
- Gerenciamento de imagens
- Customização de cores e temas
- Preview em tempo real

### ⚙️ **Configurações**
- Dados da escola
- Configurações visuais
- Setup de email SMTP
- Configurações acadêmicas e financeiras

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- MySQL 8.0+
- Git

### 1. Clone o Repositório
```bash
git clone <repository-url>
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
```

### 3. Configure o Banco de Dados
```bash
# No diretório backend
cp .env.example .env

# Edite o arquivo .env com suas configurações:
DATABASE_URL="mysql://usuario:senha@localhost:3306/horizontedosaber"
JWT_SECRET="seu_jwt_secret_aqui"
```

### 4. Execute as Migrações
```bash
# No diretório backend
npx prisma migrate dev
npx prisma generate
```

### 5. Inicie o Projeto
```bash
# No diretório raiz
npm run dev
```

Isso iniciará:
- Backend em `http://localhost:3001`
- Frontend em `http://localhost:3000`

## 📱 Uso do Sistema

### Primeiro Acesso
1. Acesse `http://localhost:3000/login`
2. Use as credenciais padrão:
   - **Email**: admin@horizontedosaber.com.br
   - **Senha**: admin123

### Navegação
- **Dashboard**: Visão geral do sistema
- **Alunos**: Gestão completa de estudantes
- **Professores**: Cadastro e gestão do corpo docente
- **Turmas**: Organização de classes
- **Atividades**: Eventos e projetos escolares
- **Conteúdo**: Edição do site institucional
- **Configurações**: Personalização do sistema

## 🏗️ Arquitetura

```
horizontedosaber/
├── backend/              # Servidor Node.js + Express
│   ├── src/
│   │   ├── routes/       # Rotas da API
│   │   ├── middleware/   # Middlewares personalizados
│   │   ├── controllers/  # Lógica de negócio
│   │   └── utils/        # Utilitários
│   ├── prisma/           # Schema e migrações
│   └── uploads/          # Arquivos enviados
├── frontend/             # Aplicação React
│   ├── src/
│   │   ├── components/   # Componentes reutilizáveis
│   │   ├── pages/        # Páginas da aplicação
│   │   ├── layouts/      # Layouts base
│   │   ├── context/      # Context API
│   │   └── services/     # Serviços e API
└── shared/               # Recursos compartilhados
```

## 🔒 Segurança

- **Autenticação JWT** com refresh tokens
- **Rate limiting** para prevenir ataques
- **Validação robusta** de dados
- **Headers de segurança** (Helmet)
- **CORS** configurado
- **Sanitização** de uploads

## 📈 Performance

- **Lazy loading** de componentes
- **Code splitting** automático
- **Compressão Gzip**
- **Otimização de imagens** com Sharp
- **Cache inteligente** com React Query

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Para suporte e dúvidas:
- 📧 Email: suporte@horizontedosaber.com.br
- 📞 Telefone: (11) 99999-9999
- 🌐 Website: [horizontedosaber.com.br](https://horizontedosaber.com.br)

---

**Desenvolvido com ❤️ para transformar a educação através da tecnologia**