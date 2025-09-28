import { Router } from 'express';
import { ContentController, uploadImage } from '../controllers/ContentController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const contentController = new ContentController();

// Public routes
router.get('/public', contentController.getPublicContent);
router.get('/public/:section', contentController.getPublicContentBySection);

// Protected routes - simplified for now
router.get('/', contentController.getAllContent);
router.get('/:section', contentController.getContentBySection);
router.post('/', contentController.createContent);
router.put('/:id', contentController.updateContent);
router.delete('/:id', contentController.deleteContent);
router.post('/cache/clear', contentController.clearCache);
router.post('/upload', uploadImage, contentController.uploadContentImage);

export default router;