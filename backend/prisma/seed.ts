import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuário administrador padrão
  console.log('👤 Criando usuário administrador...')
  const hashedPassword = await bcrypt.hash('admin123', 12)

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@horizontedosaber.com.br' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@horizontedosaber.com.br',
      senha: hashedPassword,
      tipo: 'admin',
      status: 'ativo',
      primeiro_login: false
    }
  })

  console.log('✅ Usuário administrador criado:', admin.email)

  // Criar algumas disciplinas básicas
  console.log('📚 Criando disciplinas básicas...')

  const disciplinas = [
    { nome: 'Português', codigo: 'PORT', carga_horaria: 5 },
    { nome: 'Matemática', codigo: 'MAT', carga_horaria: 5 },
    { nome: 'História', codigo: 'HIST', carga_horaria: 3 },
    { nome: 'Geografia', codigo: 'GEO', carga_horaria: 3 },
    { nome: 'Ciências', codigo: 'CIEN', carga_horaria: 4 },
    { nome: 'Educação Física', codigo: 'EDF', carga_horaria: 2 },
    { nome: 'Artes', codigo: 'ART', carga_horaria: 2 },
    { nome: 'Inglês', codigo: 'ING', carga_horaria: 3 }
  ]

  for (const disciplina of disciplinas) {
    await prisma.disciplina.upsert({
      where: { codigo: disciplina.codigo },
      update: {},
      create: disciplina
    })
  }

  console.log('✅ Disciplinas criadas')

  // Criar professor exemplo
  console.log('👨‍🏫 Criando professor exemplo...')

  const professor = await prisma.professor.upsert({
    where: { email: 'professor@horizontedosaber.com.br' },
    update: {},
    create: {
      nome: 'Maria Silva',
      email: 'professor@horizontedosaber.com.br',
      telefone: '(11) 99999-8888',
      formacao: 'Licenciatura em Pedagogia',
      especializacao: 'Educação Infantil',
      registro_profissional: 'RG12345',
      salario: 3500.00,
      status: 'ativo'
    }
  })

  console.log('✅ Professor criado:', professor.nome)

  // Criar turma exemplo
  console.log('🏫 Criando turma exemplo...')

  const turma = await prisma.turma.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nome: '1º A',
      nivel: 'Fundamental I',
      serie: '1º ano',
      turno: 'manha',
      ano_letivo: '2024',
      capacidade_maxima: 25,
      professor_responsavel_id: professor.id,
      status: 'ativo'
    }
  })

  console.log('✅ Turma criada:', turma.nome)

  // Criar responsável exemplo
  console.log('👨‍👩‍👧‍👦 Criando responsável exemplo...')

  const responsavel = await prisma.responsavel.upsert({
    where: { email: 'responsavel@exemplo.com' },
    update: {},
    create: {
      nome: 'João Santos',
      email: 'responsavel@exemplo.com',
      telefone: '(11) 99999-7777',
      endereco: 'Rua das Flores, 123, São Paulo - SP',
      cpf: '123.456.789-00',
      profissao: 'Engenheiro',
      parentesco: 'pai'
    }
  })

  console.log('✅ Responsável criado:', responsavel.nome)

  // Criar aluno exemplo
  console.log('👶 Criando aluno exemplo...')

  const aluno = await prisma.aluno.create({
    data: {
      nome: 'Pedro Santos',
      data_nascimento: new Date('2018-03-15'),
      numero_matricula: '2024001',
      serie_atual: '1º ano',
      turno: 'manha',
      status: 'ativo',
      created_by: admin.id
    }
  })

  console.log('✅ Aluno criado:', aluno.nome)

  // Relacionar responsável com aluno
  await prisma.responsavelAluno.create({
    data: {
      responsavel_id: responsavel.id,
      aluno_id: aluno.id,
      tipo_relacao: 'responsavel_financeiro'
    }
  })

  // Matricular aluno na turma
  await prisma.alunoTurma.create({
    data: {
      aluno_id: aluno.id,
      turma_id: turma.id,
      status: 'ativo'
    }
  })

  console.log('✅ Relacionamentos criados')

  // Criar conteúdo básico do site
  console.log('🌐 Criando conteúdo básico do site...')

  const heroContent = {
    titulo: 'Horizonte do Saber',
    subtitulo: 'Educação de qualidade para o futuro',
    descricao: 'Uma escola comprometida com a excelência educacional, formando cidadãos críticos e preparados para os desafios do amanhã.',
    imagem_fundo: '/images/hero-bg.jpg',
    cor_primaria: '#3B82F6',
    cor_secundaria: '#10B981'
  }

  await prisma.siteContent.upsert({
    where: { secao: 'hero' },
    update: { conteudo: heroContent },
    create: {
      secao: 'hero',
      conteudo: heroContent
    }
  })

  const sobreContent = {
    titulo: 'Sobre Nossa Escola',
    descricao: 'O Horizonte do Saber é uma instituição de ensino comprometida com a formação integral de seus alunos, oferecendo educação de qualidade em um ambiente acolhedor e estimulante.',
    missao: 'Proporcionar educação de excelência, formando cidadãos críticos, criativos e éticos.',
    visao: 'Ser referência em educação, reconhecida pela qualidade de ensino e formação humana.',
    valores: [
      'Excelência educacional',
      'Respeito à diversidade',
      'Inovação pedagógica',
      'Responsabilidade social',
      'Ética e transparência'
    ],
    imagem: '/images/sobre.jpg'
  }

  await prisma.siteContent.upsert({
    where: { secao: 'sobre' },
    update: { conteudo: sobreContent },
    create: {
      secao: 'sobre',
      conteudo: sobreContent
    }
  })

  const servicosContent = {
    titulo: 'Nossos Serviços',
    descricao: 'Oferecemos uma educação completa e de qualidade',
    servicos: [
      {
        titulo: 'Educação Infantil',
        icone: 'Baby',
        descricao: 'Cuidado e educação para crianças de 2 a 5 anos'
      },
      {
        titulo: 'Ensino Fundamental I',
        icone: 'BookOpen',
        descricao: 'Base sólida para o desenvolvimento acadêmico'
      },
      {
        titulo: 'Ensino Fundamental II',
        icone: 'GraduationCap',
        descricao: 'Preparação para os desafios do ensino médio'
      }
    ]
  }

  await prisma.siteContent.upsert({
    where: { secao: 'servicos' },
    update: { conteudo: servicosContent },
    create: {
      secao: 'servicos',
      conteudo: servicosContent
    }
  })

  const contatoContent = {
    titulo: 'Entre em Contato',
    endereco: 'Rua da Educação, 123\nBairro Escolar\nSão Paulo - SP\nCEP: 01234-567',
    telefone: '(11) 99999-9999',
    email: 'contato@horizontedosaber.com.br',
    horario_funcionamento: 'Segunda a Sexta: 7h às 18h\nSábado: 8h às 12h',
    mapa_url: 'https://maps.google.com'
  }

  await prisma.siteContent.upsert({
    where: { secao: 'contato' },
    update: { conteudo: contatoContent },
    create: {
      secao: 'contato',
      conteudo: contatoContent
    }
  })

  console.log('✅ Conteúdo do site criado')

  // Criar configurações do sistema
  console.log('⚙️ Criando configurações do sistema...')

  const schoolConfig = {
    nome_escola: 'Horizonte do Saber',
    endereco: 'Rua da Educação, 123, Bairro Escolar, São Paulo - SP',
    telefone: '(11) 99999-9999',
    email: 'contato@horizontedosaber.com.br',
    cnpj: '12.345.678/0001-90',
    diretor: 'Dra. Ana Silva',
    ano_letivo: '2024',
    cores: {
      primaria: '#3B82F6',
      secundaria: '#10B981',
      acento: '#F59E0B'
    },
    configuracoes_gerais: {
      limite_alunos_turma: 30,
      horario_funcionamento: 'Segunda a Sexta: 7h às 18h',
      periodo_letivo_inicio: '2024-02-01',
      periodo_letivo_fim: '2024-12-15',
      mensalidade_vencimento_dia: 5,
      notificacoes_email: true,
      backup_automatico: true
    }
  }

  await prisma.configuracao.upsert({
    where: { chave: 'escola' },
    update: { valor: schoolConfig },
    create: {
      chave: 'escola',
      valor: schoolConfig,
      descricao: 'Configurações gerais da escola'
    }
  })

  console.log('✅ Configurações criadas')

  // Criar atividade exemplo
  console.log('🎯 Criando atividade exemplo...')

  const atividade = await prisma.atividade.create({
    data: {
      titulo: 'Feira de Ciências 2024',
      descricao: 'Primeira feira de ciências da escola com projetos incríveis dos alunos',
      data_atividade: new Date('2024-09-15'),
      local: 'Pátio da escola',
      tipo: 'Feira de Ciências',
      participantes: 'Todas as turmas',
      status: 'ativo'
    }
  })

  console.log('✅ Atividade criada:', atividade.titulo)

  console.log('\n🎉 Seed concluído com sucesso!')
  console.log('\n📋 Dados criados:')
  console.log('👤 Usuário admin: admin@horizontedosaber.com.br / admin123')
  console.log('👨‍🏫 Professor: Maria Silva')
  console.log('🏫 Turma: 1º A')
  console.log('👨‍👩‍👧‍👦 Responsável: João Santos')
  console.log('👶 Aluno: Pedro Santos')
  console.log('📚 8 Disciplinas básicas')
  console.log('🌐 Conteúdo do site')
  console.log('⚙️ Configurações do sistema')
  console.log('🎯 Atividade exemplo')
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })