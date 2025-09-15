/**
 * NatiApp - React Native Application
 * @format
 */

import React, { useState, useEffect } from 'react';
import { StatusBar, View, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';
import HomeScreen from './components/HomeScreen';
import AdminLoginScreen from './components/AdminLoginScreen';
import AdminDashboard from './components/AdminDashboard';

type Screen = 'login' | 'signup' | 'home' | 'adminLogin' | 'adminDashboard';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [userPhoneNumber, setUserPhoneNumber] = useState('');
  const [_userName, setUserName] = useState('');
  const [adminData, setAdminData] = useState<any>(null);

  // Global error handler
  useEffect(() => {
    const originalHandler = ErrorUtils.getGlobalHandler();
    
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      console.error('[App] Global error caught:', error);
      
      // Show user-friendly error message
      if (isFatal) {
        Alert.alert(
          'Error Crítico',
          'La aplicación ha encontrado un error inesperado. Por favor reinicia la app.',
          [
            {
              text: 'Reiniciar',
              onPress: () => {
                // Reset app state
                setCurrentScreen('login');
                setUserPhoneNumber('');
                setUserName('');
                setAdminData(null);
              }
            }
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          'Error',
          'Ha ocurrido un error inesperado. La aplicación continuará funcionando.',
          [{ text: 'OK' }]
        );
      }
      
      // Call original handler
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });

    return () => {
      if (originalHandler) {
        ErrorUtils.setGlobalHandler(originalHandler);
      }
    };
  }, []);

  const handleLoginSuccess = (phoneNumber: string) => {
    try {
      if (!phoneNumber?.trim()) {
        console.error('[App] Invalid phone number received on login success');
        Alert.alert('Error', 'Error al procesar el login. Intenta nuevamente.');
        return;
      }
      
      setUserPhoneNumber(phoneNumber);
      setCurrentScreen('home');
    } catch (error) {
      console.error('[App] Error handling login success:', error);
      Alert.alert('Error', 'Error al iniciar sesión. Intenta nuevamente.');
    }
  };

  const handleSignupSuccess = (phoneNumber: string, name: string) => {
    try {
      if (!phoneNumber?.trim() || !name?.trim()) {
        console.error('[App] Invalid data received on signup success:', { phoneNumber, name });
        Alert.alert('Error', 'Error al procesar el registro. Intenta nuevamente.');
        return;
      }
      
      setUserPhoneNumber(phoneNumber);
      setUserName(name);
      setCurrentScreen('home');
    } catch (error) {
      console.error('[App] Error handling signup success:', error);
      Alert.alert('Error', 'Error al completar el registro. Intenta nuevamente.');
    }
  };

  const handleLogout = () => {
    try {
      setCurrentScreen('login');
      setUserPhoneNumber('');
      setUserName('');
      setAdminData(null);
    } catch (error) {
      console.error('[App] Error during logout:', error);
      Alert.alert('Error', 'Error al cerrar sesión. Intenta nuevamente.');
    }
  };

  const navigateToSignup = () => {
    try {
      setCurrentScreen('signup');
    } catch (error) {
      console.error('[App] Error navigating to signup:', error);
      Alert.alert('Error', 'Error al navegar. Intenta nuevamente.');
    }
  };

  const navigateToLogin = () => {
    try {
      setCurrentScreen('login');
    } catch (error) {
      console.error('[App] Error navigating to login:', error);
      Alert.alert('Error', 'Error al navegar. Intenta nuevamente.');
    }
  };

  const navigateToAdminLogin = () => {
    try {
      setCurrentScreen('adminLogin');
    } catch (error) {
      console.error('[App] Error navigating to admin login:', error);
      Alert.alert('Error', 'Error al navegar. Intenta nuevamente.');
    }
  };

  const handleAdminLoginSuccess = (admin: any) => {
    try {
      if (!admin || !admin.id) {
        console.error('[App] Invalid admin data received on login success:', admin);
        Alert.alert('Error', 'Error al procesar el login de administrador. Intenta nuevamente.');
        return;
      }
      
      setAdminData(admin);
      setCurrentScreen('adminDashboard');
    } catch (error) {
      console.error('[App] Error handling admin login success:', error);
      Alert.alert('Error', 'Error al iniciar sesión como administrador. Intenta nuevamente.');
    }
  };

  const handleAdminLogout = () => {
    try {
      setCurrentScreen('login');
      setAdminData(null);
    } catch (error) {
      console.error('[App] Error during admin logout:', error);
      Alert.alert('Error', 'Error al cerrar sesión. Intenta nuevamente.');
    }
  };

  const renderScreen = () => {
    try {
      switch (currentScreen) {
        case 'login':
          return (
            <LoginScreen 
              onLoginSuccess={handleLoginSuccess}
              onNavigateToSignup={navigateToSignup}
              onNavigateToAdminLogin={navigateToAdminLogin}
            />
          );
        case 'signup':
          return (
            <SignupScreen 
              onSignupSuccess={handleSignupSuccess}
              onBackToLogin={navigateToLogin}
            />
          );
        case 'home':
          if (!userPhoneNumber) {
            console.error('[App] No user phone number available for home screen');
            setCurrentScreen('login');
            return (
              <LoginScreen 
                onLoginSuccess={handleLoginSuccess}
                onNavigateToSignup={navigateToSignup}
                onNavigateToAdminLogin={navigateToAdminLogin}
              />
            );
          }
          return (
            <HomeScreen 
              phoneNumber={userPhoneNumber} 
              onLogout={handleLogout} 
            />
          );
        case 'adminLogin':
          return (
            <AdminLoginScreen 
              onAdminLoginSuccess={handleAdminLoginSuccess}
              onBackToUserLogin={navigateToLogin}
            />
          );
        case 'adminDashboard':
          if (!adminData) {
            console.error('[App] No admin data available for dashboard');
            setCurrentScreen('adminLogin');
            return (
              <AdminLoginScreen 
                onAdminLoginSuccess={handleAdminLoginSuccess}
                onBackToUserLogin={navigateToLogin}
              />
            );
          }
          return (
            <AdminDashboard 
              adminData={adminData}
              onLogout={handleAdminLogout}
            />
          );
        default:
          console.warn('[App] Unknown screen type:', currentScreen);
          return (
            <LoginScreen 
              onLoginSuccess={handleLoginSuccess}
              onNavigateToSignup={navigateToSignup}
              onNavigateToAdminLogin={navigateToAdminLogin}
            />
          );
      }
    } catch (error) {
      console.error('[App] Error rendering screen:', error);
      Alert.alert(
        'Error de Pantalla', 
        'Error al cargar la pantalla. Regresando al inicio.',
        [
          {
            text: 'OK',
            onPress: () => {
              setCurrentScreen('login');
              setUserPhoneNumber('');
              setUserName('');
              setAdminData(null);
            }
          }
        ]
      );
      
      // Fallback to login screen
      return (
        <LoginScreen 
          onLoginSuccess={handleLoginSuccess}
          onNavigateToSignup={navigateToSignup}
          onNavigateToAdminLogin={navigateToAdminLogin}
        />
      );
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={{ flex: 1 }}>
        {renderScreen()}
      </View>
    </SafeAreaProvider>
  );
}

export default App;
