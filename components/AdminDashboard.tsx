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
  Modal,
} from 'react-native';
import { homeStyles } from '../styles';
import { User, userManagementService, UserWithAmounts } from '../services';

interface AdminDashboardProps {
  adminData: any;
  onLogout: () => void;
}

const AdminDashboard = ({ adminData, onLogout }: AdminDashboardProps) => {
  const [users, setUsers] = useState<UserWithAmounts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loadingAmounts, setLoadingAmounts] = useState<Set<number>>(new Set());
  const [totalAmountsSum, setTotalAmountsSum] = useState<number>(0);

  const loadUsers = async () => {
    try {
      const result = await userManagementService.getAllUsers();
      if (result.success && result.users) {
        // Normalize backend field names to expected camelCase
        const normalized = result.users.map((u: any) => ({
          // preserve both id_user and id to keep downstream checks working
          id_user: u.id_user ?? (typeof u.id === 'number' ? u.id : Number(u.id)) ?? undefined,
          id: u.id ?? (u.id_user != null ? String(u.id_user) : undefined),
          name: u.name,
          phoneNumber: u.phoneNumber ?? u.phonenumber ?? u.phone_number ?? '',
          isActive: u.isActive ?? u.active ?? true,
          role: u.role,
          code_group: u.code_group,
          registeredAt: u.registeredAt ?? u.registeredat ?? u.createdAt ?? u.createdat,
          lastLogin: u.lastLogin ?? u.lastlogin ?? undefined,
          totalAmounts: (u as any).totalAmounts
        })) as UserWithAmounts[];

        setUsers(normalized);
        setMessage('');
        // Load amounts for all users
        loadUserAmounts(normalized as any);
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

  const loadUserAmounts = async (usersList: User[]) => {
    let grandTotal = 0;
    
    // Load amounts for each user
    for (const user of usersList) {
      const userId = user.id_user || user.id;
      if (userId) {
        setLoadingAmounts(prev => new Set(prev).add(Number(userId)));
        try {
          const amountsResult = await userManagementService.getUserTotalAmounts(Number(userId));
          if (amountsResult.success) {
            const userTotal = amountsResult.total || 0;
            grandTotal += userTotal;
            
            setUsers(prevUsers => 
              prevUsers.map(u => {
                const uId = u.id_user || u.id;
                if (uId === userId) {
                  return { ...u, totalAmounts: userTotal };
                }
                return u;
              })
            );
          }
        } catch (error) {
          console.error(`Error loading amounts for user ${userId}:`, error);
        } finally {
          setLoadingAmounts(prev => {
            const newSet = new Set(prev);
            newSet.delete(Number(userId));
            return newSet;
          });
        }
      }
    }
    
    // Update the grand total
    setTotalAmountsSum(grandTotal);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
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

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'No disponible';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'No disponible';
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getUserStats = () => {
    const totalUsers = users.length;
    const totalAmounts = totalAmountsSum;
    return { totalUsers, totalAmounts };
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
      <View style={homeStyles.header}>
        <View style={homeStyles.headerTop}>
          <View style={homeStyles.welcomeContainer}>
            <Text style={homeStyles.welcomeTitle}>
              Panel de Administrador
            </Text>
            <Text style={homeStyles.userName}>
              {adminData.name}
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
          <Text style={homeStyles.totalLabel}>Total de Aportes del grupo</Text>
          <Text style={homeStyles.totalAmountText}>
            {loadingAmounts.size > 0 ? (
              <ActivityIndicator size="small" color="#16a34a" />
            ) : (
              formatCurrency(totalAmountsSum)
            )}
          </Text>
        </View>
      </View>

      <View style={homeStyles.content}>
        {/* Modal de confirmación de cierre de sesión */}
        <Modal
          transparent={true}
          visible={showLogoutConfirm}
          animationType="fade"
          onRequestClose={cancelLogout}
        >
          <View style={homeStyles.modalContainer}>
            <View style={homeStyles.modalContent}>
              <Text style={homeStyles.messageText}>
                ¿Estás seguro que deseas cerrar sesión?
              </Text>
              <View style={homeStyles.confirmButtons}>
                <TouchableOpacity 
                  onPress={cancelLogout}
                  style={homeStyles.cancelButton}
                >
                  <Text style={homeStyles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={confirmLogout}
                  style={homeStyles.confirmButton}
                >
                  <Text style={homeStyles.confirmButtonText}>Cerrar Sesión</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        
        {message !== '' && (
          <View style={homeStyles.messageContainer}>
            <Text style={homeStyles.messageText}>
              {message}
            </Text>
          </View>
        )}

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
          users.map((user) => {
            const userId = user.id_user || user.id;
            const isLoadingAmount = userId ? loadingAmounts.has(Number(userId)) : false;
            
            return (
              <View
                key={userId}
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
                        marginBottom: 8,
                      }}>
                        Último acceso: {formatDate(user.lastLogin)}
                      </Text>
                    )}
                    
                    {/* Total de aportes */}
                    <View style={{
                      marginTop: 8,
                      paddingTop: 8,
                      borderTopWidth: 1,
                      borderTopColor: '#e5e7eb',
                    }}>
                      {isLoadingAmount ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <ActivityIndicator size="small" color="#16a34a" />
                          <Text style={{
                            fontSize: 13,
                            color: '#6b7280',
                            marginLeft: 8,
                          }}>
                            Cargando aportes...
                          </Text>
                        </View>
                      ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text style={{
                            fontSize: 13,
                            color: '#4b5563',
                            fontWeight: '600',
                          }}>
                            💰 Total de aportes:
                          </Text>
                          <Text style={{
                            fontSize: 16,
                            color: '#16a34a',
                            fontWeight: 'bold',
                          }}>
                            {user.totalAmounts !== undefined 
                              ? formatCurrency(user.totalAmounts)
                              : 'No disponible'}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

// Estilos específicos para el dashboard de administrador
const dashboardStyles = StyleSheet.create({
  usersCountText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
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
