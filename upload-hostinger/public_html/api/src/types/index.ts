export interface User {
  id: number;
  nome: string;
  email: string;
  senha: string;
  nivel: 'administrador' | 'usuario' | 'responsavel';
  ativo: boolean;
  data_criacao: Date;
  data_atualizacao: Date;
}

export interface Student {
  id: number;
  nome: string;
  data_nascimento: Date;
  responsavel_id?: number;
  turma_id?: number;
  matricula: string;
  status: 'ativo' | 'inativo' | 'transferido';
  data_matricula: Date;
  observacoes?: string;
}

export interface Responsible {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  endereco?: string;
  data_criacao: Date;
}

export interface Financial {
  id: number;
  aluno_id: number;
  valor: number;
  vencimento: Date;
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado';
  data_pagamento?: Date;
  observacoes?: string;
}

export interface SiteContent {
  id: number;
  secao_nome: string;
  chave: string;
  titulo: string;
  subtitulo?: string;
  conteudo?: string;
  imagem?: string;
  link?: string;
  tipo: string;
  ordem: number;
  ativo: boolean;
  data_criacao: Date;
  data_atualizacao: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  user: Omit<User, 'senha'>;
  token: string;
  expiresIn: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}