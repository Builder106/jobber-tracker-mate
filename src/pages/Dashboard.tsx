
import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import StatusCard from "@/components/dashboard/StatusCard";
import ApplicationsChart from "@/components/dashboard/ApplicationsChart";
import ApplicationCard, { Application } from "@/components/applications/ApplicationCard";
import { Briefcase, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Sample data - will be replaced with real data later
const recentApplications: Application[] = [
  {
    id: "1",
    company: "Apple Inc.",
    position: "Frontend Developer",
    location: "Cupertino, CA",
    status: "applied",
    date: "June 12, 2023",
    link: "#",
  },
  {
    id: "2",
    company: "Google",
    position: "UX Designer",
    location: "Mountain View, CA",
    status: "interview",
    date: "June 8, 2023",
    link: "#",
  },
  {
    id: "3",
    company: "Microsoft",
    position: "Software Engineer",
    location: "Redmond, WA",
    status: "rejected",
    date: "May 28, 2023",
    link: "#",
  },
];

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="space-y-8 animate-slide-up">
        <div>
          <h1 className="font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Track your job applications and interviews</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatusCard
            title="Total Applications"
            value="24"
            icon={<Briefcase className="h-4 w-4" />}
            description="This month:"
            trendValue="+8"
            trend="up"
          />
          <StatusCard
            title="In Progress"
            value="12"
            icon={<Clock className="h-4 w-4" />}
          />
          <StatusCard
            title="Interviews"
            value="5"
            icon={<Calendar className="h-4 w-4" />}
            description="Next interview:"
            trendValue="Tomorrow"
          />
          <StatusCard
            title="Success Rate"
            value="18%"
            icon={<CheckCircle className="h-4 w-4" />}
            description="Last month:"
            trendValue="12%"
            trend="up"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ApplicationsChart />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium">Recent Applications</h2>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentApplications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
