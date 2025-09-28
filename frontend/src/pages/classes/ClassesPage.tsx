import React, { useState, useEffect } from 'react'
import { Users, Plus, BookOpen, Calendar, Edit, Trash2, Eye, X, Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface Turma {
  id: number
  nome: string
  nivel: string
  serie: string
  turno: 'manha' | 'tarde' | 'noite'
  ano_letivo: string
  capacidade_maxima: number
  status: 'ativo' | 'inativo' | 'concluido'
  professor_responsavel?: {
    id: number
    nome: string
    email: string
  }
  disciplinas: string[]
  alunos_count: number
  observacoes: string
  created_at: string
  updated_at: string
  alunos?: any[]
}

interface TurmaFormData {
  nome: string
  nivel: string
  serie: string
  turno: 'manha' | 'tarde' | 'noite'
  ano_letivo: string
  capacidade_maxima: number
  professor_responsavel_id?: number
  observacoes: string
  status: 'ativo' | 'inativo' | 'concluido'
}

const ClassesPage: React.FC = () => {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showStudentsModal, setShowStudentsModal] = useState(false)
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null)
  const [formData, setFormData] = useState<TurmaFormData>({
    nome: '',
    nivel: '',
    serie: '',
    turno: 'manha',
    ano_letivo: new Date().getFullYear().toString(),
    capacidade_maxima: 25,
    professor_responsavel_id: undefined,
    observacoes: '',
    status: 'ativo'
  })

  // Fetch turmas from backend
  const fetchTurmas = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3008/api/turmas')
      const data = await response.json()
      if (data.success) {
        setTurmas(data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar turmas:', error)
      toast.error('Erro ao carregar turmas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTurmas()
  }, [])

  // Create turma
  const handleCreateTurma = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:3008/api/turmas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Turma criada com sucesso!')
        setShowCreateModal(false)
        fetchTurmas()
        resetForm()
      } else {
        toast.error('Erro ao criar turma')
      }
    } catch (error) {
      console.error('Erro ao criar turma:', error)
      toast.error('Erro ao criar turma')
    }
  }

  // Update turma
  const handleUpdateTurma = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTurma) return
    try {
      const response = await fetch(`http://localhost:3008/api/turmas/${selectedTurma.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Turma atualizada com sucesso!')
        setShowEditModal(false)
        fetchTurmas()
        resetForm()
      } else {
        toast.error('Erro ao atualizar turma')
      }
    } catch (error) {
      console.error('Erro ao atualizar turma:', error)
      toast.error('Erro ao atualizar turma')
    }
  }

  // Delete turma
  const handleDeleteTurma = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta turma?')) return
    try {
      const response = await fetch(`http://localhost:3008/api/turmas/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Turma excluída com sucesso!')
        fetchTurmas()
      } else {
        toast.error('Erro ao excluir turma')
      }
    } catch (error) {
      console.error('Erro ao excluir turma:', error)
      toast.error('Erro ao excluir turma')
    }
  }

  // View students
  const handleViewStudents = async (turma: Turma) => {
    try {
      const response = await fetch(`http://localhost:3008/api/turmas/${turma.id}/alunos`)
      const data = await response.json()
      if (data.success) {
        setSelectedTurma({ ...turma, alunos: data.data })
        setShowStudentsModal(true)
      } else {
        toast.error('Erro ao carregar alunos')
      }
    } catch (error) {
      console.error('Erro ao carregar alunos:', error)
      toast.error('Erro ao carregar alunos')
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      nome: '',
      nivel: '',
      serie: '',
      turno: 'manha',
      ano_letivo: new Date().getFullYear().toString(),
      capacidade_maxima: 25,
      professor_responsavel_id: undefined,
      observacoes: '',
      status: 'ativo'
    })
  }

  // Open edit modal
  const openEditModal = (turma: Turma) => {
    setSelectedTurma(turma)
    setFormData({
      nome: turma.nome,
      nivel: turma.nivel,
      serie: turma.serie,
      turno: turma.turno,
      ano_letivo: turma.ano_letivo,
      capacidade_maxima: turma.capacidade_maxima,
      professor_responsavel_id: turma.professor_responsavel?.id,
      observacoes: turma.observacoes,
      status: turma.status
    })
    setShowEditModal(true)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Turmas</h1>
          <p className="text-gray-600 mt-1">
            Gerencie as turmas e classes da escola
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Turma</span>
        </button>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {turmas.map((classItem) => (
          <div key={classItem.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border">
            {/* Class Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{classItem.nome}</h3>
                    <p className="text-sm text-gray-500">{classItem.nivel} - {classItem.serie}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Ativo
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {classItem.turno === 'manha' ? 'Manhã' : 'Tarde'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  {classItem.alunos_count} / {classItem.capacidade_maxima} alunos
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Ano Letivo: {classItem.ano_letivo}
                </div>
                {classItem.professor_responsavel && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    {classItem.professor_responsavel.nome}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0">
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => openEditModal(classItem)}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleViewStudents(classItem)}
                  className="flex-1 bg-green-50 text-green-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center justify-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>Ver Alunos</span>
                </button>
                <button
                  onClick={() => handleDeleteTurma(classItem.id)}
                  className="bg-red-50 text-red-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          ))}
        </div>
      )}

      {/* Empty state if no classes */}
      {!loading && turmas.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma turma encontrada</h3>
          <p className="text-gray-500 mb-6">Comece criando sua primeira turma</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Nova Turma
          </button>
        </div>
      )}

      {/* Create Turma Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Nova Turma</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateTurma} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome da Turma</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nível</label>
                  <select
                    value={formData.nivel}
                    onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="Fundamental I">Fundamental I</option>
                    <option value="Fundamental II">Fundamental II</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Série</label>
                  <input
                    type="text"
                    value={formData.serie}
                    onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Ex: 1º ano"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Turno</label>
                  <select
                    value={formData.turno}
                    onChange={(e) => setFormData({ ...formData, turno: e.target.value as 'manha' | 'tarde' | 'noite' })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="manha">Manhã</option>
                    <option value="tarde">Tarde</option>
                    <option value="noite">Noite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Ano Letivo</label>
                  <input
                    type="text"
                    value={formData.ano_letivo}
                    onChange={(e) => setFormData({ ...formData, ano_letivo: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Capacidade Máxima</label>
                <input
                  type="number"
                  value={formData.capacidade_maxima}
                  onChange={(e) => setFormData({ ...formData, capacidade_maxima: parseInt(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    resetForm()
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Criar Turma</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Turma Modal */}
      {showEditModal && selectedTurma && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Editar Turma</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedTurma(null)
                  resetForm()
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateTurma} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome da Turma</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nível</label>
                  <select
                    value={formData.nivel}
                    onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="Fundamental I">Fundamental I</option>
                    <option value="Fundamental II">Fundamental II</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Série</label>
                  <input
                    type="text"
                    value={formData.serie}
                    onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Ex: 1º ano"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Turno</label>
                  <select
                    value={formData.turno}
                    onChange={(e) => setFormData({ ...formData, turno: e.target.value as 'manha' | 'tarde' | 'noite' })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="manha">Manhã</option>
                    <option value="tarde">Tarde</option>
                    <option value="noite">Noite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ativo' | 'inativo' | 'concluido' })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="concluido">Concluído</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Capacidade Máxima</label>
                <input
                  type="number"
                  value={formData.capacidade_maxima}
                  onChange={(e) => setFormData({ ...formData, capacidade_maxima: parseInt(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedTurma(null)
                    resetForm()
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Students Modal */}
      {showStudentsModal && selectedTurma && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Alunos - {selectedTurma.nome}</h2>
              <button
                onClick={() => {
                  setShowStudentsModal(false)
                  setSelectedTurma(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Professor:</span> {selectedTurma.professor_responsavel?.nome || 'Não atribuído'}
                </div>
                <div>
                  <span className="font-medium">Turno:</span> {selectedTurma.turno === 'manha' ? 'Manhã' : selectedTurma.turno === 'tarde' ? 'Tarde' : 'Noite'}
                </div>
                <div>
                  <span className="font-medium">Capacidade:</span> {selectedTurma.alunos_count || 0} / {selectedTurma.capacidade_maxima}
                </div>
                <div>
                  <span className="font-medium">Ano Letivo:</span> {selectedTurma.ano_letivo}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Lista de Alunos</h3>
              {selectedTurma.alunos && selectedTurma.alunos.length > 0 ? (
                <div className="space-y-2">
                  {selectedTurma.alunos.map((aluno, index) => (
                    <div key={aluno.id || index} className="p-4 bg-gray-50 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{aluno.nome}</p>
                            <p className="text-sm text-gray-500">{aluno.email}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {aluno.data_nascimento ? new Date(aluno.data_nascimento).toLocaleDateString('pt-BR') : ''}
                        </div>
                      </div>
                      {aluno.responsavel && (
                        <div className="flex items-center space-x-3 mt-2 pt-2 border-t border-gray-200">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <Users className="w-3 h-3 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Responsável:</span> {aluno.responsavel.nome} ({aluno.responsavel.parentesco})
                            </p>
                            <p className="text-xs text-gray-500">
                              {aluno.responsavel.email} • {aluno.responsavel.telefone}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p>Nenhum aluno matriculado nesta turma</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setShowStudentsModal(false)
                  setSelectedTurma(null)
                }}
                className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClassesPage