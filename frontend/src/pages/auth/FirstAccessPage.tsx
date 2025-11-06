import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'

const FirstAccessPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmaSenha, setConfirmaSenha] = useState('')
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false)
  const [mostrarConfirmaSenha, setMostrarConfirmaSenha] = useState(false)
  const [loading, setLoading] = useState(false)

  const validarSenha = () => {
    if (novaSenha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return false
    }

    if (novaSenha !== confirmaSenha) {
      toast.error('As senhas não coincidem')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validarSenha()) {
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/auth/change-password-first-access', {
        novaSenha
      })

      if (response.data.success) {
        toast.success('Senha alterada com sucesso! Faça login novamente.')

        // Fazer logout e redirecionar para login
        setTimeout(async () => {
          await logout()
          navigate('/login')
        }, 2000)
      }
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error)
      toast.error(error.response?.data?.message || 'Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  // Validações em tempo real
  const senhaValida = novaSenha.length >= 6
  const senhasConferem = novaSenha === confirmaSenha && confirmaSenha.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Primeiro Acesso
          </h1>
          <p className="text-gray-600">
            Olá, <strong>{user?.nome}</strong>!<br />
            Por segurança, você deve criar uma nova senha.
          </p>
        </div>

        {/* Alert Box */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm text-amber-800 font-medium">Importante</p>
              <p className="text-sm text-amber-700 mt-1">
                Esta é uma senha temporária de primeiro acesso. Crie uma senha forte e única.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nova Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nova Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={mostrarNovaSenha ? 'text' : 'password'}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite sua nova senha"
                required
              />
              <button
                type="button"
                onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrarNovaSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {novaSenha.length > 0 && (
              <div className="mt-2 flex items-center text-sm">
                {senhaValida ? (
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={senhaValida ? 'text-green-600' : 'text-red-600'}>
                  {senhaValida ? 'Senha válida' : 'Mínimo 6 caracteres'}
                </span>
              </div>
            )}
          </div>

          {/* Confirmar Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={mostrarConfirmaSenha ? 'text' : 'password'}
                value={confirmaSenha}
                onChange={(e) => setConfirmaSenha(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirme sua nova senha"
                required
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmaSenha(!mostrarConfirmaSenha)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrarConfirmaSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {confirmaSenha.length > 0 && (
              <div className="mt-2 flex items-center text-sm">
                {senhasConferem ? (
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={senhasConferem ? 'text-green-600' : 'text-red-600'}>
                  {senhasConferem ? 'Senhas conferem' : 'As senhas não conferem'}
                </span>
              </div>
            )}
          </div>

          {/* Dicas de Senha */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">Dicas para uma senha forte:</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Mínimo de 6 caracteres (recomendado 8+)</li>
              <li>• Combine letras maiúsculas e minúsculas</li>
              <li>• Adicione números e símbolos</li>
              <li>• Evite informações pessoais óbvias</li>
            </ul>
          </div>

          {/* Botão Enviar */}
          <button
            type="submit"
            disabled={loading || !senhaValida || !senhasConferem}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Alterando senha...
              </span>
            ) : (
              'Alterar Senha'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Após alterar sua senha, você será redirecionado para a página de login.</p>
        </div>
      </motion.div>
    </div>
  )
}

export default FirstAccessPage
