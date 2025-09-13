/**
 * SMS Formatter Utilities
 * Helper functions for formatting and validating SMS-related data
 */

export interface PhoneNumberInfo {
  original: string;
  formatted: string;
  display: string;
  isValid: boolean;
  countryCode: string;
  nationalNumber: string;
}

export interface SMSTemplateConfig {
  appName: string;
  codeLength: number;
  expirationMinutes: number;
  includeAppHash?: boolean;
}

class SMSFormatterUtils {
  private readonly COLOMBIA_COUNTRY_CODE = '+57';
  private readonly MOBILE_PREFIX_REGEX = /^3[0-9]/; // Colombian mobile numbers start with 3

  /**
   * Format Colombian phone number to standard format
   * @param phoneNumber - Raw phone number input
   * @returns Formatted phone number info
   */
  formatColombianPhone(phoneNumber: string): PhoneNumberInfo {
    // Remove all non-digit characters
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    
    let nationalNumber = digitsOnly;
    let isValid = false;

    // Handle different input formats
    if (digitsOnly.startsWith('57') && digitsOnly.length === 12) {
      // Format: 573XXXXXXXX (with country code)
      nationalNumber = digitsOnly.substring(2);
    } else if (digitsOnly.startsWith('3') && digitsOnly.length === 10) {
      // Format: 3XXXXXXXX (standard Colombian mobile)
      nationalNumber = digitsOnly;
    }

    // Validate Colombian mobile number
    if (nationalNumber.length === 10 && this.MOBILE_PREFIX_REGEX.test(nationalNumber)) {
      isValid = true;
    }

    // Create display format (XXX XXX XXXX)
    const displayFormat = isValid 
      ? `${nationalNumber.substring(0, 3)} ${nationalNumber.substring(3, 6)} ${nationalNumber.substring(6)}`
      : phoneNumber;

    return {
      original: phoneNumber,
      formatted: nationalNumber,
      display: displayFormat,
      isValid,
      countryCode: this.COLOMBIA_COUNTRY_CODE,
      nationalNumber
    };
  }

  /**
   * Validate Colombian phone number
   * @param phoneNumber - Phone number to validate
   * @returns True if valid Colombian mobile number
   */
  isValidColombianMobile(phoneNumber: string): boolean {
    const phoneInfo = this.formatColombianPhone(phoneNumber);
    return phoneInfo.isValid;
  }

  /**
   * Format phone number for display
   * @param phoneNumber - Raw phone number
   * @returns Formatted display string
   */
  formatForDisplay(phoneNumber: string): string {
    const phoneInfo = this.formatColombianPhone(phoneNumber);
    return phoneInfo.display;
  }

  /**
   * Format phone number for API/backend
   * @param phoneNumber - Raw phone number
   * @returns Clean 10-digit number or null if invalid
   */
  formatForAPI(phoneNumber: string): string | null {
    const phoneInfo = this.formatColombianPhone(phoneNumber);
    return phoneInfo.isValid ? phoneInfo.formatted : null;
  }

  /**
   * Generate SMS verification template
   * @param code - Verification code
   * @param config - SMS template configuration
   * @returns Formatted SMS message
   */
  generateVerificationSMS(code: string, config: SMSTemplateConfig): string {
    const { appName, expirationMinutes, includeAppHash } = config;
    
    let message = `Tu código de verificación para ${appName} es: ${code}`;
    
    if (expirationMinutes > 0) {
      message += `\n\nEste código expira en ${expirationMinutes} minuto${expirationMinutes > 1 ? 's' : ''}.`;
    }
    
    message += '\n\nNo compartas este código con nadie.';
    
    // Add app hash for SMS Retriever (Android)
    if (includeAppHash) {
      // This should be replaced with your actual app hash
      message += '\n\n@natiapp.com #1234567890AB';
    }
    
    return message;
  }

  /**
   * Extract verification code from SMS content
   * @param smsContent - Full SMS message content
   * @param codeLength - Expected code length (default: 4)
   * @returns Extracted code or null
   */
  extractVerificationCode(smsContent: string, codeLength: number = 4): string | null {
    if (!smsContent) return null;

    // Pattern for extracting codes of specific length
    const patterns = [
      // Exact length numeric code
      new RegExp(`\\b\\d{${codeLength}}\\b`),
      // Code with common prefixes
      new RegExp(`(?:código|code|verificación|verification)[:\\s]+([0-9]{${codeLength}})`, 'i'),
      // Code in common formats
      new RegExp(`([0-9]{${codeLength}})\\s*(?:es|is)\\s*(?:tu|your)`, 'i'),
    ];

    for (const pattern of patterns) {
      const match = smsContent.match(pattern);
      if (match) {
        const code = match[1] || match[0];
        if (code && code.length === codeLength && /^\d+$/.test(code)) {
          return code;
        }
      }
    }

    return null;
  }

  /**
   * Sanitize phone number input (remove unwanted characters)
   * @param input - Raw input
   * @returns Sanitized numeric string
   */
  sanitizePhoneInput(input: string): string {
    return input.replace(/[^\d]/g, '');
  }

  /**
   * Format phone input for user typing (adds spaces as they type)
   * @param input - Current input value
   * @returns Formatted input with spacing
   */
  formatPhoneInput(input: string): string {
    const digits = this.sanitizePhoneInput(input);
    
    if (digits.length === 0) return '';
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.substring(0, 3)} ${digits.substring(3)}`;
    if (digits.length <= 10) return `${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}`;
    
    // Limit to 10 digits
    return `${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6, 10)}`;
  }

  /**
   * Validate SMS verification code format
   * @param code - Code to validate
   * @param expectedLength - Expected code length
   * @returns Validation result
   */
  validateVerificationCode(code: string, expectedLength: number = 4): { 
    isValid: boolean; 
    error?: string 
  } {
    if (!code) {
      return { isValid: false, error: 'Código requerido' };
    }

    if (code.length !== expectedLength) {
      return { 
        isValid: false, 
        error: `El código debe tener ${expectedLength} dígitos` 
      };
    }

    if (!/^\d+$/.test(code)) {
      return { 
        isValid: false, 
        error: 'El código solo puede contener números' 
      };
    }

    return { isValid: true };
  }

  /**
   * Check if SMS content appears to be a verification SMS
   * @param smsContent - SMS message content
   * @param appName - App name to look for
   * @returns True if appears to be verification SMS
   */
  isVerificationSMS(smsContent: string, appName?: string): boolean {
    if (!smsContent) return false;

    const verificationKeywords = [
      'código', 'code', 'verificación', 'verification', 
      'confirmación', 'confirmation', 'OTP', 'PIN'
    ];

    const lowerContent = smsContent.toLowerCase();
    
    // Check for verification keywords
    const hasKeyword = verificationKeywords.some(keyword => 
      lowerContent.includes(keyword.toLowerCase())
    );

    // Check for numeric code pattern
    const hasNumericCode = /\b\d{4,8}\b/.test(smsContent);

    // Check for app name if provided
    const hasAppName = appName ? lowerContent.includes(appName.toLowerCase()) : true;

    return hasKeyword && hasNumericCode && hasAppName;
  }
}

export const smsFormatterUtils = new SMSFormatterUtils();
