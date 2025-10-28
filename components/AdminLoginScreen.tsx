import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { loginStyles } from '../styles';
import { userManagementService } from '../services';

interface AdminLoginScreenProps {
  onAdminLoginSuccess: (adminData: any) => void;
  onBackToUserLogin: () => void;
  onNavigateToAdminSignup: () => void;
}

const AdminLoginScreen = ({ onAdminLoginSuccess, onBackToUserLogin, onNavigateToAdminSignup }: AdminLoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | 'info' | ''>('');

  const handleAdminLogin = async () => {
    try {
      // Reset error states
      setMessage('');
      setMessageType('');

      // Input validation
      if (!email?.trim()) {
        setMessage('Por favor ingresa tu email');
        setMessageType('error');
        return;
      }

      if (!password?.trim()) {
        setMessage('Por favor ingresa tu contraseña');
        setMessageType('error');
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setMessage('Por favor ingresa un email válido');
        setMessageType('error');
        return;
      }

      // Password length validation
      if (password.length < 6) {
        setMessage('La contraseña debe tener al menos 6 caracteres');
        setMessageType('error');
        return;
      }

      setIsLoading(true);
      setMessage('Verificando credenciales...');
      setMessageType('info');

      const result = await userManagementService.adminLogin(email.trim(), password.trim());
      
      if (result.success && result.admin) {
        setMessage('Login exitoso');
        setMessageType('success');
        setTimeout(() => {
          onAdminLoginSuccess(result.admin);
        }, 1000);
      } else {
        // Handle specific admin login errors with better user feedback
        const errorMessage = result.error === 'NETWORK_ERROR'
          ? 'Error de conexión. Verifica tu internet e inténtalo de nuevo.'
          : result.error === 'TIMEOUT_ERROR'
          ? 'El servidor está tardando en responder. Intenta nuevamente.'
          : result.error === 'INVALID_CREDENTIALS'
          ? 'Email o contraseña incorrectos. Verifica e intenta nuevamente.'
          : result.error === 'SERVER_ERROR'
          ? 'Error interno del servidor. Intenta más tarde.'
          : result.error === 'INVALID_EMAIL_FORMAT'
          ? 'Por favor ingresa un email válido.'
          : result.error === 'INVALID_EMAIL' || result.error === 'INVALID_PASSWORD'
          ? 'Por favor completa todos los campos correctamente.'
          : result.message || 'Error al iniciar sesión. Verifica tus credenciales.';

        setMessage(errorMessage);
        setMessageType('error');
      }

    } catch (error) {
      console.error('[AdminLogin] Unexpected error during admin login:', error);
      
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

  const showDemoCredentials = () => {
    Alert.alert(
      'Credenciales Demo',
      'Email: admin@natiapp.com\nPassword: admin123',
      [{ text: 'OK' }]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={loginStyles.container}
      behavior="padding"
    >
      <View style={loginStyles.innerContainer}>
        <View style={loginStyles.logoContainer}>
          <Text style={loginStyles.title}>Panel de Administrador</Text>
          <Text style={loginStyles.subtitle}>Ingresa tus credenciales para continuar</Text>
        </View>

        <View style={loginStyles.formContainer}>
        {message !== '' && (
          <View style={[
            loginStyles.messageContainer,
            messageType === 'error' && loginStyles.errorMessage,
            messageType === 'success' && loginStyles.successMessage,
            messageType === 'info' && loginStyles.infoMessage,
          ]}>
            <Text style={[
              loginStyles.messageText,
              messageType === 'error' && loginStyles.errorText,
              messageType === 'success' && loginStyles.successText,
              messageType === 'info' && loginStyles.infoText,
            ]}>
              {message}
            </Text>
          </View>
        )}

        <View style={loginStyles.inputContainer}>
          <Text style={loginStyles.inputLabel}>Email</Text>
          <TextInput
            style={[loginStyles.input, adminInputStyles.input]}
            value={email}
            onChangeText={setEmail}
            placeholder="admin@natiapp.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
        </View>

        <View style={loginStyles.inputContainer}>
          <Text style={loginStyles.inputLabel}>Contraseña</Text>
          <TextInput
            style={[loginStyles.input, adminInputStyles.input]}
            value={password}
            onChangeText={setPassword}
            placeholder="Ingresa tu contraseña"
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity 
          style={[
            loginStyles.button, 
            adminInputStyles.loginButton,
            isLoading && loginStyles.buttonDisabled
          ]}
          onPress={handleAdminLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={loginStyles.buttonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>

        <View style={adminInputStyles.linksContainer}>

          <TouchableOpacity 
            style={[loginStyles.linkButton, adminInputStyles.signupButton]}
            onPress={onNavigateToAdminSignup}
            disabled={isLoading}
          >
            <Text style={[loginStyles.linkText, adminInputStyles.signupButtonText]}>
              ¿No tienes cuenta? Regístrate aquí
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[loginStyles.linkButton, adminInputStyles.backButton]}
            onPress={onBackToUserLogin}
          >
            <Text style={loginStyles.linkText}>← Volver al login de usuarios</Text>
          </TouchableOpacity>
        </View>
      </View>
      </View>
    </KeyboardAvoidingView>
  );
};

// Estilos específicos para el admin login (para uso futuro)
/*
const adminHeaderStyles = StyleSheet.create({
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#1f2937',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  iconText: {
    fontSize: 32,
    color: 'white',
  },
});
*/

const adminInputStyles = StyleSheet.create({
  input: {
    marginBottom: 4,
    borderColor: '#374151',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#16a34a',
    marginTop: 8,
    marginBottom: 24,
    paddingVertical: 14,
  },
  linksContainer: {
    alignItems: 'center',
    gap: 16,
  },
  demoButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  demoButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  signupButton: {
    marginTop: 8,
  },
  signupButtonText: {
    color: '#16a34a',
    fontWeight: '600',
  },
  backButton: {
    marginTop: 8,
  },
});

export default AdminLoginScreen;
