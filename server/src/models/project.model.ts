import { Schema, model, Document, Types } from 'mongoose';

export interface IProjectMember {
  userId: Types.ObjectId;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  joinedAt: Date;
}

export interface IProject extends Document {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  ownerId: Types.ObjectId;
  members: IProjectMember[];
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  taskCount: number; // Total tasks in project
  openTaskCount: number; // Tasks not in DONE status
  createdAt: Date;
  updatedAt: Date;
}

const projectMemberSchema = new Schema<IProjectMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'],
      default: 'MEMBER',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    icon: {
      type: String,
      default: 'folder',
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [projectMemberSchema],
    status: {
      type: String,
      enum: ['ACTIVE', 'ARCHIVED', 'COMPLETED'],
      default: 'ACTIVE',
    },
    taskCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    openTaskCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
projectSchema.index({ ownerId: 1, createdAt: -1 });
projectSchema.index({ 'members.userId': 1 });
projectSchema.index({ status: 1 });

// Compound index for dashboard queries
projectSchema.index({ 'members.userId': 1, status: 1, updatedAt: -1 });

export const Project = model<IProject>('Project', projectSchema);
