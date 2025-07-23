import mongoose from 'mongoose';

export interface IChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  costEstimate?: {
    service: string;
    monthlyCost: number;
    description: string;
  }[];
  links?: string[];
  videos?: {
    title: string;
    videoId: string;
  }[];
}

export interface IChatHistory extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  sessionId: string;
  title: string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const ChatMessageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  suggestions: [{ type: String }],
  costEstimate: [{
    service: { type: String },
    monthlyCost: { type: Number },
    description: { type: String }
  }],
  links: [{ type: String }],
  videos: [{
    title: { type: String },
    videoId: { type: String }
  }]
});

const ChatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  messages: [ChatMessageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

// Index for efficient queries
ChatHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.ChatHistory || mongoose.model<IChatHistory>('ChatHistory', ChatHistorySchema);