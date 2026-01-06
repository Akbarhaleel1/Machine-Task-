import { apiClient } from './client';
import type { Lead } from '@/types/lead';

export interface CreateLeadData {
  name: string;
  phone: string;
  email?: string;
  source?: string;
  status?: string;
  interestLevel?: string;
  budget?: number;
  notes?: string;
}

export interface LeadResponse {
  status: string;
  data: {
    lead: Lead;
  };
}

export interface LeadsResponse {
  status: string;
  data: {
    leads: Lead[];
  };
}

export interface LeadStatsResponse {
  status: string;
  data: {
    stats: {
      total: number;
      new: number;
      contacted: number;
      qualified: number;
      hot: number;
      warm: number;
      cold: number;
    };
  };
}

export const leadsApi = {
  // Create a new lead
  createLead: async (data: CreateLeadData): Promise<Lead> => {
    const response = await apiClient.post<LeadResponse>('/leads', data);
    return response.data.data.lead;
  },

  // Get all leads for the current user
  getLeads: async (): Promise<Lead[]> => {
    const response = await apiClient.get<LeadsResponse>('/leads');
    return response.data.data.leads;
  },

  // Get a single lead by ID
  getLeadById: async (id: string): Promise<Lead> => {
    const response = await apiClient.get<LeadResponse>(`/leads/${id}`);
    return response.data.data.lead;
  },

  // Update a lead
  updateLead: async (id: string, data: Partial<CreateLeadData>): Promise<Lead> => {
    const response = await apiClient.put<LeadResponse>(`/leads/${id}`, data);
    return response.data.data.lead;
  },

  // Delete a lead
  deleteLead: async (id: string): Promise<void> => {
    await apiClient.delete(`/leads/${id}`);
  },

  // Get lead statistics
  getLeadStats: async () => {
    const response = await apiClient.get<LeadStatsResponse>('/leads/stats');
    return response.data.data.stats;
  },
};

// Re-export types for convenience
export type { CreateLeadData, LeadResponse, LeadsResponse, LeadStatsResponse };
