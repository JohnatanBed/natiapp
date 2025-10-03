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

export interface CheckUserResponse {
  success: boolean;
  exists: boolean;
  message: string;
  user?: {
    id: string;
    phoneNumber: string;
  };
  error?: string;
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
   * Normalize phone number to ensure consistency
   * @param phoneNumber - Raw phone number
   * @returns Normalized phone number (10 digits only)
   */
  private normalizePhoneNumber(phoneNumber: string): string {
    // Remove all non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // If it's a 10-digit number starting with 3 (Colombian mobile), return as is
    if (cleaned.startsWith('3') && cleaned.length === 10) {
      return cleaned;
    }
    
    // For any other 10-digit number, return as is
    if (cleaned.length === 10) {
      return cleaned;
    }
    
    // Return the cleaned number if we can't determine the format
    return cleaned;
  }

  /**
   * Register a new user
   * @param name - User's full name
   * @param phoneNumber - User's phone number
   * @param password - User's password
   * @returns Promise with registration response
   */
  async registerUser(name: string, phoneNumber: string, password: string): Promise<UserRegistrationResponse> {
    try {
      // Validate input parameters
      if (!name?.trim()) {
        return {
          success: false,
          message: 'El nombre es requerido',
          error: 'INVALID_NAME'
        };
      }

      if (!phoneNumber?.trim()) {
        return {
          success: false,
          message: 'El número de teléfono es requerido',
          error: 'INVALID_PHONE'
        };
      }

      if (!password?.trim()) {
        return {
          success: false,
          message: 'La contraseña es requerida',
          error: 'INVALID_PASSWORD'
        };
      }

      // Normalize phone number for consistency
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
      console.log('[UserManagementService] Registering user with normalized phone:', normalizedPhone, 'original:', phoneNumber);
      
      // Additional phone validation
      if (normalizedPhone.length !== 10 || !normalizedPhone.startsWith('3')) {
        return {
          success: false,
          message: 'El número de celular debe ser válido (10 dígitos, comenzando con 3)',
          error: 'INVALID_PHONE_FORMAT'
        };
      }

      if (this.isDevelopment) {
        // In development, simulate API call
        return new Promise((resolve) => {
          setTimeout(() => {
            const user: User = {
              id: `user_${Date.now()}`,
              name: name.trim(),
              phoneNumber: normalizedPhone,
              isActive: true,
              registeredAt: new Date(),
            };

            this.users.set(normalizedPhone, user);

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
          name: name.trim(),
          phoneNumber: normalizedPhone,
          password
        });
        
        // Store the token if registration was successful
        if (response.success && response.token) {
          await apiService.setToken(response.token);
        }
        
        return response;
      }
    } catch (error) {
      console.error('[UserManagementService] Registration error:', error);
      
      // Handle specific error types
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        return {
          success: false,
          message: 'Error de conexión. Verifica tu conexión a internet.',
          error: 'NETWORK_ERROR'
        };
      }

      if (error instanceof Error && error.message.includes('timeout')) {
        return {
          success: false,
          message: 'El servidor está tardando en responder. Intenta nuevamente.',
          error: 'TIMEOUT_ERROR'
        };
      }

      return {
        success: false,
        message: 'Error al registrar usuario. Intenta nuevamente.',
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
  async checkUserExists(phoneNumber: string): Promise<CheckUserResponse> {
    try {
      // Validate input parameters
      if (!phoneNumber?.trim()) {
        return {
          success: false,
          exists: false,
          message: 'El número de teléfono es requerido',
          error: 'INVALID_PHONE'
        };
      }

      // Normalize phone number for consistency
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber); // Asegúrate de usar 'this'
      console.log('[UserManagementService] Checking user existence for normalized phone:', normalizedPhone, 'original:', phoneNumber);
      
      // Additional phone validation
      if (normalizedPhone.length !== 10 || !normalizedPhone.startsWith('3')) {
        return {
          success: false,
          exists: false,
          message: 'El número de celular debe ser válido (10 dígitos, comenzando con 3)',
          error: 'INVALID_PHONE_FORMAT'
        };
      }

      if (this.isDevelopment) {
        // Mock user check for development
        return new Promise((resolve) => {
          setTimeout(() => {
            try {
              const user = this.users.get(normalizedPhone);
              if (user) {
                resolve({
                  success: true,
                  exists: true,
                  message: 'Usuario encontrado',
                  user: {
                    id: user.id,
                    phoneNumber: user.phoneNumber
                  }
                });
              } else {
                resolve({
                  success: true,
                  exists: false,
                  message: 'Usuario no encontrado'
                });
              }
            } catch (devError) {
              console.error('[UserManagementService] Development mode error:', devError);
              resolve({
                success: false,
                exists: false,
                message: 'Error interno del sistema',
                error: 'DEVELOPMENT_ERROR'
              });
            }
          }, 300);
        });
      } else {
        // Use the real backend API
        console.log('[UserManagementService] Making API call to check user existence');
        const response = await apiService.post<CheckUserResponse>('/auth/check-user', {
          phoneNumber: normalizedPhone
        });
        
        console.log('[UserManagementService] API Response for user check:', response);
        
        // Ensure the response has the expected structure
        if (!response || typeof response.success !== 'boolean') {
          console.error('[UserManagementService] Invalid response structure:', response);
          return {
            success: false,
            exists: false,
            message: 'Error en la respuesta del servidor',
            error: 'INVALID_RESPONSE'
          };
        }
        
        return response;
      }
    } catch (error) {
      console.error('[UserManagementService] Error checking user existence:', error);
      
      // Handle specific error types
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        return {
          success: false,
          exists: false,
          message: 'Error de conexión. Verifica tu conexión a internet.',
          error: 'NETWORK_ERROR'
        };
      }

      if (error instanceof Error && error.message.includes('timeout')) {
        return {
          success: false,
          exists: false,
          message: 'El servidor está tardando en responder. Intenta nuevamente.',
          error: 'TIMEOUT_ERROR'
        };
      }

      if (error instanceof Error && error.message.includes('500')) {
        return {
          success: false,
          exists: false,
          message: 'Error interno del servidor. Intenta más tarde.',
          error: 'SERVER_ERROR'
        };
      }

      return {
        success: false,
        exists: false,
        message: 'Error al verificar usuario. Intenta nuevamente.',
        error: error instanceof Error ? error.message : 'Check user failed'
      };
    }
  }

  async loginUser(phoneNumber: string, password: string = "default123"): Promise<UserLoginResponse> {
    try {
      // Validate input parameters
      if (!phoneNumber?.trim()) {
        return {
          success: false,
          message: 'El número de teléfono es requerido',
          error: 'INVALID_PHONE'
        };
      }

      if (!password?.trim()) {
        return {
          success: false,
          message: 'La contraseña es requerida',
          error: 'INVALID_PASSWORD'
        };
      }

      // Normalize phone number for consistency
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
      console.log('[UserManagementService] Login attempt with normalized phone:', normalizedPhone, 'original:', phoneNumber);
      
      // Additional phone validation
      if (normalizedPhone.length !== 10 || !normalizedPhone.startsWith('3')) {
        return {
          success: false,
          message: 'El número de celular debe ser válido (10 dígitos, comenzando con 3)',
          error: 'INVALID_PHONE_FORMAT'
        };
      }

      if (this.isDevelopment) {
        // Mock login for development
        return new Promise((resolve) => {
          setTimeout(() => {
            try {
              const user = this.users.get(normalizedPhone);
              if (user) {
                user.lastLogin = new Date();
                this.users.set(normalizedPhone, user);
                
                resolve({
                  success: true,
                  message: 'Login exitoso',
                  user
                });
              } else {
                resolve({
                  success: false,
                  message: 'Usuario no encontrado. Verifica tu número o regístrate.',
                  error: 'USER_NOT_FOUND'
                });
              }
            } catch (devError) {
              console.error('[UserManagementService] Development mode error:', devError);
              resolve({
                success: false,
                message: 'Error interno del sistema',
                error: 'DEVELOPMENT_ERROR'
              });
            }
          }, 500);
        });
      } else {
        // Use the real backend API
        const response = await apiService.post<UserLoginResponse>('/auth/login', {
          phoneNumber: normalizedPhone,
          password: password.trim(),
        });
        
        // Store the token if login was successful
        if (response.success && response.token) {
          await apiService.setToken(response.token);
          // Also update last login timestamp
          await this.updateLastLogin(normalizedPhone);
        }
        
        return response;
      }
    } catch (error) {
      console.error('[UserManagementService] Login error:', error);
      
      // Handle specific error types
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        return {
          success: false,
          message: 'Error de conexión. Verifica tu conexión a internet.',
          error: 'NETWORK_ERROR'
        };
      }

      if (error instanceof Error && error.message.includes('timeout')) {
        return {
          success: false,
          message: 'El servidor está tardando en responder. Intenta nuevamente.',
          error: 'TIMEOUT_ERROR'
        };
      }

      if (error instanceof Error && error.message.includes('401')) {
        return {
          success: false,
          message: 'Credenciales incorrectas. Verifica tu PIN.',
          error: 'INVALID_CREDENTIALS'
        };
      }

      if (error instanceof Error && error.message.includes('500')) {
        return {
          success: false,
          message: 'Error interno del servidor. Intenta más tarde.',
          error: 'SERVER_ERROR'
        };
      }

      return {
        success: false,
        message: 'Error de autenticación. Intenta nuevamente.',
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
      // Validate input parameters
      if (!email?.trim()) {
        return {
          success: false,
          message: 'El email es requerido',
          error: 'INVALID_EMAIL'
        };
      }

      if (!password?.trim()) {
        return {
          success: false,
          message: 'La contraseña es requerida',
          error: 'INVALID_PASSWORD'
        };
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          message: 'Por favor ingresa un email válido',
          error: 'INVALID_EMAIL_FORMAT'
        };
      }

      if (this.isDevelopment) {
        // In development, simulate API call
        return new Promise((resolve) => {
          setTimeout(() => {
            try {
              // Demo credentials
              if (email.toLowerCase() === 'admin@natiapp.com' && password === 'admin123') {
                const admin = this.admins.get(email.toLowerCase());
                resolve({
                  success: true,
                  message: 'Login exitoso',
                  admin
                });
              } else {
                resolve({
                  success: false,
                  message: 'Credenciales incorrectas. Verifica tu email y contraseña.',
                  error: 'INVALID_CREDENTIALS'
                });
              }
            } catch (devError) {
              console.error('[UserManagementService] Development mode error:', devError);
              resolve({
                success: false,
                message: 'Error interno del sistema',
                error: 'DEVELOPMENT_ERROR'
              });
            }
          }, 1000);
        });
      } else {
        // Use the real backend API
        const response = await apiService.post<AdminLoginResponse>('/auth/admin-login', {
          email: email.trim().toLowerCase(),
          password: password.trim()
        });
        
        // Store the token if login was successful
        if (response.success && response.token) {
          await apiService.setToken(response.token);
        }
        
        return response;
      }
    } catch (error) {
      console.error('[UserManagementService] Admin login error:', error);
      
      // Handle specific error types
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        return {
          success: false,
          message: 'Error de conexión. Verifica tu conexión a internet.',
          error: 'NETWORK_ERROR'
        };
      }

      if (error instanceof Error && error.message.includes('timeout')) {
        return {
          success: false,
          message: 'El servidor está tardando en responder. Intenta nuevamente.',
          error: 'TIMEOUT_ERROR'
        };
      }

      if (error instanceof Error && error.message.includes('401')) {
        return {
          success: false,
          message: 'Credenciales incorrectas. Verifica tu email y contraseña.',
          error: 'INVALID_CREDENTIALS'
        };
      }

      if (error instanceof Error && error.message.includes('500')) {
        return {
          success: false,
          message: 'Error interno del servidor. Intenta más tarde.',
          error: 'SERVER_ERROR'
        };
      }

      return {
        success: false,
        message: 'Error al iniciar sesión. Intenta nuevamente.',
        error: error instanceof Error ? error.message : 'Admin login failed'
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
            try {
              const users = Array.from(this.users.values());
              resolve({
                success: true,
                users
              });
            } catch (devError) {
              console.error('[UserManagementService] Development mode error:', devError);
              resolve({
                success: false,
                error: 'Error interno del sistema'
              });
            }
          }, 500);
        });
      } else {
        // Use the real backend API
        const response = await apiService.get<UserListResponse>('/users');
        return response;
      }
    } catch (error) {
      console.error('[UserManagementService] Error fetching users:', error);
      
      // Handle specific error types
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        return {
          success: false,
          error: 'Error de conexión. Verifica tu conexión a internet.'
        };
      }

      if (error instanceof Error && error.message.includes('timeout')) {
        return {
          success: false,
          error: 'El servidor está tardando en responder. Intenta nuevamente.'
        };
      }

      if (error instanceof Error && error.message.includes('403')) {
        return {
          success: false,
          error: 'No tienes permisos para ver esta información.'
        };
      }

      if (error instanceof Error && error.message.includes('500')) {
        return {
          success: false,
          error: 'Error interno del servidor. Intenta más tarde.'
        };
      }

      return {
        success: false,
        error: 'Error al obtener usuarios. Intenta nuevamente.'
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
      // Validate input parameters
      if (!userId?.trim()) {
        return {
          success: false,
          message: 'El ID del usuario es requerido',
          error: 'INVALID_USER_ID'
        };
      }

      if (this.isDevelopment) {
        // In development, simulate API call
        return new Promise((resolve) => {
          setTimeout(() => {
            try {
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
                  error: 'USER_NOT_FOUND'
                });
              }
            } catch (devError) {
              console.error('[UserManagementService] Development mode error:', devError);
              resolve({
                success: false,
                message: 'Error interno del sistema',
                error: 'DEVELOPMENT_ERROR'
              });
            }
          }, 500);
        });
      } else {
        // Use the real backend API
        const response = await apiService.put<UserStatusToggleResponse>(`/users/${userId}/status`, {});
        return response;
      }
    } catch (error) {
      console.error('[UserManagementService] Error toggling user status:', error);
      
      // Handle specific error types
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        return {
          success: false,
          message: 'Error de conexión. Verifica tu conexión a internet.',
          error: 'NETWORK_ERROR'
        };
      }

      if (error instanceof Error && error.message.includes('timeout')) {
        return {
          success: false,
          message: 'El servidor está tardando en responder. Intenta nuevamente.',
          error: 'TIMEOUT_ERROR'
        };
      }

      if (error instanceof Error && error.message.includes('404')) {
        return {
          success: false,
          message: 'Usuario no encontrado.',
          error: 'USER_NOT_FOUND'
        };
      }

      if (error instanceof Error && error.message.includes('403')) {
        return {
          success: false,
          message: 'No tienes permisos para realizar esta acción.',
          error: 'FORBIDDEN'
        };
      }

      if (error instanceof Error && error.message.includes('500')) {
        return {
          success: false,
          message: 'Error interno del servidor. Intenta más tarde.',
          error: 'SERVER_ERROR'
        };
      }

      return {
        success: false,
        message: 'Error al cambiar estado del usuario. Intenta nuevamente.',
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
