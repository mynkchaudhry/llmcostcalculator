import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface HistoryEntry {
  _id: string;
  comparisons: any[];
  metadata: {
    title?: string;
    description?: string;
    tags?: string[];
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCost: number;
    lowestCostModel: string;
    highestCostModel: string;
    averageCost: number;
  };
  createdAt: string;
  updatedAt: string;
}


interface HistoryStore {
  history: HistoryEntry[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  
  // Actions
  fetchHistory: (page?: number, limit?: number) => Promise<void>;
  saveComparison: (comparisons: any[], title?: string, description?: string, tags?: string[]) => Promise<void>;
  deleteHistoryEntry: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      history: [],
      isLoading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      },

      fetchHistory: async (page = 1, limit = 10) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/user/comparison-history?page=${page}&limit=${limit}`);
          if (!response.ok) throw new Error('Failed to fetch history');
          
          const data = await response.json();
          set({ 
            history: data.history,
            pagination: data.pagination,
            isLoading: false,
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to fetch history',
            isLoading: false,
          });
        }
      },

      saveComparison: async (comparisons, title, description, tags) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Saving comparison:', { comparisons, title, description, tags });
          
          const response = await fetch('/api/user/comparison-history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comparisons, title, description, tags }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save comparison');
          }
          
          set({ isLoading: false });
          // Refresh history after saving
          await get().fetchHistory();
        } catch (error: any) {
          console.error('Save comparison error:', error);
          set({ 
            error: error.message || 'Failed to save comparison',
            isLoading: false,
          });
          throw error; // Re-throw to allow component handling
        }
      },

      deleteHistoryEntry: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/user/comparison-history?id=${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) throw new Error('Failed to delete history entry');
          
          // Remove from local state
          set(state => ({
            history: state.history.filter(h => h._id !== id),
            isLoading: false,
          }));
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to delete history entry',
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'history-storage',
      partialize: (state) => ({ 
        // Don't persist history data, fetch fresh from API
      }),
    }
  )
);