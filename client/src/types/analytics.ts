export interface DashboardKPIs {
  totalLeads: number;
  totalLeadsTrend: number;
  hotLeads: number;
  hotLeadsTrend: number;
  leadsInFollowUp: number;
  followUpTrend: number;
  revenueRecovered: number;
  revenueTrend: number;
}

export interface AIActivity {
  callsSent: number;
  messagesSent: number;
  repliesReceived: number;
  avgResponseTime: string;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

export interface LeadsByStatus {
  status: string;
  count: number;
  percentage: number;
}

export interface ChannelPerformance {
  channel: string;
  sent: number;
  delivered: number;
  replied: number;
  conversionRate: number;
}
