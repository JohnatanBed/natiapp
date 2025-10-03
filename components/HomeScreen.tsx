import React, { useState, useEffect, useCallback, use } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { homeStyles } from '../styles';
import AmountScreen from './AmountScreen';
import LoanScreen from './LoanScreen';
import { apiService } from '../services/ApiService';
import { useFocusEffect } from '@react-navigation/native';

interface HomeScreenProps {
  phoneNumber: string;
  name: string;
  onLogout: () => void;
}

const HomeScreen = ({ phoneNumber, name, onLogout }: HomeScreenProps) => {
  const [message, setMessage] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'amount' | 'loan'>('home');
  const [totalAmount, setTotalAmount] = useState(0);

  const fetchTotalAmount = async () => {
    try {
      const response = await apiService.getMyAmounts();
      console.log('Fetched amounts:', response);

      if (!response || !response.total) {
        console.error('Total not found:', response);
        return;
      }

      const totalAmount = Number(response.total);
      setTotalAmount(isNaN(totalAmount) ? 0 : totalAmount);
    } catch (error) {
      console.error('Error fetching amounts:', error);
    }
  };


  useEffect(() => {
    fetchTotalAmount();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTotalAmount();
    }, [])
  );

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleMenuOption = (option: string) => {
    if (option === 'Amount') {
      setCurrentView('amount');
      return;
    }

    if (option === 'Loan') {
      setCurrentView('loan');
      return;
    }
    setMessage(`Has seleccionado: ${option}`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };


  return (
    <>
      {currentView === 'amount' ? (
        <AmountScreen
          phoneNumber={phoneNumber}
          onBack={handleBackToHome}
          onUpdateTotal={fetchTotalAmount}
        />
      ) : currentView === 'loan' ? (
        <LoanScreen
          phoneNumber={phoneNumber}
          onBack={handleBackToHome}
        />
      ) : (
        <ScrollView style={homeStyles.container}>
          <View style={homeStyles.header}>
            <Text style={homeStyles.welcomeTitle}>
              ¡Bienvenido{name ? `, ${name}` : ''}!
            </Text>
            <TouchableOpacity
              style={homeStyles.logoutButton}
              onPress={handleLogout}>
              <Text style={homeStyles.logoutButtonText}>
                Cerrar Sesión
              </Text>
            </TouchableOpacity>
          </View>

          <View style={homeStyles.content}>
            {showLogoutConfirm && (
              <View style={homeStyles.messageContainer}>
                <Text style={homeStyles.messageText}>
                  ¿Estás seguro que deseas cerrar sesión?
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 12 }}>
                  <TouchableOpacity
                    onPress={cancelLogout}
                    style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#6b7280', borderRadius: 6 }}>
                    <Text style={{ color: 'white', fontWeight: '600' }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={confirmLogout}
                    style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#dc2626', borderRadius: 6 }}>
                    <Text style={{ color: 'white', fontWeight: '600' }}>Cerrar Sesión</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {message !== '' && !showLogoutConfirm && (
              <View style={homeStyles.messageContainer}>
                <Text style={homeStyles.messageText}>
                  {message}
                </Text>
              </View>
            )}

            <Text style={homeStyles.menuTitle}>
              Menú Principal
            </Text>

            <Text style={homeStyles.totalAmountText}>
              Total Aportado: ${totalAmount.toLocaleString('es-CO')}
            </Text>

            <View style={homeStyles.menuGrid}>
              <TouchableOpacity
                style={homeStyles.menuItem}
                onPress={() => handleMenuOption('Amount')}>
                <Text style={homeStyles.menuEmoji}>➕</Text>
                <Text style={homeStyles.menuItemText}>
                  Aportar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={homeStyles.menuItem}
                onPress={() => handleMenuOption('Loan')}>
                <Text style={homeStyles.menuEmoji}>💵</Text>
                <Text style={homeStyles.menuItemText}>
                  Préstamos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={homeStyles.menuItem}
                onPress={() => handleMenuOption('Ver eventos')}>
                <Text style={homeStyles.menuEmoji}>📅</Text>
                <Text style={homeStyles.menuItemText}>
                  Eventos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={homeStyles.menuItem}
                onPress={() => handleMenuOption('Historial')}>
                <Text style={homeStyles.menuEmoji}>📜</Text>
                <Text style={homeStyles.menuItemText}>
                  Historial
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </>
  );
};

export default HomeScreen;
