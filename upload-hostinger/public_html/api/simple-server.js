const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3008;

// Middleware
app.use(cors({
  origin: ['http://localhost:5181', 'http://localhost:5182', 'http://localhost:5183', 'http://localhost:5184', 'http://localhost:5185', 'http://localhost:5186', 'http://localhost:5187'],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Mock data

// Professores
const mockProfessores = [
  {
    id: 1,
    nome: "Prof. Maria Silva",
    email: "maria.silva@escola.com",
    telefone: "(11) 98765-4321",
    disciplinas: ["Português", "Literatura"],
    data_contratacao: "2020-03-15",
    status: "ativo",
    turmas_responsavel: 2,
    usuario_id: 101,
    created_at: "2020-03-15T10:00:00.000Z",
    updated_at: "2024-01-15T10:00:00.000Z"
  },
  {
    id: 2,
    nome: "Prof. João Santos",
    email: "joao.santos@escola.com",
    telefone: "(11) 98765-4322",
    disciplinas: ["Matemática", "Geometria"],
    data_contratacao: "2019-08-10",
    status: "ativo",
    turmas_responsavel: 1,
    usuario_id: 102,
    created_at: "2019-08-10T10:00:00.000Z",
    updated_at: "2024-01-15T10:00:00.000Z"
  },
  {
    id: 3,
    nome: "Profª. Ana Costa",
    email: "ana.costa@escola.com",
    telefone: "(11) 98765-4323",
    disciplinas: ["Ciências", "Biologia"],
    data_contratacao: "2021-02-01",
    status: "ativo",
    turmas_responsavel: 0,
    usuario_id: 103,
    created_at: "2021-02-01T10:00:00.000Z",
    updated_at: "2024-01-15T10:00:00.000Z"
  },
  {
    id: 4,
    nome: "Prof. Carlos Ribeiro",
    email: "carlos.ribeiro@escola.com",
    telefone: "(11) 98765-4324",
    disciplinas: ["História", "Geografia"],
    data_contratacao: "2022-01-20",
    status: "ativo",
    turmas_responsavel: 0,
    usuario_id: 104,
    created_at: "2022-01-20T10:00:00.000Z",
    updated_at: "2024-01-15T10:00:00.000Z"
  },
  {
    id: 5,
    nome: "Profª. Fernanda Oliveira",
    email: "fernanda.oliveira@escola.com",
    telefone: "(11) 98765-4325",
    disciplinas: ["Educação Física", "Arte"],
    data_contratacao: "2023-06-15",
    status: "afastado",
    turmas_responsavel: 0,
    usuario_id: 105,
    created_at: "2023-06-15T10:00:00.000Z",
    updated_at: "2024-01-15T10:00:00.000Z"
  }
];

// Responsáveis
const mockResponsaveis = [
  {
    id: 1,
    nome: "Roberto Silva",
    email: "roberto.silva@email.com",
    telefone: "(11) 99999-0001",
    cpf: "123.456.789-01",
    parentesco: "pai",
    usuario_id: 201
  },
  {
    id: 2,
    nome: "Carla Santos",
    email: "carla.santos@email.com",
    telefone: "(11) 99999-0002",
    cpf: "123.456.789-02",
    parentesco: "mãe",
    usuario_id: 202
  },
  {
    id: 3,
    nome: "José Mendes",
    email: "jose.mendes@email.com",
    telefone: "(11) 99999-0003",
    cpf: "123.456.789-03",
    parentesco: "pai",
    usuario_id: 203
  },
  {
    id: 4,
    nome: "Sandra Costa",
    email: "sandra.costa@email.com",
    telefone: "(11) 99999-0004",
    cpf: "123.456.789-04",
    parentesco: "mãe",
    usuario_id: 204
  },
  {
    id: 5,
    nome: "Paulo Ferreira",
    email: "paulo.ferreira@email.com",
    telefone: "(11) 99999-0005",
    cpf: "123.456.789-05",
    parentesco: "pai",
    usuario_id: 205
  },
  {
    id: 6,
    nome: "Márcia Lima",
    email: "marcia.lima@email.com",
    telefone: "(11) 99999-0006",
    cpf: "123.456.789-06",
    parentesco: "mãe",
    usuario_id: 206
  },
  {
    id: 7,
    nome: "Ricardo Oliveira",
    email: "ricardo.oliveira@email.com",
    telefone: "(11) 99999-0007",
    cpf: "123.456.789-07",
    parentesco: "pai",
    usuario_id: 207
  },
  {
    id: 8,
    nome: "Juliana Pedro",
    email: "juliana.pedro@email.com",
    telefone: "(11) 99999-0008",
    cpf: "123.456.789-08",
    parentesco: "mãe",
    usuario_id: 208
  },
  {
    id: 9,
    nome: "Fernando Rocha",
    email: "fernando.rocha@email.com",
    telefone: "(11) 99999-0009",
    cpf: "123.456.789-09",
    parentesco: "pai",
    usuario_id: 209
  },
  {
    id: 10,
    nome: "Patrícia Alves",
    email: "patricia.alves@email.com",
    telefone: "(11) 99999-0010",
    cpf: "123.456.789-10",
    parentesco: "mãe",
    usuario_id: 210
  },
  {
    id: 11,
    nome: "Luiz Santos",
    email: "luiz.santos@email.com",
    telefone: "(11) 99999-0011",
    cpf: "123.456.789-11",
    parentesco: "pai",
    usuario_id: 211
  },
  {
    id: 12,
    nome: "Elena Souza",
    email: "elena.souza@email.com",
    telefone: "(11) 99999-0012",
    cpf: "123.456.789-12",
    parentesco: "mãe",
    usuario_id: 212
  }
];

// Usuários do sistema
const mockUsuarios = [
  // Administradores
  {
    id: 1,
    email: "admin@escola.com",
    tipo: "admin",
    nivel: "administrador",
    nome: "Admin Sistema",
    status: "ativo"
  },
  // Professores
  {
    id: 101,
    email: "maria.silva@escola.com",
    tipo: "professor",
    nivel: "professor",
    nome: "Prof. Maria Silva",
    status: "ativo"
  },
  {
    id: 102,
    email: "joao.santos@escola.com",
    tipo: "professor",
    nivel: "professor",
    nome: "Prof. João Santos",
    status: "ativo"
  },
  {
    id: 103,
    email: "ana.costa@escola.com",
    tipo: "professor",
    nivel: "professor",
    nome: "Profª. Ana Costa",
    status: "ativo"
  },
  {
    id: 104,
    email: "carlos.ribeiro@escola.com",
    tipo: "professor",
    nivel: "professor",
    nome: "Prof. Carlos Ribeiro",
    status: "ativo"
  },
  {
    id: 105,
    email: "fernanda.oliveira@escola.com",
    tipo: "professor",
    nivel: "professor",
    nome: "Profª. Fernanda Oliveira",
    status: "ativo"
  },
  // Responsáveis
  {
    id: 201,
    email: "roberto.silva@email.com",
    tipo: "responsavel",
    nivel: "responsavel",
    nome: "Roberto Silva",
    status: "ativo"
  },
  {
    id: 202,
    email: "carla.santos@email.com",
    tipo: "responsavel",
    nivel: "responsavel",
    nome: "Carla Santos",
    status: "ativo"
  },
  {
    id: 203,
    email: "jose.mendes@email.com",
    tipo: "responsavel",
    nivel: "responsavel",
    nome: "José Mendes",
    status: "ativo"
  },
  {
    id: 204,
    email: "sandra.costa@email.com",
    tipo: "responsavel",
    nivel: "responsavel",
    nome: "Sandra Costa",
    status: "ativo"
  },
  {
    id: 205,
    email: "paulo.ferreira@email.com",
    tipo: "responsavel",
    nivel: "responsavel",
    nome: "Paulo Ferreira",
    status: "ativo"
  },
  {
    id: 206,
    email: "marcia.lima@email.com",
    tipo: "responsavel",
    nivel: "responsavel",
    nome: "Márcia Lima",
    status: "ativo"
  },
  {
    id: 207,
    email: "ricardo.oliveira@email.com",
    tipo: "responsavel",
    nivel: "responsavel",
    nome: "Ricardo Oliveira",
    status: "ativo"
  },
  {
    id: 208,
    email: "juliana.pedro@email.com",
    tipo: "responsavel",
    nivel: "responsavel",
    nome: "Juliana Pedro",
    status: "ativo"
  },
  {
    id: 209,
    email: "fernando.rocha@email.com",
    tipo: "responsavel",
    nivel: "responsavel",
    nome: "Fernando Rocha",
    status: "ativo"
  },
  {
    id: 210,
    email: "patricia.alves@email.com",
    tipo: "responsavel",
    nivel: "responsavel",
    nome: "Patrícia Alves",
    status: "ativo"
  },
  {
    id: 211,
    email: "luiz.santos@email.com",
    tipo: "responsavel",
    nivel: "responsavel",
    nome: "Luiz Santos",
    status: "ativo"
  },
  {
    id: 212,
    email: "elena.souza@email.com",
    tipo: "responsavel",
    nivel: "responsavel",
    nome: "Elena Souza",
    status: "ativo"
  }
];

const mockTurmas = [
  {
    id: 1,
    nome: "1º Ano A",
    nivel: "Fundamental I",
    serie: "1º ano",
    turno: "manha",
    ano_letivo: "2024",
    capacidade_maxima: 25,
    status: "ativo",
    professor_responsavel_id: 1,
    professor_responsavel: {
      id: 1,
      nome: "Prof. Maria Silva",
      email: "maria.silva@escola.com"
    },
    disciplinas: ["Português", "Matemática", "Ciências"],
    alunos_count: 7,
    observacoes: "Turma piloto do novo método pedagógico",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    nome: "2º Ano B",
    nivel: "Fundamental I",
    serie: "2º ano",
    turno: "tarde",
    ano_letivo: "2024",
    capacidade_maxima: 30,
    status: "ativo",
    professor_responsavel_id: 2,
    professor_responsavel: {
      id: 2,
      nome: "Prof. João Santos",
      email: "joao.santos@escola.com"
    },
    disciplinas: ["Português", "Matemática", "História", "Geografia"],
    alunos_count: 7,
    observacoes: "Turma com foco em atividades práticas",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    nome: "3º Ano C",
    nivel: "Fundamental I",
    serie: "3º ano",
    turno: "manha",
    ano_letivo: "2024",
    capacidade_maxima: 28,
    status: "ativo",
    professor_responsavel_id: 3,
    professor_responsavel: {
      id: 3,
      nome: "Profª. Ana Costa",
      email: "ana.costa@escola.com"
    },
    disciplinas: ["Português", "Matemática", "Ciências", "História"],
    alunos_count: 11,
    observacoes: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockAlunos = [
  // Turma 1 - 1º Ano A
  {
    id: 1,
    nome: "Pedro Silva",
    email: "pedro.silva@email.com",
    data_nascimento: "2015-03-15",
    status: "ativo",
    turma_id: 1,
    responsavel_id: 1,
    responsavel: {
      id: 1,
      nome: "Roberto Silva",
      email: "roberto.silva@email.com",
      telefone: "(11) 99999-0001",
      parentesco: "pai"
    }
  },
  {
    id: 2,
    nome: "Ana Santos",
    email: "ana.santos@email.com",
    data_nascimento: "2015-07-22",
    status: "ativo",
    turma_id: 1,
    responsavel_id: 2,
    responsavel: {
      id: 2,
      nome: "Carla Santos",
      email: "carla.santos@email.com",
      telefone: "(11) 99999-0002",
      parentesco: "mãe"
    }
  },
  {
    id: 3,
    nome: "Lucas Mendes",
    email: "lucas.mendes@email.com",
    data_nascimento: "2015-01-10",
    status: "ativo",
    turma_id: 1,
    responsavel_id: 3,
    responsavel: {
      id: 3,
      nome: "José Mendes",
      email: "jose.mendes@email.com",
      telefone: "(11) 99999-0003",
      parentesco: "pai"
    }
  },
  {
    id: 4,
    nome: "Sofia Costa",
    email: "sofia.costa@email.com",
    data_nascimento: "2015-09-05",
    status: "ativo",
    turma_id: 1,
    responsavel_id: 4,
    responsavel: {
      id: 4,
      nome: "Sandra Costa",
      email: "sandra.costa@email.com",
      telefone: "(11) 99999-0004",
      parentesco: "mãe"
    }
  },
  {
    id: 5,
    nome: "Gabriel Ferreira",
    email: "gabriel.ferreira@email.com",
    data_nascimento: "2015-06-18",
    status: "ativo",
    turma_id: 1,
    responsavel_id: 5,
    responsavel: {
      id: 5,
      nome: "Paulo Ferreira",
      email: "paulo.ferreira@email.com",
      telefone: "(11) 99999-0005",
      parentesco: "pai"
    }
  },
  {
    id: 6,
    nome: "Melissa Lima",
    email: "melissa.lima@email.com",
    data_nascimento: "2015-04-12",
    status: "ativo",
    turma_id: 1,
    responsavel_id: 6,
    responsavel: {
      id: 6,
      nome: "Márcia Lima",
      email: "marcia.lima@email.com",
      telefone: "(11) 99999-0006",
      parentesco: "mãe"
    }
  },
  {
    id: 7,
    nome: "Daniel Oliveira",
    email: "daniel.oliveira@email.com",
    data_nascimento: "2015-08-25",
    status: "ativo",
    turma_id: 1,
    responsavel_id: 7,
    responsavel: {
      id: 7,
      nome: "Ricardo Oliveira",
      email: "ricardo.oliveira@email.com",
      telefone: "(11) 99999-0007",
      parentesco: "pai"
    }
  },
  // Turma 2 - 2º Ano B
  {
    id: 8,
    nome: "Carlos Lima",
    email: "carlos.lima@email.com",
    data_nascimento: "2014-11-08",
    status: "ativo",
    turma_id: 2,
    responsavel_id: 6,
    responsavel: {
      id: 6,
      nome: "Márcia Lima",
      email: "marcia.lima@email.com",
      telefone: "(11) 99999-0006",
      parentesco: "mãe"
    }
  },
  {
    id: 9,
    nome: "Maria Oliveira",
    email: "maria.oliveira@email.com",
    data_nascimento: "2014-05-30",
    status: "ativo",
    turma_id: 2,
    responsavel_id: 7,
    responsavel: {
      id: 7,
      nome: "Ricardo Oliveira",
      email: "ricardo.oliveira@email.com",
      telefone: "(11) 99999-0007",
      parentesco: "pai"
    }
  },
  {
    id: 10,
    nome: "João Pedro",
    email: "joao.pedro@email.com",
    data_nascimento: "2014-12-20",
    status: "ativo",
    turma_id: 2,
    responsavel_id: 8,
    responsavel: {
      id: 8,
      nome: "Juliana Pedro",
      email: "juliana.pedro@email.com",
      telefone: "(11) 99999-0008",
      parentesco: "mãe"
    }
  },
  {
    id: 11,
    nome: "Isabella Rocha",
    email: "isabella.rocha@email.com",
    data_nascimento: "2014-04-15",
    status: "ativo",
    turma_id: 2,
    responsavel_id: 9,
    responsavel: {
      id: 9,
      nome: "Fernando Rocha",
      email: "fernando.rocha@email.com",
      telefone: "(11) 99999-0009",
      parentesco: "pai"
    }
  },
  {
    id: 12,
    nome: "Matheus Alves",
    email: "matheus.alves@email.com",
    data_nascimento: "2014-08-03",
    status: "ativo",
    turma_id: 2,
    responsavel_id: 10,
    responsavel: {
      id: 10,
      nome: "Patrícia Alves",
      email: "patricia.alves@email.com",
      telefone: "(11) 99999-0010",
      parentesco: "mãe"
    }
  },
  {
    id: 13,
    nome: "Bruno Santos",
    email: "bruno.santos@email.com",
    data_nascimento: "2014-02-14",
    status: "ativo",
    turma_id: 2,
    responsavel_id: 11,
    responsavel: {
      id: 11,
      nome: "Luiz Santos",
      email: "luiz.santos@email.com",
      telefone: "(11) 99999-0011",
      parentesco: "pai"
    }
  },
  {
    id: 14,
    nome: "Eduarda Souza",
    email: "eduarda.souza@email.com",
    data_nascimento: "2014-09-18",
    status: "ativo",
    turma_id: 2,
    responsavel_id: 12,
    responsavel: {
      id: 12,
      nome: "Elena Souza",
      email: "elena.souza@email.com",
      telefone: "(11) 99999-0012",
      parentesco: "mãe"
    }
  },
  // Turma 3 - 3º Ano C
  {
    id: 15,
    nome: "Larissa Santos",
    email: "larissa.santos@email.com",
    data_nascimento: "2013-10-12",
    status: "ativo",
    turma_id: 3,
    responsavel_id: 11,
    responsavel: {
      id: 11,
      nome: "Luiz Santos",
      email: "luiz.santos@email.com",
      telefone: "(11) 99999-0011",
      parentesco: "pai"
    }
  },
  {
    id: 16,
    nome: "Rafael Souza",
    email: "rafael.souza@email.com",
    data_nascimento: "2013-07-25",
    status: "ativo",
    turma_id: 3,
    responsavel_id: 12,
    responsavel: {
      id: 12,
      nome: "Elena Souza",
      email: "elena.souza@email.com",
      telefone: "(11) 99999-0012",
      parentesco: "mãe"
    }
  },
  {
    id: 17,
    nome: "Beatriz Martins",
    email: "beatriz.martins@email.com",
    data_nascimento: "2013-03-08",
    status: "ativo",
    turma_id: 3,
    responsavel_id: 1,
    responsavel: {
      id: 1,
      nome: "Roberto Silva",
      email: "roberto.silva@email.com",
      telefone: "(11) 99999-0001",
      parentesco: "pai"
    }
  },
  {
    id: 18,
    nome: "Enzo Ribeiro",
    email: "enzo.ribeiro@email.com",
    data_nascimento: "2013-11-30",
    status: "ativo",
    turma_id: 3,
    responsavel_id: 2,
    responsavel: {
      id: 2,
      nome: "Carla Santos",
      email: "carla.santos@email.com",
      telefone: "(11) 99999-0002",
      parentesco: "mãe"
    }
  },
  {
    id: 19,
    nome: "Valentina Lima",
    email: "valentina.lima@email.com",
    data_nascimento: "2013-05-17",
    status: "ativo",
    turma_id: 3,
    responsavel_id: 6,
    responsavel: {
      id: 6,
      nome: "Márcia Lima",
      email: "marcia.lima@email.com",
      telefone: "(11) 99999-0006",
      parentesco: "mãe"
    }
  },
  {
    id: 20,
    nome: "Nicolas Ferreira",
    email: "nicolas.ferreira@email.com",
    data_nascimento: "2013-12-03",
    status: "ativo",
    turma_id: 3,
    responsavel_id: 5,
    responsavel: {
      id: 5,
      nome: "Paulo Ferreira",
      email: "paulo.ferreira@email.com",
      telefone: "(11) 99999-0005",
      parentesco: "pai"
    }
  },
  {
    id: 21,
    nome: "Amanda Costa",
    email: "amanda.costa@email.com",
    data_nascimento: "2013-06-22",
    status: "ativo",
    turma_id: 3,
    responsavel_id: 4,
    responsavel: {
      id: 4,
      nome: "Sandra Costa",
      email: "sandra.costa@email.com",
      telefone: "(11) 99999-0004",
      parentesco: "mãe"
    }
  },
  {
    id: 22,
    nome: "Theo Mendes",
    email: "theo.mendes@email.com",
    data_nascimento: "2013-01-28",
    status: "ativo",
    turma_id: 3,
    responsavel_id: 3,
    responsavel: {
      id: 3,
      nome: "José Mendes",
      email: "jose.mendes@email.com",
      telefone: "(11) 99999-0003",
      parentesco: "pai"
    }
  },
  {
    id: 23,
    nome: "Lara Rocha",
    email: "lara.rocha@email.com",
    data_nascimento: "2013-04-07",
    status: "ativo",
    turma_id: 3,
    responsavel_id: 9,
    responsavel: {
      id: 9,
      nome: "Fernando Rocha",
      email: "fernando.rocha@email.com",
      telefone: "(11) 99999-0009",
      parentesco: "pai"
    }
  },
  {
    id: 24,
    nome: "Miguel Alves",
    email: "miguel.alves@email.com",
    data_nascimento: "2013-08-16",
    status: "ativo",
    turma_id: 3,
    responsavel_id: 10,
    responsavel: {
      id: 10,
      nome: "Patrícia Alves",
      email: "patricia.alves@email.com",
      telefone: "(11) 99999-0010",
      parentesco: "mãe"
    }
  },
  {
    id: 25,
    nome: "Helena Pedro",
    email: "helena.pedro@email.com",
    data_nascimento: "2013-09-11",
    status: "ativo",
    turma_id: 3,
    responsavel_id: 8,
    responsavel: {
      id: 8,
      nome: "Juliana Pedro",
      email: "juliana.pedro@email.com",
      telefone: "(11) 99999-0008",
      parentesco: "mãe"
    }
  }
];

// Dados Financeiros
const mockMensalidades = [
  {
    id: 1,
    aluno_id: 1,
    aluno_nome: "João Silva",
    valor: 420.00,
    mes_referencia: "2024-09",
    data_vencimento: "2024-09-10",
    data_pagamento: "2024-09-08",
    status: "pago",
    forma_pagamento: "PIX",
    created_at: "2024-09-01T10:00:00.000Z"
  },
  {
    id: 2,
    aluno_id: 2,
    aluno_nome: "Ana Santos",
    valor: 420.00,
    mes_referencia: "2024-09",
    data_vencimento: "2024-09-10",
    status: "pendente",
    created_at: "2024-09-01T10:00:00.000Z"
  },
  {
    id: 3,
    aluno_id: 3,
    aluno_nome: "Lucas Mendes",
    valor: 420.00,
    mes_referencia: "2024-09",
    data_vencimento: "2024-09-10",
    status: "vencido",
    created_at: "2024-09-01T10:00:00.000Z"
  },
  {
    id: 4,
    aluno_id: 4,
    aluno_nome: "Sofia Costa",
    valor: 420.00,
    mes_referencia: "2024-09",
    data_vencimento: "2024-09-10",
    data_pagamento: "2024-09-12",
    status: "pago",
    forma_pagamento: "Cartão de Crédito",
    juros: 15.00,
    created_at: "2024-09-01T10:00:00.000Z"
  },
  {
    id: 5,
    aluno_id: 5,
    aluno_nome: "Pedro Oliveira",
    valor: 420.00,
    mes_referencia: "2024-09",
    data_vencimento: "2024-09-10",
    data_pagamento: "2024-09-05",
    status: "pago",
    forma_pagamento: "Boleto",
    desconto: 21.00,
    created_at: "2024-09-01T10:00:00.000Z"
  }
];

const mockTransacoes = [
  {
    id: 1,
    tipo: "receita",
    categoria: "Mensalidade",
    descricao: "Mensalidade - João Silva",
    valor: 420.00,
    data_vencimento: "2024-09-10",
    data_pagamento: "2024-09-08",
    status: "pago",
    aluno_id: 1,
    aluno_nome: "João Silva",
    created_at: "2024-09-08T10:00:00.000Z"
  },
  {
    id: 2,
    tipo: "receita",
    categoria: "Mensalidade",
    descricao: "Mensalidade - Sofia Costa",
    valor: 435.00,
    data_vencimento: "2024-09-10",
    data_pagamento: "2024-09-12",
    status: "pago",
    aluno_id: 4,
    aluno_nome: "Sofia Costa",
    observacoes: "Pago com juros por atraso",
    created_at: "2024-09-12T10:00:00.000Z"
  },
  {
    id: 3,
    tipo: "receita",
    categoria: "Taxa de Matrícula",
    descricao: "Taxa de matrícula - Novo aluno",
    valor: 150.00,
    data_vencimento: "2024-09-15",
    data_pagamento: "2024-09-15",
    status: "pago",
    created_at: "2024-09-15T10:00:00.000Z"
  },
  {
    id: 4,
    tipo: "despesa",
    categoria: "Salários",
    descricao: "Salário - Prof. Maria Silva",
    valor: 3200.00,
    data_vencimento: "2024-09-05",
    data_pagamento: "2024-09-05",
    status: "pago",
    created_at: "2024-09-05T10:00:00.000Z"
  },
  {
    id: 5,
    tipo: "despesa",
    categoria: "Materiais",
    descricao: "Compra de material escolar",
    valor: 450.00,
    data_vencimento: "2024-09-20",
    status: "pendente",
    created_at: "2024-09-18T10:00:00.000Z"
  },
  {
    id: 6,
    tipo: "despesa",
    categoria: "Infraestrutura",
    descricao: "Manutenção elétrica - Sala 3",
    valor: 280.00,
    data_vencimento: "2024-09-25",
    data_pagamento: "2024-09-23",
    status: "pago",
    created_at: "2024-09-23T10:00:00.000Z"
  }
];

// Routes

// GET /api/turmas - List all turmas
app.get('/api/turmas', (req, res) => {
  res.json({
    success: true,
    data: mockTurmas
  });
});

// GET /api/turmas/:id - Get specific turma
app.get('/api/turmas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const turma = mockTurmas.find(t => t.id === id);

  if (!turma) {
    return res.status(404).json({
      success: false,
      message: 'Turma não encontrada'
    });
  }

  // Add students to turma
  const alunosDaTurma = mockAlunos.filter(a => a.turma_id === id);
  turma.alunos = alunosDaTurma;

  res.json({
    success: true,
    data: turma
  });
});

// POST /api/turmas - Create new turma
app.post('/api/turmas', (req, res) => {
  const newTurma = {
    id: Math.max(...mockTurmas.map(t => t.id)) + 1,
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    alunos_count: 0
  };

  mockTurmas.push(newTurma);

  res.status(201).json({
    success: true,
    message: 'Turma criada com sucesso',
    data: newTurma
  });
});

// PUT /api/turmas/:id - Update turma
app.put('/api/turmas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const turmaIndex = mockTurmas.findIndex(t => t.id === id);

  if (turmaIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Turma não encontrada'
    });
  }

  mockTurmas[turmaIndex] = {
    ...mockTurmas[turmaIndex],
    ...req.body,
    updated_at: new Date().toISOString()
  };

  res.json({
    success: true,
    message: 'Turma atualizada com sucesso',
    data: mockTurmas[turmaIndex]
  });
});

// DELETE /api/turmas/:id - Delete turma
app.delete('/api/turmas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const turmaIndex = mockTurmas.findIndex(t => t.id === id);

  if (turmaIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Turma não encontrada'
    });
  }

  mockTurmas.splice(turmaIndex, 1);

  res.json({
    success: true,
    message: 'Turma removida com sucesso'
  });
});

