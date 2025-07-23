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
  modelType: string;
  currency: string;
  region?: string;
  notes?: string;
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
  modelType: {
    type: String,
    required: true,
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
}, {
  timestamps: true,
});

// Compound index for user-specific models
UserModelSchema.index({ userId: 1, modelId: 1 }, { unique: true });
UserModelSchema.index({ userId: 1, provider: 1 });

export default mongoose.models.UserModel || mongoose.model<IUserModel>('UserModel', UserModelSchema);