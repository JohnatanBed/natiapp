// SMS Authentication Service
// This service handles phone number verification via SMS

export interface SMSResponse {
  success: boolean;
  message: string;
  sessionId?: string;
  error?: string;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  isValid: boolean;
  error?: string;
}

class SMSAuthService {
  private baseURL: string = 'https://your-backend-api.com/api'; // Replace with your backend URL
  private sessionStorage: Map<string, { code: string; expiresAt: number; attempts: number }> = new Map();
  private isDevelopment: boolean = true; // Set to false when you have a real backend

  /**
   * Check if we're in development mode
   */
  private isDevMode(): boolean {
    // Check multiple ways to determine if we're in development
    try {
      return this.isDevelopment || (typeof __DEV__ !== 'undefined' && __DEV__);
    } catch {
      return this.isDevelopment;
    }
  }

  /**
   * Send SMS verification code to phone number
   * @param phoneNumber - Phone number in 10-digit format (XXXXXXXXXX)
   * @returns Promise with SMS response
   */
  async sendVerificationCode(phoneNumber: string): Promise<SMSResponse> {
    try {
      // Validate phone number format
      if (!this.isValidPhoneNumber(phoneNumber)) {
        return {
          success: false,
          message: 'Número de teléfono inválido',
          error: 'INVALID_PHONE_NUMBER'
        };
      }

      // For development/testing - simulate SMS sending
      if (this.isDevMode()) {
        console.log('[SMS Service] Using development mode - simulating SMS');
        return this.simulateSMSSending(phoneNumber);
      }

      // Production implementation - integrate with your SMS service
      const response = await fetch(`${this.baseURL}/sms/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber, // Now sending 10-digit format
          countryCode: '+57', // Colombia (implicit for all numbers)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: 'Código enviado exitosamente',
          sessionId: data.sessionId,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al enviar SMS',
          error: data.error,
        };
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      return {
        success: false,
        message: 'Error de conexión. Inténtalo de nuevo.',
        error: 'NETWORK_ERROR',
      };
    }
  }

  /**
   * Verify SMS code
   * @param phoneNumber - Phone number
   * @param code - 4-digit verification code
   * @param sessionId - Session ID from SMS sending
   * @returns Promise with verification response
   */
  async verifyCode(phoneNumber: string, code: string, sessionId?: string): Promise<VerificationResponse> {
    try {
      // For development/testing
      if (this.isDevMode()) {
        console.log('[SMS Service] Using development mode - simulating code verification');
        return this.simulateCodeVerification(phoneNumber, code);
      }

      // Production implementation
      const response = await fetch(`${this.baseURL}/sms/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          code: code,
          sessionId: sessionId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: 'Código verificado correctamente',
          isValid: data.isValid,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al verificar código',
          isValid: false,
          error: data.error,
        };
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      return {
        success: false,
        message: 'Error de conexión. Inténtalo de nuevo.',
        isValid: false,
        error: 'NETWORK_ERROR',
      };
    }
  }

  /**
   * Validate phone number format
   * @param phoneNumber - Phone number to validate
   * @returns boolean
   */
  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Colombian phone number validation - only 10 digits
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Accept only 10-digit numbers starting with 3 (Colombian mobile)
    if (cleaned.length === 10 && cleaned.startsWith('3')) {
      return true;
    }
    
    return false;
  }

  /**
   * Format phone number to standard
   * @param phoneNumber - Raw phone number
   * @returns Formatted phone number (10 digits only)
   */
  formatPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Return only the 10-digit number
    if (cleaned.startsWith('3') && cleaned.length === 10) {
      return cleaned;
    }
    
    // If it starts with 57, remove the country code
    if (cleaned.startsWith('57') && cleaned.length === 12) {
      return cleaned.substring(2);
    }
    
    return phoneNumber;
  }

  /**
   * Development/Testing: Simulate SMS sending
   */
  private simulateSMSSending(phoneNumber: string): Promise<SMSResponse> {
    return new Promise((resolve) => {
      console.log('[SMS Service] Simulating SMS sending for:', phoneNumber);
      
      setTimeout(() => {
        // Generate a random 4-digit code
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        const sessionId = `session_${Date.now()}`;
        
        // Store in memory for verification (in production, this would be in your backend)
        this.sessionStorage.set(phoneNumber, {
          code: code,
          expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
          attempts: 0,
        });

        console.log(`[SMS Service] Generated code for ${phoneNumber}: ${code}`); // Remove in production
        console.log(`[SMS Service] Session ID: ${sessionId}`);
        
        resolve({
          success: true,
          message: 'Código enviado exitosamente',
          sessionId: sessionId,
        });
      }, 1000); // Simulate network delay
    });
  }

  /**
   * Development/Testing: Simulate code verification
   */
  private simulateCodeVerification(phoneNumber: string, code: string): Promise<VerificationResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const session = this.sessionStorage.get(phoneNumber);
        
        if (!session) {
          resolve({
            success: false,
            message: 'Sesión expirada. Solicita un nuevo código.',
            isValid: false,
            error: 'SESSION_NOT_FOUND',
          });
          return;
        }

        if (Date.now() > session.expiresAt) {
          this.sessionStorage.delete(phoneNumber);
          resolve({
            success: false,
            message: 'Código expirado. Solicita un nuevo código.',
            isValid: false,
            error: 'CODE_EXPIRED',
          });
          return;
        }

        session.attempts += 1;

        if (session.attempts > 3) {
          this.sessionStorage.delete(phoneNumber);
          resolve({
            success: false,
            message: 'Demasiados intentos fallidos. Solicita un nuevo código.',
            isValid: false,
            error: 'TOO_MANY_ATTEMPTS',
          });
          return;
        }

        if (session.code === code) {
          this.sessionStorage.delete(phoneNumber);
          resolve({
            success: true,
            message: 'Código verificado correctamente',
            isValid: true,
          });
        } else {
          resolve({
            success: false,
            message: `Código incorrecto. Intentos restantes: ${4 - session.attempts}`,
            isValid: false,
            error: 'INVALID_CODE',
          });
        }
      }, 500);
    });
  }

  /**
   * Clear expired sessions (cleanup)
   */
  clearExpiredSessions(): void {
    const now = Date.now();
    for (const [phoneNumber, session] of this.sessionStorage.entries()) {
      if (now > session.expiresAt) {
        this.sessionStorage.delete(phoneNumber);
      }
    }
  }

  /**
   * Get service status for debugging
   */
  getServiceStatus(): { isDevelopment: boolean; devMode: boolean; sessionsCount: number; baseURL: string } {
    return {
      isDevelopment: this.isDevelopment,
      devMode: this.isDevMode(),
      sessionsCount: this.sessionStorage.size,
      baseURL: this.baseURL
    };
  }
}

export const smsAuthService = new SMSAuthService();
