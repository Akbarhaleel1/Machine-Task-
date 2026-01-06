import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number;
  trend: number;
  icon: React.FC<LucideProps>;
  prefix?: string;
  suffix?: string;
  format?: 'number' | 'currency';
  delay?: number;
}

export function KPICard({
  title,
  value,
  trend,
  icon: Icon,
  prefix = '',
  suffix = '',
  format = 'number',
  delay = 0,
}: Readonly<KPICardProps>) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    if (format === 'currency') {
      return Math.round(latest).toLocaleString();
    }
    return Math.round(latest).toLocaleString();
  });

  const isPositive = trend > 0;

  useEffect(() => {
    const animation = animate(count, value, {
      duration: 2,
      delay,
      ease: 'easeOut',
    });

    return animation.stop;
  }, [count, value, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="premium-card p-6 relative overflow-hidden group">
        {/* Gradient background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
              </div>
            </div>

            {/* Trend indicator */}
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
              isPositive ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              <span className="text-xs font-semibold">{Math.abs(trend)}%</span>
            </div>
          </div>

          {/* Value */}
          <div className="mt-3">
            <motion.h3 className="text-3xl font-bold text-foreground">
              {prefix}
              <motion.span>{rounded}</motion.span>
              {suffix}
            </motion.h3>
            <p className="text-xs text-muted-foreground mt-1">
              {isPositive ? 'Up' : 'Down'} from last month
            </p>
          </div>
        </div>

        {/* Decorative corner */}
        <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br from-primary/10 to-accent-purple-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </Card>
    </motion.div>
  );
}
