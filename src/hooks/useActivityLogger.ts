import { useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface ActivityDetails {
  calculator?: {
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
  };
  estimator?: {
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
  };
  modelManagement?: {
    action: 'create' | 'update' | 'delete';
    modelId?: string;
    modelName?: string;
    provider?: string;
    changes?: Record<string, any>;
  };
  comparison?: {
    models: string[];
    totalCost: number;
    cheapestModel: string;
    mostExpensiveModel: string;
    saved: boolean;
    comparisonId?: string;
  };
  general?: Record<string, any>;
}

interface LogActivityParams {
  type: 'calculator' | 'estimator' | 'comparison' | 'model_management' | 'profile_update' | 'login' | 'logout';
  action: string;
  details?: ActivityDetails;
  duration?: number;
}

export const useActivityLogger = () => {
  const { data: session } = useSession();

  const logActivity = useCallback(async ({ type, action, details, duration }: LogActivityParams) => {
    // Only log if user is authenticated
    if (!session?.user?.id) {
      return;
    }

    try {
      const response = await fetch('/api/user/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          action,
          details,
          duration,
        }),
      });

      if (!response.ok) {
        console.warn('Failed to log activity:', await response.text());
      }
    } catch (error) {
      console.warn('Activity logging error:', error);
    }
  }, [session?.user?.id]);

  // Specific helper methods for common activities
  const logCalculation = useCallback((modelData: any, inputTokens: number, outputTokens: number) => {
    logActivity({
      type: 'calculator',
      action: 'calculate_cost',
      details: {
        calculator: {
          modelId: modelData.id,
          modelName: modelData.name,
          provider: modelData.provider,
          inputTokens,
          outputTokens,
          inputCost: (inputTokens / 1000000) * modelData.inputPrice,
          outputCost: (outputTokens / 1000000) * modelData.outputPrice,
          totalCost: ((inputTokens / 1000000) * modelData.inputPrice) + ((outputTokens / 1000000) * modelData.outputPrice),
          contextWindow: modelData.contextWindow,
          currency: modelData.currency || 'USD',
        },
      },
    });
  }, [logActivity]);

  const logEstimation = useCallback((modelData: any, usage: any, results: any, timeframe: number) => {
    logActivity({
      type: 'estimator',
      action: 'estimate_usage_cost',
      details: {
        estimator: {
          selectedModel: {
            id: modelData.id,
            name: modelData.name,
            provider: modelData.provider,
          },
          usage,
          timeframe,
          results,
        },
      },
    });
  }, [logActivity]);

  const logComparison = useCallback((comparisons: any[], saved: boolean = false, comparisonId?: string) => {
    if (comparisons.length === 0) return;

    const models = comparisons.map(c => c.model.name);
    const totalCost = comparisons.reduce((sum, c) => sum + c.totalCost, 0);
    const costs = comparisons.map(c => c.totalCost);
    const cheapestModel = comparisons.find(c => c.totalCost === Math.min(...costs))?.model.name || '';
    const mostExpensiveModel = comparisons.find(c => c.totalCost === Math.max(...costs))?.model.name || '';

    logActivity({
      type: 'comparison',
      action: saved ? 'save_comparison' : 'compare_models',
      details: {
        comparison: {
          models,
          totalCost,
          cheapestModel,
          mostExpensiveModel,
          saved,
          comparisonId,
        },
      },
    });
  }, [logActivity]);

  const logModelManagement = useCallback((action: 'create' | 'update' | 'delete', modelData: any, changes?: Record<string, any>) => {
    logActivity({
      type: 'model_management',
      action: `model_${action}`,
      details: {
        modelManagement: {
          action,
          modelId: modelData.id,
          modelName: modelData.name,
          provider: modelData.provider,
          changes,
        },
      },
    });
  }, [logActivity]);

  const logLogin = useCallback(() => {
    logActivity({
      type: 'login',
      action: 'user_login',
    });
  }, [logActivity]);

  const logLogout = useCallback(() => {
    logActivity({
      type: 'logout',
      action: 'user_logout',
    });
  }, [logActivity]);

  const logProfileUpdate = useCallback((changes: Record<string, any>) => {
    logActivity({
      type: 'profile_update',
      action: 'update_profile',
      details: {
        general: changes,
      },
    });
  }, [logActivity]);

  return {
    logActivity,
    logCalculation,
    logEstimation,
    logComparison,
    logModelManagement,
    logLogin,
    logLogout,
    logProfileUpdate,
  };
};