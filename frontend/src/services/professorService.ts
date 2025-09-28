import { api } from './api'

// Interfaces
export interface Presenca {
  id: number
  aluno_id: number
  turma_id: number
  professor_id: number
  data: string
  presente: boolean
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface Nota {
  id: number
  aluno_id: number
  turma_id: number
  professor_id: number
  disciplina: string
  tipo_avaliacao: string
  valor: number
  valor_maximo: number
  data_avaliacao: string
  descricao: string
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface Observacao {
  id: number
  aluno_id: number
  turma_id: number
  professor_id: number
  tipo: 'comportamento' | 'academico' | 'geral'
  titulo: string
  descricao: string
  data: string
  visivel_responsavel: boolean
  created_at: string
  updated_at: string
}

export interface Aluno {
  id: number
  nome: string
  matricula: string
  email?: string
  telefone?: string
  data_nascimento: string
  turma_id?: number
  responsavel_id?: number
  status: 'ativo' | 'inativo' | 'transferido'
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface Turma {
  id: number
  nome: string
  serie: string
  ano_letivo: number
  professor_responsavel_id: number
  status: 'ativa' | 'inativa' | 'concluida'
  capacidade_maxima: number
  created_at: string
  updated_at: string
}

export interface TurmaComAlunos extends Turma {
  alunos: Aluno[]
  total_alunos: number
  presencas_hoje?: Presenca[]
  ultima_atualizacao_presenca?: string
}

export interface RelatorioTurma {
  turma: Turma
  total_alunos: number
  total_presencas_mes: number
  total_avaliacoes_mes: number
  media_geral_turma: number
  alunos_com_dificuldades: number
  ultima_atividade: string
}

export interface DashboardProfessor {
  total_turmas: number
  total_alunos: number
  presencas_hoje: number
  avaliacoes_pendentes: number
  turmas: TurmaComAlunos[]
}

class ProfessorService {
  // === DASHBOARD E TURMAS ===

  async getDashboard(professorId: number): Promise<DashboardProfessor> {
    const response = await api.get(`/professor/${professorId}/dashboard`)
    return response.data
  }

  async getTurmas(professorId: number): Promise<TurmaComAlunos[]> {
    const response = await api.get(`/professor/${professorId}/turmas`)
    return response.data
  }

  async getTurmaDetalhes(professorId: number, turmaId: number): Promise<TurmaComAlunos> {
    const response = await api.get(`/professor/${professorId}/turmas/${turmaId}`)
    return response.data
  }

  // === GESTÃO DE PRESENÇAS ===

  async getPresencasPorData(turmaId: number, data: string): Promise<Presenca[]> {
    const response = await api.get(`/presencas/turma/${turmaId}/${data}`)
    return response.data
  }

  async registrarPresenca(dadosPresenca: Omit<Presenca, 'id' | 'created_at' | 'updated_at'>): Promise<Presenca> {
    const response = await api.post('/presencas', dadosPresenca)
    return response.data
  }

  async registrarPresencaLote(
    turmaId: number,
    professorId: number,
    data: string,
    presencasAlunos: Array<{aluno_id: number, presente: boolean, observacoes?: string}>
  ): Promise<Presenca[]> {
    const response = await api.post('/presencas/lote', {
      turma_id: turmaId,
      professor_id: professorId,
      data,
      presencas_alunos: presencasAlunos
    })
    return response.data
  }

  // === GESTÃO DE NOTAS ===

  async getNotasPorTurma(turmaId: number): Promise<Nota[]> {
    const response = await api.get(`/notas/turma/${turmaId}`)
    return response.data
  }

  async getNotasPorAluno(alunoId: number): Promise<Nota[]> {
    const response = await api.get(`/notas/aluno/${alunoId}`)
    return response.data
  }

  async adicionarNota(dadosNota: Omit<Nota, 'id' | 'created_at' | 'updated_at'>): Promise<Nota> {
    const response = await api.post('/notas', dadosNota)
    return response.data
  }

  async atualizarNota(id: number, dadosAtualizacao: Partial<Omit<Nota, 'id' | 'created_at' | 'updated_at'>>): Promise<Nota> {
    const response = await api.put(`/notas/${id}`, dadosAtualizacao)
    return response.data
  }

  // === GESTÃO DE OBSERVAÇÕES ===

  async getObservacoesPorTurma(turmaId: number): Promise<Observacao[]> {
    const response = await api.get(`/observacoes/turma/${turmaId}`)
    return response.data
  }

  async getObservacoesPorAluno(alunoId: number): Promise<Observacao[]> {
    const response = await api.get(`/observacoes/aluno/${alunoId}`)
    return response.data
  }

  async adicionarObservacao(dadosObservacao: Omit<Observacao, 'id' | 'created_at' | 'updated_at'>): Promise<Observacao> {
    const response = await api.post('/observacoes', dadosObservacao)
    return response.data
  }

  // === RELATÓRIOS ===

  async getRelatorioTurma(professorId: number, turmaId: number): Promise<RelatorioTurma> {
    const response = await api.get(`/professor/${professorId}/relatorio/turma/${turmaId}`)
    return response.data
  }

  // === UTILIDADES ===

  calcularMedia(notas: Nota[]): number {
    if (notas.length === 0) return 0
    const soma = notas.reduce((acc, nota) => acc + nota.valor, 0)
    return Number((soma / notas.length).toFixed(2))
  }

  calcularFrequencia(presencas: Presenca[]): number {
    if (presencas.length === 0) return 0
    const presentes = presencas.filter(p => p.presente).length
    return Number(((presentes / presencas.length) * 100).toFixed(2))
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  formatarDataParaInput(data: Date = new Date()): string {
    return data.toISOString().split('T')[0]
  }

  obterStatusAluno(notas: Nota[], presencas: Presenca[]): {
    media: number
    frequencia: number
    status: 'aprovado' | 'reprovado' | 'recuperacao' | 'pendente'
  } {
    const media = this.calcularMedia(notas)
    const frequencia = this.calcularFrequencia(presencas)

    let status: 'aprovado' | 'reprovado' | 'recuperacao' | 'pendente' = 'pendente'

    if (media >= 7 && frequencia >= 75) {
      status = 'aprovado'
    } else if (media < 5 || frequencia < 60) {
      status = 'reprovado'
    } else {
      status = 'recuperacao'
    }

    return { media, frequencia, status }
  }

  // Filtros e ordenação
  filtrarPorStatus(alunos: Aluno[], status: string): Aluno[] {
    if (!status || status === 'todos') return alunos
    return alunos.filter(aluno => aluno.status === status)
  }

  ordenarPorNome(alunos: Aluno[]): Aluno[] {
    return [...alunos].sort((a, b) => a.nome.localeCompare(b.nome))
  }

  filtrarNotasPorPeriodo(notas: Nota[], dataInicio: string, dataFim: string): Nota[] {
    return notas.filter(nota => {
      const dataNota = new Date(nota.data_avaliacao)
      const inicio = new Date(dataInicio)
      const fim = new Date(dataFim)
      return dataNota >= inicio && dataNota <= fim
    })
  }

  // Validações
  validarNota(valor: number, valorMaximo: number): boolean {
    return valor >= 0 && valor <= valorMaximo
  }

  validarData(data: string): boolean {
    const hoje = new Date()
    const dataVerificacao = new Date(data)
    return dataVerificacao <= hoje
  }
}

export const professorService = new ProfessorService()