import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { users as usersApi } from '@/lib/api/users';
import { tasks as tasksApi } from '@/lib/api/tasks';
import type { Task } from '@/types/task';
import type { User as UserType } from '@/types/user';

interface AssigneeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onTaskUpdated: (updatedTask: Task) => void;
}

export function AssigneeSelector({
  open,
  onOpenChange,
  task,
  onTaskUpdated,
}: AssigneeSelectorProps) {
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(
    task.assignees.map((a) => a._id)
  );

  useEffect(() => {
    if (open) {
      fetchAllUsers();
      setSelectedAssignees(task.assignees.map((a) => a._id));
    }
  }, [open, task.assignees]);

  const fetchAllUsers = async () => {
    setIsLoading(true);
    try {
      const response = await usersApi.listUsers({ limit: 100 });
      setUsers(response.data.users);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error('Failed to load users', {
        description: err.response?.data?.message || 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAssignee = (userId: string) => {
    if (selectedAssignees.includes(userId)) {
      setSelectedAssignees(selectedAssignees.filter((id) => id !== userId));
    } else {
      setSelectedAssignees([...selectedAssignees, userId]);
    }
  };

  const handleSave = async () => {
    try {
      const response = await tasksApi.updateTask(task._id, {
        assignees: selectedAssignees,
      });
      toast.success('Assignees updated successfully!');
      onTaskUpdated(response.data.task);
      onOpenChange(false);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error('Failed to update assignees', {
        description: err.response?.data?.message || 'Please try again.',
      });
    }
  };

  const handleUnassign = async () => {
    try {
      const response = await tasksApi.updateTask(task._id, {
        assignees: [],
      });
      toast.success('Task unassigned successfully!');
      onTaskUpdated(response.data.task);
      onOpenChange(false);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error('Failed to unassign task', {
        description: err.response?.data?.message || 'Please try again.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Team Members</DialogTitle>
          <DialogDescription>
            Select users to assign to this task. You can assign multiple users.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Task Info */}
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="font-semibold text-sm mb-1">{task.title}</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {task.priority}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {task.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          {/* User List */}
          {isLoading ? (
            <div className="py-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p className="text-sm">No users found</p>
              <p className="text-xs mt-1">Create users in User Management first</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {users.map((user) => {
                const isSelected = selectedAssignees.includes(user.id);
                return (
                  <button
                    key={user.id}
                    onClick={() => toggleAssignee(user.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted/50 border-border'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{user.name}</p>
                        {user.role === 'ADMIN' && (
                          <Badge variant="default" className="text-xs">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                      {user.companyName && (
                        <p className="text-xs text-muted-foreground">
                          {user.companyName}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-primary to-accent-purple-600 hover:from-primary/90 hover:to-accent-purple-500"
            >
              Save
            </Button>
            {task.assignees.length > 0 && (
              <Button
                onClick={handleUnassign}
                variant="outline"
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Unassign All
              </Button>
            )}
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
