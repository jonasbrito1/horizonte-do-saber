import express from 'express';
import { authenticateToken, requireAdmin, logUserAction } from '../middleware/auth';
import UserService from '../services/userService';
import { PasswordUtils } from '../utils/passwordUtils';

const router = express.Router();

// Middleware: todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /api/users - Listar usuários (somente admin)
router.get('/', requireAdmin, logUserAction('listar_usuarios'), async (req, res) => {
  try {
    const filters = {
      search: req.query.search as string,
      tipo: req.query.tipo as string,
      status: req.query.status as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };

    const result = await UserService.getUsers(filters, req.user!.id);

    res.json({
      success: true,
      data: result.usuarios,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro interno do servidor'
    });
  }
});

// GET /api/users/stats - Estatísticas de usuários (somente admin)
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const stats = await UserService.getUserStats(req.user!.id);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro interno do servidor'
    });
  }
});

// POST /api/users - Criar usuário (somente admin)
router.post('/', requireAdmin, logUserAction('criar_usuario'), async (req, res) => {
  try {
    const { nome, email, telefone, endereco, data_nascimento, tipo, senha } = req.body;

    // Validações básicas
    if (!nome || !email || !tipo) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e tipo são obrigatórios'
      });
    }

    if (!['admin', 'professor', 'responsavel'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo deve ser: admin, professor ou responsavel'
      });
    }

    // Validar senha se fornecida
    if (senha) {
      const validation = PasswordUtils.validatePassword(senha);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: 'Senha inválida',
          errors: validation.errors
        });
      }
    }

    const result = await UserService.createUser({
      nome,
      email,
      telefone,
      endereco,
      data_nascimento: data_nascimento ? new Date(data_nascimento) : undefined,
      tipo,
      senha,
      criadoPorId: req.user!.id
    });

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        usuario: result.usuario,
        senhaGerada: result.senhaGerada,
        emailEnviado: result.emailEnviado
      }
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro interno do servidor'
    });
  }
});

// POST /api/users/responsavel-aluno - Criar responsável com aluno (somente admin)
router.post('/responsavel-aluno', requireAdmin, logUserAction('criar_responsavel_aluno'), async (req, res) => {
  try {
    const { responsavel, aluno, tipoRelacao } = req.body;

    // Validações básicas
    if (!responsavel?.nome || !aluno?.nome || !aluno?.data_nascimento) {
      return res.status(400).json({
        success: false,
        message: 'Dados do responsável e aluno são obrigatórios'
      });
    }

    const result = await UserService.createResponsavelWithAluno({
      responsavel,
      aluno: {
        ...aluno,
        data_nascimento: new Date(aluno.data_nascimento)
      },
      tipoRelacao,
      criadoPorId: req.user!.id
    });

    res.status(201).json({
      success: true,
      message: 'Responsável e aluno criados com sucesso',
      data: result
    });
  } catch (error) {
    console.error('Erro ao criar responsável e aluno:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro interno do servidor'
    });
  }
});

// PUT /api/users/:id - Atualizar usuário (somente admin)
router.put('/:id', requireAdmin, logUserAction('atualizar_usuario'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { nome, telefone, endereco, data_nascimento, tipo, status } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuário inválido'
      });
    }

    const updatedUser = await UserService.updateUser(userId, {
      nome,
      telefone,
      endereco,
      data_nascimento: data_nascimento ? new Date(data_nascimento) : undefined,
      tipo,
      status
    }, req.user!.id);

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: updatedUser
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro interno do servidor'
    });
  }
});

// POST /api/users/:id/reset-password - Resetar senha (somente admin)
router.post('/:id/reset-password', requireAdmin, logUserAction('resetar_senha'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuário inválido'
      });
    }

    const result = await UserService.resetUserPassword(userId, req.user!.id);

    res.json({
      success: true,
      message: 'Senha resetada com sucesso',
      data: {
        novaSenha: result.novaSenha,
        emailEnviado: result.emailEnviado
      }
    });
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro interno do servidor'
    });
  }
});

// PATCH /api/users/:id/toggle-status - Ativar/Inativar usuário (somente admin)
router.patch('/:id/toggle-status', requireAdmin, logUserAction('alterar_status'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuário inválido'
      });
    }

    const updatedUser = await UserService.toggleUserStatus(userId, req.user!.id);

    res.json({
      success: true,
      message: `Usuário ${updatedUser.status === 'ativo' ? 'ativado' : 'inativado'} com sucesso`,
      data: updatedUser
    });
  } catch (error) {
    console.error('Erro ao alterar status:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro interno do servidor'
    });
  }
});

// POST /api/users/generate-password - Gerar senha aleatória (somente admin)
router.post('/generate-password', requireAdmin, async (req, res) => {
  try {
    const { length = 12 } = req.body;

    const password = PasswordUtils.generateRandomPassword(length);
    const validation = PasswordUtils.validatePassword(password);

    res.json({
      success: true,
      data: {
        senha: password,
        validacao: validation
      }
    });
  } catch (error) {
    console.error('Erro ao gerar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/users/validate-password - Validar força da senha
router.post('/validate-password', async (req, res) => {
  try {
    const { senha } = req.body;

    if (!senha) {
      return res.status(400).json({
        success: false,
        message: 'Senha é obrigatória'
      });
    }

    const validation = PasswordUtils.validatePassword(senha);

    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('Erro ao validar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;