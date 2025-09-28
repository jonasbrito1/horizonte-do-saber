import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from '../middleware/auth'
import { z } from 'zod'

const router = Router()
const prisma = new PrismaClient()

// Validation schemas
const createClassSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  nivel: z.string().min(1, 'Nível é obrigatório'),
  turno: z.enum(['manha', 'tarde', 'noite']),
  serie: z.string().min(1, 'Série é obrigatória'),
  ano_letivo: z.string().min(4, 'Ano letivo deve ter 4 dígitos'),
  capacidade_maxima: z.number().min(1).max(50),
  professor_responsavel_id: z.number().optional(),
  observacoes: z.string().optional(),
  status: z.enum(['ativo', 'inativo', 'concluido']).optional().default('ativo')
})

const updateClassSchema = createClassSchema.partial()

const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('12'),
  search: z.string().optional(),
  status: z.enum(['ativo', 'inativo', 'concluido']).optional(),
  turno: z.enum(['manha', 'tarde', 'noite']).optional(),
  ano_letivo: z.string().optional()
})

// GET /classes - List classes with pagination and filters
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { page, limit, search, status, turno, ano_letivo } = querySchema.parse(req.query)

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { nivel: { contains: search, mode: 'insensitive' } },
        { serie: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) {
      where.status = status
    }

    if (turno) {
      where.turno = turno
    }

    if (ano_letivo) {
      where.ano_letivo = ano_letivo
    }

    // Get classes with pagination
    const [classes, total] = await Promise.all([
      prisma.turma.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          professor_responsavel: {
            select: {
              id: true,
              nome: true,
              email: true
            }
          },
          disciplinas: {
            include: {
              disciplina: {
                select: {
                  nome: true
                }
              }
            }
          },
          alunos: {
            select: {
              id: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.turma.count({ where })
    ])

    // Transform data to include disciplinas array and alunos_count
    const formattedClasses = classes.map(turma => ({
      ...turma,
      disciplinas: turma.disciplinas.map(d => d.disciplina.nome),
      alunos_count: turma.alunos.length,
      alunos: undefined // Remove alunos details from list response
    }))

    res.json({
      data: formattedClasses,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    })
  } catch (error) {
    console.error('Error fetching classes:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// GET /classes/:id - Get specific class
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const classId = parseInt(req.params.id)

    const turma = await prisma.turma.findUnique({
      where: { id: classId },
      include: {
        professor_responsavel: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        disciplinas: {
          include: {
            disciplina: true
          }
        },
        alunos: {
          include: {
            aluno: {
              select: {
                id: true,
                nome: true,
                email: true,
                data_nascimento: true,
                status: true
              }
            }
          }
        }
      }
    })

    if (!turma) {
      return res.status(404).json({ message: 'Turma não encontrada' })
    }

    // Transform data
    const formattedClass = {
      ...turma,
      disciplinas: turma.disciplinas.map(d => d.disciplina.nome),
      alunos: turma.alunos.map(a => a.aluno),
      alunos_count: turma.alunos.length
    }

    res.json(formattedClass)
  } catch (error) {
    console.error('Error fetching class:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// POST /classes - Create new class
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const validatedData = createClassSchema.parse(req.body)

    // Check if class name already exists for the same year
    const existingClass = await prisma.turma.findFirst({
      where: {
        nome: validatedData.nome,
        ano_letivo: validatedData.ano_letivo
      }
    })

    if (existingClass) {
      return res.status(400).json({
        message: 'Já existe uma turma com este nome no ano letivo especificado'
      })
    }

    // Check if professor exists and is available
    if (validatedData.professor_responsavel_id) {
      const professor = await prisma.professor.findUnique({
        where: { id: validatedData.professor_responsavel_id }
      })

      if (!professor) {
        return res.status(400).json({ message: 'Professor não encontrado' })
      }

      if (professor.status !== 'ativo') {
        return res.status(400).json({ message: 'Professor deve estar ativo' })
      }
    }

    // Create class
    const turma = await prisma.turma.create({
      data: validatedData,
      include: {
        professor_responsavel: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    })

    res.status(201).json(turma)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: error.errors
      })
    }

    console.error('Error creating class:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// PUT /classes/:id - Update class
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const classId = parseInt(req.params.id)
    const validatedData = updateClassSchema.parse(req.body)

    // Check if class exists
    const existingClass = await prisma.turma.findUnique({
      where: { id: classId }
    })

    if (!existingClass) {
      return res.status(404).json({ message: 'Turma não encontrada' })
    }

    // Check if name is being changed and if it conflicts
    if (validatedData.nome && validatedData.nome !== existingClass.nome) {
      const nameConflict = await prisma.turma.findFirst({
        where: {
          nome: validatedData.nome,
          ano_letivo: validatedData.ano_letivo || existingClass.ano_letivo,
          id: { not: classId }
        }
      })

      if (nameConflict) {
        return res.status(400).json({
          message: 'Já existe uma turma com este nome no ano letivo especificado'
        })
      }
    }

    // Check if professor exists and is available
    if (validatedData.professor_responsavel_id) {
      const professor = await prisma.professor.findUnique({
        where: { id: validatedData.professor_responsavel_id }
      })

      if (!professor) {
        return res.status(400).json({ message: 'Professor não encontrado' })
      }

      if (professor.status !== 'ativo') {
        return res.status(400).json({ message: 'Professor deve estar ativo' })
      }
    }

    // Update class
    const updatedClass = await prisma.turma.update({
      where: { id: classId },
      data: validatedData,
      include: {
        professor_responsavel: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    })

    res.json(updatedClass)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: error.errors
      })
    }

    console.error('Error updating class:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// DELETE /classes/:id - Delete class
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const classId = parseInt(req.params.id)

    // Check if class exists
    const existingClass = await prisma.turma.findUnique({
      where: { id: classId }
    })

    if (!existingClass) {
      return res.status(404).json({ message: 'Turma não encontrada' })
    }

    // Check if class has enrolled students
    const studentsCount = await prisma.alunoTurma.count({
      where: { turma_id: classId }
    })

    if (studentsCount > 0) {
      return res.status(400).json({
        message: 'Não é possível remover turma com alunos matriculados'
      })
    }

    // Delete class
    await prisma.turma.delete({
      where: { id: classId }
    })

    res.json({ message: 'Turma removida com sucesso' })
  } catch (error) {
    console.error('Error deleting class:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// POST /classes/:id/add-student - Add student to class
router.post('/:id/add-student', authenticateToken, async (req: Request, res: Response) => {
  try {
    const classId = parseInt(req.params.id)
    const { aluno_id } = req.body

    // Check if class exists and has capacity
    const turma = await prisma.turma.findUnique({
      where: { id: classId },
      include: {
        alunos: true
      }
    })

    if (!turma) {
      return res.status(404).json({ message: 'Turma não encontrada' })
    }

    if (turma.alunos.length >= turma.capacidade_maxima) {
      return res.status(400).json({ message: 'Turma já atingiu a capacidade máxima' })
    }

    // Check if student exists
    const student = await prisma.aluno.findUnique({
      where: { id: aluno_id }
    })

    if (!student) {
      return res.status(404).json({ message: 'Aluno não encontrado' })
    }

    // Check if student is already enrolled in this class
    const existingEnrollment = await prisma.alunoTurma.findUnique({
      where: {
        aluno_id_turma_id: {
          aluno_id: aluno_id,
          turma_id: classId
        }
      }
    })

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Aluno já está matriculado nesta turma' })
    }

    // Create enrollment
    const enrollment = await prisma.alunoTurma.create({
      data: {
        aluno_id: aluno_id,
        turma_id: classId,
        data_matricula: new Date()
      }
    })

    res.status(201).json(enrollment)
  } catch (error) {
    console.error('Error adding student to class:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// DELETE /classes/:id/remove-student/:studentId - Remove student from class
router.delete('/:id/remove-student/:studentId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const classId = parseInt(req.params.id)
    const studentId = parseInt(req.params.studentId)

    // Check if enrollment exists
    const enrollment = await prisma.alunoTurma.findUnique({
      where: {
        aluno_id_turma_id: {
          aluno_id: studentId,
          turma_id: classId
        }
      }
    })

    if (!enrollment) {
      return res.status(404).json({ message: 'Matrícula não encontrada' })
    }

    // Remove enrollment
    await prisma.alunoTurma.delete({
      where: {
        aluno_id_turma_id: {
          aluno_id: studentId,
          turma_id: classId
        }
      }
    })

    res.json({ message: 'Aluno removido da turma com sucesso' })
  } catch (error) {
    console.error('Error removing student from class:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// POST /classes/:id/add-discipline - Add discipline to class
router.post('/:id/add-discipline', authenticateToken, async (req: Request, res: Response) => {
  try {
    const classId = parseInt(req.params.id)
    const { disciplina_id } = req.body

    // Check if class exists
    const turma = await prisma.turma.findUnique({
      where: { id: classId }
    })

    if (!turma) {
      return res.status(404).json({ message: 'Turma não encontrada' })
    }

    // Check if discipline exists
    const discipline = await prisma.disciplina.findUnique({
      where: { id: disciplina_id }
    })

    if (!discipline) {
      return res.status(404).json({ message: 'Disciplina não encontrada' })
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.turmaDisciplina.findUnique({
      where: {
        turma_id_disciplina_id: {
          turma_id: classId,
          disciplina_id: disciplina_id
        }
      }
    })

    if (existingAssignment) {
      return res.status(400).json({ message: 'Disciplina já está atribuída a esta turma' })
    }

    // Create assignment
    const assignment = await prisma.turmaDisciplina.create({
      data: {
        turma_id: classId,
        disciplina_id: disciplina_id
      }
    })

    res.status(201).json(assignment)
  } catch (error) {
    console.error('Error adding discipline to class:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// DELETE /classes/:id/remove-discipline/:disciplineId - Remove discipline from class
router.delete('/:id/remove-discipline/:disciplineId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const classId = parseInt(req.params.id)
    const disciplineId = parseInt(req.params.disciplineId)

    // Check if assignment exists
    const assignment = await prisma.turmaDisciplina.findUnique({
      where: {
        turma_id_disciplina_id: {
          turma_id: classId,
          disciplina_id: disciplineId
        }
      }
    })

    if (!assignment) {
      return res.status(404).json({ message: 'Atribuição não encontrada' })
    }

    // Remove assignment
    await prisma.turmaDisciplina.delete({
      where: {
        turma_id_disciplina_id: {
          turma_id: classId,
          disciplina_id: disciplineId
        }
      }
    })

    res.json({ message: 'Disciplina removida da turma com sucesso' })
  } catch (error) {
    console.error('Error removing discipline from class:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// GET /classes/:id/students - Get students in class
router.get('/:id/students', authenticateToken, async (req: Request, res: Response) => {
  try {
    const classId = parseInt(req.params.id)

    const students = await prisma.alunoTurma.findMany({
      where: { turma_id: classId },
      include: {
        aluno: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            data_nascimento: true,
            status: true,
            foto: true
          }
        }
      },
      orderBy: {
        aluno: {
          nome: 'asc'
        }
      }
    })

    const formattedStudents = students.map(enrollment => ({
      ...enrollment.aluno,
      data_matricula: enrollment.data_matricula
    }))

    res.json(formattedStudents)
  } catch (error) {
    console.error('Error fetching class students:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

export default router