import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UIState {
  // Global UI preferences
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;
  compactMode: boolean;
  
  // Animation preferences
  enableAnimations: boolean;
  reduceMotion: boolean;
  
  // Layout preferences
  containerMaxWidth: 'sm' | 'md' | 'lg' | 'xl' | '7xl';
  cardSpacing: 'tight' | 'normal' | 'loose';
  
  // Common form states across pages
  usagePattern: 'development' | 'production' | 'experimentation';
  
  // Actions
  setTheme: (theme: 'dark' | 'light') => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCompactMode: (compact: boolean) => void;
  setEnableAnimations: (enable: boolean) => void;
  setReduceMotion: (reduce: boolean) => void;
  setContainerMaxWidth: (width: 'sm' | 'md' | 'lg' | 'xl' | '7xl') => void;
  setCardSpacing: (spacing: 'tight' | 'normal' | 'loose') => void;
  setUsagePattern: (pattern: 'development' | 'production' | 'experimentation') => void;
  reset: () => void;
}

const initialState = {
  theme: 'dark' as const,
  sidebarCollapsed: false,
  compactMode: false,
  enableAnimations: true,
  reduceMotion: false,
  containerMaxWidth: '7xl' as const,
  cardSpacing: 'normal' as const,
  usagePattern: 'development' as const,
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setTheme: (theme) => set({ theme }),
      
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      
      setCompactMode: (compactMode) => set({ compactMode }),
      
      setEnableAnimations: (enableAnimations) => set({ enableAnimations }),
      
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      
      setContainerMaxWidth: (containerMaxWidth) => set({ containerMaxWidth }),
      
      setCardSpacing: (cardSpacing) => set({ cardSpacing }),
      
      setUsagePattern: (usagePattern) => set({ usagePattern }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'ui-preferences',
      storage: createJSONStorage(() => localStorage),
    }
  )
);