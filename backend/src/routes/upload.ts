import { Router } from 'express';
import { UploadController } from '@/controllers/UploadController';
import { authenticateToken, requireLevel } from '@/middleware/auth';
import { uploadMiddleware } from '@/middleware/upload';

const router = Router();
const uploadController = new UploadController();

router.use(authenticateToken);

// Single file upload
router.post(
  '/single',
  requireLevel(['administrador', 'usuario']),
  uploadMiddleware.single('file'),
  uploadController.uploadSingle
);

// Multiple files upload
router.post(
  '/multiple',
  requireLevel(['administrador', 'usuario']),
  uploadMiddleware.array('files', 10),
  uploadController.uploadMultiple
);

// Delete file
router.delete(
  '/:filename',
  requireLevel(['administrador']),
  uploadController.deleteFile
);

export default router;