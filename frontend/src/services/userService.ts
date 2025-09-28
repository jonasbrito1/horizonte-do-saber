interface CreateUserRequest {
  nome: string
  email: string
  telefone?: string
  endereco?: string
  data_nascimento?: string
  tipo: 'admin' | 'professor' | 'responsavel'
  senha?: string
}

interface CreateUserResponse {
  success: boolean
  message: string
  data: {
    usuario: {
      id: number
      nome: string
      email: string
      tipo: string
      status: string
      created_at: string
      primeiro_login: boolean
    }
    senhaGerada?: string
    emailEnviado: boolean
  }
}

interface User {
  id: number
  nome: string
  email: string
  telefone?: string
  tipo: 'admin' | 'professor' | 'responsavel'
  status: 'ativo' | 'inativo' | 'suspenso'
  created_at: string
  ultimo_login?: string
  primeiro_login: boolean
}

class UserService {
  private baseUrl = '/api/users'

  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    const token = localStorage.getItem('token')

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Erro ao criar usuário')
    }

    return response.json()
  }

  async getUsers(): Promise<User[]> {
    const token = localStorage.getItem('token')

    const response = await fetch(this.baseUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Erro ao carregar usuários')
    }

    const data = await response.json()
    return data.data || []
  }

  async toggleUserStatus(userId: number): Promise<User> {
    const token = localStorage.getItem('token')

    const response = await fetch(`${this.baseUrl}/${userId}/toggle-status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Erro ao alterar status do usuário')
    }

    const data = await response.json()
    return data.data
  }

  async resetUserPassword(userId: number): Promise<{ novaSenha: string; emailEnviado: boolean }> {
    const token = localStorage.getItem('token')

    const response = await fetch(`${this.baseUrl}/${userId}/reset-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Erro ao resetar senha')
    }

    const data = await response.json()
    return data.data
  }

  async generatePassword(): Promise<{ senha: string }> {
    const token = localStorage.getItem('token')

    const response = await fetch(`${this.baseUrl}/generate-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Erro ao gerar senha')
    }

    const data = await response.json()
    return data.data
  }
}

export default new UserService()