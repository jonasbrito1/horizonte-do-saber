import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AlertCircle, Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredLevel?: 'administrador' | 'professor' | 'responsavel'
  requireAuth?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredLevel,
  requireAuth = true
}) => {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if authentication is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check if user has required access level
  if (requiredLevel && user && user.nivel !== requiredLevel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para acessar esta página.
            {requiredLevel === 'administrador' && ' Apenas administradores podem acessar esta área.'}
            {requiredLevel === 'professor' && ' Apenas professores podem acessar esta área.'}
            {requiredLevel === 'responsavel' && ' Apenas responsáveis podem acessar esta área.'}
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Seu nível de acesso: <span className="font-medium capitalize">{user?.nivel}</span>
            </p>
            <p className="text-sm text-gray-500">
              Nível necessário: <span className="font-medium capitalize">{requiredLevel}</span>
            </p>
          </div>
          <div className="mt-6 space-x-3">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Voltar
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Ir para Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute