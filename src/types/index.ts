export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  inputPrice: number; // Price per 1K input tokens
  outputPrice: number; // Price per 1K output tokens
  contextWindow: number;
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
  inputPrice: number;
  outputPrice: number;
  contextWindow: number;
  currency: string;
  region?: string;
  notes?: string;
  features: string[];
  isMultiModal: boolean;
  isVisionEnabled: boolean;
  isAudioEnabled: boolean;
}