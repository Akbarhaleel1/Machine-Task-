import { motion } from 'framer-motion';
import { FolderKanban, Plus, Users, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/context/project-context';

export function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, isLoading, error } = useProjects();

  const handleProjectClick = (projectId: string) => {
    navigate(`/project-board?project=${projectId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent-purple-600 bg-clip-text text-transparent">
              Projects
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage and organize your team's projects
            </p>
          </div>
          <Button
            onClick={() => navigate('/create-project')}
            className="bg-gradient-to-r from-primary to-accent-purple-600 hover:from-primary/90 hover:to-accent-purple-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="p-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && projects.length === 0 && (
          <Card className="p-12 text-center">
            <FolderKanban className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first project to get started
            </p>
            <Button
              onClick={() => navigate('/create-project')}
              className="bg-gradient-to-r from-primary to-accent-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </Card>
        )}

        {/* Projects Grid */}
        {!isLoading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className="premium-card p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleProjectClick(project._id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: project.color || '#6366f1' }}
                    >
                      <FolderKanban className="w-6 h-6 text-white" />
                    </div>
                    <Badge
                      variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}
                      className={
                        project.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : project.status === 'COMPLETED'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {project.description || 'No description'}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>
                          {project.members.length === 1
                            ? 'Owner only'
                            : `Owner + ${project.members.length - 1} member${project.members.length - 1 !== 1 ? 's' : ''}`
                          }
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
