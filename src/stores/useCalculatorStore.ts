import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LLMModel, CostCalculation } from '@/types';

interface CalculatorStore {
  selectedModel: LLMModel | null;
  inputTokens: number;
  outputTokens: number;
  calculations: CostCalculation[];
  
  setSelectedModel: (model: LLMModel | null) => void;
  setInputTokens: (tokens: number) => void;
  setOutputTokens: (tokens: number) => void;
  calculateCost: () => CostCalculation | null;
  addToComparison: (calculation: CostCalculation) => void;
  removeFromComparison: (modelId: string) => void;
  clearComparisons: () => void;
}

export const useCalculatorStore = create<CalculatorStore>()(
  persist(
    (set, get) => ({
      selectedModel: null,
      inputTokens: 1000000, // Default to 1M tokens
      outputTokens: 1000000, // Default to 1M tokens
      calculations: [],
      
      setSelectedModel: (model) => set({ selectedModel: model }),
      
      setInputTokens: (tokens) => set({ inputTokens: Math.max(0, tokens) }),
      
      setOutputTokens: (tokens) => set({ outputTokens: Math.max(0, tokens) }),
      
      calculateCost: () => {
        const { selectedModel, inputTokens, outputTokens } = get();
        
        if (!selectedModel) return null;
        
        // Calculate costs based on per-1M-token pricing (prices are already per 1M tokens)
        const inputCost = (inputTokens / 1000000) * selectedModel.inputPrice;
        const outputCost = (outputTokens / 1000000) * selectedModel.outputPrice;
        const totalCost = inputCost + outputCost;
        
        return {
          inputTokens,
          outputTokens,
          inputCost,
          outputCost,
          totalCost,
          model: selectedModel,
        };
      },
  
  addToComparison: (calculation) => {
    set((state) => {
      const existingIndex = state.calculations.findIndex(
        (calc) => calc.model.id === calculation.model.id
      );
      
      if (existingIndex >= 0) {
        // Replace existing calculation for this model
        const newCalculations = [...state.calculations];
        newCalculations[existingIndex] = calculation;
        return { calculations: newCalculations };
      } else {
        // Add new calculation
        return { calculations: [...state.calculations, calculation] };
      }
    });
  },
  
  removeFromComparison: (modelId) => {
    set((state) => ({
      calculations: state.calculations.filter(
        (calc) => calc.model.id !== modelId
      ),
    }));
  },
  
  clearComparisons: () => set({ calculations: [] }),
    }),
    {
      name: 'calculator-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);