import mongoose, { Schema, Document } from 'mongoose';

export interface IComparison {
  modelId: string;
  modelName: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  contextWindow: number;
  features?: string[];
}

export interface IUserHistory extends Document {
  userId: mongoose.Types.ObjectId;
  comparisons: IComparison[];
  metadata: {
    title?: string;
    description?: string;
    tags?: string[];
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCost: number;
    lowestCostModel: string;
    highestCostModel: string;
    averageCost: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ComparisonSchema = new Schema<IComparison>({
  modelId: { type: String, required: true },
  modelName: { type: String, required: true },
  provider: { type: String, required: true },
  inputTokens: { type: Number, required: true },
  outputTokens: { type: Number, required: true },
  inputCost: { type: Number, required: true },
  outputCost: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  contextWindow: { type: Number, required: true },
  features: [{ type: String }],
});

const UserHistorySchema = new Schema<IUserHistory>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  comparisons: [ComparisonSchema],
  metadata: {
    title: { type: String },
    description: { type: String },
    tags: [{ type: String }],
    totalInputTokens: { type: Number, required: true },
    totalOutputTokens: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    lowestCostModel: { type: String, required: true },
    highestCostModel: { type: String, required: true },
    averageCost: { type: Number, required: true },
  },
}, {
  timestamps: true,
});

// Create compound index for efficient querying
UserHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.UserHistory || mongoose.model<IUserHistory>('UserHistory', UserHistorySchema);