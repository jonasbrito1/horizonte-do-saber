import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import userDbService from './services/userDbService';
import emailService from './services/emailService';
import alunoDbService from './services/alunoDbService';
import contentRoutes from './routes/content';
import devTaskRoutes from './routes/devtasks';
// import userRoutes from './routes/users';

// Configurar encoding UTF-8 para suporte completo ao pt-BR
process.env.PYTHONIOENCODING = 'utf-8';
if (process.stdout.isTTY) {
  process.stdout.setEncoding('utf8');
}
if (process.stderr.isTTY) {
  process.stderr.setEncoding('utf8');
}

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });
console.log('🔧 Verificando se .env foi carregado...');
console.log('📧 EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('📧 EMAIL_USER:', process.env.EMAIL_USER);
console.log('📧 EMAIL_PASS length:', process.env.EMAIL_PASS?.length || 0);

const app = express();
const PORT = process.env.PORT || 4601;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5176',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para suporte completo a caracteres pt-BR (acentuação)
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Static files (uploads)
app.use('/uploads', express.static('uploads'));

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/mensagens');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Aceitar apenas imagens, PDFs e documentos comuns
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Apenas imagens, PDFs e documentos office são aceitos.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

// Configuração do Multer para fotos de perfil
const profilePhotoStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/profile-photos');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}${ext}`);
  }
});

const profilePhotoFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Aceitar apenas imagens
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Apenas imagens são aceitas.'));
  }
};

const uploadProfilePhoto = multer({
  storage: profilePhotoStorage,
  fileFilter: profilePhotoFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max para fotos de perfil
  }
});

// API Routes
app.use('/api/content', contentRoutes);
app.use('/api/devtasks', devTaskRoutes);

// User API routes
app.post('/api/users', async (req, res) => {
  try {
    const { nome, email, telefone, endereco, data_nascimento, tipo, senha, gerarSenhaAutomatica, enviarEmail } = req.body;

    const { user, senhaGerada } = await userDbService.createUser({
      nome,
      email,
      telefone,
      endereco,
      data_nascimento,
      tipo,
      senha,
      gerarSenhaAutomatica
    });

    // Enviar email se solicitado
    let emailEnviado = false;
    if (enviarEmail) {
      try {
        const senhaParaEmail = senhaGerada || senha;
        emailEnviado = await emailService.sendWelcomeEmail(nome, email, senhaParaEmail, user.id);
      } catch (emailError) {
        console.log('Erro ao enviar email (será simulado):', emailError);
        emailEnviado = true; // Simular sucesso para desenvolvimento
      }
    }

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        usuario: user,
        senhaGerada,
        emailEnviado
      }
    });
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao criar usuário'
    });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const { tipo } = req.query;
    const users = await userDbService.getAllUsers();

    // Filter by tipo if provided
    let filteredUsers = users;
    if (tipo) {
      filteredUsers = users.filter(user => user.tipo === tipo);
    }

    res.json({
      success: true,
      data: filteredUsers
    });
  } catch (error: any) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuários'
    });
  }
});

// GET /api/users/:id - Buscar usuário por ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await userDbService.findUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Remover senha do retorno
    const { senha, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error: any) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuário'
    });
  }
});

// PUT /api/users/:id - Atualizar dados de usuário (ADMIN)
app.put('/api/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { nome, email, telefone, tipo } = req.body;

    // Validações
    if (!nome || !nome.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nome é obrigatório'
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    // Verificar se usuário existe
    const existingUser = await userDbService.findUserById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se o email já está em uso por outro usuário
    const userWithSameEmail = await userDbService.findUserByEmail(email);
    if (userWithSameEmail && userWithSameEmail.id !== userId) {
      return res.status(400).json({
        success: false,
        message: 'Email já está em uso por outro usuário'
      });
    }

    // Atualizar usuário
    const updatedUser = await userDbService.updateUser(userId, {
      nome: nome.trim(),
      email: email.trim(),
      telefone: telefone?.trim() || undefined,
      tipo: tipo || existingUser.tipo
    });

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: updatedUser
    });
  } catch (error: any) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao atualizar usuário'
    });
  }
});

app.patch('/api/users/:id/toggle-status', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const updatedUser = await userDbService.toggleStatus(userId);

    res.json({
      success: true,
      message: 'Status do usuário alterado com sucesso',
      data: updatedUser
    });
  } catch (error: any) {
    console.error('Erro ao alterar status:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao alterar status do usuário'
    });
  }
});

app.post('/api/users/:id/reset-password', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { novaSenha: customPassword } = req.body;

    const { novaSenha } = await userDbService.resetPassword(userId, customPassword);

    // Tentar enviar email com nova senha
    let emailEnviado = false;
    let emailError = null;

    try {
      const user = await userDbService.findUserById(userId);
      if (user) {
        console.log(`📧 Tentando enviar email de reset de senha para: ${user.email}`);
        emailEnviado = await emailService.sendPasswordResetEmail(user.nome, user.email, novaSenha);

        if (emailEnviado) {
          console.log(`✅ Email de reset enviado com sucesso para: ${user.email}`);
        } else {
          console.log(`❌ Falha ao enviar email para: ${user.email}`);
        }
      }
    } catch (error: any) {
      console.error('❌ ERRO ao enviar email de reset de senha:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        code: error.code,
        response: error.response
      });
      emailError = error.message || 'Erro ao enviar email';
      emailEnviado = false;
    }

    res.json({
      success: true,
      message: emailEnviado
        ? 'Senha resetada com sucesso e enviada por email'
        : 'Senha resetada com sucesso, mas o email não pôde ser enviado',
      data: {
        novaSenha,
        emailEnviado,
        emailError: emailEnviado ? null : emailError
      }
    });
  } catch (error: any) {
    console.error('Erro ao resetar senha:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao resetar senha'
    });
  }
});

app.post('/api/users/generate-password', (req, res) => {
  const mockPassword = 'AutoPass' + Math.random().toString(36).substring(2, 8) + '!';

  res.json({
    success: true,
    data: {
      senha: mockPassword
    }
  });
});

// PATCH /api/users/profile - Atualizar dados do perfil do usuário logado
app.patch('/api/users/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token não fornecido' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'horizonte-secret-key');
    const userId = decoded.userId;

    const { nome, email, telefone, endereco, data_nascimento } = req.body;

    // Validações básicas
    if (!nome || nome.trim() === '') {
      return res.status(400).json({ success: false, message: 'Nome é obrigatório' });
    }

    if (!email || email.trim() === '') {
      return res.status(400).json({ success: false, message: 'Email é obrigatório' });
    }

    // Verificar se o email já está em uso por outro usuário
    const existingUser = await userDbService.findUserByEmail(email);
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({ success: false, message: 'Email já está em uso' });
    }

    // Atualizar usuário
    const updatedUser = await userDbService.updateUser(userId, {
      nome: nome.trim(),
      email: email.trim(),
      telefone: telefone?.trim() || undefined,
      endereco: endereco?.trim() || undefined,
      data_nascimento: data_nascimento || undefined
    });

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: updatedUser
    });
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao atualizar perfil'
    });
  }
});

// PATCH /api/users/profile/password - Alterar senha do usuário logado
app.patch('/api/users/profile/password', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token não fornecido' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'horizonte-secret-key');
    const userId = decoded.userId;

    const { senhaAtual, novaSenha } = req.body;

    // Validações
    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual e nova senha são obrigatórias'
      });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Nova senha deve ter pelo menos 6 caracteres'
      });
    }

    // Alterar senha usando o serviço
    const result = await userDbService.changePassword(userId, senhaAtual, novaSenha);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao alterar senha'
    });
  }
});

