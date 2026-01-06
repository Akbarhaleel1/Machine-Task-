import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
  FolderKanban,
  PlusCircle,
  Settings,
  Zap,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context';

const baseNavigation = [
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Create Project', href: '/create-project', icon: PlusCircle },
];

const adminNavigation = [
  { name: 'User Management', href: '/users', icon: Users, adminOnly: true },
];

const bottomNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Combine navigation items based on user role
  const navigation = [
    ...baseNavigation,
    ...(isAdmin ? adminNavigation : []),
  ];

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-card/50 backdrop-blur-xl z-50"
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent-purple-600 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent-purple-600 bg-clip-text text-transparent">
                SynxCalz
              </h1>
              <p className="text-xs text-muted-foreground">AI Lead Automation</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item, index) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/50'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center gap-3 w-full"
                >
                  <item.icon className={cn('w-5 h-5', isActive && 'animate-pulse')} />
                  <span>{item.name}</span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Navigation */}
        <div className="p-4 space-y-1">
          <Separator className="mb-4" />
          {bottomNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
