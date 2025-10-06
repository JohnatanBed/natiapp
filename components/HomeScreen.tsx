import React, { useState, useEffect, useCallback, use } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { homeStyles } from '../styles';
import AmountScreen from './AmountScreen';
import LoanScreen from './LoanScreen';
import { apiService } from '../services/ApiService';
import { useFocusEffect } from '@react-navigation/native';
import HistoryScreen from './HistoryScreen';

interface HomeScreenProps {
  phoneNumber: string;
  name: string;
  onLogout: () => void;
}

const HomeScreen = ({ phoneNumber, name, onLogout }: HomeScreenProps) => {
  const [message, setMessage] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'amount' | 'loan' | 'history'>('home');
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

    if (option === 'History') {
      setCurrentView('history');
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
          handleDelete={(id: number) => { }}
        />
      ) : currentView === 'history' ? (
        <HistoryScreen
          phoneNumber={phoneNumber}
          onBack={handleBackToHome}
        />
      ) : (
        <ScrollView style={homeStyles.container}>
          <View style={homeStyles.header}>
            <View style={homeStyles.headerTop}>
              <View style={homeStyles.welcomeContainer}>
                <Text style={homeStyles.welcomeTitle}>
                  ¡Bienvenido!
                </Text>
                <Text style={homeStyles.userName}>
                  {name || 'Usuario'}
                </Text>
              </View>
              <TouchableOpacity
                style={homeStyles.logoutButton}
                onPress={handleLogout}>
                <Text style={homeStyles.logoutButtonText}>
                  Cerrar Sesión
                </Text>
              </TouchableOpacity>
            </View>

            <View style={homeStyles.totalCard}>
              <Text style={homeStyles.totalLabel}>Total Aportado</Text>
              <Text style={homeStyles.totalAmountText}>
                ${totalAmount.toLocaleString('es-CO')}
              </Text>
            </View>
          </View>

          <View style={homeStyles.content}>
            <Modal
              transparent={true}
              visible={showLogoutConfirm}
              animationType="fade"
            >
              <View style={homeStyles.modalContainer}>
                <View style={homeStyles.modalContent}>
                  <Text style={homeStyles.messageText}>¿Estás seguro que deseas cerrar sesión?</Text>
                  <View style={homeStyles.confirmButtons}>
                    <TouchableOpacity onPress={cancelLogout} style={homeStyles.cancelButton}>
                      <Text style={homeStyles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={confirmLogout} style={homeStyles.confirmButton}>
                      <Text style={homeStyles.confirmButtonText}>Cerrar Sesión</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            {message !== '' && !showLogoutConfirm && (
              <View style={homeStyles.messageContainer}>
                <Text style={homeStyles.messageText}>
                  {message}
                </Text>
              </View>
            )}

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
                onPress={() => handleMenuOption('History')}>
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
