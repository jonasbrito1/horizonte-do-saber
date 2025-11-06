import fs from 'fs/promises';
import path from 'path';
import userDbService from './userDbService';
import emailService from './emailService';

// Interfaces para o sistema de gestão de alunos
interface Aluno {
  id: number;
  nome: string;
  data_nascimento: string;
  numero_matricula: string;
  cpf?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  turma_id?: number;
  responsavel_id?: number;
  status: 'ativo' | 'inativo' | 'transferido';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface Turma {
  id: number;
  nome: string;
  nivel?: string;
  serie: string;
  turno?: 'manha' | 'tarde' | 'noite';
  ano_letivo: number;
  professor_responsavel_id?: number;
  status: 'ativa' | 'concluida' | 'cancelada';
  capacidade_maxima?: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface Responsavel {
  id: number;
  nome: string;
  email?: string;
  telefone: string;
  cpf?: string;
  endereco?: string;
  parentesco: 'pai' | 'mae' | 'avo' | 'ava' | 'tio' | 'tia' | 'outro';
  eh_principal: boolean;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface Presenca {
  id: number;
  aluno_id: number;
  turma_id: number;
  data: string;
  presente: boolean;
  justificativa?: string;
  registrado_por_id: number;
  created_at: string;
}

interface Nota {
  id: number;
  aluno_id: number;
  turma_id?: number;
  materia: string;
  tipo_avaliacao: 'prova' | 'trabalho' | 'seminario' | 'participacao' | 'outro';
  nota: number;
  nota_maxima: number;
  data_avaliacao: string;
  bimestre: number; // 1, 2, 3, 4
  observacoes?: string;
  professor_id?: number;
  created_at: string;
}

interface Frequencia {
  id: number;
  aluno_id: number;
  turma_id: number;
  data: string; // YYYY-MM-DD
  status: 'presente' | 'ausente' | 'justificado';
  observacoes?: string;
  registrado_por_id?: number;
  created_at: string;
}

class AlunoDbService {
  private alunosPath = path.join(__dirname, '../data/alunos.json');
  private turmasPath = path.join(__dirname, '../data/turmas.json');
  private responsaveisPath = path.join(__dirname, '../data/responsaveis.json');
  private presencasPath = path.join(__dirname, '../data/presencas.json');
  private notasPath = path.join(__dirname, '../data/notas.json');
  private frequenciasPath = path.join(__dirname, '../data/frequencias.json');

  async ensureDataDir() {
    const dir = path.dirname(this.alunosPath);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  // ========== ALUNOS ==========
  async loadAlunos(): Promise<Aluno[]> {
    try {
      await this.ensureDataDir();
      const data = await fs.readFile(this.alunosPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      await this.saveAlunos([]);
      return [];
    }
  }

  async saveAlunos(alunos: Aluno[]): Promise<void> {
    await this.ensureDataDir();
    // Garantir encoding UTF-8 para suporte a acentuação pt-BR
    const jsonData = JSON.stringify(alunos, null, 2);
    await fs.writeFile(this.alunosPath, jsonData, { encoding: 'utf-8' });
  }

  async createAluno(alunoData: any): Promise<any> {
    const alunos = await this.loadAlunos();

    // Gerar número de matrícula automático e único
    // Formato: YYYY-TURMA-XXX (ex: 2025-1A-001)
    let numero_matricula = alunoData.numero_matricula;

    // Se não foi fornecida ou já existe, gerar uma nova
    if (!numero_matricula || alunos.find((a: any) => a.numero_matricula === numero_matricula)) {
      const ano = new Date().getFullYear();

      // Extrair série e turma da matricula fornecida ou gerar genérico
      let prefixo = `${ano}-GEN`;

      if (numero_matricula) {
        // Extrair o prefixo da matrícula fornecida (ex: "2025-1A" de "2025-1A-123")
        const match = numero_matricula.match(/^(\d{4}-\w+)/);
        if (match) {
          prefixo = match[1];
        }
      }

      // Encontrar o último número sequencial usado com este prefixo
      const matriculasComPrefixo = alunos
        .filter((a: any) => a.numero_matricula?.startsWith(prefixo))
        .map((a: any) => {
          const match = a.numero_matricula?.match(/-(\d+)$/);
          return match ? parseInt(match[1]) : 0;
        });

      let numeroSequencial = 1;
      if (matriculasComPrefixo.length > 0) {
        numeroSequencial = Math.max(...matriculasComPrefixo) + 1;
      }

      numero_matricula = `${prefixo}-${numeroSequencial.toString().padStart(3, '0')}`;
    }

    const newId = Math.max(...alunos.map((a: any) => a.id), 0) + 1;
    const now = new Date().toISOString();

    const newAluno = {
      ...alunoData,
      numero_matricula,
      id: newId,
      created_at: now,
      updated_at: now
    };

    alunos.push(newAluno);
    await this.saveAlunos(alunos);
    return newAluno;
  }

  async getAllAlunos(): Promise<Aluno[]> {
    return await this.loadAlunos();
  }

  async getAlunoById(id: number): Promise<Aluno | null> {
    const alunos = await this.loadAlunos();
    return alunos.find(a => a.id === id) || null;
  }

  async getAlunosByTurma(turmaId: number): Promise<Aluno[]> {
    const alunos = await this.loadAlunos();
    return alunos.filter(a => a.turma_id === turmaId);
  }

  async updateAluno(id: number, alunoData: Partial<Aluno>): Promise<Aluno> {
    const alunos = await this.loadAlunos();
    const alunoIndex = alunos.findIndex(a => a.id === id);

    if (alunoIndex === -1) {
      throw new Error('Aluno não encontrado');
    }

    alunos[alunoIndex] = {
      ...alunos[alunoIndex],
      ...alunoData,
      updated_at: new Date().toISOString()
    };

    await this.saveAlunos(alunos);
    return alunos[alunoIndex];
  }

  async deleteAluno(id: number): Promise<void> {
    const alunos = await this.loadAlunos();
    const alunoIndex = alunos.findIndex(a => a.id === id);

    if (alunoIndex === -1) {
      throw new Error('Aluno não encontrado');
    }

    alunos.splice(alunoIndex, 1);
    await this.saveAlunos(alunos);
  }

  // ========== TURMAS ==========
  async loadTurmas(): Promise<Turma[]> {
    try {
      await this.ensureDataDir();
      const data = await fs.readFile(this.turmasPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      await this.saveTurmas([]);
      return [];
    }
  }

  async saveTurmas(turmas: Turma[]): Promise<void> {
    await this.ensureDataDir();
    const jsonData = JSON.stringify(turmas, null, 2);
    await fs.writeFile(this.turmasPath, jsonData, { encoding: 'utf-8' });
  }

  async createTurma(turmaData: Omit<Turma, 'id' | 'created_at' | 'updated_at'>): Promise<Turma> {
    const turmas = await this.loadTurmas();
    const newId = Math.max(...turmas.map(t => t.id), 0) + 1;
    const now = new Date().toISOString();

    const newTurma: Turma = {
      ...turmaData,
      id: newId,
      created_at: now,
      updated_at: now
    };

    turmas.push(newTurma);
    await this.saveTurmas(turmas);
    return newTurma;
  }

  async getAllTurmas(): Promise<Turma[]> {
    return await this.loadTurmas();
  }

  async getTurmasByProfessor(professorId: number): Promise<Turma[]> {
    const turmas = await this.loadTurmas();
    return turmas.filter(t => t.professor_responsavel_id === professorId);
  }

  async updateTurma(id: number, turmaData: Partial<Omit<Turma, 'id' | 'created_at' | 'updated_at'>>): Promise<Turma> {
    const turmas = await this.loadTurmas();
    const turmaIndex = turmas.findIndex(t => t.id === id);

    if (turmaIndex === -1) {
      throw new Error('Turma não encontrada');
    }

    const updatedTurma: Turma = {
      ...turmas[turmaIndex],
      ...turmaData,
      updated_at: new Date().toISOString()
    };

    turmas[turmaIndex] = updatedTurma;
    await this.saveTurmas(turmas);
    return updatedTurma;
  }

  async deleteTurma(id: number): Promise<void> {
    const turmas = await this.loadTurmas();
    const turmaIndex = turmas.findIndex(t => t.id === id);

    if (turmaIndex === -1) {
      throw new Error('Turma não encontrada');
    }

    turmas.splice(turmaIndex, 1);
    await this.saveTurmas(turmas);
  }

  // ========== RESPONSÁVEIS ==========
  async loadResponsaveis(): Promise<Responsavel[]> {
    try {
      await this.ensureDataDir();
      const data = await fs.readFile(this.responsaveisPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      await this.saveResponsaveis([]);
      return [];
    }
  }

  async saveResponsaveis(responsaveis: Responsavel[]): Promise<void> {
    await this.ensureDataDir();
    const jsonData = JSON.stringify(responsaveis, null, 2);
    await fs.writeFile(this.responsaveisPath, jsonData, { encoding: 'utf-8' });
  }

  async createResponsavel(responsavelData: Omit<Responsavel, 'id' | 'created_at' | 'updated_at'>): Promise<{ responsavel: Responsavel; usuarioCriado?: boolean; senhaGerada?: string }> {
    const responsaveis = await this.loadResponsaveis();
    const newId = Math.max(...responsaveis.map(r => r.id), 0) + 1;
    const now = new Date().toISOString();

    const newResponsavel: Responsavel = {
      ...responsavelData,
      id: newId,
      created_at: now,
      updated_at: now
    };

    responsaveis.push(newResponsavel);
    await this.saveResponsaveis(responsaveis);

    // Verificar se precisa criar usuário automaticamente
    let usuarioCriado = false;
    let senhaGerada: string | undefined;

    if (responsavelData.email) {
      try {
        // Verificar se já existe usuário com este email
        const existingUser = await userDbService.findUserByEmail(responsavelData.email);

        if (!existingUser) {
          // Criar usuário automaticamente para o responsável
          console.log(`🔧 Criando usuário automaticamente para responsável: ${responsavelData.nome}`);

          const userResult = await userDbService.createUser({
            nome: responsavelData.nome,
            email: responsavelData.email,
            telefone: responsavelData.telefone,
            endereco: responsavelData.endereco,
            tipo: 'responsavel',
            gerarSenhaAutomatica: true
          });

          usuarioCriado = true;
          senhaGerada = userResult.senhaGerada;

          console.log(`✅ Usuário criado com sucesso para: ${responsavelData.email}`);
          if (senhaGerada) {
            console.log(`🔑 Senha gerada: ${senhaGerada}`);

            // Enviar email com credenciais de acesso
            try {
              await emailService.sendWelcomeEmail(
                responsavelData.nome,
                responsavelData.email,
                senhaGerada,
                userResult.user.id
              );
              console.log(`📧 Email de boas-vindas enviado para: ${responsavelData.email}`);
            } catch (emailError) {
              console.error(`❌ Erro ao enviar email para: ${responsavelData.email}`, emailError);
              // Não falhar a criação se o email não for enviado
            }
          }
        } else {
          console.log(`ℹ️ Usuário já existe para o email: ${responsavelData.email}`);
        }
      } catch (error) {
        console.error(`❌ Erro ao criar usuário para responsável: ${error}`);
        // Não falhar a criação do responsável se der erro na criação do usuário
      }
    }

    return {
      responsavel: newResponsavel,
      usuarioCriado,
      senhaGerada
    };
  }

  // ========== PRESENÇAS ==========
  async loadPresencas(): Promise<Presenca[]> {
    try {
      await this.ensureDataDir();
      const data = await fs.readFile(this.presencasPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      await this.savePresencas([]);
      return [];
    }
  }

  async savePresencas(presencas: Presenca[]): Promise<void> {
    await this.ensureDataDir();
    const jsonData = JSON.stringify(presencas, null, 2);
    await fs.writeFile(this.presencasPath, jsonData, { encoding: 'utf-8' });
  }

  async registrarPresenca(presencaData: Omit<Presenca, 'id' | 'created_at'>): Promise<Presenca> {
    const presencas = await this.loadPresencas();

    // Verificar se já existe presença para este aluno na data
    const existingPresenca = presencas.find(p =>
      p.aluno_id === presencaData.aluno_id &&
      p.data === presencaData.data &&
      p.turma_id === presencaData.turma_id
    );

    if (existingPresenca) {
      // Atualizar presença existente
      existingPresenca.presente = presencaData.presente;
      existingPresenca.justificativa = presencaData.justificativa;
      await this.savePresencas(presencas);
      return existingPresenca;
    }

    const newId = Math.max(...presencas.map(p => p.id), 0) + 1;
    const newPresenca: Presenca = {
      ...presencaData,
      id: newId,
      created_at: new Date().toISOString()
    };

    presencas.push(newPresenca);
    await this.savePresencas(presencas);
    return newPresenca;
  }

  async getPresencasByTurmaEData(turmaId: number, data: string): Promise<Presenca[]> {
    const presencas = await this.loadPresencas();
    return presencas.filter(p => p.turma_id === turmaId && p.data === data);
  }

  async getPresencasByAluno(alunoId: number): Promise<Presenca[]> {
    const presencas = await this.loadPresencas();
    return presencas.filter(p => p.aluno_id === alunoId);
  }

  // ========== NOTAS ==========
  async loadNotas(): Promise<Nota[]> {
    try {
      await this.ensureDataDir();
      const data = await fs.readFile(this.notasPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      await this.saveNotas([]);
      return [];
    }
  }

  async saveNotas(notas: Nota[]): Promise<void> {
    await this.ensureDataDir();
    const jsonData = JSON.stringify(notas, null, 2);
    await fs.writeFile(this.notasPath, jsonData, { encoding: 'utf-8' });
  }

  async registrarNota(notaData: Omit<Nota, 'id' | 'created_at'>): Promise<Nota> {
    const notas = await this.loadNotas();
    const newId = Math.max(...notas.map(n => n.id), 0) + 1;

    const newNota: Nota = {
      ...notaData,
      id: newId,
      created_at: new Date().toISOString()
    };

    notas.push(newNota);
    await this.saveNotas(notas);
    return newNota;
  }

  async getNotasByAluno(alunoId: number): Promise<Nota[]> {
    const notas = await this.loadNotas();
    return notas.filter(n => n.aluno_id === alunoId);
  }

  async getNotasByTurma(turmaId: number): Promise<Nota[]> {
    const notas = await this.loadNotas();
    return notas.filter(n => n.turma_id === turmaId);
  }

  async getNotasByProfessor(professorId: number): Promise<Nota[]> {
    const notas = await this.loadNotas();
    return notas.filter(n => n.professor_id === professorId);
  }

  async updateNota(id: number, notaData: Partial<Nota>): Promise<Nota> {
    const notas = await this.loadNotas();
    const notaIndex = notas.findIndex(n => n.id === id);

    if (notaIndex === -1) {
      throw new Error('Nota não encontrada');
    }

    notas[notaIndex] = {
      ...notas[notaIndex],
      ...notaData,
      id: notas[notaIndex].id, // Garantir que o ID não seja alterado
      created_at: notas[notaIndex].created_at // Garantir que created_at não seja alterado
    };

    await this.saveNotas(notas);
    return notas[notaIndex];
  }

  async deleteNota(id: number): Promise<boolean> {
    const notas = await this.loadNotas();
    const notaIndex = notas.findIndex(n => n.id === id);

    if (notaIndex === -1) {
      throw new Error('Nota não encontrada');
    }

    notas.splice(notaIndex, 1);
    await this.saveNotas(notas);
    return true;
  }

  // Lançar notas em lote para uma turma
  async registrarNotasEmLote(notasData: Array<Omit<Nota, 'id' | 'created_at'>>): Promise<Nota[]> {
    const notas = await this.loadNotas();
    const notasCriadas: Nota[] = [];
    let currentId = Math.max(...notas.map(n => n.id), 0);

    for (const notaData of notasData) {
      currentId++;
      const newNota: Nota = {
        ...notaData,
        id: currentId,
        created_at: new Date().toISOString()
      };
      notas.push(newNota);
      notasCriadas.push(newNota);
    }

    await this.saveNotas(notas);
    return notasCriadas;
  }

  // Buscar notas de uma turma com informações de alunos
  async getNotasTurmaComAlunos(turmaId: number, bimestre?: number): Promise<any[]> {
    const notas = await this.getNotasByTurma(turmaId);
    const alunos = await this.getAlunosByTurma(turmaId);

    let notasFiltradas = notas;
    if (bimestre) {
      notasFiltradas = notas.filter(n => n.bimestre === bimestre);
    }

    // Agrupar notas por aluno
    const notasPorAluno = notasFiltradas.reduce((acc, nota) => {
      if (!acc[nota.aluno_id]) {
        acc[nota.aluno_id] = [];
      }
      acc[nota.aluno_id].push(nota);
      return acc;
    }, {} as Record<number, Nota[]>);

    // Combinar com informações dos alunos
    return alunos.map(aluno => ({
      ...aluno,
      notas: notasPorAluno[aluno.id] || []
    }));
  }

  // Calcular média de um aluno em um período
  async calcularMediaAluno(alunoId: number, bimestre?: number): Promise<number> {
    let notas = await this.getNotasByAluno(alunoId);

    if (bimestre) {
      notas = notas.filter(n => n.bimestre === bimestre);
    }

    if (notas.length === 0) return 0;

    const somaPercentuais = notas.reduce((acc, nota) => {
      return acc + (nota.nota / nota.nota_maxima) * 100;
    }, 0);

    return somaPercentuais / notas.length;
  }

  // Calcular média por disciplina de um aluno em um período
  async calcularMediaPorDisciplina(alunoId: number, bimestre: number): Promise<Record<string, number>> {
    const notas = await this.getNotasByAluno(alunoId);
    const notasPeriodo = notas.filter(n => n.bimestre === bimestre);

    const mediasPorDisciplina: Record<string, number> = {};

    // Agrupar notas por matéria
    const notasPorMateria = notasPeriodo.reduce((acc, nota) => {
      if (!acc[nota.materia]) {
        acc[nota.materia] = [];
      }
      acc[nota.materia].push(nota);
      return acc;
    }, {} as Record<string, Nota[]>);

    // Calcular média de cada matéria
    for (const [materia, notasMateria] of Object.entries(notasPorMateria)) {
      const somaPercentuais = notasMateria.reduce((acc, nota) => {
        return acc + (nota.nota / nota.nota_maxima) * 10;
      }, 0);
      mediasPorDisciplina[materia] = somaPercentuais / notasMateria.length;
    }

    return mediasPorDisciplina;
  }

  // Calcular nota final do bimestre (média de todas as disciplinas)
  async calcularNotaFinalBimestre(alunoId: number, bimestre: number): Promise<number> {
    const mediasPorDisciplina = await this.calcularMediaPorDisciplina(alunoId, bimestre);
    const disciplinas = Object.values(mediasPorDisciplina);

    if (disciplinas.length === 0) return 0;

    const soma = disciplinas.reduce((acc, media) => acc + media, 0);
    return soma / disciplinas.length;
  }

  // ============ MÉTODOS DE FREQUÊNCIA ============

  async loadFrequencias(): Promise<Frequencia[]> {
    try {
      const data = await fs.readFile(this.frequenciasPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async saveFrequencias(frequencias: Frequencia[]): Promise<void> {
    await fs.writeFile(this.frequenciasPath, JSON.stringify(frequencias, null, 2));
  }

  // Registrar frequência em lote (todos os alunos de uma turma numa data)
  async registrarFrequenciaLote(frequenciasData: Array<Omit<Frequencia, 'id' | 'created_at'>>): Promise<Frequencia[]> {
    const frequencias = await this.loadFrequencias();
    const frequenciasCriadas: Frequencia[] = [];
    let currentId = Math.max(...frequencias.map(f => f.id), 0);

    for (const freqData of frequenciasData) {
      // Verificar se já existe frequência para este aluno nesta data
      const existingIndex = frequencias.findIndex(
        f => f.aluno_id === freqData.aluno_id && f.data === freqData.data
      );

      if (existingIndex >= 0) {
        // Atualizar existente
        frequencias[existingIndex] = {
          ...frequencias[existingIndex],
          ...freqData
        };
        frequenciasCriadas.push(frequencias[existingIndex]);
      } else {
        // Criar nova
        currentId++;
        const newFreq: Frequencia = {
          ...freqData,
          id: currentId,
          created_at: new Date().toISOString()
        };
        frequencias.push(newFreq);
        frequenciasCriadas.push(newFreq);
      }
    }

    await this.saveFrequencias(frequencias);
    return frequenciasCriadas;
  }

  // Buscar frequências por turma e data
  async getFrequenciasByTurmaData(turmaId: number, data: string): Promise<Frequencia[]> {
    const frequencias = await this.loadFrequencias();
    return frequencias.filter(f => f.turma_id === turmaId && f.data === data);
  }

  // Buscar frequências por aluno
  async getFrequenciasByAluno(alunoId: number, dataInicio?: string, dataFim?: string): Promise<Frequencia[]> {
    const frequencias = await this.loadFrequencias();
    let result = frequencias.filter(f => f.aluno_id === alunoId);

    if (dataInicio) {
      result = result.filter(f => f.data >= dataInicio);
    }
    if (dataFim) {
      result = result.filter(f => f.data <= dataFim);
    }

    return result;
  }

  // Calcular taxa de presença de um aluno
  async calcularTaxaPresenca(alunoId: number, dataInicio?: string, dataFim?: string): Promise<number> {
    const frequencias = await this.getFrequenciasByAluno(alunoId, dataInicio, dataFim);

    if (frequencias.length === 0) return 0;

    const presencas = frequencias.filter(f => f.status === 'presente').length;
    return (presencas / frequencias.length) * 100;
  }
}

export default new AlunoDbService();
export { Aluno, Turma, Responsavel, Presenca, Nota, Frequencia };