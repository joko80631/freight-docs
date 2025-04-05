import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Package, Truck, Clock, DollarSign, Info, CheckCircle, AlertTriangle } from "lucide-react";
import { useTeamStore } from "@/store/team-store";
import { formatTimestamp, getActivityIcon } from "@/lib/utils/dashboard";

// Define types for our data
export interface Metric {
  title: string;
  value: string;
  trend: string;
  trendDirection: "up" | "down";
  icon: any; // Lucide icon component
}

export interface Activity {
  title: string;
  description: string;
  timestamp: string;
  type: string;
  icon: any; // Lucide icon component
}

export interface DashboardData {
  userName: string;
  metrics: Metric[];
  activities: Activity[];
  insights: string;
  isLoading: boolean;
}

export function useDashboardData(): DashboardData {
  const supabase = createClientComponentClient();
  const { currentTeam } = useTeamStore();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("User");
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [insights, setInsights] = useState("");

  // Fetch user data and metrics
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || "User");
        }
        
        // Fetch metrics from Supabase
        const { data: metricsData, error: metricsError } = await supabase
          .from('metrics')
          .select('*')
          .eq('team_id', currentTeam?.id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (metricsError) throw metricsError;
        
        if (metricsData && metricsData.length > 0) {
          setMetrics([
            {
              title: "Total Loads",
              value: metricsData[0].total_loads.toLocaleString(),
              trend: `${metricsData[0].loads_trend > 0 ? '+' : ''}${metricsData[0].loads_trend}%`,
              trendDirection: metricsData[0].loads_trend >= 0 ? "up" : "down",
              icon: Package,
            },
            {
              title: "Active Carriers",
              value: metricsData[0].active_carriers.toLocaleString(),
              trend: `${metricsData[0].carriers_trend > 0 ? '+' : ''}${metricsData[0].carriers_trend}%`,
              trendDirection: metricsData[0].carriers_trend >= 0 ? "up" : "down",
              icon: Truck,
            },
            {
              title: "On-Time Delivery",
              value: `${metricsData[0].on_time_delivery}%`,
              trend: `${metricsData[0].delivery_trend > 0 ? '+' : ''}${metricsData[0].delivery_trend}%`,
              trendDirection: metricsData[0].delivery_trend >= 0 ? "up" : "down",
              icon: Clock,
            },
            {
              title: "Revenue",
              value: `$${(metricsData[0].revenue / 1000).toFixed(1)}K`,
              trend: `${metricsData[0].revenue_trend > 0 ? '+' : ''}${metricsData[0].revenue_trend}%`,
              trendDirection: metricsData[0].revenue_trend >= 0 ? "up" : "down",
              icon: DollarSign,
            },
          ]);
        } else {
          // Fallback metrics if no data
          setMetrics([
            {
              title: "Total Loads",
              value: "0",
              trend: "0%",
              trendDirection: "up",
              icon: Package,
            },
            {
              title: "Active Carriers",
              value: "0",
              trend: "0%",
              trendDirection: "up",
              icon: Truck,
            },
            {
              title: "On-Time Delivery",
              value: "0%",
              trend: "0%",
              trendDirection: "up",
              icon: Clock,
            },
            {
              title: "Revenue",
              value: "$0",
              trend: "0%",
              trendDirection: "up",
              icon: DollarSign,
            },
          ]);
        }
        
        // Fetch recent activities
        const { data: activitiesData, error: activitiesError } = await supabase
          .from('activities')
          .select('*')
          .eq('team_id', currentTeam?.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (activitiesError) throw activitiesError;
        
        if (activitiesData && activitiesData.length > 0) {
          setRecentActivities(activitiesData.map(activity => ({
            title: activity.title,
            description: activity.description,
            timestamp: formatTimestamp(activity.created_at),
            type: activity.type,
            icon: getActivityIcon(activity.type),
          })));
        } else {
          // Fallback activities if no data
          setRecentActivities([
            {
              title: "No recent activity",
              description: "Your recent activities will appear here",
              timestamp: "Just now",
              type: "info",
              icon: Info,
            },
          ]);
        }
        
        // Get AI insights
        await fetchInsights();
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchDashboardData();
  }, [supabase, currentTeam]);
  
  // Fetch AI insights
  async function fetchInsights() {
    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: currentTeam?.id,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to fetch insights');
      
      const data = await response.json();
      setInsights(data.insight);
    } catch (error) {
      console.error("Error fetching insights:", error);
      setInsights("Unable to generate insights at this time.");
    }
  }

  return {
    userName,
    metrics,
    activities: recentActivities,
    insights,
    isLoading
  };
} 