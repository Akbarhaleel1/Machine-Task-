import { Request, Response } from 'express';
import { z } from 'zod';
import authService from '../services/auth.service';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  companyName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export class AuthController {
  async register(req: Request, res: Response) {
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new AppError(
        validationResult.error.errors[0].message,
        400
      );
    }
    const result = await authService.register(validationResult.data);
    res.status(201).json({
      status: 'success',
      data: result,
    });
  }

  async login(req: Request, res: Response) {
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new AppError(
        validationResult.error.errors[0].message,
        400
      );
    }
    const result = await authService.login(validationResult.data);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  }

  async getMe(req: AuthRequest, res: Response) {
    if (!req.userId) {
      throw new AppError('User ID not found in request', 401);
    }
    const user = await authService.getMe(req.userId);
    res.status(200).json({
      status: 'success',
      data: { user },
    });
  }

  async logout(req: Request, res: Response) {
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  }
}

export default new AuthController();
