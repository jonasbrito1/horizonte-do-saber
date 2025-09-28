import { PrismaClient } from '@prisma/client';
import { PasswordUtils } from '../utils/passwordUtils';
import EmailService from './emailService';

const prisma = new PrismaClient();

interface CreateUserInput {
  nome: string;
  email: string;
  telefone?: string;
  endereco?: string;
  data_nascimento?: Date;
  tipo: 'admin' | 'professor' | 'responsavel';
  senha?: string; // Se não fornecida, será gerada automaticamente
  criadoPorId: number;
}

interface UpdateUserInput {
  nome?: string;
  telefone?: string;
  endereco?: string;
  data_nascimento?: Date;
  tipo?: 'admin' | 'professor' | 'responsavel';
  status?: 'ativo' | 'inativo' | 'suspenso';
}

interface CreateResponsavelAlunoInput {
  responsavel: {
    nome: string;
    email?: string;
    telefone?: string;
    endereco?: string;
    cpf?: string;
    rg?: string;
    profissao?: string;
    parentesco?: string;
  };
  aluno: {
    nome: string;
    email?: string;
    data_nascimento: Date;
    cpf?: string;
    rg?: string;
    telefone?: string;
    endereco?: string;
    serie_atual?: string;
    turno?: string;
  };
  tipoRelacao?: string;
  criadoPorId: number;
}

