// API Service to interact with our backend
// This service handles common operations with our backend API
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
  private baseURL: string = 'http://localhost:5000/api';
  private token: string | null = null;

  // Get authorization header with token
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Set authentication token
  public async setToken(token: string): Promise<void> {
    this.token = token;
    try {
      // Store in AsyncStorage
      await AsyncStorage.setItem('natiapp_token', token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  // Clear authentication token
  public async clearToken(): Promise<void> {
    this.token = null;
    try {
      await AsyncStorage.removeItem('natiapp_token');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  // Load token from storage (e.g. on app startup)
  public async loadToken(): Promise<void> {
    try {
      const storedToken = await AsyncStorage.getItem('natiapp_token');
      if (storedToken) {
        this.token = storedToken;
      }
    } catch (error) {
      console.error('Error loading token:', error);
    }
  }

  // GET request helper
  public async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error('API GET request failed:', error);
      throw error;
    }
  }

  // POST request helper
  public async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error('API POST request failed:', error);
      throw error;
    }
  }

  // PUT request helper
  public async put<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error('API PUT request failed:', error);
      throw error;
    }
  }

  // DELETE request helper
  public async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error('API DELETE request failed:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const apiService = new ApiService();
