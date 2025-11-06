import React, { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  UserPlus,
  Download,
  Upload,
  Mail,
  Phone,
  Calendar,
  MapPin,
  UserX
} from 'lucide-react'
import toast from 'react-hot-toast'
import { alunoService, turmaService, responsavelService, type Aluno, type Turma } from '../../services/alunoService'
import { normalizeTurmaName, SERIES_SUGESTOES } from '../../utils/ordinalNumbers'
import StudentFormModal from './StudentFormModal'

const StudentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [turmaFilter, setTurmaFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showNewStudentModal, setShowNewStudentModal] = useState(false)
  const [showEditStudentModal, setShowEditStudentModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Aluno | null>(null)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [students, setStudents] = useState<Aluno[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data from API
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [studentsData, turmasData] = await Promise.all([
        alunoService.getAllAlunos(),
        turmaService.getAllTurmas()
      ])

      setStudents(studentsData)
      setTurmas(turmasData)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados. Usando dados mock para demonstração.')
      // Em caso de erro, usar alguns dados básicos mock para demonstração
      setStudents([])
      setTurmas([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filter and paginate students based on current filters
  const filteredStudents = useMemo(() => {
    let filtered = students

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(student =>
        student.nome.toLowerCase().includes(search) ||
        student.matricula.toLowerCase().includes(search) ||
        student.email?.toLowerCase().includes(search)
      )
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(student => student.status === statusFilter)
    }

    // Apply class filter
    if (turmaFilter) {
      filtered = filtered.filter(student => student.turma_id?.toString() === turmaFilter)
    }

    return filtered
  }, [students, searchTerm, statusFilter, turmaFilter])

  // Paginate results
  const studentsData = useMemo(() => {
    const limit = 20
    const startIndex = (currentPage - 1) * limit
    const endIndex = startIndex + limit
    const paginatedStudents = filteredStudents.slice(startIndex, endIndex)

    return {
      students: paginatedStudents,
      pagination: {
        page: currentPage,
        limit,
        total: filteredStudents.length,
        pages: Math.ceil(filteredStudents.length / limit)
      }
    }
  }, [filteredStudents, currentPage])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const handleInactivateStudent = async (student: Aluno) => {
    if (window.confirm(`Tem certeza que deseja inativar o aluno ${student.nome}?\n\nO aluno será marcado como inativo mas seus dados serão mantidos no sistema.`)) {
      try {
        await alunoService.updateAluno(student.id, { status: 'inativo' })
        toast.success('Aluno inativado com sucesso')
        await loadData()
      } catch (error: any) {
        console.error('Erro ao inativar aluno:', error)
        toast.error(error.message || 'Erro ao inativar aluno')
      }
    }
  }

  const handleDeleteStudent = async (student: Aluno) => {
    if (window.confirm(`⚠️ ATENÇÃO: Tem certeza que deseja EXCLUIR PERMANENTEMENTE o aluno ${student.nome}?\n\nEsta ação NÃO PODE ser desfeita! Todos os dados do aluno serão removidos do sistema.\n\nClique em OK para confirmar a exclusão.`)) {
      try {
        await alunoService.deleteAluno(student.id)
        toast.success('Aluno excluído permanentemente')
        await loadData()
      } catch (error: any) {
        console.error('Erro ao excluir aluno:', error)
        toast.error(error.message || 'Erro ao excluir aluno')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800'
      case 'inativo': return 'bg-red-100 text-red-800'
      case 'transferido': return 'bg-yellow-100 text-yellow-800'
      case 'formado': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">{error}</p>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="w-8 h-8 mr-3 text-primary-600" />
            Gestão de Alunos
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie informações dos alunos matriculados
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex gap-3"
        >
          <button 
            onClick={() => setShowNewStudentModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Aluno
          </button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome, matrícula ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="min-w-[200px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="transferido">Transferido</option>
              <option value="formado">Formado</option>
            </select>
          </div>

          {/* Class Filter */}
          <div className="min-w-[200px]">
            <select
              value={turmaFilter}
              onChange={(e) => setTurmaFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todas as turmas</option>
              {turmas.map((turma) => (
                <option key={turma.id} value={turma.id}>
                  {normalizeTurmaName(turma.nome)}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtrar
          </button>
        </form>
      </motion.div>

      {/* Students Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {[
          {
            title: 'Total de Alunos',
            value: students.length,
            color: 'bg-blue-500',
            icon: Users
          },
          {
            title: 'Alunos Ativos',
            value: students.filter(s => s.status === 'ativo').length,
            color: 'bg-green-500',
            icon: Users
          },
          {
            title: 'Novos este Mês',
            value: students.filter(s => {
              const createdThisMonth = new Date(s.created_at).getMonth() === new Date().getMonth() &&
                                     new Date(s.created_at).getFullYear() === new Date().getFullYear()
              return createdThisMonth
            }).length,
            color: 'bg-purple-500',
            icon: UserPlus
          },
          {
            title: 'Transferidos',
            value: students.filter(s => s.status === 'transferido').length,
            color: 'bg-yellow-500',
            icon: Users
          }
        ].map((stat, index) => (
          <div key={stat.title} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Students Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-lg shadow-lg overflow-hidden"
      >
        {studentsData.students && studentsData.students.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aluno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Matrícula / CPF
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Turma / Série
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentsData.students.map((student, index) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        onClick={() => {
                          setSelectedStudent(student)
                          setShowStudentModal(true)
                        }}
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.nome}</div>
                            <div className="text-sm text-gray-500">
                              {calculateAge(student.data_nascimento)} anos
                            </div>
                          </div>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        onClick={() => {
                          setSelectedStudent(student)
                          setShowStudentModal(true)
                        }}
                      >
                        <div className="text-sm text-gray-900 font-medium">{student.numero_matricula || student.matricula}</div>
                        {student.cpf && (
                          <div className="text-sm text-gray-500">
                            CPF: {student.cpf}
                          </div>
                        )}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        onClick={() => {
                          setSelectedStudent(student)
                          setShowStudentModal(true)
                        }}
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {student.serie_atual ? normalizeTurmaName(student.serie_atual) : 'Não definida'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.turno ? student.turno.charAt(0).toUpperCase() + student.turno.slice(1) : 'Sem turno'}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        onClick={() => {
                          setSelectedStudent(student)
                          setShowStudentModal(true)
                        }}
                      >
                        <div>
                          {student.telefone_responsavel ? (
                            <>
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {student.telefone_responsavel}
                              </div>
                              {(student.nome_mae || student.nome_pai) && (
                                <div className="text-sm text-gray-500">
                                  {student.nome_mae || student.nome_pai}
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">Sem contato</span>
                          )}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        onClick={() => {
                          setSelectedStudent(student)
                          setShowStudentModal(true)
                        }}
                      >
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)}`}>
                          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedStudent(student)
                              setShowStudentModal(true)
                            }}
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 transform hover:scale-110"
                            title="Ver detalhes"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedStudent(student)
                              setShowEditStudentModal(true)
                            }}
                            className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 transition-all duration-200 transform hover:scale-110"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleInactivateStudent(student)
                            }}
                            className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 transition-all duration-200 transform hover:scale-110"
                            title="Inativar (desativar aluno)"
                          >
                            <UserX className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteStudent(student)
                            }}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all duration-200 transform hover:scale-110"
                            title="Excluir permanentemente"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {studentsData.pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(studentsData.pagination.pages, currentPage + 1))}
                    disabled={currentPage === studentsData.pagination.pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Próximo
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando <span className="font-medium">{((currentPage - 1) * 20) + 1}</span> a{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * 20, studentsData.pagination.total)}
                      </span> de{' '}
                      <span className="font-medium">{studentsData.pagination.total}</span> resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: studentsData.pagination.pages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum aluno encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter || turmaFilter
                ? 'Tente ajustar os filtros de busca'
                : 'Comece adicionando um novo aluno'}
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowNewStudentModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <UserPlus className="-ml-1 mr-2 h-5 w-5" />
                Novo Aluno
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Student Detail Modal */}
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowStudentModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                <h3 className="text-2xl font-bold text-gray-900">Detalhes Completos do Aluno</h3>
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6 space-y-8">
                {/* Seção 1: Identificação */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Identificação
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nome Completo</label>
                      <p className="text-gray-900 font-medium">{selectedStudent.nome || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Matrícula</label>
                      <p className="text-gray-900 font-medium">{selectedStudent.numero_matricula || selectedStudent.matricula || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Data de Nascimento</label>
                      <p className="text-gray-900">{selectedStudent.data_nascimento ? new Date(selectedStudent.data_nascimento).toLocaleDateString('pt-BR') : '-'} ({calculateAge(selectedStudent.data_nascimento)} anos)</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">CPF</label>
                      <p className="text-gray-900">{selectedStudent.cpf || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">RG</label>
                      <p className="text-gray-900">{selectedStudent.rg || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedStudent.status)}`}>
                        {selectedStudent.status?.charAt(0).toUpperCase() + selectedStudent.status?.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Seção 2: Endereço */}
                <div className="bg-green-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Endereço
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Rua</label>
                      <p className="text-gray-900">{selectedStudent.endereco_rua || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Número</label>
                      <p className="text-gray-900">{selectedStudent.endereco_numero || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Bairro</label>
                      <p className="text-gray-900">{selectedStudent.endereco_bairro || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Cidade</label>
                      <p className="text-gray-900">{selectedStudent.endereco_cidade || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Estado</label>
                      <p className="text-gray-900">{selectedStudent.endereco_estado || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">CEP</label>
                      <p className="text-gray-900">{selectedStudent.endereco_cep || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Seção 3: Responsáveis */}
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Responsáveis e Contatos
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nome da Mãe</label>
                      <p className="text-gray-900">{selectedStudent.nome_mae || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Telefone da Mãe</label>
                      <p className="text-gray-900">{selectedStudent.telefone_mae || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nome do Pai</label>
                      <p className="text-gray-900">{selectedStudent.nome_pai || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Telefone Responsável</label>
                      <p className="text-gray-900">{selectedStudent.telefone_responsavel || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email Responsável</label>
                      <p className="text-gray-900">{selectedStudent.email_responsavel || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Outro Contato</label>
                      <p className="text-gray-900">{selectedStudent.nome_outro_contato || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Telefone Outro</label>
                      <p className="text-gray-900">{selectedStudent.telefone_outro || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Telefone Emergência</label>
                      <p className="text-gray-900 font-semibold text-red-600">{selectedStudent.telefone_emergencia || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Mora Com</label>
                      <p className="text-gray-900">{selectedStudent.mora_com || '-'}</p>
                    </div>
                    {selectedStudent.mora_com === 'outros' && selectedStudent.mora_com_outros_desc && (
                      <div className="md:col-span-3">
                        <label className="text-sm font-medium text-gray-600">Descrição de com quem mora</label>
                        <p className="text-gray-900">{selectedStudent.mora_com_outros_desc}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Seção 4: Informações de Saúde */}
                <div className="bg-red-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Informações de Saúde
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Tipo Sanguíneo</label>
                      <p className="text-gray-900">{selectedStudent.tipo_sanguineo || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Alergias</label>
                      <p className="text-gray-900">{selectedStudent.alergias || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Restrição Alimentar</label>
                      <p className="text-gray-900">{selectedStudent.restricao_alimentar || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Restrição Remédio</label>
                      <p className="text-gray-900">{selectedStudent.restricao_remedio || '-'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600">Remédio de Uso Contínuo</label>
                      <p className="text-gray-900">{selectedStudent.remedio_uso_continuo || '-'}</p>
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-sm font-medium text-gray-600">Doença Grave / Histórico</label>
                      <p className="text-gray-900">{selectedStudent.doenca_grave || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Seção 5: Informações Acadêmicas */}
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Informações Acadêmicas
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Série Atual</label>
                      <p className="text-gray-900">{selectedStudent.serie_atual ? normalizeTurmaName(selectedStudent.serie_atual) : '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Turno</label>
                      <p className="text-gray-900">{selectedStudent.turno ? selectedStudent.turno.charAt(0).toUpperCase() + selectedStudent.turno.slice(1) : '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Data Matrícula</label>
                      <p className="text-gray-900">{selectedStudent.data_matricula ? new Date(selectedStudent.data_matricula).toLocaleDateString('pt-BR') : '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Seção 6: Informações Sociais */}
                <div className="bg-indigo-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Informações Sociais
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Possui Condução</label>
                      <p className="text-gray-900">{selectedStudent.possui_conducao ? 'Sim' : 'Não'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Religião</label>
                      <p className="text-gray-900">{selectedStudent.religiao || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Recebe Bolsa Família</label>
                      <p className="text-gray-900">{selectedStudent.recebe_bolsa_familia ? 'Sim' : 'Não'}</p>
                    </div>
                    {selectedStudent.recebe_bolsa_familia && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Número NIS</label>
                        <p className="text-gray-900">{selectedStudent.numero_nis || '-'}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Seção 7: Observações */}
                {(selectedStudent.observacoes || selectedStudent.informacoes_adicionais) && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Observações e Informações Adicionais</h4>
                    {selectedStudent.observacoes && (
                      <div className="mb-4">
                        <label className="text-sm font-medium text-gray-600">Observações</label>
                        <p className="text-gray-900 whitespace-pre-wrap">{selectedStudent.observacoes}</p>
                      </div>
                    )}
                    {selectedStudent.informacoes_adicionais && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Informações Adicionais</label>
                        <p className="text-gray-900 whitespace-pre-wrap">{selectedStudent.informacoes_adicionais}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    setShowStudentModal(false)
                    setShowEditStudentModal(true)
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New/Edit Student Modal */}
      <StudentFormModal
        isOpen={showNewStudentModal}
        onClose={() => setShowNewStudentModal(false)}
        onSuccess={loadData}
        turmas={turmas}
      />

      <StudentFormModal
        isOpen={showEditStudentModal}
        onClose={() => {
          setShowEditStudentModal(false)
          setSelectedStudent(null)
        }}
        onSuccess={loadData}
        turmas={turmas}
        student={selectedStudent}
      />
    </div>
  )
}

export default StudentsPage