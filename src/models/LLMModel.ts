import mongoose from 'mongoose';

export interface ILLMModel {
  _id?: string;
  id: string;
  name: string;
  provider: string;
  inputPrice: number;
  outputPrice: number;
  contextWindow: number;
  currency: string;
  region?: string;
  notes?: string;
  features?: string[];
  lastUpdated: Date;
  isMultiModal?: boolean;
  isVisionEnabled?: boolean;
  isAudioEnabled?: boolean;
  isCustom: boolean;
  createdBy?: string;
  isPublic: boolean;
}

const LLMModelSchema = new mongoose.Schema<ILLMModel>({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: true,
  },
  inputPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  outputPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  contextWindow: {
    type: Number,
    required: true,
    min: 1,
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
  },
  region: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  features: {
    type: [String],
    default: [],
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  isMultiModal: {
    type: Boolean,
    default: false,
  },
  isVisionEnabled: {
    type: Boolean,
    default: false,
  },
  isAudioEnabled: {
    type: Boolean,
    default: false,
  },
  isCustom: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String,
    default: 'anonymous',
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
LLMModelSchema.index({ provider: 1, name: 1 });
LLMModelSchema.index({ isPublic: 1, isCustom: 1 });

export default mongoose.models.LLMModel || mongoose.model<ILLMModel>('LLMModel', LLMModelSchema);