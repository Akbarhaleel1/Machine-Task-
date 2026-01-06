import { getIO } from '../config/socket';
import { ITask } from '../models/task.model';
import { IProject } from '../models/project.model';

export const emitTaskEvent = (
  event: 'task:created' | 'task:updated' | 'task:deleted',
  projectId: string,
  task: ITask | { _id: string }
) => {
  const io = getIO();
  io.to(`project:${projectId}`).emit(event, task);
};

export const emitProjectEvent = (
  event: 'project:updated' | 'project:member:added' | 'project:member:removed',
  projectId: string,
  data: any
) => {
  const io = getIO();
  io.to(`project:${projectId}`).emit(event, data);
};

export const emitCommentEvent = (
  projectId: string,
  taskId: string,
  comment: any
) => {
  const io = getIO();
  io.to(`project:${projectId}`).emit('task:comment:added', {
    taskId,
    comment,
  });
};

export const notifyUser = (
  userId: string,
  notification: {
    type: 'task_assigned' | 'comment_mention' | 'task_due_soon';
    title: string;
    message: string;
    link?: string;
  }
) => {
  const io = getIO();
  io.to(`user:${userId}`).emit('notification', notification);
};
