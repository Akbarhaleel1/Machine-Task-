import { Request, Response } from 'express';
import { z } from 'zod';
import userService from '../services/user.service';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['USER', 'ADMIN']).optional(),
  companyName: z.string().optional(),
  industry: z.string().optional(),
  teamSize: z.string().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  companyName: z.string().optional(),
  industry: z.string().optional(),
  teamSize: z.string().optional(),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export class UserController {
  /**
   * Create a new user (admin only)
   * POST /api/users
   */
  async createUser(req: Request, res: Response) {
    const validationResult = createUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new AppError(
        validationResult.error.errors[0].message,
        400
      );
    }

    // Get the admin's ID from the authenticated request
    const authReq = req as AuthRequest;
    const createdByAdminId = authReq.userId;

    const user = await userService.createUser(validationResult.data, createdByAdminId);

    res.status(201).json({
      status: 'success',
      data: { user },
    });
  }

  /**
   * List all users with optional filters
   * GET /api/users
   */
  async listUsers(req: Request, res: Response) {
    const { role, search, limit, page } = req.query;

    const filters = {
      role: role as 'USER' | 'ADMIN' | undefined,
      search: search as string | undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      page: page ? parseInt(page as string) : undefined,
    };

    const result = await userService.listUsers(filters);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  async getUserById(req: Request, res: Response) {
    const { id } = req.params;

    const user = await userService.getUserById(id);

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  }

  /**
   * Update user
   * PUT /api/users/:id
   */
  async updateUser(req: Request, res: Response) {
    const { id } = req.params;

    const validationResult = updateUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new AppError(
        validationResult.error.errors[0].message,
        400
      );
    }

    const user = await userService.updateUser(id, validationResult.data);

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  }

  /**
   * Delete user
   * DELETE /api/users/:id
   */
  async deleteUser(req: Request, res: Response) {
    const { id } = req.params;

    const result = await userService.deleteUser(id);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }

  /**
   * Reset user password (admin only)
   * POST /api/users/:id/reset-password
   */
  async resetPassword(req: Request, res: Response) {
    const { id } = req.params;

    const validationResult = resetPasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new AppError(
        validationResult.error.errors[0].message,
        400
      );
    }

    const result = await userService.resetUserPassword(
      id,
      validationResult.data.newPassword
    );

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
}

export default new UserController();
