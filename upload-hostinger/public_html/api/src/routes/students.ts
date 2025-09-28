import { Router } from 'express';
import { body } from 'express-validator';
import { StudentController } from '@/controllers/StudentController';
import { authenticateToken, requireLevel } from '@/middleware/auth';
import { validate } from '@/middleware/validate';

const router = Router();
const studentController = new StudentController();

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/students
// @desc    Get all students
// @access  Admin/User
router.get('/', requireLevel(['administrador', 'usuario']), studentController.getStudents);

// @route   GET /api/students/:id
// @desc    Get student by ID
// @access  Admin/User/Responsible
router.get('/:id', studentController.getStudentById);

// @route   POST /api/students
// @desc    Create new student
// @access  Admin/User
router.post(
  '/',
  requireLevel(['administrador', 'usuario']),
  [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('data_nascimento').isISO8601().withMessage('Data de nascimento inválida'),
    body('matricula').notEmpty().withMessage('Matrícula é obrigatória'),
    body('responsavel_id').optional().isInt().withMessage('ID do responsável deve ser um número'),
    body('turma_id').optional().isInt().withMessage('ID da turma deve ser um número'),
  ],
  validate,
  studentController.createStudent
);

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Admin/User
router.put(
  '/:id',
  requireLevel(['administrador', 'usuario']),
  [
    body('nome').optional().notEmpty().withMessage('Nome não pode estar vazio'),
    body('data_nascimento').optional().isISO8601().withMessage('Data de nascimento inválida'),
    body('matricula').optional().notEmpty().withMessage('Matrícula não pode estar vazia'),
    body('status').optional().isIn(['ativo', 'inativo', 'transferido']).withMessage('Status inválido'),
  ],
  validate,
  studentController.updateStudent
);

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Admin only
router.delete('/:id', requireLevel(['administrador']), studentController.deleteStudent);

// @route   GET /api/students/:id/grades
// @desc    Get student grades
// @access  Admin/User/Responsible
router.get('/:id/grades', studentController.getStudentGrades);

// @route   GET /api/students/:id/attendance
// @desc    Get student attendance
// @access  Admin/User/Responsible
router.get('/:id/attendance', studentController.getStudentAttendance);

// @route   GET /api/students/:id/financial
// @desc    Get student financial information
// @access  Admin/User/Responsible
router.get('/:id/financial', studentController.getStudentFinancial);

export default router;