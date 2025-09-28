import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Calendar,
  FileText,
  MessageSquare,
  CheckCircle,
  XCircle,
  Plus,
  Save,
  ArrowLeft,
  Search,
  Filter,
  Download,
  Upload,
  Clock,
  TrendingUp,
  AlertTriangle,
  Edit,
  Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  professorService,
  type TurmaComAlunos,
  type Presenca,
  type Nota,
  type Observacao,
  type Aluno
} from '../../services/professorService'
import { normalizeTurmaName } from '../../utils/ordinalNumbers'

interface TurmaManagerProps {
  turmaId: number
  professorId: number
  onBack: () => void
}

type TabType = 'presenca' | 'notas' | 'observacoes' | 'relatorio'

const TurmaManager: React.FC<TurmaManagerProps> = ({ turmaId, professorId, onBack }) => {
  const [turma, setTurma] = useState<TurmaComAlunos | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('presenca')
  const [loading, setLoading] = useState(true)
  const [presencas, setPresencas] = useState<Presenca[]>([])
  const [notas, setNotas] = useState<Nota[]>([])
  const [observacoes, setObservacoes] = useState<Observacao[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [searchTerm, setSearchTerm] = useState('')
  const [relatorio, setRelatorio] = useState<any>(null)
  const [loadingRelatorio, setLoadingRelatorio] = useState(false)

  // Estados para modais
  const [showPresencaModal, setShowPresencaModal] = useState(false)
  const [showNotaModal, setShowNotaModal] = useState(false)
  const [showObservacaoModal, setShowObservacaoModal] = useState(false)

  // Estados para formulários
  const [presencaData, setPresencaData] = useState<{[key: number]: {presente: boolean, observacoes: string}}>({})
  const [notaForm, setNotaForm] = useState({
    aluno_id: 0,
    disciplina: 'Matemática',
    tipo_avaliacao: 'Prova',
    valor: 0,
    valor_maximo: 10,
    data_avaliacao: '',
    descricao: '',
    observacoes: ''
  })
  const [observacaoForm, setObservacaoForm] = useState({
    aluno_id: 0,
    tipo: 'academico' as 'comportamento' | 'academico' | 'geral',
    titulo: '',
    descricao: '',
    data: new Date().toISOString().split('T')[0],
    visivel_responsavel: true
  })

  useEffect(() => {
    loadTurmaData()
  }, [turmaId, professorId])

  useEffect(() => {
    if (activeTab === 'presenca') {
      loadPresencas()
    } else if (activeTab === 'notas') {
      loadNotas()
    } else if (activeTab === 'observacoes') {
      loadObservacoes()
    } else if (activeTab === 'relatorio') {
      loadRelatorio()
    }
  }, [activeTab, selectedDate])

  const loadTurmaData = async () => {
    try {
      setLoading(true)
      const turmaData = await professorService.getTurmaDetalhes(professorId, turmaId)
      setTurma(turmaData)

      // Inicializar dados de presença
      const presencaInicial: {[key: number]: {presente: boolean, observacoes: string}} = {}
      turmaData.alunos.forEach(aluno => {
        presencaInicial[aluno.id] = { presente: true, observacoes: '' }
      })
      setPresencaData(presencaInicial)
    } catch (error) {
      console.error('Erro ao carregar turma:', error)
      toast.error('Erro ao carregar dados da turma')
    } finally {
      setLoading(false)
    }
  }

  const loadPresencas = async () => {
    try {
      const presencasData = await professorService.getPresencasPorData(turmaId, selectedDate)
      setPresencas(presencasData)

      // Atualizar estado das presenças
      const presencaUpdate: {[key: number]: {presente: boolean, observacoes: string}} = {}
      presencasData.forEach(presenca => {
        presencaUpdate[presenca.aluno_id] = {
          presente: presenca.presente,
          observacoes: presenca.observacoes || ''
        }
      })
      setPresencaData(prev => ({ ...prev, ...presencaUpdate }))
    } catch (error) {
      console.error('Erro ao carregar presenças:', error)
    }
  }

  const loadNotas = async () => {
    try {
      const notasData = await professorService.getNotasPorTurma(turmaId)
      setNotas(notasData)
    } catch (error) {
      console.error('Erro ao carregar notas:', error)
    }
  }

  const loadObservacoes = async () => {
    try {
      const observacoesData = await professorService.getObservacoesPorTurma(turmaId)
      setObservacoes(observacoesData)
    } catch (error) {
      console.error('Erro ao carregar observações:', error)
    }
  }

  const loadRelatorio = async () => {
    try {
      setLoadingRelatorio(true)
      const relatorioData = await professorService.getRelatorioTurma(professorId, turmaId)
      setRelatorio(relatorioData)
    } catch (error) {
      console.error('Erro ao carregar relatório:', error)
      toast.error('Erro ao carregar relatório')
    } finally {
      setLoadingRelatorio(false)
    }
  }

  const handleSavePresencas = async () => {
    try {
      if (!turma) return

      const presencasAlunos = turma.alunos.map(aluno => ({
        aluno_id: aluno.id,
        presente: presencaData[aluno.id]?.presente ?? true,
        observacoes: presencaData[aluno.id]?.observacoes ?? ''
      }))

      await professorService.registrarPresencaLote(turmaId, professorId, selectedDate, presencasAlunos)
      toast.success('Presenças registradas com sucesso!')
      loadPresencas()
    } catch (error) {
      console.error('Erro ao salvar presenças:', error)
      toast.error('Erro ao registrar presenças')
    }
  }

  const handleAddNota = async () => {
    try {
      await professorService.adicionarNota({
        ...notaForm,
        turma_id: turmaId,
        professor_id: professorId
      })
      toast.success('Nota adicionada com sucesso!')
      setShowNotaModal(false)
      setNotaForm({
        aluno_id: 0,
        disciplina: 'Matemática',
        tipo_avaliacao: 'Prova',
        valor: 0,
        valor_maximo: 10,
        data_avaliacao: '',
        descricao: '',
        observacoes: ''
      })
      loadNotas()
    } catch (error) {
      console.error('Erro ao adicionar nota:', error)
      toast.error('Erro ao adicionar nota')
    }
  }

  const handleAddObservacao = async () => {
    try {
      await professorService.adicionarObservacao({
        ...observacaoForm,
        turma_id: turmaId,
        professor_id: professorId
      })
      toast.success('Observação adicionada com sucesso!')
      setShowObservacaoModal(false)
      setObservacaoForm({
        aluno_id: 0,
        tipo: 'academico',
        titulo: '',
        descricao: '',
        data: new Date().toISOString().split('T')[0],
        visivel_responsavel: true
      })
      loadObservacoes()
    } catch (error) {
      console.error('Erro ao adicionar observação:', error)
      toast.error('Erro ao adicionar observação')
    }
  }

  const filteredAlunos = turma?.alunos.filter(aluno =>
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.matricula.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (loading || !turma) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando turma...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar ao Dashboard
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {normalizeTurmaName(turma.nome)}
              </h1>
              <p className="text-gray-600 mt-2">
                {normalizeTurmaName(turma.serie)} • {turma.ano_letivo} • {turma.total_alunos} alunos
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
              <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Relatório</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'presenca', name: 'Presença', icon: CheckCircle },
                { id: 'notas', name: 'Notas', icon: FileText },
                { id: 'observacoes', name: 'Observações', icon: MessageSquare },
                { id: 'relatorio', name: 'Relatório', icon: TrendingUp }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Presença Tab */}
            {activeTab === 'presenca' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Controle de Presença</h3>
                  <div className="flex items-center space-x-4">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSavePresencas}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Salvar Presenças</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredAlunos.map((aluno) => (
                    <div key={aluno.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{aluno.nome}</h4>
                          <p className="text-sm text-gray-600">Matrícula: {aluno.matricula}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setPresencaData(prev => ({
                              ...prev,
                              [aluno.id]: { ...prev[aluno.id], presente: true }
                            }))}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              presencaData[aluno.id]?.presente
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                            }`}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Presente
                          </button>
                          <button
                            onClick={() => setPresencaData(prev => ({
                              ...prev,
                              [aluno.id]: { ...prev[aluno.id], presente: false }
                            }))}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              !presencaData[aluno.id]?.presente
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                            }`}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Falta
                          </button>
                        </div>

                        <input
                          type="text"
                          placeholder="Observações..."
                          value={presencaData[aluno.id]?.observacoes || ''}
                          onChange={(e) => setPresencaData(prev => ({
                            ...prev,
                            [aluno.id]: { ...prev[aluno.id], observacoes: e.target.value }
                          }))}
                          className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent w-48"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notas Tab */}
            {activeTab === 'notas' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Gestão de Notas</h3>
                  <button
                    onClick={() => setShowNotaModal(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nova Nota</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {notas.map((nota) => {
                    const aluno = turma.alunos.find(a => a.id === nota.aluno_id)
                    return (
                      <div key={nota.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{aluno?.nome}</h4>
                            <p className="text-sm text-gray-600">{nota.disciplina} • {nota.tipo_avaliacao}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              nota.valor >= 7 ? 'bg-green-100 text-green-800' :
                              nota.valor >= 5 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {nota.valor}/{nota.valor_maximo}
                            </span>
                            <button className="text-gray-400 hover:text-gray-600">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{nota.descricao}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {professorService.formatarData(nota.data_avaliacao)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Observações Tab */}
            {activeTab === 'observacoes' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Observações dos Alunos</h3>
                  <button
                    onClick={() => setShowObservacaoModal(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nova Observação</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {observacoes.map((observacao) => {
                    const aluno = turma.alunos.find(a => a.id === observacao.aluno_id)
                    return (
                      <div key={observacao.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-gray-900">{aluno?.nome}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                observacao.tipo === 'comportamento' ? 'bg-blue-100 text-blue-800' :
                                observacao.tipo === 'academico' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {observacao.tipo}
                              </span>
                              {observacao.visivel_responsavel && (
                                <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                  Visível ao responsável
                                </span>
                              )}
                            </div>
                            <h5 className="font-medium text-gray-800 mb-1">{observacao.titulo}</h5>
                            <p className="text-sm text-gray-600 mb-2">{observacao.descricao}</p>
                            <p className="text-xs text-gray-500">
                              {professorService.formatarData(observacao.data)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="text-gray-400 hover:text-gray-600">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Relatório Tab */}
            {activeTab === 'relatorio' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Relatório da Turma</h3>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={loadRelatorio}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Atualizar</span>
                    </button>
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Exportar PDF</span>
                    </button>
                  </div>
                </div>

                {loadingRelatorio ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <span className="ml-3 text-gray-600">Carregando relatório...</span>
                  </div>
                ) : relatorio ? (
                  <div className="space-y-6">
                    {/* Cards de Estatísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-blue-50 rounded-lg p-4"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-900">Total de Alunos</p>
                            <p className="text-2xl font-bold text-blue-600">{relatorio.total_alunos}</p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-green-50 rounded-lg p-4"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-900">Presenças (Mês)</p>
                            <p className="text-2xl font-bold text-green-600">{relatorio.total_presencas_mes}</p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-purple-50 rounded-lg p-4"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                            <FileText className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-purple-900">Avaliações (Mês)</p>
                            <p className="text-2xl font-bold text-purple-600">{relatorio.total_avaliacoes_mes}</p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-orange-50 rounded-lg p-4"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-orange-900">Com Dificuldades</p>
                            <p className="text-2xl font-bold text-orange-600">{relatorio.alunos_com_dificuldades}</p>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Média Geral da Turma */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Desempenho Geral</h4>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Média da Turma</span>
                            <span className={`text-sm font-bold ${
                              relatorio.media_geral_turma >= 7 ? 'text-green-600' :
                              relatorio.media_geral_turma >= 5 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {relatorio.media_geral_turma}/10
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                relatorio.media_geral_turma >= 7 ? 'bg-green-500' :
                                relatorio.media_geral_turma >= 5 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${(relatorio.media_geral_turma / 10) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lista de Alunos com Detalhes */}
                    <div className="bg-white rounded-lg border border-gray-200">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h4 className="text-lg font-medium text-gray-900">Desempenho Individual</h4>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {turma?.alunos.map((aluno, index) => {
                          const notasAluno = notas.filter(n => n.aluno_id === aluno.id)
                          const presencasAluno = presencas.filter(p => p.aluno_id === aluno.id)
                          const statusAluno = professorService.obterStatusAluno(notasAluno, presencasAluno)

                          return (
                            <motion.div
                              key={aluno.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="px-6 py-4"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                    <Users className="w-5 h-5 text-primary-600" />
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-gray-900">{aluno.nome}</h5>
                                    <p className="text-sm text-gray-600">Matrícula: {aluno.matricula}</p>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-6">
                                  <div className="text-center">
                                    <p className="text-sm text-gray-600">Média</p>
                                    <p className={`text-lg font-bold ${
                                      statusAluno.media >= 7 ? 'text-green-600' :
                                      statusAluno.media >= 5 ? 'text-yellow-600' :
                                      'text-red-600'
                                    }`}>
                                      {statusAluno.media.toFixed(1)}
                                    </p>
                                  </div>

                                  <div className="text-center">
                                    <p className="text-sm text-gray-600">Frequência</p>
                                    <p className={`text-lg font-bold ${
                                      statusAluno.frequencia >= 75 ? 'text-green-600' :
                                      statusAluno.frequencia >= 60 ? 'text-yellow-600' :
                                      'text-red-600'
                                    }`}>
                                      {statusAluno.frequencia.toFixed(1)}%
                                    </p>
                                  </div>

                                  <div className="text-center">
                                    <p className="text-sm text-gray-600">Status</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      statusAluno.status === 'aprovado' ? 'bg-green-100 text-green-800' :
                                      statusAluno.status === 'recuperacao' ? 'bg-yellow-100 text-yellow-800' :
                                      statusAluno.status === 'reprovado' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {statusAluno.status === 'aprovado' ? 'Aprovado' :
                                       statusAluno.status === 'recuperacao' ? 'Recuperação' :
                                       statusAluno.status === 'reprovado' ? 'Reprovado' :
                                       'Pendente'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Informações Adicionais */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Última atualização: {professorService.formatarData(relatorio.ultima_atividade)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum relatório disponível</h3>
                    <p className="text-gray-600 mb-4">Clique em "Atualizar" para gerar o relatório da turma.</p>
                    <button
                      onClick={loadRelatorio}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Gerar Relatório
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para Nova Nota */}
      <AnimatePresence>
        {showNotaModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowNotaModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">Nova Nota</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aluno</label>
                  <select
                    value={notaForm.aluno_id}
                    onChange={(e) => setNotaForm(prev => ({ ...prev, aluno_id: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value={0}>Selecione um aluno</option>
                    {turma.alunos.map((aluno) => (
                      <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disciplina</label>
                  <input
                    type="text"
                    value={notaForm.disciplina}
                    onChange={(e) => setNotaForm(prev => ({ ...prev, disciplina: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Avaliação</label>
                  <select
                    value={notaForm.tipo_avaliacao}
                    onChange={(e) => setNotaForm(prev => ({ ...prev, tipo_avaliacao: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="Prova">Prova</option>
                    <option value="Trabalho">Trabalho</option>
                    <option value="Atividade">Atividade</option>
                    <option value="Projeto">Projeto</option>
                    <option value="Participação">Participação</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nota</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max={notaForm.valor_maximo}
                      value={notaForm.valor}
                      onChange={(e) => setNotaForm(prev => ({ ...prev, valor: parseFloat(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nota Máxima</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      value={notaForm.valor_maximo}
                      onChange={(e) => setNotaForm(prev => ({ ...prev, valor_maximo: parseFloat(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data da Avaliação</label>
                  <input
                    type="date"
                    value={notaForm.data_avaliacao}
                    onChange={(e) => setNotaForm(prev => ({ ...prev, data_avaliacao: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <input
                    type="text"
                    value={notaForm.descricao}
                    onChange={(e) => setNotaForm(prev => ({ ...prev, descricao: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: Prova de matemática - capítulo 5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                  <textarea
                    value={notaForm.observacoes}
                    onChange={(e) => setNotaForm(prev => ({ ...prev, observacoes: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                    placeholder="Observações sobre o desempenho do aluno..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowNotaModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddNota}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Adicionar Nota
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal para Nova Observação */}
      <AnimatePresence>
        {showObservacaoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowObservacaoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">Nova Observação</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aluno</label>
                  <select
                    value={observacaoForm.aluno_id}
                    onChange={(e) => setObservacaoForm(prev => ({ ...prev, aluno_id: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value={0}>Selecione um aluno</option>
                    {turma.alunos.map((aluno) => (
                      <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={observacaoForm.tipo}
                    onChange={(e) => setObservacaoForm(prev => ({ ...prev, tipo: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="academico">Acadêmico</option>
                    <option value="comportamento">Comportamento</option>
                    <option value="geral">Geral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={observacaoForm.titulo}
                    onChange={(e) => setObservacaoForm(prev => ({ ...prev, titulo: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: Participação em aula"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={observacaoForm.descricao}
                    onChange={(e) => setObservacaoForm(prev => ({ ...prev, descricao: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={4}
                    placeholder="Descreva a observação..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={observacaoForm.data}
                    onChange={(e) => setObservacaoForm(prev => ({ ...prev, data: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="visivel_responsavel"
                    checked={observacaoForm.visivel_responsavel}
                    onChange={(e) => setObservacaoForm(prev => ({ ...prev, visivel_responsavel: e.target.checked }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="visivel_responsavel" className="ml-2 text-sm text-gray-700">
                    Visível para o responsável
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowObservacaoModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddObservacao}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Adicionar Observação
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TurmaManager