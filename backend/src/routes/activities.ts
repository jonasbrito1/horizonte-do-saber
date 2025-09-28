import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from '../middleware/auth'
import { z } from 'zod'
import multer from 'multer'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'

const router = Router()
const prisma = new PrismaClient()

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

// Validation schemas
const createActivitySchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  data_atividade: z.string().min(1, 'Data da atividade é obrigatória'),
  local: z.string().optional(),
  tipo: z.string().optional(),
  participantes: z.string().optional(),
  status: z.enum(['ativo', 'inativo']).optional().default('ativo')
})

const updateActivitySchema = createActivitySchema.partial()

const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('9'),
  search: z.string().optional(),
  status: z.enum(['ativo', 'inativo']).optional(),
  tipo: z.string().optional(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional()
})

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  const uploadDir = path.join(process.cwd(), 'uploads', 'activities')
  try {
    await fs.access(uploadDir)
  } catch {
    await fs.mkdir(uploadDir, { recursive: true })
  }
}

// GET /activities - List activities with pagination and filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page, limit, search, status, tipo, data_inicio, data_fim } = querySchema.parse(req.query)

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { titulo: { contains: search, mode: 'insensitive' } },
        { descricao: { contains: search, mode: 'insensitive' } },
        { local: { contains: search, mode: 'insensitive' } },
        { participantes: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) {
      where.status = status
    }

    if (tipo) {
      where.tipo = tipo
    }

    if (data_inicio && data_fim) {
      where.data_atividade = {
        gte: new Date(data_inicio),
        lte: new Date(data_fim)
      }
    } else if (data_inicio) {
      where.data_atividade = {
        gte: new Date(data_inicio)
      }
    } else if (data_fim) {
      where.data_atividade = {
        lte: new Date(data_fim)
      }
    }

    // Get activities with pagination
    const [activities, total] = await Promise.all([
      prisma.atividade.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          fotos: {
            orderBy: { ordem: 'asc' }
          }
        },
        orderBy: { data_atividade: 'desc' }
      }),
      prisma.atividade.count({ where })
    ])

    res.json({
      data: activities,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    })
  } catch (error) {
    console.error('Error fetching activities:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// GET /activities/public - Public endpoint for homepage
router.get('/public', async (req: Request, res: Response) => {
  try {
    const activities = await prisma.atividade.findMany({
      where: { status: 'ativo' },
      include: {
        fotos: {
          orderBy: { ordem: 'asc' },
          take: 3 // Only get first 3 photos for each activity
        }
      },
      orderBy: { data_atividade: 'desc' },
      take: 12 // Only get recent 12 activities
    })

    res.json(activities)
  } catch (error) {
    console.error('Error fetching public activities:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// GET /activities/:id - Get specific activity
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const activityId = parseInt(req.params.id)

    const activity = await prisma.atividade.findUnique({
      where: { id: activityId },
      include: {
        fotos: {
          orderBy: { ordem: 'asc' }
        }
      }
    })

    if (!activity) {
      return res.status(404).json({ message: 'Atividade não encontrada' })
    }

    res.json(activity)
  } catch (error) {
    console.error('Error fetching activity:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// POST /activities - Create new activity
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const validatedData = createActivitySchema.parse(req.body)

    // Create activity
    const activity = await prisma.atividade.create({
      data: {
        ...validatedData,
        data_atividade: new Date(validatedData.data_atividade)
      }
    })

    res.status(201).json(activity)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: error.errors
      })
    }

    console.error('Error creating activity:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// PUT /activities/:id - Update activity
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const activityId = parseInt(req.params.id)
    const validatedData = updateActivitySchema.parse(req.body)

    // Check if activity exists
    const existingActivity = await prisma.atividade.findUnique({
      where: { id: activityId }
    })

    if (!existingActivity) {
      return res.status(404).json({ message: 'Atividade não encontrada' })
    }

    // Update activity
    const updatedActivity = await prisma.atividade.update({
      where: { id: activityId },
      data: {
        ...validatedData,
        ...(validatedData.data_atividade && {
          data_atividade: new Date(validatedData.data_atividade)
        })
      }
    })

    res.json(updatedActivity)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: error.errors
      })
    }

    console.error('Error updating activity:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// DELETE /activities/:id - Delete activity
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const activityId = parseInt(req.params.id)

    // Check if activity exists
    const existingActivity = await prisma.atividade.findUnique({
      where: { id: activityId },
      include: {
        fotos: true
      }
    })

    if (!existingActivity) {
      return res.status(404).json({ message: 'Atividade não encontrada' })
    }

    // Delete associated photos from filesystem
    for (const foto of existingActivity.fotos) {
      try {
        const filePath = path.join(process.cwd(), 'uploads', 'activities', path.basename(foto.url))
        await fs.unlink(filePath)
      } catch (error) {
        console.error('Error deleting photo file:', error)
      }
    }

    // Delete activity (photos will be cascade deleted)
    await prisma.atividade.delete({
      where: { id: activityId }
    })

    res.json({ message: 'Atividade removida com sucesso' })
  } catch (error) {
    console.error('Error deleting activity:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// POST /activities/:id/photos - Upload photos for activity
router.post('/:id/photos', authenticateToken, upload.array('images', 10), async (req: Request, res: Response) => {
  try {
    const activityId = parseInt(req.params.id)
    const files = req.files as Express.Multer.File[]

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'Nenhuma imagem foi enviada' })
    }

    // Check if activity exists
    const activity = await prisma.atividade.findUnique({
      where: { id: activityId }
    })

    if (!activity) {
      return res.status(404).json({ message: 'Atividade não encontrada' })
    }

    await ensureUploadsDir()

    const uploadedPhotos = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const filename = `activity_${activityId}_${Date.now()}_${i}.webp`
      const filepath = path.join(process.cwd(), 'uploads', 'activities', filename)

      // Process and save image
      await sharp(file.buffer)
        .resize(1200, 800, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 85 })
        .toFile(filepath)

      // Save photo record to database
      const photo = await prisma.atividadeFoto.create({
        data: {
          atividade_id: activityId,
          url: `/uploads/activities/${filename}`,
          ordem: i + 1
        }
      })

      uploadedPhotos.push(photo)
    }

    res.status(201).json({
      message: 'Fotos enviadas com sucesso',
      photos: uploadedPhotos
    })
  } catch (error) {
    console.error('Error uploading photos:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// DELETE /activities/:id/photos/:photoId - Delete specific photo
router.delete('/:id/photos/:photoId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const activityId = parseInt(req.params.id)
    const photoId = parseInt(req.params.photoId)

    // Check if photo exists and belongs to the activity
    const photo = await prisma.atividadeFoto.findFirst({
      where: {
        id: photoId,
        atividade_id: activityId
      }
    })

    if (!photo) {
      return res.status(404).json({ message: 'Foto não encontrada' })
    }

    // Delete photo file
    try {
      const filePath = path.join(process.cwd(), 'uploads', 'activities', path.basename(photo.url))
      await fs.unlink(filePath)
    } catch (error) {
      console.error('Error deleting photo file:', error)
    }

    // Delete photo record
    await prisma.atividadeFoto.delete({
      where: { id: photoId }
    })

    res.json({ message: 'Foto removida com sucesso' })
  } catch (error) {
    console.error('Error deleting photo:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// PUT /activities/:id/photos/:photoId - Update photo (order, caption)
router.put('/:id/photos/:photoId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const activityId = parseInt(req.params.id)
    const photoId = parseInt(req.params.photoId)
    const { legenda, ordem } = req.body

    // Check if photo exists and belongs to the activity
    const photo = await prisma.atividadeFoto.findFirst({
      where: {
        id: photoId,
        atividade_id: activityId
      }
    })

    if (!photo) {
      return res.status(404).json({ message: 'Foto não encontrada' })
    }

    // Update photo
    const updatedPhoto = await prisma.atividadeFoto.update({
      where: { id: photoId },
      data: {
        ...(legenda !== undefined && { legenda }),
        ...(ordem !== undefined && { ordem })
      }
    })

    res.json(updatedPhoto)
  } catch (error) {
    console.error('Error updating photo:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

export default router