// GET /api/turmas/:id/alunos - Get students in turma
app.get('/api/turmas/:id/alunos', (req, res) => {
  const id = parseInt(req.params.id);
  const alunosDaTurma = mockAlunos.filter(a => a.turma_id === id);

  res.json({
    success: true,
    data: alunosDaTurma
  });
});

// GET /api/professores - List all teachers
app.get('/api/professores', (req, res) => {
  res.json({
    success: true,
    data: mockProfessores
  });
});

// GET /api/professores/:id - Get specific teacher
app.get('/api/professores/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const professor = mockProfessores.find(p => p.id === id);

  if (!professor) {
    return res.status(404).json({
      success: false,
      message: 'Professor não encontrado'
    });
  }

  res.json({
    success: true,
    data: professor
  });
});

// POST /api/professores - Create new teacher
app.post('/api/professores', (req, res) => {
  const { nome, email, telefone, disciplinas, data_contratacao, status } = req.body;

  // Validation
  if (!nome || !email) {
    return res.status(400).json({
      success: false,
      message: 'Nome e e-mail são obrigatórios'
    });
  }

  // Check if email already exists
  const existingProfessor = mockProfessores.find(p => p.email === email);
  if (existingProfessor) {
    return res.status(400).json({
      success: false,
      message: 'E-mail já está sendo usado por outro professor'
    });
  }

  // Create new professor
  const newProfessor = {
    id: Math.max(...mockProfessores.map(p => p.id), 0) + 1,
    nome,
    email,
    telefone: telefone || '',
    disciplinas: disciplinas || [],
    data_contratacao: data_contratacao || new Date().toISOString().split('T')[0],
    status: status || 'ativo',
    turmas_responsavel: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  mockProfessores.push(newProfessor);

  res.status(201).json({
    success: true,
    data: newProfessor,
    message: 'Professor criado com sucesso'
  });
});

// PUT /api/professores/:id - Update teacher
app.put('/api/professores/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { nome, email, telefone, disciplinas, data_contratacao, status } = req.body;

  const professorIndex = mockProfessores.findIndex(p => p.id === id);
  if (professorIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Professor não encontrado'
    });
  }

  // Validation
  if (!nome || !email) {
    return res.status(400).json({
      success: false,
      message: 'Nome e e-mail são obrigatórios'
    });
  }

  // Check if email already exists (excluding current professor)
  const existingProfessor = mockProfessores.find(p => p.email === email && p.id !== id);
  if (existingProfessor) {
    return res.status(400).json({
      success: false,
      message: 'E-mail já está sendo usado por outro professor'
    });
  }

  // Update professor
  mockProfessores[professorIndex] = {
    ...mockProfessores[professorIndex],
    nome,
    email,
    telefone: telefone || '',
    disciplinas: disciplinas || [],
    data_contratacao: data_contratacao || mockProfessores[professorIndex].data_contratacao,
    status: status || 'ativo',
    updated_at: new Date().toISOString()
  };

  res.json({
    success: true,
    data: mockProfessores[professorIndex],
    message: 'Professor atualizado com sucesso'
  });
});

