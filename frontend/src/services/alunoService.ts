const API_BASE_URL = '/api';

// Interfaces
export interface Aluno {
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

export interface Turma {
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

export interface Responsavel {
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

export interface Presenca {
  id: number;
  aluno_id: number;
  turma_id: number;
  data: string;
  presente: boolean;
  justificativa?: string;
  registrado_por_id: number;
  created_at: string;
}

export interface Nota {
  id: number;
  aluno_id: number;
  turma_id: number;
  materia: string;
  tipo_avaliacao: 'prova' | 'trabalho' | 'seminario' | 'participacao' | 'outro';
  nota: number;
  nota_maxima: number;
  data_avaliacao: string;
  periodo: string;
  observacoes?: string;
  professor_id: number;
  created_at: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ALUNOS
export const alunoService = {
  async getAllAlunos(): Promise<Aluno[]> {
    const response = await fetch(`${API_BASE_URL}/alunos`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar alunos');
    }

    const data = await response.json();
    return data.data;
  },

  async getAlunoById(id: number): Promise<Aluno> {
    const response = await fetch(`${API_BASE_URL}/alunos/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar aluno');
    }

    const data = await response.json();
    return data.data;
  },

  async getAlunosByTurma(turmaId: number): Promise<Aluno[]> {
    const response = await fetch(`${API_BASE_URL}/alunos?turma_id=${turmaId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar alunos da turma');
    }

    const data = await response.json();
    return data.data;
  },

  async createAluno(alunoData: Omit<Aluno, 'id' | 'created_at' | 'updated_at'>): Promise<Aluno> {
    const response = await fetch(`${API_BASE_URL}/alunos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(alunoData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar aluno');
    }

    const data = await response.json();
    return data.data;
  },

  async updateAluno(id: number, alunoData: Partial<Aluno>): Promise<Aluno> {
    const response = await fetch(`${API_BASE_URL}/alunos/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(alunoData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao atualizar aluno');
    }

    const data = await response.json();
    return data.data;
  },
};

// TURMAS
export const turmaService = {
  async getAllTurmas(): Promise<Turma[]> {
    const response = await fetch(`${API_BASE_URL}/turmas`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar turmas');
    }

    const data = await response.json();
    return data.data;
  },

  async getTurmasByProfessor(professorId: number): Promise<Turma[]> {
    const response = await fetch(`${API_BASE_URL}/turmas?professor_id=${professorId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar turmas do professor');
    }

    const data = await response.json();
    return data.data;
  },

  async createTurma(turmaData: Omit<Turma, 'id' | 'created_at' | 'updated_at'>): Promise<Turma> {
    const response = await fetch(`${API_BASE_URL}/turmas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(turmaData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar turma');
    }

    const data = await response.json();
    return data.data;
  },
};

// RESPONSÁVEIS
export const responsavelService = {
  async createResponsavel(responsavelData: Omit<Responsavel, 'id' | 'created_at' | 'updated_at'>): Promise<Responsavel & { usuarioCriado?: boolean; senhaGerada?: string }> {
    const response = await fetch(`${API_BASE_URL}/responsaveis`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(responsavelData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar responsável');
    }

    const data = await response.json();
    return {
      ...data.data,
      usuarioCriado: data.usuarioCriado,
      senhaGerada: data.senhaGerada
    };
  },
};

// PRESENÇAS
export const presencaService = {
  async registrarPresenca(presencaData: Omit<Presenca, 'id' | 'created_at'>): Promise<Presenca> {
    const response = await fetch(`${API_BASE_URL}/presencas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(presencaData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao registrar presença');
    }

    const data = await response.json();
    return data.data;
  },

  async getPresencasByTurmaEData(turmaId: number, data: string): Promise<Presenca[]> {
    const response = await fetch(`${API_BASE_URL}/presencas?turma_id=${turmaId}&data=${data}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar presenças');
    }

    const responseData = await response.json();
    return responseData.data;
  },

  async getPresencasByAluno(alunoId: number): Promise<Presenca[]> {
    const response = await fetch(`${API_BASE_URL}/presencas?aluno_id=${alunoId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar presenças do aluno');
    }

    const data = await response.json();
    return data.data;
  },
};

// NOTAS
export const notaService = {
  async registrarNota(notaData: Omit<Nota, 'id' | 'created_at'>): Promise<Nota> {
    const response = await fetch(`${API_BASE_URL}/notas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(notaData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao registrar nota');
    }

    const data = await response.json();
    return data.data;
  },

  async getNotasByAluno(alunoId: number): Promise<Nota[]> {
    const response = await fetch(`${API_BASE_URL}/notas?aluno_id=${alunoId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar notas do aluno');
    }

    const data = await response.json();
    return data.data;
  },

  async getNotasByTurma(turmaId: number): Promise<Nota[]> {
    const response = await fetch(`${API_BASE_URL}/notas?turma_id=${turmaId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar notas da turma');
    }

    const data = await response.json();
    return data.data;
  },

  async getNotasByProfessor(professorId: number): Promise<Nota[]> {
    const response = await fetch(`${API_BASE_URL}/notas?professor_id=${professorId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar notas do professor');
    }

    const data = await response.json();
    return data.data;
  },
};