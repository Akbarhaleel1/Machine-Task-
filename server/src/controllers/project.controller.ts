import { Request, Response } from 'express';
import { z } from 'zod';
import { projectService } from '../services/project.service';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  icon: z.string().max(50).optional(),
});

const addMemberSchema = z.object({
  email: z.string().email('Invalid email format'),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
});

export class ProjectController {
  async createProject(req: Request, res: Response) {
    const userId = (req as AuthRequest).userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const validation = createProjectSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(validation.error.errors[0].message, 400);
    }

    const project = await projectService.createProject(validation.data, userId);

    res.status(201).json({
      status: 'success',
      message: 'Project created successfully',
      data: { project },
    });
  }

  async getProjects(req: Request, res: Response) {
    const userId = (req as AuthRequest).userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const projects = await projectService.getProjects(userId);

    res.json({
      status: 'success',
      data: { projects },
    });
  }

  async getProjectById(req: Request, res: Response) {
    const userId = (req as AuthRequest).userId;
    const { id } = req.params;
    if (!userId) throw new AppError('Unauthorized', 401);

    const project = await projectService.getProjectById(id, userId);

    res.json({
      status: 'success',
      data: { project },
    });
  }

  async updateProject(req: Request, res: Response) {
    const userId = (req as AuthRequest).userId;
    const { id } = req.params;
    if (!userId) throw new AppError('Unauthorized', 401);

    const validation = createProjectSchema.partial().safeParse(req.body);
    if (!validation.success) {
      throw new AppError(validation.error.errors[0].message, 400);
    }

    const project = await projectService.updateProject(id, userId, validation.data);

    res.json({
      status: 'success',
      data: { project },
    });
  }

  async addMember(req: Request, res: Response) {
    const userId = (req as AuthRequest).userId;
    const { id } = req.params;
    if (!userId) throw new AppError('Unauthorized', 401);

    const validation = addMemberSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(validation.error.errors[0].message, 400);
    }

    const project = await projectService.addMember(
      id,
      userId,
      validation.data.email,
      validation.data.role
    );

    res.json({
      status: 'success',
      data: { project },
    });
  }

  async removeMember(req: Request, res: Response) {
    const userId = (req as AuthRequest).userId;
    const { id, memberId } = req.params;
    if (!userId) throw new AppError('Unauthorized', 401);

    const project = await projectService.removeMember(id, userId, memberId);

    res.json({
      status: 'success',
      data: { project },
    });
  }

  async deleteProject(req: Request, res: Response) {
    const userId = (req as AuthRequest).userId;
    const { id } = req.params;
    if (!userId) throw new AppError('Unauthorized', 401);

    const result = await projectService.deleteProject(id, userId);

    res.json({
      status: 'success',
      data: result,
    });
  }
}

export const projectController = new ProjectController();
