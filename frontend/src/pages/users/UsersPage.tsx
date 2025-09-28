import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import userService from '../../services/userService'
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Users,
  UserPlus,
  Shield,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  RefreshCw,
  X,
  Save,
  User,
  MapPin,
  Cake,
  Lock,
  Shuffle
} from 'lucide-react'

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

interface CreateUserForm {
  nome: string
  email: string
  telefone: string
  endereco: string
  data_nascimento: string
  tipo: 'admin' | 'professor' | 'responsavel'
  senha: string
  confirmarSenha: string
  gerarSenhaAutomatica: boolean
  enviarEmail: boolean
}

interface ResetPasswordForm {
  gerarSenhaAutomatica: boolean
  novaSenha: string
  confirmarSenha: string
  enviarEmail: boolean
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)

  const [formData, setFormData] = useState<CreateUserForm>({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    data_nascimento: '',
    tipo: 'professor',
    senha: '',
    confirmarSenha: '',
    gerarSenhaAutomatica: true,
    enviarEmail: true
  })

  const [resetPasswordData, setResetPasswordData] = useState<ResetPasswordForm>({
    gerarSenhaAutomatica: true,
    novaSenha: '',
    confirmarSenha: '',
    enviarEmail: true
  })

  // Dados mockados para demonstração
  const mockUsers: User[] = [
    {
      id: 1,
      nome: 'João Silva',
      email: 'joao@exemplo.com',
      telefone: '(11) 99999-9999',
      tipo: 'admin',
      status: 'ativo',
      created_at: '2024-01-15T10:00:00Z',
      ultimo_login: '2024-09-26T08:30:00Z',
      primeiro_login: false
    },
    {
      id: 2,
      nome: 'Maria Santos',
      email: 'maria@exemplo.com',
      telefone: '(11) 88888-8888',
      tipo: 'professor',
      status: 'ativo',
      created_at: '2024-02-20T14:30:00Z',
      ultimo_login: '2024-09-25T16:45:00Z',
      primeiro_login: false
    },
    {
      id: 3,
      nome: 'Pedro Oliveira',
      email: 'pedro@exemplo.com',
      tipo: 'responsavel',
      status: 'ativo',
      created_at: '2024-03-10T09:15:00Z',
      primeiro_login: true
    }
  ]

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setUsers(mockUsers)
      setLoading(false)
    }, 1000)
  }, [])

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'professor':
        return 'bg-blue-100 text-blue-800'
      case 'responsavel':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800'
      case 'inativo':
        return 'bg-gray-100 text-gray-800'
      case 'suspenso':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'admin':
        return 'Administrador'
      case 'professor':
        return 'Professor'
      case 'responsavel':
        return 'Responsável'
      default:
        return tipo
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || user.tipo === filterType
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const handleCreateUser = () => {
    setShowCreateModal(true)
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setShowUserDetails(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setFormData({
      nome: user.nome,
      email: user.email,
      telefone: user.telefone || '',
      endereco: '',
      data_nascimento: '',
      tipo: user.tipo,
      senha: '',
      confirmarSenha: '',
      gerarSenhaAutomatica: false,
      enviarEmail: false
    })
    setShowEditModal(true)
  }

  const handleToggleStatus = async (user: User) => {
    try {
      // Tentar usar a API real primeiro
      try {
        const updatedUser = await userService.toggleUserStatus(user.id)
        setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u))
        toast.success(`Usuário ${updatedUser.status === 'ativo' ? 'ativado' : 'inativado'} com sucesso!`)
      } catch (apiError) {
        // Fallback para atualização local se a API falhar
        const newStatus = user.status === 'ativo' ? 'inativo' : 'ativo'
        setUsers(prev => prev.map(u =>
          u.id === user.id ? { ...u, status: newStatus as 'ativo' | 'inativo' } : u
        ))
        toast.success(`Usuário ${newStatus === 'ativo' ? 'ativado' : 'inativado'} com sucesso!`)
      }
    } catch (error) {
      toast.error('Erro ao alterar status do usuário')
    }
  }

  const handleResetPassword = (user: User) => {
    setSelectedUser(user)
    setResetPasswordData({
      gerarSenhaAutomatica: true,
      novaSenha: '',
      confirmarSenha: '',
      enviarEmail: true
    })
    setShowResetPasswordModal(true)
  }

  // Funções do formulário de criação
  const handleInputChange = (field: keyof CreateUserForm, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Funções do formulário de reset de senha
  const handleResetPasswordInputChange = (field: keyof ResetPasswordForm, value: string | boolean) => {
    setResetPasswordData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateRandomPassword = async () => {
    try {
      const result = await userService.generatePassword()
      setFormData(prev => ({
        ...prev,
        senha: result.senha,
        confirmarSenha: result.senha
      }))
      toast.success('Senha gerada automaticamente!')
    } catch (error) {
      // Fallback para geração local se a API falhar
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
      let password = ''
      for (let i = 0; i < 12; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length))
      }
      setFormData(prev => ({
        ...prev,
        senha: password,
        confirmarSenha: password
      }))
      toast.success('Senha gerada automaticamente!')
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      endereco: '',
      data_nascimento: '',
      tipo: 'professor',
      senha: '',
      confirmarSenha: '',
      gerarSenhaAutomatica: true,
      enviarEmail: true
    })
  }

  const validateForm = () => {
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório')
      return false
    }

    if (!formData.email.trim()) {
      toast.error('Email é obrigatório')
      return false
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Email inválido')
      return false
    }

    if (!formData.gerarSenhaAutomatica) {
      if (!formData.senha) {
        toast.error('Senha é obrigatória')
        return false
      }

      if (formData.senha !== formData.confirmarSenha) {
        toast.error('Senhas não coincidem')
        return false
      }

      if (formData.senha.length < 6) {
        toast.error('Senha deve ter pelo menos 6 caracteres')
        return false
      }
    }

    return true
  }

  const handleSubmitUser = async () => {
    if (!validateForm()) return

    setIsCreating(true)

    try {
      // Preparar dados para envio
      const userData = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone || undefined,
        endereco: formData.endereco || undefined,
        data_nascimento: formData.data_nascimento || undefined,
        tipo: formData.tipo,
        senha: formData.gerarSenhaAutomatica ? undefined : formData.senha
      }

      // Tentar usar a API real primeiro
      try {
        const response = await userService.createUser(userData)

        // Criar objeto do usuário para adicionar à lista local
        const newUser: User = {
          ...response.data.usuario,
          tipo: response.data.usuario.tipo as 'admin' | 'professor' | 'responsavel',
          status: response.data.usuario.status as 'ativo' | 'inativo' | 'suspenso'
        }

        // Atualizar lista local
        setUsers(prev => [...prev, newUser])

        // Mostrar mensagem de sucesso
        const successMessage = formData.enviarEmail && response.data.emailEnviado
          ? 'Usuário criado com sucesso! Email com credenciais enviado.'
          : response.data.senhaGerada
            ? `Usuário criado com sucesso! Senha gerada: ${response.data.senhaGerada}`
            : 'Usuário criado com sucesso!'

        toast.success(successMessage)
      } catch (apiError) {
        // Fallback para dados mock se a API não estiver disponível
        console.log('API não disponível, usando dados mock...')

        // Simular criação com dados mock
        const newUser: User = {
          id: Math.max(...users.map(u => u.id)) + 1,
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone || undefined,
          tipo: formData.tipo,
          status: 'ativo',
          created_at: new Date().toISOString(),
          primeiro_login: true
        }

        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Atualizar lista local
        setUsers(prev => [...prev, newUser])

        // Mostrar mensagem de sucesso
        const mockSenha = formData.gerarSenhaAutomatica ? 'Senha123!' : formData.senha
        const successMessage = formData.enviarEmail
          ? `Usuário criado com sucesso! Email seria enviado para ${formData.email} com senha: ${mockSenha}`
          : formData.gerarSenhaAutomatica
            ? `Usuário criado com sucesso! Senha gerada: ${mockSenha}`
            : 'Usuário criado com sucesso!'

        toast.success(successMessage)
      }

      resetForm()
      setShowCreateModal(false)
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      toast.error('Erro ao criar usuário')
    } finally {
      setIsCreating(false)
    }
  }

  const validateEditForm = () => {
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório')
      return false
    }

    if (!formData.email.trim()) {
      toast.error('Email é obrigatório')
      return false
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Email inválido')
      return false
    }

    return true
  }

  const handleSubmitEdit = async () => {
    if (!validateEditForm() || !selectedUser) return

    setIsEditing(true)

    try {
      // Simular update com dados mock (a API real seria implementada aqui)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Atualizar usuário na lista local
      const updatedUser: User = {
        ...selectedUser,
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone || undefined,
        tipo: formData.tipo
      }

      setUsers(prev => prev.map(u => u.id === selectedUser.id ? updatedUser : u))

      toast.success('Usuário editado com sucesso!')
      setShowEditModal(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Erro ao editar usuário:', error)
      toast.error('Erro ao editar usuário')
    } finally {
      setIsEditing(false)
    }
  }

  const validateResetPasswordForm = () => {
    if (!resetPasswordData.gerarSenhaAutomatica) {
      if (!resetPasswordData.novaSenha) {
        toast.error('Nova senha é obrigatória')
        return false
      }

      if (resetPasswordData.novaSenha !== resetPasswordData.confirmarSenha) {
        toast.error('Senhas não coincidem')
        return false
      }

      if (resetPasswordData.novaSenha.length < 6) {
        toast.error('Senha deve ter pelo menos 6 caracteres')
        return false
      }
    }

    return true
  }

  const generateRandomPasswordForReset = async () => {
    try {
      const result = await userService.generatePassword()
      setResetPasswordData(prev => ({
        ...prev,
        novaSenha: result.senha,
        confirmarSenha: result.senha
      }))
      toast.success('Senha gerada automaticamente!')
    } catch (error) {
      // Fallback para geração local se a API falhar
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
      let password = ''
      for (let i = 0; i < 12; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length))
      }
      setResetPasswordData(prev => ({
        ...prev,
        novaSenha: password,
        confirmarSenha: password
      }))
      toast.success('Senha gerada automaticamente!')
    }
  }

  const handleSubmitResetPassword = async () => {
    if (!validateResetPasswordForm() || !selectedUser) return

    setIsResettingPassword(true)

    try {
      // Tentar usar a API real primeiro
      try {
        const result = await userService.resetUserPassword(selectedUser.id)

        const successMessage = resetPasswordData.enviarEmail
          ? 'Senha resetada com sucesso! Email enviado ao usuário.'
          : `Senha resetada com sucesso! Nova senha: ${result.novaSenha}`

        toast.success(successMessage)
      } catch (apiError) {
        // Fallback para simulação mock se a API falhar
        await new Promise(resolve => setTimeout(resolve, 1000))

        const novaSenha = resetPasswordData.gerarSenhaAutomatica
          ? 'NewPass' + Math.random().toString(36).substring(2, 8) + '!'
          : resetPasswordData.novaSenha

        const successMessage = resetPasswordData.enviarEmail
          ? `Senha resetada com sucesso! Email seria enviado para ${selectedUser.email} com nova senha: ${novaSenha}`
          : `Senha resetada com sucesso! Nova senha: ${novaSenha}`

        toast.success(successMessage)
      }

      setShowResetPasswordModal(false)
      setSelectedUser(null)
      setResetPasswordData({
        gerarSenhaAutomatica: true,
        novaSenha: '',
        confirmarSenha: '',
        enviarEmail: true
      })
    } catch (error) {
      console.error('Erro ao resetar senha:', error)
      toast.error('Erro ao resetar senha')
    } finally {
      setIsResettingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <UserPlus className="w-8 h-8 text-primary-600" />
              Gestão de Usuários
            </h1>
            <p className="mt-2 text-gray-600">
              Gerencie usuários do sistema, crie novos acessos e controle permissões
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateUser}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Usuário
          </motion.button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Filtro por tipo */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="all">Todos os tipos</option>
          <option value="admin">Administradores</option>
          <option value="professor">Professores</option>
          <option value="responsavel">Responsáveis</option>
        </select>

        {/* Filtro por status */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="all">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="suspenso">Suspenso</option>
        </select>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.tipo === 'admin').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === 'ativo').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Eye className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Primeiro Login</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.primeiro_login).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Usuários */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {user.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.nome}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                        {user.telefone && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {user.telefone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(user.tipo)}`}>
                      {getTypeLabel(user.tipo)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                      {user.primeiro_login && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          1º Login
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.ultimo_login ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {new Date(user.ultimo_login).toLocaleDateString('pt-BR')}
                      </div>
                    ) : (
                      <span className="text-gray-400">Nunca</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded"
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                        title={user.status === 'ativo' ? 'Inativar' : 'Ativar'}
                      >
                        {user.status === 'ativo' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleResetPassword(user)}
                        className="text-purple-600 hover:text-purple-900 p-1 rounded"
                        title="Resetar senha"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
            <p className="text-gray-500">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando um novo usuário'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Criação de Usuário */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => {
                if (!isCreating) {
                  setShowCreateModal(false)
                  resetForm()
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              >
                {/* Header do Modal */}
                <div className="bg-primary-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserPlus className="w-6 h-6" />
                      <h2 className="text-xl font-bold">Criar Novo Usuário</h2>
                    </div>
                    <button
                      onClick={() => {
                        if (!isCreating) {
                          setShowCreateModal(false)
                          resetForm()
                        }
                      }}
                      disabled={isCreating}
                      className="text-white hover:text-gray-200 disabled:opacity-50"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Conteúdo do Modal */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                  <form onSubmit={(e) => { e.preventDefault(); handleSubmitUser(); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      {/* Informações Pessoais */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <User className="w-5 h-5 text-primary-600" />
                          Informações Pessoais
                        </h3>

                        {/* Nome */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome Completo *
                          </label>
                          <input
                            type="text"
                            value={formData.nome}
                            onChange={(e) => handleInputChange('nome', e.target.value)}
                            disabled={isCreating}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                            placeholder="Digite o nome completo"
                            required
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            disabled={isCreating}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                            placeholder="usuario@exemplo.com"
                            required
                          />
                        </div>

                        {/* Telefone */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Telefone
                          </label>
                          <input
                            type="tel"
                            value={formData.telefone}
                            onChange={(e) => handleInputChange('telefone', e.target.value)}
                            disabled={isCreating}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                            placeholder="(11) 99999-9999"
                          />
                        </div>

                        {/* Data de Nascimento */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data de Nascimento
                          </label>
                          <input
                            type="date"
                            value={formData.data_nascimento}
                            onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                            disabled={isCreating}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                          />
                        </div>

                        {/* Endereço */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Endereço
                          </label>
                          <textarea
                            value={formData.endereco}
                            onChange={(e) => handleInputChange('endereco', e.target.value)}
                            disabled={isCreating}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                            placeholder="Endereço completo"
                            rows={3}
                          />
                        </div>
                      </div>

                      {/* Configurações de Acesso */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-primary-600" />
                          Configurações de Acesso
                        </h3>

                        {/* Tipo de Usuário */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Usuário *
                          </label>
                          <select
                            value={formData.tipo}
                            onChange={(e) => handleInputChange('tipo', e.target.value as 'admin' | 'professor' | 'responsavel')}
                            disabled={isCreating}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                            required
                          >
                            <option value="professor">Professor</option>
                            <option value="responsavel">Responsável</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </div>

                        {/* Configuração de Senha */}
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700">
                            Configuração de Senha
                          </label>

                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={formData.gerarSenhaAutomatica}
                              onChange={(e) => handleInputChange('gerarSenhaAutomatica', e.target.checked)}
                              disabled={isCreating}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">Gerar senha automaticamente</span>
                          </label>

                          {!formData.gerarSenhaAutomatica && (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Senha *
                                </label>
                                <div className="relative">
                                  <input
                                    type="password"
                                    value={formData.senha}
                                    onChange={(e) => handleInputChange('senha', e.target.value)}
                                    disabled={isCreating}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                                    placeholder="Digite uma senha"
                                    required
                                  />
                                  <button
                                    type="button"
                                    onClick={generateRandomPassword}
                                    disabled={isCreating}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                    title="Gerar senha aleatória"
                                  >
                                    <Shuffle className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Confirmar Senha *
                                </label>
                                <input
                                  type="password"
                                  value={formData.confirmarSenha}
                                  onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
                                  disabled={isCreating}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                                  placeholder="Confirme a senha"
                                  required
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Opções de Email */}
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700">
                            Opções de Email
                          </label>

                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={formData.enviarEmail}
                              onChange={(e) => handleInputChange('enviarEmail', e.target.checked)}
                              disabled={isCreating}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">Enviar credenciais por email</span>
                          </label>

                          {formData.enviarEmail && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="flex items-start gap-2">
                                <Mail className="w-4 h-4 text-blue-600 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-blue-900">Email será enviado</p>
                                  <p className="text-xs text-blue-700">
                                    As credenciais de acesso serão enviadas para o email cadastrado
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateModal(false)
                          resetForm()
                        }}
                        disabled={isCreating}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isCreating}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isCreating ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Criando...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Criar Usuário
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de Edição de Usuário */}
      <AnimatePresence>
        {showEditModal && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => {
                if (!isEditing) {
                  setShowEditModal(false)
                  setSelectedUser(null)
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
              >
                {/* Header do Modal */}
                <div className="bg-blue-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Edit2 className="w-6 h-6" />
                      <h2 className="text-xl font-bold">Editar Usuário</h2>
                    </div>
                    <button
                      onClick={() => {
                        if (!isEditing) {
                          setShowEditModal(false)
                          setSelectedUser(null)
                        }
                      }}
                      disabled={isEditing}
                      className="text-white hover:text-gray-200 disabled:opacity-50"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Conteúdo do Modal */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                  <form onSubmit={(e) => { e.preventDefault(); handleSubmitEdit(); }}>
                    <div className="space-y-4">
                      {/* Nome */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          value={formData.nome}
                          onChange={(e) => handleInputChange('nome', e.target.value)}
                          disabled={isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                          placeholder="Digite o nome completo"
                          required
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                          placeholder="usuario@exemplo.com"
                          required
                        />
                      </div>

                      {/* Telefone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Telefone
                        </label>
                        <input
                          type="tel"
                          value={formData.telefone}
                          onChange={(e) => handleInputChange('telefone', e.target.value)}
                          disabled={isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                          placeholder="(11) 99999-9999"
                        />
                      </div>

                      {/* Tipo de Usuário */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Usuário *
                        </label>
                        <select
                          value={formData.tipo}
                          onChange={(e) => handleInputChange('tipo', e.target.value as 'admin' | 'professor' | 'responsavel')}
                          disabled={isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                          required
                        >
                          <option value="professor">Professor</option>
                          <option value="responsavel">Responsável</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditModal(false)
                          setSelectedUser(null)
                        }}
                        disabled={isEditing}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isEditing}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isEditing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Salvar Alterações
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de Reset de Senha */}
      <AnimatePresence>
        {showResetPasswordModal && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => {
                if (!isResettingPassword) {
                  setShowResetPasswordModal(false)
                  setSelectedUser(null)
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
              >
                {/* Header do Modal */}
                <div className="bg-purple-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Lock className="w-6 h-6" />
                      <h2 className="text-xl font-bold">Resetar Senha</h2>
                    </div>
                    <button
                      onClick={() => {
                        if (!isResettingPassword) {
                          setShowResetPasswordModal(false)
                          setSelectedUser(null)
                        }
                      }}
                      disabled={isResettingPassword}
                      className="text-white hover:text-gray-200 disabled:opacity-50"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Conteúdo do Modal */}
                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-gray-700">
                      Resetar senha para <strong>{selectedUser.nome}</strong>
                    </p>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleSubmitResetPassword(); }}>
                    <div className="space-y-4">
                      {/* Opção de Gerar Senha Automática */}
                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={resetPasswordData.gerarSenhaAutomatica}
                            onChange={(e) => handleResetPasswordInputChange('gerarSenhaAutomatica', e.target.checked)}
                            disabled={isResettingPassword}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">Gerar senha automaticamente</span>
                        </label>
                      </div>

                      {/* Campos de Senha Manual */}
                      {!resetPasswordData.gerarSenhaAutomatica && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nova Senha *
                            </label>
                            <div className="relative">
                              <input
                                type="password"
                                value={resetPasswordData.novaSenha}
                                onChange={(e) => handleResetPasswordInputChange('novaSenha', e.target.value)}
                                disabled={isResettingPassword}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                                placeholder="Digite a nova senha"
                                required
                              />
                              <button
                                type="button"
                                onClick={generateRandomPasswordForReset}
                                disabled={isResettingPassword}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                title="Gerar senha aleatória"
                              >
                                <Shuffle className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Confirmar Nova Senha *
                            </label>
                            <input
                              type="password"
                              value={resetPasswordData.confirmarSenha}
                              onChange={(e) => handleResetPasswordInputChange('confirmarSenha', e.target.value)}
                              disabled={isResettingPassword}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                              placeholder="Confirme a nova senha"
                              required
                            />
                          </div>
                        </div>
                      )}

                      {/* Opção de Enviar Email */}
                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={resetPasswordData.enviarEmail}
                            onChange={(e) => handleResetPasswordInputChange('enviarEmail', e.target.checked)}
                            disabled={isResettingPassword}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">Enviar nova senha por email</span>
                        </label>
                      </div>

                      {resetPasswordData.enviarEmail && (
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Mail className="w-4 h-4 text-purple-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-purple-900">Email será enviado</p>
                              <p className="text-xs text-purple-700">
                                A nova senha será enviada para {selectedUser.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          setShowResetPasswordModal(false)
                          setSelectedUser(null)
                        }}
                        disabled={isResettingPassword}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isResettingPassword}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isResettingPassword ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Resetando...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4" />
                            Resetar Senha
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de Detalhes do Usuário */}
      <AnimatePresence>
        {showUserDetails && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowUserDetails(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
              >
                {/* Header do Modal */}
                <div className="bg-gray-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Eye className="w-6 h-6" />
                      <h2 className="text-xl font-bold">Detalhes do Usuário</h2>
                    </div>
                    <button
                      onClick={() => setShowUserDetails(false)}
                      className="text-white hover:text-gray-200"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Conteúdo do Modal */}
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-white">
                        {selectedUser.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedUser.nome}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedUser.tipo)}`}>
                      {getTypeLabel(selectedUser.tipo)}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedUser.email}</p>
                      </div>
                    </div>

                    {selectedUser.telefone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Telefone</p>
                          <p className="font-medium">{selectedUser.telefone}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.status)}`}>
                          {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Criado em</p>
                        <p className="font-medium">{new Date(selectedUser.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>

                    {selectedUser.ultimo_login && (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Último login</p>
                          <p className="font-medium">{new Date(selectedUser.ultimo_login).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    )}

                    {selectedUser.primeiro_login && (
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-yellow-600" />
                          <p className="text-sm font-medium text-yellow-800">Primeiro login pendente</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowUserDetails(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UsersPage