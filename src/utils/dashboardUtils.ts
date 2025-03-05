import { supabase } from '@/utils/supabaseClient';
import { Application } from '@/components/applications/ApplicationCard';

export interface DashboardStats {
  totalApplications: number;
  inProgress: number;
  interviews: number;
  successRate: number;
  recentApplications: Application[];
  monthlyApplicationData: { name: string; count: number }[];
}

export async function fetchDashboardData(userId: string): Promise<DashboardStats> {
  try {
    // Fetch all applications for the user
    const { data: applications, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const typedApplications = applications as Application[];
    
    // Calculate total applications this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const applicationsThisMonth = typedApplications.filter(app => {
      const appDate = new Date(app.created_at || app.date);
      return appDate >= startOfMonth;
    });

    // Calculate in progress (applied + interview)
    const inProgress = typedApplications.filter(
      app => app.status === 'applied' || app.status === 'interview'
    ).length;

    // Calculate interviews
    const interviews = typedApplications.filter(app => app.status === 'interview').length;

    // Calculate success rate (offers / total responses)
    const responses = typedApplications.filter(
      app => app.status === 'interview' || app.status === 'offer' || app.status === 'rejected'
    ).length;
    const offers = typedApplications.filter(app => app.status === 'offer').length;
    const successRate = responses > 0 ? Math.round((offers / responses) * 100) : 0;

    // Get recent applications (latest 3)
    const recentApplications = typedApplications.slice(0, 3);

    // Calculate applications per month for the last 6 months
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date;
    }).reverse();

    const monthlyApplicationData = last6Months.map(date => {
      const monthName = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const month = date.getMonth();
      
      const count = typedApplications.filter(app => {
        const appDate = new Date(app.created_at || app.date);
        return appDate.getMonth() === month && appDate.getFullYear() === year;
      }).length;

      return {
        name: monthName,
        count
      };
    });

    return {
      totalApplications: typedApplications.length,
      inProgress,
      interviews,
      successRate,
      recentApplications,
      monthlyApplicationData
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Return default values in case of error
    return {
      totalApplications: 0,
      inProgress: 0,
      interviews: 0,
      successRate: 0,
      recentApplications: [],
      monthlyApplicationData: []
    };
  }
}
