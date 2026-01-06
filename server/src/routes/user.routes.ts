import { Router } from 'express';
import userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// All user management routes require authentication and admin privileges
router.use(authenticate);
router.use(requireAdmin);

/**
 * @route   POST /api/users
 * @desc    Create a new user (admin only)
 * @access  Private (Admin)
 */
router.post('/', asyncHandler(userController.createUser.bind(userController)));

/**
 * @route   GET /api/users
 * @desc    List all users with optional filters
 * @access  Private (Admin)
 */
router.get('/', asyncHandler(userController.listUsers.bind(userController)));

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin)
 */
router.get('/:id', asyncHandler(userController.getUserById.bind(userController)));

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin)
 */
router.put('/:id', asyncHandler(userController.updateUser.bind(userController)));

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Admin)
 */
router.delete('/:id', asyncHandler(userController.deleteUser.bind(userController)));

/**
 * @route   POST /api/users/:id/reset-password
 * @desc    Reset user password (admin only)
 * @access  Private (Admin)
 */
router.post(
  '/:id/reset-password',
  asyncHandler(userController.resetPassword.bind(userController))
);

export default router;
