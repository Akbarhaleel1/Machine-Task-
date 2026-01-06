import { Schema, model, Document, Types } from 'mongoose';

export interface IActivityLog extends Document {
  projectId: Types.ObjectId;
  actorId: Types.ObjectId; // User who performed the action
  action: string; // e.g., 'project_created', 'task_created', 'member_added'
  targetType?: string; // 'project', 'task', 'member'
  targetId?: Types.ObjectId; // ID of the affected entity
  metadata?: Record<string, any>; // Additional context (e.g., old/new values)
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true, // For filtering by project
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // For user activity tracking
    },
    action: {
      type: String,
      required: true,
      index: true, // For filtering by action type
    },
    targetType: {
      type: String,
      enum: ['project', 'task', 'member', 'comment', 'attachment'],
    },
    targetId: {
      type: Schema.Types.ObjectId,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only track creation time
  }
);

// Performance indexes for activity feed queries
// Most common query: Get recent activity for a project
activityLogSchema.index({ projectId: 1, createdAt: -1 });

// User activity timeline
activityLogSchema.index({ actorId: 1, createdAt: -1 });

// Compound index for filtered queries (e.g., "task_created" events in a project)
activityLogSchema.index({ projectId: 1, action: 1, createdAt: -1 });

// TTL index - automatically delete logs older than 90 days to save space
activityLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 } // 90 days
);

export const ActivityLog = model<IActivityLog>('ActivityLog', activityLogSchema);
