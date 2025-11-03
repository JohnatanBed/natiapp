import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { homeStyles } from '../styles';

interface EventsScreenProps {
  phoneNumber?: string;
  onBack: () => void;
}

interface Ticket {
  number: number;
  status: 'available' | 'selected' | 'purchased' | 'reserved';
  owner?: string;
}

const EventsScreen = ({ phoneNumber, onBack }: EventsScreenProps) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // Configuración de la rifa
  const TICKET_PRICE = 5000;
  const TOTAL_TICKETS = 100;
  const PRIZE = '$500.000';

  useEffect(() => {
    initializeTickets();
  }, []);

  const initializeTickets = () => {
    const newTickets: Ticket[] = [];
    for (let i = 1; i <= TOTAL_TICKETS; i++) {
      newTickets.push({
        number: i,
        status: 'available',
      });
    }
    // Simular algunos boletos ya vendidos (esto vendría del backend)
    const soldTickets = [5, 12, 23, 34, 45, 56, 67, 78, 89, 90];
    soldTickets.forEach(num => {
      const ticket = newTickets.find(t => t.number === num);
      if (ticket) {
        ticket.status = 'purchased';
        ticket.owner = 'Otro usuario';
      }
    });
    setTickets(newTickets);
  };

  const handleTicketPress = (ticketNumber: number) => {
    const ticket = tickets.find(t => t.number === ticketNumber);
    if (!ticket || ticket.status === 'purchased' || ticket.status === 'reserved') {
      return;
    }

    if (selectedTickets.includes(ticketNumber)) {
      setSelectedTickets(selectedTickets.filter(n => n !== ticketNumber));
      updateTicketStatus(ticketNumber, 'available');
    } else {
      if (selectedTickets.length < 10) {
        setSelectedTickets([...selectedTickets, ticketNumber]);
        updateTicketStatus(ticketNumber, 'selected');
      } else {
        Alert.alert('Límite alcanzado', 'Puedes seleccionar máximo 10 boletos a la vez');
      }
    }
  };

  const updateTicketStatus = (ticketNumber: number, status: Ticket['status']) => {
    setTickets(tickets.map(t => 
      t.number === ticketNumber ? { ...t, status } : t
    ));
  };

  const handlePurchase = () => {
    if (selectedTickets.length === 0) {
      Alert.alert('Sin selección', 'Por favor selecciona al menos un boleto');
      return;
    }
    setShowPurchaseModal(true);
  };

  const confirmPurchase = async () => {

    setIsProcessing(true);
    setMessage('Procesando compra...');
    setMessageType('');

    // Simular llamada al backend
    setTimeout(() => {
      // Marcar boletos como comprados
      selectedTickets.forEach(ticketNumber => {
        updateTicketStatus(ticketNumber, 'purchased');
        const ticket = tickets.find(t => t.number === ticketNumber);
        if (ticket) {
          ticket.owner = userName;
        }
      });

      setMessage('¡Compra exitosa! Tus boletos han sido registrados.');
      setMessageType('success');
      setIsProcessing(false);

      setTimeout(() => {
        setShowPurchaseModal(false);
        setSelectedTickets([]);
        setUserName('');
        setMessage('');
        setMessageType('');
        Alert.alert(
          '¡Éxito!',
          `Has comprado ${selectedTickets.length} boleto(s) por $${(selectedTickets.length * TICKET_PRICE).toLocaleString('es-CO')}`,
          [{ text: 'OK' }]
        );
      }, 2000);
    }, 2000);
  };

  const cancelPurchase = () => {
    setShowPurchaseModal(false);
    setUserName('');
    setMessage('');
    setMessageType('');
  };

  const getTicketColor = (status: Ticket['status']) => {
    switch (status) {
      case 'available':
        return '#d1fae5'; // Verde claro
      case 'selected':
        return '#fef3c7'; // Amarillo
      case 'purchased':
        return '#fecaca'; // Rojo claro
      case 'reserved':
        return '#e5e7eb'; // Gris
      default:
        return '#ffffff';
    }
  };

  const getTicketBorderColor = (status: Ticket['status']) => {
    switch (status) {
      case 'available':
        return '#10b981';
      case 'selected':
        return '#f59e0b';
      case 'purchased':
        return '#ef4444';
      case 'reserved':
        return '#9ca3af';
      default:
        return '#d1d5db';
    }
  };

  const totalPrice = selectedTickets.length * TICKET_PRICE;
  const availableCount = tickets.filter(t => t.status === 'available').length;
  const soldCount = tickets.filter(t => t.status === 'purchased').length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={homeStyles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rifa</Text>
          <Text style={styles.headerSubtitle}>Premio: {PRIZE}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Información de la rifa */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Información de la Rifa</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>💰 Precio por boleto:</Text>
            <Text style={styles.infoValue}>${TICKET_PRICE.toLocaleString('es-CO')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🎁 Premio:</Text>
            <Text style={styles.infoValue}>{PRIZE}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>✅ Disponibles:</Text>
            <Text style={styles.infoValue}>{availableCount} / {TOTAL_TICKETS}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🔴 Vendidos:</Text>
            <Text style={styles.infoValue}>{soldCount}</Text>
          </View>
        </View>

        {/* Leyenda */}
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Leyenda:</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendBox, { backgroundColor: '#d1fae5', borderColor: '#10b981' }]} />
            <Text style={styles.legendText}>Disponible</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendBox, { backgroundColor: '#fef3c7', borderColor: '#f59e0b' }]} />
            <Text style={styles.legendText}>Seleccionado</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendBox, { backgroundColor: '#fecaca', borderColor: '#ef4444' }]} />
            <Text style={styles.legendText}>Vendido</Text>
          </View>
        </View>

        {/* Selección actual */}
        {selectedTickets.length > 0 && (
          <View style={styles.selectionCard}>
            <Text style={styles.selectionTitle}>
              Boletos seleccionados: {selectedTickets.length}
            </Text>
            <Text style={styles.selectionNumbers}>
              {selectedTickets.sort((a, b) => a - b).join(', ')}
            </Text>
            <Text style={styles.selectionTotal}>
              Total: ${totalPrice.toLocaleString('es-CO')}
            </Text>
            
            {/* Botón de compra dentro del panel */}
            <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase}>
              <Text style={styles.purchaseButtonText}>
                Comprar {selectedTickets.length} boleto(s) - ${totalPrice.toLocaleString('es-CO')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Grid de boletos */}
        <View style={styles.ticketsGrid}>
          {tickets.map((ticket) => (
            <TouchableOpacity
              key={ticket.number}
              style={[
                styles.ticket,
                {
                  backgroundColor: getTicketColor(ticket.status),
                  borderColor: getTicketBorderColor(ticket.status),
                },
                (ticket.status === 'purchased' || ticket.status === 'reserved') && styles.ticketDisabled,
              ]}
              onPress={() => handleTicketPress(ticket.number)}
              disabled={ticket.status === 'purchased' || ticket.status === 'reserved'}
            >
              <Text style={[
                styles.ticketNumber,
                ticket.status === 'selected' && styles.ticketNumberSelected,
                ticket.status === 'purchased' && styles.ticketNumberDisabled,
              ]}>
                {ticket.number}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Modal de confirmación de compra */}
      <Modal
        transparent={true}
        visible={showPurchaseModal}
        animationType="fade"
        onRequestClose={cancelPurchase}
      >
        <View style={homeStyles.modalContainer}>
          <View style={homeStyles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Compra</Text>
            
            {message !== '' && (
              <View style={[
                styles.messageContainer,
                messageType === 'error' && styles.messageError,
                messageType === 'success' && styles.messageSuccess,
              ]}>
                <Text style={[
                  styles.messageText,
                  messageType === 'error' && styles.messageTextError,
                  messageType === 'success' && styles.messageTextSuccess,
                ]}>
                  {message}
                </Text>
              </View>
            )}

            <View style={styles.purchaseDetails}>
              <Text style={styles.purchaseDetailText}>
                Boletos: {selectedTickets.sort((a, b) => a - b).join(', ')}
              </Text>
              <Text style={styles.purchaseDetailText}>
                Cantidad: {selectedTickets.length}
              </Text>
              <Text style={styles.purchaseTotalText}>
                Total a pagar: ${totalPrice.toLocaleString('es-CO')}
              </Text>
            </View>


            <View style={homeStyles.confirmButtons}>
              <TouchableOpacity 
                onPress={cancelPurchase} 
                style={homeStyles.cancelButton}
                disabled={isProcessing}
              >
                <Text style={homeStyles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={confirmPurchase} 
                style={[homeStyles.confirmButton, isProcessing && styles.buttonDisabled]}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={homeStyles.confirmButtonText}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  headerContent: {
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  legendCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#4b5563',
  },
  selectionCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  selectionNumbers: {
    fontSize: 14,
    color: '#78350f',
    marginBottom: 8,
  },
  selectionTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 16,
  },
  ticketsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  ticket: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketDisabled: {
    opacity: 0.5,
  },
  ticketNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  ticketNumberSelected: {
    color: '#92400e',
  },
  ticketNumberDisabled: {
    color: '#9ca3af',
  },
  purchaseButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  messageError: {
    backgroundColor: '#fee2e2',
  },
  messageSuccess: {
    backgroundColor: '#d1fae5',
  },
  messageText: {
    textAlign: 'center',
    fontSize: 14,
  },
  messageTextError: {
    color: '#991b1b',
  },
  messageTextSuccess: {
    color: '#065f46',
  },
  purchaseDetails: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  purchaseDetailText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  purchaseTotalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default EventsScreen;