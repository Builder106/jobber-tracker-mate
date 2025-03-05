import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Application } from './ApplicationCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ApplicationStatsProps {
  applications: Application[];
}

export function ApplicationStats({ applications }: ApplicationStatsProps) {
  // Calculate status counts
  const statusCounts = {
    applied: applications.filter(a => a.status === "applied").length,
    interview: applications.filter(a => a.status === "interview").length,
    offer: applications.filter(a => a.status === "offer").length,
    rejected: applications.filter(a => a.status === "rejected").length,
  };

  // Calculate response rate
  const totalApplications = applications.length;
  const responsesReceived = statusCounts.interview + statusCounts.offer + statusCounts.rejected;
  const responseRate = totalApplications > 0 ? (responsesReceived / totalApplications) * 100 : 0;

  // Calculate success rate (offers / responses)
  const successRate = responsesReceived > 0 ? (statusCounts.offer / responsesReceived) * 100 : 0;

  // Create data for status chart
  const statusData = [
    { name: 'Applied', value: statusCounts.applied, color: '#3b82f6' },
    { name: 'Interview', value: statusCounts.interview, color: '#f59e0b' },
    { name: 'Offer', value: statusCounts.offer, color: '#10b981' },
    { name: 'Rejected', value: statusCounts.rejected, color: '#ef4444' },
  ];

  // Calculate applications per month
  const monthlyData = applications.reduce((acc: Record<string, number>, app) => {
    try {
      const date = new Date(app.date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      acc[monthYear] = (acc[monthYear] || 0) + 1;
    } catch (error) {
      console.error('Error parsing date:', error);
    }
    return acc;
  }, {});

  // Convert to array for chart
  const monthlyChartData = Object.entries(monthlyData)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => {
      // Sort by date (assuming format "MMM YYYY")
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(-6); // Last 6 months

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Application Status</CardTitle>
          <CardDescription>Distribution of your applications by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => 
                    percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                  }
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} applications`, 'Count']}
                  labelFormatter={(index) => statusData[index as number].name}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Applications Over Time</CardTitle>
          <CardDescription>Number of applications per month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="month" angle={-45} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value) => [`${value} applications`, 'Count']} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Response Rate</CardTitle>
          <CardDescription>Percentage of applications that received a response</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[200px]">
            <div className="text-5xl font-bold">{responseRate.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground mt-2">
              {responsesReceived} responses from {totalApplications} applications
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Success Rate</CardTitle>
          <CardDescription>Percentage of responses that resulted in offers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[200px]">
            <div className="text-5xl font-bold">{successRate.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground mt-2">
              {statusCounts.offer} offers from {responsesReceived} responses
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