// POST /api/users/profile/photo - Upload de foto de perfil
app.post('/api/users/profile/photo', uploadProfilePhoto.single('photo'), async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token não fornecido' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'horizonte-secret-key');
    const userId = decoded.userId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma foto foi enviada'
      });
    }

    // Caminho relativo da foto
    const photoUrl = `/uploads/profile-photos/${req.file.filename}`;

    // Atualizar usuário com a foto
    const updatedUser = await userDbService.updateUser(userId, {
      foto_perfil: photoUrl
    });

    res.json({
      success: true,
      message: 'Foto de perfil atualizada com sucesso',
      data: {
        foto_perfil: photoUrl,
        user: updatedUser
      }
    });
  } catch (error: any) {
    console.error('Erro ao fazer upload da foto:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao fazer upload da foto'
    });
  }
});

// ROTA DE TESTE DE EMAIL
app.post('/api/test-email', async (req, res) => {
  try {
    console.log('📧 Rota de teste de email chamada');
    console.log('📧 Enviando para:', req.body.email || 'escola@horizontedosaber.com.br');

    await emailService.sendWelcomeEmail(
      'Teste',
      req.body.email || 'escola@horizontedosaber.com.br',
      'senhateste123',
      undefined,
      'Aluno Teste'
    );

    res.json({
      success: true,
      message: 'Email de teste enviado com sucesso!'
    });
  } catch (error: any) {
    console.error('❌ Erro ao enviar email de teste:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ========== ROTAS DE GESTÃO DE ALUNOS ==========

// ALUNOS
app.post('/api/alunos', async (req, res) => {
  console.log('📝 Recebendo requisição para criar aluno...');

  try {
    console.log('💾 Criando aluno no banco de dados...');
    const aluno = await alunoDbService.createAluno(req.body);
    console.log(`✅ Aluno criado com ID: ${aluno.id}`);

    // Auto-criar usuário para o responsável se houver email
    let usuarioCriado = false;
    let senhaGerada = null;

    if (req.body.email_responsavel && req.body.nome_responsavel) {
      try {
        console.log(`🔍 Verificando se usuário já existe para: ${req.body.email_responsavel}`);
        // Verificar se já existe usuário com este email
        const existingUser = await userDbService.findUserByEmail(req.body.email_responsavel);

        if (!existingUser) {
          // Criar usuário automaticamente para o responsável
          console.log(`🔧 Criando usuário automaticamente para responsável: ${req.body.nome_responsavel}`);

          const userResult = await userDbService.createUser({
            nome: req.body.nome_responsavel,
            email: req.body.email_responsavel,
            telefone: req.body.telefone_responsavel || '',
            endereco: '',
            tipo: 'responsavel',
            gerarSenhaAutomatica: true
          });

          usuarioCriado = true;
          senhaGerada = userResult.senhaGerada;

          console.log(`✅ Usuário criado com sucesso para: ${req.body.email_responsavel}`);
          if (senhaGerada) {
            console.log(`🔑 Senha gerada: ${senhaGerada}`);

            // Enviar email com as credenciais de acesso
            try {
              console.log(`📧 Tentando enviar email para: ${req.body.email_responsavel}`);
              await emailService.sendWelcomeEmail(
                req.body.nome_responsavel,
                req.body.email_responsavel,
                senhaGerada,
                userResult.user.id,
                req.body.nome // Nome do aluno
              );
              console.log(`✅ Email de boas-vindas enviado com sucesso!`);
            } catch (emailError: any) {
              console.error(`❌ Erro ao enviar email:`, emailError);
              console.error(`Detalhes do erro:`, emailError.message);
              // Não falhar a criação se o email não for enviado
            }
          }
        } else {
          console.log(`ℹ️ Usuário já existe para o email: ${req.body.email_responsavel}`);

          // Usuário já existe - gerar nova senha e enviar email
          const novaSenha = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12).toUpperCase();

          try {
            console.log(`🔄 Atualizando senha para usuário existente...`);
            // Resetar senha e marcar como primeiro login
            await userDbService.resetPassword(existingUser.id, novaSenha);

            // Enviar email com nova senha
            console.log(`📧 Tentando reenviar email para: ${req.body.email_responsavel}`);
            await emailService.sendWelcomeEmail(
              existingUser.nome,
              existingUser.email,
              novaSenha,
              existingUser.id,
              req.body.nome // Nome do aluno
            );

            console.log(`✅ Email reenviado para usuário existente`);
            console.log(`🔑 Nova senha gerada: ${novaSenha}`);
          } catch (emailError: any) {
            console.error(`❌ Erro ao reenviar email:`, emailError);
            console.error(`Detalhes do erro:`, emailError.message);
          }
        }
      } catch (error: any) {
        console.error(`❌ Erro ao criar/atualizar usuário:`, error);
        console.error(`Detalhes:`, error.message);
        // Não falhar a criação do aluno se der erro na criação do usuário
      }
    }

    console.log(`📤 Enviando resposta de sucesso...`);
    res.status(201).json({
      success: true,
      message: 'Aluno criado com sucesso',
      data: aluno,
      usuarioCriado,
      senhaGerada
    });
  } catch (error: any) {
    console.error(`❌ ERRO CRÍTICO ao criar aluno:`, error);
    console.error(`Stack trace:`, error.stack);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao criar aluno'
    });
  }
});

app.get('/api/alunos', async (req, res) => {
  try {
    const { turma_id } = req.query;
    let alunos;

    if (turma_id) {
      alunos = await alunoDbService.getAlunosByTurma(Number(turma_id));
    } else {
      alunos = await alunoDbService.getAllAlunos();
    }

    res.json({
      success: true,
      data: alunos
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar alunos'
    });
  }
});

app.get('/api/alunos/:id', async (req, res) => {
  try {
    const aluno = await alunoDbService.getAlunoById(Number(req.params.id));
    if (!aluno) {
      return res.status(404).json({
        success: false,
        message: 'Aluno não encontrado'
      });
    }
    res.json({
      success: true,
      data: aluno
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar aluno'
    });
  }
});

// Get alunos by responsavel email (for parent portal)
app.get('/api/alunos/responsavel/:email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const alunos = await alunoDbService.getAllAlunos();

    // Filter alunos where email_responsavel matches
    const alunosDoResponsavel = alunos.filter((aluno: any) =>
      aluno.email_responsavel && aluno.email_responsavel.toLowerCase() === email.toLowerCase()
    );

    // Enrich with turma information
    const turmas = await alunoDbService.getAllTurmas();
    const alunosEnriquecidos = alunosDoResponsavel.map((aluno: any) => {
      const turma = turmas.find((t: any) => t.id === aluno.turma_id);

      // Calculate age
      const birthDate = new Date(aluno.data_nascimento);
      const today = new Date();
      let idade = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        idade--;
      }

      return {
        ...aluno,
        turma_nome: turma ? turma.nome : null,
        idade
      };
    });

    res.json({
      success: true,
      data: alunosEnriquecidos
    });
  } catch (error: any) {
    console.error('Erro ao buscar alunos do responsável:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar alunos'
    });
  }
});

// Get notas of a student (for parent portal)
app.get('/api/alunos/:id/notas', async (req, res) => {
  try {
    const alunoId = Number(req.params.id);
    const notasFilePath = path.join(__dirname, 'data', 'notas.json');

    const data = await fs.readFile(notasFilePath, 'utf-8');
    const todasNotas = JSON.parse(data);

    const notasDoAluno = todasNotas.filter((nota: any) => nota.aluno_id === alunoId);

    res.json({
      success: true,
      data: notasDoAluno
    });
  } catch (error: any) {
    console.error('Erro ao buscar notas do aluno:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar notas'
    });
  }
});

app.put('/api/alunos/:id', async (req, res) => {
  try {
    const aluno = await alunoDbService.updateAluno(Number(req.params.id), req.body);
    res.json({
      success: true,
      message: 'Aluno atualizado com sucesso',
      data: aluno
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao atualizar aluno'
    });
  }
});

