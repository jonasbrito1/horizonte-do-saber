export interface User {
  id: number
  nome: string
  email: string
  usuario: string
  nivel: 'administrador' | 'professor' | 'responsavel'
  tipo: 'admin' | 'editor' | 'viewer'
  telefone?: string
  cpf?: string
  foto?: string
  ativo: boolean
  primeiro_login: boolean
  ultimo_login?: string
  data_criacao: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
  refreshToken?: string
}

export interface UpdateUserRequest {
  nome?: string
  email?: string
  telefone?: string
  foto?: string
}