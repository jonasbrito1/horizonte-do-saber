import { Router } from 'express'
import DevTaskController from '../controllers/DevTaskController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Todas as rotas exigem autenticação
router.use(authenticateToken)

// Rotas CRUD
router.get('/', DevTaskController.index)
router.get('/stats', DevTaskController.stats)
router.get('/:id', DevTaskController.show)
router.post('/', DevTaskController.store)
router.put('/:id', DevTaskController.update)
router.patch('/:id/complete', DevTaskController.complete)
router.patch('/:id/start', DevTaskController.start)
router.delete('/:id', DevTaskController.destroy)

export default router