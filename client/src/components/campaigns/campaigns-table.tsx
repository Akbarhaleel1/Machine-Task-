import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Mail, Phone, MessageCircle, Calendar, DollarSign, TrendingUp, Play, Pause, CheckCircle } from 'lucide-react';
import type { Campaign } from '@/types/campaign';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CampaignsTableProps {
  campaigns: Campaign[];
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  PAUSED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  COMPLETED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
};

const channelIcons = {
  WHATSAPP: MessageSquare,
  EMAIL: Mail,
  SMS: MessageCircle,
  CALL: Phone,
};

const channelColors = {
  WHATSAPP: 'text-green-600 dark:text-green-400',
  EMAIL: 'text-blue-600 dark:text-blue-400',
  SMS: 'text-purple-600 dark:text-purple-400',
  CALL: 'text-orange-600 dark:text-orange-400',
};

export function CampaignsTable({ campaigns }: CampaignsTableProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getProgress = (sent: number, target: number) => {
    if (target === 0) return 0;
    return Math.round((sent / target) * 100);
  };

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Timeline
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {campaigns.map((campaign, index) => {
                  const ChannelIcon = channelIcons[campaign.channel];
                  const progress = getProgress(campaign.sent, campaign.targetAudience);

                  return (
                    <motion.tr
                      key={campaign.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => setSelectedCampaign(campaign)}
                    >
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="font-medium truncate">{campaign.name}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            {campaign.targetAudience.toLocaleString()} leads
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <ChannelIcon className={`w-4 h-4 ${channelColors[campaign.channel]}`} />
                          <span className="text-sm">{campaign.channel}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={statusColors[campaign.status]}>{campaign.status}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-accent-purple-600 transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium w-8">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                            <span className="font-medium">{campaign.responseRate.toFixed(1)}%</span>
                            <span className="text-muted-foreground text-xs">response</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {campaign.converted} conversions
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {campaign.budget && campaign.budget > 0
                              ? `${Math.round((campaign.spent! / campaign.budget) * 100)}% used`
                              : 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(campaign.startDate)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {campaigns.map((campaign, index) => {
          const ChannelIcon = channelIcons[campaign.channel];
          const progress = getProgress(campaign.sent, campaign.targetAudience);

          return (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedCampaign(campaign)}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{campaign.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {campaign.targetAudience.toLocaleString()} leads
                      </p>
                    </div>
                    <Badge className={statusColors[campaign.status]}>{campaign.status}</Badge>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <ChannelIcon className={`w-4 h-4 ${channelColors[campaign.channel]}`} />
                      <span className="text-sm">{campaign.channel}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                      <span>{campaign.responseRate.toFixed(1)}%</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent-purple-600 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(campaign.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <DollarSign className="w-3 h-3" />
                      <span>{formatCurrency(campaign.spent)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedCampaign(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{selectedCampaign.name}</h2>
                    <p className="text-muted-foreground mt-1">{selectedCampaign.description}</p>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedCampaign(null)}>
                    Close
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Channel</p>
                    <div className="flex items-center gap-2 mt-1">
                      {(() => {
                        const Icon = channelIcons[selectedCampaign.channel];
                        return <Icon className={`w-4 h-4 ${channelColors[selectedCampaign.channel]}`} />;
                      })()}
                      <span className="font-medium">{selectedCampaign.channel}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={`${statusColors[selectedCampaign.status]} mt-1`}>
                      {selectedCampaign.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Campaign Progress</p>
                  <div className="grid grid-cols-4 gap-4">
                    <Card className="p-3">
                      <p className="text-xs text-muted-foreground">Target</p>
                      <p className="text-xl font-bold text-primary mt-1">
                        {selectedCampaign.targetAudience.toLocaleString()}
                      </p>
                    </Card>
                    <Card className="p-3">
                      <p className="text-xs text-muted-foreground">Sent</p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                        {selectedCampaign.sent.toLocaleString()}
                      </p>
                    </Card>
                    <Card className="p-3">
                      <p className="text-xs text-muted-foreground">Replied</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                        {selectedCampaign.replied.toLocaleString()}
                      </p>
                    </Card>
                    <Card className="p-3">
                      <p className="text-xs text-muted-foreground">Converted</p>
                      <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                        {selectedCampaign.converted.toLocaleString()}
                      </p>
                    </Card>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Response Rate</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                          style={{ width: `${selectedCampaign.responseRate}%` }}
                        />
                      </div>
                      <span className="font-bold text-lg">{selectedCampaign.responseRate.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-600"
                          style={{ width: `${selectedCampaign.conversionRate}%` }}
                        />
                      </div>
                      <span className="font-bold text-lg">{selectedCampaign.conversionRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-bold text-lg mt-1">{formatCurrency(selectedCampaign.budget)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Spent</p>
                    <p className="font-bold text-lg mt-1">
                      {formatCurrency(selectedCampaign.spent)}
                      <span className="text-sm text-muted-foreground ml-2">
                        ({selectedCampaign.budget && selectedCampaign.budget > 0
                          ? Math.round((selectedCampaign.spent! / selectedCampaign.budget) * 100)
                          : 0}%)
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="mt-1">{formatDate(selectedCampaign.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="mt-1">{formatDate(selectedCampaign.endDate)}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  {selectedCampaign.status === 'ACTIVE' && (
                    <Button variant="outline" className="gap-2">
                      <Pause className="w-4 h-4" />
                      Pause Campaign
                    </Button>
                  )}
                  {selectedCampaign.status === 'PAUSED' && (
                    <Button className="gap-2">
                      <Play className="w-4 h-4" />
                      Resume Campaign
                    </Button>
                  )}
                  {selectedCampaign.status === 'DRAFT' && (
                    <Button className="gap-2">
                      <Play className="w-4 h-4" />
                      Launch Campaign
                    </Button>
                  )}
                  {selectedCampaign.status === 'COMPLETED' && (
                    <Button variant="outline" className="gap-2" disabled>
                      <CheckCircle className="w-4 h-4" />
                      Completed
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