app.delete('/api/alunos/:id', async (req, res) => {
  try {
    await alunoDbService.deleteAluno(Number(req.params.id));
    res.json({
      success: true,
      message: 'Aluno excluído com sucesso'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao excluir aluno'
    });
  }
});

// TURMAS
app.post('/api/turmas', async (req, res) => {
  try {
    const turma = await alunoDbService.createTurma(req.body);
    res.status(201).json({
      success: true,
      message: 'Turma criada com sucesso',
      data: turma
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao criar turma'
    });
  }
});

app.get('/api/turmas', async (req, res) => {
  try {
    const { professor_id } = req.query;
    let turmas;

    if (professor_id) {
      turmas = await alunoDbService.getTurmasByProfessor(Number(professor_id));
    } else {
      turmas = await alunoDbService.getAllTurmas();
    }

    // Buscar dados completos dos professores responsáveis
    const professores = await loadProfessores();
    const turmasComProfessor = turmas.map((turma: any) => {
      if (turma.professor_responsavel_id) {
        const professor = professores.find((p: any) => p.id === turma.professor_responsavel_id);
        if (professor) {
          return {
            ...turma,
            professor_responsavel: {
              id: professor.id,
              nome: professor.nome,
              email: professor.email
            }
          };
        }
      }
      return turma;
    });

    res.json({
      success: true,
      data: turmasComProfessor
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar turmas'
    });
  }
});

app.get('/api/turmas/:id', async (req, res) => {
  try {
    const turmaId = Number(req.params.id);
    const turmas = await alunoDbService.getAllTurmas();
    let turma: any = turmas.find(t => t.id === turmaId);

    if (!turma) {
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }

    // Buscar dados do professor responsável se houver
    if (turma.professor_responsavel_id) {
      const professores = await loadProfessores();
      const professor = professores.find((p: any) => p.id === turma.professor_responsavel_id);
      if (professor) {
        turma = {
          ...turma,
          professor_responsavel: {
            id: professor.id,
            nome: professor.nome,
            email: professor.email
          }
        };
      }
    }

    res.json({
      success: true,
      data: turma
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar turma'
    });
  }
});

app.put('/api/turmas/:id', async (req, res) => {
  try {
    const turmaId = Number(req.params.id);
    const updatedTurma = await alunoDbService.updateTurma(turmaId, req.body);
    res.json({
      success: true,
      message: 'Turma atualizada com sucesso',
      data: updatedTurma
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao atualizar turma'
    });
  }
});

app.delete('/api/turmas/:id', async (req, res) => {
  try {
    const turmaId = Number(req.params.id);
    await alunoDbService.deleteTurma(turmaId);
    res.json({
      success: true,
      message: 'Turma excluída com sucesso'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao excluir turma'
    });
  }
});

// PROFESSORES
const professoresFilePath = path.join(__dirname, 'data', 'professores.json');

// Helper functions para professores
async function loadProfessores() {
  try {
    const data = await fs.readFile(professoresFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveProfessores(professores: any[]) {
  await fs.writeFile(professoresFilePath, JSON.stringify(professores, null, 2), 'utf-8');
}

// GET - Listar todos os professores
app.get('/api/professores', async (req, res) => {
  try {
    const professores = await loadProfessores();
    res.json({
      success: true,
      data: professores
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao carregar professores'
    });
  }
});

// GET - Buscar professor por ID
app.get('/api/professores/:id', async (req, res) => {
  try {
    const professores = await loadProfessores();
    const professor = professores.find((p: any) => p.id === Number(req.params.id));

    if (!professor) {
      return res.status(404).json({
        success: false,
        message: 'Professor não encontrado'
      });
    }

    res.json({
      success: true,
      data: professor
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao buscar professor'
    });
  }
});

// POST - Criar novo professor
app.post('/api/professores', async (req, res) => {
  try {
    const professores = await loadProfessores();

    const newId = professores.length > 0
      ? Math.max(...professores.map((p: any) => p.id)) + 1
      : 1;

    const now = new Date().toISOString();
    const novoProfessor = {
      id: newId,
      ...req.body,
      turmas_responsavel: 0,
      created_at: now,
      updated_at: now
    };

    professores.push(novoProfessor);
    await saveProfessores(professores);

    // Criar usuário automaticamente para o professor
    let usuarioCriado = false;
    let senhaGerada = '';

    try {
      const resultadoUsuario = await userDbService.createUser({
        nome: novoProfessor.nome,
        email: novoProfessor.email,
        telefone: novoProfessor.telefone,
        tipo: 'professor',
        gerarSenhaAutomatica: true
      });

      usuarioCriado = true;
      senhaGerada = resultadoUsuario.senhaGerada || '';
    } catch (userError: any) {
      console.warn('Aviso ao criar usuário para professor:', userError.message);
      // Não falha a criação do professor se o usuário já existe
    }

    res.status(201).json({
      success: true,
      message: usuarioCriado
        ? 'Professor e usuário criados com sucesso'
        : 'Professor criado com sucesso',
      data: novoProfessor,
      usuarioCriado,
      senhaGerada: usuarioCriado ? senhaGerada : undefined
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao criar professor'
    });
  }
});

// PUT - Atualizar professor
app.put('/api/professores/:id', async (req, res) => {
  try {
    const professores = await loadProfessores();
    const index = professores.findIndex((p: any) => p.id === Number(req.params.id));

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Professor não encontrado'
      });
    }

    const professorAtualizado = {
      ...professores[index],
      ...req.body,
      id: professores[index].id,
      created_at: professores[index].created_at,
      updated_at: new Date().toISOString()
    };

    professores[index] = professorAtualizado;
    await saveProfessores(professores);

    res.json({
      success: true,
      message: 'Professor atualizado com sucesso',
      data: professorAtualizado
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao atualizar professor'
    });
  }
});

// DELETE - Excluir professor
app.delete('/api/professores/:id', async (req, res) => {
  try {
    const professores = await loadProfessores();
    const index = professores.findIndex((p: any) => p.id === Number(req.params.id));

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Professor não encontrado'
      });
    }

    professores.splice(index, 1);
    await saveProfessores(professores);

    res.json({
      success: true,
      message: 'Professor excluído com sucesso'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao excluir professor'
    });
  }
});

// RESPONSÁVEIS
app.post('/api/responsaveis', async (req, res) => {
  try {
    const result = await alunoDbService.createResponsavel(req.body);

    let message = 'Responsável criado com sucesso';
    if (result.usuarioCriado) {
      message += ' e usuário de acesso criado automaticamente';
    }

    res.status(201).json({
      success: true,
      message,
      data: result.responsavel,
      usuarioCriado: result.usuarioCriado,
      senhaGerada: result.senhaGerada
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao criar responsável'
    });
  }
});

// PRESENÇAS
app.post('/api/presencas', async (req, res) => {
  try {
    const presenca = await alunoDbService.registrarPresenca(req.body);
    res.status(201).json({
      success: true,
      message: 'Presença registrada com sucesso',
      data: presenca
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao registrar presença'
    });
  }
});

app.get('/api/presencas', async (req, res) => {
  try {
    const { turma_id, data, aluno_id } = req.query;
    let presencas;

    if (turma_id && data) {
      presencas = await alunoDbService.getPresencasByTurmaEData(Number(turma_id), String(data));
    } else if (aluno_id) {
      presencas = await alunoDbService.getPresencasByAluno(Number(aluno_id));
    } else {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros obrigatórios: (turma_id e data) ou aluno_id'
      });
    }

    res.json({
      success: true,
      data: presencas
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar presenças'
    });
  }
});

// NOTAS
app.post('/api/notas', async (req, res) => {
  try {
    const nota = await alunoDbService.registrarNota(req.body);
    res.status(201).json({
      success: true,
      message: 'Nota registrada com sucesso',
      data: nota
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao registrar nota'
    });
  }
});

