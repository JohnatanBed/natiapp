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
  ScrollView,
} from 'react-native';
import { loginStyles } from '../styles';
import { userManagementService } from '../services';

interface AdminSignupScreenProps {
  onAdminSignupSuccess: (adminData: any) => void;
  onBackToAdminLogin: () => void;
}

const AdminSignupScreen = ({ onAdminSignupSuccess, onBackToAdminLogin }: AdminSignupScreenProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [codeGroup, setCodeGroup] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | 'info' | ''>('');

  const handleAdminSignup = async () => {
    try {
      // Reset error states
      setMessage('');
      setMessageType('');

      // Input validation
      if (!name?.trim()) {
        setMessage('Por favor ingresa tu nombre completo');
        setMessageType('error');
        return;
      }

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

      if (!confirmPassword?.trim()) {
        setMessage('Por favor confirma tu contraseña');
        setMessageType('error');
        return;
      }

      if (!codeGroup?.trim()) {
        setMessage('Por favor ingresa el código de grupo');
        setMessageType('error');
        return;
      }

      // Email validation
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

      // Password confirmation validation
      if (password !== confirmPassword) {
        setMessage('Las contraseñas no coinciden');
        setMessageType('error');
        return;
      }

      // Code group validation
      if (codeGroup.length < 4) {
        setMessage('El código de grupo debe tener al menos 4 caracteres');
        setMessageType('error');
        return;
      }

      setIsLoading(true);
      setMessage('Registrando administrador...');
      setMessageType('info');

      const result = await userManagementService.adminRegister(
        name.trim(),
        email.trim(),
        password.trim(),
        codeGroup.trim()
      );
      
      if (result.success && result.admin) {
        setMessage('Registro exitoso. Redirigiendo...');
        setMessageType('success');
        setTimeout(() => {
          onAdminSignupSuccess(result.admin);
        }, 1500);
      } else {
        // Handle specific admin registration errors with better user feedback
        const errorMessage = result.error === 'NETWORK_ERROR'
          ? 'Error de conexión. Verifica tu internet e inténtalo de nuevo.'
          : result.error === 'TIMEOUT_ERROR'
          ? 'El servidor está tardando en responder. Intenta nuevamente.'
          : result.error === 'EMAIL_EXISTS'
          ? 'Este email ya está registrado. Usa otro email.'
          : result.error === 'CODE_GROUP_EXISTS'
          ? 'Este código de grupo ya está en uso. Elige otro código.'
          : result.error === 'SERVER_ERROR'
          ? 'Error interno del servidor. Intenta más tarde.'
          : result.error === 'INVALID_EMAIL_FORMAT'
          ? 'Por favor ingresa un email válido.'
          : result.error === 'INVALID_DATA'
          ? 'Por favor completa todos los campos correctamente.'
          : result.message || 'Error al registrar administrador. Intenta nuevamente.';

        setMessage(errorMessage);
        setMessageType('error');
      }

    } catch (error) {
      console.error('[AdminSignup] Unexpected error during admin registration:', error);
      
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

  return (
    <KeyboardAvoidingView 
      style={loginStyles.container}
      behavior="padding"
    >
      <ScrollView 
        contentContainerStyle={signupStyles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={loginStyles.innerContainer}>
          <View style={loginStyles.logoContainer}>
            <Text style={loginStyles.title}>Registro de Administrador</Text>
            <Text style={loginStyles.subtitle}>Crea una cuenta de administrador para gestionar tu grupo</Text>
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
              <Text style={loginStyles.inputLabel}>Nombre Completo</Text>
              <TextInput
                style={[loginStyles.input, signupStyles.input]}
                value={name}
                onChangeText={setName}
                placeholder="Juan Pérez"
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View style={loginStyles.inputContainer}>
              <Text style={loginStyles.inputLabel}>Email</Text>
              <TextInput
                style={[loginStyles.input, signupStyles.input]}
                value={email}
                onChangeText={setEmail}
                placeholder="admin@ejemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View style={loginStyles.inputContainer}>
              <Text style={loginStyles.inputLabel}>Contraseña</Text>
              <TextInput
                style={[loginStyles.input, signupStyles.input]}
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <View style={loginStyles.inputContainer}>
              <Text style={loginStyles.inputLabel}>Confirmar Contraseña</Text>
              <TextInput
                style={[loginStyles.input, signupStyles.input]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirma tu contraseña"
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <View style={loginStyles.inputContainer}>
              <Text style={loginStyles.inputLabel}>Código de Grupo</Text>
              <TextInput
              style={[loginStyles.input, signupStyles.input]}
              value={codeGroup}
              onChangeText={(text) => setCodeGroup(text.toUpperCase())}
              placeholder="Código único para tu grupo"
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!isLoading}
              />
              <Text style={signupStyles.helperText}>
              Este código será usado para identificar tu grupo
              </Text>
            </View>

            <TouchableOpacity 
              style={[
                loginStyles.button, 
                signupStyles.signupButton,
                isLoading && loginStyles.buttonDisabled
              ]}
              onPress={handleAdminSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={loginStyles.buttonText}>Registrar Administrador</Text>
              )}
            </TouchableOpacity>

            <View style={signupStyles.linksContainer}>
              <TouchableOpacity 
                style={[loginStyles.linkButton, signupStyles.backButton]}
                onPress={onBackToAdminLogin}
                disabled={isLoading}
              >
                <Text style={loginStyles.linkText}>← Ya tengo cuenta de administrador</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const signupStyles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  input: {
    marginBottom: 4,
    borderColor: '#374151',
    fontSize: 16,
  },
  signupButton: {
    backgroundColor: '#16a34a',
    marginTop: 8,
    marginBottom: 24,
    paddingVertical: 14,
  },
  linksContainer: {
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    marginTop: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default AdminSignupScreen;
