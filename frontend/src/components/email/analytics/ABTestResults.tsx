'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getABTests, getABTestResults } from '@/lib/email/services/analytics';
import { EmailABTest, EmailABTestResult } from '@/lib/email/types/analytics';

export function ABTestResults() {
  const [tests, setTests] = useState<EmailABTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [results, setResults] = useState<EmailABTestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    if (selectedTest) {
      loadResults(selectedTest);
    }
  }, [selectedTest]);

  async function loadTests() {
    try {
      setLoading(true);
      const data = await getABTests();
      setTests(data);
      if (data.length > 0) {
        setSelectedTest(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load A/B tests:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadResults(testId: string) {
    try {
      setLoading(true);
      const data = await getABTestResults(testId);
      setResults(data);
    } catch (error) {
      console.error('Failed to load A/B test results:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>A/B Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Test</label>
              <select
                value={selectedTest || ''}
                onChange={(e) => setSelectedTest(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                {tests.map((test) => (
                  <option key={test.id} value={test.id}>
                    {test.name} - {test.status}
                  </option>
                ))}
              </select>
            </div>

            {selectedTest && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Variant</th>
                      <th className="text-right">Recipients</th>
                      <th className="text-right">Opens</th>
                      <th className="text-right">Clicks</th>
                      <th className="text-right">Open Rate</th>
                      <th className="text-right">Click Rate</th>
                      <th className="text-right">Conversion Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result) => {
                      const isOpened = !!result.openedAt;
                      const isClicked = !!result.clickedAt;
                      const isConverted = !!result.convertedAt;
                      const totalRecipients = results.filter(r => r.variant === result.variant).length;
                      const totalOpens = results.filter(r => r.variant === result.variant && !!r.openedAt).length;
                      const totalClicks = results.filter(r => r.variant === result.variant && !!r.clickedAt).length;
                      const totalConversions = results.filter(r => r.variant === result.variant && !!r.convertedAt).length;

                      return (
                        <tr key={result.variant}>
                          <td className="text-left">Variant {result.variant.toUpperCase()}</td>
                          <td className="text-right">{totalRecipients}</td>
                          <td className="text-right">{totalOpens}</td>
                          <td className="text-right">{totalClicks}</td>
                          <td className="text-right">
                            {((totalOpens / totalRecipients) * 100).toFixed(2)}%
                          </td>
                          <td className="text-right">
                            {((totalClicks / totalOpens) * 100).toFixed(2)}%
                          </td>
                          <td className="text-right">
                            {((totalConversions / totalClicks) * 100).toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 