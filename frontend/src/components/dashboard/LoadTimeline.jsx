import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

const LoadTimeline = ({ data }) => {
  const [view, setView] = useState('created');

  // Generate last 30 days of data
  const generateTimelineData = () => {
    const days = 30;
    const timelineData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayData = data.find(d => 
        format(new Date(d.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );

      timelineData.push({
        date: format(date, 'MMM dd'),
        created: dayData?.created || 0,
        completed: dayData?.completed || 0
      });
    }

    return timelineData;
  };

  const timelineData = generateTimelineData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Load Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="created" onValueChange={setView}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="created">Created</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="created" className="mt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="created" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="completed" className="mt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LoadTimeline; 