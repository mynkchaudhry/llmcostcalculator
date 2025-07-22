import mongoose from 'mongoose';

export interface IUserModel {
  _id?: string;
  userId: string;
  modelId: string;
  name: string;
  provider: string;
  inputPrice: number;
  outputPrice: number;
  contextWindow: number;
  currency: string;
  region?: string;
  notes?: string;
  features?: string[];
  isMultiModal?: boolean;
  isVisionEnabled?: boolean;
  isAudioEnabled?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserModelSchema = new mongoose.Schema<IUserModel>({
  userId: {
    type: String,
    required: true,
  },
  modelId: {
    type: String,
    required: true,
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
}, {
  timestamps: true,
});

// Compound index for user-specific models
UserModelSchema.index({ userId: 1, modelId: 1 }, { unique: true });
UserModelSchema.index({ userId: 1, provider: 1 });

export default mongoose.models.UserModel || mongoose.model<IUserModel>('UserModel', UserModelSchema);