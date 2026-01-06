import Redis from 'ioredis';

/**
 * Redis Client Configuration
 *
 * Performance notes:
 * - Uses connection pooling for better throughput
 * - Lazy connect to avoid blocking server startup
 * - Exponential backoff for reconnection
 */

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000); // Max 2s delay
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: false, // Fail fast if Redis is down
  lazyConnect: true,
};

// Main Redis client for general operations
export const redisClient = new Redis(redisConfig);

// Separate client for pub/sub (BullMQ requirement)
export const redisPubSubClient = new Redis(redisConfig);

// Event handlers
redisClient.on('connect', () => {
  console.log('📦 Redis client connected');
});

redisClient.on('ready', () => {
  console.log('✅ Redis client ready');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis client error:', err);
});

redisClient.on('close', () => {
  console.log('🔌 Redis client connection closed');
});

// Initialize connection
export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    await redisPubSubClient.connect();
  } catch (error) {
    console.error('⚠️  Failed to connect to Redis:', error);
    console.error('⚠️  Redis features (presence tracking, background jobs, caching) will be unavailable');
    console.error('⚠️  To enable Redis: docker run -d -p 6379:6379 redis:7-alpine');
    // Don't throw - allow server to start without Redis for development
  }
};

/**
 * Presence System Utilities
 *
 * Redis data structures used:
 * - project:<projectId>:onlineUsers (SET) - Currently online user IDs
 * - user:<userId>:projects (SET) - Projects user is currently viewing
 */

export const presenceService = {
  /**
   * Add user to project's online users set
   */
  async userJoinedProject(userId: string, projectId: string): Promise<void> {
    const pipeline = redisClient.pipeline();

    // Add user to project's online set
    pipeline.sadd(`project:${projectId}:onlineUsers`, userId);

    // Add project to user's active projects
    pipeline.sadd(`user:${userId}:projects`, projectId);

    // Set expiry (auto-cleanup if connection drops)
    pipeline.expire(`project:${projectId}:onlineUsers`, 3600); // 1 hour
    pipeline.expire(`user:${userId}:projects`, 3600);

    await pipeline.exec();
  },

  /**
   * Remove user from project's online users set
   */
  async userLeftProject(userId: string, projectId: string): Promise<void> {
    const pipeline = redisClient.pipeline();

    pipeline.srem(`project:${projectId}:onlineUsers`, userId);
    pipeline.srem(`user:${userId}:projects`, projectId);

    await pipeline.exec();
  },

  /**
   * Get all online users for a project
   */
  async getOnlineUsers(projectId: string): Promise<string[]> {
    return redisClient.smembers(`project:${projectId}:onlineUsers`);
  },

  /**
   * Get count of online users for a project
   */
  async getOnlineUserCount(projectId: string): Promise<number> {
    return redisClient.scard(`project:${projectId}:onlineUsers`);
  },

  /**
   * Get all projects a user is currently viewing
   */
  async getUserActiveProjects(userId: string): Promise<string[]> {
    return redisClient.smembers(`user:${userId}:projects`);
  },

  /**
   * Clean up all presence data for a user (on disconnect)
   */
  async cleanupUserPresence(userId: string): Promise<void> {
    // Get all projects user was in
    const projects = await this.getUserActiveProjects(userId);

    const pipeline = redisClient.pipeline();

    // Remove user from all project sets
    for (const projectId of projects) {
      pipeline.srem(`project:${projectId}:onlineUsers`, userId);
    }

    // Delete user's project set
    pipeline.del(`user:${userId}:projects`);

    await pipeline.exec();
  },
};

/**
 * Cache Utilities
 */
export const cacheService = {
  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  },

  /**
   * Set cached value with optional TTL
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await redisClient.setex(key, ttlSeconds, serialized);
    } else {
      await redisClient.set(key, serialized);
    }
  },

  /**
   * Delete cached value
   */
  async del(key: string): Promise<void> {
    await redisClient.del(key);
  },

  /**
   * Delete multiple keys matching pattern
   */
  async delPattern(pattern: string): Promise<void> {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  },
};

export default redisClient;
