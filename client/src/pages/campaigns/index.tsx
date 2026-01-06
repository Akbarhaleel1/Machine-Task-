import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Download, RefreshCw, MessageSquare, Mail, Phone, MessageCircle } from 'lucide-react';
import { CampaignsTable } from '@/components/campaigns/campaigns-table';
import { mockCampaigns } from '@/mocks/analytics';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CampaignStatus, CampaignChannel } from '@/types/campaign';

export function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'ALL'>('ALL');
  const [channelFilter, setChannelFilter] = useState<CampaignChannel | 'ALL'>('ALL');

  const filteredCampaigns = useMemo(() => {
    return mockCampaigns.filter((campaign) => {
      const matchesSearch =
        searchQuery === '' ||
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || campaign.status === statusFilter;
      const matchesChannel = channelFilter === 'ALL' || campaign.channel === channelFilter;

      return matchesSearch && matchesStatus && matchesChannel;
    });
  }, [searchQuery, statusFilter, channelFilter]);

  const stats = useMemo(() => {
    const activeCampaigns = mockCampaigns.filter((c) => c.status === 'ACTIVE');
    const totalSent = mockCampaigns.reduce((sum, c) => sum + c.sent, 0);
    const totalReplied = mockCampaigns.reduce((sum, c) => sum + c.replied, 0);
    const totalConverted = mockCampaigns.reduce((sum, c) => sum + c.converted, 0);
    const totalSpent = mockCampaigns.reduce((sum, c) => sum + (c.spent || 0), 0);
    const avgResponseRate =
      mockCampaigns.length > 0
        ? mockCampaigns.reduce((sum, c) => sum + c.responseRate, 0) / mockCampaigns.length
        : 0;

    return {
      total: mockCampaigns.length,
      active: activeCampaigns.length,
      totalSent,
      totalReplied,
      totalConverted,
      totalSpent,
      avgResponseRate,
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent-purple-600 bg-clip-text text-transparent">
                Campaigns
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage and track all your outreach campaigns.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Campaign
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Campaigns</p>
            <p className="text-2xl font-bold text-primary mt-1">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.active}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Messages Sent</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {stats.totalSent.toLocaleString()}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Replies</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {stats.totalReplied.toLocaleString()}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Conversions</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
              {stats.totalConverted.toLocaleString()}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
              ${(stats.totalSpent / 1000).toFixed(1)}k
            </p>
          </Card>
        </motion.div>

        {/* Channel Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Channel Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(['WHATSAPP', 'EMAIL', 'SMS', 'CALL'] as CampaignChannel[]).map((channel) => {
                const channelCampaigns = mockCampaigns.filter((c) => c.channel === channel);
                const totalSent = channelCampaigns.reduce((sum, c) => sum + c.sent, 0);
                const totalReplied = channelCampaigns.reduce((sum, c) => sum + c.replied, 0);
                const avgResponse =
                  channelCampaigns.length > 0
                    ? channelCampaigns.reduce((sum, c) => sum + c.responseRate, 0) / channelCampaigns.length
                    : 0;

                const icons = {
                  WHATSAPP: MessageSquare,
                  EMAIL: Mail,
                  SMS: MessageCircle,
                  CALL: Phone,
                };

                const colors = {
                  WHATSAPP: 'text-green-600 dark:text-green-400',
                  EMAIL: 'text-blue-600 dark:text-blue-400',
                  SMS: 'text-purple-600 dark:text-purple-400',
                  CALL: 'text-orange-600 dark:text-orange-400',
                };

                const Icon = icons[channel];

                return (
                  <Card key={channel} className="p-4 bg-muted/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className={`w-5 h-5 ${colors[channel]}`} />
                      <span className="font-medium">{channel}</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Campaigns</p>
                        <p className="text-lg font-bold">{channelCampaigns.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Sent</p>
                        <p className="text-lg font-bold">{totalSent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Response</p>
                        <p className="text-lg font-bold">{avgResponse.toFixed(1)}%</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search campaigns by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Buttons */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filters</span>
                  {(statusFilter !== 'ALL' || channelFilter !== 'ALL') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStatusFilter('ALL');
                        setChannelFilter('ALL');
                      }}
                      className="h-6 text-xs gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Status Filters */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground self-center">Status:</span>
                  <Badge
                    variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setStatusFilter('ALL')}
                  >
                    All
                  </Badge>
                  <Badge
                    variant={statusFilter === 'DRAFT' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setStatusFilter('DRAFT')}
                  >
                    Draft
                  </Badge>
                  <Badge
                    variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setStatusFilter('ACTIVE')}
                  >
                    Active
                  </Badge>
                  <Badge
                    variant={statusFilter === 'PAUSED' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setStatusFilter('PAUSED')}
                  >
                    Paused
                  </Badge>
                  <Badge
                    variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setStatusFilter('COMPLETED')}
                  >
                    Completed
                  </Badge>
                </div>

                {/* Channel Filters */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground self-center">Channel:</span>
                  <Badge
                    variant={channelFilter === 'ALL' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setChannelFilter('ALL')}
                  >
                    All
                  </Badge>
                  <Badge
                    variant={channelFilter === 'WHATSAPP' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setChannelFilter('WHATSAPP')}
                  >
                    WhatsApp
                  </Badge>
                  <Badge
                    variant={channelFilter === 'EMAIL' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setChannelFilter('EMAIL')}
                  >
                    Email
                  </Badge>
                  <Badge
                    variant={channelFilter === 'SMS' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setChannelFilter('SMS')}
                  >
                    SMS
                  </Badge>
                  <Badge
                    variant={channelFilter === 'CALL' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setChannelFilter('CALL')}
                  >
                    Call
                  </Badge>
                </div>
              </div>

              {/* Results Count */}
              <div className="text-sm text-muted-foreground">
                Showing {filteredCampaigns.length} of {mockCampaigns.length} campaigns
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Campaigns Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <CampaignsTable campaigns={filteredCampaigns} />
        </motion.div>
      </div>
    </div>
  );
}
