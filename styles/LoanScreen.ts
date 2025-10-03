
import { StyleSheet } from 'react-native';

export const loanStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
header: {
   backgroundColor: '#16a34a',
   padding: 20,
   paddingTop: 90,
   alignItems: 'center',
 },
  innerContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  content: {
    padding: 20,
    paddingBottom: 40, // Espacio extra al final para mejor scroll
  },
  scrollContent: {
    flexGrow: 1,
  },
  title: {
   fontSize: 24,
   fontWeight: 'bold',
   color: 'white',
   marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#4b5563',
    marginBottom: 12,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  formContainer:{
    marginBottom: 20,
  },
  loanContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#16a34a',
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
    marginRight: 8,
  },
inputGroup: {
  marginBottom: 20,
},
  loanInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    paddingVertical: 16,

  },
  button: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  messageContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successContainer: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  infoContainer: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  successText: {
    color: '#16a34a',
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
  },
  infoText: {
    color: '#2563eb',
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
  },
  requestButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'center',
    minWidth: 250,
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 3,
  },
  requestButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 30,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#16a34a',
    fontSize: 17,
    fontWeight: '600',
  },
  message:{
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Estilos para la lista de préstamos
  loanListContainer: {
    marginTop: 20,
  },
  loanListTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  loanItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  loanAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  loanStatus: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  loanDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  noLoansText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Estados de préstamo
  statusPending: {
    color: '#f59e0b', // Amarillo para pendiente
  },
  statusApproved: {
    color: '#16a34a', // Verde para aprobado
  },
  statusRejected: {
    color: '#dc2626', // Rojo para rechazado
  },
});