import { Task, ITask } from '../models/task.model';
import { Project } from '../models/project.model';
import { User } from '../models/user.model';
import { AppError } from '../middleware/error.middleware';
import {
  emitTaskEvent,
  emitCommentEvent,
  notifyUser,
} from '../utils/socket-events';
import { Types } from 'mongoose';
import { projectService } from './project.service';

interface CreateTaskData {
  title: string;
  description?: string;
  projectId: string;
  status?: string;
  priority?: string;
  assignees?: string[];
  tags?: string[];
  dueDate?: Date;
}

interface TaskFilter {
  status?: string;
  priority?: string;
  assigneeId?: string;
  tags?: string[];
}

interface PaginationParams {
  cursor?: string;
  limit?: number;
}

export class TaskService {
  async createTask(data: CreateTaskData, userId: string) {
    // Verify project exists and user has access (including linked users)
    const project = await Project.findById(data.projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const hasAccess = await projectService.canUserAccessProject(data.projectId, userId);
    if (!hasAccess) {
      throw new AppError('Access denied', 403);
    }

    // Validate assignees are project members
    if (data.assignees && data.assignees.length > 0) {
      const validAssignees = data.assignees.filter((assigneeId) =>
        project.members.some((m) => m.userId.toString() === assigneeId)
      );
      data.assignees = validAssignees;
    }

    const task = await Task.create({
      ...data,
      createdBy: userId,
      comments: [],
    });

    await task.populate([
      { path: 'assignees', select: 'name email avatar' },
      { path: 'createdBy', select: 'name email avatar' },
    ]);

    // Emit real-time event
    emitTaskEvent('task:created', data.projectId, task);

    // Notify assignees
    if (task.assignees && task.assignees.length > 0) {
      task.assignees.forEach((assignee: any) => {
        notifyUser(assignee._id.toString(), {
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: `You have been assigned to: ${task.title}`,
          link: `/projects/${data.projectId}/tasks/${task._id}`,
        });
      });
    }

    return task;
  }

  async getTasks(
    projectId: string,
    userId: string,
    filter: TaskFilter = {},
    pagination: PaginationParams = {}
  ) {
    // Verify project access (including linked users)
    const hasAccess = await projectService.canUserAccessProject(projectId, userId);
    if (!hasAccess) {
      throw new AppError('Access denied', 403);
    }

    // Build query
    const query: any = { projectId };

    if (filter.status) query.status = filter.status;
    if (filter.priority) query.priority = filter.priority;
    if (filter.assigneeId) query.assignees = filter.assigneeId;
    if (filter.tags && filter.tags.length > 0) {
      query.tags = { $in: filter.tags };
    }

    // Cursor-based pagination
    if (pagination.cursor) {
      query._id = { $lt: pagination.cursor };
    }

    const limit = pagination.limit || 20;

    const tasks = await Task.find(query)
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(limit + 1); // Fetch one extra to determine hasMore

    const hasMore = tasks.length > limit;
    const results = hasMore ? tasks.slice(0, limit) : tasks;
    const nextCursor = hasMore ? results[results.length - 1]._id.toString() : null;

    return {
      tasks: results,
      pagination: {
        nextCursor,
        hasMore,
      },
    };
  }

  async getTaskById(taskId: string, userId: string) {
    const task = await Task.findById(taskId)
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('comments.userId', 'name email avatar');

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Verify project access (including linked users)
    const hasAccess = await projectService.canUserAccessProject(task.projectId.toString(), userId);
    if (!hasAccess) {
      throw new AppError('Access denied', 403);
    }

    return task;
  }

  async updateTask(taskId: string, userId: string, data: Partial<CreateTaskData>) {
    const task = await this.getTaskById(taskId, userId);

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $set: data },
      { new: true }
    )
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    // Emit real-time event
    if (updatedTask) {
      emitTaskEvent('task:updated', updatedTask.projectId.toString(), updatedTask);
    }

    return updatedTask;
  }

  async deleteTask(taskId: string, userId: string) {
    const task = await this.getTaskById(taskId, userId);

    // Only creator or project owner can delete
    const project = await Project.findById(task.projectId);
    if (
      task.createdBy._id.toString() !== userId &&
      project?.ownerId.toString() !== userId
    ) {
      throw new AppError('Insufficient permissions', 403);
    }

    await Task.findByIdAndDelete(taskId);

    // Emit real-time event
    emitTaskEvent('task:deleted', task.projectId.toString(), { _id: taskId });

    return { message: 'Task deleted successfully' };
  }

  async addComment(taskId: string, userId: string, content: string) {
    const task = await this.getTaskById(taskId, userId);
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const comment = {
      _id: new Types.ObjectId(),
      userId: new Types.ObjectId(userId),
      userName: user.name,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    task.comments.push(comment);
    await task.save();

    // Emit real-time event
    emitCommentEvent(task.projectId.toString(), taskId, comment);

    return comment;
  }

  async searchTasks(projectId: string, userId: string, searchQuery: string) {
    // Verify project access (including linked users)
    const hasAccess = await projectService.canUserAccessProject(projectId, userId);
    if (!hasAccess) {
      throw new AppError('Access denied', 403);
    }

    // Use text index for search
    const tasks = await Task.find({
      projectId,
      $text: { $search: searchQuery },
    })
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ score: { $meta: 'textScore' } })
      .limit(50);

    return tasks;
  }

  async getDashboardStats(projectId: string, userId: string) {
    // Verify project access (including linked users)
    const hasAccess = await projectService.canUserAccessProject(projectId, userId);
    if (!hasAccess) {
      throw new AppError('Access denied', 403);
    }

    const tasks = await Task.find({ projectId });

    const stats = {
      total: tasks.length,
      byStatus: {
        TODO: tasks.filter((t) => t.status === 'TODO').length,
        IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
        IN_REVIEW: tasks.filter((t) => t.status === 'IN_REVIEW').length,
        DONE: tasks.filter((t) => t.status === 'DONE').length,
      },
      byPriority: {
        LOW: tasks.filter((t) => t.priority === 'LOW').length,
        MEDIUM: tasks.filter((t) => t.priority === 'MEDIUM').length,
        HIGH: tasks.filter((t) => t.priority === 'HIGH').length,
        URGENT: tasks.filter((t) => t.priority === 'URGENT').length,
      },
      myTasks: tasks.filter((t) =>
        t.assignees.some((a) => a.toString() === userId)
      ).length,
      overdue: tasks.filter(
        (t) => t.dueDate && t.dueDate < new Date() && t.status !== 'DONE'
      ).length,
    };

    return stats;
  }
}

export const taskService = new TaskService();
