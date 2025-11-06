import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  Calendar,
  User,
  Filter,
  Download,
  Eye,
  UserCheck,
  AlertCircle,
  CheckCircle,
  X,
  Copy,
  Key
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

interface Professor {
  id: number
  nome: string
  email: string
  telefone: string
  disciplinas: string[]
  data_contratacao: string
  status: 'ativo' | 'inativo' | 'afastado'
  turmas_responsavel: number
  created_at: string
  updated_at: string
}

interface TeacherFormData {
  nome: string
  email: string
  telefone: string
  disciplinas: string[]
  data_contratacao: string
  status: 'ativo' | 'inativo' | 'afastado'
}

const TeachersPage: React.FC = () => {
  const { user } = useAuth()
  const [professors, setProfessors] = useState<Professor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'inativo' | 'afastado'>('todos')
  const [showModal, setShowModal] = useState(false)
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null)
  const [showCredentialsModal, setShowCredentialsModal] = useState(false)
  const [credentials, setCredentials] = useState<{ email: string; senha: string }>({ email: '', senha: '' })
  const [formData, setFormData] = useState<TeacherFormData>({
    nome: '',
    email: '',
    telefone: '',
    disciplinas: [],
    data_contratacao: new Date().toISOString().split('T')[0],
    status: 'ativo'
  })

  const disciplinasDisponiveis = [
    'Matemática',
    'Português',
    'História',
    'Geografia',
    'Ciências',
    'Biologia',
    'Física',
    'Química',
    'Inglês',
    'Educação Física',
    'Arte',
    'Música',
    'Filosofia',
    'Sociologia',
    'Empreendedorismo',
    'Ensino Religioso'
  ]

  useEffect(() => {
    loadProfessors()
  }, [])

  const loadProfessors = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:4600/api/professores')
      const data = await response.json()

      if (data.success) {
        setProfessors(data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar professores:', error)
      toast.error('Erro ao carregar lista de professores')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfessor = async () => {
    try {
      if (!formData.nome || !formData.email) {
        toast.error('Nome e e-mail são obrigatórios')
        return
      }

      const url = editingProfessor
        ? `http://localhost:4600/api/professores/${editingProfessor.id}`
        : 'http://localhost:4600/api/professores'

      const method = editingProfessor ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || 'Operação realizada com sucesso!')
        setShowModal(false)
        resetForm()
        loadProfessors()

        // Se foi criado um novo professor e um usuário foi criado, mostrar credenciais
        if (!editingProfessor && data.usuarioCriado && data.senhaGerada) {
          setCredentials({
            email: formData.email,
            senha: data.senhaGerada
          })
          setShowCredentialsModal(true)
        }
      } else {
        toast.error(data.message || 'Erro ao salvar professor')
      }
    } catch (error) {
      console.error('Erro ao salvar professor:', error)
      toast.error('Erro ao salvar professor')
    }
  }

  const handleDeleteProfessor = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este professor?')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:4600/api/professores/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Professor excluído com sucesso!')
        loadProfessors()
      } else {
        toast.error(data.message || 'Erro ao excluir professor')
      }
    } catch (error) {
      console.error('Erro ao excluir professor:', error)
      toast.error('Erro ao excluir professor')
    }
  }

  const handleEditProfessor = (professor: Professor) => {
    setEditingProfessor(professor)
    setFormData({
      nome: professor.nome,
      email: professor.email,
      telefone: professor.telefone,
      disciplinas: professor.disciplinas,
      data_contratacao: professor.data_contratacao,
      status: professor.status
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      disciplinas: [],
      data_contratacao: new Date().toISOString().split('T')[0],
      status: 'ativo'
    })
    setEditingProfessor(null)
  }

  const handleDisciplinaToggle = (disciplina: string) => {
    setFormData(prev => ({
      ...prev,
      disciplinas: prev.disciplinas.includes(disciplina)
        ? prev.disciplinas.filter(d => d !== disciplina)
        : [...prev.disciplinas, disciplina]
    }))
  }

  const filteredProfessors = professors.filter(professor => {
    const matchesSearch = professor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         professor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         professor.disciplinas.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'todos' || professor.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800'
      case 'inativo': return 'bg-red-100 text-red-800'
      case 'afastado': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativo': return <CheckCircle className="w-3 h-3" />
      case 'inativo': return <X className="w-3 h-3" />
      case 'afastado': return <AlertCircle className="w-3 h-3" />
      default: return <User className="w-3 h-3" />
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Professores</h1>
          <p className="text-gray-600 mt-1">
            Gerencie o corpo docente da escola
          </p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Professor</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou disciplina..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todos">Todos os Status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="afastado">Afastado</option>
              </select>
            </div>

            <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{professors.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {professors.filter(p => p.status === 'ativo').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Afastados</p>
              <p className="text-2xl font-bold text-gray-900">
                {professors.filter(p => p.status === 'afastado').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Disciplinas</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(professors.flatMap(p => p.disciplinas)).size}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Professors List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Lista de Professores ({filteredProfessors.length})
          </h2>
        </div>

        {filteredProfessors.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'todos' ? 'Nenhum professor encontrado' : 'Nenhum professor cadastrado'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'todos'
                ? 'Tente ajustar os filtros de pesquisa.'
                : 'Comece adicionando o primeiro professor da escola.'
              }
            </p>
            {!searchTerm && statusFilter === 'todos' && (
              <button
                onClick={() => {
                  resetForm()
                  setShowModal(true)
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Adicionar Professor
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredProfessors.map((professor, index) => (
              <motion.div
                key={professor.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">{professor.nome}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(professor.status)}`}>
                          {getStatusIcon(professor.status)}
                          <span className="ml-1 capitalize">{professor.status}</span>
                        </span>
                      </div>

                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {professor.email}
                        </span>
                        <span className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {professor.telefone}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Desde {new Date(professor.data_contratacao).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {professor.disciplinas.slice(0, 3).map((disciplina, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800"
                          >
                            <GraduationCap className="w-3 h-3 mr-1" />
                            {disciplina}
                          </span>
                        ))}
                        {professor.disciplinas.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                            +{professor.disciplinas.length - 3} mais
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditProfessor(professor)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Editar professor"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProfessor(professor.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Excluir professor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Add/Edit Professor */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {editingProfessor ? 'Editar Professor' : 'Novo Professor'}
              </h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Digite o nome completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="professor@escola.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Contratação
                    </label>
                    <input
                      type="date"
                      value={formData.data_contratacao}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_contratacao: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                      <option value="afastado">Afastado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disciplinas que Leciona
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-3 border border-gray-300 rounded-lg">
                    {disciplinasDisponiveis.map((disciplina) => (
                      <label key={disciplina} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.disciplinas.includes(disciplina)}
                          onChange={() => handleDisciplinaToggle(disciplina)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{disciplina}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Selecione as disciplinas que o professor pode lecionar
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProfessor}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingProfessor ? 'Atualizar' : 'Adicionar'} Professor
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Credenciais */}
      <AnimatePresence>
        {showCredentialsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCredentialsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-8 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Usuário Criado com Sucesso!
                </h3>
                <p className="text-gray-600">
                  As credenciais de acesso ao sistema foram geradas automaticamente.
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    Email de Acesso
                  </label>
                  <div className="flex items-center justify-between bg-white rounded px-3 py-2 border border-blue-300">
                    <span className="text-gray-900 font-mono text-sm">{credentials.email}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(credentials.email)
                        toast.success('Email copiado!')
                      }}
                      className="text-blue-600 hover:text-blue-700 ml-2"
                      title="Copiar email"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-green-900 mb-2">
                    Senha Temporária
                  </label>
                  <div className="flex items-center justify-between bg-white rounded px-3 py-2 border border-green-300">
                    <span className="text-gray-900 font-mono text-sm font-bold">{credentials.senha}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(credentials.senha)
                        toast.success('Senha copiada!')
                      }}
                      className="text-green-600 hover:text-green-700 ml-2"
                      title="Copiar senha"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Guarde estas credenciais em local seguro.
                  O professor deverá alterar a senha no primeiro acesso ao sistema.
                </p>
              </div>

              <button
                onClick={() => setShowCredentialsModal(false)}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Entendi
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TeachersPage