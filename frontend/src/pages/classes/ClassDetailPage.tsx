import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Users, Calendar, BookOpen, FileText, Phone,
  Mail, Home, User, Edit, Trash2, Plus, X, Save,
  ClipboardList, Activity, Award, AlertCircle, Eye, TrendingUp,
  TrendingDown, Minus, CheckCircle, XCircle, Clock, GraduationCap
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Aluno {
  id: number
  nome: string
  email?: string
  data_nascimento: string
  idade?: number
  cpf?: string
  matricula: string
  status: string

  // Endereço
  endereco_rua?: string
  endereco_numero?: string
  endereco_bairro?: string
  endereco_cidade?: string
  endereco_estado?: string
  endereco_cep?: string

  // Informações pessoais
  possui_conducao?: boolean
  religiao?: string

  // Responsáveis
  nome_mae?: string
  nome_pai?: string
  telefone_responsavel?: string
  email_responsavel?: string
  telefone_mae?: string
  telefone_outro?: string
  nome_outro_contato?: string

  // Mora com
  mora_com?: string
  mora_com_outros_desc?: string

  // Saúde
  doenca_grave?: string
  restricao_alimentar?: string
  restricao_remedio?: string
  remedio_uso_continuo?: string
  telefone_emergencia?: string
  tipo_sanguineo?: string
  alergias?: string

  // Social
  recebe_bolsa_familia?: boolean
  numero_nis?: string

  observacoes?: string
}

interface Turma {
  id: number
  nome: string
  nivel: string
  serie: string
  turno: string
  ano_letivo: number
  capacidade_maxima: number
  status: string
  observacoes?: string
}

interface Nota {
  id: number
  aluno_id: number
  materia: string
  bimestre: number
  nota: number
  nota_maxima: number
  data_avaliacao: string
  tipo_avaliacao: string
  observacoes?: string
}

interface NotaFormData {
  materia: string
  nota: string
  tipo_avaliacao: string
  data: string
  observacoes: string
}

interface AlunoComNotas extends Aluno {
  medias_disciplinas?: { [key: string]: number }
  media_final_bimestre?: number
  notasPorBimestre?: { [key: string]: number }
}

interface Frequencia {
  id: number
  aluno_id: number
  turma_id: number
  data: string
  status: 'presente' | 'ausente' | 'justificado'
  observacoes?: string
  registrado_por_id?: number
  created_at: string
}

interface FrequenciaFormData {
  aluno_id: number
  status: 'presente' | 'ausente' | 'justificado'
}

interface BoletimAluno {
  aluno: AlunoComNotas
  notasPorBimestre: {
    [bimestre: number]: {
      [disciplina: string]: number
    }
  }
  mediasPorDisciplina: { [disciplina: string]: number }
  mediaGeral: number
  taxaPresenca: number
  situacao: 'Aprovado' | 'Recuperação' | 'Reprovado' | 'Pendente'
}

type TabType = 'alunos' | 'notas' | 'frequencia' | 'boletim'

const DISCIPLINAS = [
  'Português',
  'Matemática',
  'Ciências',
  'História',
  'Geografia',
  'Artes',
  'Educação Física',
  'Inglês',
  'Ensino Religioso',
  'Empreendedorismo'
]

const TIPOS_AVALIACAO = [
  'prova',
  'trabalho',
  'seminário',
  'participação',
  'outro'
]

const ClassDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [turma, setTurma] = useState<Turma | null>(null)
  const [alunos, setAlunos] = useState<AlunoComNotas[]>([])
  const [selectedAluno, setSelectedAluno] = useState<AlunoComNotas | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('alunos')
  const [loading, setLoading] = useState(true)
  const [showAlunoDetail, setShowAlunoDetail] = useState(false)
  const [showNotasModal, setShowNotasModal] = useState(false)
  const [showGradesModal, setShowGradesModal] = useState(false)
  const [showBoletimModal, setShowBoletimModal] = useState(false)
  const [notas, setNotas] = useState<Nota[]>([])
  const [selectedBimestre, setSelectedBimestre] = useState<number>(1)
  const [loadingGrades, setLoadingGrades] = useState(false)
  const [savingGrades, setSavingGrades] = useState(false)
  const [notasForm, setNotasForm] = useState<NotaFormData[]>([])
  const [boletimData, setBoletimData] = useState<any>(null)
  const [bimestreModal, setBimestreModal] = useState<number>(1)

  // Frequência states
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [frequenciaForm, setFrequenciaForm] = useState<Record<number, 'presente' | 'ausente' | 'justificado'>>({})
  const [frequenciaObservacoes, setFrequenciaObservacoes] = useState<Record<number, string>>({})
  const [loadingFrequencia, setLoadingFrequencia] = useState(false)
  const [savingFrequencia, setSavingFrequencia] = useState(false)
  const [frequenciaStats, setFrequenciaStats] = useState({
    taxaPresenca: 0,
    taxaFaltas: 0,
    alunosRisco: 0
  })

  // Boletim states
  const [boletimAlunos, setBoletimAlunos] = useState<BoletimAluno[]>([])
  const [loadingBoletim, setLoadingBoletim] = useState(false)
  const [selectedAlunoBoletim, setSelectedAlunoBoletim] = useState<BoletimAluno | null>(null)
  const [showBoletimDetalhado, setShowBoletimDetalhado] = useState(false)

  useEffect(() => {
    fetchTurma()
    fetchAlunosComNotas()
  }, [id, selectedBimestre])

  // Initialize grades form for all disciplines
  const initializeNotasForm = () => {
    const hoje = new Date().toISOString().split('T')[0]
    return DISCIPLINAS.map(disciplina => ({
      materia: disciplina,
      nota: '',
      tipo_avaliacao: 'prova',
      data: hoje,
      observacoes: ''
    }))
  }

  const fetchTurma = async () => {
    try {
      const response = await fetch(`http://localhost:4600/api/turmas/${id}`)
      const data = await response.json()
      if (data.success) {
        setTurma(data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar turma:', error)
      toast.error('Erro ao carregar turma')
    }
  }

  const fetchAlunosComNotas = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:4600/api/turmas/${id}/notas?periodo=${selectedBimestre}`)
      const data = await response.json()
      if (data.success) {
        // Buscar médias de todos os bimestres para cada aluno
        const alunosComMedias = await Promise.all(
          data.data.map(async (aluno: AlunoComNotas) => {
            const notasPorBimestre: { [key: string]: number } = {}
            for (let bim = 1; bim <= 4; bim++) {
              const periodo = `${bim}º Bimestre`
              try {
                const mediaRes = await fetch(
                  `http://localhost:4600/api/alunos/${aluno.id}/nota-final-bimestre?bimestre=${bim}`
                )
                const mediaData = await mediaRes.json()
                if (mediaData.success && mediaData.data.notaFinal > 0) {
                  notasPorBimestre[periodo] = mediaData.data.notaFinal
                }
              } catch (err) {
                console.error(`Erro ao buscar média do ${bim}º bimestre:`, err)
              }
            }
            return { ...aluno, notasPorBimestre }
          })
        )
        setAlunos(alunosComMedias)
      } else {
        // Fallback to regular alunos if notas endpoint fails
        const alunosResponse = await fetch(`http://localhost:4600/api/alunos?turma_id=${id}`)
        const alunosData = await alunosResponse.json()
        if (alunosData.success) {
          setAlunos(alunosData.data)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar alunos:', error)
      toast.error('Erro ao carregar alunos')
    } finally {
      setLoading(false)
    }
  }

  const fetchNotasAluno = async (alunoId: number) => {
    try {
      const response = await fetch(`http://localhost:4600/api/notas?aluno_id=${alunoId}`)
      const data = await response.json()
      if (data.success) {
        setNotas(data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar notas:', error)
    }
  }

  const handleViewAluno = (aluno: AlunoComNotas) => {
    setSelectedAluno(aluno)
    setShowAlunoDetail(true)
    fetchNotasAluno(aluno.id)
  }

  const handleViewNotas = (aluno: AlunoComNotas) => {
    setSelectedAluno(aluno)
    fetchNotasAluno(aluno.id)
    setShowNotasModal(true)
  }

  const carregarNotasAlunoBimestre = async (alunoId: number, bimestre: number) => {
    try {
      const response = await fetch(`http://localhost:4600/api/notas?aluno_id=${alunoId}`)
      const data = await response.json()

      if (data.success) {
        // Filtrar notas do bimestre especificado
        const notasBimestre = data.data.filter((nota: Nota) => nota.bimestre === bimestre)

        // Criar mapa de notas existentes por disciplina
        const notasExistentesMap: Record<string, Nota> = {}
        notasBimestre.forEach((nota: Nota) => {
          notasExistentesMap[nota.materia] = nota
        })

        // Inicializar form com notas existentes ou vazias
        const hoje = new Date().toISOString().split('T')[0]
        const formInicial = DISCIPLINAS.map(disciplina => {
          const notaExistente = notasExistentesMap[disciplina]
          if (notaExistente) {
            return {
              materia: disciplina,
              nota: notaExistente.nota.toString(),
              tipo_avaliacao: notaExistente.tipo_avaliacao,
              data: notaExistente.data_avaliacao,
              observacoes: notaExistente.observacoes || ''
            }
          } else {
            return {
              materia: disciplina,
              nota: '',
              tipo_avaliacao: 'prova',
              data: hoje,
              observacoes: ''
            }
          }
        })

        setNotasForm(formInicial)
      } else {
        setNotasForm(initializeNotasForm())
      }
    } catch (error) {
      console.error('Erro ao carregar notas do aluno:', error)
      setNotasForm(initializeNotasForm())
    }
  }

  const handleLancarNotas = async (aluno: AlunoComNotas) => {
    console.log('Lançar notas para aluno:', aluno)
    setSelectedAluno(aluno)
    setBimestreModal(selectedBimestre)
    setShowGradesModal(true)

    // Carregar notas do bimestre atual
    await carregarNotasAlunoBimestre(aluno.id, selectedBimestre)
  }

  // Recarregar notas quando o bimestre do modal mudar
  useEffect(() => {
    if (showGradesModal && selectedAluno) {
      carregarNotasAlunoBimestre(selectedAluno.id, bimestreModal)
    }
  }, [bimestreModal, showGradesModal])

  const handleSaveNotas = async () => {
    if (!selectedAluno) return

    // Validate that at least one grade was entered
    const notasValidas = notasForm.filter(n => n.nota !== '')
    if (notasValidas.length === 0) {
      toast.error('Por favor, insira pelo menos uma nota')
      return
    }

    // Validate grades are between 0 and 10
    const notasInvalidas = notasValidas.filter(n => {
      const nota = parseFloat(n.nota)
      return isNaN(nota) || nota < 0 || nota > 10
    })

    if (notasInvalidas.length > 0) {
      toast.error('As notas devem estar entre 0 e 10')
      return
    }

    try {
      setSavingGrades(true)

      const notasParaSalvar = notasValidas.map(n => ({
        aluno_id: selectedAluno.id,
        materia: n.materia,
        bimestre: bimestreModal,
        nota: parseFloat(n.nota),
        nota_maxima: 10,
        data_avaliacao: n.data,
        tipo_avaliacao: n.tipo_avaliacao,
        observacoes: n.observacoes || undefined
      }))

      const response = await fetch('http://localhost:4600/api/notas/lote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notas: notasParaSalvar })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`${notasValidas.length} nota(s) salva(s) com sucesso!`)
        setShowGradesModal(false)
        fetchAlunosComNotas()
      } else {
        toast.error(data.message || 'Erro ao salvar notas')
      }
    } catch (error) {
      console.error('Erro ao salvar notas:', error)
      toast.error('Erro ao salvar notas')
    } finally {
      setSavingGrades(false)
    }
  }

  const handleVerBoletim = async (aluno: AlunoComNotas) => {
    setSelectedAluno(aluno)
    setLoadingGrades(true)
    setShowBoletimModal(true)

    try {
      const [mediasResponse, notaFinalResponse] = await Promise.all([
        fetch(`http://localhost:4600/api/alunos/${aluno.id}/medias-disciplinas?bimestre=${selectedBimestre}`),
        fetch(`http://localhost:4600/api/alunos/${aluno.id}/nota-final-bimestre?bimestre=${selectedBimestre}`)
      ])

      const mediasData = await mediasResponse.json()
      const notaFinalData = await notaFinalResponse.json()

      setBoletimData({
        medias_disciplinas: mediasData.success ? mediasData.data : {},
        media_final: notaFinalData.success ? notaFinalData.data : null
      })
    } catch (error) {
      console.error('Erro ao carregar boletim:', error)
      toast.error('Erro ao carregar boletim')
    } finally {
      setLoadingGrades(false)
    }
  }

  const updateNotaForm = (index: number, field: keyof NotaFormData, value: string) => {
    const newForm = [...notasForm]
    newForm[index] = { ...newForm[index], [field]: value }
    setNotasForm(newForm)
  }

  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date()
    const nascimento = new Date(dataNascimento)
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mes = hoje.getMonth() - nascimento.getMonth()
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--
    }
    return idade
  }

  const calcularMediaBimestre = (alunoId: number, bimestre: number) => {
    const notasBimestre = notas.filter(n => n.aluno_id === alunoId && n.bimestre === bimestre)
    if (notasBimestre.length === 0) return '-'

    const soma = notasBimestre.reduce((acc, nota) => acc + (nota.nota / nota.nota_maxima) * 10, 0)
    return (soma / notasBimestre.length).toFixed(1)
  }

  const calcularEstatisticas = () => {
    const totalAlunos = alunos.length
    const alunosAtivos = alunos.filter(a => a.status === 'ativo').length
    const capacidadeOcupada = (totalAlunos / turma!.capacidade_maxima) * 100
    const vagasRestantes = turma!.capacidade_maxima - totalAlunos

    return {
      totalAlunos,
      alunosAtivos,
      capacidadeOcupada: capacidadeOcupada.toFixed(0),
      vagasRestantes
    }
  }

  // Frequência functions
  const fetchFrequenciaByDate = async (date: string) => {
    if (!turma) return

    try {
      setLoadingFrequencia(true)
      const response = await fetch(`http://localhost:4600/api/frequencias/turma/${id}?data=${date}`)
      const data = await response.json()

      if (data.success) {
        const frequenciaMap: Record<number, 'presente' | 'ausente' | 'justificado'> = {}
        const observacoesMap: Record<number, string> = {}
        data.data.forEach((freq: Frequencia) => {
          frequenciaMap[freq.aluno_id] = freq.status
          if (freq.observacoes) {
            observacoesMap[freq.aluno_id] = freq.observacoes
          }
        })
        setFrequenciaForm(frequenciaMap)
        setFrequenciaObservacoes(observacoesMap)
      }
    } catch (error) {
      console.error('Erro ao carregar frequência:', error)
    } finally {
      setLoadingFrequencia(false)
    }
  }

  const calculateFrequenciaStats = async () => {
    if (!turma || alunos.length === 0) return

    try {
      const stats = await Promise.all(
        alunos.map(async (aluno) => {
          try {
            const response = await fetch(`http://localhost:4600/api/alunos/${aluno.id}/taxa-presenca`)
            const data = await response.json()
            return data.success ? data.data.taxa_presenca : 0
          } catch {
            return 0
          }
        })
      )

      const validStats = stats.filter(s => s > 0)
      if (validStats.length === 0) {
        setFrequenciaStats({ taxaPresenca: 0, taxaFaltas: 0, alunosRisco: 0 })
        return
      }

      const mediaPresenca = validStats.reduce((a, b) => a + b, 0) / validStats.length
      const alunosEmRisco = stats.filter(s => s > 0 && s < 75).length

      setFrequenciaStats({
        taxaPresenca: mediaPresenca,
        taxaFaltas: 100 - mediaPresenca,
        alunosRisco: alunosEmRisco
      })
    } catch (error) {
      console.error('Erro ao calcular estatísticas de frequência:', error)
    }
  }

  const handleFrequenciaChange = (alunoId: number, status: 'presente' | 'ausente' | 'justificado') => {
    setFrequenciaForm(prev => ({
      ...prev,
      [alunoId]: status
    }))
  }

  const handleSaveFrequencia = async () => {
    if (!turma) return

    try {
      setSavingFrequencia(true)

      const frequenciasData = Object.entries(frequenciaForm).map(([alunoId, status]) => {
        const freqData: any = {
          aluno_id: Number(alunoId),
          turma_id: turma.id,
          data: selectedDate,
          status
        }

        // Adicionar observações apenas se o status for justificado e houver observação
        if (status === 'justificado' && frequenciaObservacoes[Number(alunoId)]) {
          freqData.observacoes = frequenciaObservacoes[Number(alunoId)]
        }

        return freqData
      })

      if (frequenciasData.length === 0) {
        toast.error('Nenhuma frequência para salvar')
        return
      }

      const response = await fetch('http://localhost:4600/api/frequencias/lote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(frequenciasData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || 'Frequência salva com sucesso!')
        await calculateFrequenciaStats()
      } else {
        toast.error(data.message || 'Erro ao salvar frequência')
      }
    } catch (error) {
      console.error('Erro ao salvar frequência:', error)
      toast.error('Erro ao salvar frequência')
    } finally {
      setSavingFrequencia(false)
    }
  }

  const handleMarcarTodosPresentes = () => {
    const novaMarcacao: Record<number, 'presente' | 'ausente' | 'justificado'> = {}
    alunos.forEach(aluno => {
      novaMarcacao[aluno.id] = 'presente'
    })
    setFrequenciaForm(novaMarcacao)
  }

  useEffect(() => {
    if (activeTab === 'frequencia') {
      fetchFrequenciaByDate(selectedDate)
      calculateFrequenciaStats()
    }
  }, [activeTab, selectedDate, id])

  // Boletim functions
  const fetchBoletimCompleto = async () => {
    if (!turma || alunos.length === 0) return

    try {
      setLoadingBoletim(true)

      const boletinsPromises = alunos.map(async (aluno) => {
        // Buscar notas de todos os bimestres
        const notasPorBimestre: { [bimestre: number]: { [disciplina: string]: number } } = {}

        for (let bim = 1; bim <= 4; bim++) {
          try {
            const response = await fetch(`http://localhost:4600/api/alunos/${aluno.id}/medias-disciplinas?bimestre=${bim}`)
            const data = await response.json()
            if (data.success) {
              notasPorBimestre[bim] = data.data
            }
          } catch (err) {
            console.error(`Erro ao buscar notas do ${bim}º bimestre:`, err)
          }
        }

        // Calcular médias por disciplina (média dos 4 bimestres)
        const mediasPorDisciplina: { [disciplina: string]: number } = {}
        DISCIPLINAS.forEach(disciplina => {
          const notasDisciplina = [1, 2, 3, 4]
            .map(bim => notasPorBimestre[bim]?.[disciplina] || 0)
            .filter(nota => nota > 0)

          if (notasDisciplina.length > 0) {
            mediasPorDisciplina[disciplina] = notasDisciplina.reduce((a, b) => a + b, 0) / notasDisciplina.length
          }
        })

        // Calcular média geral
        const mediasValidas = Object.values(mediasPorDisciplina).filter(m => m > 0)
        const mediaGeral = mediasValidas.length > 0
          ? mediasValidas.reduce((a, b) => a + b, 0) / mediasValidas.length
          : 0

        // Buscar taxa de presença
        let taxaPresenca = 0
        try {
          const response = await fetch(`http://localhost:4600/api/alunos/${aluno.id}/taxa-presenca`)
          const data = await response.json()
          if (data.success) {
            taxaPresenca = data.data.taxa_presenca
          }
        } catch (err) {
          console.error('Erro ao buscar taxa de presença:', err)
        }

        // Determinar situação
        let situacao: 'Aprovado' | 'Recuperação' | 'Reprovado' | 'Pendente' = 'Pendente'
        if (mediaGeral > 0) {
          if (mediaGeral >= 7 && taxaPresenca >= 75) {
            situacao = 'Aprovado'
          } else if (mediaGeral >= 5 && mediaGeral < 7) {
            situacao = 'Recuperação'
          } else if (mediaGeral < 5 || taxaPresenca < 75) {
            situacao = 'Reprovado'
          }
        }

        return {
          aluno,
          notasPorBimestre,
          mediasPorDisciplina,
          mediaGeral,
          taxaPresenca,
          situacao
        } as BoletimAluno
      })

      const boletins = await Promise.all(boletinsPromises)
      setBoletimAlunos(boletins)
    } catch (error) {
      console.error('Erro ao carregar boletim:', error)
      toast.error('Erro ao carregar boletim')
    } finally {
      setLoadingBoletim(false)
    }
  }

  const handleVerBoletimDetalhado = (boletim: BoletimAluno) => {
    setSelectedAlunoBoletim(boletim)
    setShowBoletimDetalhado(true)
  }

  useEffect(() => {
    if (activeTab === 'boletim') {
      fetchBoletimCompleto()
    }
  }, [activeTab, alunos])

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ativo': return 'bg-green-100 text-green-800'
      case 'inativo': return 'bg-gray-100 text-gray-800'
      case 'transferido': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getGradeColor = (nota: number | undefined) => {
    if (nota === undefined) return 'bg-gray-100 text-gray-600'
    if (nota >= 7) return 'bg-green-100 text-green-800'
    if (nota >= 5) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getGradeBgColor = (nota: number | undefined) => {
    if (nota === undefined) return 'bg-gray-50'
    if (nota >= 7) return 'bg-green-50'
    if (nota >= 5) return 'bg-yellow-50'
    return 'bg-red-50'
  }

  const getTurnoIcon = (turno: string) => {
    switch(turno) {
      case 'manha': return '🌅'
      case 'tarde': return '🌞'
      case 'noite': return '🌙'
      case 'integral': return '☀️'
      default: return '📅'
    }
  }

  if (!turma) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const stats = calcularEstatisticas()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/turmas')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para Turmas
        </button>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl">
                  {getTurnoIcon(turma.turno)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{turma.nome}</h1>
                  <p className="text-gray-600 mt-1 flex items-center gap-2">
                    <span className="font-medium">{turma.nivel}</span>
                    <span className="text-gray-400">•</span>
                    <span>{turma.serie}</span>
                    <span className="text-gray-400">•</span>
                    <span>{
                      turma.turno === 'manha' ? 'Manhã' :
                      turma.turno === 'tarde' ? 'Tarde' :
                      turma.turno === 'noite' ? 'Noite' :
                      turma.turno === 'integral' ? 'Integral' : '-'
                    }</span>
                  </p>
                </div>
              </div>
              {turma.observacoes && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">{turma.observacoes}</p>
                </div>
              )}
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  {stats.vagasRestantes > 0 ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <p className="text-2xl font-bold text-blue-900">{stats.totalAlunos}</p>
                <p className="text-xs text-blue-700 mt-1">Total de Alunos</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-900">{stats.alunosAtivos}</p>
                <p className="text-xs text-green-700 mt-1">Alunos Ativos</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  {parseInt(stats.capacidadeOcupada) >= 90 ? (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                  )}
                </div>
                <p className="text-2xl font-bold text-purple-900">{stats.capacidadeOcupada}%</p>
                <p className="text-xs text-purple-700 mt-1">Ocupação</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-orange-900">{stats.vagasRestantes}</p>
                <p className="text-xs text-orange-700 mt-1">Vagas Restantes</p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Capacidade da Turma</span>
              <span>{stats.totalAlunos} de {turma.capacidade_maxima} alunos</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  parseInt(stats.capacidadeOcupada) >= 90
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : parseInt(stats.capacidadeOcupada) >= 75
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600'
                    : 'bg-gradient-to-r from-green-500 to-blue-600'
                }`}
                style={{ width: `${stats.capacidadeOcupada}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bimestre Selector */}
      <div className="bg-white rounded-xl shadow-sm mb-6 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Período:</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((bim) => (
              <button
                key={bim}
                onClick={() => setSelectedBimestre(bim)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedBimestre === bim
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {bim}º Bimestre
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('alunos')}
              className={`py-4 px-6 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'alunos'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Alunos</span>
            </button>
            <button
              onClick={() => setActiveTab('notas')}
              className={`py-4 px-6 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'notas'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Notas</span>
            </button>
            <button
              onClick={() => setActiveTab('frequencia')}
              className={`py-4 px-6 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'frequencia'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Frequência</span>
            </button>
            <button
              onClick={() => setActiveTab('boletim')}
              className={`py-4 px-6 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'boletim'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Boletim</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'alunos' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Lista de Alunos</h2>
                <p className="text-sm text-gray-500 mt-1">{alunos.length} {alunos.length === 1 ? 'aluno matriculado' : 'alunos matriculados'}</p>
              </div>
              <button
                onClick={() => toast.info('Funcionalidade em desenvolvimento')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm">
                <Plus className="w-4 h-4" />
                <span>Adicionar Aluno</span>
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : alunos.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum aluno matriculado</h3>
                <p className="text-gray-500 mb-6">Comece adicionando alunos a esta turma</p>
                <button
                  onClick={() => toast.info('Funcionalidade em desenvolvimento')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Primeiro Aluno</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <div className="inline-block min-w-full align-middle px-6">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aluno</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Matrícula</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Idade</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Média Bimestre</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {alunos.map((aluno) => (
                        <tr key={aluno.id} className="hover:bg-blue-50/50 transition-colors cursor-pointer">
                          <td className="px-4 py-4" onClick={() => handleViewAluno(aluno)}>
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                                {aluno.nome.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{aluno.nome}</div>
                                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {aluno.email || aluno.email_responsavel || 'Sem email'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4" onClick={() => handleViewAluno(aluno)}>
                            <span className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                              {aluno.numero_matricula || aluno.matricula || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-4" onClick={() => handleViewAluno(aluno)}>
                            <div className="text-sm text-gray-900 font-medium">
                              {calcularIdade(aluno.data_nascimento)} anos
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(aluno.data_nascimento).toLocaleDateString('pt-BR')}
                            </div>
                          </td>
                          <td className="px-4 py-4" onClick={() => handleViewAluno(aluno)}>
                            {aluno.media_final_bimestre !== undefined ? (
                              <div className="flex items-center gap-2">
                                <span className={`px-3 py-1.5 text-sm font-bold rounded-full ${getGradeColor(aluno.media_final_bimestre)}`}>
                                  {aluno.media_final_bimestre.toFixed(1)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">Sem notas</span>
                            )}
                          </td>
                          <td className="px-4 py-4" onClick={() => handleViewAluno(aluno)}>
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(aluno.status)}`}>
                              {aluno.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleLancarNotas(aluno)
                                }}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg transition-all shadow-sm flex items-center gap-1"
                                title="Lançar notas"
                              >
                                <Plus className="w-3 h-3" />
                                Notas
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleVerBoletim(aluno)
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Ver boletim"
                              >
                                <GraduationCap className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleViewAluno(aluno)
                                }}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Ver detalhes"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'notas' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Gestão de Notas</h2>
              <p className="text-sm text-gray-500 mt-1">Visualize e gerencie as notas dos alunos por bimestre</p>
            </div>
            <button
              onClick={() => toast.info('Funcionalidade em desenvolvimento')}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-green-700 hover:to-green-800 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Lançar Nota</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {alunos.length > 0 ? alunos.slice(0, 6).map((aluno) => (
              <div key={aluno.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {aluno.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{aluno.nome}</h3>
                      <p className="text-xs text-gray-500">{aluno.matricula}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewNotas(aluno)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Award className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((bim) => {
                    const bimestreKey = `${bim}º Bimestre`
                    const alunoComNotas = alunos.find(a => a.id === aluno.id) as AlunoComNotas
                    const media = alunoComNotas?.notasPorBimestre?.[bimestreKey] || 0
                    return (
                      <div key={bim} className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-600 mb-1">{bim}º Bim</p>
                        <p className={`text-lg font-bold ${
                          media >= 7 ? 'text-green-600' :
                          media >= 5 ? 'text-yellow-600' :
                          media > 0 ? 'text-red-600' : 'text-gray-400'
                        }`}>
                          {media > 0 ? media.toFixed(1) : '-'}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )) : (
              <div className="col-span-2 text-center py-12">
                <Award className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Nenhum aluno para exibir notas</p>
              </div>
            )}
          </div>

          {alunos.length > 6 && (
            <div className="mt-6 text-center">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Ver todos os alunos →
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'frequencia' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Controle de Frequência</h2>
              <p className="text-sm text-gray-500 mt-1">Registre e acompanhe a presença dos alunos</p>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleMarcarTodosPresentes}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-all shadow-sm"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Marcar Todos Presentes</span>
              </button>
              <button
                onClick={handleSaveFrequencia}
                disabled={savingFrequencia}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-purple-700 hover:to-purple-800 transition-all shadow-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingFrequencia ? 'Salvando...' : 'Salvar Frequência'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-900">
                {frequenciaStats.taxaPresenca > 0 ? `${frequenciaStats.taxaPresenca.toFixed(1)}%` : '--'}
              </p>
              <p className="text-xs text-green-700 mt-1">Taxa de Presença</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <XCircle className="w-6 h-6 text-red-600" />
                <TrendingDown className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-900">
                {frequenciaStats.taxaFaltas > 0 ? `${frequenciaStats.taxaFaltas.toFixed(1)}%` : '--'}
              </p>
              <p className="text-xs text-red-700 mt-1">Taxa de Faltas</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <Minus className="w-4 h-4 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-900">{frequenciaStats.alunosRisco}</p>
              <p className="text-xs text-yellow-700 mt-1">Alunos em Risco (&lt;75%)</p>
            </div>
          </div>

          {loadingFrequencia ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4 animate-spin" />
              <p className="text-gray-500">Carregando frequência...</p>
            </div>
          ) : alunos.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Nenhum aluno matriculado nesta turma</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aluno</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Matrícula</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Presente</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Ausente</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Justificado</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {alunos.map((aluno, index) => {
                    const status = frequenciaForm[aluno.id]
                    return (
                      <React.Fragment key={aluno.id}>
                        <tr className={`border-b ${status === 'justificado' ? 'border-transparent' : 'border-gray-100'} ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                {aluno.nome.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{aluno.nome}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">{aluno.matricula}</td>
                          <td className="py-3 px-4 text-center">
                            <input
                              type="radio"
                              name={`freq-${aluno.id}`}
                              checked={status === 'presente'}
                              onChange={() => handleFrequenciaChange(aluno.id, 'presente')}
                              className="w-5 h-5 text-green-600 focus:ring-green-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <input
                              type="radio"
                              name={`freq-${aluno.id}`}
                              checked={status === 'ausente'}
                              onChange={() => handleFrequenciaChange(aluno.id, 'ausente')}
                              className="w-5 h-5 text-red-600 focus:ring-red-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <input
                              type="radio"
                              name={`freq-${aluno.id}`}
                              checked={status === 'justificado'}
                              onChange={() => handleFrequenciaChange(aluno.id, 'justificado')}
                              className="w-5 h-5 text-yellow-600 focus:ring-yellow-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-4">
                            {status === 'presente' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Presente
                              </span>
                            )}
                            {status === 'ausente' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <XCircle className="w-3 h-3 mr-1" />
                                Ausente
                              </span>
                            )}
                            {status === 'justificado' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Justificado
                              </span>
                            )}
                            {!status && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                Não registrado
                              </span>
                            )}
                          </td>
                        </tr>
                        {status === 'justificado' && (
                          <tr className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                            <td colSpan={6} className="py-3 px-4">
                              <div className="flex items-center space-x-3 ml-11">
                                <label className="text-sm font-medium text-yellow-700">Justificativa:</label>
                                <input
                                  type="text"
                                  value={frequenciaObservacoes[aluno.id] || ''}
                                  onChange={(e) => setFrequenciaObservacoes(prev => ({
                                    ...prev,
                                    [aluno.id]: e.target.value
                                  }))}
                                  placeholder="Digite o motivo da falta justificada..."
                                  className="flex-1 px-3 py-2 border border-yellow-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-yellow-50"
                                />
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'boletim' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Boletim da Turma</h2>
              <p className="text-sm text-gray-500 mt-1">Desempenho geral e relatórios da turma</p>
            </div>
            <button
              onClick={() => window.print()}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Imprimir Boletim</span>
            </button>
          </div>

          {loadingBoletim ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4 animate-spin" />
              <p className="text-gray-500">Carregando boletim...</p>
            </div>
          ) : boletimAlunos.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">Nenhum dado disponível</p>
              <p className="text-sm text-gray-400">Registre notas e frequências para gerar o boletim</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    {(boletimAlunos.reduce((acc, b) => acc + b.mediaGeral, 0) / boletimAlunos.length).toFixed(1)}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">Média Geral</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {boletimAlunos.filter(b => b.situacao === 'Aprovado').length}
                  </p>
                  <p className="text-xs text-green-700 mt-1">Alunos Aprovados</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-900">
                    {boletimAlunos.filter(b => b.situacao === 'Recuperação').length}
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">Em Recuperação</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-red-900">
                    {boletimAlunos.filter(b => b.situacao === 'Reprovado').length}
                  </p>
                  <p className="text-xs text-red-700 mt-1">Reprovados</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aluno</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Média Geral</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Frequência</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Situação</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boletimAlunos.map((boletim, index) => (
                      <tr key={boletim.aluno.id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-semibold">
                              {boletim.aluno.nome.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{boletim.aluno.nome}</p>
                              <p className="text-xs text-gray-500">{boletim.aluno.matricula}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-lg font-bold ${
                            boletim.mediaGeral >= 7 ? 'text-green-600' :
                            boletim.mediaGeral >= 5 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {boletim.mediaGeral > 0 ? boletim.mediaGeral.toFixed(1) : '--'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-sm font-medium ${
                            boletim.taxaPresenca >= 75 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {boletim.taxaPresenca > 0 ? `${boletim.taxaPresenca.toFixed(1)}%` : '--'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {boletim.situacao === 'Aprovado' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Aprovado
                            </span>
                          )}
                          {boletim.situacao === 'Recuperação' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Recuperação
                            </span>
                          )}
                          {boletim.situacao === 'Reprovado' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <XCircle className="w-3 h-3 mr-1" />
                              Reprovado
                            </span>
                          )}
                          {boletim.situacao === 'Pendente' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              <Clock className="w-3 h-3 mr-1" />
                              Pendente
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleVerBoletimDetalhado(boletim)}
                            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center justify-center mx-auto"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Detalhes
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal de Detalhes do Aluno */}
      {showAlunoDetail && selectedAluno && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Ficha do Aluno</h2>
              <button onClick={() => setShowAlunoDetail(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Informações Pessoais */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Informações Pessoais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nome Completo</label>
                    <p className="mt-1">{selectedAluno.nome}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data de Nascimento</label>
                    <p className="mt-1">{new Date(selectedAluno.data_nascimento).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Idade</label>
                    <p className="mt-1">{calcularIdade(selectedAluno.data_nascimento)} anos</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">CPF</label>
                    <p className="mt-1">{selectedAluno.cpf || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Matrícula</label>
                    <p className="mt-1">{selectedAluno.numero_matricula || selectedAluno.matricula || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1">{selectedAluno.email || selectedAluno.email_responsavel || 'Sem email'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Religião</label>
                    <p className="mt-1">{selectedAluno.religiao || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Possui Condução</label>
                    <p className="mt-1">{selectedAluno.possui_conducao ? 'Sim' : 'Não'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tipo Sanguíneo</label>
                    <p className="mt-1">{selectedAluno.tipo_sanguineo || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Home className="w-5 h-5 mr-2" />
                  Endereço
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Rua</label>
                    <p className="mt-1">{selectedAluno.endereco_rua || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Número</label>
                    <p className="mt-1">{selectedAluno.endereco_numero || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Bairro</label>
                    <p className="mt-1">{selectedAluno.endereco_bairro || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cidade</label>
                    <p className="mt-1">{selectedAluno.endereco_cidade || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estado</label>
                    <p className="mt-1">{selectedAluno.endereco_estado || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">CEP</label>
                    <p className="mt-1">{selectedAluno.endereco_cep || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Responsáveis */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Responsáveis e Contatos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nome da Mãe</label>
                    <p className="mt-1">{selectedAluno.nome_mae || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Telefone da Mãe</label>
                    <p className="mt-1">{selectedAluno.telefone_mae || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nome do Pai</label>
                    <p className="mt-1">{selectedAluno.nome_pai || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Telefone Responsável</label>
                    <p className="mt-1">{selectedAluno.telefone_responsavel || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email Responsável</label>
                    <p className="mt-1">{selectedAluno.email_responsavel || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Telefone de Emergência</label>
                    <p className="mt-1 text-red-600 font-medium">{selectedAluno.telefone_emergencia || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Outro Contato</label>
                    <p className="mt-1">{selectedAluno.nome_outro_contato || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Telefone Outro Contato</label>
                    <p className="mt-1">{selectedAluno.telefone_outro || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Mora Com</label>
                    <p className="mt-1">{selectedAluno.mora_com || '-'}</p>
                  </div>
                  {selectedAluno.mora_com === 'outros' && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Descrição</label>
                      <p className="mt-1">{selectedAluno.mora_com_outros_desc || '-'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Informações de Saúde */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Informações de Saúde
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Alergias</label>
                    <p className="mt-1">{selectedAluno.alergias || 'Nenhuma'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Doença Grave</label>
                    <p className="mt-1">{selectedAluno.doenca_grave || 'Nenhuma'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Restrição Alimentar</label>
                    <p className="mt-1">{selectedAluno.restricao_alimentar || 'Nenhuma'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Restrição de Remédio</label>
                    <p className="mt-1">{selectedAluno.restricao_remedio || 'Nenhuma'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Remédio de Uso Contínuo</label>
                    <p className="mt-1">{selectedAluno.remedio_uso_continuo || 'Nenhum'}</p>
                  </div>
                </div>
              </div>

              {/* Informações Sociais */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Informações Sociais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Recebe Bolsa Família</label>
                    <p className="mt-1">{selectedAluno.recebe_bolsa_familia ? 'Sim' : 'Não'}</p>
                  </div>
                  {selectedAluno.recebe_bolsa_familia && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Número NIS</label>
                      <p className="mt-1">{selectedAluno.numero_nis || '-'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Observações */}
              {selectedAluno.observacoes && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Observações</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedAluno.observacoes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Lançamento de Notas */}
      {showGradesModal && selectedAluno && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Lançar Notas</h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedAluno.nome} - {selectedAluno.numero_matricula || selectedAluno.matricula}</p>
                </div>
                <button onClick={() => setShowGradesModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Bimestre:</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((bim) => (
                    <button
                      key={bim}
                      onClick={() => setBimestreModal(bim)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        bimestreModal === bim
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {bim}º Bimestre
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {notasForm.map((nota, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      {/* Disciplina */}
                      <div className="lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Disciplina
                        </label>
                        <div className="flex items-center h-10 px-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="font-semibold text-gray-900">{nota.materia}</span>
                        </div>
                      </div>

                      {/* Nota */}
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nota (0-10) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={nota.nota}
                          onChange={(e) => updateNotaForm(index, 'nota', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.0"
                        />
                      </div>

                      {/* Tipo de Avaliação */}
                      <div className="lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de Avaliação
                        </label>
                        <select
                          value={nota.tipo_avaliacao}
                          onChange={(e) => updateNotaForm(index, 'tipo_avaliacao', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {TIPOS_AVALIACAO.map((tipo) => (
                            <option key={tipo} value={tipo}>
                              {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Data */}
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Data
                        </label>
                        <input
                          type="date"
                          value={nota.data}
                          onChange={(e) => updateNotaForm(index, 'data', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Observações */}
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Observações
                        </label>
                        <input
                          type="text"
                          value={nota.observacoes}
                          onChange={(e) => updateNotaForm(index, 'observacoes', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Opcional"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowGradesModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveNotas}
                  disabled={savingGrades}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {savingGrades ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar Notas
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Boletim */}
      {showBoletimModal && selectedAluno && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Boletim - {selectedBimestre}º Bimestre</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedAluno.nome} - {selectedAluno.matricula}</p>
              </div>
              <button onClick={() => setShowBoletimModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {loadingGrades ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {/* Média Final */}
                  <div className="mb-6 text-center">
                    <div className={`inline-block px-8 py-4 rounded-xl ${getGradeBgColor(boletimData?.media_final)}`}>
                      <p className="text-sm font-medium text-gray-600 mb-1">Média Final do Bimestre</p>
                      {boletimData?.media_final !== undefined && boletimData?.media_final !== null ? (
                        <p className={`text-4xl font-bold ${
                          boletimData.media_final >= 7 ? 'text-green-700' :
                          boletimData.media_final >= 5 ? 'text-yellow-700' : 'text-red-700'
                        }`}>
                          {boletimData.media_final.toFixed(1)}
                        </p>
                      ) : (
                        <p className="text-2xl font-medium text-gray-400">Sem notas</p>
                      )}
                    </div>
                  </div>

                  {/* Disciplinas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {DISCIPLINAS.map((disciplina) => {
                      const media = boletimData?.medias_disciplinas?.[disciplina]
                      return (
                        <div
                          key={disciplina}
                          className={`border-2 rounded-lg p-4 transition-all ${
                            media !== undefined
                              ? media >= 7
                                ? 'border-green-200 bg-green-50'
                                : media >= 5
                                ? 'border-yellow-200 bg-yellow-50'
                                : 'border-red-200 bg-red-50'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-gray-600" />
                              <h3 className="font-semibold text-gray-900">{disciplina}</h3>
                            </div>
                            <div className="text-right">
                              {media !== undefined ? (
                                <span className={`text-2xl font-bold ${
                                  media >= 7 ? 'text-green-700' :
                                  media >= 5 ? 'text-yellow-700' : 'text-red-700'
                                }`}>
                                  {media.toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-lg text-gray-400">-</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Legend */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-3">Legenda:</p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-200 border-2 border-green-300 rounded"></div>
                        <span className="text-sm text-gray-600">Aprovado (≥ 7.0)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-200 border-2 border-yellow-300 rounded"></div>
                        <span className="text-sm text-gray-600">Recuperação (5.0 - 6.9)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-200 border-2 border-red-300 rounded"></div>
                        <span className="text-sm text-gray-600">Reprovado (&lt; 5.0)</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Notas (History) */}
      {showNotasModal && selectedAluno && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Notas - {selectedAluno.nome}</h2>
              <button onClick={() => setShowNotasModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((bimestre) => (
                  <div key={bimestre} className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">{bimestre}º Bimestre</p>
                    <p className="text-2xl font-bold text-blue-600">{calcularMediaBimestre(selectedAluno.id, bimestre)}</p>
                  </div>
                ))}
              </div>

              {notas.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Nenhuma nota registrada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notas.map((nota) => (
                    <div key={nota.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{nota.materia}</h4>
                          <p className="text-sm text-gray-500">{nota.tipo_avaliacao} - {nota.bimestre}º Bimestre</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{nota.nota}/{nota.nota_maxima}</p>
                          <p className="text-sm text-gray-500">{new Date(nota.data_avaliacao).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      {nota.observacoes && (
                        <p className="mt-2 text-sm text-gray-600">{nota.observacoes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Boletim Detalhado */}
      {showBoletimDetalhado && selectedAlunoBoletim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Boletim Detalhado</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedAlunoBoletim.aluno.nome}</p>
              </div>
              <button onClick={() => setShowBoletimDetalhado(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Resumo Geral */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-700 mb-2">Média Geral</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {selectedAlunoBoletim.mediaGeral.toFixed(1)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-700 mb-2">Taxa de Presença</p>
                  <p className="text-3xl font-bold text-green-900">
                    {selectedAlunoBoletim.taxaPresenca.toFixed(1)}%
                  </p>
                </div>
                <div className={`bg-gradient-to-br rounded-lg p-4 border ${
                  selectedAlunoBoletim.situacao === 'Aprovado' ? 'from-green-50 to-green-100 border-green-200' :
                  selectedAlunoBoletim.situacao === 'Recuperação' ? 'from-yellow-50 to-yellow-100 border-yellow-200' :
                  'from-red-50 to-red-100 border-red-200'
                }`}>
                  <p className={`text-sm font-medium mb-2 ${
                    selectedAlunoBoletim.situacao === 'Aprovado' ? 'text-green-700' :
                    selectedAlunoBoletim.situacao === 'Recuperação' ? 'text-yellow-700' :
                    'text-red-700'
                  }`}>
                    Situação
                  </p>
                  <p className={`text-3xl font-bold ${
                    selectedAlunoBoletim.situacao === 'Aprovado' ? 'text-green-900' :
                    selectedAlunoBoletim.situacao === 'Recuperação' ? 'text-yellow-900' :
                    'text-red-900'
                  }`}>
                    {selectedAlunoBoletim.situacao}
                  </p>
                </div>
              </div>

              {/* Notas por Disciplina e Bimestre */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Notas por Disciplina</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border border-gray-200 py-2 px-4 text-left text-sm font-semibold text-gray-700">Disciplina</th>
                        <th className="border border-gray-200 py-2 px-4 text-center text-sm font-semibold text-gray-700">1º Bim</th>
                        <th className="border border-gray-200 py-2 px-4 text-center text-sm font-semibold text-gray-700">2º Bim</th>
                        <th className="border border-gray-200 py-2 px-4 text-center text-sm font-semibold text-gray-700">3º Bim</th>
                        <th className="border border-gray-200 py-2 px-4 text-center text-sm font-semibold text-gray-700">4º Bim</th>
                        <th className="border border-gray-200 py-2 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50">Média</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DISCIPLINAS.map((disciplina) => {
                        const media = selectedAlunoBoletim.mediasPorDisciplina[disciplina] || 0
                        return (
                          <tr key={disciplina}>
                            <td className="border border-gray-200 py-2 px-4 font-medium">{disciplina}</td>
                            {[1, 2, 3, 4].map(bim => {
                              const nota = selectedAlunoBoletim.notasPorBimestre[bim]?.[disciplina] || 0
                              return (
                                <td key={bim} className="border border-gray-200 py-2 px-4 text-center">
                                  <span className={`font-medium ${
                                    nota >= 7 ? 'text-green-600' :
                                    nota >= 5 ? 'text-yellow-600' :
                                    nota > 0 ? 'text-red-600' :
                                    'text-gray-400'
                                  }`}>
                                    {nota > 0 ? nota.toFixed(1) : '--'}
                                  </span>
                                </td>
                              )
                            })}
                            <td className="border border-gray-200 py-2 px-4 text-center bg-blue-50">
                              <span className={`font-bold text-lg ${
                                media >= 7 ? 'text-green-600' :
                                media >= 5 ? 'text-yellow-600' :
                                media > 0 ? 'text-red-600' :
                                'text-gray-400'
                              }`}>
                                {media > 0 ? media.toFixed(1) : '--'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Legenda */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Legenda:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                    <span>Aprovado (≥ 7.0)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-600 rounded"></div>
                    <span>Recuperação (5.0 - 6.9)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-600 rounded"></div>
                    <span>Reprovado (&lt; 5.0)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-400 rounded"></div>
                    <span>Sem nota</span>
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900">Critérios de Aprovação:</p>
                    <ul className="mt-2 text-sm text-yellow-800 space-y-1">
                      <li>• Média geral igual ou superior a 7.0</li>
                      <li>• Taxa de presença igual ou superior a 75%</li>
                      <li>• Média entre 5.0 e 6.9 = Recuperação</li>
                      <li>• Média inferior a 5.0 ou presença inferior a 75% = Reprovado</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClassDetailPage
