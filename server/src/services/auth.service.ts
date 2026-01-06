import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { AppError } from '../middleware/error.middleware';

interface RegisterData {
  email: string;
  password: string;
  name: string;
  companyName?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface UpdateProfileData {
  name?: string;
  email?: string;
  companyName?: string;
  industry?: string;
  teamSize?: string;
  avatar?: string;
}

export class AuthService {
  async register(data: RegisterData) {
    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user - self-registration always creates ADMIN
    const user = await User.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      companyName: data.companyName,
      role: 'ADMIN', // Self-registered users are always admins
    });

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user._id.toString(), user.email);

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        companyName: user.companyName,
        role: user.role,
        onboarded: user.onboarded,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginData) {
    // Find user
    const user = await User.findOne({ email: data.email });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.password);

    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user._id.toString(), user.email);

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        companyName: user.companyName,
        role: user.role,
        onboarded: user.onboarded,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  async getMe(userId: string) {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      companyName: user.companyName,
      industry: user.industry,
      teamSize: user.teamSize,
      role: user.role,
      onboarded: user.onboarded,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(userId: string, data: UpdateProfileData) {
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
    if (data.companyName !== undefined) user.companyName = data.companyName;
    if (data.industry !== undefined) user.industry = data.industry;
    if (data.teamSize !== undefined) user.teamSize = data.teamSize;
    if (data.avatar !== undefined) user.avatar = data.avatar;

    await user.save();

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      companyName: user.companyName,
      industry: user.industry,
      teamSize: user.teamSize,
      role: user.role,
      onboarded: user.onboarded,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private generateTokens(userId: string, email: string) {
    const accessTokenSecret = process.env.JWT_SECRET;
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

    if (!accessTokenSecret || !refreshTokenSecret) {
      throw new AppError('Token secrets not configured', 500);
    }

    const accessToken = jwt.sign(
      { userId, email },
      accessTokenSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { userId, email },
      refreshTokenSecret,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
  }
}

export default new AuthService();
