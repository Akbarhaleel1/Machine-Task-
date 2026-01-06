import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { users as usersApi } from '@/lib/api/users';
import type { CreateUserData, UpdateUserData, User } from '@/types/user';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onUserCreated?: (user: User) => void;
  onUserUpdated?: (user: User) => void;
}

export function AddUserDialog({
  open,
  onOpenChange,
  user,
  onUserCreated,
  onUserUpdated,
}: AddUserDialogProps) {
  const isEditMode = !!user;

  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    password: '',
    name: '',
    role: 'USER',
    companyName: '',
    industry: '',
    teamSize: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && open) {
      setFormData({
        email: user.email,
        password: '', // Don't populate password in edit mode
        name: user.name,
        role: user.role,
        companyName: user.companyName || '',
        industry: user.industry || '',
        teamSize: user.teamSize || '',
      });
    } else if (!open) {
      // Reset form when dialog closes
      setFormData({
        email: '',
        password: '',
        name: '',
        role: 'USER',
        companyName: '',
        industry: '',
        teamSize: '',
      });
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditMode && user) {
        // Update user
        const updateData: UpdateUserData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          companyName: formData.companyName,
          industry: formData.industry,
          teamSize: formData.teamSize,
        };
        const response = await usersApi.updateUser(user.id, updateData);
        toast.success('User updated successfully!');
        if (onUserUpdated) {
          onUserUpdated(response.data.user);
        }
      } else {
        // Create user
        const response = await usersApi.createUser(formData);
        toast.success('User created successfully!', {
          description: `Account created for ${formData.name}`,
        });
        if (onUserCreated) {
          onUserCreated(response.data.user);
        }
      }

      onOpenChange(false);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        isEditMode ? 'Failed to update user' : 'Failed to create user',
        {
          description: err.response?.data?.message || 'Please try again.',
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit User' : 'Create New User'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update user account details'
              : 'Create a new user account for your team'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="h-11"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="h-11"
            />
          </div>

          {/* Password (only in create mode) */}
          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                minLength={8}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                User can change this password after first login
              </p>
            </div>
          )}

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">
              Role <span className="text-destructive">*</span>
            </Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value as 'USER' | 'ADMIN',
                })
              }
              className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="USER">User (Standard Access)</option>
              <option value="ADMIN">Admin (Full Access)</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Admins can create users and manage all projects
            </p>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              placeholder="Acme Inc."
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              className="h-11"
            />
          </div>

          {/* Industry and Team Size */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                placeholder="Technology"
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamSize">Team Size</Label>
              <select
                id="teamSize"
                value={formData.teamSize}
                onChange={(e) =>
                  setFormData({ ...formData, teamSize: e.target.value })
                }
                className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select...</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="500+">500+</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-primary to-accent-purple-600 hover:from-primary/90 hover:to-accent-purple-500"
            >
              {isSubmitting
                ? isEditMode
                  ? 'Updating...'
                  : 'Creating...'
                : isEditMode
                ? 'Update User'
                : 'Create User'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
