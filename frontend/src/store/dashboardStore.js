import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useDashboardStore = create((set, get) => ({
  metrics: {
    totalLoads: 0,
    activeLoads: 0,
    completedLoads: 0,
    documentStatus: {
      pending: 0,
      classified: 0,
      rejected: 0
    },
    teamActivity: {
      uploadsThisWeek: 0
    },
    classificationAccuracy: 0
  },
  loadTimeline: [],
  recentActivity: [],
  isLoading: false,
  error: null,

  fetchDashboardData: async (teamId) => {
    if (!teamId) return;
    
    set({ isLoading: true, error: null });
    try {
      // Fetch metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('loads')
        .select('status')
        .eq('team_id', teamId);

      if (metricsError) throw metricsError;

      const totalLoads = metricsData.length;
      const activeLoads = metricsData.filter(load => load.status === 'active').length;
      const completedLoads = metricsData.filter(load => load.status === 'completed').length;

      // Fetch document status
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('status')
        .eq('team_id', teamId);

      if (docError) throw docError;

      const documentStatus = {
        pending: docData.filter(doc => doc.status === 'pending').length,
        classified: docData.filter(doc => doc.status === 'classified').length,
        rejected: docData.filter(doc => doc.status === 'rejected').length
      };

      // Fetch recent activity
      const { data: activityData, error: activityError } = await supabase
        .from('activity_log')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activityError) throw activityError;

      // Calculate classification accuracy
      const { data: classificationData, error: classificationError } = await supabase
        .from('document_classifications')
        .select('confidence_score')
        .eq('team_id', teamId);

      if (classificationError) throw classificationError;

      const classificationAccuracy = classificationData.length > 0
        ? classificationData.reduce((acc, curr) => acc + curr.confidence_score, 0) / classificationData.length
        : 0;

      set({
        metrics: {
          totalLoads,
          activeLoads,
          completedLoads,
          documentStatus,
          teamActivity: {
            uploadsThisWeek: activityData.filter(activity => 
              activity.type === 'document_upload' && 
              new Date(activity.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length
          },
          classificationAccuracy: Math.round(classificationAccuracy * 100)
        },
        recentActivity: activityData,
        isLoading: false
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  clearDashboardData: () => {
    set({
      metrics: {
        totalLoads: 0,
        activeLoads: 0,
        completedLoads: 0,
        documentStatus: {
          pending: 0,
          classified: 0,
          rejected: 0
        },
        teamActivity: {
          uploadsThisWeek: 0
        },
        classificationAccuracy: 0
      },
      loadTimeline: [],
      recentActivity: [],
      isLoading: false,
      error: null
    });
  }
}));

export default useDashboardStore; 