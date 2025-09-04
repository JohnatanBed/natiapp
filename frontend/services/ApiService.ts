// API Service to interact with our backend
// This service handles common operations with our backend API
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
  // Opciones de URL para diferentes entornos:
  // 1. Localhost (para desarrollo web): 'http://localhost:5000/api'
  // 2. Emulador Android: 'http://10.0.2.2:5000/api'
  // 3. IP de tu máquina (para dispositivos reales): 'http://192.168.1.XX:5000/api'
  // IMPORTANTE: Para dispositivos físicos, cambia esta URL a la IP de tu máquina
  private baseURL: string = 'http://192.168.1.11:5000/api'; // Configurado para dispositivo físico
  private token: string | null = null;
  
  // Método para cambiar la URL base en tiempo de ejecución
  public setBaseURL(url: string): void {
    if (!url.endsWith('/api')) {
      // Asegurarnos de que la URL termine con /api
      this.baseURL = url.endsWith('/') ? `${url}api` : `${url}/api`;
    } else {
      this.baseURL = url;
    }
    console.log(`API base URL actualizada a: ${this.baseURL}`);
  }
  
  // Método para obtener la URL base actual
  public getBaseURL(): string {
    return this.baseURL;
  }

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
}

// Export a singleton instance
export const apiService = new ApiService();
