import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { Plus, MoreVertical, User, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddTaskDialog } from '@/components/AddTaskDialog';
import { AssigneeSelector } from '@/components/AssigneeSelector';
import { tasks as tasksApi } from '@/lib/api/tasks';
import type { Task } from '@/types/task';
import { toast } from 'sonner';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';

const priorityColors = {
  LOW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  URGENT: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
};

interface TaskCardProps {
  task: Task;
  index: number;
  isDragging?: boolean;
  onAssigneeClick: (task: Task) => void;
}

function TaskCard({ task, index, isDragging = false, onAssigneeClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task._id,
    data: {
      task,
      type: 'task',
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-semibold text-sm">{task.title}</h4>
          <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-2">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {task.description || 'No description'}
        </p>

        <div className="flex items-center justify-between">
          <Badge variant="secondary" className={priorityColors[task.priority]}>
            {task.priority.toLowerCase()}
          </Badge>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAssigneeClick(task);
            }}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer px-2 py-1 rounded hover:bg-muted/50"
          >
            {task.assignees.length > 0 ? (
              <>
                <User className="w-3 h-3" />
                <span>{task.assignees[0].name.split(' ')[0]}</span>
                {task.assignees.length > 1 && (
                  <span className="text-xs">+{task.assignees.length - 1}</span>
                )}
              </>
            ) : (
              <>
                <User className="w-3 h-3" />
                <span>Unassigned</span>
              </>
            )}
          </button>
        </div>

        {task.dueDate && (
          <div className="mt-3 text-xs text-muted-foreground">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </div>
        )}

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
}

interface ColumnProps {
  title: string;
  tasks: Task[];
  color: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  onAddTask: (status: string) => void;
  activeTaskId?: string;
  onAssigneeClick: (task: Task) => void;
}

function Column({ title, tasks, color, status, onAddTask, activeTaskId, onAssigneeClick }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'column',
      status,
    },
  });

  return (
    <div className="flex-1 min-w-[300px]">
      <Card className={`h-full transition-colors ${isOver ? 'bg-muted/60 ring-2 ring-primary' : 'bg-muted/30'}`}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${color}`} />
              <h3 className="font-semibold">{title}</h3>
              <Badge variant="secondary">{tasks.length}</Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onAddTask(status)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div ref={setNodeRef} className="p-4 space-y-3 min-h-[400px]">
          {tasks.map((task, index) => (
            <TaskCard
              key={task._id}
              task={task}
              index={index}
              isDragging={task._id === activeTaskId}
              onAssigneeClick={onAssigneeClick}
            />
          ))}
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p className="text-sm">No tasks yet</p>
              <p className="text-xs mt-1">Click + to add a task</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export function ProjectBoardPage() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'>('TODO');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isAssigneeDialogOpen, setIsAssigneeDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  const fetchTasks = useCallback(async () => {
    if (!projectId) {
      toast.error('No project selected');
      return;
    }

    setIsLoading(true);
    try {
      const response = await tasksApi.getTasks(projectId);
      setTasks(response.data.tasks);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error('Failed to load tasks', {
        description: err.response?.data?.message || 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchTasks();
    }
  }, [projectId, fetchTasks]);

  const handleAddTask = (status: string) => {
    setSelectedStatus(status as 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE');
    setIsDialogOpen(true);
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks([...tasks, newTask]);
  };

  const handleAssigneeClick = (task: Task) => {
    setSelectedTask(task);
    setIsAssigneeDialogOpen(true);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(
      tasks.map((t) => (t._id === updatedTask._id ? updatedTask : t))
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

    // Find the task being dragged
    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistically update UI
    setTasks(
      tasks.map((t) =>
        t._id === taskId ? { ...t, status: newStatus } : t
      )
    );

    // Update on server
    try {
      await tasksApi.updateTask(taskId, { status: newStatus });
      toast.success('Task moved successfully!', {
        description: `Moved to ${newStatus.replace('_', ' ').toLowerCase()}`,
      });
    } catch (error) {
      // Revert on error
      setTasks(
        tasks.map((t) =>
          t._id === taskId ? { ...t, status: task.status } : t
        )
      );
      const err = error as { response?: { data?: { message?: string } } };
      toast.error('Failed to move task', {
        description: err.response?.data?.message || 'Please try again.',
      });
    }
  };

  // Group tasks by status
  const todoTasks = tasks.filter((t) => t.status === 'TODO');
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const inReviewTasks = tasks.filter((t) => t.status === 'IN_REVIEW');
  const doneTasks = tasks.filter((t) => t.status === 'DONE');

  if (!projectId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No project selected</p>
          <Button onClick={() => window.history.back()} className="mt-4">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-[1600px] mx-auto p-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent-purple-600 bg-clip-text text-transparent">
                Project Board
              </h1>
              <p className="text-muted-foreground mt-2">
                Track and manage your project tasks
              </p>
            </div>
            <Button
              onClick={() => handleAddTask('TODO')}
              className="bg-gradient-to-r from-primary to-accent-purple-600 hover:from-primary/90 hover:to-accent-purple-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Kanban Board */}
        {!isLoading && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex gap-6 overflow-x-auto pb-4"
            >
              <Column
                title="To Do"
                tasks={todoTasks}
                color="bg-gray-500"
                status="TODO"
                onAddTask={handleAddTask}
                activeTaskId={activeTaskId || undefined}
                onAssigneeClick={handleAssigneeClick}
              />
              <Column
                title="In Progress"
                tasks={inProgressTasks}
                color="bg-blue-500"
                status="IN_PROGRESS"
                onAddTask={handleAddTask}
                activeTaskId={activeTaskId || undefined}
                onAssigneeClick={handleAssigneeClick}
              />
              <Column
                title="In Review"
                tasks={inReviewTasks}
                color="bg-yellow-500"
                status="IN_REVIEW"
                onAddTask={handleAddTask}
                activeTaskId={activeTaskId || undefined}
                onAssigneeClick={handleAssigneeClick}
              />
              <Column
                title="Done"
                tasks={doneTasks}
                color="bg-green-500"
                status="DONE"
                onAddTask={handleAddTask}
                activeTaskId={activeTaskId || undefined}
                onAssigneeClick={handleAssigneeClick}
              />
            </motion.div>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeTaskId ? (
                <Card className="p-4 cursor-grabbing shadow-2xl rotate-3 opacity-90">
                  <div className="font-semibold text-sm">
                    {tasks.find((t) => t._id === activeTaskId)?.title}
                  </div>
                </Card>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {/* Add Task Dialog */}
        {projectId && (
          <AddTaskDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            projectId={projectId}
            defaultStatus={selectedStatus}
            onTaskCreated={handleTaskCreated}
          />
        )}

        {/* Assignee Selector Dialog */}
        {selectedTask && (
          <AssigneeSelector
            open={isAssigneeDialogOpen}
            onOpenChange={setIsAssigneeDialogOpen}
            task={selectedTask}
            onTaskUpdated={handleTaskUpdated}
          />
        )}
      </div>
    </div>
  );
}
