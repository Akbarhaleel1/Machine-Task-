export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'DEAD';
export type InterestLevel = 'HOT' | 'WARM' | 'COLD' | 'DEAD';
export type CommunicationChannel = 'WHATSAPP' | 'EMAIL' | 'CALL' | 'SMS';
export type Direction = 'INBOUND' | 'OUTBOUND';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source?: string;
  status: LeadStatus;
  interestLevel: InterestLevel;
  lastContacted?: Date;
  aiScore?: number;
  budget?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  leadId: string;
  channel: CommunicationChannel;
  message: string;
  direction: Direction;
  aiSummary?: string;
  intent?: string;
  createdAt: Date;
}
