import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { userAPI, APIError } from '@/lib/api';

interface UserPreferences {
  defaultInputTokens: number;
  defaultOutputTokens: number;
  preferredCurrency: string;
  favoriteModels: string[];
  comparisonHistory: Array<{
    models: string[];
    inputTokens: number;
    outputTokens: number;
    timestamp: Date;
    totalCost: number;
  }>;
}

interface UserStore {
  preferences: UserPreferences | null;
  isLoading: boolean;
  error: string | null;
  
  // API methods
  fetchPreferences: () => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  saveComparisonHistory: (historyData: {
    models: string[];
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
  }) => Promise<void>;
  fetchComparisonHistory: () => Promise<void>;
  
  // Local methods
  setError: (error: string | null) => void;
  addFavoriteModel: (modelId: string) => void;
  removeFavoriteModel: (modelId: string) => void;
}

const defaultPreferences: UserPreferences = {
  defaultInputTokens: 1000000,
  defaultOutputTokens: 1000000,
  preferredCurrency: 'USD',
  favoriteModels: [],
  comparisonHistory: [],
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      preferences: defaultPreferences,
      isLoading: false,
      error: null,
      
      fetchPreferences: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await userAPI.getPreferences();
          set({ 
            preferences: response.preferences || defaultPreferences,
            isLoading: false 
          });
        } catch (error) {
          console.warn('Failed to fetch user preferences, using local storage:', error);
          set({ 
            isLoading: false,
            error: error instanceof APIError ? error.message : 'Failed to fetch preferences'
          });
        }
      },
      
      updatePreferences: async (newPreferences: Partial<UserPreferences>) => {
        set({ isLoading: true, error: null });
        
        const currentPreferences = get().preferences || defaultPreferences;
        const updatedPreferences = { ...currentPreferences, ...newPreferences };
        
        try {
          const response = await userAPI.updatePreferences(updatedPreferences);
          set({ 
            preferences: response.preferences,
            isLoading: false 
          });
        } catch (error) {
          // Fallback to local update
          set({ 
            preferences: updatedPreferences,
            isLoading: false,
            error: error instanceof APIError ? error.message : 'Failed to save preferences to server'
          });
        }
      },
      
      saveComparisonHistory: async (historyData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await userAPI.saveComparisonHistory(historyData);
          set((state) => ({
            preferences: {
              ...state.preferences,
              comparisonHistory: response.history,
            } as UserPreferences,
            isLoading: false,
          }));
        } catch (error) {
          // Fallback to local storage
          const historyEntry = {
            ...historyData,
            timestamp: new Date(),
          };
          
          set((state) => ({
            preferences: {
              ...state.preferences,
              comparisonHistory: [historyEntry, ...(state.preferences?.comparisonHistory?.slice(0, 49) || [])],
            } as UserPreferences,
            isLoading: false,
            error: error instanceof APIError ? error.message : 'Failed to save history to server',
          }));
        }
      },
      
      fetchComparisonHistory: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await userAPI.getComparisonHistory();
          set((state) => ({
            preferences: {
              ...state.preferences,
              comparisonHistory: response.history,
            } as UserPreferences,
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            isLoading: false,
            error: error instanceof APIError ? error.message : 'Failed to fetch history'
          });
        }
      },
      
      setError: (error: string | null) => {
        set({ error });
      },
      
      addFavoriteModel: (modelId: string) => {
        set((state) => {
          const currentFavorites = state.preferences?.favoriteModels || [];
          if (currentFavorites.includes(modelId)) return state;
          
          const updatedPreferences = {
            ...state.preferences,
            favoriteModels: [...currentFavorites, modelId],
          } as UserPreferences;
          
          // Async update to server
          get().updatePreferences({ favoriteModels: updatedPreferences.favoriteModels });
          
          return {
            preferences: updatedPreferences,
          };
        });
      },
      
      removeFavoriteModel: (modelId: string) => {
        set((state) => {
          const currentFavorites = state.preferences?.favoriteModels || [];
          const updatedFavorites = currentFavorites.filter(id => id !== modelId);
          
          const updatedPreferences = {
            ...state.preferences,
            favoriteModels: updatedFavorites,
          } as UserPreferences;
          
          // Async update to server
          get().updatePreferences({ favoriteModels: updatedFavorites });
          
          return {
            preferences: updatedPreferences,
          };
        });
      },
    }),
    {
      name: 'user-preferences-storage',
      onRehydrateStorage: () => (state) => {
        // Fetch fresh data from API after rehydration if user is logged in
        if (state && typeof window !== 'undefined') {
          // Check if user is authenticated by checking for session
          fetch('/api/user/preferences')
            .then(response => {
              if (response.ok) {
                state.fetchPreferences();
              }
            })
            .catch(() => {
              // User not authenticated, continue with local storage
            });
        }
      },
    }
  )
);