app.put('/api/notas/:id', async (req, res) => {
  try {
    const nota = await alunoDbService.updateNota(Number(req.params.id), req.body);
    res.json({
      success: true,
      message: 'Nota atualizada com sucesso',
      data: nota
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao atualizar nota'
    });
  }
});

app.delete('/api/notas/:id', async (req, res) => {
  try {
    await alunoDbService.deleteNota(Number(req.params.id));
    res.json({
      success: true,
      message: 'Nota excluída com sucesso'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao excluir nota'
    });
  }
});

app.post('/api/notas/lote', async (req, res) => {
  try {
    const notas = await alunoDbService.registrarNotasEmLote(req.body.notas);
    res.status(201).json({
      success: true,
      message: `${notas.length} notas registradas com sucesso`,
      data: notas
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao registrar notas em lote'
    });
  }
});

app.get('/api/turmas/:id/notas', async (req, res) => {
  try {
    const { bimestre } = req.query;
    const alunosComNotas = await alunoDbService.getNotasTurmaComAlunos(
      Number(req.params.id),
      bimestre ? Number(bimestre) : undefined
    );
    res.json({
      success: true,
      data: alunosComNotas
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar notas da turma'
    });
  }
});

// Get students in a turma (for teacher dashboard)
app.get('/api/turmas/:id/alunos', async (req, res) => {
  try {
    const turmaId = Number(req.params.id);
    const alunos = await alunoDbService.getAlunosByTurma(turmaId);

    res.json({
      success: true,
      data: alunos
    });
  } catch (error: any) {
    console.error('Erro ao buscar alunos da turma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar alunos da turma'
    });
  }
});

// Get notas with optional turma_id filter (for teacher dashboard)
app.get('/api/notas', async (req, res) => {
  try {
    const { turma_id, aluno_id } = req.query;
    const notasFilePath = path.join(__dirname, 'data', 'notas.json');

    const data = await fs.readFile(notasFilePath, 'utf-8');
    let notas = JSON.parse(data);

    // Filter by turma_id if provided
    if (turma_id) {
      const turmaAlunos = await alunoDbService.getAlunosByTurma(Number(turma_id));
      const alunoIds = turmaAlunos.map(a => a.id);
      notas = notas.filter((nota: any) => alunoIds.includes(nota.aluno_id));

      // Add aluno_nome to each nota
      notas = notas.map((nota: any) => {
        const aluno = turmaAlunos.find(a => a.id === nota.aluno_id);
        return {
          ...nota,
          aluno_nome: aluno?.nome || 'Desconhecido'
        };
      });
    }

    // Filter by aluno_id if provided
    if (aluno_id) {
      notas = notas.filter((nota: any) => nota.aluno_id === Number(aluno_id));
    }

    res.json({
      success: true,
      data: notas
    });
  } catch (error: any) {
    console.error('Erro ao buscar notas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar notas'
    });
  }
});

app.get('/api/alunos/:id/media', async (req, res) => {
  try {
    const { bimestre } = req.query;
    const media = await alunoDbService.calcularMediaAluno(
      Number(req.params.id),
      bimestre ? Number(bimestre) : undefined
    );
    res.json({
      success: true,
      data: { media }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao calcular média'
    });
  }
});

app.get('/api/alunos/:id/medias-disciplinas', async (req, res) => {
  try {
    const { bimestre } = req.query;
    if (!bimestre) {
      return res.status(400).json({
        success: false,
        message: 'Bimestre é obrigatório'
      });
    }
    const medias = await alunoDbService.calcularMediaPorDisciplina(
      Number(req.params.id),
      Number(bimestre)
    );
    res.json({
      success: true,
      data: medias
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao calcular médias por disciplina'
    });
  }
});

app.get('/api/alunos/:id/nota-final-bimestre', async (req, res) => {
  try {
    const { bimestre } = req.query;
    if (!bimestre) {
      return res.status(400).json({
        success: false,
        message: 'Bimestre é obrigatório'
      });
    }
    const notaFinal = await alunoDbService.calcularNotaFinalBimestre(
      Number(req.params.id),
      Number(bimestre)
    );
    res.json({
      success: true,
      data: { notaFinal }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao calcular nota final do bimestre'
    });
  }
});

app.get('/api/notas', async (req, res) => {
  try {
    const { aluno_id, turma_id, professor_id } = req.query;
    let notas;

    if (aluno_id) {
      notas = await alunoDbService.getNotasByAluno(Number(aluno_id));
    } else if (turma_id) {
      notas = await alunoDbService.getNotasByTurma(Number(turma_id));
    } else if (professor_id) {
      notas = await alunoDbService.getNotasByProfessor(Number(professor_id));
    } else {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro obrigatório: aluno_id, turma_id ou professor_id'
      });
    }

    res.json({
      success: true,
      data: notas
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar notas'
    });
  }
});

// ==================== FREQUÊNCIA ENDPOINTS ====================

// Registrar frequências em lote
app.post('/api/frequencias/lote', async (req, res) => {
  try {
    const frequenciasData = req.body;

    if (!Array.isArray(frequenciasData) || frequenciasData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Dados de frequência inválidos'
      });
    }

    const frequencias = await alunoDbService.registrarFrequenciaLote(frequenciasData);

    res.json({
      success: true,
      data: frequencias,
      message: `${frequencias.length} frequências registradas com sucesso`
    });
  } catch (error: any) {
    console.error('Erro ao registrar frequências:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar frequências'
    });
  }
});

// Buscar frequências por turma e data
app.get('/api/frequencias/turma/:turmaId', async (req, res) => {
  try {
    const { data } = req.query;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'Data é obrigatória (formato: YYYY-MM-DD)'
      });
    }

    const frequencias = await alunoDbService.getFrequenciasByTurmaData(
      Number(req.params.turmaId),
      data as string
    );

    res.json({
      success: true,
      data: frequencias
    });
  } catch (error: any) {
    console.error('Erro ao buscar frequências da turma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar frequências da turma'
    });
  }
});

// Buscar frequências de um aluno
app.get('/api/frequencias/aluno/:alunoId', async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;

    const frequencias = await alunoDbService.getFrequenciasByAluno(
      Number(req.params.alunoId),
      data_inicio as string,
      data_fim as string
    );

    res.json({
      success: true,
      data: frequencias
    });
  } catch (error: any) {
    console.error('Erro ao buscar frequências do aluno:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar frequências do aluno'
    });
  }
});

