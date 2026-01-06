import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, ArrowLeft, Palette, UserPlus, X, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProjects } from '@/context/project-context';
import { toast } from 'sonner';
import { projects as projectsApi } from '@/lib/api/projects';
import { users as usersApi } from '@/lib/api/users';
import type { User } from '@/types/user';

const colorOptions = [
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#10b981', label: 'Green' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#ef4444', label: 'Red' },
  { value: '#06b6d4', label: 'Cyan' },
];

const roleOptions = [
  { value: 'ADMIN', label: 'Admin', description: 'Can manage project settings and members' },
  { value: 'MEMBER', label: 'Member', description: 'Can create and edit tasks' },
  { value: 'VIEWER', label: 'Viewer', description: 'Can only view tasks' },
];

interface MemberInput {
  userId: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
}

export function CreateProjectPage() {
  const navigate = useNavigate();
  const { createProject } = useProjects();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    icon: 'folder',
  });
  const [members, setMembers] = useState<MemberInput[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch available users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await usersApi.listUsers({ limit: 100 });
        setAvailableUsers(response.data.users);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast.error('Failed to load users', {
          description: 'You can still create the project without adding members.',
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Step 1: Create the project
      const newProject = await createProject(formData);

      // Step 2: Add members if any
      if (members.length > 0) {
        const memberPromises = members.map((member) =>
          projectsApi.addMember(newProject._id, member.email, member.role)
        );

        try {
          await Promise.all(memberPromises);
          toast.success('Project created successfully!', {
            description: `${newProject.name} has been created with ${members.length} member${members.length > 1 ? 's' : ''}.`,
          });
        } catch (memberError: any) {
          toast.warning('Project created with partial member additions', {
            description: 'Some members could not be added. You can add them later.',
          });
        }
      } else {
        toast.success('Project created successfully!', {
          description: `${newProject.name} has been created.`,
        });
      }

      navigate('/projects');
    } catch (error: any) {
      toast.error('Failed to create project', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMember = () => {
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    // Find the selected user
    const selectedUser = availableUsers.find((u) => u.id === selectedUserId);
    if (!selectedUser) {
      toast.error('User not found');
      return;
    }

    // Check for duplicate
    if (members.some((m) => m.userId === selectedUserId)) {
      toast.error('This member has already been added');
      return;
    }

    setMembers([
      ...members,
      {
        userId: selectedUser.id,
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedRole,
      },
    ]);
    setSelectedUserId('');
    setSelectedRole('MEMBER');
    toast.success('Member added to the list');
  };

  const handleRemoveMember = (userId: string) => {
    setMembers(members.filter((m) => m.userId !== userId));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-3xl mx-auto p-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/projects')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-accent-purple-600 flex items-center justify-center">
              <FolderKanban className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent-purple-600 bg-clip-text text-transparent">
                Create New Project
              </h1>
              <p className="text-muted-foreground mt-2">
                Set up a new project to organize your team's work
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="premium-card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold">
                  Project Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter project name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="h-12"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your project goals and objectives"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="resize-none"
                />
              </div>

              {/* Color Picker */}
              <div className="space-y-2">
                <Label htmlFor="color" className="text-base font-semibold flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Project Color
                </Label>
                <div className="flex gap-3 flex-wrap">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-12 h-12 rounded-lg transition-all ${
                        formData.color === color.value
                          ? 'ring-2 ring-offset-2 ring-primary scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              {/* Team Members */}
              <div className="space-y-4 pt-4 border-t">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Invite Team Members (Optional)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Select team members from existing users to collaborate on this project.
                </p>

                {/* Member Input Form */}
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading users...</span>
                  </div>
                ) : (
                  <div className="flex gap-3 items-end">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="member-select" className="text-sm">
                        Select User
                      </Label>
                      <select
                        id="member-select"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Choose a user...</option>
                        {availableUsers
                          .filter((user) => !members.some((m) => m.userId === user.id))
                          .map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.email})
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="w-40 space-y-2">
                      <Label htmlFor="member-role" className="text-sm">
                        Role
                      </Label>
                      <select
                        id="member-role"
                        value={selectedRole}
                        onChange={(e) =>
                          setSelectedRole(e.target.value as 'ADMIN' | 'MEMBER' | 'VIEWER')
                        }
                        className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {roleOptions.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddMember}
                      variant="outline"
                      className="h-11"
                      disabled={!selectedUserId}
                    >
                      Add
                    </Button>
                  </div>
                )}

                {/* Members List */}
                {members.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Added Members ({members.length})
                    </p>
                    <div className="space-y-2">
                      {members.map((member, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {member.email} • {roleOptions.find((r) => r.value === member.role)?.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                              {member.role}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(member.userId)}
                              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12 bg-gradient-to-r from-primary to-accent-purple-600 hover:from-primary/90 hover:to-accent-purple-500"
                >
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/projects')}
                  disabled={isSubmitting}
                  className="flex-1 h-12"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* Tips Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm">
                💡
              </span>
              Project Setup Tips
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Choose a clear, descriptive name that reflects your project's goal</li>
              <li>• Include specific objectives in the description</li>
              <li>• Select a color to help visually organize your projects</li>
              <li>• Add existing users to the project team or add them later from project settings</li>
              <li>• Admins can manage settings, Members can create tasks, Viewers can only view</li>
              <li>• Create user accounts in User Management before adding them to projects</li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
