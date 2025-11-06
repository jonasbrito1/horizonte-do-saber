import React, { useState, useRef, useEffect } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  Menu,
  X,
  Home,
  Users,
  BookOpen,
  Settings,
  LogOut,
  FileText,
  BarChart3,
  GraduationCap,
  User,
  Bell,
  UserPlus,
  DollarSign,
  Code,
  Camera,
  Lock,
  Edit,
  ChevronDown,
  HelpCircle,
} from 'lucide-react'
import ProfileEditModal from '../components/ProfileEditModal'
import SupportChatModal from '../components/SupportChatModal'
import profileService from '../services/profileService'

type ProfileTab = 'dados' | 'foto' | 'senha';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [initialTab, setInitialTab] = useState<ProfileTab>('dados')
  const [supportModalOpen, setSupportModalOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleProfileUpdated = (updatedUser: any) => {
    updateUser(updatedUser)
  }

  const openProfileModal = (tab: ProfileTab) => {
    setInitialTab(tab)
    setProfileModalOpen(true)
    setProfileDropdownOpen(false)
  }

  const handleOpenSupport = () => {
    setSupportModalOpen(true)
    setProfileDropdownOpen(false)
  }

  // Menu para professores
  const professorNavigation = [
    { name: 'Minha Visão Geral', href: '/dashboard/professor-dashboard', icon: Home },
  ]

  // Menu para responsáveis
  const responsavelNavigation = [
    { name: 'Minha Visão Geral', href: '/dashboard/responsavel-dashboard', icon: Home },
  ]

  // Menu para administradores e outros usuários
  const navigation = [
    { name: 'Visão Geral', href: '/dashboard', icon: Home },
    { name: 'Alunos', href: '/dashboard/alunos', icon: Users },
    { name: 'Professores', href: '/dashboard/professores', icon: GraduationCap },
    { name: 'Turmas', href: '/dashboard/turmas', icon: BookOpen },
    { name: 'Financeiro', href: '/dashboard/financeiro', icon: DollarSign },
    { name: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart3 },
    { name: 'Gerenciar Conteúdo', href: '/gerenciar-conteudo', icon: FileText },
  ]

  // Menu adicional apenas para administradores
  const adminNavigation = [
    { name: 'Usuários', href: '/dashboard/usuarios', icon: UserPlus },
    { name: 'Tarefas Dev', href: '/dashboard/devtasks', icon: Code },
    { name: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
  ]

  // Filtrar navegação baseada no tipo de usuário
  const getNavigationItems = () => {
    if (user?.tipo === 'professor') {
      return professorNavigation
    }
    if (user?.tipo === 'responsavel') {
      return responsavelNavigation
    }
    if (user?.tipo === 'admin') {
      return [...navigation, ...adminNavigation]
    }
    return navigation
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:hidden"
            >
              <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">H</span>
                  </div>
                  <span className="font-bold text-lg text-gray-900">
                    {user?.tipo === 'professor' ? 'Professor' : user?.tipo === 'responsavel' ? 'Responsável' : 'Admin'}
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="mt-4 px-4 space-y-2">
                {getNavigationItems().map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sair</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 shadow-lg">
          <div className="flex h-16 shrink-0 items-center border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="font-bold text-lg text-gray-900">
                {user?.tipo === 'professor' ? 'Horizonte Professor' : user?.tipo === 'responsavel' ? 'Horizonte Responsável' : 'Horizonte Admin'}
              </span>
            </div>
          </div>

          <nav className="flex flex-1 flex-col space-y-2">
            {getNavigationItems().map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="border-t border-gray-200 pt-4 pb-4">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-gray-200 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-gray-900">
                {navigation.find(item => item.href === location.pathname)?.name || 'Visão Geral'}
              </h1>
            </div>

            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <button className="p-2.5 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
              </button>

              {/* Separator */}
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

              {/* Profile dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.foto_perfil ? (
                      <img
                        src={profileService.getPhotoUrl(user.foto_perfil)}
                        alt={user.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.nome}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.tipo}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500 hidden lg:block" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                    >
                      <button
                        onClick={() => openProfileModal('dados')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Edit className="w-4 h-4 mr-3 text-gray-500" />
                        Editar Perfil
                      </button>

                      <button
                        onClick={() => openProfileModal('foto')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Camera className="w-4 h-4 mr-3 text-gray-500" />
                        Inserir Foto
                      </button>

                      <button
                        onClick={() => openProfileModal('senha')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Lock className="w-4 h-4 mr-3 text-gray-500" />
                        Alterar Senha
                      </button>

                      {/* Opção de suporte apenas para professores */}
                      {user?.tipo === 'professor' && (
                        <>
                          <div className="border-t border-gray-200 my-1" />
                          <button
                            onClick={handleOpenSupport}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <HelpCircle className="w-4 h-4 mr-3 text-blue-500" />
                            Abrir Chamado com Suporte
                          </button>
                        </>
                      )}

                      {/* Separador antes do Sair */}
                      <div className="border-t border-gray-200 my-1" />

                      {/* Botão Sair */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sair
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main>
          <Outlet />
        </main>
      </div>

      {/* Profile Edit Modal */}
      {user && (
        <ProfileEditModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          user={user}
          onProfileUpdated={handleProfileUpdated}
          initialTab={initialTab}
        />
      )}

      {/* Support Chat Modal */}
      <SupportChatModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
      />
    </div>
  )
}

export default DashboardLayout