// DELETE /api/professores/:id - Delete teacher
app.delete('/api/professores/:id', (req, res) => {
  const id = parseInt(req.params.id);

  const professorIndex = mockProfessores.findIndex(p => p.id === id);
  if (professorIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Professor não encontrado'
    });
  }

  // Check if professor has assigned classes
  const turmasResponsavel = mockTurmas.filter(t => t.professor_responsavel_id === id);
  if (turmasResponsavel.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Não é possível excluir o professor. Ele é responsável por ${turmasResponsavel.length} turma(s). Remova a responsabilidade das turmas primeiro.`
    });
  }

  // Remove professor
  const deletedProfessor = mockProfessores.splice(professorIndex, 1)[0];

  res.json({
    success: true,
    data: deletedProfessor,
    message: 'Professor excluído com sucesso'
  });
});

// GET /api/responsaveis - List all parents/guardians
app.get('/api/responsaveis', (req, res) => {
  res.json({
    success: true,
    data: mockResponsaveis
  });
});

// GET /api/responsaveis/:id - Get specific parent/guardian
app.get('/api/responsaveis/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const responsavel = mockResponsaveis.find(r => r.id === id);

  if (!responsavel) {
    return res.status(404).json({
      success: false,
      message: 'Responsável não encontrado'
    });
  }

  res.json({
    success: true,
    data: responsavel
  });
});

// GET /api/alunos - List all students
app.get('/api/alunos', (req, res) => {
  res.json({
    success: true,
    data: mockAlunos
  });
});

// GET /api/alunos/:id - Get specific student
app.get('/api/alunos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const aluno = mockAlunos.find(a => a.id === id);

  if (!aluno) {
    return res.status(404).json({
      success: false,
      message: 'Aluno não encontrado'
    });
  }

  res.json({
    success: true,
    data: aluno
  });
});

// GET /api/usuarios - List all users
app.get('/api/usuarios', (req, res) => {
  res.json({
    success: true,
    data: mockUsuarios
  });
});

// GET /api/usuarios/:id - Get specific user
app.get('/api/usuarios/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const usuario = mockUsuarios.find(u => u.id === id);

  if (!usuario) {
    return res.status(404).json({
      success: false,
      message: 'Usuário não encontrado'
    });
  }

  res.json({
    success: true,
    data: usuario
  });
});

// GET /api/responsaveis/:id/alunos - Get students of a specific parent/guardian
app.get('/api/responsaveis/:id/alunos', (req, res) => {
  const id = parseInt(req.params.id);
  const alunosDoResponsavel = mockAlunos.filter(a => a.responsavel_id === id);

  res.json({
    success: true,
    data: alunosDoResponsavel
  });
});

// GET /api/dashboard/stats - Get dashboard statistics
app.get('/api/dashboard/stats', (req, res) => {
  const totalTurmas = mockTurmas.length;
  const totalAlunos = mockAlunos.length;
  const totalProfessores = mockProfessores.length;
  const totalResponsaveis = mockResponsaveis.length;

  // Calculate some basic stats
  const frequenciaMedia = totalAlunos > 0 ? 92.5 : 0;
  const receitaMes = totalAlunos * 420; // R$ 420 per student average
  const mensalidadesPendentes = Math.floor(totalAlunos * 0.05); // 5% pending

  res.json({
    success: true,
    data: {
      total_turmas: totalTurmas,
      total_alunos: totalAlunos,
      total_professores: totalProfessores,
      total_responsaveis: totalResponsaveis,
      frequencia_media: frequenciaMedia,
      receita_mes: receitaMes,
      mensalidades_pendentes: mensalidadesPendentes,
      turmas_ativas: mockTurmas.filter(t => t.status === 'ativo').length,
      alunos_por_turma: mockTurmas.map(t => ({
        turma: t.nome,
        alunos: t.alunos_count,
        capacidade: t.capacidade_maxima
      }))
    }
  });
});

// ===== FINANCIAL ROUTES =====

// GET /api/financeiro/stats - Financial statistics
app.get('/api/financeiro/stats', (req, res) => {
  // Calculate financial statistics
  const receitasTotal = mockTransacoes
    .filter(t => t.tipo === 'receita' && t.status === 'pago')
    .reduce((sum, t) => sum + t.valor, 0);

  const receitasMesAtual = mockTransacoes
    .filter(t => t.tipo === 'receita' && t.status === 'pago' &&
            new Date(t.data_pagamento).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.valor, 0);

  const receitasPendentes = mockTransacoes
    .filter(t => t.tipo === 'receita' && t.status === 'pendente')
    .reduce((sum, t) => sum + t.valor, 0);

  const despesasMes = mockTransacoes
    .filter(t => t.tipo === 'despesa' &&
            new Date(t.created_at).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.valor, 0);

  const saldoAtual = receitasTotal - mockTransacoes
    .filter(t => t.tipo === 'despesa' && t.status === 'pago')
    .reduce((sum, t) => sum + t.valor, 0);

  const mensalidadesPagas = mockMensalidades.filter(m => m.status === 'pago').length;
  const mensalidadesVencidas = mockMensalidades.filter(m => m.status === 'vencido').length;
  const totalMensalidades = mockMensalidades.length;
  const inadimplenciaTaxa = totalMensalidades > 0 ? (mensalidadesVencidas / totalMensalidades) * 100 : 0;

  res.json({
    success: true,
    data: {
      receita_total: receitasTotal,
      receita_mes_atual: receitasMesAtual,
      receitas_pendentes: receitasPendentes,
      despesas_mes: despesasMes,
      saldo_atual: saldoAtual,
      mensalidades_pagas: mensalidadesPagas,
      mensalidades_vencidas: mensalidadesVencidas,
      inadimplencia_taxa: inadimplenciaTaxa
    }
  });
});

// GET /api/financeiro/mensalidades - Monthly payments
app.get('/api/financeiro/mensalidades', (req, res) => {
  const { status, mes, aluno_id } = req.query;

  let filteredMensalidades = [...mockMensalidades];

  // Filter by status
  if (status && status !== 'todos') {
    filteredMensalidades = filteredMensalidades.filter(m => m.status === status);
  }

  // Filter by month
  if (mes) {
    filteredMensalidades = filteredMensalidades.filter(m => m.mes_referencia.startsWith(mes));
  }

  // Filter by student
  if (aluno_id) {
    filteredMensalidades = filteredMensalidades.filter(m => m.aluno_id === parseInt(aluno_id));
  }

  res.json({
    success: true,
    data: filteredMensalidades
  });
});

// GET /api/financeiro/mensalidades/:id - Get specific payment
app.get('/api/financeiro/mensalidades/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const mensalidade = mockMensalidades.find(m => m.id === id);

  if (!mensalidade) {
    return res.status(404).json({
      success: false,
      message: 'Mensalidade não encontrada'
    });
  }

  res.json({
    success: true,
    data: mensalidade
  });
});

// PUT /api/financeiro/mensalidades/:id - Update payment
app.put('/api/financeiro/mensalidades/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const mensalidadeIndex = mockMensalidades.findIndex(m => m.id === id);

  if (mensalidadeIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Mensalidade não encontrada'
    });
  }

  // Update payment
  mockMensalidades[mensalidadeIndex] = {
    ...mockMensalidades[mensalidadeIndex],
    ...req.body,
    updated_at: new Date().toISOString()
  };

  res.json({
    success: true,
    data: mockMensalidades[mensalidadeIndex],
    message: 'Mensalidade atualizada com sucesso'
  });
});

// POST /api/financeiro/mensalidades/:id/pagamento - Register payment
app.post('/api/financeiro/mensalidades/:id/pagamento', (req, res) => {
  const id = parseInt(req.params.id);
  const { forma_pagamento, data_pagamento, desconto, juros, observacoes } = req.body;

  const mensalidadeIndex = mockMensalidades.findIndex(m => m.id === id);

  if (mensalidadeIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Mensalidade não encontrada'
    });
  }

  const mensalidade = mockMensalidades[mensalidadeIndex];

  // Update payment status
  mockMensalidades[mensalidadeIndex] = {
    ...mensalidade,
    status: 'pago',
    data_pagamento: data_pagamento || new Date().toISOString().split('T')[0],
    forma_pagamento,
    desconto: desconto || 0,
    juros: juros || 0,
    observacoes,
    updated_at: new Date().toISOString()
  };

  // Add transaction record
  const newTransaction = {
    id: Math.max(...mockTransacoes.map(t => t.id), 0) + 1,
    tipo: 'receita',
    categoria: 'Mensalidade',
    descricao: `Mensalidade - ${mensalidade.aluno_nome}`,
    valor: mensalidade.valor + (juros || 0) - (desconto || 0),
    data_vencimento: mensalidade.data_vencimento,
    data_pagamento: data_pagamento || new Date().toISOString().split('T')[0],
    status: 'pago',
    aluno_id: mensalidade.aluno_id,
    aluno_nome: mensalidade.aluno_nome,
    observacoes,
    created_at: new Date().toISOString()
  };

  mockTransacoes.push(newTransaction);

  res.json({
    success: true,
    data: mockMensalidades[mensalidadeIndex],
    message: 'Pagamento registrado com sucesso'
  });
});

// GET /api/financeiro/transacoes - All transactions
app.get('/api/financeiro/transacoes', (req, res) => {
  const { tipo, status, categoria, data_inicio, data_fim } = req.query;

  let filteredTransacoes = [...mockTransacoes];

  // Filter by type
  if (tipo && tipo !== 'todos') {
    filteredTransacoes = filteredTransacoes.filter(t => t.tipo === tipo);
  }

  // Filter by status
  if (status && status !== 'todos') {
    filteredTransacoes = filteredTransacoes.filter(t => t.status === status);
  }

  // Filter by category
  if (categoria) {
    filteredTransacoes = filteredTransacoes.filter(t => t.categoria === categoria);
  }

  // Filter by date range
  if (data_inicio && data_fim) {
    filteredTransacoes = filteredTransacoes.filter(t => {
      const transactionDate = new Date(t.created_at);
      return transactionDate >= new Date(data_inicio) && transactionDate <= new Date(data_fim);
    });
  }

  // Sort by date (newest first)
  filteredTransacoes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json({
    success: true,
    data: filteredTransacoes
  });
});

// POST /api/financeiro/transacoes - Create new transaction
app.post('/api/financeiro/transacoes', (req, res) => {
  const { tipo, categoria, descricao, valor, data_vencimento, data_pagamento, status, aluno_id, observacoes } = req.body;

  // Validation
  if (!tipo || !categoria || !descricao || !valor || !data_vencimento) {
    return res.status(400).json({
      success: false,
      message: 'Campos obrigatórios: tipo, categoria, descrição, valor, data_vencimento'
    });
  }

  // Create new transaction
  const newTransaction = {
    id: Math.max(...mockTransacoes.map(t => t.id), 0) + 1,
    tipo,
    categoria,
    descricao,
    valor: parseFloat(valor),
    data_vencimento,
    data_pagamento: data_pagamento || null,
    status: status || 'pendente',
    aluno_id: aluno_id || null,
    aluno_nome: aluno_id ? mockAlunos.find(a => a.id === aluno_id)?.nome : null,
    observacoes: observacoes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  mockTransacoes.push(newTransaction);

  res.status(201).json({
    success: true,
    data: newTransaction,
    message: 'Transação criada com sucesso'
  });
});

// PUT /api/financeiro/transacoes/:id - Update transaction
app.put('/api/financeiro/transacoes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const transactionIndex = mockTransacoes.findIndex(t => t.id === id);

  if (transactionIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Transação não encontrada'
    });
  }

  // Update transaction
  mockTransacoes[transactionIndex] = {
    ...mockTransacoes[transactionIndex],
    ...req.body,
    updated_at: new Date().toISOString()
  };

  res.json({
    success: true,
    data: mockTransacoes[transactionIndex],
    message: 'Transação atualizada com sucesso'
  });
});

// DELETE /api/financeiro/transacoes/:id - Delete transaction
app.delete('/api/financeiro/transacoes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const transactionIndex = mockTransacoes.findIndex(t => t.id === id);

  if (transactionIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Transação não encontrada'
    });
  }

  const deletedTransaction = mockTransacoes.splice(transactionIndex, 1)[0];

  res.json({
    success: true,
    data: deletedTransaction,
    message: 'Transação excluída com sucesso'
  });
});

// GET /api/financeiro/relatorio - Financial report
app.get('/api/financeiro/relatorio', (req, res) => {
  const { periodo, tipo } = req.query;

  // Calculate report data based on period and type
  let reportData = {
    periodo: periodo || 'mensal',
    receitas: {
      total: 0,
      categorias: {}
    },
    despesas: {
      total: 0,
      categorias: {}
    },
    saldo: 0,
    mensalidades: {
      pagas: 0,
      pendentes: 0,
      vencidas: 0,
      taxa_inadimplencia: 0
    }
  };

  // Calculate based on transactions
  mockTransacoes.forEach(transacao => {
    if (transacao.status === 'pago') {
      if (transacao.tipo === 'receita') {
        reportData.receitas.total += transacao.valor;
        reportData.receitas.categorias[transacao.categoria] =
          (reportData.receitas.categorias[transacao.categoria] || 0) + transacao.valor;
      } else {
        reportData.despesas.total += transacao.valor;
        reportData.despesas.categorias[transacao.categoria] =
          (reportData.despesas.categorias[transacao.categoria] || 0) + transacao.valor;
      }
    }
  });

  reportData.saldo = reportData.receitas.total - reportData.despesas.total;

  // Calculate monthly payment statistics
  reportData.mensalidades.pagas = mockMensalidades.filter(m => m.status === 'pago').length;
  reportData.mensalidades.pendentes = mockMensalidades.filter(m => m.status === 'pendente').length;
  reportData.mensalidades.vencidas = mockMensalidades.filter(m => m.status === 'vencido').length;

  const totalMensalidades = mockMensalidades.length;
  reportData.mensalidades.taxa_inadimplencia =
    totalMensalidades > 0 ? (reportData.mensalidades.vencidas / totalMensalidades) * 100 : 0;

  res.json({
    success: true,
    data: reportData
  });
});

// ===== CONTRACTS ROUTES =====

// Mock data para contratos
const mockContratos = [
  {
    id: 1,
    numero_contrato: "CT-2024-001",
    tipo: "matricula",
    titulo: "Contrato de Prestação de Serviços Educacionais",
    descricao: "Contrato para prestação de serviços educacionais do aluno João Silva no ano letivo de 2024",
    parte_contratante: "Escola Horizonte do Saber",
    parte_contratada: "Roberto Silva",
    valor: 5040.00, // 12 mensalidades de R$ 420
    data_inicio: "2024-01-15",
    data_fim: "2024-12-15",
    data_assinatura: "2024-01-10",
    status: "ativo",
    responsavel_id: 1,
    responsavel_nome: "Roberto Silva",
    aluno_id: 1,
    aluno_nome: "Pedro Silva",
    observacoes: "Contrato padrão de matrícula",
    clausulas: [
      "Pagamento de 12 parcelas mensais",
      "Vencimento todo dia 10 de cada mês",
      "Material didático incluso",
      "Uniforme não incluso"
    ],
    arquivo_url: "/contratos/CT-2024-001.pdf",
    created_at: "2024-01-10T10:00:00.000Z",
    updated_at: "2024-01-10T10:00:00.000Z"
  },
  {
    id: 2,
    numero_contrato: "CT-2024-002",
    tipo: "trabalho",
    titulo: "Contrato de Trabalho - Professor",
    descricao: "Contrato de trabalho para o cargo de professor de matemática",
    parte_contratante: "Escola Horizonte do Saber",
    parte_contratada: "Prof. João Santos",
    valor: 38400.00, // 12 salários de R$ 3200
    data_inicio: "2024-02-01",
    data_fim: "2024-12-31",
    data_assinatura: "2024-01-25",
    status: "ativo",
    responsavel_id: 102,
    responsavel_nome: "Prof. João Santos",
    observacoes: "Contrato de trabalho em regime CLT",
    clausulas: [
      "Carga horária de 30 horas semanais",
      "Férias escolares remuneradas",
      "13º salário incluso",
      "Vale transporte fornecido"
    ],
    arquivo_url: "/contratos/CT-2024-002.pdf",
    created_at: "2024-01-25T10:00:00.000Z",
    updated_at: "2024-01-25T10:00:00.000Z"
  },
  {
    id: 3,
    numero_contrato: "CT-2024-003",
    tipo: "prestacao_servico",
    titulo: "Contrato de Prestação de Serviços - Limpeza",
    descricao: "Contrato para prestação de serviços de limpeza e conservação",
    parte_contratante: "Escola Horizonte do Saber",
    parte_contratada: "Limpeza Total Ltda",
    valor: 18000.00, // 12 meses de R$ 1500
    data_inicio: "2024-01-01",
    data_fim: "2024-12-31",
    data_assinatura: "2023-12-15",
    status: "ativo",
    responsavel_id: 1,
    responsavel_nome: "Administração",
    observacoes: "Serviços de segunda a sexta-feira",
    clausulas: [
      "Limpeza diária das salas de aula",
      "Limpeza semanal dos banheiros",
      "Material de limpeza fornecido pela contratada",
      "Supervisão mensal da qualidade"
    ],
    arquivo_url: "/contratos/CT-2024-003.pdf",
    created_at: "2023-12-15T10:00:00.000Z",
    updated_at: "2023-12-15T10:00:00.000Z"
  },
  {
    id: 4,
    numero_contrato: "CT-2024-004",
    tipo: "matricula",
    titulo: "Contrato de Prestação de Serviços Educacionais",
    descricao: "Contrato para prestação de serviços educacionais da aluna Ana Santos no ano letivo de 2024",
    parte_contratante: "Escola Horizonte do Saber",
    parte_contratada: "Carla Santos",
    valor: 5040.00,
    data_inicio: "2024-01-15",
    data_fim: "2024-12-15",
    data_assinatura: "2024-01-12",
    status: "ativo",
    responsavel_id: 2,
    responsavel_nome: "Carla Santos",
    aluno_id: 2,
    aluno_nome: "Ana Santos",
    observacoes: "Desconto de 5% por pontualidade",
    clausulas: [
      "Pagamento de 12 parcelas mensais",
      "Vencimento todo dia 10 de cada mês",
      "Material didático incluso",
      "Desconto por pontualidade aplicável"
    ],
    arquivo_url: "/contratos/CT-2024-004.pdf",
    created_at: "2024-01-12T10:00:00.000Z",
    updated_at: "2024-01-12T10:00:00.000Z"
  },
  {
    id: 5,
    numero_contrato: "CT-2023-015",
    tipo: "ensino",
    titulo: "Contrato de Ensino Especial",
    descricao: "Contrato para aulas particulares de reforço escolar",
    parte_contratante: "Escola Horizonte do Saber",
    parte_contratada: "José Mendes",
    valor: 2400.00,
    data_inicio: "2023-03-01",
    data_fim: "2023-12-15",
    data_assinatura: "2023-02-20",
    status: "expirado",
    responsavel_id: 3,
    responsavel_nome: "José Mendes",
    aluno_id: 3,
    aluno_nome: "Lucas Mendes",
    observacoes: "Contrato específico para reforço em matemática",
    clausulas: [
      "2 aulas semanais de 1 hora",
      "Aulas às terças e quintas",
      "Pagamento mensal antecipado",
      "Material de apoio fornecido"
    ],
    arquivo_url: "/contratos/CT-2023-015.pdf",
    created_at: "2023-02-20T10:00:00.000Z",
    updated_at: "2023-12-20T10:00:00.000Z"
  }
];

// GET /api/contratos/stats - Contract statistics
app.get('/api/contratos/stats', (req, res) => {
  const totalContratos = mockContratos.length;
  const contratosAtivos = mockContratos.filter(c => c.status === 'ativo').length;
  const contratosPendentes = mockContratos.filter(c => c.status === 'pendente').length;
  const contratosExpirados = mockContratos.filter(c => c.status === 'expirado').length;

  const valorTotalContratos = mockContratos
    .filter(c => c.status === 'ativo')
    .reduce((sum, c) => sum + c.valor, 0);

  // Contratos que vencem nos próximos 30 dias
  const hoje = new Date();
  const trintaDias = new Date();
  trintaDias.setDate(hoje.getDate() + 30);

  const vencimentosProximos = mockContratos.filter(c => {
    const dataFim = new Date(c.data_fim);
    return dataFim >= hoje && dataFim <= trintaDias && c.status === 'ativo';
  }).length;

  res.json({
    success: true,
    data: {
      total_contratos: totalContratos,
      contratos_ativos: contratosAtivos,
      contratos_pendentes: contratosPendentes,
      contratos_expirados: contratosExpirados,
      valor_total_contratos: valorTotalContratos,
      vencimentos_proximos: vencimentosProximos
    }
  });
});

// GET /api/contratos - List all contracts
app.get('/api/contratos', (req, res) => {
  const { status, tipo, search } = req.query;

  let filteredContratos = [...mockContratos];

  // Filter by status
  if (status && status !== 'todos') {
    filteredContratos = filteredContratos.filter(c => c.status === status);
  }

  // Filter by type
  if (tipo && tipo !== 'todos') {
    filteredContratos = filteredContratos.filter(c => c.tipo === tipo);
  }

  // Filter by search term
  if (search) {
    const searchLower = search.toLowerCase();
    filteredContratos = filteredContratos.filter(c =>
      c.titulo.toLowerCase().includes(searchLower) ||
      c.numero_contrato.toLowerCase().includes(searchLower) ||
      c.parte_contratante.toLowerCase().includes(searchLower) ||
      c.parte_contratada.toLowerCase().includes(searchLower)
    );
  }

  // Sort by creation date (newest first)
  filteredContratos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json({
    success: true,
    data: filteredContratos
  });
});

// GET /api/contratos/:id - Get specific contract
app.get('/api/contratos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const contrato = mockContratos.find(c => c.id === id);

  if (!contrato) {
    return res.status(404).json({
      success: false,
      message: 'Contrato não encontrado'
    });
  }

  res.json({
    success: true,
    data: contrato
  });
});

// POST /api/contratos - Create new contract
app.post('/api/contratos', (req, res) => {
  const {
    numero_contrato,
    tipo,
    titulo,
    descricao,
    parte_contratante,
    parte_contratada,
    valor,
    data_inicio,
    data_fim,
    data_assinatura,
    status,
    responsavel_id,
    responsavel_nome,
    aluno_id,
    aluno_nome,
    observacoes,
    clausulas
  } = req.body;

  // Validation
  if (!numero_contrato || !tipo || !titulo || !parte_contratante || !parte_contratada || !valor) {
    return res.status(400).json({
      success: false,
      message: 'Campos obrigatórios: numero_contrato, tipo, titulo, parte_contratante, parte_contratada, valor'
    });
  }

  // Check if contract number already exists
  const existingContract = mockContratos.find(c => c.numero_contrato === numero_contrato);
  if (existingContract) {
    return res.status(400).json({
      success: false,
      message: 'Número de contrato já existe'
    });
  }

  // Create new contract
  const newContract = {
    id: Math.max(...mockContratos.map(c => c.id), 0) + 1,
    numero_contrato,
    tipo,
    titulo,
    descricao: descricao || '',
    parte_contratante,
    parte_contratada,
    valor: parseFloat(valor),
    data_inicio: data_inicio || new Date().toISOString().split('T')[0],
    data_fim: data_fim || new Date().toISOString().split('T')[0],
    data_assinatura: data_assinatura || new Date().toISOString().split('T')[0],
    status: status || 'pendente',
    responsavel_id: responsavel_id || null,
    responsavel_nome: responsavel_nome || '',
    aluno_id: aluno_id || null,
    aluno_nome: aluno_nome || '',
    observacoes: observacoes || '',
    clausulas: clausulas || [],
    arquivo_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  mockContratos.push(newContract);

  res.status(201).json({
    success: true,
    data: newContract,
    message: 'Contrato criado com sucesso'
  });
});

// PUT /api/contratos/:id - Update contract
app.put('/api/contratos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const contractIndex = mockContratos.findIndex(c => c.id === id);

  if (contractIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Contrato não encontrado'
    });
  }

  const {
    numero_contrato,
    tipo,
    titulo,
    descricao,
    parte_contratante,
    parte_contratada,
    valor,
    data_inicio,
    data_fim,
    data_assinatura,
    status,
    responsavel_id,
    responsavel_nome,
    aluno_id,
    aluno_nome,
    observacoes,
    clausulas
  } = req.body;

  // Check if contract number already exists (excluding current contract)
  if (numero_contrato) {
    const existingContract = mockContratos.find(c => c.numero_contrato === numero_contrato && c.id !== id);
    if (existingContract) {
      return res.status(400).json({
        success: false,
        message: 'Número de contrato já existe'
      });
    }
  }

  // Update contract
  mockContratos[contractIndex] = {
    ...mockContratos[contractIndex],
    numero_contrato: numero_contrato || mockContratos[contractIndex].numero_contrato,
    tipo: tipo || mockContratos[contractIndex].tipo,
    titulo: titulo || mockContratos[contractIndex].titulo,
    descricao: descricao !== undefined ? descricao : mockContratos[contractIndex].descricao,
    parte_contratante: parte_contratante || mockContratos[contractIndex].parte_contratante,
    parte_contratada: parte_contratada || mockContratos[contractIndex].parte_contratada,
    valor: valor !== undefined ? parseFloat(valor) : mockContratos[contractIndex].valor,
    data_inicio: data_inicio || mockContratos[contractIndex].data_inicio,
    data_fim: data_fim || mockContratos[contractIndex].data_fim,
    data_assinatura: data_assinatura || mockContratos[contractIndex].data_assinatura,
    status: status || mockContratos[contractIndex].status,
    responsavel_id: responsavel_id !== undefined ? responsavel_id : mockContratos[contractIndex].responsavel_id,
    responsavel_nome: responsavel_nome !== undefined ? responsavel_nome : mockContratos[contractIndex].responsavel_nome,
    aluno_id: aluno_id !== undefined ? aluno_id : mockContratos[contractIndex].aluno_id,
    aluno_nome: aluno_nome !== undefined ? aluno_nome : mockContratos[contractIndex].aluno_nome,
    observacoes: observacoes !== undefined ? observacoes : mockContratos[contractIndex].observacoes,
    clausulas: clausulas || mockContratos[contractIndex].clausulas,
    updated_at: new Date().toISOString()
  };

  res.json({
    success: true,
    data: mockContratos[contractIndex],
    message: 'Contrato atualizado com sucesso'
  });
});

// DELETE /api/contratos/:id - Delete contract
app.delete('/api/contratos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const contractIndex = mockContratos.findIndex(c => c.id === id);

  if (contractIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Contrato não encontrado'
    });
  }

  const deletedContract = mockContratos.splice(contractIndex, 1)[0];

  res.json({
    success: true,
    data: deletedContract,
    message: 'Contrato excluído com sucesso'
  });
});

// PUT /api/contratos/:id/status - Update contract status
app.put('/api/contratos/:id/status', (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  const contractIndex = mockContratos.findIndex(c => c.id === id);

  if (contractIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Contrato não encontrado'
    });
  }

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Status é obrigatório'
    });
  }

  mockContratos[contractIndex].status = status;
  mockContratos[contractIndex].updated_at = new Date().toISOString();

  res.json({
    success: true,
    data: mockContratos[contractIndex],
    message: 'Status do contrato atualizado com sucesso'
  });
});

// GET /api/contratos/vencimentos/proximos - Get contracts expiring soon
app.get('/api/contratos/vencimentos/proximos', (req, res) => {
  const { dias = 30 } = req.query;

  const hoje = new Date();
  const dataLimite = new Date();
  dataLimite.setDate(hoje.getDate() + parseInt(dias));

  const contratosVencendo = mockContratos.filter(c => {
    const dataFim = new Date(c.data_fim);
    return dataFim >= hoje && dataFim <= dataLimite && c.status === 'ativo';
  });

  res.json({
    success: true,
    data: contratosVencendo
  });
});

// ===== CONFIGURATION ROUTES =====

// Mock data para configurações
const mockSchoolSettings = {
  nome: "Horizonte do Saber",
  endereco: "Rua da Educação, 123 - Centro - São Paulo/SP",
  telefone: "(11) 3456-7890",
  email: "contato@horizontedosaber.com.br",
  site: "https://www.horizontedosaber.com.br",
  logo: "",
  cnpj: "12.345.678/0001-90",
  diretor: "Maria Eduarda Silva"
};

const mockSystemSettings = {
  manutencao: false,
  backup_automatico: true,
  notificacoes_email: true,
  notificacoes_sms: false,
  tema: "claro",
  idioma: "pt-BR",
  fuso_horario: "America/Sao_Paulo",
  moeda: "BRL"
};

const mockUserRoles = [
  {
    id: 1,
    nome: "Administrador",
    permissoes: ["*"],
    descricao: "Acesso completo ao sistema"
  },
  {
    id: 2,
    nome: "Professor",
    permissoes: ["read:alunos", "read:turmas", "write:notas", "read:frequencia"],
    descricao: "Acesso a dados de alunos e turmas"
  },
  {
    id: 3,
    nome: "Responsável",
    permissoes: ["read:aluno_proprio", "read:notas_filho", "read:frequencia_filho"],
    descricao: "Acesso apenas aos dados dos próprios filhos"
  }
];

// GET /api/configuracoes/escola - Get school settings
app.get('/api/configuracoes/escola', (req, res) => {
  res.json({
    success: true,
    data: mockSchoolSettings
  });
});

// PUT /api/configuracoes/escola - Update school settings
app.put('/api/configuracoes/escola', (req, res) => {
  const { nome, endereco, telefone, email, site, logo, cnpj, diretor } = req.body;

  // Validation
  if (!nome || !email) {
    return res.status(400).json({
      success: false,
      message: 'Nome da escola e e-mail são obrigatórios'
    });
  }

  // Update school settings
  Object.assign(mockSchoolSettings, {
    nome,
    endereco: endereco || '',
    telefone: telefone || '',
    email,
    site: site || '',
    logo: logo || '',
    cnpj: cnpj || '',
    diretor: diretor || ''
  });

  res.json({
    success: true,
    data: mockSchoolSettings,
    message: 'Configurações da escola atualizadas com sucesso'
  });
});

// GET /api/configuracoes/sistema - Get system settings
app.get('/api/configuracoes/sistema', (req, res) => {
  res.json({
    success: true,
    data: mockSystemSettings
  });
});

// PUT /api/configuracoes/sistema - Update system settings
app.put('/api/configuracoes/sistema', (req, res) => {
  const {
    manutencao,
    backup_automatico,
    notificacoes_email,
    notificacoes_sms,
    tema,
    idioma,
    fuso_horario,
    moeda
  } = req.body;

  // Update system settings
  Object.assign(mockSystemSettings, {
    manutencao: manutencao !== undefined ? manutencao : mockSystemSettings.manutencao,
    backup_automatico: backup_automatico !== undefined ? backup_automatico : mockSystemSettings.backup_automatico,
    notificacoes_email: notificacoes_email !== undefined ? notificacoes_email : mockSystemSettings.notificacoes_email,
    notificacoes_sms: notificacoes_sms !== undefined ? notificacoes_sms : mockSystemSettings.notificacoes_sms,
    tema: tema || mockSystemSettings.tema,
    idioma: idioma || mockSystemSettings.idioma,
    fuso_horario: fuso_horario || mockSystemSettings.fuso_horario,
    moeda: moeda || mockSystemSettings.moeda
  });

  res.json({
    success: true,
    data: mockSystemSettings,
    message: 'Configurações do sistema atualizadas com sucesso'
  });
});

// GET /api/configuracoes/roles - Get user roles
app.get('/api/configuracoes/roles', (req, res) => {
  res.json({
    success: true,
    data: mockUserRoles
  });
});

// POST /api/configuracoes/roles - Create new role
app.post('/api/configuracoes/roles', (req, res) => {
  const { nome, permissoes, descricao } = req.body;

  // Validation
  if (!nome || !permissoes || !Array.isArray(permissoes)) {
    return res.status(400).json({
      success: false,
      message: 'Nome e permissões são obrigatórios'
    });
  }

  const newRole = {
    id: Math.max(...mockUserRoles.map(r => r.id), 0) + 1,
    nome,
    permissoes,
    descricao: descricao || ''
  };

  mockUserRoles.push(newRole);

  res.status(201).json({
    success: true,
    data: newRole,
    message: 'Role criado com sucesso'
  });
});

// PUT /api/configuracoes/roles/:id - Update role
app.put('/api/configuracoes/roles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const roleIndex = mockUserRoles.findIndex(r => r.id === id);

  if (roleIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Role não encontrado'
    });
  }

  const { nome, permissoes, descricao } = req.body;

  // Validation
  if (!nome || !permissoes || !Array.isArray(permissoes)) {
    return res.status(400).json({
      success: false,
      message: 'Nome e permissões são obrigatórios'
    });
  }

  mockUserRoles[roleIndex] = {
    ...mockUserRoles[roleIndex],
    nome,
    permissoes,
    descricao: descricao || ''
  };

  res.json({
    success: true,
    data: mockUserRoles[roleIndex],
    message: 'Role atualizado com sucesso'
  });
});

// DELETE /api/configuracoes/roles/:id - Delete role
app.delete('/api/configuracoes/roles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const roleIndex = mockUserRoles.findIndex(r => r.id === id);

  if (roleIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Role não encontrado'
    });
  }

  // Check if role is being used by users
  const usersWithRole = mockUsuarios.filter(u => u.role_id === id);
  if (usersWithRole.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Não é possível excluir o role. Ele está sendo usado por ${usersWithRole.length} usuário(s).`
    });
  }

  const deletedRole = mockUserRoles.splice(roleIndex, 1)[0];

  res.json({
    success: true,
    data: deletedRole,
    message: 'Role excluído com sucesso'
  });
});

