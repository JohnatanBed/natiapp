import AsyncStorage from '@react-native-async-storage/async-storage';

interface ImageAsset {
  uri: string;
  type?: string;
  name?: string;
}

class ApiService {

private baseURL: string = 'https://natiapp.onrender.com/api';

  private token: string | null = null;

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

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

  public async setToken(token: string): Promise<void> {
    this.token = token;
    try {
      await AsyncStorage.setItem('natiapp_token', token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  public async clearToken(): Promise<void> {
    this.token = null;
    try {
      await AsyncStorage.removeItem('natiapp_token');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

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

  public async get<T>(endpoint: string): Promise<T> {
    try {
      await this.ensureTokenLoaded();
      console.log(`[ApiService] GET ${this.baseURL}${endpoint}`);
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const responseText = await response.text();
      
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
      console.error('API GET failed:', error);
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        console.error('Network error - Check backend connection');
      }
      throw error;
    }
  }

  public async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      await this.ensureTokenLoaded();
      console.log(`[ApiService] POST ${this.baseURL}${endpoint}`);
      
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
      console.error('API POST failed:', error);
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        console.error('Network error - Check backend connection');
      }
      throw error;
    }
  }

  public async put<T>(endpoint: string, data: any): Promise<T> {
    try {
      await this.ensureTokenLoaded();
      console.log(`[ApiService] PUT ${this.baseURL}${endpoint}`);
      
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
      console.error('API PUT failed:', error);
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        console.error('Network error - Check backend connection');
      }
      throw error;
    }
  }

  public async delete<T>(endpoint: string): Promise<T> {
    try {
      await this.ensureTokenLoaded();
      console.log(`[ApiService] DELETE ${this.baseURL}${endpoint}`);
      
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
      console.error('API DELETE failed:', error);
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        console.error('Network error - Check backend connection');
      }
      throw error;
    }
  }

  public async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    try {
      await this.ensureTokenLoaded();
      console.log(`[ApiService] POST FormData ${this.baseURL}${endpoint}`);
      
      const headers: Record<string, string> = {};
      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }
      
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
      console.error('API FormData POST failed:', error);
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        console.error('Network error - Check backend connection');
      }
      throw error;
    }
  }
  
  public async createAmount(money: string, screenshot?: ImageAsset): Promise<any> {
    const formData = new FormData();
    formData.append('money', money);
    
    if (screenshot) {
      const file = {
        uri: screenshot.uri,
        type: screenshot.type || 'image/jpeg',
        name: screenshot.name || 'photo.jpg'
      };
      
      formData.append('screenshot', file as any);
    }
    return this.postFormData<any>('/amounts', formData);
  }
  
  public async getMyAmounts(): Promise<any> {
    return this.get<any>('/amounts/me');
  }

  public async getMyLoans(): Promise<any> {
    return this.get<any>('/loans/me');
  }
}

export const apiService = new ApiService();
