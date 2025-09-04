// User Management Service
// This service handles user registration, authentication, and management
import { apiService } from './ApiService';

export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  isActive: boolean;
  registeredAt: Date;
  lastLogin?: Date;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface UserRegistrationResponse {
  success: boolean;
  message: string;
  user?: User;
  error?: string;
  token?: string;
}

export interface UserLoginResponse {
  success: boolean;
  message: string;
  user?: User;
  error?: string;
  token?: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  admin?: AdminUser;
  error?: string;
  token?: string;
}

export interface UserListResponse {
  success: boolean;
  users?: User[];
  error?: string;
}

export interface UserStatusToggleResponse {
  success: boolean;
  message: string;
  error?: string;
}

class UserManagementService {
  private isDevelopment: boolean = false; // Already set to false to use the actual backend
  private users: Map<string, User> = new Map(); // Mock storage for development
  private admins: Map<string, AdminUser> = new Map(); // Mock admin storage

  constructor() {
    // Initialize with demo admin
    this.admins.set('admin@natiapp.com', {
      id: 'admin-1',
      name: 'Administrator',
      email: 'admin@natiapp.com',
      role: 'admin'
    });
  }

  /**
   * Register a new user
   * @param name - User's full name
   * @param phoneNumber - User's phone number
   * @param password - User's password
   * @returns Promise with registration response
   */
  async registerUser(name: string, phoneNumber: string, password: string = "default123"): Promise<UserRegistrationResponse> {
    try {
      if (this.isDevelopment) {
        // In development, simulate API call
        return new Promise((resolve) => {
          setTimeout(() => {
            const user: User = {
              id: `user_${Date.now()}`,
              name,
              phoneNumber,
              isActive: true,
              registeredAt: new Date(),
            };

            this.users.set(phoneNumber, user);

            resolve({
              success: true,
              message: 'Usuario registrado exitosamente',
              user
            });
          }, 500);
        });
      } else {
        // Use the real backend API
        const response = await apiService.post<UserRegistrationResponse>('/auth/register', {
          name,
          phoneNumber,
          password
        });
        
        // Store the token if registration was successful
        if (response.success && response.token) {
          await apiService.setToken(response.token);
        }
        
        return response;
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error al registrar usuario',
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  /**
   * Login user
   * @param phoneNumber - User's phone number
   * @param password - User's password
   * @returns Promise with login response
   */
  async loginUser(phoneNumber: string, password: string = "default123"): Promise<UserLoginResponse> {
    try {
      if (this.isDevelopment) {
        // Mock login for development
        return new Promise((resolve) => {
          setTimeout(() => {
            const user = this.users.get(phoneNumber);
            if (user) {
              user.lastLogin = new Date();
              this.users.set(phoneNumber, user);
              
              resolve({
                success: true,
                message: 'Login exitoso',
                user
              });
            } else {
              resolve({
                success: false,
                message: 'Usuario no encontrado',
                error: 'User not found'
              });
            }
          }, 500);
        });
      } else {
        // Use the real backend API
        const response = await apiService.post<UserLoginResponse>('/auth/login', {
          phoneNumber,
          password
        });
        
        // Store the token if login was successful
        if (response.success && response.token) {
          await apiService.setToken(response.token);
          // Also update last login timestamp
          await this.updateLastLogin(phoneNumber);
        }
        
        return response;
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de autenticación',
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  /**
   * Update user's last login timestamp
   * @param phoneNumber - User's phone number
   * @returns Promise with update result
   */
  async updateLastLogin(phoneNumber: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.isDevelopment) {
        // In development, simulate API call
        return new Promise((resolve) => {
          setTimeout(() => {
            const user = this.users.get(phoneNumber);
            if (user) {
              user.lastLogin = new Date();
              this.users.set(phoneNumber, user);
            }

            resolve({ success: true });
          }, 200);
        });
      } else {
        // This functionality is now handled by the backend during login
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update last login'
      };
    }
  }

  /**
   * Admin login
   * @param email - Admin email
   * @param password - Admin password
   * @returns Promise with admin login response
   */
  async adminLogin(email: string, password: string): Promise<AdminLoginResponse> {
    try {
      if (this.isDevelopment) {
        // In development, simulate API call
        return new Promise((resolve) => {
          setTimeout(() => {
            // Demo credentials
            if (email === 'admin@natiapp.com' && password === 'admin123') {
              const admin = this.admins.get(email);
              resolve({
                success: true,
                message: 'Login exitoso',
                admin
              });
            } else {
              resolve({
                success: false,
                message: 'Credenciales incorrectas',
                error: 'Invalid credentials'
              });
            }
          }, 1000);
        });
      } else {
        // Use the real backend API
        const response = await apiService.post<AdminLoginResponse>('/auth/admin-login', {
          email,
          password
        });
        
        // Store the token if login was successful
        if (response.success && response.token) {
          await apiService.setToken(response.token);
        }
        
        return response;
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión',
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  /**
   * Get all users (admin only)
   * @returns Promise with user list response
   */
  async getAllUsers(): Promise<UserListResponse> {
    try {
      if (this.isDevelopment) {
        // In development, simulate API call
        return new Promise((resolve) => {
          setTimeout(() => {
            const users = Array.from(this.users.values());
            resolve({
              success: true,
              users
            });
          }, 500);
        });
      } else {
        // Use the real backend API
        return await apiService.get<UserListResponse>('/users');
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch users'
      };
    }
  }

  /**
   * Toggle user status (activate/deactivate)
   * @param userId - User ID to toggle
   * @returns Promise with toggle response
   */
  async toggleUserStatus(userId: string): Promise<UserStatusToggleResponse> {
    try {
      if (this.isDevelopment) {
        // In development, simulate API call
        return new Promise((resolve) => {
          setTimeout(() => {
            // Find user by ID
            let foundUser: User | undefined;
            for (const user of this.users.values()) {
              if (user.id === userId) {
                foundUser = user;
                break;
              }
            }

            if (foundUser) {
              foundUser.isActive = !foundUser.isActive;
              this.users.set(foundUser.phoneNumber, foundUser);
              
              resolve({
                success: true,
                message: `Usuario ${foundUser.isActive ? 'activado' : 'desactivado'} exitosamente`
              });
            } else {
              resolve({
                success: false,
                message: 'Usuario no encontrado',
                error: 'User not found'
              });
            }
          }, 500);
        });
      } else {
        // Use the real backend API
        return await apiService.put<UserStatusToggleResponse>(`/users/${userId}/status`, {});
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error al cambiar estado del usuario',
        error: error instanceof Error ? error.message : 'Toggle status failed'
      };
    }
  }

  /**
   * Get user by phone number
   * @param phoneNumber - User's phone number
   * @returns Promise with user if found, undefined otherwise
   */
  async getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    try {
      if (this.isDevelopment) {
        return this.users.get(phoneNumber);
      } else {
        // Use the real backend API
        const response = await apiService.get<{success: boolean; user?: User}>(`/users/phone/${phoneNumber}`);
        return response.success ? response.user : undefined;
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  /**
   * Check if user exists
   * @param phoneNumber - User's phone number
   * @returns Promise with boolean indicating if user exists
   */
  async userExists(phoneNumber: string): Promise<boolean> {
    try {
      if (this.isDevelopment) {
        return this.users.has(phoneNumber);
      } else {
        const user = await this.getUserByPhoneNumber(phoneNumber);
        return !!user;
      }
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }

  /**
   * Log out user
   * @returns Promise
   */
  async logout(): Promise<void> {
    if (!this.isDevelopment) {
      // Clear token from storage
      await apiService.clearToken();
    }
  }
}

export const userManagementService = new UserManagementService();
