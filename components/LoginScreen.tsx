import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { loginStyles } from '../styles';
import { userManagementService } from '../services';

interface LoginScreenProps {
  onLoginSuccess: (phoneNumber: string, name: string) => void;
  onNavigateToSignup: () => void;
  onNavigateToAdminLogin: () => void;
}

const LoginScreen = ({ onLoginSuccess, onNavigateToSignup, onNavigateToAdminLogin }: LoginScreenProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(['', '', '', '']);
  const [currentStep, setCurrentStep] = useState(1);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | 'info' | ''>('');
  const [_canResend, setCanResend] = useState(false);
  const [_resendTimer, setResendTimer] = useState(60);
  const [isVerifyingNumber, setIsVerifyingNumber] = useState(false);
  const timerRef = useRef<number | null>(null);

  const codeInputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  // Limpiar timer al desmontar el componente
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText) {
      const newCodeArray = code.split('');
      newCodeArray[index] = numericText[0];
      const newCode = newCodeArray.join('');
      setCode(newCode);
      
      const newShowCode = [...showCode];
      newShowCode[index] = '●';
      setShowCode(newShowCode);
      
      if (index < 3) {
        codeInputRefs[index + 1].current?.focus();
      }
    } else {
      const newCodeArray = code.split('');
      newCodeArray[index] = '';
      const newCode = newCodeArray.join('');
      setCode(newCode);
      
      const newShowCode = [...showCode];
      newShowCode[index] = '';
      setShowCode(newShowCode);
      
      if (index > 0) {
        codeInputRefs[index - 1].current?.focus();
      }
    }
  };

  const handleNext = async () => {
    try {
      setMessage('');
      setMessageType('');

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

      if (!/^\d{10}$/.test(phoneNumber)) {
        setMessage('El número debe contener solo dígitos');
        setMessageType('error');
        return;
      }
      
      setIsVerifyingNumber(true);
      setMessage('Verificando número de teléfono...');
      setMessageType('info');
      
      const checkResult = await userManagementService.checkUserExists(phoneNumber);
      
      if (checkResult.success) {
        if (checkResult.exists) {
          setMessage('');
          setMessageType('');
          setIsVerifyingNumber(false);
          setCurrentStep(2);
          
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }

          setCanResend(false);
          setResendTimer(60);
          
          timerRef.current = setInterval(() => {
            setResendTimer((prev) => {
              if (prev <= 1) {
                setCanResend(true);
                if (timerRef.current) {
                  clearInterval(timerRef.current);
                  timerRef.current = null;
                }
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          setMessage('El número no está registrado.');
          setMessageType('error');
          setIsVerifyingNumber(false);
          return;
        }
      } else {
        const errorMessage = checkResult.error === 'NETWORK_ERROR'
          ? 'Error de conexión. Verifica tu internet e inténtalo de nuevo.'
          : checkResult.error === 'TIMEOUT_ERROR'
          ? 'El servidor está tardando en responder. Intenta nuevamente.'
          : checkResult.error === 'SERVER_ERROR'
          ? 'Error en el servidor. Intenta más tarde.'
          : checkResult.error === 'INVALID_PHONE_FORMAT'
          ? 'El número de teléfono no tiene un formato válido.'
          : checkResult.message || 'Error al verificar el número. Intenta nuevamente.';

        setMessage(errorMessage);
        setMessageType('error');
        setIsVerifyingNumber(false);
        return;
      }

    } catch (error) {
      console.error('[Login] Error during phone verification:', error);
      
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        setMessage('Error de conexión. Verifica tu internet e inténtalo de nuevo.');
      } else if (error instanceof Error && error.message.includes('timeout')) {
        setMessage('El servidor está tardando en responder. Intenta nuevamente.');
      } else {
        setMessage('Ocurrió un error inesperado. Intenta nuevamente.');
      }
      
      setMessageType('error');
      setIsVerifyingNumber(false);
      return;
    } finally {
      setIsVerifyingNumber(false);
    }
  };

  const handleBack = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setCurrentStep(1);
    setCode('');
    setShowCode(['', '', '', '']);
    setMessage('');
    setMessageType('');
    setCanResend(false);
    setResendTimer(60);
  };

  const handleLogin = async () => {
    try {
      setMessage('');
      setMessageType('');

      if (!code?.trim()) {
        setMessage('Ingresa tu PIN');
        setMessageType('error');
        return;
      }

      if (code.length !== 4) {
        setMessage('Ingresa el código de 4 dígitos');
        setMessageType('error');
        return;
      }

      if (!/^\d{4}$/.test(code)) {
        setMessage('El PIN debe contener solo números');
        setMessageType('error');
        return;
      }

      setMessage('Iniciando sesión...');
      setMessageType('info');
      
      const loginResult = await userManagementService.loginUser(phoneNumber, code);
      
      if (loginResult.success) {
        setMessage('Sesión iniciada correctamente');
        setMessageType('success');
        
        setTimeout(() => {
          const userName = loginResult.user?.name || phoneNumber;
          onLoginSuccess(phoneNumber, userName);
        }, 1000);
      } else {
        const errorMessage = loginResult.error === 'NETWORK_ERROR'
          ? 'Error de conexión. Verifica tu internet e inténtalo de nuevo.'
          : loginResult.error === 'TIMEOUT_ERROR'
          ? 'El servidor está tardando en responder. Intenta nuevamente.'
          : loginResult.error === 'INVALID_CREDENTIALS'
          ? 'PIN incorrecto. Verifica e intenta nuevamente.'
          : loginResult.error === 'USER_NOT_FOUND'
          ? 'Usuario no encontrado. Verifica tu número o regístrate.'
          : loginResult.error === 'SERVER_ERROR'
          ? 'Error interno del servidor. Intenta más tarde.'
          : loginResult.error === 'INVALID_PHONE_FORMAT'
          ? 'El número de teléfono no tiene un formato válido.'
          : loginResult.message || 'Error al iniciar sesión. Intenta nuevamente.';

        setMessage(errorMessage);
        setMessageType('error');
        
        setCode('');
        setShowCode(['', '', '', '']);
        
        setTimeout(() => {
          codeInputRefs[0].current?.focus();
        }, 100);
      }

    } catch (error) {
      console.error('[Login] Error during login:', error);
      
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        setMessage('Error de conexión. Verifica tu internet e inténtalo de nuevo.');
      } else if (error instanceof Error && error.message.includes('timeout')) {
        setMessage('El servidor está tardando en responder. Intenta nuevamente.');
      } else {
        setMessage('Ocurrió un error inesperado. Intenta nuevamente.');
      }
      
      setMessageType('error');

      setCode('');
      setShowCode(['', '', '', '']);
      
      setTimeout(() => {
        codeInputRefs[0].current?.focus();
      }, 100);
    }
  };

  const handleSignUp = () => {
    onNavigateToSignup();
  };

  return (
    <KeyboardAvoidingView
      style={loginStyles.container}
      behavior="padding">
      <View style={loginStyles.innerContainer}>
        <View style={loginStyles.logoContainer}>
          {<Image
            source={require('../assets/images/natiapp-logo.png')}
            style={loginStyles.logoImage}
            resizeMode="contain"
          />}
        </View>

        <View style={loginStyles.formContainer}>
          {message !== '' && (
            <View style={[
              loginStyles.messageContainer,
              messageType === 'error' && loginStyles.errorContainer,
              messageType === 'success' && loginStyles.successContainer,
              messageType === 'info' && loginStyles.infoContainer
            ]}>
              <Text style={[
                messageType === 'error' && loginStyles.errorText,
                messageType === 'success' && loginStyles.successText,
                messageType === 'info' && loginStyles.infoText
              ]}>
                {message}
              </Text>
            </View>
          )}
          {currentStep === 1 ? (
            <>
              <View style={loginStyles.inputContainer}>
                <TextInput
                  style={loginStyles.input}
                  placeholder="Ingresa tu número de celular"
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
                style={[loginStyles.button, isVerifyingNumber && loginStyles.disabledButton]}
                onPress={handleNext}
                disabled={isVerifyingNumber}>
                <Text style={loginStyles.buttonText}>
                  {isVerifyingNumber ? 'Verificando...' : 'Ingresar'}
                </Text>
              </TouchableOpacity>

              <View style={loginStyles.signupContainer}>
                <Text style={loginStyles.signupText}>¿No tienes cuenta? </Text>
                <TouchableOpacity onPress={handleSignUp}>
                  <Text style={loginStyles.signupLink}>
                    Regístrate
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[loginStyles.linkButton, { marginTop: 20 }]}
                onPress={onNavigateToAdminLogin}
              >
                <Text style={loginStyles.linkText}>
                  Acceso para Administradores
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={loginStyles.inputContainer}>
                <Text style={loginStyles.codeInputLabel}>
                  Ingresa tu clave de 4 dígitos
                </Text>
              </View>

              <View style={loginStyles.inputContainer}>
                <View style={loginStyles.codeInputRow}>
                  {[0, 1, 2, 3].map((index) => (
                    <TextInput
                      key={index}
                      ref={codeInputRefs[index]}
                      style={loginStyles.codeInput}
                      value={showCode[index]}
                      onChangeText={(text) => handleCodeChange(text, index)}
                      keyboardType="numeric"
                      maxLength={1}
                      autoCapitalize="none"
                      autoCorrect={false}
                      secureTextEntry={false}
                    />
                  ))}
                </View>
              </View>

              <TouchableOpacity 
                style={loginStyles.button}
                onPress={handleLogin}>
                <Text style={loginStyles.buttonText}>
                  Iniciar Sesión
                </Text>
              </TouchableOpacity>

              <View style={loginStyles.signupContainer}>
                <TouchableOpacity onPress={handleBack}>
                  <Text style={loginStyles.changeNumberLink}>← Cambiar número</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
