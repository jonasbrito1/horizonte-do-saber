import { Router } from 'express';
import { ContentController } from '@/controllers/ContentController';
import { authenticateToken, requireLevel } from '@/middleware/auth';

const router = Router();
const contentController = new ContentController();

// Public routes
router.get('/public', contentController.getPublicContent);
router.get('/public/:section', contentController.getPublicContentBySection);

// Protected routes
router.use(authenticateToken);

router.get('/', requireLevel(['administrador']), contentController.getAllContent);
router.get('/:section', requireLevel(['administrador']), contentController.getContentBySection);
router.post('/', requireLevel(['administrador']), contentController.createContent);
router.put('/:id', requireLevel(['administrador']), contentController.updateContent);
router.delete('/:id', requireLevel(['administrador']), contentController.deleteContent);
router.post('/cache/clear', requireLevel(['administrador']), contentController.clearCache);

export default router;