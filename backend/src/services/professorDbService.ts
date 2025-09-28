import fs from 'fs/promises'
import path from 'path'

// Interfaces para os dados do professor
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

class ProfessorDbService {
  private dataDir = path.join(__dirname, '../data')
  private presencasPath = path.join(this.dataDir, 'presencas.json')
  private notasPath = path.join(this.dataDir, 'notas.json')
  private observacoesPath = path.join(this.dataDir, 'observacoes.json')
  private alunosPath = path.join(this.dataDir, 'alunos.json')
  private turmasPath = path.join(this.dataDir, 'turmas.json')

  private async ensureDataDir(): Promise<void> {
    try {
      await fs.access(this.dataDir)
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true })
    }
  }

  // === GESTÃO DE TURMAS ===

  async getTurmasByProfessor(professorId: number): Promise<TurmaComAlunos[]> {
    try {
      const [turmasData, alunosData] = await Promise.all([
        fs.readFile(this.turmasPath, 'utf-8'),
        fs.readFile(this.alunosPath, 'utf-8')
      ])

      const turmas: Turma[] = JSON.parse(turmasData)
      const alunos: Aluno[] = JSON.parse(alunosData)

      const turmasProfessor = turmas.filter(turma =>
        turma.professor_responsavel_id === professorId && turma.status === 'ativa'
      )

      const turmasComAlunos: TurmaComAlunos[] = turmasProfessor.map(turma => {
        const alunosTurma = alunos.filter(aluno =>
          aluno.turma_id === turma.id && aluno.status === 'ativo'
        )

        return {
          ...turma,
          alunos: alunosTurma,
          total_alunos: alunosTurma.length
        }
      })

      return turmasComAlunos
    } catch (error) {
      console.error('Erro ao buscar turmas do professor:', error)
      return []
    }
  }

  async getTurmaDetalhes(turmaId: number, professorId: number): Promise<TurmaComAlunos | null> {
    try {
      const turmas = await this.getTurmasByProfessor(professorId)
      const turma = turmas.find(t => t.id === turmaId)

      if (!turma) return null

      // Buscar presenças de hoje
      const hoje = new Date().toISOString().split('T')[0]
      const presencasHoje = await this.getPresencasPorData(turmaId, hoje)

      return {
        ...turma,
        presencas_hoje: presencasHoje,
        ultima_atualizacao_presenca: presencasHoje.length > 0 ?
          new Date().toISOString() : undefined
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da turma:', error)
      return null
    }
  }

  // === GESTÃO DE PRESENÇAS ===

  async getPresencas(): Promise<Presenca[]> {
    try {
      const data = await fs.readFile(this.presencasPath, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      console.error('Erro ao ler presenças:', error)
      return []
    }
  }

  async savePresencas(presencas: Presenca[]): Promise<void> {
    await this.ensureDataDir()
    const jsonData = JSON.stringify(presencas, null, 2)
    await fs.writeFile(this.presencasPath, jsonData, { encoding: 'utf-8' })
  }

  async getPresencasPorData(turmaId: number, data: string): Promise<Presenca[]> {
    const presencas = await this.getPresencas()
    return presencas.filter(p => p.turma_id === turmaId && p.data === data)
  }

  async registrarPresenca(dadosPresenca: Omit<Presenca, 'id' | 'created_at' | 'updated_at'>): Promise<Presenca> {
    const presencas = await this.getPresencas()
    const novoId = presencas.length > 0 ? Math.max(...presencas.map(p => p.id)) + 1 : 1

    // Verificar se já existe presença para este aluno nesta data
    const presencaExistente = presencas.find(p =>
      p.aluno_id === dadosPresenca.aluno_id &&
      p.turma_id === dadosPresenca.turma_id &&
      p.data === dadosPresenca.data
    )

    if (presencaExistente) {
      // Atualizar presença existente
      presencaExistente.presente = dadosPresenca.presente
      presencaExistente.observacoes = dadosPresenca.observacoes
      presencaExistente.updated_at = new Date().toISOString()

      await this.savePresencas(presencas)
      return presencaExistente
    } else {
      // Criar nova presença
      const novaPresenca: Presenca = {
        ...dadosPresenca,
        id: novoId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      presencas.push(novaPresenca)
      await this.savePresencas(presencas)
      return novaPresenca
    }
  }

  async registrarPresencaLote(turmaId: number, professorId: number, data: string, presencasAlunos: Array<{aluno_id: number, presente: boolean, observacoes?: string}>): Promise<Presenca[]> {
    const presencasRegistradas: Presenca[] = []

    for (const presencaAluno of presencasAlunos) {
      const presenca = await this.registrarPresenca({
        aluno_id: presencaAluno.aluno_id,
        turma_id: turmaId,
        professor_id: professorId,
        data,
        presente: presencaAluno.presente,
        observacoes: presencaAluno.observacoes || ''
      })
      presencasRegistradas.push(presenca)
    }

    return presencasRegistradas
  }

  // === GESTÃO DE NOTAS ===

  async getNotas(): Promise<Nota[]> {
    try {
      const data = await fs.readFile(this.notasPath, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      console.error('Erro ao ler notas:', error)
      return []
    }
  }

  async saveNotas(notas: Nota[]): Promise<void> {
    await this.ensureDataDir()
    const jsonData = JSON.stringify(notas, null, 2)
    await fs.writeFile(this.notasPath, jsonData, { encoding: 'utf-8' })
  }

  async getNotasPorTurma(turmaId: number): Promise<Nota[]> {
    const notas = await this.getNotas()
    return notas.filter(n => n.turma_id === turmaId)
  }

  async getNotasPorAluno(alunoId: number): Promise<Nota[]> {
    const notas = await this.getNotas()
    return notas.filter(n => n.aluno_id === alunoId)
  }

  async adicionarNota(dadosNota: Omit<Nota, 'id' | 'created_at' | 'updated_at'>): Promise<Nota> {
    const notas = await this.getNotas()
    const novoId = notas.length > 0 ? Math.max(...notas.map(n => n.id)) + 1 : 1

    const novaNota: Nota = {
      ...dadosNota,
      id: novoId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    notas.push(novaNota)
    await this.saveNotas(notas)
    return novaNota
  }

  async atualizarNota(id: number, dadosAtualizacao: Partial<Omit<Nota, 'id' | 'created_at' | 'updated_at'>>): Promise<Nota | null> {
    const notas = await this.getNotas()
    const notaIndex = notas.findIndex(n => n.id === id)

    if (notaIndex === -1) return null

    notas[notaIndex] = {
      ...notas[notaIndex],
      ...dadosAtualizacao,
      updated_at: new Date().toISOString()
    }

    await this.saveNotas(notas)
    return notas[notaIndex]
  }

  // === GESTÃO DE OBSERVAÇÕES ===

  async getObservacoes(): Promise<Observacao[]> {
    try {
      const data = await fs.readFile(this.observacoesPath, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      console.error('Erro ao ler observações:', error)
      return []
    }
  }

  async saveObservacoes(observacoes: Observacao[]): Promise<void> {
    await this.ensureDataDir()
    const jsonData = JSON.stringify(observacoes, null, 2)
    await fs.writeFile(this.observacoesPath, jsonData, { encoding: 'utf-8' })
  }

  async getObservacoesPorTurma(turmaId: number): Promise<Observacao[]> {
    const observacoes = await this.getObservacoes()
    return observacoes.filter(o => o.turma_id === turmaId)
  }

  async getObservacoesPorAluno(alunoId: number): Promise<Observacao[]> {
    const observacoes = await this.getObservacoes()
    return observacoes.filter(o => o.aluno_id === alunoId)
  }

  async adicionarObservacao(dadosObservacao: Omit<Observacao, 'id' | 'created_at' | 'updated_at'>): Promise<Observacao> {
    const observacoes = await this.getObservacoes()
    const novoId = observacoes.length > 0 ? Math.max(...observacoes.map(o => o.id)) + 1 : 1

    const novaObservacao: Observacao = {
      ...dadosObservacao,
      id: novoId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    observacoes.push(novaObservacao)
    await this.saveObservacoes(observacoes)
    return novaObservacao
  }

  // === RELATÓRIOS E ESTATÍSTICAS ===

  async getRelatorioTurma(turmaId: number, professorId: number): Promise<RelatorioTurma | null> {
    try {
      const turmas = await this.getTurmasByProfessor(professorId)
      const turma = turmas.find(t => t.id === turmaId)

      if (!turma) return null

      const [notas, presencas] = await Promise.all([
        this.getNotasPorTurma(turmaId),
        this.getPresencas()
      ])

      const mesAtual = new Date().getMonth() + 1
      const anoAtual = new Date().getFullYear()

      // Filtrar dados do mês atual
      const notasMes = notas.filter(n => {
        const dataNota = new Date(n.data_avaliacao)
        return dataNota.getMonth() + 1 === mesAtual && dataNota.getFullYear() === anoAtual
      })

      const presencasMes = presencas.filter(p => {
        const dataPresenca = new Date(p.data)
        return dataPresenca.getMonth() + 1 === mesAtual &&
               dataPresenca.getFullYear() === anoAtual &&
               p.turma_id === turmaId
      })

      // Calcular média geral da turma
      const mediaGeral = notasMes.length > 0 ?
        notasMes.reduce((acc, nota) => acc + nota.valor, 0) / notasMes.length : 0

      // Identificar alunos com dificuldades (média < 6.0)
      const alunosComDificuldades = new Set()
      turma.alunos.forEach(aluno => {
        const notasAluno = notasMes.filter(n => n.aluno_id === aluno.id)
        if (notasAluno.length > 0) {
          const mediaAluno = notasAluno.reduce((acc, nota) => acc + nota.valor, 0) / notasAluno.length
          if (mediaAluno < 6.0) {
            alunosComDificuldades.add(aluno.id)
          }
        }
      })

      return {
        turma,
        total_alunos: turma.alunos.length,
        total_presencas_mes: presencasMes.length,
        total_avaliacoes_mes: notasMes.length,
        media_geral_turma: Number(mediaGeral.toFixed(2)),
        alunos_com_dificuldades: alunosComDificuldades.size,
        ultima_atividade: new Date().toISOString()
      }
    } catch (error) {
      console.error('Erro ao gerar relatório da turma:', error)
      return null
    }
  }

  async getDashboardProfessor(professorId: number): Promise<{
    total_turmas: number
    total_alunos: number
    presencas_hoje: number
    avaliacoes_pendentes: number
    turmas: TurmaComAlunos[]
  }> {
    try {
      const turmas = await this.getTurmasByProfessor(professorId)
      const totalAlunos = turmas.reduce((acc, turma) => acc + turma.total_alunos, 0)

      const hoje = new Date().toISOString().split('T')[0]
      const presencas = await this.getPresencas()
      const presencasHoje = presencas.filter(p =>
        p.professor_id === professorId && p.data === hoje
      ).length

      return {
        total_turmas: turmas.length,
        total_alunos: totalAlunos,
        presencas_hoje: presencasHoje,
        avaliacoes_pendentes: 0, // TODO: implementar lógica de avaliações pendentes
        turmas
      }
    } catch (error) {
      console.error('Erro ao gerar dashboard do professor:', error)
      return {
        total_turmas: 0,
        total_alunos: 0,
        presencas_hoje: 0,
        avaliacoes_pendentes: 0,
        turmas: []
      }
    }
  }
}

export const professorDbService = new ProfessorDbService()