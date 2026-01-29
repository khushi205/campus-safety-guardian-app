/**
 * API Client Helper
 * 
 * Handles all HTTP requests to the backend with authentication
 */

import { auth } from './firebase';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string = '/api';

  /**
   * Get auth token from Firebase
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      return await auth.currentUser?.getIdToken() || null;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  /**
   * Make HTTP request with authentication
   */
  private async request<T = unknown>(
    method: string,
    endpoint: string,
    body?: unknown
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const options: RequestInit = {
        method,
        headers,
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, options);

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.error || 'Request failed',
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error(`API request failed: ${method} ${endpoint}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Authentication Endpoints
   */

  async signup(payload: {
    name: string;
    email: string;
    password: string;
  }): Promise<ApiResponse<{ id: string; name: string; email: string }>> {
    return this.request('POST', '/auth/signup', payload);
  }

  async login(payload: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ user: { id: string; email: string }; token: string }>> {
    return this.request('POST', '/auth/login', payload);
  }

  async logout(): Promise<ApiResponse<null>> {
    return this.request('POST', '/auth/logout');
  }

  /**
   * Walk Endpoints
   */

  async startWalk(payload: {
    destination: string;
    estimatedDuration: number;
    sharedWith: string[];
  }): Promise<ApiResponse<{ id: string }>> {
    return this.request('POST', '/walks/start', payload);
  }

  async getWalk(walkId: string): Promise<ApiResponse<unknown>> {
    return this.request('GET', `/walks/${walkId}`);
  }

  async updateWalkLocation(
    walkId: string,
    payload: {
      latitude: number;
      longitude: number;
      accuracy: number;
    }
  ): Promise<ApiResponse<null>> {
    return this.request('POST', `/walks/${walkId}/location`, payload);
  }

  async checkInWalk(walkId: string): Promise<ApiResponse<null>> {
    return this.request('POST', `/walks/${walkId}/checkin`);
  }

  async sendEmergencyAlert(walkId: string): Promise<ApiResponse<null>> {
    return this.request('POST', `/walks/${walkId}/emergency`);
  }

  async endWalk(walkId: string): Promise<ApiResponse<null>> {
    return this.request('POST', `/walks/${walkId}/end`);
  }

  /**
   * Contact Endpoints
   */

  async getContacts(): Promise<ApiResponse<unknown[]>> {
    return this.request('GET', '/contacts');
  }

  async addContact(payload: {
    name: string;
    phone: string;
    email: string;
    relationship: string;
  }): Promise<ApiResponse<{ id: string }>> {
    return this.request('POST', '/contacts', payload);
  }

  async updateContact(
    contactId: string,
    payload: Partial<{
      name: string;
      phone: string;
      email: string;
      relationship: string;
    }>
  ): Promise<ApiResponse<null>> {
    return this.request('PUT', `/contacts/${contactId}`, payload);
  }

  async deleteContact(contactId: string): Promise<ApiResponse<null>> {
    return this.request('DELETE', `/contacts/${contactId}`);
  }

  /**
   * User Endpoints
   */

  async getUserProfile(): Promise<ApiResponse<unknown>> {
    return this.request('GET', '/user/profile');
  }

  async updateUserProfile(payload: Partial<{
    name: string;
    phone: string;
    preferences: {
      notifications: boolean;
      locationTracking: boolean;
    };
  }>): Promise<ApiResponse<null>> {
    return this.request('PUT', '/user/profile', payload);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

/**
 * Hook-friendly API methods
 */
export const api = {
  auth: {
    signup: (payload: Parameters<typeof apiClient.signup>[0]) =>
      apiClient.signup(payload),
    login: (payload: Parameters<typeof apiClient.login>[0]) =>
      apiClient.login(payload),
    logout: () => apiClient.logout(),
  },
  walks: {
    start: (payload: Parameters<typeof apiClient.startWalk>[0]) =>
      apiClient.startWalk(payload),
    get: (id: string) => apiClient.getWalk(id),
    updateLocation: (id: string, payload: Parameters<typeof apiClient.updateWalkLocation>[1]) =>
      apiClient.updateWalkLocation(id, payload),
    checkIn: (id: string) => apiClient.checkInWalk(id),
    emergency: (id: string) => apiClient.sendEmergencyAlert(id),
    end: (id: string) => apiClient.endWalk(id),
  },
  contacts: {
    list: () => apiClient.getContacts(),
    add: (payload: Parameters<typeof apiClient.addContact>[0]) =>
      apiClient.addContact(payload),
    update: (id: string, payload: Parameters<typeof apiClient.updateContact>[1]) =>
      apiClient.updateContact(id, payload),
    delete: (id: string) => apiClient.deleteContact(id),
  },
  user: {
    profile: () => apiClient.getUserProfile(),
    updateProfile: (payload: Parameters<typeof apiClient.updateUserProfile>[0]) =>
      apiClient.updateUserProfile(payload),
  },
};
