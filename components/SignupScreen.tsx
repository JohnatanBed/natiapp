import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import { signupStyles } from '../styles';
import { userManagementService, smsAuthService, apiService } from '../services';

interface SignupScreenProps {
  onSignupSuccess: (phoneNumber: string, name: string) => void;
  onBackToLogin: () => void;
}

const SignupScreen = ({ onSignupSuccess, onBackToLogin }: SignupScreenProps) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(['', '', '', '']);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(['', '', '', '']);
  const [showConfirmPin, setShowConfirmPin] = useState(['', '', '', '']);
  const [currentStep, setCurrentStep] = useState(1); // 1: Datos, 2: Verificación, 3: PIN
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | 'info' | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const codeInputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const pinInputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const confirmPinInputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (currentStep === 2 && !canResend && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentStep, canResend, resendTimer]);

  const handleCodeChange = (text: string, index: number) => {
    const numericText = text.replace(/[^0-9]/g, '');

    if (numericText) {
      // Actualizar el código en la posición específica
      const newCodeArray = code.split('');
      newCodeArray[index] = numericText[0];
      const newCode = newCodeArray.join('');
      setCode(newCode);

      // Mostrar el número real en lugar de un símbolo
      const newShowCode = [...showCode];
      newShowCode[index] = numericText[0];
      setShowCode(newShowCode);

      // Auto-enfoque: mover al siguiente input si no es el último
      if (index < 3) {
        codeInputRefs[index + 1].current?.focus();
      }
    } else {
      // Si se borra, quitar el dígito de esa posición
      const newCodeArray = code.split('');
      newCodeArray[index] = '';
      const newCode = newCodeArray.join('');
      setCode(newCode);

      // Limpiar la visualización
      const newShowCode = [...showCode];
      newShowCode[index] = '';
      setShowCode(newShowCode);

      // Auto-enfoque: mover al input anterior si no es el primero
      if (index > 0) {
        codeInputRefs[index - 1].current?.focus();
      }
    }
  };

  // Función para manejar el cambio en las casillas de PIN
  const handlePinChange = (text: string, index: number) => {
    const numericText = text.replace(/[^0-9]/g, '');

    if (numericText) {
      const newPinArray = pin.split('');
      newPinArray[index] = numericText[0];
      const newPin = newPinArray.join('');
      setPin(newPin);

      const newShowPin = [...showPin];
      newShowPin[index] = '●';
      setShowPin(newShowPin);

      if (index < 3) {
        pinInputRefs[index + 1].current?.focus();
      }
    } else {
      const newPinArray = pin.split('');
      newPinArray[index] = '';
      const newPin = newPinArray.join('');
      setPin(newPin);

      const newShowPin = [...showPin];
      newShowPin[index] = '';
      setShowPin(newShowPin);

      if (index > 0) {
        pinInputRefs[index - 1].current?.focus();
      }
    }
  };

  // Función para manejar el cambio en las casillas de confirmación de PIN
  const handleConfirmPinChange = (text: string, index: number) => {
    const numericText = text.replace(/[^0-9]/g, '');

    if (numericText) {
      const newConfirmPinArray = confirmPin.split('');
      newConfirmPinArray[index] = numericText[0];
      const newConfirmPin = newConfirmPinArray.join('');
      setConfirmPin(newConfirmPin);

      const newShowConfirmPin = [...showConfirmPin];
      newShowConfirmPin[index] = '●';
      setShowConfirmPin(newShowConfirmPin);

      if (index < 3) {
        confirmPinInputRefs[index + 1].current?.focus();
      }
    } else {
      const newConfirmPinArray = confirmPin.split('');
      newConfirmPinArray[index] = '';
      const newConfirmPin = newConfirmPinArray.join('');
      setConfirmPin(newConfirmPin);

      const newShowConfirmPin = [...showConfirmPin];
      newShowConfirmPin[index] = '';
      setShowConfirmPin(newShowConfirmPin);

      if (index > 0) {
        confirmPinInputRefs[index - 1].current?.focus();
      }
    }
  };

  // Función para autocompletar el código de verificación
  const autoCompleteVerificationCode = (code: string) => {
    if (code && code.length === 4) {
      
      // Llenar el código automáticamente
      setCode(code);
      
      // Mostrar cada dígito en su respectivo campo
      const codeArray = code.split('');
      setShowCode([codeArray[0], codeArray[1], codeArray[2], codeArray[3]]);
      
      // Limpiar el mensaje después de autocompletar
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 500);
    }
  };

  const handleNext = async () => {
    
    try {
      // Reset error states
      setMessage('');
      setMessageType('');

      // Validate input data
      
      if(!phoneNumber?.trim() && !name?.trim()) {
        setMessage('Ingresa tu nombre y número de celular');
        setMessageType('error');
        return;
      }

      if (!name?.trim()) {
        setMessage('Ingresa tu nombre');
        setMessageType('error');
        return;
      }

      if (name.trim().length < 2) {
        setMessage('Ingresa un nombre válido (mínimo 3 caracteres)');
        setMessageType('error');
        return;
      }

      if (name.trim().length > 50) {
        setMessage('El nombre no puede exceder 30 caracteres');
        setMessageType('error');
        return;
      }

      if (!phoneNumber?.trim()) {
        setMessage('Ingresa tu número de celular');
        setMessageType('error');
        return;
      }

      if (phoneNumber.length !== 10) {
        setMessage('El número celular debe tener 10 dígitos');
        setMessageType('error');
        return;
      }

      // Colombian mobile number validation
      if (!phoneNumber.startsWith('3')) {
        setMessage('El número debe ser un celular válido (debe empezar con 3)');
        setMessageType('error');
        return;
      }

      setIsLoading(true);
      setMessage('Verificando número de celular...');
      setMessageType('info');

      // Use the original phone number for user existence check
      // The UserManagementService will handle normalization internally

      // Check if user already exists - CRITICAL VALIDATION
      const userCheckResult = await userManagementService.checkUserExists(phoneNumber);

      // Enhanced validation logic with better error handling
      if (userCheckResult.success) {
        if (userCheckResult.exists) {
          setMessage('Este número de celular ya está registrado.');
          setMessageType('error');
          setIsLoading(false);
          return;
        }
      } else {
        // Handle specific error cases from user existence check
        console.error('[Signup] Error checking user existence:', userCheckResult.error);
        
        const errorMessage = userCheckResult.error === 'NETWORK_ERROR' 
          ? 'Error de conexión. Verifica tu internet e inténtalo de nuevo.'
          : userCheckResult.error === 'TIMEOUT_ERROR'
          ? 'El servidor está tardando en responder. Intenta nuevamente.'
          : userCheckResult.error === 'SERVER_ERROR'
          ? 'Error en el servidor. Intenta más tarde.'
          : userCheckResult.message || 'Error al verificar el número. Inténtalo de nuevo.';
        
        setMessage(errorMessage);
        setMessageType('error');
        setIsLoading(false);
        return;
      }

      // Clear the verification message before sending SMS
      setMessage('Enviando código de verificación...');

      // Format phone number for SMS service (this is separate from user management)
      const formattedPhone = smsAuthService.formatPhoneNumber(phoneNumber);

      // Send SMS verification code only if user doesn't exist
      const response = await smsAuthService.sendVerificationCode(formattedPhone);

      if (response.success) {
        setSessionId(response.sessionId || '');
        setCurrentStep(2);
        setCanResend(false);
        setResendTimer(60);
        setMessage('Código enviado exitosamente');
        setMessageType('info');
        
        // Auto-completar el código automáticamente
        if (response.generatedCode) {
          setTimeout(() => {
            autoCompleteVerificationCode(response.generatedCode!);
          }, 1500); // Esperar 1.5 segundos para que el usuario vea la transición
        }

        // Clear message after a few seconds (solo si no hay autocompletado)
        if (!response.generatedCode) {
          setTimeout(() => {
            setMessage('');
            setMessageType('');
          }, 3000);
        }
      } else {
        // Handle specific SMS sending errors
        const errorMessage = response.error === 'NETWORK_ERROR'
          ? 'Error de conexión. Verifica tu internet e inténtalo de nuevo.'
          : response.error === 'RATE_LIMIT_EXCEEDED'
          ? 'Has enviado demasiados códigos. Espera unos minutos antes de intentar nuevamente.'
          : response.error === 'INVALID_PHONE_NUMBER'
          ? 'El número de teléfono ingresado no es válido.'
          : response.error === 'TIMEOUT_ERROR'
          ? 'El servidor está tardando en responder. Intenta nuevamente.'
          : response.error === 'SERVER_ERROR'
          ? 'Error en el servidor. Intenta más tarde.'
          : response.message || 'Error al enviar SMS';

        setMessage(errorMessage);
        setMessageType('error');
        console.error('[Signup] SMS Error:', response);
      }

    } catch (error) {
      console.error('[Signup] Unexpected error during registration process:', error);
      
      // Handle different types of errors
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        setMessage('Error de conexión. Verifica tu internet e inténtalo de nuevo.');
      } else if (error instanceof Error && error.message.includes('timeout')) {
        setMessage('El servidor está tardando en responder. Intenta nuevamente.');
      } else {
        setMessage('Ocurrió un error inesperado. Intenta nuevamente.');
      }
      
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    try {
      // Reset error states
      setMessage('');
      setMessageType('');

      // Validation
      if (!code?.trim()) {
        setMessage('Ingresa el código de verificación');
        setMessageType('error');
        return;
      }

      if (code.length !== 4) {
        setMessage('El código debe tener exactamente 4 dígitos');
        setMessageType('error');
        return;
      }

      if (!/^\d{4}$/.test(code)) {
        setMessage('El código debe contener solo números');
        setMessageType('error');
        return;
      }

      setIsLoading(true);
      setMessage('Verificando código...');
      setMessageType('info');

      const formattedPhone = smsAuthService.formatPhoneNumber(phoneNumber);

      // Verify SMS code
      const response = await smsAuthService.verifyCode(formattedPhone, code, sessionId);

      if (response.success && response.isValid) {
        setMessage('Código verificado exitosamente');
        setMessageType('success');

        setTimeout(() => {
          setCurrentStep(3);
          setMessage('');
          setMessageType('');
        }, 1000);
      } else {
        // Handle specific verification errors
        const errorMessage = response.error === 'INVALID_CODE'
          ? 'Código incorrecto. Intenta nuevamente.'
          : response.error === 'SESSION_NOT_FOUND'
          ? 'El código ha expirado. Solicita un nuevo código.'
          : response.error === 'TOO_MANY_ATTEMPTS'
          ? 'Demasiados intentos fallidos.'
          : response.error === 'NETWORK_ERROR'
          ? 'Error de conexión. Verifica tu internet e inténtalo de nuevo.'
          : response.error === 'TIMEOUT_ERROR'
          ? 'El servidor está tardando en responder. Intenta nuevamente.'
          : response.error === 'SERVER_ERROR'
          ? 'Error en el servidor. Intenta más tarde.'
          : response.message || 'Código incorrecto';

        setMessage(errorMessage);
        setMessageType('error');

        // Clear code inputs on error
        setCode('');
        setShowCode(['', '', '', '']);

        // Focus first input
        setTimeout(() => {
          codeInputRefs[0].current?.focus();
        }, 100);
      }

    } catch (error) {
      console.error('[Signup] Unexpected error during code verification:', error);
      
      // Handle different types of errors
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        setMessage('Error de conexión. Verifica tu internet e inténtalo de nuevo.');
      } else if (error instanceof Error && error.message.includes('timeout')) {
        setMessage('El servidor está tardando en responder. Intenta nuevamente.');
      } else {
        setMessage('Ocurrió un error inesperado. Intenta nuevamente.');
      }
      
      setMessageType('error');

      // Clear code inputs on error
      setCode('');
      setShowCode(['', '', '', '']);

      // Focus first input
      setTimeout(() => {
        codeInputRefs[0].current?.focus();
      }, 100);

    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    try {
      // Reset error states
      setMessage('');
      setMessageType('');

      // Validate PIN inputs
      if (!pin?.trim()) {
        setMessage('Ingresa tu PIN');
        setMessageType('error');
        return;
      }

      if (pin.length !== 4) {
        setMessage('El PIN debe tener exactamente 4 dígitos');
        setMessageType('error');
        return;
      }

      if (!/^\d{4}$/.test(pin)) {
        setMessage('El PIN debe contener solo números');
        setMessageType('error');
        return;
      }

      if (!confirmPin?.trim()) {
        setMessage('Confirma tu PIN');
        setMessageType('error');
        return;
      }

      if (confirmPin.length !== 4) {
        setMessage('Confirma tu PIN ingresando 4 dígitos');
        setMessageType('error');
        return;
      }

      if (!/^\d{4}$/.test(confirmPin)) {
        setMessage('La confirmación de PIN debe contener solo números');
        setMessageType('error');
        return;
      }

      if (pin !== confirmPin) {
        setMessage('Los PINs no coinciden. Inténtalo de nuevo.');
        setMessageType('error');
        
        // Limpiar campos de PIN
        setConfirmPin('');
        setShowConfirmPin(['', '', '', '']);
        
        // Enfocar el primer campo de confirmación
        setTimeout(() => {
          confirmPinInputRefs[0].current?.focus();
        }, 100);
        return;
      }

      // Security check for weak PINs
      const weakPins = ['0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1234', '4321'];
      if (weakPins.includes(pin)) {
        setMessage('Por seguridad, elige un PIN menos obvio que no sea repetitivo o secuencial.');
        setMessageType('error');
        return;
      }

      setIsLoading(true);
      setMessage('Creando cuenta...');
      setMessageType('info');

      // Final check before creating account - IMPORTANT SECURITY MEASURE
      
      const finalUserCheck = await userManagementService.checkUserExists(phoneNumber);
      
      if (!finalUserCheck.success) {
        // Handle specific error cases
        const errorMessage = finalUserCheck.error === 'NETWORK_ERROR'
          ? 'Error de conexión. Verifica tu internet e inténtalo de nuevo.'
          : finalUserCheck.error === 'TIMEOUT_ERROR'
          ? 'El servidor está tardando en responder. Intenta nuevamente.'
          : finalUserCheck.error === 'SERVER_ERROR'
          ? 'Error en el servidor. Intenta más tarde.'
          : 'Error al verificar el estado de la cuenta. Intenta nuevamente.';

        setMessage(errorMessage);
        setMessageType('error');
        setIsLoading(false);
        return;
      }

      if (finalUserCheck.exists) {
        setMessage('Este número ya está registrado. Intenta iniciar sesión en su lugar.');
        setMessageType('error');
        setIsLoading(false);
        return;
      }

      // Proceed with user registration - UserManagementService will handle normalization
      const registrationResult = await userManagementService.registerUser(name.trim(), phoneNumber, pin);
      
      if (registrationResult.success) {
        if (registrationResult.token) {
          await apiService.setToken(registrationResult.token);
        }
        setMessage(`¡Bienvenido ${name.trim()}! Tu cuenta ha sido creada exitosamente.`);
        setMessageType('success');

        setTimeout(() => {
          onSignupSuccess(phoneNumber, name.trim());
        }, 1500);
      } else {
        // Handle specific error messages from backend with better user feedback
        const errorMessage = registrationResult.error === 'NETWORK_ERROR'
          ? 'Error de conexión. Verifica tu internet e inténtalo de nuevo.'
          : registrationResult.error === 'TIMEOUT_ERROR'
          ? 'El servidor está tardando en responder. Intenta nuevamente.'
          : registrationResult.error === 'SERVER_ERROR'
          ? 'Error interno del servidor. Intenta más tarde.'
          : registrationResult.error === 'INVALID_PHONE_FORMAT'
          ? 'El número de teléfono no tiene un formato válido.'
          : registrationResult.error === 'INVALID_NAME'
          ? 'Ingresa un nombre válido.'
          : registrationResult.error === 'INVALID_PASSWORD'
          ? 'Por favor ingresa un PIN válido.'
          : registrationResult.error?.includes('Phone number already registered') || 
            registrationResult.error?.includes('número de teléfono ya está registrado')
          ? 'Este número de celular ya está registrado. Intenta iniciar sesión.'
          : registrationResult.message || 'Error al crear la cuenta. Intenta nuevamente.';

        setMessage(errorMessage);
        setMessageType('error');
      }

    } catch (error) {
      console.error('[Signup] Unexpected error during account creation:', error);
      
      // Handle different types of errors
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        setMessage('Error de conexión. Verifica tu internet e inténtalo de nuevo.');
      } else if (error instanceof Error && error.message.includes('timeout')) {
        setMessage('El servidor está tardando en responder. Intenta nuevamente.');
      } else {
        setMessage('Ocurrió un error inesperado. Intenta nuevamente.');
      }
      
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
      setPin('');
      setConfirmPin('');
      setShowPin(['', '', '', '']);
      setShowConfirmPin(['', '', '', '']);
    } else {
      setCurrentStep(1);
      setCode('');
      setShowCode(['', '', '', '']);
    }
    setMessage('');
    setMessageType('');
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const formattedPhone = smsAuthService.formatPhoneNumber(phoneNumber);
      const response = await smsAuthService.sendVerificationCode(formattedPhone);

      if (response.success) {
        setSessionId(response.sessionId || '');
        setCanResend(false);
        setResendTimer(60);
        setMessage('Nuevo código enviado exitosamente');
        setMessageType('info');

        // Clear current code
        setCode('');
        setShowCode(['', '', '', '']);

        // Auto-completar el código automáticamente
        if (response.generatedCode) {
          setTimeout(() => {
            autoCompleteVerificationCode(response.generatedCode!);
          }, 1500); // Esperar 1.5 segundos para que el usuario vea la transición
        } else {
          // Focus first input only if not auto-completing
          setTimeout(() => {
            codeInputRefs[0].current?.focus();
          }, 100);
        }

        // Clear message after a few seconds (solo si no hay autocompletado)
        if (!response.generatedCode) {
          setTimeout(() => {
            setMessage('');
            setMessageType('');
          }, 3000);
        }
      } else {
        setMessage(response.message || 'Error al reenviar SMS');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error de conexión. Inténtalo de nuevo.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={signupStyles.container}
      behavior="padding">
      <View style={signupStyles.innerContainer}>
        <View style={signupStyles.logoContainer}>
          <Text style={signupStyles.title}>
            Únete a nosotros
          </Text>
          <Text style={signupStyles.subtitle}>
            {currentStep === 1 ? 'Crea una cuenta' : 
             currentStep === 2 ? 'Verifica tu número de celular' : 
             'Crea tu PIN de acceso'}
          </Text>
        </View>

        <View style={signupStyles.formContainer}>
          {message !== '' && (
            <View style={[
              signupStyles.messageContainer,
              messageType === 'error' && signupStyles.errorContainer,
              messageType === 'success' && signupStyles.successContainer,
              messageType === 'info' && signupStyles.infoContainer
            ]}>
              <Text style={[
                messageType === 'error' && signupStyles.errorText,
                messageType === 'success' && signupStyles.successText,
                messageType === 'info' && signupStyles.infoText
              ]}>
                {message}
              </Text>
            </View>
          )}
          {currentStep === 1 ? (
            // PASO 1: Datos personales
            <>
              <View style={signupStyles.inputContainer}>
                <Text style={signupStyles.inputLabel}>
                  ¿Cómo te llamas?
                </Text>
                <TextInput
                  style={signupStyles.input}
                  placeholder="Ingresa tú nombre"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

              <View style={signupStyles.inputContainer}>
                <Text style={signupStyles.inputLabel}>
                  Número de celular
                </Text>
                <TextInput
                  style={signupStyles.input}
                  placeholder="Ingresa tú número"
                  value={phoneNumber}
                  onChangeText={(text) => {
                    // Solo permitir números y limitar a 10 dígitos
                    const numericText = text.replace(/[^0-9]/g, '');
                    if (numericText.length <= 10) {
                      setPhoneNumber(numericText);
                    }
                  }}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  maxLength={10}
                />
              </View>

              <TouchableOpacity
                style={[signupStyles.button, isLoading && signupStyles.buttonDisabled]}
                onPress={handleNext}
                disabled={isLoading}>
                <Text style={signupStyles.buttonText}>
                  {isLoading ? 'Enviando...' : 'Continuar'}
                </Text>
              </TouchableOpacity>

              <View style={signupStyles.loginContainer}>
                <Text style={signupStyles.loginText}>¿Ya tienes cuenta? </Text>
                <TouchableOpacity onPress={onBackToLogin}>
                  <Text style={signupStyles.changeNumberLink}>
                    Inicia sesión
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : currentStep === 2 ? (
            // PASO 2: Verificación de código
            <>
              <View style={signupStyles.codeSentContainer}>
                <Text style={signupStyles.codeSentText}>
                  Código de verificación enviado a:
                </Text>
                <Text style={signupStyles.subtitle}>
                  {phoneNumber}
                </Text>
                <TouchableOpacity onPress={handleBack}>
                  <Text style={signupStyles.changeNumberLink}>
                    Cambiar número
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={signupStyles.inputContainer}>
                <Text style={signupStyles.inputLabel}>
                  Código de verificación
                </Text>
                <View style={signupStyles.codeInputRow}>
                  <TextInput
                    ref={codeInputRefs[0]}
                    style={signupStyles.codeInput}
                    value={showCode[0]}
                    onChangeText={(text) => handleCodeChange(text, 0)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    contextMenuHidden
                  />
                  <TextInput
                    ref={codeInputRefs[1]}
                    style={signupStyles.codeInput}
                    value={showCode[1]}
                    onChangeText={(text) => handleCodeChange(text, 1)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    contextMenuHidden
                  />
                  <TextInput
                    ref={codeInputRefs[2]}
                    style={signupStyles.codeInput}
                    value={showCode[2]}
                    onChangeText={(text) => handleCodeChange(text, 2)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    contextMenuHidden
                  />
                  <TextInput
                    ref={codeInputRefs[3]}
                    style={signupStyles.codeInput}
                    value={showCode[3]}
                    onChangeText={(text) => handleCodeChange(text, 3)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    contextMenuHidden
                  />
                </View>
              </View>

              {canResend ? (
                <TouchableOpacity
                  style={[signupStyles.resendContainer, isLoading && signupStyles.buttonDisabled]}
                  onPress={handleResendCode}
                  disabled={isLoading}>
                  <Text style={[signupStyles.resendText, isLoading && signupStyles.buttonDisabled]}>
                    {isLoading ? 'Reenviando...' : '¿No recibiste el código? Reenviar'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={signupStyles.resendTimerContainer}>
                  <Text style={signupStyles.resendTimerText}>Reenviar en</Text>
                  <Text style={signupStyles.resendTimerCount}> {resendTimer}s</Text>
                </View>
              )}

              <TouchableOpacity
                style={[signupStyles.button, isLoading && signupStyles.buttonDisabled]}
                onPress={handleSignup}
                disabled={isLoading}>
                <Text style={signupStyles.buttonText}>
                  {isLoading ? 'Verificando...' : 'Continuar'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            // PASO 3: Crear PIN
            <>
              <View style={signupStyles.inputContainer}>
                <Text style={signupStyles.inputLabel}>
                  Crea tu PIN de 4 dígitos
                </Text>
                
                <View style={signupStyles.codeInputRow}>
                  {[0, 1, 2, 3].map((index) => (
                    <TextInput
                      key={index}
                      ref={pinInputRefs[index]}
                      style={signupStyles.codeInput}
                      value={showPin[index]}
                      onChangeText={(text) => handlePinChange(text, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      contextMenuHidden
                      secureTextEntry
                    />
                  ))}
                </View>
              </View>

              <View style={signupStyles.inputContainer}>
                <Text style={signupStyles.inputLabel}>
                  Confirma tu PIN
                </Text>
                <View style={signupStyles.codeInputRow}>
                  {[0, 1, 2, 3].map((index) => (
                    <TextInput
                      key={index}
                      ref={confirmPinInputRefs[index]}
                      style={signupStyles.codeInput}
                      value={showConfirmPin[index]}
                      onChangeText={(text) => handleConfirmPinChange(text, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      contextMenuHidden
                      secureTextEntry
                    />
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[signupStyles.button, isLoading && signupStyles.buttonDisabled]}
                onPress={handleCreateAccount}
                disabled={isLoading}>
                <Text style={signupStyles.buttonText}>
                  {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </Text>
              </TouchableOpacity>

              <View style={signupStyles.loginContainer}>
                <TouchableOpacity onPress={handleBack}>
                  <Text style={signupStyles.changeNumberLink}>← Volver</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;