// Calcular taxa de presença do aluno
app.get('/api/alunos/:id/taxa-presenca', async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;

    const taxa = await alunoDbService.calcularTaxaPresenca(
      Number(req.params.id),
      data_inicio as string,
      data_fim as string
    );

    res.json({
      success: true,
      data: {
        taxa_presenca: taxa,
        porcentagem: `${taxa.toFixed(1)}%`
      }
    });
  } catch (error: any) {
    console.error('Erro ao calcular taxa de presença:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao calcular taxa de presença'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Autenticação real
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email e senha são obrigatórios'
      });
    }

    const user = await userDbService.validateCredentials(email, password);

    if (!user) {
      return res.status(401).json({
        message: 'Credenciais inválidas'
      });
    }

    if (user.status !== 'ativo') {
      return res.status(401).json({
        message: 'Usuário inativo'
      });
    }

    // Gerar JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        tipo: user.tipo
      },
      process.env.JWT_SECRET || 'horizonte-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        primeiro_login: user.primeiro_login
      },
      token
    });
  } catch (error: any) {
    console.error('Erro no login:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// Change password (requires old password)
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { senhaAtual, novaSenha } = req.body;

    if (!token) {
      return res.status(401).json({
        message: 'Token não fornecido'
      });
    }

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({
        message: 'Senha atual e nova senha são obrigatórias'
      });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({
        message: 'Nova senha deve ter pelo menos 6 caracteres'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'horizonte-secret-key') as any;
    const result = await userDbService.changePassword(decoded.userId, senhaAtual, novaSenha);

    if (!result.success) {
      return res.status(400).json({
        message: result.message
      });
    }

    res.json({
      success: true,
      message: result.message
    });
  } catch (error: any) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// Change password on first access (no old password required)
app.post('/api/auth/change-password-first-access', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { novaSenha } = req.body;

    if (!token) {
      return res.status(401).json({
        message: 'Token não fornecido'
      });
    }

    if (!novaSenha) {
      return res.status(400).json({
        message: 'Nova senha é obrigatória'
      });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({
        message: 'Nova senha deve ter pelo menos 6 caracteres'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'horizonte-secret-key') as any;
    const result = await userDbService.changePasswordFirstAccess(decoded.userId, novaSenha);

    if (!result.success) {
      return res.status(400).json({
        message: result.message
      });
    }

    res.json({
      success: true,
      message: result.message
    });
  } catch (error: any) {
    console.error('Erro ao alterar senha no primeiro acesso:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// Get current user
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        message: 'Token não fornecido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'horizonte-secret-key') as any;
    const user = await userDbService.findUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: 'Usuário não encontrado'
      });
    }

    if (user.status !== 'ativo') {
      return res.status(401).json({
        message: 'Usuário inativo'
      });
    }

    res.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo,
      primeiro_login: user.primeiro_login
    });
  } catch (error: any) {
    console.error('Erro na verificação do token:', error);
    res.status(401).json({
      message: 'Token inválido'
    });
  }
});

// Mock content endpoint
app.get('/api/content/:section', (req, res) => {
  const { section } = req.params;

  // Mock content data
  const mockContent = {
    hero: {
      title: 'Horizonte do Saber',
      subtitle: 'Educação de Excelência',
      description: 'Formando cidadãos conscientes e preparados para o futuro.',
      backgroundImage: '/uploads/hero-bg.jpg',
      buttonText: 'Saiba Mais'
    },
    about: {
      title: 'Nossa História',
      description: 'Com mais de 20 anos de experiência em educação, o Horizonte do Saber tem o compromisso de oferecer ensino de qualidade.',
      yearsExperience: '20+',
      studentsFormed: '1000+',
      image: '/uploads/about-image.jpg'
    },
    gallery: {
      title: 'Galeria de Fotos',
      description: 'Conheça nossa estrutura e atividades',
      photos: [
        { id: 1, url: '/uploads/gallery1.jpg', alt: 'Sala de aula' },
        { id: 2, url: '/uploads/gallery2.jpg', alt: 'Laboratório' },
        { id: 3, url: '/uploads/gallery3.jpg', alt: 'Biblioteca' }
      ]
    },
    services: {
      title: 'Nossos Valores',
      description: 'Valores que norteiam nossa educação',
      values: [
        'Excelência Acadêmica',
        'Formação Integral',
        'Inovação Pedagógica',
        'Compromisso Social'
      ]
    },
    testimonials: {
      title: 'Depoimentos',
      testimonials: [
        {
          id: 1,
          name: 'Maria Silva',
          text: 'Excelente escola, meu filho evoluiu muito!',
          rating: 5
        }
      ]
    },
    contact: {
      title: 'Contato',
      address: 'Rua das Flores, 123 - Centro',
      phone: '(11) 1234-5678',
      email: 'contato@horizontedosaber.com',
      hours: 'Segunda a Sexta: 7h às 18h'
    }
  };

  res.json(mockContent[section as keyof typeof mockContent] || {});
});

// Update content endpoint
app.put('/api/content/:section', (req, res) => {
  const { section } = req.params;
  const content = req.body;

  // Mock update - in real app, save to database
  console.log(`Updating ${section}:`, content);

  res.json({
    message: 'Conteúdo atualizado com sucesso',
    section,
    content
  });
});

// === ROTAS DA API PARA PROFESSORES ===

import { professorDbService } from './services/professorDbService'

