
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Sample data - will be replaced with real data later
const data = [
  { name: "Jan", count: 4 },
  { name: "Feb", count: 6 },
  { name: "Mar", count: 8 },
  { name: "Apr", count: 12 },
  { name: "May", count: 8 },
  { name: "Jun", count: 14 },
];

const ApplicationsChart = () => {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="text-base font-medium">Applications Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
                cursor={{ fill: 'var(--primary)', opacity: 0.1 }}
              />
              <Bar 
                dataKey="count" 
                fill="var(--primary)" 
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationsChart;
