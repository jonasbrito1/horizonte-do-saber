import { Router } from 'express';
import { FinancialController } from '@/controllers/FinancialController';
import { authenticateToken, requireLevel } from '@/middleware/auth';

const router = Router();
const financialController = new FinancialController();

router.use(authenticateToken);

router.get('/', requireLevel(['administrador', 'usuario']), financialController.getFinancialRecords);
router.get('/dashboard', requireLevel(['administrador']), financialController.getDashboardData);
router.get('/reports', requireLevel(['administrador', 'usuario']), financialController.getReports);
router.post('/', requireLevel(['administrador', 'usuario']), financialController.createFinancialRecord);
router.put('/:id', requireLevel(['administrador', 'usuario']), financialController.updateFinancialRecord);
router.delete('/:id', requireLevel(['administrador']), financialController.deleteFinancialRecord);

export default router;