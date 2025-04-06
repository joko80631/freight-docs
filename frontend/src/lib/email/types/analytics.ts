export type EmailEventType = 
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'complained'
  | 'unsubscribed';

export type EmailCampaignStatus = 
  | 'draft'
  | 'scheduled'
  | 'sending'
  | 'sent'
  | 'cancelled';

export type EmailRecipientStatus = 
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'complained'
  | 'unsubscribed';

export type ABTestStatus = 
  | 'draft'
  | 'running'
  | 'completed'
  | 'cancelled';

export type ABTestVariant = 'a' | 'b';

export interface EmailEvent {
  id: string;
  emailId: string;
  userId: string;
  eventType: EmailEventType;
  eventData?: Record<string, any>;
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: Record<string, any>;
  locationInfo?: Record<string, any>;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  description?: string;
  category: string;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  metadata?: Record<string, any>;
}

export interface EmailCampaign {
  id: string;
  name: string;
  templateId?: string;
  subjectLine: string;
  content: string;
  status: EmailCampaignStatus;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  metadata?: Record<string, any>;
}

export interface EmailRecipient {
  id: string;
  campaignId: string;
  userId?: string;
  email: string;
  status: EmailRecipientStatus;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  bounceReason?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface EmailLink {
  id: string;
  campaignId: string;
  originalUrl: string;
  trackingUrl: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface EmailLinkClick {
  id: string;
  linkId: string;
  recipientId: string;
  clickedAt: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: Record<string, any>;
  locationInfo?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface EmailABTest {
  id: string;
  campaignId: string;
  name: string;
  variantASubject: string;
  variantAContent: string;
  variantBSubject: string;
  variantBContent: string;
  status: ABTestStatus;
  winner?: ABTestVariant;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  metadata?: Record<string, any>;
}

export interface EmailABTestResult {
  id: string;
  testId: string;
  variant: ABTestVariant;
  recipientId: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  convertedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface EmailAnalytics {
  templateId: string;
  templateName: string;
  category: string;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalComplained: number;
  totalUnsubscribed: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  complaintRate: number;
  unsubscribeRate: number;
}

export interface EmailTrend {
  periodStart: string;
  periodEnd: string;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
}

export interface EmailAnalyticsFilters {
  startDate: string;
  endDate: string;
  templateId?: string;
  category?: string;
  interval?: 'hour' | 'day' | 'week' | 'month';
}

export interface EmailAnalyticsSummary {
  totalCampaigns: number;
  totalRecipients: number;
  averageOpenRate: number;
  averageClickRate: number;
  bestPerformingTemplate?: {
    id: string;
    name: string;
    openRate: number;
    clickRate: number;
  };
  worstPerformingTemplate?: {
    id: string;
    name: string;
    openRate: number;
    clickRate: number;
  };
  recentTrends: EmailTrend[];
} 