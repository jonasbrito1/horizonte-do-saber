import { api } from './api'
import { LoginRequest, LoginResponse, User } from '../types/user'

// Demo credentials for testing
const DEMO_CREDENTIALS = {
  'admin@horizontedosaber.com': {
    password: 'admin123',
    user: {
      id: 1,
      nome: 'Administrador do Sistema',
      email: 'admin@horizontedosaber.com',
      usuario: 'admin',
      nivel: 'administrador' as const,
      tipo: 'admin' as const,
      ativo: true,
      primeiro_login: false,
      data_criacao: new Date().toISOString()
    }
  },
  'professor@horizontedosaber.com': {
    password: 'prof123',
    user: {
      id: 2,
      nome: 'Professor Demo',
      email: 'professor@horizontedosaber.com',
      usuario: 'professor',
      nivel: 'professor' as const,
      tipo: 'teacher' as const,
      ativo: true,
      primeiro_login: false,
      data_criacao: new Date().toISOString()
    }
  },
  'responsavel@horizontedosaber.com': {
    password: 'resp123',
    user: {
      id: 3,
      nome: 'Responsável Demo',
      email: 'responsavel@horizontedosaber.com',
      usuario: 'responsavel',
      nivel: 'responsavel' as const,
      tipo: 'parent' as const,
      ativo: true,
      primeiro_login: false,
      data_criacao: new Date().toISOString()
    }
  }
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Check demo credentials first
  const demoCredential = DEMO_CREDENTIALS[email as keyof typeof DEMO_CREDENTIALS]
  if (demoCredential && demoCredential.password === password) {
    const token = `demo_token_${Date.now()}`
    return {
      token,
      user: demoCredential.user,
      refresh_token: `refresh_${token}`
    }
  }

  // If not demo credential, try API (will fail gracefully)
  try {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    })
    return response.data
  } catch (error) {
    throw new Error('Credenciais inválidas')
  }
}

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout')
}

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>('/auth/me')
  return response.data
}

export const refreshToken = async (): Promise<{ token: string }> => {
  const response = await api.post<{ token: string }>('/auth/refresh')
  return response.data
}

export const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  await api.put('/auth/password', {
    currentPassword,
    newPassword,
  })
}

export const requestPasswordReset = async (email: string): Promise<void> => {
  await api.post('/auth/forgot-password', { email })
}

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  await api.post('/auth/reset-password', {
    token,
    newPassword,
  })
}