import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Save,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Upload,
  X,
  Edit,
  Check
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

interface ProfileFormData {
  nome: string
  email: string
  telefone: string
  endereco: string
  data_nascimento: string
}

interface PasswordFormData {
  senha_atual: string
  nova_senha: string
  confirmar_senha: string
}

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [profileData, setProfileData] = useState<ProfileFormData>({
    nome: user?.nome || '',
    email: user?.email || '',
    telefone: user?.telefone || '',
    endereco: user?.endereco || '',
    data_nascimento: user?.data_nascimento ? user.data_nascimento.split('T')[0] : ''
  })

  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    senha_atual: '',
    nova_senha: '',
    confirmar_senha: ''
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      // Upload avatar if selected
      let avatarUrl = user?.foto

      if (selectedAvatar) {
        const formData = new FormData()
        formData.append('file', selectedAvatar)
        formData.append('type', 'avatar')

        const uploadResponse = await api.put('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        avatarUrl = uploadResponse.data.url
      }

      return await api.put('/users/profile', {
        ...data,
        ...(avatarUrl && { foto: avatarUrl })
      })
    },
    onSuccess: (response) => {
      updateUser(response.data)
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast.success('Perfil atualizado com sucesso!')
      setIsEditing(false)
      setSelectedAvatar(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar perfil')
    }
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      return await api.put('/users/change-password', {
        senha_atual: data.senha_atual,
        nova_senha: data.nova_senha
      })
    },
    onSuccess: () => {
      toast.success('Senha alterada com sucesso!')
      setIsChangingPassword(false)
      setPasswordData({
        senha_atual: '',
        nova_senha: '',
        confirmar_senha: ''
      })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao alterar senha')
    }
  })

  const handleProfileSave = () => {
    updateProfileMutation.mutate(profileData)
  }

  const handlePasswordChange = () => {
    if (passwordData.nova_senha !== passwordData.confirmar_senha) {
      toast.error('As senhas não coincidem')
      return
    }

    if (passwordData.nova_senha.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres')
      return
    }

    changePasswordMutation.mutate(passwordData)
  }

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedAvatar(file)
    }
  }

  const getAvatarPreview = () => {
    if (selectedAvatar) {
      return URL.createObjectURL(selectedAvatar)
    }
    return user?.foto || '/api/placeholder/150/150'
  }

  const getUserRole = () => {
    switch (user?.tipo) {
      case 'admin':
        return 'Administrador'
      case 'professor':
        return 'Professor'
      case 'responsavel':
        return 'Responsável'
      default:
        return 'Usuário'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600 mt-1">
            Gerencie suas informações pessoais e configurações de conta
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="relative inline-block mb-4">
              <img
                src={getAvatarPreview()}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              {isEditing && (
                <div className="absolute bottom-2 right-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors shadow-lg"
                  >
                    <Camera className="w-5 h-5" />
                  </label>
                </div>
              )}
            </div>

            <h2 className="text-xl font-semibold text-gray-900">{user?.nome}</h2>
            <p className="text-gray-600 mb-4">{getUserRole()}</p>

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-6">
              <Shield className="w-4 h-4" />
              <span>Membro desde {new Date(user?.created_at || '').toLocaleDateString('pt-BR')}</span>
            </div>

            <div className="space-y-3 text-left">
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{user?.email}</span>
              </div>
              {user?.telefone && (
                <div className="flex items-center space-x-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{user.telefone}</span>
                </div>
              )}
              {user?.endereco && (
                <div className="flex items-center space-x-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{user.endereco}</span>
                </div>
              )}
              {user?.data_nascimento && (
                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {new Date(user.data_nascimento).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Informações Pessoais</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setSelectedAvatar(null)
                      setProfileData({
                        nome: user?.nome || '',
                        email: user?.email || '',
                        telefone: user?.telefone || '',
                        endereco: user?.endereco || '',
                        data_nascimento: user?.data_nascimento ? user.data_nascimento.split('T')[0] : ''
                      })
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleProfileSave}
                    disabled={updateProfileMutation.isPending}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{updateProfileMutation.isPending ? 'Salvando...' : 'Salvar'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={profileData.nome}
                  onChange={(e) => setProfileData({ ...profileData, nome: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={profileData.telefone}
                  onChange={(e) => setProfileData({ ...profileData, telefone: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={profileData.data_nascimento}
                  onChange={(e) => setProfileData({ ...profileData, data_nascimento: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço
              </label>
              <textarea
                value={profileData.endereco}
                onChange={(e) => setProfileData({ ...profileData, endereco: e.target.value })}
                disabled={!isEditing}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Segurança</h3>
              {!isChangingPassword ? (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  <span>Alterar Senha</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setIsChangingPassword(false)
                      setPasswordData({
                        senha_atual: '',
                        nova_senha: '',
                        confirmar_senha: ''
                      })
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    disabled={changePasswordMutation.isPending}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{changePasswordMutation.isPending ? 'Alterando...' : 'Alterar'}</span>
                  </button>
                </div>
              )}
            </div>

            {isChangingPassword ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha Atual
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.senha_atual}
                      onChange={(e) => setPasswordData({ ...passwordData, senha_atual: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.nova_senha}
                      onChange={(e) => setPasswordData({ ...passwordData, nova_senha: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmar_senha}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmar_senha: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-600">
                <p>Para manter sua conta segura, altere sua senha regularmente.</p>
                <p className="text-sm mt-2">Última alteração: Há 2 meses</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage