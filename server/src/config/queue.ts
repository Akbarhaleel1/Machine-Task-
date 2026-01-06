import { Queue, QueueEvents, Worker } from 'bullmq';

/**
 * BullMQ Queue Configuration
 *
 * Performance notes:
 * - Uses Redis connection pooling
 * - Separate queues for different job types to avoid head-of-line blocking
 * - Job retention for debugging (7 days for completed, 30 days for failed)
 */

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
};

/**
 * Queue Definitions
 */

// Email queue - for sending notification emails
export const emailQueue = new Queue('email', {
  connection,
  defaultJobOptions: {
    attempts: 3, // Retry failed jobs 3 times
    backoff: {
      type: 'exponential',
      delay: 2000, // Start with 2s delay, doubles each retry
    },
    removeOnComplete: {
      age: 7 * 24 * 60 * 60, // Keep for 7 days
      count: 1000, // Keep last 1000 jobs
    },
    removeOnFail: {
      age: 30 * 24 * 60 * 60, // Keep for 30 days
    },
  },
});

// Activity log queue - for async activity logging
export const activityQueue = new Queue('activity', {
  connection,
  defaultJobOptions: {
    attempts: 2, // Low priority, don't retry too much
    removeOnComplete: {
      age: 24 * 60 * 60, // Keep for 1 day
      count: 500,
    },
    removeOnFail: {
      age: 7 * 24 * 60 * 60, // Keep for 7 days
    },
  },
});

// Notification queue - for real-time notifications
export const notificationQueue = new Queue('notification', {
  connection,
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: {
      age: 24 * 60 * 60,
      count: 1000,
    },
  },
});

/**
 * Queue Event Listeners (for monitoring)
 */

const emailQueueEvents = new QueueEvents('email', { connection });
const activityQueueEvents = new QueueEvents('activity', { connection });

emailQueueEvents.on('completed', ({ jobId }) => {
  console.log(`✅ Email job ${jobId} completed`);
});

emailQueueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`❌ Email job ${jobId} failed:`, failedReason);
});

activityQueueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`❌ Activity job ${jobId} failed:`, failedReason);
});

/**
 * Job Type Interfaces
 */

export interface EmailJobData {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

export interface ActivityJobData {
  projectId: string;
  actorId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface NotificationJobData {
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Queue Helper Functions
 */

export const queueService = {
  /**
   * Add email job to queue
   */
  async sendEmail(data: EmailJobData, options?: any) {
    return emailQueue.add('send-email', data, options);
  },

  /**
   * Add activity log job to queue
   */
  async logActivity(data: ActivityJobData, options?: any) {
    return activityQueue.add('log-activity', data, options);
  },

  /**
   * Add notification job to queue
   */
  async sendNotification(data: NotificationJobData, options?: any) {
    return notificationQueue.add('send-notification', data, options);
  },

  /**
   * Get queue health metrics
   */
  async getQueueMetrics() {
    const [emailCounts, activityCounts, notificationCounts] = await Promise.all([
      emailQueue.getJobCounts(),
      activityQueue.getJobCounts(),
      notificationQueue.getJobCounts(),
    ]);

    return {
      email: emailCounts,
      activity: activityCounts,
      notification: notificationCounts,
    };
  },

  /**
   * Pause all queues (for maintenance)
   */
  async pauseAll() {
    await Promise.all([
      emailQueue.pause(),
      activityQueue.pause(),
      notificationQueue.pause(),
    ]);
  },

  /**
   * Resume all queues
   */
  async resumeAll() {
    await Promise.all([
      emailQueue.resume(),
      activityQueue.resume(),
      notificationQueue.resume(),
    ]);
  },
};

export default queueService;
