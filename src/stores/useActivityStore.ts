import { create } from 'zustand';

interface Activity {
  _id: string;
  type: 'calculator' | 'estimator' | 'comparison' | 'model_management' | 'profile_update' | 'login' | 'logout';
  action: string;
  details: any;
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    device?: {
      type: 'desktop' | 'mobile' | 'tablet';
      os?: string;
      browser?: string;
    };
    duration?: number;
  };
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

interface ActivityAnalytics {
  timeframe: number;
  summary: {
    totalActivities: number;
    uniqueSessions: number;
    totalCalculations: number;
    totalEstimations: number;
    totalComparisons: number;
    totalCostCalculated: number;
    uniqueModelsUsed: number;
    uniqueProvidersUsed: number;
    avgActivitiesPerDay: number;
    avgCostPerCalculation: number;
    avgSessionDuration: number;
    activityTrend: number;
  };
  breakdown: {
    activityByType: Record<string, number>;
    activityByDay: Record<string, number>;
    hourlyDistribution: Record<string, number>;
    deviceUsage: Record<string, number>;
  };
  insights: {
    mostActiveHour: string;
    topModels: string[];
    topProviders: string[];
    peakDay: string | null;
  };
}

interface ActivityStore {
  activities: Activity[];
  analytics: ActivityAnalytics | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    type?: string;
    startDate?: string;
    endDate?: string;
  };
  
  // Actions
  fetchActivities: (page?: number, limit?: number) => Promise<void>;
  fetchAnalytics: (timeframe?: number) => Promise<void>;
  clearActivities: () => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  setFilters: (filters: Partial<ActivityStore['filters']>) => void;
  clearError: () => void;
}

export const useActivityStore = create<ActivityStore>((set, get) => ({
  activities: [],
  analytics: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  filters: {},

  fetchActivities: async (page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters.type && { type: filters.type }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      });

      const response = await fetch(`/api/user/activity?${params}`);
      if (!response.ok) throw new Error('Failed to fetch activities');
      
      const data = await response.json();
      set({ 
        activities: data.activities,
        pagination: data.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch activities',
        isLoading: false,
      });
    }
  },

  fetchAnalytics: async (timeframe = 30) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/user/activity/analytics?timeframe=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      
      const data = await response.json();
      set({ 
        analytics: data,
        isLoading: false,
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch analytics',
        isLoading: false,
      });
    }
  },

  clearActivities: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/user/activity?clearAll=true', {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to clear activities');
      
      set({ 
        activities: [],
        isLoading: false,
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to clear activities',
        isLoading: false,
      });
    }
  },

  deleteActivity: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/user/activity?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete activity');
      
      // Remove from local state
      set(state => ({
        activities: state.activities.filter(a => a._id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete activity',
        isLoading: false,
      });
    }
  },

  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters },
    }));
    // Automatically refetch with new filters
    get().fetchActivities(1, get().pagination.limit);
  },

  clearError: () => set({ error: null }),
}));