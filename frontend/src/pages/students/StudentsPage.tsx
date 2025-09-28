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
  MapPin
} from 'lucide-react'
import toast from 'react-hot-toast'
import { alunoService, turmaService, responsavelService, type Aluno, type Turma } from '../../services/alunoService'
import { normalizeTurmaName, SERIES_SUGESTOES } from '../../utils/ordinalNumbers'

const StudentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [turmaFilter, setTurmaFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showNewStudentModal, setShowNewStudentModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Aluno | null>(null)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [students, setStudents] = useState<Aluno[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data from API
  useEffect(() => {
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

  const handleDeleteStudent = (student: Aluno) => {
    if (window.confirm(`Tem certeza que deseja inativar o aluno ${student.nome}?`)) {
      // In real app, this would call the API to update status
      toast.success('Aluno inativado com sucesso')
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
                      Matrícula
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Turma
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Responsável
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
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
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
                              {student.email && (
                                <span className="ml-2 flex items-center">
                                  <Mail className="w-3 h-3 mr-1" />
                                  {student.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.matricula}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(student.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.turma_id ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {normalizeTurmaName(turmas.find(t => t.id === student.turma_id)?.nome || 'N/A')}
                            </div>
                            <div className="text-sm text-gray-500">
                              {normalizeTurmaName(turmas.find(t => t.id === student.turma_id)?.serie || '')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Sem turma</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.responsavel_id ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">Responsável ID: {student.responsavel_id}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {student.telefone || 'N/A'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Sem responsável</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)}`}>
                          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedStudent(student)
                              setShowStudentModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Inativar"
                          >
                            <Trash2 className="w-4 h-4" />
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
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowStudentModal(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Detalhes do Aluno</h3>
                  <button
                    onClick={() => setShowStudentModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Foto e informações básicas */}
                  <div className="text-center">
                    <div className="h-32 w-32 rounded-full bg-primary-100 flex items-center justify-center mx-auto">
                      <Users className="h-16 w-16 text-primary-600" />
                    </div>
                    <h4 className="mt-4 text-xl font-semibold text-gray-900">{selectedStudent.nome}</h4>
                    <p className="text-gray-600">Matrícula: {selectedStudent.matricula}</p>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-2 ${getStatusColor(selectedStudent.status)}`}>
                      {selectedStudent.status.charAt(0).toUpperCase() + selectedStudent.status.slice(1)}
                    </span>
                  </div>
                  
                  {/* Informações pessoais */}
                  <div>
                    <h5 className="text-lg font-medium text-gray-900 mb-4">Informações Pessoais</h5>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">Idade:</span>
                        <span className="ml-1 font-medium">{calculateAge(selectedStudent.data_nascimento)} anos</span>
                      </div>
                      {selectedStudent.email && (
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-gray-600">Email:</span>
                          <span className="ml-1">{selectedStudent.email}</span>
                        </div>
                      )}
                      {selectedStudent.telefone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-gray-600">Telefone:</span>
                          <span className="ml-1">{selectedStudent.telefone}</span>
                        </div>
                      )}
                      {selectedStudent.endereco && (
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                          <div>
                            <span className="text-gray-600">Endereço:</span>
                            <p className="ml-1">{selectedStudent.endereco}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Responsáveis */}
                  <div>
                    <h5 className="text-lg font-medium text-gray-900 mb-4">Responsável</h5>
                    <div className="space-y-3">
                      {selectedStudent.responsavel_id ? (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm font-medium text-gray-900">ID: {selectedStudent.responsavel_id}</div>
                          <div className="text-xs text-gray-600 mt-1">Responsável Principal</div>
                          {selectedStudent.telefone && (
                            <div className="flex items-center mt-2 text-xs text-gray-600">
                              <Phone className="w-3 h-3 mr-1" />
                              {selectedStudent.telefone}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Sem responsável cadastrado</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Fechar
                </button>
                <button className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 sm:ml-3 sm:w-auto sm:text-sm">
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Student Modal */}
      {showNewStudentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowNewStudentModal(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)

                try {
                  // 1. Primeiro criar o responsável
                  const responsavelData = {
                    nome: formData.get('responsavel_nome') as string,
                    email: formData.get('responsavel_email') as string,
                    telefone: formData.get('responsavel_telefone') as string,
                    cpf: formData.get('responsavel_cpf') as string,
                    endereco: formData.get('responsavel_endereco') as string,
                    parentesco: formData.get('responsavel_parentesco') as 'pai' | 'mae' | 'avo' | 'ava' | 'tio' | 'tia' | 'outro',
                    eh_principal: Boolean(formData.get('responsavel_principal')),
                    observacoes: formData.get('responsavel_observacoes') as string
                  }

                  const responsavelResult = await responsavelService.createResponsavel(responsavelData)

                  // 2. Depois criar o aluno vinculado ao responsável
                  const alunoData = {
                    nome: formData.get('nome') as string,
                    data_nascimento: formData.get('data_nascimento') as string,
                    matricula: formData.get('matricula') as string,
                    email: formData.get('email') as string,
                    telefone: formData.get('telefone') as string,
                    endereco: formData.get('endereco') as string,
                    cpf: formData.get('cpf') as string,
                    turma_id: formData.get('turma_id') ? Number(formData.get('turma_id')) : undefined,
                    responsavel_id: responsavelResult.id, // Vincular ao responsável criado
                    status: 'ativo' as const,
                    observacoes: formData.get('observacoes') as string
                  }

                  await alunoService.createAluno(alunoData)

                  // Mostrar mensagem apropriada baseada na criação do usuário
                  let successMessage = 'Aluno e responsável cadastrados com sucesso!'
                  if (responsavelResult.usuarioCriado) {
                    successMessage += ` Usuário criado automaticamente para o responsável.`
                    if (responsavelResult.senhaGerada) {
                      successMessage += ` Senha de acesso: ${responsavelResult.senhaGerada}`
                    }
                  }

                  toast.success(successMessage, { duration: 8000 })
                  setShowNewStudentModal(false)

                  // 3. Recarregar dados
                  const [studentsData, turmasData] = await Promise.all([
                    alunoService.getAllAlunos(),
                    turmaService.getAllTurmas()
                  ])
                  setStudents(studentsData)
                  setTurmas(turmasData)
                } catch (error: any) {
                  toast.error(error.message || 'Erro ao cadastrar aluno e responsável')
                }
              }}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Cadastrar Novo Aluno</h3>
                    <button
                      type="button"
                      onClick={() => setShowNewStudentModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Nome */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                      <input
                        type="text"
                        name="nome"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Digite o nome completo do aluno"
                      />
                    </div>

                    {/* Data de Nascimento */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento *</label>
                      <input
                        type="date"
                        name="data_nascimento"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    {/* Matrícula */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula *</label>
                      <input
                        type="text"
                        name="matricula"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Ex: ALU001"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="email@exemplo.com"
                      />
                    </div>

                    {/* Telefone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                      <input
                        type="tel"
                        name="telefone"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    {/* CPF */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                      <input
                        type="text"
                        name="cpf"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="000.000.000-00"
                      />
                    </div>

                    {/* Endereço */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                      <input
                        type="text"
                        name="endereco"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Rua, número, bairro"
                      />
                    </div>

                    {/* Turma */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
                      <select
                        name="turma_id"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Selecione uma turma</option>
                        {turmas.map((turma) => (
                          <option key={turma.id} value={turma.id}>
                            {normalizeTurmaName(turma.nome)} - {normalizeTurmaName(turma.serie)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Divisor - Dados do Responsável */}
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-md font-medium text-gray-900 mb-4">📞 Dados do Responsável</h4>
                    </div>

                    {/* Nome do Responsável */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Responsável *</label>
                      <input
                        type="text"
                        name="responsavel_nome"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Nome completo do responsável"
                      />
                    </div>

                    {/* Email do Responsável */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email do Responsável</label>
                      <input
                        type="email"
                        name="responsavel_email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="email@exemplo.com"
                      />
                    </div>

                    {/* Telefone do Responsável */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone do Responsável *</label>
                      <input
                        type="tel"
                        name="responsavel_telefone"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    {/* CPF do Responsável */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CPF do Responsável</label>
                      <input
                        type="text"
                        name="responsavel_cpf"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="000.000.000-00"
                      />
                    </div>

                    {/* Endereço do Responsável */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Endereço do Responsável</label>
                      <input
                        type="text"
                        name="responsavel_endereco"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Rua, número, bairro, cidade"
                      />
                    </div>

                    {/* Parentesco */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parentesco *</label>
                      <select
                        name="responsavel_parentesco"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Selecione o parentesco</option>
                        <option value="pai">Pai</option>
                        <option value="mae">Mãe</option>
                        <option value="avo">Avô</option>
                        <option value="ava">Avó</option>
                        <option value="tio">Tio</option>
                        <option value="tia">Tia</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>

                    {/* Responsável Principal */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="responsavel_principal"
                        id="responsavel_principal"
                        defaultChecked
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="responsavel_principal" className="ml-2 block text-sm text-gray-700">
                        Este é o responsável principal
                      </label>
                    </div>

                    {/* Observações do Responsável */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Observações sobre o Responsável</label>
                      <textarea
                        name="responsavel_observacoes"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Observações sobre o responsável"
                      />
                    </div>

                    {/* Divisor - Observações do Aluno */}
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-md font-medium text-gray-900 mb-4">📝 Observações do Aluno</h4>
                    </div>

                    {/* Observações */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                      <textarea
                        name="observacoes"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Observações adicionais sobre o aluno"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cadastrar Aluno
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewStudentModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentsPage