import { Request, Response } from 'express';
import { z } from 'zod';
import { taskService } from '../services/task.service';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional(),
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignees: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
  tags: z.array(z.string().max(50)).optional(),
  dueDate: z.string().datetime().optional().or(z.date().optional()),
});

const addCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(2000),
});

export class TaskController {
  async createTask(req: Request, res: Response) {
    const userId = (req as AuthRequest).userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const validation = createTaskSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(validation.error.errors[0].message, 400);
    }

    const task = await taskService.createTask(validation.data, userId);

    res.status(201).json({
      status: 'success',
      data: { task },
    });
  }

  async getTasks(req: Request, res: Response) {
    const userId = (req as AuthRequest).userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const { projectId } = req.params;
    const { status, priority, assigneeId, tags, cursor, limit } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assigneeId) filter.assigneeId = assigneeId;
    if (tags) filter.tags = Array.isArray(tags) ? tags : [tags];

    const pagination: any = {};
    if (cursor) pagination.cursor = cursor;
    if (limit) pagination.limit = parseInt(limit as string, 10);

    const result = await taskService.getTasks(projectId, userId, filter, pagination);

    res.json({
      status: 'success',
      data: result,
    });
  }

  async getTaskById(req: Request, res: Response) {
    const userId = (req as AuthRequest).userId;
    const { id } = req.params;
    if (!userId) throw new AppError('Unauthorized', 401);

    const task = await taskService.getTaskById(id, userId);

    res.json({
      status: 'success',
      data: { task },
    });
  }

  async updateTask(req: Request, res: Response) {
    const userId = (req as AuthRequest).userId;
    const { id } = req.params;
    if (!userId) throw new AppError('Unauthorized', 401);

    const validation = createTaskSchema.partial().safeParse(req.body);
    if (!validation.success) {
      throw new AppError(validation.error.errors[0].message, 400);
    }

    const task = await taskService.updateTask(id, userId, validation.data);

    res.json({
      status: 'success',
      data: { task },
    });
  }

  async deleteTask(req: Request, res: Response) {
    const userId = (req as AuthRequest).userId;
    const { id } = req.params;
    if (!userId) throw new AppError('Unauthorized', 401);

    const result = await taskService.deleteTask(id, userId);

    res.json({
      status: 'success',
      data: result,
    });
  }

  async addComment(req: Request, res: Response) {
    const userId = (req as AuthRequest).userId;
    const { id } = req.params;
    if (!userId) throw new AppError('Unauthorized', 401);

    const validation = addCommentSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(validation.error.errors[0].message, 400);
    }

    const comment = await taskService.addComment(id, userId, validation.data.content);

    res.status(201).json({
      status: 'success',
      data: { comment },
    });
  }

  async searchTasks(req: Request, res: Response) {
    const userId = (req as AuthRequest).userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const { projectId } = req.params;
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      throw new AppError('Search query is required', 400);
    }

    const tasks = await taskService.searchTasks(projectId, userId, q);

    res.json({
      status: 'success',
      data: { tasks },
    });
  }

  async getDashboardStats(req: Request, res: Response) {
    const userId = (req as AuthRequest).userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const { projectId } = req.params;

    const stats = await taskService.getDashboardStats(projectId, userId);

    res.json({
      status: 'success',
      data: { stats },
    });
  }
}

export const taskController = new TaskController();
