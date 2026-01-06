export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
export type CampaignChannel = 'WHATSAPP' | 'EMAIL' | 'SMS' | 'CALL';

export interface Campaign {
  id: string;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  targetAudience: number;
  sent: number;
  delivered: number;
  replied: number;
  converted: number;
  responseRate: number;
  conversionRate: number;
  budget?: number;
  spent?: number;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
}
