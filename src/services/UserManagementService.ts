// User Management Service
// This service handles user registration, authentication, and management

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
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  admin?: AdminUser;
  error?: string;
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
  private baseURL: string = 'https://your-backend-api.com/api'; // Replace with your backend URL
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
   * @returns Promise with registration response
   */
  async registerUser(name: string, phoneNumber: string): Promise<UserRegistrationResponse> {
    try {
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
    } catch (error) {
      return {
        success: false,
        message: 'Error al registrar usuario',
        error: 'Registration failed'
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
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión',
        error: 'Login failed'
      };
    }
  }

  /**
   * Get all users (admin only)
   * @returns Promise with user list response
   */
  async getAllUsers(): Promise<UserListResponse> {
    try {
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
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch users'
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
    } catch (error) {
      return {
        success: false,
        message: 'Error al cambiar estado del usuario',
        error: 'Toggle status failed'
      };
    }
  }

  /**
   * Get user by phone number
   * @param phoneNumber - User's phone number
   * @returns User if found, undefined otherwise
   */
  getUserByPhoneNumber(phoneNumber: string): User | undefined {
    return this.users.get(phoneNumber);
  }

  /**
   * Check if user exists
   * @param phoneNumber - User's phone number
   * @returns boolean indicating if user exists
   */
  userExists(phoneNumber: string): boolean {
    return this.users.has(phoneNumber);
  }
}

export const userManagementService = new UserManagementService();
