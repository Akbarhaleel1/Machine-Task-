import { motion } from 'framer-motion';
import { Users, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { KPICard } from '@/components/dashboard/kpi-card';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { LeadsChart } from '@/components/dashboard/leads-chart';
import {
  mockDashboardKPIs,
  mockRevenueData,
  mockLeadsByStatus,
  mockRecentActivity,
  mockAIActivity,
} from '@/mocks/analytics';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function DashboardPage() {
  const kpis = mockDashboardKPIs;
  const aiActivity = mockAIActivity;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's what's happening with your leads today.
          </p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Leads"
            value={kpis.totalLeads}
            trend={kpis.totalLeadsTrend}
            icon={Users}
            delay={0}
          />
          <KPICard
            title="Hot Leads"
            value={kpis.hotLeads}
            trend={kpis.hotLeadsTrend}
            icon={TrendingUp}
            delay={0.1}
          />
          <KPICard
            title="In Follow-up"
            value={kpis.leadsInFollowUp}
            trend={kpis.followUpTrend}
            icon={Clock}
            delay={0.2}
          />
          <KPICard
            title="Revenue Recovered"
            value={kpis.revenueRecovered}
            trend={kpis.revenueTrend}
            icon={DollarSign}
            prefix="$"
            format="currency"
            delay={0.3}
          />
        </div>

        {/* AI Activity Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="premium-card p-6 bg-gradient-to-br from-primary/10 via-background to-accent-purple-500/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">AI Activity</h3>
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                Active
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{aiActivity.callsSent.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">Calls Sent</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{aiActivity.messagesSent.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">Messages Sent</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{aiActivity.repliesReceived.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">Replies Received</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{aiActivity.avgResponseTime}</p>
                <p className="text-sm text-muted-foreground mt-1">Avg Response Time</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <RevenueChart data={mockRevenueData} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <LeadsChart data={mockLeadsByStatus} />
          </motion.div>
        </div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <ActivityFeed activities={mockRecentActivity} />
        </motion.div>
      </div>
    </div>
  );
}
