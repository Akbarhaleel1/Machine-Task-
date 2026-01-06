import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Download, RefreshCw, Loader2 } from 'lucide-react';
import { LeadsTable } from '@/components/leads/leads-table';
import { AddLeadDialog } from '@/components/leads/add-lead-dialog';
import { leadsApi } from '@/lib/api/leads';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Lead, LeadStatus, InterestLevel } from '@/types/lead';

export function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'ALL'>('ALL');
  const [interestFilter, setInterestFilter] = useState<InterestLevel | 'ALL'>('ALL');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch leads on component mount
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const fetchedLeads = await leadsApi.getLeads();
      setLeads(fetchedLeads);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        searchQuery === '' ||
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery) ||
        lead.source?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
      const matchesInterest = interestFilter === 'ALL' || lead.interestLevel === interestFilter;

      return matchesSearch && matchesStatus && matchesInterest;
    });
  }, [leads, searchQuery, statusFilter, interestFilter]);

  const stats = useMemo(() => {
    return {
      total: leads.length,
      new: leads.filter((l) => l.status === 'NEW').length,
      hot: leads.filter((l) => l.interestLevel === 'HOT').length,
      qualified: leads.filter((l) => l.status === 'QUALIFIED').length,
      converted: leads.filter((l) => l.status === 'CONVERTED').length,
    };
  }, [leads]);

  const handleAddLead = async (newLead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const createdLead = await leadsApi.createLead({
        name: newLead.name,
        phone: newLead.phone,
        email: newLead.email,
        source: newLead.source,
        status: newLead.status,
        interestLevel: newLead.interestLevel,
        budget: newLead.budget,
        notes: newLead.notes,
      });
      setLeads((prev) => [createdLead, ...prev]);
    } catch (error) {
      console.error('Failed to create lead:', error);
      alert('Failed to create lead. Please try again.');
    }
  };

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
                Leads
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage and track all your leads in one place.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4" />
                Add Lead
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Leads</p>
            <p className="text-2xl font-bold text-primary mt-1">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">New</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.new}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Hot</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.hot}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Qualified</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.qualified}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Converted</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.converted}</p>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search leads by name, email, phone, or source..."
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
                  {(statusFilter !== 'ALL' || interestFilter !== 'ALL') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStatusFilter('ALL');
                        setInterestFilter('ALL');
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
                    variant={statusFilter === 'NEW' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setStatusFilter('NEW')}
                  >
                    New
                  </Badge>
                  <Badge
                    variant={statusFilter === 'CONTACTED' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setStatusFilter('CONTACTED')}
                  >
                    Contacted
                  </Badge>
                  <Badge
                    variant={statusFilter === 'QUALIFIED' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setStatusFilter('QUALIFIED')}
                  >
                    Qualified
                  </Badge>
                  <Badge
                    variant={statusFilter === 'CONVERTED' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setStatusFilter('CONVERTED')}
                  >
                    Converted
                  </Badge>
                  <Badge
                    variant={statusFilter === 'DEAD' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setStatusFilter('DEAD')}
                  >
                    Dead
                  </Badge>
                </div>

                {/* Interest Filters */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground self-center">Interest:</span>
                  <Badge
                    variant={interestFilter === 'ALL' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setInterestFilter('ALL')}
                  >
                    All
                  </Badge>
                  <Badge
                    variant={interestFilter === 'HOT' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setInterestFilter('HOT')}
                  >
                    Hot
                  </Badge>
                  <Badge
                    variant={interestFilter === 'WARM' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setInterestFilter('WARM')}
                  >
                    Warm
                  </Badge>
                  <Badge
                    variant={interestFilter === 'COLD' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setInterestFilter('COLD')}
                  >
                    Cold
                  </Badge>
                </div>
              </div>

              {/* Results Count */}
              <div className="text-sm text-muted-foreground">
                Showing {filteredLeads.length} of {leads.length} leads
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Leads Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {isLoading ? (
            <Card className="p-12 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading leads...</p>
            </Card>
          ) : (
            <LeadsTable leads={filteredLeads} />
          )}
        </motion.div>

        {/* Add Lead Dialog */}
        <AddLeadDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onAddLead={handleAddLead}
        />
      </div>
    </div>
  );
}
