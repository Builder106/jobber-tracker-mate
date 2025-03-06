
import React, { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import StatusCard from "@/components/dashboard/StatusCard";
import ApplicationsChart from "@/components/dashboard/ApplicationsChart";
import ApplicationCard, { Application } from "@/components/applications/ApplicationCard";
import { Briefcase, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchDashboardData, DashboardStats } from "@/utils/dashboardUtils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardStats>({
    totalApplications: 0,
    inProgress: 0,
    interviews: 0,
    successRate: 0,
    recentApplications: [],
    monthlyApplicationData: []
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const data = await fetchDashboardData(user.id);
        setDashboardData(data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [user]);
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
            value={dashboardData.totalApplications.toString()}
            icon={<Briefcase className="h-4 w-4" />}
            description="Your job search journey"
          />
          <StatusCard
            title="In Progress"
            value={dashboardData.inProgress.toString()}
            icon={<Clock className="h-4 w-4" />}
            description="Applied or interviewing"
          />
          <StatusCard
            title="Interviews"
            value={dashboardData.interviews.toString()}
            icon={<Calendar className="h-4 w-4" />}
            description="Current interviews"
          />
          <StatusCard
            title="Success Rate"
            value={`${dashboardData.successRate}%`}
            icon={<CheckCircle className="h-4 w-4" />}
            description="Offers from responses"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ApplicationsChart data={dashboardData.monthlyApplicationData} />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium">Recent Applications</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/applications')}>View All</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.recentApplications.length > 0 ? (
              dashboardData.recentApplications.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))
            ) : (
              <div className="col-span-3 py-12 text-center">
                <h3 className="text-lg font-medium">No applications yet</h3>
                <p className="text-muted-foreground mt-1">Start tracking your job search by adding applications</p>
                <Button className="mt-4" onClick={() => navigate('/applications')}>Add Application</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
