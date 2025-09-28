import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface JwtPayload {
  userId: number;
  email: string;
  tipo: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        nome: string;
        tipo: 'admin' | 'professor' | 'responsavel';
        status: string;
      };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Verificar se usuário ainda existe e está ativo
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        nome: true,
        tipo: true,
        status: true,
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    if (user.status !== 'ativo') {
      return res.status(401).json({
        success: false,
        message: 'Conta inativa ou suspensa'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      nome: user.nome,
      tipo: user.tipo as 'admin' | 'professor' | 'responsavel',
      status: user.status
    };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    console.error('Erro na autenticação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Acesso não autorizado'
    });
  }

  if (req.user.tipo !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acesso restrito a administradores'
    });
  }

  next();
};

export const requireAdminOrProfessor = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Acesso não autorizado'
    });
  }

  if (!['admin', 'professor'].includes(req.user.tipo)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso restrito a administradores e professores'
    });
  }

  next();
};

export const requireActiveUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Acesso não autorizado'
    });
  }

  if (req.user.status !== 'ativo') {
    return res.status(403).json({
      success: false,
      message: 'Conta inativa ou suspensa'
    });
  }

  next();
};

// Middleware para log de ações (opcional)
export const logUserAction = (action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.user) {
        // Log da ação
        console.log(`[USER ACTION] ${req.user.id} (${req.user.email}): ${action}`, {
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        });

        // Pode salvar no banco se necessário
        // await prisma.userActionLog.create({
        //   data: {
        //     usuario_id: req.user.id,
        //     acao: action,
        //     ip: req.ip || req.connection.remoteAddress,
        //     user_agent: req.get('User-Agent'),
        //   }
        // });
      }
      next();
    } catch (error) {
      console.error('Erro no log de ação:', error);
      next(); // Continua mesmo com erro no log
    }
  };
};