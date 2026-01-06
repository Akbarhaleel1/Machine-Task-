import { Schema, model, Document, Types } from 'mongoose';

export interface IComment {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask extends Document {
  title: string;
  description?: string;
  projectId: Types.ObjectId;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignees: Types.ObjectId[];
  tags?: string[];
  dueDate?: Date;
  comments: IComment[];
  attachments?: string[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    status: {
      type: String,
      enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'],
      default: 'TODO',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    assignees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    dueDate: {
      type: Date,
    },
    comments: [commentSchema],
    attachments: [
      {
        type: String,
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Performance indexes
taskSchema.index({ projectId: 1, status: 1, updatedAt: -1 }); // Dashboard queries
taskSchema.index({ assignees: 1, status: 1 }); // "My Tasks" queries
taskSchema.index({ projectId: 1, createdAt: -1 }); // Cursor pagination
taskSchema.index({ dueDate: 1, status: 1 }); // Deadline tracking

// Text index for global search
taskSchema.index(
  {
    title: 'text',
    description: 'text',
    'comments.content': 'text',
  },
  {
    weights: {
      title: 10,
      description: 5,
      'comments.content': 1,
    },
    name: 'task_search_index',
  }
);

export const Task = model<ITask>('Task', taskSchema);
