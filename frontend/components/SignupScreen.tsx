import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import { signupStyles } from '../styles';
import { userManagementService, smsAuthService } from '../services';

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

  // Referencias para cada casilla de código
  const codeInputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  // Referencias para cada casilla de PIN
  const pinInputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  // Referencias para cada casilla de confirmación de PIN
  const confirmPinInputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  // Timer para reenvío de código
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

  // Función para manejar el cambio en las casillas de código
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

  const handleNext = async () => {
    console.log('[Signup] Starting registration process...');
    console.log('[Signup] SMS Service Status:', smsAuthService.getServiceStatus());
    
    if (name.trim().length < 2) {
      setMessage('Por favor ingresa un nombre válido (mínimo 2 caracteres)');
      setMessageType('error');
      return;
    }
    if (phoneNumber.length !== 10) {
      setMessage('El número de celular debe tener exactamente 10 dígitos');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      // Format phone number to Colombian standard
      const formattedPhone = smsAuthService.formatPhoneNumber(phoneNumber);
      console.log('[Signup] Sending verification code to:', formattedPhone);

      // Send SMS verification code
      const response = await smsAuthService.sendVerificationCode(formattedPhone);
      
      console.log('[Signup] SMS Response:', response);

      if (response.success) {
        setSessionId(response.sessionId || '');
        setCurrentStep(2);
        setCanResend(false);
        setResendTimer(60);
        setMessage('Código enviado exitosamente');
        setMessageType('info');

        // Clear message after a few seconds
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 3000);
      } else {
        setMessage(response.message || 'Error al enviar SMS');
        setMessageType('error');
        console.error('[Signup] SMS Error:', response);
      }
    } catch (error) {
      console.error('[Signup] Network Error:', error);
      setMessage('Error de conexión. Verifica tu internet e inténtalo de nuevo.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (code.length !== 4) {
      setMessage('El código debe tener exactamente 4 números');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
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
        setMessage(response.message || 'Código incorrecto');
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
      setMessage('Error de conexión. Inténtalo de nuevo.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (pin.length !== 4) {
      setMessage('El PIN debe tener exactamente 4 dígitos');
      setMessageType('error');
      return;
    }

    if (confirmPin.length !== 4) {
      setMessage('Confirma tu PIN ingresando 4 dígitos');
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

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      // Registrar usuario en el sistema de gestión utilizando el PIN como contraseña
      const registrationResult = await userManagementService.registerUser(name, phoneNumber, pin);
      
      if (registrationResult.success) {
        setMessage(`¡Bienvenido ${name}! Tu cuenta ha sido creada exitosamente.`);
        setMessageType('success');

        setTimeout(() => {
          onSignupSuccess(phoneNumber, name);
        }, 1500);
      } else {
        setMessage(registrationResult.error || 'Error al crear la cuenta');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error de conexión. Inténtalo de nuevo.');
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

        // Focus first input
        setTimeout(() => {
          codeInputRefs[0].current?.focus();
        }, 100);

        // Clear message after a few seconds
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 3000);
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
