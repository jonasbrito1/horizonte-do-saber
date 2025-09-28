import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { createError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { ApiResponse, PaginationQuery } from '@/types';

const prisma = new PrismaClient();

export class UserController {
  public getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 10, search, sortBy = 'nome', sortOrder = 'asc' }: PaginationQuery = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where = search
        ? {
            OR: [
              { nome: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take,
          orderBy: { [sortBy]: sortOrder },
          select: {
            id: true,
            nome: true,
            email: true,
            nivel: true,
            ativo: true,
            data_criacao: true,
            data_atualizacao: true,
          },
        }),
        prisma.user.count({ where }),
      ]);

      const response: ApiResponse = {
        success: true,
        data: users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
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

  public createUser = async (req: Request, res: Response, next: NextFunction) => {
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

      logger.info(`User created: ${user.email}`);

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'Usuário criado com sucesso',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { nome, email, nivel, senha } = req.body;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: Number(id) },
      });

      if (!existingUser) {
        return next(createError('Usuário não encontrado', 404));
      }

      // Check if email is already in use by another user
      if (email && email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email },
        });

        if (emailExists) {
          return next(createError('Email já está em uso', 400));
        }
      }

      const updateData: any = { nome, email, nivel };

      // Hash new password if provided
      if (senha) {
        const salt = await bcrypt.genSalt(12);
        updateData.senha = await bcrypt.hash(senha, salt);
      }

      const user = await prisma.user.update({
        where: { id: Number(id) },
        data: updateData,
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

      logger.info(`User updated: ${user.email}`);

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'Usuário atualizado com sucesso',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
      });

      if (!user) {
        return next(createError('Usuário não encontrado', 404));
      }

      await prisma.user.delete({
        where: { id: Number(id) },
      });

      logger.info(`User deleted: ${user.email}`);

      const response: ApiResponse = {
        success: true,
        message: 'Usuário removido com sucesso',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  public toggleUserStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
      });

      if (!user) {
        return next(createError('Usuário não encontrado', 404));
      }

      const updatedUser = await prisma.user.update({
        where: { id: Number(id) },
        data: { ativo: !user.ativo },
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

      logger.info(`User status toggled: ${updatedUser.email} - Active: ${updatedUser.ativo}`);

      const response: ApiResponse = {
        success: true,
        data: updatedUser,
        message: `Usuário ${updatedUser.ativo ? 'ativado' : 'desativado'} com sucesso`,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };
}