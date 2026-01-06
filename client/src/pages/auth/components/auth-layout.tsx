import { motion } from 'framer-motion';
import { Sparkles, Users, Zap, Target } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const features = [
    {
      icon: Target,
      title: 'Track Progress in Real-Time',
      description: 'See instant updates as tasks move from pending to done',
    },
    {
      icon: Users,
      title: 'Multi-User Collaboration',
      description: 'Work together seamlessly with your entire team',
    },
    {
      icon: Zap,
      title: 'Instant Synchronization',
      description: 'Everyone sees the same status without refreshing',
    },
    {
      icon: Sparkles,
      title: 'Smart Task Management',
      description: 'Assign work, set priorities, and never miss a deadline',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-primary to-accent-purple-600"
        >
          <div className="max-w-md">
            {/* Logo and Brand */}
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">
                Nuvacure Task Flow
              </h1>
              <p className="text-lg text-white/90">
                Real-time task management for teams that get things done
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                  className="flex items-start gap-4"
                >
                  <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-white/80">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom decoration */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <p className="text-sm text-white/70">
                Trusted by teams worldwide to organize work and boost productivity
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right side - Form */}
        <div className="flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-md"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
