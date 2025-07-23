import mongoose, { Schema, Document } from 'mongoose';

export interface ICalculatorActivity {
  modelId: string;
  modelName: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  contextWindow: number;
  currency: string;
}

export interface IEstimatorActivity {
  selectedModel: {
    id: string;
    name: string;
    provider: string;
  };
  usage: {
    dailyRequests: number;
    avgInputTokens: number;
    avgOutputTokens: number;
    peakMultiplier: number;
  };
  timeframe: number;
  results: {
    dailyCost: number;
    monthlyCost: number;
    yearlyCost: number;
    totalTokens: number;
  };
}

export interface IModelManagementActivity {
  action: 'create' | 'update' | 'delete';
  modelId?: string;
  modelName?: string;
  provider?: string;
  changes?: Record<string, any>;
}

export interface IComparisonActivity {
  models: string[];
  totalCost: number;
  cheapestModel: string;
  mostExpensiveModel: string;
  saved: boolean;
  comparisonId?: string;
}

export interface IChatbotActivity {
  sessionId: string;
  userQuery: string;
  responseLength: number;
  hasCostEstimate: boolean;
  suggestionCount: number;
  linkCount: number;
  videoCount: number;
}

export interface IUserActivity extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'calculator' | 'estimator' | 'comparison' | 'model_management' | 'profile_update' | 'login' | 'logout' | 'chatbot';
  action: string;
  details: {
    calculator?: ICalculatorActivity;
    estimator?: IEstimatorActivity;
    modelManagement?: IModelManagementActivity;
    comparison?: IComparisonActivity;
    chatbot?: IChatbotActivity;
    general?: Record<string, any>;
  };
  metadata: {
    sessionId?: string;
    userAgent?: string;
    ipAddress?: string;
    location?: string;
    device?: {
      type: 'desktop' | 'mobile' | 'tablet';
      os?: string;
      browser?: string;
    };
    duration?: number; // in milliseconds
  };
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CalculatorActivitySchema = new Schema({
  modelId: { type: String, required: true },
  modelName: { type: String, required: true },
  provider: { type: String, required: true },
  inputTokens: { type: Number, required: true },
  outputTokens: { type: Number, required: true },
  inputCost: { type: Number, required: true },
  outputCost: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  contextWindow: { type: Number, required: true },
  currency: { type: String, required: true },
});

const EstimatorActivitySchema = new Schema({
  selectedModel: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    provider: { type: String, required: true },
  },
  usage: {
    dailyRequests: { type: Number, required: true },
    avgInputTokens: { type: Number, required: true },
    avgOutputTokens: { type: Number, required: true },
    peakMultiplier: { type: Number, required: true },
  },
  timeframe: { type: Number, required: true },
  results: {
    dailyCost: { type: Number, required: true },
    monthlyCost: { type: Number, required: true },
    yearlyCost: { type: Number, required: true },
    totalTokens: { type: Number, required: true },
  },
});

const ModelManagementActivitySchema = new Schema({
  action: { type: String, enum: ['create', 'update', 'delete'], required: true },
  modelId: { type: String },
  modelName: { type: String },
  provider: { type: String },
  changes: { type: Schema.Types.Mixed },
});

const ComparisonActivitySchema = new Schema({
  models: [{ type: String, required: true }],
  totalCost: { type: Number, required: true },
  cheapestModel: { type: String, required: true },
  mostExpensiveModel: { type: String, required: true },
  saved: { type: Boolean, required: true },
  comparisonId: { type: String },
});

const ChatbotActivitySchema = new Schema({
  sessionId: { type: String, required: true },
  userQuery: { type: String, required: true },
  responseLength: { type: Number, required: true },
  hasCostEstimate: { type: Boolean, required: true },
  suggestionCount: { type: Number, required: true },
  linkCount: { type: Number, required: true },
  videoCount: { type: Number, required: true },
});

const UserActivitySchema = new Schema<IUserActivity>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  type: { 
    type: String, 
    enum: ['calculator', 'estimator', 'comparison', 'model_management', 'profile_update', 'login', 'logout', 'chatbot'],
    required: true,
    index: true
  },
  action: { type: String, required: true },
  details: {
    calculator: CalculatorActivitySchema,
    estimator: EstimatorActivitySchema,
    modelManagement: ModelManagementActivitySchema,
    comparison: ComparisonActivitySchema,
    chatbot: ChatbotActivitySchema,
    general: { type: Schema.Types.Mixed },
  },
  metadata: {
    sessionId: { type: String },
    userAgent: { type: String },
    ipAddress: { type: String },
    location: { type: String },
    device: {
      type: { type: String, enum: ['desktop', 'mobile', 'tablet'] },
      os: { type: String },
      browser: { type: String },
    },
    duration: { type: Number },
  },
  timestamp: { type: Date, default: Date.now, index: true },
}, {
  timestamps: true,
});

// Create compound indexes for efficient querying
UserActivitySchema.index({ userId: 1, timestamp: -1 });
UserActivitySchema.index({ userId: 1, type: 1, timestamp: -1 });
UserActivitySchema.index({ timestamp: -1 });

export default mongoose.models.UserActivity || mongoose.model<IUserActivity>('UserActivity', UserActivitySchema);