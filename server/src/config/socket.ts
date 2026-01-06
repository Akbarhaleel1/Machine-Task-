import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { presenceService } from './redis';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

let io: Server;

export const initializeSocket = (httpServer: HTTPServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware for Socket.io
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return next(new Error('JWT secret not configured'));
      }

      const decoded = jwt.verify(token, secret) as {
        userId: string;
        email: string;
      };

      socket.userId = decoded.userId;
      socket.userEmail = decoded.email;

      // Update user's last seen status
      await User.findByIdAndUpdate(decoded.userId, {
        lastSeenAt: new Date(),
      });

      next();
    } catch (error) {
      next(new Error('Invalid authentication'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`✅ User connected: ${socket.userId}`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Handle project room joining
    socket.on('project:join', async (projectId: string) => {
      socket.join(`project:${projectId}`);
      console.log(`User ${socket.userId} joined project ${projectId}`);

      // Add to Redis presence set
      if (socket.userId) {
        try {
          await presenceService.userJoinedProject(socket.userId, projectId);
        } catch (err) {
          // Redis not available - presence tracking disabled
        }
      }

      // Broadcast presence to project members
      socket.to(`project:${projectId}`).emit('user:online', {
        userId: socket.userId,
        projectId,
      });
    });

    // Handle project room leaving
    socket.on('project:leave', async (projectId: string) => {
      socket.leave(`project:${projectId}`);
      console.log(`User ${socket.userId} left project ${projectId}`);

      // Remove from Redis presence set
      if (socket.userId) {
        try {
          await presenceService.userLeftProject(socket.userId, projectId);
        } catch (err) {
          // Redis not available - presence tracking disabled
        }
      }

      // Broadcast presence to project members
      socket.to(`project:${projectId}`).emit('user:offline', {
        userId: socket.userId,
        projectId,
      });
    });

    // Handle typing indicators
    socket.on('task:typing', ({ taskId, projectId, isTyping }) => {
      socket.to(`project:${projectId}`).emit('task:typing', {
        taskId,
        userId: socket.userId,
        isTyping,
      });
    });

    // Disconnect handling
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.userId}`);

      if (socket.userId) {
        // Clean up Redis presence data
        try {
          await presenceService.cleanupUserPresence(socket.userId);
        } catch (err) {
          // Redis not available
        }

        // Update last seen
        await User.findByIdAndUpdate(socket.userId, {
          lastSeenAt: new Date(),
        });

        // Broadcast offline status to all rooms
        socket.broadcast.emit('user:offline', {
          userId: socket.userId,
        });
      }
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
