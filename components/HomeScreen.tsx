import React, { useState, useEffect, useCallback, use } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { homeStyles } from '../styles';
import AmountScreen from './AmountScreen';
import LoanScreen from './LoanScreen';
import { apiService } from '../services/ApiService';
import { userManagementService } from '../services';
import { useFocusEffect } from '@react-navigation/native';
import HistoryScreen from './HistoryScreen';
import EventsScreen from './EventsScreen';

interface HomeScreenProps {
  phoneNumber: string;
  name: string;
  onLogout: () => void;
}

const HomeScreen = ({ phoneNumber, name, onLogout }: HomeScreenProps) => {
  const [message, setMessage] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showJoinGroupModal, setShowJoinGroupModal] = useState(false);
  const [codeGroup, setCodeGroup] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [joinMessageType, setJoinMessageType] = useState<'error' | 'success' | ''>('');
  const [currentView, setCurrentView] = useState<'home' | 'amount' | 'loan' | 'history' | 'events'>('home');
  const [totalAmount, setTotalAmount] = useState(0);

  const fetchTotalAmount = async () => {
    try {
      const response = await apiService.getMyAmounts();

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

    if (option === 'Events') {
      setCurrentView('events');
      return;
    }

    setMessage(`Has seleccionado: ${option}`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  const handleJoinGroup = async () => {
    try {
      setJoinMessage('');
      setJoinMessageType('');

      if (!codeGroup?.trim()) {
        setJoinMessage('Por favor ingresa el código de grupo');
        setJoinMessageType('error');
        return;
      }

      setIsJoining(true);
      setJoinMessage('Verificando código...');
      setJoinMessageType('');

      const result = await userManagementService.joinGroup(codeGroup.trim());

      if (result.success) {
        setJoinMessage(result.message);
        setJoinMessageType('success');

        setTimeout(() => {
          setShowJoinGroupModal(false);
          setCodeGroup('');
          setJoinMessage('');
          setJoinMessageType('');

          Alert.alert(
            '¡Éxito!',
            `Te has unido al grupo de ${result.data?.admin_name || 'administrador'}`,
            [{ text: 'OK' }]
          );
        }, 1500);
      } else {
        let errorMsg = 'Error al unirse al grupo';
        switch(result.error) {
          case 'INVALID_CODE_GROUP':
            errorMsg = 'El código de grupo no existe. Verifica e intenta nuevamente.';
            break;
          case 'ALREADY_MEMBER':
            errorMsg = 'Ya perteneces a este grupo.';
            break;
          case 'NETWORK_ERROR':
            errorMsg = 'Error de conexión. Verifica tu internet.';
            break;
          case 'UNAUTHORIZED':
            errorMsg = 'Debes iniciar sesión para unirte a un grupo.';
            break;
          default:
            errorMsg = result.message || 'Error al unirse al grupo';
        }

        setJoinMessage(errorMsg);
        setJoinMessageType('error');
      }
    } catch (error) {
      console.error('[HomeScreen] Error joining group:', error);
      setJoinMessage('Error inesperado. Intenta nuevamente.');
      setJoinMessageType('error');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCancelJoinGroup = () => {
    setShowJoinGroupModal(false);
    setCodeGroup('');
    setJoinMessage('');
    setJoinMessageType('');
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
      ) : currentView === 'events' ? (
        <EventsScreen
          phoneNumber={phoneNumber}
          onBack={handleBackToHome}
        />
      ) :

        (
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

              <Modal
                transparent={true}
                visible={showJoinGroupModal}
                animationType="fade"
              >
                <View style={homeStyles.modalContainer}>
                  <View style={homeStyles.modalContent}>
                    <Text style={homeStyles.modalTitle}>Unirse a un Grupo</Text>
                    <Text style={homeStyles.modalSubtitle}>
                      Ingresa el código compartido por tu administrador
                    </Text>

                    {joinMessage !== '' && (
                      <View style={[
                        homeStyles.joinMessageContainer,
                        joinMessageType === 'error' && homeStyles.joinErrorContainer,
                        joinMessageType === 'success' && homeStyles.joinSuccessContainer,
                      ]}>
                        <Text style={[
                          homeStyles.joinMessageText,
                          joinMessageType === 'error' && homeStyles.joinErrorText,
                          joinMessageType === 'success' && homeStyles.joinSuccessText,
                        ]}>
                          {joinMessage}
                        </Text>
                      </View>
                    )}

                    <TextInput
                      style={homeStyles.codeInput}
                      placeholder="Código de grupo"
                      value={codeGroup}
                      onChangeText={(text) => setCodeGroup(text.toUpperCase())}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      editable={!isJoining}
                    />

                    <View style={homeStyles.confirmButtons}>
                      <TouchableOpacity
                        onPress={handleCancelJoinGroup}
                        style={homeStyles.cancelButton}
                        disabled={isJoining}
                      >
                        <Text style={homeStyles.cancelButtonText}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleJoinGroup}
                        style={[homeStyles.confirmButton, isJoining && homeStyles.buttonDisabled]}
                        disabled={isJoining}
                      >
                        {isJoining ? (
                          <ActivityIndicator color="white" size="small" />
                        ) : (
                          <Text style={homeStyles.confirmButtonText}>Unirse</Text>
                        )}
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

              <Text style={homeStyles.menuTitle}>¿Qué deseas hacer?</Text>

              <View style={homeStyles.menuGrid}>
                <TouchableOpacity
                  style={homeStyles.menuItem}
                  onPress={() => handleMenuOption('Amount')}>
                  <View style={homeStyles.menuIconContainer}>
                    <Text style={homeStyles.menuEmoji}>➕</Text>
                  </View>
                  <Text style={homeStyles.menuItemText}>
                    Aportar
                  </Text>
                  <Text style={homeStyles.menuItemSubtext}>
                    Registra tu aporte
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={homeStyles.menuItem}
                  onPress={() => handleMenuOption('Loan')}>
                  <View style={homeStyles.menuIconContainer}>
                    <Text style={homeStyles.menuEmoji}>💵</Text>
                  </View>
                  <Text style={homeStyles.menuItemText}>
                    Préstamos
                  </Text>
                  <Text style={homeStyles.menuItemSubtext}>
                    Gestiona préstamos
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={homeStyles.menuItem}
                  onPress={() => handleMenuOption('History')}>
                  <View style={homeStyles.menuIconContainer}>
                    <Text style={homeStyles.menuEmoji}>📜</Text>
                  </View>
                  <Text style={homeStyles.menuItemText}>
                    Historial
                  </Text>
                  <Text style={homeStyles.menuItemSubtext}>
                    Revisa movimientos
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={homeStyles.menuItem}
                  onPress={() => handleMenuOption('Events')}>
                  <View style={homeStyles.menuIconContainer}>
                    <Text style={homeStyles.menuEmoji}>🎉</Text>
                  </View>
                  <Text style={homeStyles.menuItemText}>
                    Evento
                  </Text>
                  <Text style={homeStyles.menuItemSubtext}>
                    Participa y gana
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={homeStyles.menuItem}
                  onPress={() => setShowJoinGroupModal(true)}>
                  <View style={homeStyles.menuIconContainer}>
                    <Text style={homeStyles.menuEmoji}>👥</Text>
                  </View>
                  <Text style={homeStyles.menuItemText}>
                    Unirse a Grupo
                  </Text>
                  <Text style={homeStyles.menuItemSubtext}>
                    Código de grupo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={homeStyles.menuItem}
                  onPress={() => {}}>
                  <View style={homeStyles.menuIconContainer}>
                    <Text style={homeStyles.menuEmoji}>🔒</Text>
                  </View>
                  <Text style={homeStyles.menuItemText}>
                    Ajustes
                  </Text>
                  <Text style={homeStyles.menuItemSubtext}>
                    Configuración de la aplicación
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