interface UserFilters {
  search?: string;
  tipo?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export class UserService {
  // Criar usuário do sistema (admin, professor, responsavel)
  async createUser(data: CreateUserInput) {
    try {
      // Verificar se email já existe
      const existingUser = await prisma.usuario.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        throw new Error('Email já está em uso');
      }

      // Verificar se o criador tem permissão (só admin pode criar)
      const criador = await prisma.usuario.findUnique({
        where: { id: data.criadoPorId }
      });

      if (!criador || criador.tipo !== 'admin') {
        throw new Error('Apenas administradores podem criar novos usuários');
      }

      // Gerar senha se não fornecida
      let senhaPlainText: string;
      if (data.senha) {
        const validation = PasswordUtils.validatePassword(data.senha);
        if (!validation.valid) {
          throw new Error(`Senha inválida: ${validation.errors.join(', ')}`);
        }
        senhaPlainText = data.senha;
      } else {
        senhaPlainText = PasswordUtils.generateRandomPassword();
      }

      // Hash da senha
      const senhaHash = await PasswordUtils.hashPassword(senhaPlainText);

      // Criar usuário
      const usuario = await prisma.usuario.create({
        data: {
          nome: data.nome,
          email: data.email,
          senha: senhaHash,
          telefone: data.telefone,
          endereco: data.endereco,
          data_nascimento: data.data_nascimento,
          tipo: data.tipo,
          primeiro_login: true,
        },
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          status: true,
          created_at: true,
        }
      });

      // Enviar email com credenciais
      const emailSent = await EmailService.sendWelcomeEmail(
        data.nome,
        data.email,
        senhaPlainText,
        usuario.id
      );

      // Log da criação
      await this.logUserAction(data.criadoPorId, 'criar_usuario', {
        usuarioId: usuario.id,
        email: data.email,
        tipo: data.tipo,
        emailEnviado: emailSent
      });

      return {
        usuario,
        senhaGerada: !data.senha ? senhaPlainText : undefined,
        emailEnviado: emailSent
      };
    } catch (error) {
      throw error;
    }
  }

  // Criar responsável com aluno vinculado
  async createResponsavelWithAluno(data: CreateResponsavelAlunoInput) {
    try {
      // Verificar permissões
      const criador = await prisma.usuario.findUnique({
        where: { id: data.criadoPorId }
      });

      if (!criador || criador.tipo !== 'admin') {
        throw new Error('Apenas administradores podem criar responsáveis e alunos');
      }

      return await prisma.$transaction(async (tx) => {
        // Criar responsável
        const responsavel = await tx.responsavel.create({
          data: data.responsavel
        });

        // Criar aluno
        const aluno = await tx.aluno.create({
          data: {
            ...data.aluno,
            created_by: data.criadoPorId,
          }
        });

        // Vincular responsável ao aluno
        await tx.responsavelAluno.create({
          data: {
            responsavel_id: responsavel.id,
            aluno_id: aluno.id,
            tipo_relacao: data.tipoRelacao || 'responsavel_legal',
          }
        });

        // Log da ação
        await this.logUserAction(data.criadoPorId, 'criar_responsavel_aluno', {
          responsavelId: responsavel.id,
          alunoId: aluno.id,
          responsavelNome: responsavel.nome,
          alunoNome: aluno.nome
        });

        return {
          responsavel,
          aluno,
          vinculo: {
            tipo_relacao: data.tipoRelacao || 'responsavel_legal'
          }
        };
      });
    } catch (error) {
      throw error;
    }
  }

  // Listar usuários com filtros e paginação
  async getUsers(filters: UserFilters, requesterId: number) {
    try {
      // Verificar permissões
      const requester = await prisma.usuario.findUnique({
        where: { id: requesterId }
      });

      if (!requester || requester.tipo !== 'admin') {
        throw new Error('Acesso negado');
      }

      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      const where: any = {};

      // Filtros
      if (filters.search) {
        where.OR = [
          { nome: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      if (filters.tipo) {
        where.tipo = filters.tipo;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      const [usuarios, total] = await Promise.all([
        prisma.usuario.findMany({
          where,
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            tipo: true,
            status: true,
            primeiro_login: true,
            ultimo_login: true,
            created_at: true,
          },
          orderBy: { created_at: 'desc' },
          skip,
          take: limit,
        }),
        prisma.usuario.count({ where })
      ]);

      return {
        usuarios,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Atualizar usuário
  async updateUser(userId: number, data: UpdateUserInput, requesterId: number) {
    try {
      // Verificar permissões
      const requester = await prisma.usuario.findUnique({
        where: { id: requesterId }
      });

      if (!requester || requester.tipo !== 'admin') {
        throw new Error('Acesso negado');
      }

      // Verificar se usuário existe
      const existingUser = await prisma.usuario.findUnique({
        where: { id: userId }
      });

      if (!existingUser) {
        throw new Error('Usuário não encontrado');
      }

      // Atualizar usuário
      const updatedUser = await prisma.usuario.update({
        where: { id: userId },
        data,
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          tipo: true,
          status: true,
          updated_at: true,
        }
      });

      // Log da ação
      await this.logUserAction(requesterId, 'atualizar_usuario', {
        usuarioId: userId,
        alteracoes: data
      });

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  // Resetar senha do usuário
  async resetUserPassword(userId: number, requesterId: number) {
    try {
      // Verificar permissões
      const requester = await prisma.usuario.findUnique({
        where: { id: requesterId }
      });

      if (!requester || requester.tipo !== 'admin') {
        throw new Error('Acesso negado');
      }

      // Verificar se usuário existe
      const user = await prisma.usuario.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Gerar nova senha
      const novaSenha = PasswordUtils.generateRandomPassword();
      const senhaHash = await PasswordUtils.hashPassword(novaSenha);

      // Atualizar senha
      await prisma.usuario.update({
        where: { id: userId },
        data: {
          senha: senhaHash,
          primeiro_login: true,
        }
      });

      // Enviar email com nova senha
      const emailSent = await EmailService.sendWelcomeEmail(
        user.nome,
        user.email,
        novaSenha,
        user.id
      );

      // Log da ação
      await this.logUserAction(requesterId, 'resetar_senha', {
        usuarioId: userId,
        emailEnviado: emailSent
      });

      return {
        success: true,
        novaSenha,
        emailEnviado: emailSent
      };
    } catch (error) {
      throw error;
    }
  }

  // Inativar/Ativar usuário
  async toggleUserStatus(userId: number, requesterId: number) {
    try {
      // Verificar permissões
      const requester = await prisma.usuario.findUnique({
        where: { id: requesterId }
      });

      if (!requester || requester.tipo !== 'admin') {
        throw new Error('Acesso negado');
      }

      // Não permitir inativar própria conta
      if (userId === requesterId) {
        throw new Error('Não é possível alterar o status da própria conta');
      }

      // Verificar se usuário existe
      const user = await prisma.usuario.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Alternar status
      const novoStatus = user.status === 'ativo' ? 'inativo' : 'ativo';

      const updatedUser = await prisma.usuario.update({
        where: { id: userId },
        data: { status: novoStatus },
        select: {
          id: true,
          nome: true,
          email: true,
          status: true,
        }
      });

      // Log da ação
      await this.logUserAction(requesterId, 'alterar_status', {
        usuarioId: userId,
        statusAnterior: user.status,
        novoStatus
      });

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  // Obter estatísticas de usuários
  async getUserStats(requesterId: number) {
    try {
      // Verificar permissões
      const requester = await prisma.usuario.findUnique({
        where: { id: requesterId }
      });

      if (!requester || requester.tipo !== 'admin') {
        throw new Error('Acesso negado');
      }

      const [
        totalUsuarios,
        totalAdmins,
        totalProfessores,
        totalResponsaveis,
        usuariosAtivos,
        usuariosInativos,
        totalAlunos,
        ultimosUsuarios
      ] = await Promise.all([
        prisma.usuario.count(),
        prisma.usuario.count({ where: { tipo: 'admin' } }),
        prisma.usuario.count({ where: { tipo: 'professor' } }),
        prisma.usuario.count({ where: { tipo: 'responsavel' } }),
        prisma.usuario.count({ where: { status: 'ativo' } }),
        prisma.usuario.count({ where: { status: 'inativo' } }),
        prisma.aluno.count(),
        prisma.usuario.findMany({
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            created_at: true,
          },
          orderBy: { created_at: 'desc' },
          take: 5
        })
      ]);

      return {
        usuarios: {
          total: totalUsuarios,
          ativos: usuariosAtivos,
          inativos: usuariosInativos,
        },
        tipos: {
          admins: totalAdmins,
          professores: totalProfessores,
          responsaveis: totalResponsaveis,
        },
        alunos: {
          total: totalAlunos,
        },
        ultimosCriados: ultimosUsuarios
      };
    } catch (error) {
      throw error;
    }
  }

  // Log de ações do usuário
  private async logUserAction(userId: number, acao: string, detalhes: any) {
    try {
      // Simular log (pode ser expandido para uma tabela específica)
      console.log(`[USER ACTION] ${userId}: ${acao}`, detalhes);

      // Se quiser salvar no banco, pode criar uma tabela de logs
      // await prisma.userActionLog.create({
      //   data: {
      //     usuario_id: userId,
      //     acao,
      //     detalhes: JSON.stringify(detalhes),
      //   }
      // });
    } catch (error) {
      console.error('Erro ao registrar log:', error);
    }
  }
}

export default new UserService();