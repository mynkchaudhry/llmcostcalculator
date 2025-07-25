export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  modelType?: string;
  inputPrice: number; // Price per 1M input tokens
  outputPrice: number; // Price per 1M output tokens
  currency: string;
  region?: string;
  notes?: string;
  features?: string[];
  lastUpdated: Date;
  isMultiModal?: boolean;
  isVisionEnabled?: boolean;
  isAudioEnabled?: boolean;
}

export interface CostCalculation {
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  model: LLMModel;
}

export interface CalculatorState {
  selectedModel: LLMModel | null;
  inputTokens: number;
  outputTokens: number;
  calculations: CostCalculation[];
}

export interface ModelFormData {
  name: string;
  provider: string;
  contextWindow: number;
  modelType: string;
  inputPrice: number;
  outputPrice: number;
  currency: string;
  region?: string;
  notes?: string;
}