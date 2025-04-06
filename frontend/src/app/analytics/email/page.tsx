import { EmailAnalyticsDashboard } from '@/components/email/analytics/EmailAnalyticsDashboard';
import { ABTestManager } from '@/components/email/analytics/ABTestManager';
import { ABTestResults } from '@/components/email/analytics/ABTestResults';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function EmailAnalyticsPage() {
  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ab-tests">A/B Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <EmailAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="ab-tests" className="space-y-6">
          <ABTestManager />
          <ABTestResults />
        </TabsContent>
      </Tabs>
    </div>
  );
} 