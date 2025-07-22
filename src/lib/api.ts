// API utility functions for server communication

export class APIError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'APIError';
  }
}

async function apiRequest<T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new APIError(
      errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      response.status
    );
  }

  return response.json();
}

// Model API functions
export const modelsAPI = {
  async getModels(includeCustom = true) {
    return apiRequest<{ models: any[] }>(`/api/models?includeCustom=${includeCustom}`);
  },

  async createModel(modelData: any) {
    return apiRequest<{ message: string; model: any }>('/api/models', {
      method: 'POST',
      body: JSON.stringify(modelData),
    });
  },

  async updateModel(id: string, modelData: any) {
    return apiRequest<{ message: string; model: any }>(`/api/models/${id}`, {
      method: 'PUT',
      body: JSON.stringify(modelData),
    });
  },

  async deleteModel(id: string) {
    return apiRequest<{ message: string }>(`/api/models/${id}`, {
      method: 'DELETE',
    });
  },
};

// User preferences API
export const userAPI = {
  async getPreferences() {
    return apiRequest<{ preferences: any }>('/api/user/preferences');
  },

  async updatePreferences(preferences: any) {
    return apiRequest<{ message: string; preferences: any }>('/api/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },

  async saveComparisonHistory(historyData: any) {
    return apiRequest<{ message: string; history: any[] }>('/api/user/history', {
      method: 'POST',
      body: JSON.stringify(historyData),
    });
  },

  async getComparisonHistory() {
    return apiRequest<{ history: any[] }>('/api/user/history');
  },
};

// Auth API
export const authAPI = {
  async register(userData: { name: string; email: string; password: string }) {
    return apiRequest<{ message: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};