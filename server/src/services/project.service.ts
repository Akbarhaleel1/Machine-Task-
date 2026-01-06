import { Project } from '../models/project.model';
import { User } from '../models/user.model';
import { Task } from '../models/task.model';
import { AppError } from '../middleware/error.middleware';
import { emitProjectEvent } from '../utils/socket-events';

interface CreateProjectData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export class ProjectService {
  /**
   * Helper method to check if a user has access to a project
   * Includes linked users (admin who created them, users they created, sibling users)
   */
  async canUserAccessProject(projectId: string, userId: string): Promise<boolean> {
    const project = await Project.findById(projectId);
    if (!project) {
      return false;
    }

    // Check if user is directly a member or owner
    const isMember = project.members.some((m) => m.userId.toString() === userId);
    const isOwner = project.ownerId.toString() === userId;

    if (isMember || isOwner) {
      return true;
    }

    // Check if user has access through linked user relationships
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return false;
    }

    // Build a list of linked user IDs
    const linkedUserIds: string[] = [];

    // If user was created by an admin, include that admin
    if (currentUser.createdBy) {
      linkedUserIds.push(currentUser.createdBy.toString());
    }

    // Find all users created by the current user (if they're an admin)
    const usersCreatedByMe = await User.find({ createdBy: userId }).select('_id');
    linkedUserIds.push(...usersCreatedByMe.map(u => u._id.toString()));

    // If user was created by an admin, also include other users created by the same admin
    if (currentUser.createdBy) {
      const siblingUsers = await User.find({
        createdBy: currentUser.createdBy,
        _id: { $ne: userId }
      }).select('_id');
      linkedUserIds.push(...siblingUsers.map(u => u._id.toString()));
    }

    // Check if the project owner is in the linked users
    return linkedUserIds.includes(project.ownerId.toString());
  }

  async createProject(data: CreateProjectData, ownerId: string) {
    const project = await Project.create({
      name: data.name,
      description: data.description,
      color: data.color,
      icon: data.icon,
      ownerId,
      members: [
        {
          userId: ownerId,
          role: 'OWNER',
          joinedAt: new Date(),
        },
      ],
      status: 'ACTIVE',
    });

    return project.populate('members.userId', 'name email avatar');
  }

  async getProjects(userId: string) {
    // Get the current user to check relationships
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw new AppError('User not found', 404);
    }

    // Build a list of linked user IDs (users that should share projects)
    const linkedUserIds = [userId]; // Always include the current user

    // If user was created by an admin, include that admin
    if (currentUser.createdBy) {
      linkedUserIds.push(currentUser.createdBy.toString());
    }

    // Find all users created by the current user (if they're an admin)
    const usersCreatedByMe = await User.find({ createdBy: userId }).select('_id');
    linkedUserIds.push(...usersCreatedByMe.map(u => u._id.toString()));

    // If user was created by an admin, also include other users created by the same admin
    if (currentUser.createdBy) {
      const siblingUsers = await User.find({
        createdBy: currentUser.createdBy,
        _id: { $ne: userId } // Exclude self
      }).select('_id');
      linkedUserIds.push(...siblingUsers.map(u => u._id.toString()));
    }

    // Get projects where:
    // 1. User is owner or member, OR
    // 2. Owner is a linked user (admin who created them, users they created, or sibling users)
    const projects = await Project.find({
      $or: [
        { ownerId: { $in: linkedUserIds } },
        { 'members.userId': userId }
      ],
      status: { $ne: 'ARCHIVED' },
    })
      .populate('ownerId', 'name email avatar')
      .populate('members.userId', 'name email avatar')
      .sort({ updatedAt: -1 });

    return projects;
  }

  async getProjectById(projectId: string, userId: string) {
    const project = await Project.findById(projectId)
      .populate('ownerId', 'name email avatar')
      .populate('members.userId', 'name email avatar');

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Check if user has access (including linked users)
    const hasAccess = await this.canUserAccessProject(projectId, userId);
    if (!hasAccess) {
      throw new AppError('Access denied', 403);
    }

    return project;
  }

  async updateProject(
    projectId: string,
    userId: string,
    data: Partial<CreateProjectData>
  ) {
    const project = await this.getProjectById(projectId, userId);

    // Check if user has permission (owner or admin)
    const member = project.members.find(
      (m) => m.userId._id.toString() === userId
    );
    if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
      throw new AppError('Insufficient permissions', 403);
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { $set: data },
      { new: true }
    )
      .populate('ownerId', 'name email avatar')
      .populate('members.userId', 'name email avatar');

    // Emit real-time event
    if (updatedProject) {
      emitProjectEvent('project:updated', projectId, updatedProject);
    }

    return updatedProject;
  }

  async addMember(
    projectId: string,
    userId: string,
    memberEmail: string,
    role: string
  ) {
    const project = await this.getProjectById(projectId, userId);

    // Check if requester is owner or admin
    const requester = project.members.find(
      (m) => m.userId._id.toString() === userId
    );
    if (!requester || (requester.role !== 'OWNER' && requester.role !== 'ADMIN')) {
      throw new AppError('Insufficient permissions', 403);
    }

    // Find user by email
    const newMember = await User.findOne({ email: memberEmail });
    if (!newMember) {
      throw new AppError('User not found', 404);
    }

    // Check if already a member
    const existingMember = project.members.find(
      (m) => m.userId._id.toString() === newMember._id.toString()
    );
    if (existingMember) {
      throw new AppError('User is already a member', 400);
    }

    // Add member
    project.members.push({
      userId: newMember._id,
      role: role as any,
      joinedAt: new Date(),
    });

    await project.save();
    await project.populate('members.userId', 'name email avatar');

    // Emit real-time event
    emitProjectEvent('project:member:added', projectId, {
      member: newMember,
      role,
    });

    return project;
  }

  async removeMember(projectId: string, userId: string, memberIdToRemove: string) {
    const project = await this.getProjectById(projectId, userId);

    // Only owner can remove members
    if (project.ownerId._id.toString() !== userId) {
      throw new AppError('Only project owner can remove members', 403);
    }

    // Cannot remove owner
    if (memberIdToRemove === userId) {
      throw new AppError('Cannot remove project owner', 400);
    }

    project.members = project.members.filter(
      (m) => m.userId._id.toString() !== memberIdToRemove
    );

    await project.save();

    // Emit real-time event
    emitProjectEvent('project:member:removed', projectId, {
      memberId: memberIdToRemove,
    });

    return project;
  }

  async deleteProject(projectId: string, userId: string) {
    const project = await this.getProjectById(projectId, userId);

    // Only owner can delete
    if (project.ownerId._id.toString() !== userId) {
      throw new AppError('Only project owner can delete the project', 403);
    }

    // Delete all tasks in project
    await Task.deleteMany({ projectId });

    // Delete project
    await Project.findByIdAndDelete(projectId);

    return { message: 'Project deleted successfully' };
  }
}

export const projectService = new ProjectService();
