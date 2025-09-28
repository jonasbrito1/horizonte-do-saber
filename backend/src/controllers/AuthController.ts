import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { LoginRequest, LoginResponse, ApiResponse } from '@/types';
import { AuthRequest } from '@/middleware/auth';

const prisma = new PrismaClient();

export class AuthController {
  // Login user
  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, senha }: LoginRequest = req.body;

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return next(createError('Credenciais inválidas', 401));
      }

      if (!user.ativo) {
        return next(createError('Usuário inativo', 401));
      }

      // Check password
      const isMatch = await bcrypt.compare(senha, user.senha);
      if (!isMatch) {
        return next(createError('Credenciais inválidas', 401));
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          nome: user.nome,
          email: user.email,
          nivel: user.nivel,
        },
        process.env.JWT_SECRET!,
        {
          expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        }
      );

      logger.info(`Login successful for user: ${user.email}`);

      const response: ApiResponse<LoginResponse> = {
        success: true,
        data: {
          user: {
            id: user.id,
            nome: user.nome,
            email: user.email,
            nivel: user.nivel,
            ativo: user.ativo,
            data_criacao: user.data_criacao,
            data_atualizacao: user.data_atualizacao,
          },
          token,
          expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        },
        message: 'Login realizado com sucesso',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  // Register new user
  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nome, email, senha, nivel } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return next(createError('Email já está em uso', 400));
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(senha, salt);

      // Create user
      const user = await prisma.user.create({
        data: {
          nome,
          email,
          senha: hashedPassword,
          nivel,
        },
      });

      logger.info(`New user registered: ${user.email}`);

      const response: ApiResponse = {
        success: true,
        data: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          nivel: user.nivel,
          ativo: user.ativo,
        },
        message: 'Usuário criado com sucesso',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  // Get current user
  public getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(createError('Usuário não encontrado', 404));
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          nome: true,
          email: true,
          nivel: true,
          ativo: true,
          data_criacao: true,
          data_atualizacao: true,
        },
      });

      if (!user) {
        return next(createError('Usuário não encontrado', 404));
      }

      const response: ApiResponse = {
        success: true,
        data: user,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  // Forgot password (placeholder)
  public forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Don't reveal if email exists
        const response: ApiResponse = {
          success: true,
          message: 'Se o email estiver cadastrado, você receberá as instruções para reset',
        };
        return res.json(response);
      }

      // TODO: Implement email sending logic
      logger.info(`Password reset requested for: ${email}`);

      const response: ApiResponse = {
        success: true,
        message: 'Se o email estiver cadastrado, você receberá as instruções para reset',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  // Reset password (placeholder)
  public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO: Implement password reset logic
      const response: ApiResponse = {
        success: true,
        message: 'Senha redefinida com sucesso',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };
}