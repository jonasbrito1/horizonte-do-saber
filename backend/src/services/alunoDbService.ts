import fs from 'fs/promises';
import path from 'path';
import userDbService from './userDbService';

// Interfaces para o sistema de gestão de alunos
interface Aluno {
  id: number;
  nome: string;
  data_nascimento: string;
  matricula: string;
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
  serie: string;
  ano_letivo: number;
  professor_responsavel_id: number;
  status: 'ativa' | 'concluida' | 'cancelada';
  capacidade_maxima?: number;
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
  turma_id: number;
  materia: string;
  tipo_avaliacao: 'prova' | 'trabalho' | 'seminario' | 'participacao' | 'outro';
  nota: number;
  nota_maxima: number;
  data_avaliacao: string;
  periodo: string; // 1º Bimestre, 2º Bimestre, etc.
  observacoes?: string;
  professor_id: number;
  created_at: string;
}

class AlunoDbService {
  private alunosPath = path.join(__dirname, '../data/alunos.json');
  private turmasPath = path.join(__dirname, '../data/turmas.json');
  private responsaveisPath = path.join(__dirname, '../data/responsaveis.json');
  private presencasPath = path.join(__dirname, '../data/presencas.json');
  private notasPath = path.join(__dirname, '../data/notas.json');

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

  async createAluno(alunoData: Omit<Aluno, 'id' | 'created_at' | 'updated_at'>): Promise<Aluno> {
    const alunos = await this.loadAlunos();

    // Verificar se matrícula já existe
    const existingAluno = alunos.find(a => a.matricula === alunoData.matricula);
    if (existingAluno) {
      throw new Error('Matrícula já está em uso');
    }

    const newId = Math.max(...alunos.map(a => a.id), 0) + 1;
    const now = new Date().toISOString();

    const newAluno: Aluno = {
      ...alunoData,
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
}

export default new AlunoDbService();
export { Aluno, Turma, Responsavel, Presenca, Nota };