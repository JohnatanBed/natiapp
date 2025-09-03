/**
 * NatiApp - React Native Application
 * @format
 */

import React, { useState } from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './src/components/LoginScreen';
import SignupScreen from './src/components/SignupScreen';
import HomeScreen from './src/components/HomeScreen';
import AdminLoginScreen from './src/components/AdminLoginScreen';
import AdminDashboard from './src/components/AdminDashboard';

type Screen = 'login' | 'signup' | 'home' | 'adminLogin' | 'adminDashboard';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [userPhoneNumber, setUserPhoneNumber] = useState('');
  const [_userName, setUserName] = useState('');
  const [adminData, setAdminData] = useState<any>(null);

  const handleLoginSuccess = (phoneNumber: string) => {
    setUserPhoneNumber(phoneNumber);
    setCurrentScreen('home');
  };

  const handleSignupSuccess = (phoneNumber: string, name: string) => {
    setUserPhoneNumber(phoneNumber);
    setUserName(name);
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setCurrentScreen('login');
    setUserPhoneNumber('');
    setUserName('');
    setAdminData(null);
  };

  const navigateToSignup = () => {
    setCurrentScreen('signup');
  };

  const navigateToLogin = () => {
    setCurrentScreen('login');
  };

  const navigateToAdminLogin = () => {
    setCurrentScreen('adminLogin');
  };

  const handleAdminLoginSuccess = (admin: any) => {
    setAdminData(admin);
    setCurrentScreen('adminDashboard');
  };

  const handleAdminLogout = () => {
    setCurrentScreen('login');
    setAdminData(null);
  };

  const renderScreen = () => {
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
        return (
          <AdminDashboard 
            adminData={adminData}
            onLogout={handleAdminLogout}
          />
        );
      default:
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
