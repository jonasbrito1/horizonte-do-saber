import { Router } from 'express';
import { ResponsibleController } from '@/controllers/ResponsibleController';
import { authenticateToken, requireLevel } from '@/middleware/auth';

const router = Router();
const responsibleController = new ResponsibleController();

router.use(authenticateToken);

router.get('/', requireLevel(['administrador', 'usuario']), responsibleController.getResponsibles);
router.get('/:id', responsibleController.getResponsibleById);
router.post('/', requireLevel(['administrador', 'usuario']), responsibleController.createResponsible);
router.put('/:id', requireLevel(['administrador', 'usuario']), responsibleController.updateResponsible);
router.delete('/:id', requireLevel(['administrador']), responsibleController.deleteResponsible);
router.get('/:id/students', responsibleController.getResponsibleStudents);

export default router;