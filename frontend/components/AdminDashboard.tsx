import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { homeStyles } from '../styles/HomeScreen';
import { User, userManagementService } from '../services';

interface AdminDashboardProps {
  adminData: any;
  onLogout: () => void;
}

const AdminDashboard = ({ adminData, onLogout }: AdminDashboardProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const loadUsers = async () => {
    try {
      const result = await userManagementService.getAllUsers();
      if (result.success && result.users) {
        setUsers(result.users);
        setMessage('');
      } else {
        setMessage(result.error || 'Error al cargar usuarios');
      }
    } catch (error) {
      setMessage('Error de conexión');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const handleToggleUserStatus = async (userId: string, userName: string, isActive: boolean) => {
    Alert.alert(
      'Cambiar Estado',
      `¿Estás seguro que deseas ${isActive ? 'desactivar' : 'activar'} a ${userName}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const result = await userManagementService.toggleUserStatus(userId);
              if (result.success) {
                // Refresh the user list
                loadUsers();
                setMessage(`Usuario ${isActive ? 'desactivado' : 'activado'} exitosamente`);
                setTimeout(() => setMessage(''), 3000);
              } else {
                Alert.alert('Error', result.error || 'Error al cambiar estado del usuario');
              }
            } catch (error) {
              Alert.alert('Error', 'Error de conexión');
            }
          },
        },
      ]
    );
  };

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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.isActive).length;
    const inactiveUsers = totalUsers - activeUsers;
    return { totalUsers, activeUsers, inactiveUsers };
  };

  const stats = getUserStats();

  if (isLoading) {
    return (
      <View style={[homeStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#6b7280' }}>
          Cargando usuarios...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={homeStyles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={[homeStyles.header, dashboardStyles.header]}>
        <View style={dashboardStyles.adminInfo}>
          <View style={dashboardStyles.adminTextContainer}>
            <Text style={[homeStyles.welcomeTitle, dashboardStyles.title]}>
              Panel de Administrador
            </Text>
            <Text style={[homeStyles.phoneText, dashboardStyles.adminName]}>
              {adminData.name}
            </Text>
          </View>
        </View>
        <View style={dashboardStyles.logoutContainer}>
          <TouchableOpacity 
            style={[homeStyles.logoutButton, dashboardStyles.logoutButton]}
            onPress={handleLogout}>
            <Text style={homeStyles.logoutButtonText}>
              Cerrar Sesión
            </Text>
          </TouchableOpacity>
        </View>
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

        {/* Estadísticas */}
        <View style={dashboardStyles.statsContainer}>
          <View style={dashboardStyles.statsHeader}>
            <Text style={dashboardStyles.statsTitle}>
              Estadísticas de Usuarios
            </Text>
          </View>
          
          <View style={dashboardStyles.statsGrid}>
            <View style={[dashboardStyles.statCard, dashboardStyles.totalCard]}>
              <Text style={dashboardStyles.statNumber}>
                {stats.totalUsers}
              </Text>
              <Text style={dashboardStyles.statLabel}>Total</Text>
            </View>
            <View style={[dashboardStyles.statCard, dashboardStyles.activeCard]}>
              <Text style={dashboardStyles.statNumber}>
                {stats.activeUsers}
              </Text>
              <Text style={dashboardStyles.statLabel}>Activos</Text>
            </View>
            <View style={[dashboardStyles.statCard, dashboardStyles.inactiveCard]}>
              <Text style={dashboardStyles.statNumber}>
                {stats.inactiveUsers}
              </Text>
              <Text style={dashboardStyles.statLabel}>Inactivos</Text>
            </View>
          </View>
        </View>

        {/* Lista de Usuarios */}
        <View style={dashboardStyles.usersSection}>
          <Text style={dashboardStyles.sectionTitle}>
            Usuarios Registrados ({users.length})
          </Text>
        </View>

        {users.length === 0 ? (
          <View style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 20,
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 16, color: '#6b7280' }}>
              No hay usuarios registrados
            </Text>
          </View>
        ) : (
          users.map((user) => (
            <View
              key={user.id}
              style={{
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: 4,
                  }}>
                    {user.name}
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: '#6b7280',
                    marginBottom: 2,
                  }}>
                    📱 {user.phoneNumber}
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: '#6b7280',
                    marginBottom: 2,
                  }}>
                    Registrado: {formatDate(user.registeredAt)}
                  </Text>
                  {user.lastLogin && (
                    <Text style={{
                      fontSize: 12,
                      color: '#6b7280',
                    }}>
                      Último acceso: {formatDate(user.lastLogin)}
                    </Text>
                  )}
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <View style={{
                    backgroundColor: user.isActive ? '#dcfce7' : '#fee2e2',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                    marginBottom: 8,
                  }}>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: user.isActive ? '#16a34a' : '#dc2626',
                    }}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleToggleUserStatus(user.id, user.name, user.isActive)}
                    style={{
                      backgroundColor: user.isActive ? '#dc2626' : '#16a34a',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: 'white',
                    }}>
                      {user.isActive ? 'Desactivar' : 'Activar'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

// Estilos específicos para el dashboard de administrador
const dashboardStyles = StyleSheet.create({
  header: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  adminInfo: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  adminIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#1f2937',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  adminIcon: {
    fontSize: 24,
  },
  adminTextContainer: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 22,
    marginBottom: 6,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  adminName: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  logoutContainer: {
    width: '100%',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statsHeader: {
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  totalCard: {
    backgroundColor: '#f8fafc',
    borderColor: '#3b82f6',
  },
  activeCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
  },
  inactiveCard: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  usersSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
});

export default AdminDashboard;
