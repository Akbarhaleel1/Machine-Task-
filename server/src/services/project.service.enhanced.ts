import mongoose from 'mongoose';
import { Project, IProject } from '../models/project.model';
import { User } from '../models/user.model';
import { AppError } from '../middleware/error.middleware';
import { getIO } from '../config/socket';
import { queueService } from '../config/queue';

/**
 * Enhanced Project Service
 *
 * Production-grade implementation with:
 * - MongoDB transactions for atomicity
 * - Real-time Socket.IO events
 * - Background job queuing
 * - Performance optimizations
 */

interface CreateProjectData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export class EnhancedProjectService {
  /**
   * Create a new project
   *
   * Uses MongoDB transaction to ensure atomicity.
   * Steps:
   * 1. Create project document
   * 2. Add owner as first member
   * 3. Initialize counters (taskCount, openTaskCount)
   * 4. Emit Socket.IO event (real-time)
   * 5. Queue background jobs (activity log, email)
   */
  async createProject(data: CreateProjectData, ownerId: string): Promise<IProject> {
    // Start MongoDB session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Step 1: Create project with owner as first member
      const [project] = await Project.create(
        [
          {
            name: data.name,
            description: data.description,
            color: data.color || '#6366f1',
            icon: data.icon || 'folder',
            ownerId,
            members: [
              {
                userId: ownerId,
                role: 'OWNER',
                joinedAt: new Date(),
              },
            ],
            status: 'ACTIVE',
            taskCount: 0, // Initialize counters
            openTaskCount: 0,
          },
        ],
        { session } // Run in transaction
      );

      // Step 2: Verify user exists (referential integrity check)
      const user = await User.findById(ownerId).session(session);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Commit transaction
      await session.commitTransaction();

      // Step 3: Populate owner details for response
      await project.populate('ownerId', 'name email avatar');
      await project.populate('members.userId', 'name email avatar');

      // Step 4: Real-time event - Emit to user's personal room
      try {
        const io = getIO();
        io.to(`user:${ownerId}`).emit('project:created', {
          project: project.toObject(),
          timestamp: new Date(),
        });
      } catch (err) {
        console.error('Socket.IO emit error:', err);
        // Don't fail the request if Socket.IO is unavailable
      }

      // Step 5: Background jobs (non-blocking)
      // These run asynchronously and don't block the API response

      // Queue activity log job
      queueService.logActivity({
        projectId: project._id.toString(),
        actorId: ownerId,
        action: 'project_created',
        targetType: 'project',
        targetId: project._id,
        metadata: {
          projectName: project.name,
        },
      });

      // Queue notification job for other team members (if any were invited)
      // In future: Add support for inviting members during creation
      // For now, only owner is added

      console.log(`✅ Project created: ${project._id} by user ${ownerId}`);

      return project;
    } catch (error) {
      // Rollback transaction on error
      await session.abortTransaction();
      throw error;
    } finally {
      // Clean up session
      session.endSession();
    }
  }

  /**
   * Get all projects for a user
   *
   * Performance optimizations:
   * - Uses compound index: { 'members.userId': 1, status: 1, updatedAt: -1 }
   * - Limits populated fields to reduce payload size
   * - Excludes archived projects by default
   */
  async getProjects(userId: string, includeArchived: boolean = false) {
    const filter: any = {
      $or: [{ ownerId: userId }, { 'members.userId': userId }],
    };

    if (!includeArchived) {
      filter.status = { $ne: 'ARCHIVED' };
    }

    const projects = await Project.find(filter)
      .populate('ownerId', 'name email avatar')
      .populate('members.userId', 'name email avatar')
      .sort({ updatedAt: -1 }) // Most recently updated first
      .lean(); // Convert to plain objects for better performance

    return projects;
  }

  /**
   * Get project by ID
   *
   * Includes access control check
   */
  async getProjectById(projectId: string, userId: string) {
    const project = await Project.findById(projectId)
      .populate('ownerId', 'name email avatar')
      .populate('members.userId', 'name email avatar');

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Access control: Check if user is a member
    const isMember = project.members.some(
      (m) => m.userId._id.toString() === userId
    );

    if (!isMember && project.ownerId._id.toString() !== userId) {
      throw new AppError('Access denied', 403);
    }

    return project;
  }

  /**
   * Update project counters (called when tasks are created/updated)
   *
   * Uses atomic operations for thread safety
   */
  async incrementTaskCount(projectId: string, isOpen: boolean = true) {
    const update: any = { $inc: { taskCount: 1 } };
    if (isOpen) {
      update.$inc.openTaskCount = 1;
    }

    await Project.findByIdAndUpdate(projectId, update);
  }

  async decrementTaskCount(projectId: string, wasOpen: boolean = true) {
    const update: any = { $inc: { taskCount: -1 } };
    if (wasOpen) {
      update.$inc.openTaskCount = -1;
    }

    await Project.findByIdAndUpdate(projectId, update);
  }

  /**
   * Update open task count when task status changes
   */
  async updateTaskStatus(projectId: string, fromStatus: string, toStatus: string) {
    const wasOpen = fromStatus !== 'DONE';
    const isOpen = toStatus !== 'DONE';

    if (wasOpen && !isOpen) {
      // Task was completed
      await Project.findByIdAndUpdate(projectId, { $inc: { openTaskCount: -1 } });
    } else if (!wasOpen && isOpen) {
      // Task was reopened
      await Project.findByIdAndUpdate(projectId, { $inc: { openTaskCount: 1 } });
    }
  }
}

export const enhancedProjectService = new EnhancedProjectService();
