import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import { AppError } from '../middleware/error.middleware';

interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role?: 'USER' | 'ADMIN';
  companyName?: string;
  industry?: string;
  teamSize?: string;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'USER' | 'ADMIN';
  companyName?: string;
  industry?: string;
  teamSize?: string;
}

interface ListUsersFilters {
  role?: 'USER' | 'ADMIN';
  search?: string;
  limit?: number;
  page?: number;
}

export class UserService {
  /**
   * Create a new user (admin only)
   */
  async createUser(data: CreateUserData, createdByAdminId?: string) {
    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await User.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role || 'USER',
      companyName: data.companyName,
      industry: data.industry,
      teamSize: data.teamSize,
      onboarded: true, // Auto-onboard admin-created users
      createdBy: createdByAdminId, // Track which admin created this user
    });

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      companyName: user.companyName,
      industry: user.industry,
      teamSize: user.teamSize,
      onboarded: user.onboarded,
      createdAt: user.createdAt,
    };
  }

  /**
   * List all users with optional filters
   */
  async listUsers(filters: ListUsersFilters = {}) {
    const { role, search, limit = 50, page = 1 } = filters;

    const query: any = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      User.countDocuments(query),
    ]);

    return {
      users: users.map((user) => ({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        companyName: user.companyName,
        industry: user.industry,
        teamSize: user.teamSize,
        onboarded: user.onboarded,
        lastSeenAt: user.lastSeenAt,
        createdAt: user.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      companyName: user.companyName,
      industry: user.industry,
      teamSize: user.teamSize,
      avatar: user.avatar,
      onboarded: user.onboarded,
      lastSeenAt: user.lastSeenAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Update user details
   */
  async updateUser(userId: string, data: UpdateUserData) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if email is being changed and if it's already taken
    if (data.email && data.email !== user.email) {
      const existingUser = await User.findOne({ email: data.email });
      if (existingUser) {
        throw new AppError('Email already in use', 400);
      }
    }

    // Update fields
    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email;
    if (data.role) user.role = data.role;
    if (data.companyName !== undefined) user.companyName = data.companyName;
    if (data.industry !== undefined) user.industry = data.industry;
    if (data.teamSize !== undefined) user.teamSize = data.teamSize;

    await user.save();

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      companyName: user.companyName,
      industry: user.industry,
      teamSize: user.teamSize,
      onboarded: user.onboarded,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Delete user (soft delete by changing email or hard delete)
   */
  async deleteUser(userId: string) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Hard delete (you might want to implement soft delete instead)
    await User.findByIdAndDelete(userId);

    return {
      message: 'User deleted successfully',
    };
  }

  /**
   * Reset user password (admin only)
   */
  async resetUserPassword(userId: string, newPassword: string) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return {
      message: 'Password reset successfully',
    };
  }
}

export default new UserService();