// Dashboard do professor
app.get('/api/professor/:id/dashboard', async (req, res) => {
  try {
    const professorId = parseInt(req.params.id)
    const dashboard = await professorDbService.getDashboardProfessor(professorId)
    res.json(dashboard)
  } catch (error) {
    console.error('Erro ao buscar dashboard do professor:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Turmas do professor
app.get('/api/professor/:id/turmas', async (req, res) => {
  try {
    const professorId = parseInt(req.params.id)
    const turmas = await professorDbService.getTurmasByProfessor(professorId)
    res.json(turmas)
  } catch (error) {
    console.error('Erro ao buscar turmas do professor:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Detalhes de uma turma específica
app.get('/api/professor/:id/turmas/:turmaId', async (req, res) => {
  try {
    const professorId = parseInt(req.params.id)
    const turmaId = parseInt(req.params.turmaId)
    const turma = await professorDbService.getTurmaDetalhes(turmaId, professorId)

    if (!turma) {
      return res.status(404).json({ message: 'Turma não encontrada' })
    }

    res.json(turma)
  } catch (error) {
    console.error('Erro ao buscar detalhes da turma:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// === GESTÃO DE PRESENÇAS ===

// Buscar presenças por data
app.get('/api/presencas/turma/:turmaId/:data', async (req, res) => {
  try {
    const turmaId = parseInt(req.params.turmaId)
    const data = req.params.data
    const presencas = await professorDbService.getPresencasPorData(turmaId, data)
    res.json(presencas)
  } catch (error) {
    console.error('Erro ao buscar presenças:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Registrar presença individual (via professorDbService)
app.post('/api/presencas/professor', async (req, res) => {
  try {
    const presenca = await professorDbService.registrarPresenca(req.body)
    res.status(201).json(presenca)
  } catch (error) {
    console.error('Erro ao registrar presença:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Registrar presenças em lote
app.post('/api/presencas/lote', async (req, res) => {
  try {
    const { turma_id, professor_id, data, presencas_alunos } = req.body
    const presencas = await professorDbService.registrarPresencaLote(
      turma_id, professor_id, data, presencas_alunos
    )
    res.status(201).json(presencas)
  } catch (error) {
    console.error('Erro ao registrar presenças em lote:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// === GESTÃO DE NOTAS ===

// Buscar notas por turma
app.get('/api/notas/turma/:turmaId', async (req, res) => {
  try {
    const turmaId = parseInt(req.params.turmaId)
    const notas = await professorDbService.getNotasPorTurma(turmaId)
    res.json(notas)
  } catch (error) {
    console.error('Erro ao buscar notas da turma:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Buscar notas por aluno
app.get('/api/notas/aluno/:alunoId', async (req, res) => {
  try {
    const alunoId = parseInt(req.params.alunoId)
    const notas = await professorDbService.getNotasPorAluno(alunoId)
    res.json(notas)
  } catch (error) {
    console.error('Erro ao buscar notas do aluno:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Adicionar nova nota
app.post('/api/notas', async (req, res) => {
  try {
    const nota = await professorDbService.adicionarNota(req.body)
    res.status(201).json(nota)
  } catch (error) {
    console.error('Erro ao adicionar nota:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Atualizar nota existente
app.put('/api/notas/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const nota = await professorDbService.atualizarNota(id, req.body)

    if (!nota) {
      return res.status(404).json({ message: 'Nota não encontrada' })
    }

    res.json(nota)
  } catch (error) {
    console.error('Erro ao atualizar nota:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// === GESTÃO DE OBSERVAÇÕES ===

// Buscar observações por turma
app.get('/api/observacoes/turma/:turmaId', async (req, res) => {
  try {
    const turmaId = parseInt(req.params.turmaId)
    const observacoes = await professorDbService.getObservacoesPorTurma(turmaId)
    res.json(observacoes)
  } catch (error) {
    console.error('Erro ao buscar observações da turma:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Buscar observações por aluno
app.get('/api/observacoes/aluno/:alunoId', async (req, res) => {
  try {
    const alunoId = parseInt(req.params.alunoId)
    const observacoes = await professorDbService.getObservacoesPorAluno(alunoId)
    res.json(observacoes)
  } catch (error) {
    console.error('Erro ao buscar observações do aluno:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Adicionar nova observação
app.post('/api/observacoes', async (req, res) => {
  try {
    const observacao = await professorDbService.adicionarObservacao(req.body)
    res.status(201).json(observacao)
  } catch (error) {
    console.error('Erro ao adicionar observação:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Listar todas as observações (com filtro opcional por professor_id)
app.get('/api/observacoes', async (req, res) => {
  try {
    const { professor_id } = req.query;
    const observacoesPath = path.join(__dirname, 'data', 'observacoes.json');
    const data = await fs.readFile(observacoesPath, 'utf-8');
    let observacoes = JSON.parse(data);

    // Filtrar por professor_id se fornecido
    if (professor_id) {
      observacoes = observacoes.filter((obs: any) => obs.professor_id === Number(professor_id));
    }

    res.json({ success: true, data: observacoes });
  } catch (error) {
    console.error('Erro ao buscar observações:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar observações' });
  }
})

// Listar todas as frequências (com filtro opcional)
app.get('/api/frequencias', async (req, res) => {
  try {
    const frequenciasPath = path.join(__dirname, 'data', 'frequencias.json');
    const data = await fs.readFile(frequenciasPath, 'utf-8');
    const frequencias = JSON.parse(data);

    res.json({ success: true, data: frequencias });
  } catch (error) {
    console.error('Erro ao buscar frequências:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar frequências' });
  }
})

// === RELATÓRIOS ===

// Relatório completo da turma
app.get('/api/professor/:id/relatorio/turma/:turmaId', async (req, res) => {
  try {
    const professorId = parseInt(req.params.id)
    const turmaId = parseInt(req.params.turmaId)
    const relatorio = await professorDbService.getRelatorioTurma(turmaId, professorId)

    if (!relatorio) {
      return res.status(404).json({ message: 'Relatório não encontrado' })
    }

    res.json(relatorio)
  } catch (error) {
    console.error('Erro ao gerar relatório da turma:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// ============================================
// CHAT/THREADS API - Sistema de Mensagens Tipo WhatsApp
// ============================================

const threadsFilePath = path.join(__dirname, 'data', 'threads.json');

async function loadThreads() {
  try {
    const data = await fs.readFile(threadsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveThreads(threads: any[]) {
  await fs.writeFile(threadsFilePath, JSON.stringify(threads, null, 2));
}

// POST /api/upload - Upload de arquivos
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });
    }

    const fileUrl = `/uploads/mensagens/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl
      }
    });
  } catch (error: any) {
    console.error('Erro no upload:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/chat/threads - Listar threads do usuário
app.get('/api/chat/threads', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token não fornecido' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'horizonte-secret-key');
    const userId = decoded.userId;

    const threads = await loadThreads();

    // Filtrar threads onde o usuário é participante
    const userThreads = threads.filter((t: any) =>
      t.participantes.includes(userId)
    );

    res.json({ success: true, data: userThreads });
  } catch (error: any) {
    console.error('Erro ao buscar threads:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/chat/threads - Criar nova thread
app.post('/api/chat/threads', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token não fornecido' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'horizonte-secret-key');
    const userId = decoded.userId;

    const { destinatario_id, aluno_id, assunto } = req.body;

    const threads = await loadThreads();

    // Verificar se já existe uma thread entre esses usuários sobre esse aluno
    const existingThread = threads.find((t: any) =>
      t.participantes.includes(userId) &&
      t.participantes.includes(destinatario_id) &&
      t.aluno_id === aluno_id
    );

    if (existingThread) {
      return res.json({ success: true, data: existingThread });
    }

    // Buscar dados dos participantes
    const users = await userDbService.getAllUsers();
    const currentUser = users.find((u: any) => u.id === userId);
    const destinatario = users.find((u: any) => u.id === destinatario_id);

    // Buscar dados do aluno se fornecido
    let alunoNome = null;
    if (aluno_id) {
      const alunos = await alunoDbService.getAllAlunos();
      const aluno = alunos.find((a: any) => a.id === aluno_id);
      alunoNome = aluno?.nome;
    }

    const newThread = {
      id: threads.length > 0 ? Math.max(...threads.map((t: any) => t.id)) + 1 : 1,
      participantes: [userId, destinatario_id],
      participantes_info: [
        { id: userId, nome: currentUser?.nome, tipo: currentUser?.tipo },
        { id: destinatario_id, nome: destinatario?.nome, tipo: destinatario?.tipo }
      ],
      aluno_id,
      aluno_nome: alunoNome,
      assunto: assunto || `Conversa sobre ${alunoNome || 'assunto geral'}`,
      status: 'aberta',
      mensagens: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    threads.push(newThread);
    await saveThreads(threads);

    res.json({ success: true, data: newThread });
  } catch (error: any) {
    console.error('Erro ao criar thread:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/chat/threads/:id - Buscar thread específica
app.get('/api/chat/threads/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token não fornecido' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'horizonte-secret-key');
    const userId = decoded.userId;

    const threads = await loadThreads();
    const thread = threads.find((t: any) => t.id === parseInt(req.params.id));

    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread não encontrada' });
    }

    if (!thread.participantes.includes(userId)) {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }

    res.json({ success: true, data: thread });
  } catch (error: any) {
    console.error('Erro ao buscar thread:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/chat/threads/:id/messages - Enviar mensagem em thread
app.post('/api/chat/threads/:id/messages', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token não fornecido' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'horizonte-secret-key');
    const userId = decoded.userId;

    const { mensagem, anexos } = req.body;
    const threadId = parseInt(req.params.id);

    const threads = await loadThreads();
    const threadIndex = threads.findIndex((t: any) => t.id === threadId);

    if (threadIndex === -1) {
      return res.status(404).json({ success: false, message: 'Thread não encontrada' });
    }

    if (!threads[threadIndex].participantes.includes(userId)) {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }

    // Buscar dados do remetente
    const users = await userDbService.getAllUsers();
    const remetente = users.find((u: any) => u.id === userId);

    const novaMensagem = {
      id: threads[threadIndex].mensagens.length + 1,
      remetente_id: userId,
      remetente_nome: remetente?.nome,
      remetente_tipo: remetente?.tipo,
      mensagem,
      anexos: anexos || [],
      lida: false,
      created_at: new Date().toISOString()
    };

    threads[threadIndex].mensagens.push(novaMensagem);
    threads[threadIndex].updated_at = new Date().toISOString();

    await saveThreads(threads);

    res.json({ success: true, data: novaMensagem });
  } catch (error: any) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/chat/threads/:id/messages/:msgId/read - Marcar mensagem como lida
app.put('/api/chat/threads/:threadId/messages/:msgId/read', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token não fornecido' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'horizonte-secret-key');
    const userId = decoded.userId;

    const threadId = parseInt(req.params.threadId);
    const msgId = parseInt(req.params.msgId);

    const threads = await loadThreads();
    const threadIndex = threads.findIndex((t: any) => t.id === threadId);

    if (threadIndex === -1) {
      return res.status(404).json({ success: false, message: 'Thread não encontrada' });
    }

    if (!threads[threadIndex].participantes.includes(userId)) {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }

    const msgIndex = threads[threadIndex].mensagens.findIndex((m: any) => m.id === msgId);

    if (msgIndex !== -1 && threads[threadIndex].mensagens[msgIndex].remetente_id !== userId) {
      threads[threadIndex].mensagens[msgIndex].lida = true;
      await saveThreads(threads);
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao marcar mensagem como lida:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/chat/threads/:id/close - Encerrar thread (arquivar conversa)
app.patch('/api/chat/threads/:id/close', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token não fornecido' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'horizonte-secret-key');
    const userId = decoded.userId;
    const threadId = parseInt(req.params.id);

    const threads = await loadThreads();
    const threadIndex = threads.findIndex((t: any) => t.id === threadId);

    if (threadIndex === -1) {
      return res.status(404).json({ success: false, message: 'Thread não encontrada' });
    }

    // Verificar se o usuário é participante da thread
    if (!threads[threadIndex].participantes.includes(userId)) {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }

    // Atualizar status para encerrada
    threads[threadIndex].status = 'encerrada';
    threads[threadIndex].updated_at = new Date().toISOString();

    await saveThreads(threads);

    res.json({ success: true, data: threads[threadIndex] });
  } catch (error: any) {
    console.error('Erro ao encerrar thread:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/chat/threads/:id/reopen - Reabrir thread arquivada
app.patch('/api/chat/threads/:id/reopen', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token não fornecido' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'horizonte-secret-key');
    const userId = decoded.userId;
    const threadId = parseInt(req.params.id);

    const threads = await loadThreads();
    const threadIndex = threads.findIndex((t: any) => t.id === threadId);

    if (threadIndex === -1) {
      return res.status(404).json({ success: false, message: 'Thread não encontrada' });
    }

    // Verificar se o usuário é participante da thread
    if (!threads[threadIndex].participantes.includes(userId)) {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }

    // Atualizar status para aberta
    threads[threadIndex].status = 'aberta';
    threads[threadIndex].updated_at = new Date().toISOString();

    await saveThreads(threads);

    res.json({ success: true, data: threads[threadIndex] });
  } catch (error: any) {
    console.error('Erro ao reabrir thread:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================
// MENSAGENS API ROUTES
// ============================================

interface Mensagem {
  id: number;
  remetente_id: number; // ID do usuário que envia
  remetente_nome: string;
  remetente_tipo: 'responsavel' | 'professor' | 'admin';
  destinatario_id?: number; // ID do usuário destino (opcional, pode ser suporte)
  destinatario_nome?: string; // Nome do destinatário
  destinatario_tipo?: 'responsavel' | 'professor' | 'admin' | 'suporte';
  aluno_id?: number; // ID do aluno relacionado à mensagem (quando enviada para professor)
  aluno_nome?: string; // Nome do aluno
  assunto: string;
  mensagem: string;
  resposta?: string;
  respondido_por?: number;
  respondido_em?: string;
  lida: boolean;
  created_at: string;
  updated_at: string;
}

const mensagensFilePath = path.join(__dirname, 'data', 'mensagens.json');

async function loadMensagens(): Promise<Mensagem[]> {
  try {
    const data = await fs.readFile(mensagensFilePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveMensagens(mensagens: Mensagem[]): Promise<void> {
  await fs.writeFile(mensagensFilePath, JSON.stringify(mensagens, null, 2), 'utf-8');
}

// GET /api/mensagens - Listar mensagens do usuário autenticado
app.get('/api/mensagens', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token não fornecido' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'horizonte-secret-key');
    const userId = decoded.userId;

    const mensagens = await loadMensagens();

    // Filtrar mensagens do usuário (enviadas ou recebidas)
    const userMensagens = mensagens.filter(m =>
      m.remetente_id === userId || m.destinatario_id === userId
    );

    res.json({
      success: true,
      data: userMensagens.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    });
  } catch (error: any) {
    console.error('Erro ao listar mensagens:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/mensagens - Criar nova mensagem
app.post('/api/mensagens', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token não fornecido' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'horizonte-secret-key');
    const userId = decoded.userId;

    const user = await userDbService.findUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    const mensagens = await loadMensagens();
    const newId = Math.max(...mensagens.map(m => m.id), 0) + 1;

    // Buscar informações do aluno se fornecido
    let aluno_nome = undefined;
    if (req.body.aluno_id) {
      try {
        const aluno = await alunoDbService.getAlunoById(req.body.aluno_id);
        aluno_nome = aluno?.nome;
      } catch (error) {
        console.error('Erro ao buscar aluno:', error);
      }
    }

    // Buscar informações do destinatário se fornecido
    let destinatario_nome = undefined;
    if (req.body.destinatario_id) {
      try {
        const destinatario = await userDbService.findUserById(req.body.destinatario_id);
        destinatario_nome = destinatario?.nome;
      } catch (error) {
        console.error('Erro ao buscar destinatário:', error);
      }
    }

    const novaMensagem: Mensagem = {
      id: newId,
      remetente_id: userId,
      remetente_nome: user.nome,
      remetente_tipo: user.tipo as any,
      destinatario_tipo: req.body.destinatario_tipo || 'suporte',
      destinatario_id: req.body.destinatario_id,
      destinatario_nome,
      aluno_id: req.body.aluno_id,
      aluno_nome,
      assunto: req.body.assunto,
      mensagem: req.body.mensagem,
      lida: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mensagens.push(novaMensagem);
    await saveMensagens(mensagens);

    res.json({ success: true, data: novaMensagem });
  } catch (error: any) {
    console.error('Erro ao criar mensagem:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/mensagens/:id/ler - Marcar como lida
app.put('/api/mensagens/:id/ler', async (req, res) => {
  try {
    const mensagens = await loadMensagens();
    const mensagemIndex = mensagens.findIndex(m => m.id === parseInt(req.params.id));

    if (mensagemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Mensagem não encontrada' });
    }

    mensagens[mensagemIndex].lida = true;
    mensagens[mensagemIndex].updated_at = new Date().toISOString();
    await saveMensagens(mensagens);

    res.json({ success: true, data: mensagens[mensagemIndex] });
  } catch (error: any) {
    console.error('Erro ao marcar como lida:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/mensagens/:id - Editar mensagem
app.put('/api/mensagens/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token não fornecido' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'horizonte-secret-key');
    const userId = decoded.userId;

    const mensagens = await loadMensagens();
    const mensagemIndex = mensagens.findIndex(m => m.id === parseInt(req.params.id));

    if (mensagemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Mensagem não encontrada' });
    }

    // Verificar se o usuário é o remetente da mensagem
    if (mensagens[mensagemIndex].remetente_id !== userId) {
      return res.status(403).json({ success: false, message: 'Você não tem permissão para editar esta mensagem' });
    }

    // Atualizar campos permitidos
    if (req.body.assunto !== undefined) {
      mensagens[mensagemIndex].assunto = req.body.assunto;
    }
    if (req.body.mensagem !== undefined) {
      mensagens[mensagemIndex].mensagem = req.body.mensagem;
    }

    mensagens[mensagemIndex].updated_at = new Date().toISOString();
    await saveMensagens(mensagens);

    res.json({ success: true, data: mensagens[mensagemIndex] });
  } catch (error: any) {
    console.error('Erro ao editar mensagem:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/mensagens/:id/responder - Responder mensagem
app.put('/api/mensagens/:id/responder', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token não fornecido' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'horizonte-secret-key');
    const userId = decoded.userId;

    const mensagens = await loadMensagens();
    const mensagemIndex = mensagens.findIndex(m => m.id === parseInt(req.params.id));

    if (mensagemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Mensagem não encontrada' });
    }

    mensagens[mensagemIndex].resposta = req.body.resposta;
    mensagens[mensagemIndex].respondido_por = userId;
    mensagens[mensagemIndex].respondido_em = new Date().toISOString();
    mensagens[mensagemIndex].lida = true;
    mensagens[mensagemIndex].updated_at = new Date().toISOString();
    await saveMensagens(mensagens);

    res.json({ success: true, data: mensagens[mensagemIndex] });
  } catch (error: any) {
    console.error('Erro ao responder mensagem:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/chat/bulk-messages - Enviar mensagens em massa (cria threads)
app.post('/api/chat/bulk-messages', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token não fornecido' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'horizonte-secret-key');
    const userId = decoded.userId;

    const user = await userDbService.findUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    const { destinatario_tipo, destinatarios, turma_id, assunto, mensagem } = req.body;

    if (!destinatario_tipo || !assunto || !mensagem) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: destinatario_tipo, assunto, mensagem'
      });
    }

    // Carregar dados necessários
    const alunosPath = path.join(__dirname, 'data', 'alunos.json');
    const usersPath = path.join(__dirname, 'data', 'users.json');
    const alunos = JSON.parse(await fs.readFile(alunosPath, 'utf-8'));
    const users = JSON.parse(await fs.readFile(usersPath, 'utf-8'));

    let recipients: Array<{ id: number; nome: string; tipo: string; aluno_id?: number; aluno_nome?: string }> = [];

    // Determinar destinatários baseado no tipo
    if (destinatario_tipo === 'responsaveis' && turma_id) {
      // Responsáveis de uma turma específica
      const alunosDaTurma = alunos.filter((a: any) => a.turma_id === turma_id && a.status === 'ativo');

      for (const aluno of alunosDaTurma) {
        if (aluno.email_responsavel) {
          const responsavel = users.find((u: any) =>
            u.email.toLowerCase() === aluno.email_responsavel.toLowerCase() && u.tipo === 'responsavel'
          );
          if (responsavel) {
            recipients.push({
              id: responsavel.id,
              nome: responsavel.nome,
              tipo: responsavel.tipo,
              aluno_id: aluno.id,
              aluno_nome: aluno.nome
            });
          }
        }
      }
    } else if (destinatario_tipo === 'todos_responsaveis') {
      // Todos os responsáveis cadastrados
      const responsaveis = users.filter((u: any) => u.tipo === 'responsavel' && u.status === 'ativo');

      for (const responsavel of responsaveis) {
        // Tentar encontrar aluno relacionado
        const aluno = alunos.find((a: any) =>
          a.email_responsavel && a.email_responsavel.toLowerCase() === responsavel.email.toLowerCase()
        );

        recipients.push({
          id: responsavel.id,
          nome: responsavel.nome,
          tipo: responsavel.tipo,
          aluno_id: aluno?.id,
          aluno_nome: aluno?.nome
        });
      }
    } else if (destinatario_tipo === 'turmas' && destinatarios && destinatarios.length > 0) {
      // Responsáveis de múltiplas turmas selecionadas
      const alunosDasTurmas = alunos.filter((a: any) =>
        destinatarios.includes(a.turma_id) && a.status === 'ativo'
      );

      for (const aluno of alunosDasTurmas) {
        if (aluno.email_responsavel) {
          const responsavel = users.find((u: any) =>
            u.email.toLowerCase() === aluno.email_responsavel.toLowerCase() && u.tipo === 'responsavel'
          );
          if (responsavel && !recipients.find(r => r.id === responsavel.id && r.aluno_id === aluno.id)) {
            recipients.push({
              id: responsavel.id,
              nome: responsavel.nome,
              tipo: responsavel.tipo,
              aluno_id: aluno.id,
              aluno_nome: aluno.nome
            });
          }
        }
      }
    } else if (destinatario_tipo === 'alunos' && destinatarios && destinatarios.length > 0) {
      // Responsáveis de alunos específicos
      const alunosSelecionados = alunos.filter((a: any) => destinatarios.includes(a.id));

      for (const aluno of alunosSelecionados) {
        if (aluno.email_responsavel) {
          const responsavel = users.find((u: any) =>
            u.email.toLowerCase() === aluno.email_responsavel.toLowerCase() && u.tipo === 'responsavel'
          );
          if (responsavel) {
            recipients.push({
              id: responsavel.id,
              nome: responsavel.nome,
              tipo: responsavel.tipo,
              aluno_id: aluno.id,
              aluno_nome: aluno.nome
            });
          }
        }
      }
    }

    if (recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum destinatário válido encontrado para os critérios selecionados'
      });
    }

    // Criar threads para cada destinatário (sempre cria novas threads)
    const threads = await loadThreads();
    let nextThreadId = threads.length > 0 ? Math.max(...threads.map((t: any) => t.id)) + 1 : 1;
    const novasThreads: any[] = [];

    for (const recipient of recipients) {
      // Sempre criar nova thread (não reaproveitar threads existentes)
      const novaThread = {
        id: nextThreadId++,
        participantes: [userId, recipient.id],
        participantes_info: [
          { id: userId, nome: user.nome, tipo: user.tipo },
          { id: recipient.id, nome: recipient.nome, tipo: recipient.tipo }
        ],
        aluno_id: recipient.aluno_id,
        aluno_nome: recipient.aluno_nome,
        assunto,
        status: 'aberta',
        mensagens: [
          {
            id: 1,
            remetente_id: userId,
            remetente_nome: user.nome,
            remetente_tipo: user.tipo,
            mensagem,
            anexos: [],
            lida: false,
            created_at: new Date().toISOString()
          }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      threads.push(novaThread);
      novasThreads.push(novaThread);
    }

    // Salvar threads atualizadas
    await saveThreads(threads);

    console.log(`✅ ${recipients.length} novas conversas criadas pelo professor ${user.nome}`);

    res.json({
      success: true,
      data: {
        total_enviadas: recipients.length,
        novas_threads: novasThreads.length
      }
    });
  } catch (error: any) {
    console.error('Erro ao enviar mensagens em massa:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// DASHBOARD ROUTES
// ============================================================

// GET /api/dashboard/stats - Estatísticas do dashboard
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // Carregar dados dos arquivos JSON
    const alunosPath = path.join(__dirname, 'data', 'alunos.json');
    const professoresPath = path.join(__dirname, 'data', 'professores.json');
    const turmasPath = path.join(__dirname, 'data', 'turmas.json');
    const contratosPath = path.join(__dirname, 'data', 'contratos.json');

    const alunos = JSON.parse(await fs.readFile(alunosPath, 'utf-8'));
    const professores = JSON.parse(await fs.readFile(professoresPath, 'utf-8'));
    const turmas = JSON.parse(await fs.readFile(turmasPath, 'utf-8'));

    let contratos = [];
    try {
      contratos = JSON.parse(await fs.readFile(contratosPath, 'utf-8'));
    } catch (error) {
      // Se não existir arquivo de contratos, usar array vazio
      contratos = [];
    }

    // Calcular estatísticas
    const total_alunos = alunos.length;
    const total_professores = professores.length;
    const total_turmas = turmas.length;

    // Calcular mensalidades pendentes e receita mensal
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    let mensalidades_pendentes = 0;
    let receita_mes = 0;

    contratos.forEach((contrato: any) => {
      if (contrato.status === 'ativo') {
        const valor = parseFloat(contrato.valor_mensalidade) || 0;
        receita_mes += valor;

        // Verificar se tem parcelas em atraso
        if (contrato.parcelas) {
          const parcelasAtrasadas = contrato.parcelas.filter((p: any) => {
            if (p.status === 'pendente') {
              const vencimento = new Date(p.data_vencimento);
              return vencimento < now;
            }
            return false;
          });
          mensalidades_pendentes += parcelasAtrasadas.length;
        }
      }
    });

    // Calcular frequência média (mock - pode ser implementado com dados reais depois)
    const frequencia_media = 92; // Placeholder

    res.json({
      success: true,
      data: {
        total_alunos,
        total_professores,
        total_turmas,
        mensalidades_pendentes,
        receita_mes,
        frequencia_media
      }
    });
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar estatísticas',
      error: error.message
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Rota não encontrada'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:5176'}`);
  console.log(`✅ Backend ready!`);
});

export default app;