// POST /api/configuracoes/backup - Create backup
app.post('/api/configuracoes/backup', (req, res) => {
  const backupData = {
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    data: {
      usuarios: mockUsuarios,
      alunos: mockAlunos,
      professores: mockProfessores,
      turmas: mockTurmas,
      responsaveis: mockResponsaveis,
      mensalidades: mockMensalidades,
      transacoes: mockTransacoes,
      configuracoes: {
        escola: mockSchoolSettings,
        sistema: mockSystemSettings,
        roles: mockUserRoles
      }
    }
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="backup-${new Date().toISOString().split('T')[0]}.json"`);

  res.json(backupData);
});

// POST /api/configuracoes/restaurar - Restore backup
app.post('/api/configuracoes/restaurar', (req, res) => {
  // This would normally handle file upload and restore
  // For now, just return success
  res.json({
    success: true,
    message: 'Funcionalidade de restauração em desenvolvimento'
  });
});

// GET /api/configuracoes/logs - Get system logs
app.get('/api/configuracoes/logs', (req, res) => {
  const mockLogs = [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      level: 'info',
      action: 'login',
      user: 'admin',
      details: 'Login realizado com sucesso'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      level: 'warning',
      action: 'backup',
      user: 'system',
      details: 'Backup automático executado'
    }
  ];

  res.json({
    success: true,
    data: mockLogs
  });
});

// ===============================
// Site Content Management APIs
// ===============================

const fs = require('fs');
const path = require('path');

// Site content file path
const SITE_CONTENT_FILE = path.join(__dirname, 'data', 'site-content.json');

// Ensure data directory exists
const ensureDataDirectory = () => {
  const dataDir = path.dirname(SITE_CONTENT_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('📁 Created data directory:', dataDir);
  }
};

// Load site content from file
const loadSiteContentFromFile = () => {
  try {
    if (fs.existsSync(SITE_CONTENT_FILE)) {
      const fileContent = fs.readFileSync(SITE_CONTENT_FILE, 'utf8');
      const content = JSON.parse(fileContent);
      console.log('📄 Site content loaded from file:', {
        timestamp: new Date().toISOString(),
        sections: Object.keys(content || {}).length
      });
      return content;
    }
  } catch (error) {
    console.error('❌ Error loading site content from file:', error);
  }
  return null;
};

// Save site content to file
const saveSiteContentToFile = (content) => {
  try {
    ensureDataDirectory();
    fs.writeFileSync(SITE_CONTENT_FILE, JSON.stringify(content, null, 2), 'utf8');
    console.log('💾 Site content saved to file:', {
      timestamp: new Date().toISOString(),
      sections: Object.keys(content || {}).length,
      file: SITE_CONTENT_FILE
    });
    return true;
  } catch (error) {
    console.error('❌ Error saving site content to file:', error);
    return false;
  }
};

// Initialize site content on server start
let siteContent = loadSiteContentFromFile();

// Get site content
app.get('/api/site-content', (req, res) => {
  console.log('📥 GET /api/site-content - Request from:', req.headers.origin || 'unknown');

  try {
    // Always reload from file to ensure latest data
    const fileContent = loadSiteContentFromFile();
    if (fileContent) {
      siteContent = fileContent;
    }

    res.json({
      success: true,
      data: siteContent || null,
      timestamp: new Date().toISOString(),
      source: siteContent ? 'file' : 'empty'
    });

    console.log('📤 Site content sent:', {
      hasContent: !!siteContent,
      sections: siteContent ? Object.keys(siteContent).length : 0
    });
  } catch (error) {
    console.error('❌ Error getting site content:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar conteúdo',
      error: error.message
    });
  }
});

// Save site content
app.post('/api/site-content', (req, res) => {
  console.log('📥 POST /api/site-content - Request from:', req.headers.origin || 'unknown');

  try {
    const newContent = req.body;

    if (!newContent || typeof newContent !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Conteúdo inválido fornecido'
      });
    }

    // Save to memory
    siteContent = newContent;

    // Save to file for persistence
    const fileSaved = saveSiteContentToFile(newContent);

    if (fileSaved) {
      console.log('✅ Site content successfully saved:', {
        timestamp: new Date().toISOString(),
        sections: Object.keys(newContent).length,
        persistent: true
      });

      res.json({
        success: true,
        message: 'Conteúdo salvo com sucesso',
        timestamp: new Date().toISOString(),
        persistent: true
      });
    } else {
      console.log('⚠️ Site content saved to memory only (file save failed)');

      res.json({
        success: true,
        message: 'Conteúdo salvo (temporário)',
        timestamp: new Date().toISOString(),
        persistent: false,
        warning: 'Arquivo não foi salvo - mudanças podem ser perdidas'
      });
    }
  } catch (error) {
    console.error('❌ Error saving site content:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log(`📊 Environment: development`);
  const corsOrigins = ['http://localhost:5181', 'http://localhost:5182', 'http://localhost:5183', 'http://localhost:5184', 'http://localhost:5185', 'http://localhost:5186', 'http://localhost:5187'];
  console.log(`🌐 CORS origins: ${corsOrigins.join(', ')}`);
});