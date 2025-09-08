import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { homeStyles } from '../styles/HomeScreen';

interface HomeScreenProps {
  phoneNumber: string;
  onLogout: () => void;
}

const HomeScreen = ({ phoneNumber, onLogout }: HomeScreenProps) => {
  const [message, setMessage] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
    setMessage(`Has seleccionado: ${option}`);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <ScrollView style={homeStyles.container}>
      <View style={homeStyles.header}>
        <Text style={homeStyles.welcomeTitle}>
          ¡Bienvenido!
        </Text>
        <Text style={homeStyles.phoneText}>
          Celular: {phoneNumber}
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
            <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 12}}>
              <TouchableOpacity 
                onPress={cancelLogout}
                style={{paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#6b7280', borderRadius: 6}}>
                <Text style={{color: 'white', fontWeight: '600'}}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={confirmLogout}
                style={{paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#dc2626', borderRadius: 6}}>
                <Text style={{color: 'white', fontWeight: '600'}}>Cerrar Sesión</Text>
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
        
        <View style={homeStyles.menuGrid}>
          <TouchableOpacity 
            style={homeStyles.menuItem}
            onPress={() => handleMenuOption('Perfil')}>
            <Text style={homeStyles.menuEmoji}>👤</Text>
            <Text style={homeStyles.menuItemText}>
              Mi Perfil
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={homeStyles.menuItem}
            onPress={() => handleMenuOption('Configuración')}>
            <Text style={homeStyles.menuEmoji}>⚙️</Text>
            <Text style={homeStyles.menuItemText}>
              Configuración
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={homeStyles.menuItem}
            onPress={() => handleMenuOption('Notificaciones')}>
            <Text style={homeStyles.menuEmoji}>🔔</Text>
            <Text style={homeStyles.menuItemText}>
              Notificaciones
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={homeStyles.menuItem}
            onPress={() => handleMenuOption('Ayuda')}>
            <Text style={homeStyles.menuEmoji}>❓</Text>
            <Text style={homeStyles.menuItemText}>
              Ayuda
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={homeStyles.menuItem}
            onPress={() => handleMenuOption('Historial')}>
            <Text style={homeStyles.menuEmoji}>📋</Text>
            <Text style={homeStyles.menuItemText}>
              Historial
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={homeStyles.menuItem}
            onPress={() => handleMenuOption('Favoritos')}>
            <Text style={homeStyles.menuEmoji}>⭐</Text>
            <Text style={homeStyles.menuItemText}>
              Favoritos
            </Text>
          </TouchableOpacity>
        </View>

        <View style={homeStyles.infoCard}>
          <Text style={homeStyles.infoTitle}>
            Información de la App
          </Text>
          <Text style={homeStyles.versionText}>
            NatiApp v1.0
          </Text>
          <Text style={homeStyles.updateText}>
            Última actualización: Hoy
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
