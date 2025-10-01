/**
 * NatiApp - React Native Application
 * @format
 */

import React, { useState, useEffect } from 'react';
import { StatusBar, View, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';
import HomeScreen from './components/HomeScreen';
import AdminLoginScreen from './components/AdminLoginScreen';
import AdminDashboard from './components/AdminDashboard';

const Stack = createStackNavigator();

function App() {
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
                //setCurrentScreen('login');
                //setUserPhoneNumber('');
                //setUserName('');
                //setAdminData(null);
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
      
      //setUserPhoneNumber(phoneNumber);
      //setCurrentScreen('home');
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
      
      //setUserPhoneNumber(phoneNumber);
      //setUserName(name);
      //setCurrentScreen('home');
    } catch (error) {
      console.error('[App] Error handling signup success:', error);
      Alert.alert('Error', 'Error al completar el registro. Intenta nuevamente.');
    }
  };

  const handleLogout = () => {
    try {
      //setCurrentScreen('login');
      //setUserPhoneNumber('');
      //setUserName('');
      //setAdminData(null);
    } catch (error) {
      console.error('[App] Error during logout:', error);
      Alert.alert('Error', 'Error al cerrar sesión. Intenta nuevamente.');
    }
  };

  const navigateToSignup = () => {
    try {
      //setCurrentScreen('signup');
    } catch (error) {
      console.error('[App] Error navigating to signup:', error);
      Alert.alert('Error', 'Error al navegar. Intenta nuevamente.');
    }
  };

  const navigateToLogin = () => {
    try {
      //setCurrentScreen('login');
    } catch (error) {
      console.error('[App] Error navigating to login:', error);
      Alert.alert('Error', 'Error al navegar. Intenta nuevamente.');
    }
  };

  const navigateToAdminLogin = () => {
    try {
      //setCurrentScreen('adminLogin');
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
      
      //setAdminData(admin);
      //setCurrentScreen('adminDashboard');
    } catch (error) {
      console.error('[App] Error handling admin login success:', error);
      Alert.alert('Error', 'Error al iniciar sesión como administrador. Intenta nuevamente.');
    }
  };

  const handleAdminLogout = () => {
    try {
      //setCurrentScreen('login');
      //setAdminData(null);
    } catch (error) {
      console.error('[App] Error during admin logout:', error);
      Alert.alert('Error', 'Error al cerrar sesión. Intenta nuevamente.');
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" options={{ headerShown: false }}>
            {props => (
              <LoginScreen 
                {...props}
                onLoginSuccess={phoneNumber => props.navigation.replace('Home', { phoneNumber })}
                onNavigateToSignup={() => props.navigation.navigate('Signup')}
                onNavigateToAdminLogin={() => props.navigation.navigate('AdminLogin')}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Signup" options={{ headerShown: false }}>
            {props => (
              <SignupScreen 
                {...props}
                onSignupSuccess={(phoneNumber, name) => props.navigation.replace('Home', { phoneNumber, name })}
                onBackToLogin={() => props.navigation.goBack()}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Home" options={{ headerShown: false }}>
            {(props: any) => (
              <HomeScreen 
                {...props}
                phoneNumber={props.route?.params?.phoneNumber}
                onLogout={() => props.navigation.replace('Login')}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="AdminLogin" options={{ headerShown: false }}>
            {props => (
              <AdminLoginScreen 
                {...props}
                onAdminLoginSuccess={admin => props.navigation.replace('AdminDashboard', { admin })}
                onBackToUserLogin={() => props.navigation.replace('Login')}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="AdminDashboard" options={{ headerShown: false }}>
            {(props: { route: { params?: { admin?: any } }, navigation: any }) => (
              <AdminDashboard 
                {...props}
                adminData={props.route.params?.admin}
                onLogout={() => props.navigation.replace('Login')}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
