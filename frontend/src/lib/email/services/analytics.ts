import { createClient } from '@supabase/supabase-js';
import {
  EmailAnalytics,
  EmailTrend,
  EmailAnalyticsFilters,
  EmailAnalyticsSummary,
  EmailTemplate,
  EmailCampaign,
  EmailABTest,
  EmailABTestResult,
} from '../types/analytics';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getEmailAnalytics(filters: EmailAnalyticsFilters): Promise<EmailAnalytics[]> {
  const { data, error } = await supabase
    .rpc('get_email_analytics', {
      p_start_date: filters.startDate,
      p_end_date: filters.endDate,
      p_template_id: filters.templateId,
      p_category: filters.category,
    });

  if (error) {
    throw new Error(`Failed to fetch email analytics: ${error.message}`);
  }

  return data;
}

export async function getEmailTrends(filters: EmailAnalyticsFilters): Promise<EmailTrend[]> {
  const { data, error } = await supabase
    .rpc('get_email_trends', {
      p_start_date: filters.startDate,
      p_end_date: filters.endDate,
      p_interval: filters.interval || 'day',
      p_template_id: filters.templateId,
      p_category: filters.category,
    });

  if (error) {
    throw new Error(`Failed to fetch email trends: ${error.message}`);
  }

  return data;
}

export async function getEmailAnalyticsSummary(filters: EmailAnalyticsFilters): Promise<EmailAnalyticsSummary> {
  const [analytics, trends] = await Promise.all([
    getEmailAnalytics(filters),
    getEmailTrends(filters),
  ]);

  const totalCampaigns = analytics.reduce((sum, a) => sum + a.totalSent, 0);
  const totalRecipients = analytics.reduce((sum, a) => sum + a.totalDelivered, 0);
  const totalOpens = analytics.reduce((sum, a) => sum + a.totalOpened, 0);
  const totalClicks = analytics.reduce((sum, a) => sum + a.totalClicked, 0);

  const averageOpenRate = totalRecipients > 0 ? (totalOpens / totalRecipients) * 100 : 0;
  const averageClickRate = totalOpens > 0 ? (totalClicks / totalOpens) * 100 : 0;

  // Find best and worst performing templates
  const sortedTemplates = [...analytics].sort((a, b) => b.openRate - a.openRate);
  const bestPerformingTemplate = sortedTemplates[0];
  const worstPerformingTemplate = sortedTemplates[sortedTemplates.length - 1];

  return {
    totalCampaigns,
    totalRecipients,
    averageOpenRate,
    averageClickRate,
    bestPerformingTemplate: bestPerformingTemplate ? {
      id: bestPerformingTemplate.templateId,
      name: bestPerformingTemplate.templateName,
      openRate: bestPerformingTemplate.openRate,
      clickRate: bestPerformingTemplate.clickRate,
    } : undefined,
    worstPerformingTemplate: worstPerformingTemplate ? {
      id: worstPerformingTemplate.templateId,
      name: worstPerformingTemplate.templateName,
      openRate: worstPerformingTemplate.openRate,
      clickRate: worstPerformingTemplate.clickRate,
    } : undefined,
    recentTrends: trends,
  };
}

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch email templates: ${error.message}`);
  }

  return data;
}

export async function getEmailCampaigns(): Promise<EmailCampaign[]> {
  const { data, error } = await supabase
    .from('email_campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch email campaigns: ${error.message}`);
  }

  return data;
}

export async function getABTests(): Promise<EmailABTest[]> {
  const { data, error } = await supabase
    .from('email_ab_tests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch A/B tests: ${error.message}`);
  }

  return data;
}

export async function getABTestResults(testId: string): Promise<EmailABTestResult[]> {
  const { data, error } = await supabase
    .from('email_ab_test_results')
    .select('*')
    .eq('test_id', testId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch A/B test results: ${error.message}`);
  }

  return data;
}

export async function createABTest(test: Omit<EmailABTest, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailABTest> {
  const { data, error } = await supabase
    .from('email_ab_tests')
    .insert(test)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create A/B test: ${error.message}`);
  }

  return data;
}

export async function updateABTest(id: string, test: Partial<EmailABTest>): Promise<EmailABTest> {
  const { data, error } = await supabase
    .from('email_ab_tests')
    .update(test)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update A/B test: ${error.message}`);
  }

  return data;
}

export async function trackEmailOpen(
  emailId: string,
  userId: string,
  ipAddress?: string,
  userAgent?: string,
  deviceInfo?: Record<string, any>,
  locationInfo?: Record<string, any>
): Promise<string> {
  const { data, error } = await supabase
    .rpc('track_email_open', {
      p_email_id: emailId,
      p_user_id: userId,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
      p_device_info: deviceInfo,
      p_location_info: locationInfo,
    });

  if (error) {
    throw new Error(`Failed to track email open: ${error.message}`);
  }

  return data;
}

export async function trackEmailClick(
  linkId: string,
  recipientId: string,
  ipAddress?: string,
  userAgent?: string,
  deviceInfo?: Record<string, any>,
  locationInfo?: Record<string, any>
): Promise<string> {
  const { data, error } = await supabase
    .rpc('track_email_click', {
      p_link_id: linkId,
      p_recipient_id: recipientId,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
      p_device_info: deviceInfo,
      p_location_info: locationInfo,
    });

  if (error) {
    throw new Error(`Failed to track email click: ${error.message}`);
  }

  return data;
} 