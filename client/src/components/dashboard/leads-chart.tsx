import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { LeadsByStatus } from '@/types/analytics';

interface LeadsChartProps {
  data: LeadsByStatus[];
}

const COLORS = {
  Hot: '#ef4444',
  Warm: '#f59e0b',
  Cold: '#3b82f6',
  Converted: '#10b981',
};

export function LeadsChart({ data }: Readonly<LeadsChartProps>) {
  return (
    <Card className="premium-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Leads by Status</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Distribution of lead interest levels
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={2}
            dataKey="count"
            animationDuration={1000}
            label={({ status, percentage }) => `${status}: ${percentage}%`}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.status as keyof typeof COLORS] || '#6366f1'}
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-semibold">{payload[0].payload.status}</p>
                    <p className="text-sm text-muted-foreground">
                      {payload[0].value} leads ({payload[0].payload.percentage}%)
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        {data.map((item) => (
          <div key={item.status} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[item.status as keyof typeof COLORS] }}
            />
            <span className="text-sm text-muted-foreground">
              {item.status}: <span className="font-semibold text-foreground">{item.count}</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
