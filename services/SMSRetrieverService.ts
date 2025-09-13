import { NativeModules, Platform } from 'react-native';
import RNSmsRetriever from 'react-native-sms-retriever';

export interface SMSRetrieverResponse {
  success: boolean;
  message?: string;
  sms?: string;
  error?: string;
}

export interface AppSignature {
  appSignature: string;
  packageName: string;
}

class SMSRetrieverService {
  private isListening: boolean = false;
  private currentListener: any = null;

  /**
   * Get app signature for SMS retrieval
   * Required for Android SMS Retriever API
   */
  async getAppSignature(): Promise<AppSignature | null> {
    try {
      if (Platform.OS !== 'android') {
        console.log('[SMSRetriever] iOS not supported for SMS retriever');
        return null;
      }

      const signatures = await RNSmsRetriever.getAppSignature();
      if (signatures && signatures.length > 0) {
        return {
          appSignature: signatures[0],
          packageName: 'com.natiapp' // Replace with your actual package name
        };
      }
      return null;
    } catch (error) {
      console.error('[SMSRetriever] Error getting app signature:', error);
      return null;
    }
  }

  /**
   * Start listening for SMS messages
   * @param timeout - Timeout in milliseconds (default: 5 minutes)
   */
  async startSMSListener(timeout: number = 5 * 60 * 1000): Promise<SMSRetrieverResponse> {
    try {
      if (Platform.OS !== 'android') {
        return {
          success: false,
          error: 'SMS_RETRIEVER_NOT_SUPPORTED',
          message: 'SMS Retriever only supported on Android'
        };
      }

      if (this.isListening) {
        console.log('[SMSRetriever] Already listening for SMS');
        return {
          success: true,
          message: 'Already listening for SMS'
        };
      }

      console.log('[SMSRetriever] Starting SMS listener with timeout:', timeout);
      
      // Start SMS retriever
      const started = await RNSmsRetriever.requestPhoneNumber();
      
      if (started) {
        this.isListening = true;
        console.log('[SMSRetriever] SMS listener started successfully');
        
        return {
          success: true,
          message: 'SMS listener started'
        };
      } else {
        return {
          success: false,
          error: 'FAILED_TO_START',
          message: 'Failed to start SMS listener'
        };
      }
    } catch (error) {
      console.error('[SMSRetriever] Error starting SMS listener:', error);
      return {
        success: false,
        error: 'START_LISTENER_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Listen for incoming SMS with verification code
   * @param callback - Callback function to handle received SMS
   * @param codePattern - Regex pattern to extract code (default: 4-digit code)
   */
  listenForVerificationSMS(
    callback: (code: string | null, fullSMS?: string) => void,
    codePattern: RegExp = /\b\d{4}\b/
  ): void {
    try {
      if (Platform.OS !== 'android') {
        console.log('[SMSRetriever] SMS listening not available on iOS');
        callback(null);
        return;
      }

      // Clean up any existing listener
      this.stopSMSListener();

      console.log('[SMSRetriever] Setting up SMS listener...');

      // Listen for SMS retriever events
      this.currentListener = RNSmsRetriever.addSmsListener((event: any) => {
        console.log('[SMSRetriever] SMS event received:', event);
        
        if (event && event.message) {
          const fullSMS = event.message;
          console.log('[SMSRetriever] Full SMS content:', fullSMS);
          
          // Extract verification code using pattern
          const codeMatch = fullSMS.match(codePattern);
          const extractedCode = codeMatch ? codeMatch[0] : null;
          
          console.log('[SMSRetriever] Extracted code:', extractedCode);
          
          // Call callback with extracted code and full SMS
          callback(extractedCode, fullSMS);
          
          // Auto-stop listener after receiving SMS
          this.stopSMSListener();
        } else {
          console.log('[SMSRetriever] No message in SMS event');
          callback(null);
        }
      });

      // Start the SMS retriever
      this.startSMSListener();
      
    } catch (error) {
      console.error('[SMSRetriever] Error setting up SMS listener:', error);
      callback(null);
    }
  }

  /**
   * Stop SMS listener
   */
  stopSMSListener(): void {
    try {
      if (this.currentListener) {
        console.log('[SMSRetriever] Removing SMS listener');
        this.currentListener.remove();
        this.currentListener = null;
      }
      this.isListening = false;
    } catch (error) {
      console.error('[SMSRetriever] Error stopping SMS listener:', error);
    }
  }

  /**
   * Request phone number (for SMS hint)
   */
  async requestPhoneNumber(): Promise<string | null> {
    try {
      if (Platform.OS !== 'android') {
        return null;
      }

      const phoneNumber = await RNSmsRetriever.requestPhoneNumber();
      console.log('[SMSRetriever] Retrieved phone number:', phoneNumber);
      return phoneNumber;
    } catch (error) {
      console.error('[SMSRetriever] Error requesting phone number:', error);
      return null;
    }
  }

  /**
   * Check if SMS retriever is available
   */
  isAvailable(): boolean {
    return Platform.OS === 'android';
  }

  /**
   * Get current listening status
   */
  getStatus(): { isListening: boolean; isAvailable: boolean } {
    return {
      isListening: this.isListening,
      isAvailable: this.isAvailable()
    };
  }
}

export const smsRetrieverService = new SMSRetrieverService();
