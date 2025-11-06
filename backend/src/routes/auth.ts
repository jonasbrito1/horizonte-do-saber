import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '@/controllers/AuthController';
import { validate } from '@/middleware/validate';

const router = Router();
const authController = new AuthController();

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email válido é obrigatório'),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  ],
  validate,
  authController.login
);

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public (or Admin only)
router.post(
  '/register',
  [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('Email válido é obrigatório'),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
    body('nivel').isIn(['administrador', 'usuario', 'responsavel']).withMessage('Nível inválido'),
  ],
  validate,
  authController.register
);

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Email válido é obrigatório')],
  validate,
  authController.forgotPassword
);

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token é obrigatório'),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  ],
  validate,
  authController.resetPassword
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authController.getMe);

// @route   POST /api/auth/change-password
// @desc    Change password (requires old password)
// @access  Private
router.post(
  '/change-password',
  [
    body('senhaAtual').notEmpty().withMessage('Senha atual é obrigatória'),
    body('novaSenha').isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres'),
  ],
  validate,
  authController.changePassword
);

// @route   POST /api/auth/change-password-first-access
// @desc    Change password on first access (no old password required)
// @access  Private
router.post(
  '/change-password-first-access',
  [
    body('novaSenha').isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres'),
  ],
  validate,
  authController.changePasswordFirstAccess
);

export default router;