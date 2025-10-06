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
import LoanScreen from './components/LoanScreen';

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
                //setAdminData(null);67
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

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" options={{ headerShown: false }}>
            {props => (
              <LoginScreen
                {...props}
                onLoginSuccess={(phoneNumber, name) => props.navigation.replace('Home', { phoneNumber, name })}
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
                name={props.route?.params?.name}
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
