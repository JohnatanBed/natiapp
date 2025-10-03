// API Service to interact with our backend
// This service handles common operations with our backend API
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ImageAsset {
  uri: string;
  type?: string;
  name?: string;
}

class ApiService {

  private baseURL: string ='http://192.168.1.7:5000/api';

  private token: string | null = null;

  // Get authorization header with token
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Ensure token is loaded from storage if not in memory
  private async ensureTokenLoaded(): Promise<void> {
    if (!this.token) {
      try {
        const storedToken = await AsyncStorage.getItem('natiapp_token');
        if (storedToken) this.token = storedToken;
      } catch (e) {
        console.error('Error ensuring token loaded:', e);
      }
    }
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
      await this.ensureTokenLoaded();
      console.log(`Sending GET request to: ${this.baseURL}${endpoint}`);
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const responseText = await response.text();
      console.log(`Response status: ${response.status}`);
      console.log(`Response text: ${responseText}`);
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || `API Error: ${response.status}`;
        } catch (e) {
          errorMessage = `API Error: ${response.status} - ${responseText || 'No response body'}`;
        }
        throw new Error(errorMessage);
      }

      try {
        return JSON.parse(responseText) as T;
      } catch (e) {
        throw new Error(`Error parsing response: ${responseText}`);
      }
    } catch (error) {
      console.error('API GET request failed:', error);
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        console.error('Network error details:', {
          url: `${this.baseURL}${endpoint}`,
          possibleCauses: [
            '1. Backend server is not running',
            '2. Incorrect IP address in baseURL',
            '3. Device cannot connect to the specified IP',
            '4. Android emulator needs 10.0.2.2 instead of localhost',
            '5. Physical device needs your computer\'s local IP address'
          ]
        });
      }
      throw error;
    }
  }

  // POST request helper
  public async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      await this.ensureTokenLoaded();
      console.log(`Sending POST request to: ${this.baseURL}${endpoint}`);
      console.log('Request data:', data);
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      const responseText = await response.text();
      console.log(`Response status: ${response.status}`);
      console.log(`Response text: ${responseText}`);
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || `API Error: ${response.status}`;
        } catch (e) {
          errorMessage = `API Error: ${response.status} - ${responseText || 'No response body'}`;
        }
        throw new Error(errorMessage);
      }

      try {
        return JSON.parse(responseText) as T;
      } catch (e) {
        throw new Error(`Error parsing response: ${responseText}`);
      }
    } catch (error) {
      console.error('API POST request failed:', error);
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        console.error('Network error details:', {
          url: `${this.baseURL}${endpoint}`,
          possibleCauses: [
            '1. Backend server is not running',
            '2. Incorrect IP address in baseURL',
            '3. Device cannot connect to the specified IP',
            '4. Android emulator needs 10.0.2.2 instead of localhost',
            '5. Physical device needs your computer\'s local IP address'
          ]
        });
      }
      throw error;
    }
  }

  // PUT request helper
  public async put<T>(endpoint: string, data: any): Promise<T> {
    try {
      await this.ensureTokenLoaded();
      console.log(`Sending PUT request to: ${this.baseURL}${endpoint}`);
      console.log('Request data:', data);
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      const responseText = await response.text();
      console.log(`Response status: ${response.status}`);
      console.log(`Response text: ${responseText}`);
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || `API Error: ${response.status}`;
        } catch (e) {
          errorMessage = `API Error: ${response.status} - ${responseText || 'No response body'}`;
        }
        throw new Error(errorMessage);
      }

      try {
        return JSON.parse(responseText) as T;
      } catch (e) {
        throw new Error(`Error parsing response: ${responseText}`);
      }
    } catch (error) {
      console.error('API PUT request failed:', error);
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        console.error('Network error details:', {
          url: `${this.baseURL}${endpoint}`,
          possibleCauses: [
            '1. Backend server is not running',
            '2. Incorrect IP address in baseURL',
            '3. Device cannot connect to the specified IP',
            '4. Android emulator needs 10.0.2.2 instead of localhost',
            '5. Physical device needs your computer\'s local IP address'
          ]
        });
      }
      throw error;
    }
  }

  // DELETE request helper
  public async delete<T>(endpoint: string): Promise<T> {
    try {
      await this.ensureTokenLoaded();
      console.log(`Sending DELETE request to: ${this.baseURL}${endpoint}`);
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const responseText = await response.text();
      console.log(`Response status: ${response.status}`);
      console.log(`Response text: ${responseText}`);
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || `API Error: ${response.status}`;
        } catch (e) {
          errorMessage = `API Error: ${response.status} - ${responseText || 'No response body'}`;
        }
        throw new Error(errorMessage);
      }

      try {
        return JSON.parse(responseText) as T;
      } catch (e) {
        throw new Error(`Error parsing response: ${responseText}`);
      }
    } catch (error) {
      console.error('API DELETE request failed:', error);
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        console.error('Network error details:', {
          url: `${this.baseURL}${endpoint}`,
          possibleCauses: [
            '1. Backend server is not running',
            '2. Incorrect IP address in baseURL',
            '3. Device cannot connect to the specified IP',
            '4. Android emulator needs 10.0.2.2 instead of localhost',
            '5. Physical device needs your computer\'s local IP address'
          ]
        });
      }
      throw error;
    }
  }

  // POST request helper with FormData (for file uploads)
  public async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    try {
      await this.ensureTokenLoaded();
      console.log(`Sending FormData POST request to: ${this.baseURL}${endpoint}`);
      
      // Create headers without Content-Type so the browser sets it automatically with boundary
      const headers: Record<string, string> = {};
      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }
      console.log("Headers:", headers);
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: formData
      });

      const responseText = await response.text();
      console.log(`Response status: ${response.status}`);
      console.log(`Response text: ${responseText}`);
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || `API Error: ${response.status}`;
        } catch (e) {
          errorMessage = `API Error: ${response.status} - ${responseText || 'No response body'}`;
        }
        throw new Error(errorMessage);
      }

      try {
        return JSON.parse(responseText) as T;
      } catch (e) {
        throw new Error(`Error parsing response: ${responseText}`);
      }
    } catch (error) {
      console.error('API FormData POST request failed:', error);
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        console.error('Network error details:', {
          url: `${this.baseURL}${endpoint}`,
          possibleCauses: [
            '1. Backend server is not running',
            '2. Incorrect IP address in baseURL',
            '3. Device cannot connect to the specified IP',
            '4. Android emulator needs 10.0.2.2 instead of localhost',
            '5. Physical device needs your computer\'s local IP address'
          ]
        });
      }
      throw error;
    }
  }
  
  // Amount specific methods
  public async createAmount(money: string, screenshot?: ImageAsset): Promise<any> {
    const formData = new FormData();
    formData.append('money', money);
    
    if (screenshot) {
      // Append the image to the form data if available
      const file = {
        uri: screenshot.uri,
        type: screenshot.type || 'image/jpeg',
        name: screenshot.name || 'photo.jpg'
      };
      
      formData.append('screenshot', file as any);
    }
    console.log("Token enviado", this.token);
    return this.postFormData<any>('/amounts', formData);
  }
  
  public async getMyAmounts(): Promise<any> {
    return this.get<any>('/amounts/me');
  }

  // Get current user's loans
  public async getMyLoans(): Promise<any> {
    return this.get<any>('/loans/me');
  }
}

// Export a singleton instance
export const apiService = new ApiService();
