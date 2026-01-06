import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Building2, Briefcase, Users, Save, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import { authApi } from '@/lib/api/auth';
import { toast } from 'sonner';

interface ProfileData {
  name: string;
  email: string;
  companyName: string;
  industry: string;
  teamSize: string;
  avatar: string;
}

export function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    companyName: '',
    industry: '',
    teamSize: '',
    avatar: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        companyName: user.companyName || '',
        industry: user.industry || '',
        teamSize: user.teamSize || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Filter out empty string values to avoid validation errors
      const dataToUpdate = Object.fromEntries(
        Object.entries(profileData).filter(([_, value]) => value !== '')
      ) as Partial<ProfileData>;

      await authApi.updateProfile(dataToUpdate);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      // Refresh user data
      await authApi.getMe();
      // You might want to update the auth context here
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error('Failed to update profile', {
        description: err.response?.data?.message || 'Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original user data
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        companyName: user.companyName || '',
        industry: user.industry || '',
        teamSize: user.teamSize || '',
        avatar: user.avatar || '',
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent-purple-600 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your personal information and preferences
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-primary to-accent-purple-600 hover:from-primary/90 hover:to-accent-purple-500"
                >
                  Edit Profile
                </Button>
              )}
            </div>

            <div className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-muted' : ''}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-muted' : ''}
                />
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="companyName" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Company Name
                </Label>
                <Input
                  id="companyName"
                  value={profileData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-muted' : ''}
                  placeholder="Enter your company name"
                />
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label htmlFor="industry" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Industry
                </Label>
                <Input
                  id="industry"
                  value={profileData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-muted' : ''}
                  placeholder="e.g., Technology, Healthcare, Finance"
                />
              </div>

              {/* Team Size */}
              <div className="space-y-2">
                <Label htmlFor="teamSize" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Team Size
                </Label>
                <Input
                  id="teamSize"
                  value={profileData.teamSize}
                  onChange={(e) => handleInputChange('teamSize', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-muted' : ''}
                  placeholder="e.g., 1-10, 11-50, 51-200"
                />
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-primary to-accent-purple-600 hover:from-primary/90 hover:to-accent-purple-500"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={isSaving}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {/* Account Info */}
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-lg font-semibold mb-4">Account Information</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Account Type:</span>
                  <span className="font-medium text-foreground">
                    {user?.role === 'ADMIN' ? 'Administrator' : 'User'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Member Since:</span>
                  <span className="font-medium text-foreground">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
