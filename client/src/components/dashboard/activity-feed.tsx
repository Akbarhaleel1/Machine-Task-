import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Phone,
  MessageCircle,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  Calendar
} from 'lucide-react';

interface Activity {
  id: string;
  type: string;
  leadName: string;
  message: string;
  value?: string;
  time: string;
  channel: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const activityIcons: Record<string, any> = {
  lead_converted: CheckCircle,
  ai_call: Phone,
  hot_lead: TrendingUp,
  response: MessageCircle,
  follow_up: Calendar,
};

const channelColors: Record<string, string> = {
  WhatsApp: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  Email: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  Call: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  SMS: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
};

export function ActivityFeed({ activities }: Readonly<ActivityFeedProps>) {
  return (
    <Card className="premium-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <Badge variant="secondary" className="text-xs">Live</Badge>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activityIcons[activity.type] || MessageSquare;

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                {/* Timeline dot and line */}
                <div className="relative flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                  </div>
                  {index < activities.length - 1 && (
                    <div className="w-px h-full bg-border mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-foreground">
                        {activity.leadName}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {activity.message}
                      </p>
                      {activity.value && (
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">
                          {activity.value}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${channelColors[activity.channel] || ''}`}
                        >
                          {activity.channel}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}
