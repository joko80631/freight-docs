import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createABTest, updateABTest } from '@/lib/email/services/analytics';
import { EmailABTest, ABTestStatus, ABTestVariant } from '@/lib/email/types/analytics';

interface ABTestFormData {
  name: string;
  campaignId: string;
  variantASubject: string;
  variantAContent: string;
  variantBSubject: string;
  variantBContent: string;
  startDate?: string;
  endDate?: string;
}

export function ABTestManager() {
  const [formData, setFormData] = useState<ABTestFormData>({
    name: '',
    campaignId: '',
    variantASubject: '',
    variantAContent: '',
    variantBSubject: '',
    variantBContent: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const test: Omit<EmailABTest, 'id' | 'createdAt' | 'updatedAt'> = {
        ...formData,
        status: 'draft' as ABTestStatus,
      };

      await createABTest(test);
      setSuccess('A/B test created successfully');
      setFormData({
        name: '',
        campaignId: '',
        variantASubject: '',
        variantAContent: '',
        variantBSubject: '',
        variantBContent: '',
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create A/B test');
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create A/B Test</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Test Name</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Campaign ID</label>
            <Input
              name="campaignId"
              value={formData.campaignId}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Variant A</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Subject Line</label>
                  <Input
                    name="variantASubject"
                    value={formData.variantASubject}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <Textarea
                    name="variantAContent"
                    value={formData.variantAContent}
                    onChange={handleInputChange}
                    required
                    rows={5}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Variant B</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Subject Line</label>
                  <Input
                    name="variantBSubject"
                    value={formData.variantBSubject}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <Textarea
                    name="variantBContent"
                    value={formData.variantBContent}
                    onChange={handleInputChange}
                    required
                    rows={5}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date (Optional)</label>
              <Input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date (Optional)</label>
              <Input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {success && (
            <div className="text-green-500 text-sm">{success}</div>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create A/B Test'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 