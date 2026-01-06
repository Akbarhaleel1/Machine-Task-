import { Request, Response } from 'express';
import { z } from 'zod';
import { enhancedProjectService } from '../services/project.service.enhanced';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { presenceService } from '../config/redis';
import { User } from '../models/user.model';

/**
 * Enhanced Project Controller
 *
 * Production-grade API endpoints with:
 * - Input validation (Zod)
 * - Error handling
 * - Presence tracking
 */

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  icon: z.string().max(50).optional(),
});

export class EnhancedProjectController {
  /**
   * POST /api/projects
   *
   * Create new project
   *
   * Request body:
   * {
   *   "name": "My Startup Project",
   *   "description": "Optional description",
   *   "color": "#6366f1",
   *   "icon": "folder"
   * }
   *
   * Response:
   * {
   *   "status": "success",
   *   "message": "Project created successfully",
   *   "data": {
   *     "project": { ... }
   *   }
   * }
   */
  async createProject(req: Request, res: Response) {
    const userId = (req as AuthRequest).userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    // Validate input
    const validation = createProjectSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(validation.error.errors[0].message, 400);
    }

    // Create project using transaction
    const project = await enhancedProjectService.createProject(
      validation.data,
      userId
    );

    res.status(201).json({
      status: 'success',
      message: 'Project created successfully',
      data: { project },
    });
  }

  /**
   * GET /api/projects
   *
   * Get all projects for the authenticated user
   */
  async getProjects(req: Request, res: Response) {
    const userId = (req as AuthRequest).userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const includeArchived = req.query.includeArchived === 'true';

    const projects = await enhancedProjectService.getProjects(
      userId,
      includeArchived
    );

    res.json({
      status: 'success',
      data: { projects },
    });
  }

  /**
   * GET /api/projects/:id
   *
   * Get project by ID
   */
  async getProjectById(req: Request, res: Response) {
    const userId = (req as AuthRequest).userId;
    const { id } = req.params;
    if (!userId) throw new AppError('Unauthorized', 401);

    const project = await enhancedProjectService.getProjectById(id, userId);

    res.json({
      status: 'success',
      data: { project },
    });
  }

  /**
   * GET /api/projects/:id/online-users
   *
   * Get list of currently online users in a project
   *
   * Response:
   * {
   *   "status": "success",
   *   "data": {
   *     "onlineUsers": [
   *       {
   *         "_id": "userId1",
   *         "name": "John Doe",
   *         "email": "john@example.com",
   *         "avatar": "..."
   *       }
   *     ],
   *     "count": 1
   *   }
   * }
   */
  async getOnlineUsers(req: Request, res: Response) {
    const userId = (req as AuthRequest).userId;
    const { id: projectId } = req.params;
    if (!userId) throw new AppError('Unauthorized', 401);

    // Verify user has access to project
    await enhancedProjectService.getProjectById(projectId, userId);

    // Get online user IDs from Redis
    const onlineUserIds = await presenceService.getOnlineUsers(projectId);

    // Fetch user details from MongoDB
    const onlineUsers = await User.find({
      _id: { $in: onlineUserIds },
    })
      .select('name email avatar lastSeenAt')
      .lean();

    res.json({
      status: 'success',
      data: {
        onlineUsers,
        count: onlineUsers.length,
      },
    });
  }
}

export const enhancedProjectController = new EnhancedProjectController();
