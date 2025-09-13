import { useState, useEffect, useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import { smsRetrieverService, SMSRetrieverResponse } from '../services/SMSRetrieverService';
import { smsFormatterUtils } from '../services/SMSFormatterUtils';

export interface UseSMSRetrieverConfig {
  codeLength?: number;
  autoFillEnabled?: boolean;
  timeoutMs?: number;
  onCodeReceived?: (code: string) => void;
  onSMSReceived?: (fullSMS: string) => void;
  onError?: (error: string) => void;
}

export interface SMSRetrieverState {
  isListening: boolean;
  isSupported: boolean;
  lastError: string | null;
  receivedCode: string | null;
  appSignature: string | null;
}

export const useSMSRetriever = (config: UseSMSRetrieverConfig = {}) => {
  const {
    codeLength = 4,
    autoFillEnabled = true,
    timeoutMs = 5 * 60 * 1000, // 5 minutes
    onCodeReceived,
    onSMSReceived,
    onError
  } = config;

  const [state, setState] = useState<SMSRetrieverState>({
    isListening: false,
    isSupported: Platform.OS === 'android',
    lastError: null,
    receivedCode: null,
    appSignature: null
  });

  // Initialize SMS retriever
  const initializeSMSRetriever = useCallback(async () => {
    try {
      if (Platform.OS !== 'android') {
        setState(prev => ({ 
          ...prev, 
          isSupported: false,
          lastError: 'SMS Retriever no está disponible en iOS'
        }));
        return;
      }

      // Check permissions
      const hasPermission = await checkSMSPermission();
      if (!hasPermission) {
        setState(prev => ({ 
          ...prev, 
          lastError: 'Permisos de SMS requeridos'
        }));
        return;
      }

      // Get app signature
      const signature = await smsRetrieverService.getAppSignature();
      setState(prev => ({ 
        ...prev, 
        appSignature: signature?.appSignature || null
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error inicializando SMS Retriever';
      setState(prev => ({ ...prev, lastError: errorMessage }));
      onError?.(errorMessage);
    }
  }, [onError]);

  // Check SMS permissions
  const checkSMSPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS !== 'android') return false;

      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS
      );

      return granted;
    } catch (error) {
      console.error('[SMSRetriever] Error checking permissions:', error);
      return false;
    }
  };

  // Request SMS permissions
  const requestSMSPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS !== 'android') return false;

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        {
          title: 'Permiso para SMS',
          message: 'Esta app necesita acceso a SMS para verificar automáticamente tu número de teléfono.',
          buttonNeutral: 'Preguntar después',
          buttonNegative: 'Cancelar',
          buttonPositive: 'Aceptar',
        }
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.error('[SMSRetriever] Error requesting permissions:', error);
      return false;
    }
  };

  // Start listening for SMS
  const startListening = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, lastError: null, receivedCode: null }));

      if (!state.isSupported) {
        const error = 'SMS Retriever no está disponible en este dispositivo';
        setState(prev => ({ ...prev, lastError: error }));
        onError?.(error);
        return;
      }

      // Check permissions
      let hasPermission = await checkSMSPermission();
      if (!hasPermission) {
        hasPermission = await requestSMSPermission();
        if (!hasPermission) {
          const error = 'Permisos de SMS denegados';
          setState(prev => ({ ...prev, lastError: error }));
          onError?.(error);
          return;
        }
      }

      setState(prev => ({ ...prev, isListening: true }));

      // Start SMS listener with custom callback
      smsRetrieverService.listenForVerificationSMS(
        (extractedCode: string | null, fullSMS?: string) => {
          console.log('[useSMSRetriever] Received SMS:', { extractedCode, fullSMS });
          
          setState(prev => ({ 
            ...prev, 
            isListening: false,
            receivedCode: extractedCode
          }));

          if (fullSMS) {
            onSMSReceived?.(fullSMS);
          }

          if (extractedCode) {
            onCodeReceived?.(extractedCode);
          }
        },
        new RegExp(`\\b\\d{${codeLength}}\\b`)
      );

      // Set timeout to stop listening
      setTimeout(() => {
        if (state.isListening) {
          stopListening();
        }
      }, timeoutMs);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error iniciando SMS Retriever';
      setState(prev => ({ 
        ...prev, 
        isListening: false,
        lastError: errorMessage
      }));
      onError?.(errorMessage);
    }
  }, [state.isSupported, state.isListening, codeLength, timeoutMs, onCodeReceived, onSMSReceived, onError]);

  // Stop listening for SMS
  const stopListening = useCallback(() => {
    try {
      smsRetrieverService.stopSMSListener();
      setState(prev => ({ ...prev, isListening: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error deteniendo SMS Retriever';
      setState(prev => ({ ...prev, lastError: errorMessage }));
      onError?.(errorMessage);
    }
  }, [onError]);

  // Clear received code
  const clearCode = useCallback(() => {
    setState(prev => ({ ...prev, receivedCode: null }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, lastError: null }));
  }, []);

  // Request phone number hint
  const requestPhoneNumber = useCallback(async (): Promise<string | null> => {
    try {
      return await smsRetrieverService.requestPhoneNumber();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error obteniendo número de teléfono';
      setState(prev => ({ ...prev, lastError: errorMessage }));
      onError?.(errorMessage);
      return null;
    }
  }, [onError]);

  // Initialize on mount
  useEffect(() => {
    initializeSMSRetriever();
    
    // Cleanup on unmount
    return () => {
      if (state.isListening) {
        stopListening();
      }
    };
  }, []);

  // Auto-stop listening after timeout
  useEffect(() => {
    if (state.isListening) {
      const timeout = setTimeout(() => {
        stopListening();
      }, timeoutMs);

      return () => clearTimeout(timeout);
    }
  }, [state.isListening, timeoutMs, stopListening]);

  return {
    // State
    ...state,
    
    // Actions
    startListening,
    stopListening,
    clearCode,
    clearError,
    requestPhoneNumber,
    
    // Utilities
    formatPhoneNumber: smsFormatterUtils.formatForDisplay,
    validateCode: (code: string) => smsFormatterUtils.validateVerificationCode(code, codeLength),
    extractCodeFromSMS: (sms: string) => smsFormatterUtils.extractVerificationCode(sms, codeLength),
    
    // Permissions
    checkSMSPermission,
    requestSMSPermission,
  };
};
