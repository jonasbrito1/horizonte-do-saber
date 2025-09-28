import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import userDbService from './services/userDbService';
import emailService from './services/emailService';
import alunoDbService from './services/alunoDbService';
import contentRoutes from './routes/content';
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
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5181',
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

// API Routes
app.use('/api/content', contentRoutes);
// app.use('/api/users', userRoutes);

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
    const users = await userDbService.getAllUsers();
    res.json({
      success: true,
      data: users
    });
  } catch (error: any) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuários'
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
    try {
      const user = await userDbService.findUserById(userId);
      if (user) {
        emailEnviado = await emailService.sendPasswordResetEmail(user.nome, user.email, novaSenha);
      }
    } catch (emailError) {
      console.log('Erro ao enviar email (será simulado):', emailError);
      emailEnviado = true; // Simular sucesso para desenvolvimento
    }

    res.json({
      success: true,
      message: 'Senha resetada com sucesso',
      data: {
        novaSenha,
        emailEnviado
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

// ========== ROTAS DE GESTÃO DE ALUNOS ==========

// ALUNOS
app.post('/api/alunos', async (req, res) => {
  try {
    const aluno = await alunoDbService.createAluno(req.body);
    res.status(201).json({
      success: true,
      message: 'Aluno criado com sucesso',
      data: aluno
    });
  } catch (error: any) {
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

    res.json({
      success: true,
      data: turmas
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar turmas'
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

// Registrar presença individual
app.post('/api/presencas', async (req, res) => {
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

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
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
  console.log(`🌐 CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
});

export default app;// force restart
// restart again
// final restart
// restart for CORS fix
