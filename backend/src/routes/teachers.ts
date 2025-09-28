import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from '../middleware/auth'
import { z } from 'zod'

const router = Router()
const prisma = new PrismaClient()

// Validation schemas
const createTeacherSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  formacao: z.string().optional(),
  especializacao: z.string().optional(),
  registro_profissional: z.string().optional(),
  data_admissao: z.string().optional(),
  salario: z.number().min(0).optional(),
  observacoes: z.string().optional(),
  status: z.enum(['ativo', 'inativo', 'licenca']).optional().default('ativo')
})

const updateTeacherSchema = createTeacherSchema.partial()

const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  status: z.enum(['ativo', 'inativo', 'licenca']).optional()
})

// GET /teachers - List teachers with pagination and filters
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { page, limit, search, status } = querySchema.parse(req.query)

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { formacao: { contains: search, mode: 'insensitive' } },
        { especializacao: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) {
      where.status = status
    }

    // Get teachers with pagination
    const [teachers, total] = await Promise.all([
      prisma.professor.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          disciplinas: {
            include: {
              disciplina: true
            }
          },
          turmas: {
            include: {
              turma: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.professor.count({ where })
    ])

    // Transform data to include disciplinas and turmas arrays
    const formattedTeachers = teachers.map(teacher => ({
      ...teacher,
      disciplinas: teacher.disciplinas.map(d => d.disciplina.nome),
      turmas: teacher.turmas.map(t => t.turma.nome)
    }))

    res.json({
      data: formattedTeachers,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    })
  } catch (error) {
    console.error('Error fetching teachers:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// GET /teachers/:id - Get specific teacher
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const teacherId = parseInt(req.params.id)

    const teacher = await prisma.professor.findUnique({
      where: { id: teacherId },
      include: {
        disciplinas: {
          include: {
            disciplina: true
          }
        },
        turmas: {
          include: {
            turma: true
          }
        }
      }
    })

    if (!teacher) {
      return res.status(404).json({ message: 'Professor não encontrado' })
    }

    // Transform data
    const formattedTeacher = {
      ...teacher,
      disciplinas: teacher.disciplinas.map(d => d.disciplina.nome),
      turmas: teacher.turmas.map(t => t.turma.nome)
    }

    res.json(formattedTeacher)
  } catch (error) {
    console.error('Error fetching teacher:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// POST /teachers - Create new teacher
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const validatedData = createTeacherSchema.parse(req.body)

    // Check if email already exists
    const existingTeacher = await prisma.professor.findUnique({
      where: { email: validatedData.email }
    })

    if (existingTeacher) {
      return res.status(400).json({ message: 'Email já está em uso' })
    }

    // Create teacher
    const teacher = await prisma.professor.create({
      data: {
        ...validatedData,
        data_admissao: validatedData.data_admissao ? new Date(validatedData.data_admissao) : new Date()
      }
    })

    res.status(201).json(teacher)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: error.errors
      })
    }

    console.error('Error creating teacher:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// PUT /teachers/:id - Update teacher
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const teacherId = parseInt(req.params.id)
    const validatedData = updateTeacherSchema.parse(req.body)

    // Check if teacher exists
    const existingTeacher = await prisma.professor.findUnique({
      where: { id: teacherId }
    })

    if (!existingTeacher) {
      return res.status(404).json({ message: 'Professor não encontrado' })
    }

    // Check if email is being changed and if it's already in use
    if (validatedData.email && validatedData.email !== existingTeacher.email) {
      const emailInUse = await prisma.professor.findUnique({
        where: { email: validatedData.email }
      })

      if (emailInUse) {
        return res.status(400).json({ message: 'Email já está em uso' })
      }
    }

    // Update teacher
    const updatedTeacher = await prisma.professor.update({
      where: { id: teacherId },
      data: {
        ...validatedData,
        ...(validatedData.data_admissao && {
          data_admissao: new Date(validatedData.data_admissao)
        })
      }
    })

    res.json(updatedTeacher)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: error.errors
      })
    }

    console.error('Error updating teacher:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// DELETE /teachers/:id - Delete teacher
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const teacherId = parseInt(req.params.id)

    // Check if teacher exists
    const existingTeacher = await prisma.professor.findUnique({
      where: { id: teacherId }
    })

    if (!existingTeacher) {
      return res.status(404).json({ message: 'Professor não encontrado' })
    }

    // Check if teacher has active classes
    const activeClasses = await prisma.professorTurma.count({
      where: { professor_id: teacherId }
    })

    if (activeClasses > 0) {
      return res.status(400).json({
        message: 'Não é possível remover professor com turmas ativas'
      })
    }

    // Delete teacher
    await prisma.professor.delete({
      where: { id: teacherId }
    })

    res.json({ message: 'Professor removido com sucesso' })
  } catch (error) {
    console.error('Error deleting teacher:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// POST /teachers/:id/assign-discipline - Assign discipline to teacher
router.post('/:id/assign-discipline', authenticateToken, async (req: Request, res: Response) => {
  try {
    const teacherId = parseInt(req.params.id)
    const { disciplina_id } = req.body

    // Check if teacher exists
    const teacher = await prisma.professor.findUnique({
      where: { id: teacherId }
    })

    if (!teacher) {
      return res.status(404).json({ message: 'Professor não encontrado' })
    }

    // Check if discipline exists
    const discipline = await prisma.disciplina.findUnique({
      where: { id: disciplina_id }
    })

    if (!discipline) {
      return res.status(404).json({ message: 'Disciplina não encontrada' })
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.professorDisciplina.findUnique({
      where: {
        professor_id_disciplina_id: {
          professor_id: teacherId,
          disciplina_id: disciplina_id
        }
      }
    })

    if (existingAssignment) {
      return res.status(400).json({ message: 'Professor já está atribuído a esta disciplina' })
    }

    // Create assignment
    const assignment = await prisma.professorDisciplina.create({
      data: {
        professor_id: teacherId,
        disciplina_id: disciplina_id
      }
    })

    res.status(201).json(assignment)
  } catch (error) {
    console.error('Error assigning discipline to teacher:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// DELETE /teachers/:id/remove-discipline/:disciplineId - Remove discipline from teacher
router.delete('/:id/remove-discipline/:disciplineId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const teacherId = parseInt(req.params.id)
    const disciplineId = parseInt(req.params.disciplineId)

    // Check if assignment exists
    const assignment = await prisma.professorDisciplina.findUnique({
      where: {
        professor_id_disciplina_id: {
          professor_id: teacherId,
          disciplina_id: disciplineId
        }
      }
    })

    if (!assignment) {
      return res.status(404).json({ message: 'Atribuição não encontrada' })
    }

    // Remove assignment
    await prisma.professorDisciplina.delete({
      where: {
        professor_id_disciplina_id: {
          professor_id: teacherId,
          disciplina_id: disciplineId
        }
      }
    })

    res.json({ message: 'Disciplina removida do professor com sucesso' })
  } catch (error) {
    console.error('Error removing discipline from teacher:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// POST /teachers/:id/assign-class - Assign class to teacher
router.post('/:id/assign-class', authenticateToken, async (req: Request, res: Response) => {
  try {
    const teacherId = parseInt(req.params.id)
    const { turma_id } = req.body

    // Check if teacher exists
    const teacher = await prisma.professor.findUnique({
      where: { id: teacherId }
    })

    if (!teacher) {
      return res.status(404).json({ message: 'Professor não encontrado' })
    }

    // Check if class exists
    const turma = await prisma.turma.findUnique({
      where: { id: turma_id }
    })

    if (!turma) {
      return res.status(404).json({ message: 'Turma não encontrada' })
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.professorTurma.findUnique({
      where: {
        professor_id_turma_id: {
          professor_id: teacherId,
          turma_id: turma_id
        }
      }
    })

    if (existingAssignment) {
      return res.status(400).json({ message: 'Professor já está atribuído a esta turma' })
    }

    // Create assignment
    const assignment = await prisma.professorTurma.create({
      data: {
        professor_id: teacherId,
        turma_id: turma_id
      }
    })

    res.status(201).json(assignment)
  } catch (error) {
    console.error('Error assigning class to teacher:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// DELETE /teachers/:id/remove-class/:classId - Remove class from teacher
router.delete('/:id/remove-class/:classId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const teacherId = parseInt(req.params.id)
    const classId = parseInt(req.params.classId)

    // Check if assignment exists
    const assignment = await prisma.professorTurma.findUnique({
      where: {
        professor_id_turma_id: {
          professor_id: teacherId,
          turma_id: classId
        }
      }
    })

    if (!assignment) {
      return res.status(404).json({ message: 'Atribuição não encontrada' })
    }

    // Remove assignment
    await prisma.professorTurma.delete({
      where: {
        professor_id_turma_id: {
          professor_id: teacherId,
          turma_id: classId
        }
      }
    })

    res.json({ message: 'Turma removida do professor com sucesso' })
  } catch (error) {
    console.error('Error removing class from teacher:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

export default router