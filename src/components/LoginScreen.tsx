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
  onLoginSuccess: (phoneNumber: string) => void;
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
    if (phoneNumber.trim() === '') {
      setMessage('Por favor ingresa tu número de celular');
      setMessageType('error');
      return;
    }

    if (phoneNumber.length !== 10) {
      setMessage('El número de celular debe tener exactamente 10 dígitos');
      setMessageType('error');
      return;
    }

    setCurrentStep(2);
    setMessage('');
    setMessageType('');
    
    // Limpiar timer anterior si existe
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Iniciar timer para reenvío
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
  };

  const handleBack = () => {
    // Limpiar timer si existe
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
    if (code.length !== 4) {
      setMessage('Por favor ingresa el código de 4 dígitos');
      setMessageType('error');
      return;
    }

    // Actualizar último acceso del usuario
    await userManagementService.updateLastLogin(phoneNumber);

    // Llamar directamente a la función de éxito
    onLoginSuccess(phoneNumber);
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
                style={loginStyles.button}
                onPress={handleNext}>
                <Text style={loginStyles.buttonText}>
                  Ingresa
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
