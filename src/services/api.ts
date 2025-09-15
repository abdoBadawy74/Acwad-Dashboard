import { ApiResponse, PaginatedResponse } from '../types/api';

const API_BASE_URL = 'https://api.winner.acwad.tech';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Generic CRUD methods
  async getAll<T>(endpoint: string, params?: Record<string, any>): Promise<PaginatedResponse<T>> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<PaginatedResponse<T>>(`${endpoint}${queryString}`);
  }

  async getById<T>(endpoint: string, id: number): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(`${endpoint}/${id}`);
  }

  async create<T>(endpoint: string, data: Partial<T>): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update<T>(endpoint: string, id: number, data: Partial<T>): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(`${endpoint}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string, id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`${endpoint}/${id}`, {
      method: 'DELETE',
    });
  }

  // Specific methods for special endpoints
  async updateSubscriptionStatus(id: number, subscribed: boolean): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/api/subscribers/${id}/subscription`, {
      method: 'PATCH',
      body: JSON.stringify({ subscribed }),
    });
  }

  async updateSubscriptionByEmail(email: string, subscribed: boolean = true): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/api/subscribers/subscription', {
      method: 'PATCH',
      body: JSON.stringify({ email, subscribed }),
    });
  }

  async getFeaturedProjects(): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>('/api/projects/featured');
  }

  async getProjectsByCategory(categoryId: number): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>(`/api/projects/category/${categoryId}`);
  }

  async searchFAQs(query: string): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>(`/api/faqs/search?q=${encodeURIComponent(query)}`);
  }

  async getSettingsAsObject(): Promise<ApiResponse<Record<string, string>>> {
    return this.request<ApiResponse<Record<string, string>>>('/api/settings/object');
  }

  async getSettingByKey(key: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/api/settings/key/${key}`);
  }

  async updateSettingByKey(key: string, value: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/api/settings/key/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }

  async getOrderedPrivacyPolicySections(): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>('/api/privacy-policy-sections/ordered');
  }

  async reorderPrivacyPolicySections(sections: { id: number; display_order: number }[]): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>('/api/privacy-policy-sections/reorder', {
      method: 'PUT',
      body: JSON.stringify({ sections }),
    });
  }

  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/health');
  }

  async detailedHealthCheck(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/health/detailed');
  }
}

export const apiService = new ApiService();