import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppStore {
  currentTab: 'calculator' | 'estimator' | 'comparison' | 'management' | 'history' | 'activity' | 'advisor' | 'profile';
  searchQuery: string;
  providerFilter: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  
  setCurrentTab: (tab: 'calculator' | 'estimator' | 'comparison' | 'management' | 'history' | 'activity' | 'advisor' | 'profile') => void;
  setSearchQuery: (query: string) => void;
  setProviderFilter: (provider: string) => void;
  setSortField: (field: string) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
  resetFilters: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      currentTab: 'calculator',
      searchQuery: '',
      providerFilter: '',
      sortField: 'totalCost',
      sortDirection: 'asc',
      
      setCurrentTab: (tab) => set({ currentTab: tab }),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setProviderFilter: (provider) => set({ providerFilter: provider }),
      
      setSortField: (field) => set({ sortField: field }),
      
      setSortDirection: (direction) => set({ sortDirection: direction }),
      
      resetFilters: () => set({
        searchQuery: '',
        providerFilter: '',
        sortField: 'totalCost',
        sortDirection: 'asc',
      }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);