import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  _id?: string;
  email: string;
  name?: string;
  password?: string;
  image?: string;
  emailVerified?: Date;
  githubId?: string;
  preferences?: {
    defaultInputTokens: number;
    defaultOutputTokens: number;
    preferredCurrency: string;
    favoriteModels: string[];
    comparisonHistory: Array<{
      models: string[];
      inputTokens: number;
      outputTokens: number;
      timestamp: Date;
      totalCost: number;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    required: function() {
      return !this.githubId; // Password only required if not using GitHub
    },
    minlength: 6,
  },
  githubId: {
    type: String,
    sparse: true, // Allow multiple null values
  },
  image: {
    type: String,
  },
  emailVerified: {
    type: Date,
  },
  preferences: {
    defaultInputTokens: {
      type: Number,
      default: 1000000,
    },
    defaultOutputTokens: {
      type: Number,
      default: 1000000,
    },
    preferredCurrency: {
      type: String,
      default: 'USD',
    },
    favoriteModels: {
      type: [String],
      default: [],
    },
    comparisonHistory: [{
      models: [String],
      inputTokens: Number,
      outputTokens: Number,
      timestamp: {
        type: Date,
        default: Date.now,
      },
      totalCost: Number,
    }],
  },
}, {
  timestamps: true,
});

// Hash password before saving (only if password exists)
UserSchema.pre('save', async function(next) {
  if (!this.password || !this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false; // GitHub users don't have passwords
  return bcrypt.compare(candidatePassword, this.password);
};

// Index is already created by unique: true in schema field

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);