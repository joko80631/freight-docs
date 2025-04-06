'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  EmailAnalytics,
  EmailTrend,
  EmailAnalyticsFilters,
  EmailAnalyticsSummary,
} from '@/lib/email/types/analytics';
import {
  getEmailAnalytics,
  getEmailTrends,
  getEmailAnalyticsSummary,
} from '@/lib/email/services/analytics';
import { format } from 'date-fns';

// Import recharts dynamically to avoid SSR issues
import dynamic from 'next/dynamic';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export function EmailAnalyticsDashboard() {
  const [filters, setFilters] = useState<EmailAnalyticsFilters>({
    startDate: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    interval: 'day',
  });

  const [analytics, setAnalytics] = useState<EmailAnalytics[]>([]);
  const [trends, setTrends] = useState<EmailTrend[]>([]);
  const [summary, setSummary] = useState<EmailAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [filters]);

  async function loadData() {
    try {
      setLoading(true);
      const [analyticsData, trendsData, summaryData] = await Promise.all([
        getEmailAnalytics(filters),
        getEmailTrends(filters),
        getEmailAnalyticsSummary(filters),
      ]);
      setAnalytics(analyticsData);
      setTrends(trendsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load email analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleDateRangeChange(startDate: string, endDate: string) {
    setFilters(prev => ({ ...prev, startDate, endDate }));
  }

  function handleIntervalChange(interval: 'hour' | 'day' | 'week' | 'month') {
    setFilters(prev => ({ ...prev, interval }));
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Email Analytics</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleDateRangeChange(e.target.value, filters.endDate)}
              className="border rounded px-2 py-1"
            />
            <span>to</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleDateRangeChange(filters.startDate, e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>
          <Select
            value={filters.interval}
            onValueChange={handleIntervalChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hour">Hourly</SelectItem>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadData}>Refresh</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Campaigns</CardTitle>
            <CardDescription>Number of email campaigns sent</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary?.totalCampaigns || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Recipients</CardTitle>
            <CardDescription>Number of email recipients</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary?.totalRecipients || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Open Rate</CardTitle>
            <CardDescription>Percentage of emails opened</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary?.averageOpenRate.toFixed(2)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Click Rate</CardTitle>
            <CardDescription>Percentage of emails clicked</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary?.averageClickRate.toFixed(2)}%</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Performance Trends</CardTitle>
              <CardDescription>Open and click rates over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="periodStart"
                      tickFormatter={(value: string) => format(new Date(value), 'MMM d')}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value: string) => format(new Date(value), 'MMM d, yyyy')}
                      formatter={(value: number) => [`${value}%`, 'Rate']}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="openRate"
                      name="Open Rate"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="clickRate"
                      name="Click Rate"
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Best Performing Template</CardTitle>
                <CardDescription>Template with highest engagement</CardDescription>
              </CardHeader>
              <CardContent>
                {summary?.bestPerformingTemplate ? (
                  <div>
                    <p className="font-semibold">{summary.bestPerformingTemplate.name}</p>
                    <p>Open Rate: {summary.bestPerformingTemplate.openRate.toFixed(2)}%</p>
                    <p>Click Rate: {summary.bestPerformingTemplate.clickRate.toFixed(2)}%</p>
                  </div>
                ) : (
                  <p>No data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Worst Performing Template</CardTitle>
                <CardDescription>Template with lowest engagement</CardDescription>
              </CardHeader>
              <CardContent>
                {summary?.worstPerformingTemplate ? (
                  <div>
                    <p className="font-semibold">{summary.worstPerformingTemplate.name}</p>
                    <p>Open Rate: {summary.worstPerformingTemplate.openRate.toFixed(2)}%</p>
                    <p>Click Rate: {summary.worstPerformingTemplate.clickRate.toFixed(2)}%</p>
                  </div>
                ) : (
                  <p>No data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template Performance</CardTitle>
              <CardDescription>Detailed analytics by template</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Template</th>
                      <th className="text-right">Sent</th>
                      <th className="text-right">Delivered</th>
                      <th className="text-right">Opened</th>
                      <th className="text-right">Clicked</th>
                      <th className="text-right">Open Rate</th>
                      <th className="text-right">Click Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.map((template) => (
                      <tr key={template.templateId}>
                        <td className="text-left">{template.templateName}</td>
                        <td className="text-right">{template.totalSent}</td>
                        <td className="text-right">{template.totalDelivered}</td>
                        <td className="text-right">{template.totalOpened}</td>
                        <td className="text-right">{template.totalClicked}</td>
                        <td className="text-right">{template.openRate.toFixed(2)}%</td>
                        <td className="text-right">{template.clickRate.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Volume Trends</CardTitle>
              <CardDescription>Number of emails sent over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="periodStart"
                      tickFormatter={(value: string) => format(new Date(value), 'MMM d')}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value: string) => format(new Date(value), 'MMM d, yyyy')}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="totalSent"
                      name="Sent"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalDelivered"
                      name="Delivered"
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 