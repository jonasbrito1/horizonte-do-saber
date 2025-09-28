import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  BookOpen,
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  School,
  BarChart3,
  Plus,
  Eye,
  Edit,
  Filter
} from 'lucide-react'
import toast from 'react-hot-toast'
import { professorService, type DashboardProfessor, type TurmaComAlunos } from '../../services/professorService'
import { normalizeTurmaName } from '../../utils/ordinalNumbers'

interface TeacherDashboardProps {
  professorId: number
  onTurmaSelect?: (turma: TurmaComAlunos) => void
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ professorId, onTurmaSelect }) => {
  const [dashboard, setDashboard] = useState<DashboardProfessor | null>(null)
  const [selectedTurma, setSelectedTurma] = useState<TurmaComAlunos | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    loadDashboard()
  }, [professorId])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const dashboardData = await professorService.getDashboard(professorId)
      setDashboard(dashboardData)
      setError(null)
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err)
      setError('Erro ao carregar dados do professor')
      toast.error('Erro ao carregar dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleTurmaClick = async (turma: TurmaComAlunos) => {
    if (onTurmaSelect) {
      try {
        const turmaDetalhes = await professorService.getTurmaDetalhes(professorId, turma.id)
        onTurmaSelect(turmaDetalhes)
      } catch (err) {
        console.error('Erro ao carregar detalhes da turma:', err)
        toast.error('Erro ao carregar detalhes da turma')
      }
    } else {
      try {
        const turmaDetalhes = await professorService.getTurmaDetalhes(professorId, turma.id)
        setSelectedTurma(turmaDetalhes)
      } catch (err) {
        console.error('Erro ao carregar detalhes da turma:', err)
        toast.error('Erro ao carregar detalhes da turma')
      }
    }
  }

  const filteredTurmas = dashboard?.turmas.filter(turma =>
    turma.nome.toLowerCase().includes(filter.toLowerCase()) ||
    turma.serie.toLowerCase().includes(filter.toLowerCase())
  ) || []

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar dados</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboard}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard do Professor</h1>
          <p className="text-gray-600 mt-2">Gerencie suas turmas, presenças, notas e observações</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <School className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Turmas</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.total_turmas}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Alunos</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.total_alunos}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Presenças Hoje</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.presencas_hoje}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avaliações Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.avaliacoes_pendentes}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filtro e Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filtrar turmas..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={loadDashboard}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Atualizar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Turmas */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Suas Turmas</h2>
            <p className="text-gray-600 mt-1">Clique em uma turma para gerenciar presenças, notas e observações</p>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredTurmas.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <School className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma turma encontrada</h3>
                <p className="text-gray-600">
                  {filter ? 'Nenhuma turma corresponde ao filtro aplicado.' : 'Você ainda não possui turmas atribuídas.'}
                </p>
              </div>
            ) : (
              filteredTurmas.map((turma, index) => (
                <motion.div
                  key={turma.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleTurmaClick(turma)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {normalizeTurmaName(turma.nome)}
                        </h3>
                        <p className="text-gray-600">
                          {normalizeTurmaName(turma.serie)} • {turma.ano_letivo}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Users className="w-3 h-3 mr-1" />
                            {turma.total_alunos} alunos
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {turma.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {turma.presencas_hoje && turma.presencas_hoje.length > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Calendar className="w-3 h-3 mr-1" />
                          Presença registrada
                        </span>
                      )}
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <BarChart3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center mb-4">
              <Calendar className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Registrar Presença</h3>
            </div>
            <p className="text-gray-600 mb-4">Marque a presença dos alunos para o dia de hoje</p>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Iniciar Chamada
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Lançar Notas</h3>
            </div>
            <p className="text-gray-600 mb-4">Adicione notas de provas, trabalhos e atividades</p>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
              Nova Avaliação
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center mb-4">
              <Plus className="w-6 h-6 text-purple-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Observações</h3>
            </div>
            <p className="text-gray-600 mb-4">Registre observações sobre comportamento e aprendizado</p>
            <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Nova Observação
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard