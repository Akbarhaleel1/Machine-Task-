import { Worker, Job } from 'bullmq';
import {
  EmailJobData,
  ActivityJobData,
  NotificationJobData,
} from '../config/queue';
import { ActivityLog } from '../models/activity-log.model';
import { getIO } from '../config/socket';

/**
 * Background Job Workers
 *
 * Each worker processes jobs from its respective queue.
 * Workers run in separate processes/containers in production for better isolation.
 */

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
};

/**
 * Email Worker
 *
 * Processes email sending jobs.
 * In production, integrate with SendGrid, AWS SES, or similar service.
 */
export const emailWorker = new Worker<EmailJobData>(
  'email',
  async (job: Job<EmailJobData>) => {
    const { to, subject, template, context } = job.data;

    console.log(`📧 Sending email to ${to} with subject: ${subject}`);

    // TODO: Integrate with actual email service
    // Example: await sendgrid.send({ to, subject, html: renderTemplate(template, context) });

    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(`✅ Email sent successfully to ${to}`);

    return { success: true, to, subject };
  },
  {
    connection,
    concurrency: 10, // Process 10 emails concurrently
    limiter: {
      max: 100, // Max 100 jobs
      duration: 60000, // per minute (to avoid rate limits)
    },
  }
);

/**
 * Activity Log Worker
 *
 * Processes activity logging jobs.
 * Non-blocking writes to MongoDB for audit trail.
 */
export const activityWorker = new Worker<ActivityJobData>(
  'activity',
  async (job: Job<ActivityJobData>) => {
    const {
      projectId,
      actorId,
      action,
      targetType,
      targetId,
      metadata,
      ipAddress,
      userAgent,
    } = job.data;

    try {
      // Write to MongoDB
      await ActivityLog.create({
        projectId,
        actorId,
        action,
        targetType,
        targetId,
        metadata,
        ipAddress,
        userAgent,
      });

      console.log(
        `📝 Activity logged: ${action} by user ${actorId} in project ${projectId}`
      );

      return { success: true };
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error; // Will trigger retry
    }
  },
  {
    connection,
    concurrency: 50, // High concurrency for logs
  }
);

/**
 * Notification Worker
 *
 * Processes real-time notification jobs.
 * Emits Socket.IO events to connected users.
 */
export const notificationWorker = new Worker<NotificationJobData>(
  'notification',
  async (job: Job<NotificationJobData>) => {
    const { userId, type, title, message, metadata } = job.data;

    try {
      const io = getIO();

      // Emit to user's personal room
      io.to(`user:${userId}`).emit('notification', {
        type,
        title,
        message,
        metadata,
        timestamp: new Date(),
      });

      console.log(`🔔 Notification sent to user ${userId}: ${title}`);

      return { success: true, userId };
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  },
  {
    connection,
    concurrency: 100, // Very high concurrency for real-time
  }
);

/**
 * Worker Event Handlers
 */

emailWorker.on('completed', (job) => {
  console.log(`✅ Email job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`❌ Email job ${job?.id} failed:`, err.message);
});

activityWorker.on('completed', (job) => {
  console.log(`✅ Activity job ${job.id} completed`);
});

activityWorker.on('failed', (job, err) => {
  console.error(`❌ Activity job ${job?.id} failed:`, err.message);
});

notificationWorker.on('completed', (job) => {
  console.log(`✅ Notification job ${job.id} completed`);
});

notificationWorker.on('failed', (job, err) => {
  console.error(`❌ Notification job ${job?.id} failed:`, err.message);
});

/**
 * Graceful Shutdown
 */
export const shutdownWorkers = async () => {
  console.log('🛑 Shutting down workers...');

  await Promise.all([
    emailWorker.close(),
    activityWorker.close(),
    notificationWorker.close(),
  ]);

  console.log('✅ Workers shut down gracefully');
};

// Handle process termination
process.on('SIGTERM', shutdownWorkers);
process.on('SIGINT', shutdownWorkers);

console.log('🔧 Background workers initialized');
