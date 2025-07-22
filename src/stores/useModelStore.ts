import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LLMModel, ModelFormData } from '@/types';
import { defaultModels } from '@/data/models';
import { modelsAPI, APIError } from '@/lib/api';

interface ModelStore {
  models: LLMModel[];
  isLoading: boolean;
  error: string | null;
  
  // API-integrated methods
  fetchModels: () => Promise<void>;
  addModel: (modelData: ModelFormData) => Promise<void>;
  updateModel: (id: string, modelData: Partial<ModelFormData>) => Promise<void>;
  deleteModel: (id: string) => Promise<void>;
  
  // Local methods
  getModelById: (id: string) => LLMModel | undefined;
  resetToDefaults: () => void;
  setError: (error: string | null) => void;
}

export const useModelStore = create<ModelStore>()(
  persist(
    (set, get) => ({
      models: defaultModels,
      isLoading: false,
      error: null,
      
      fetchModels: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await modelsAPI.getModels(true);
          set({ 
            models: response.models,
            isLoading: false 
          });
        } catch (error) {
          console.warn('Failed to fetch models from API, using default models:', error);
          // Fallback to default models if API fails and we don't have any models
          const currentState = get();
          if (currentState.models.length === 0) {
            set({ 
              models: defaultModels,
              isLoading: false,
              error: null // Clear error since we have fallback data
            });
          } else {
            set({ 
              isLoading: false,
              error: error instanceof APIError ? error.message : 'Failed to fetch models'
            });
          }
        }
      },
      
      addModel: async (modelData: ModelFormData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await modelsAPI.createModel(modelData);
          
          set((state) => ({
            models: [...state.models, response.model],
            isLoading: false,
          }));
        } catch (error) {
          // Fallback to local storage
          const newModel: LLMModel = {
            id: `${modelData.provider.toLowerCase()}-${modelData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
            ...modelData,
            lastUpdated: new Date(),
          };
          
          set((state) => ({
            models: [...state.models, newModel],
            isLoading: false,
            error: error instanceof APIError ? error.message : 'Failed to save model to server',
          }));
        }
      },
      
      updateModel: async (id: string, modelData: Partial<ModelFormData>) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await modelsAPI.updateModel(id, modelData);
          
          set((state) => ({
            models: state.models.map((model) =>
              model.id === id ? response.model : model
            ),
            isLoading: false,
          }));
        } catch (error) {
          // Fallback to local update
          set((state) => ({
            models: state.models.map((model) =>
              model.id === id
                ? { ...model, ...modelData, lastUpdated: new Date() }
                : model
            ),
            isLoading: false,
            error: error instanceof APIError ? error.message : 'Failed to update model on server',
          }));
        }
      },
      
      deleteModel: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await modelsAPI.deleteModel(id);
          
          set((state) => ({
            models: state.models.filter((model) => model.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          // Fallback to local deletion
          set((state) => ({
            models: state.models.filter((model) => model.id !== id),
            isLoading: false,
            error: error instanceof APIError ? error.message : 'Failed to delete model from server',
          }));
        }
      },
      
      getModelById: (id: string) => {
        return get().models.find((model) => model.id === id);
      },
      
      resetToDefaults: () => {
        set({ models: defaultModels });
      },
      
      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'llm-models-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Ensure we always have default models, then try to fetch from API
        if (state) {
          if (state.models.length === 0) {
            state.models = defaultModels;
          }
          // Try to fetch updated models from API in background
          state.fetchModels().catch(() => {
            // Silently fail and keep default models
            console.log('Using default models - API unavailable');
          });
        }
      },
    }
  )
);