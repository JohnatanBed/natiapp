import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { apiService } from '../services';

const ApiConnectionTester: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [currentUrl, setCurrentUrl] = useState<string>(apiService.getBaseURL());

  const testGetRoot = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // La ruta / debe devolver info básica de la API
      const response = await apiService.get<{message: string, version: string}>('/');
      setResult(JSON.stringify(response, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const updateBaseUrl = () => {
    if (customUrl) {
      apiService.setBaseURL(customUrl);
      setCurrentUrl(apiService.getBaseURL());
      setResult('');
      setError(null);
    }
  };

  const resetToDefault = () => {
    // Restablecer a la URL por defecto para emuladores Android
    apiService.setBaseURL('http://10.0.2.2:5000');
    setCurrentUrl(apiService.getBaseURL());
    setCustomUrl('');
    setResult('');
    setError(null);
  };

  useEffect(() => {
    // Actualiza el estado currentUrl cuando cambia la URL base
    setCurrentUrl(apiService.getBaseURL());
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Prueba de Conexión API</Text>
      
      <View style={styles.urlContainer}>
        <Text style={styles.subtitle}>URL Actual:</Text>
        <Text style={styles.currentUrl}>{currentUrl}</Text>
        
        <Text style={styles.label}>Cambiar URL:</Text>
        <TextInput
          style={styles.input}
          value={customUrl}
          onChangeText={setCustomUrl}
          placeholder="http://192.168.1.XX:5000"
          autoCapitalize="none"
        />
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={updateBaseUrl}
            disabled={!customUrl}
          >
            <Text style={styles.buttonText}>Actualizar URL</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={resetToDefault}
          >
            <Text style={styles.buttonText}>Reset a Default</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={testGetRoot}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Probando...' : 'Probar Conexión'}
        </Text>
      </TouchableOpacity>
      
      {isLoading && (
        <ActivityIndicator size="large" color="#007BFF" style={styles.loading} />
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error:</Text>
          <Text style={styles.errorText}>{error}</Text>
          
          <View style={styles.tipContainer}>
            <Text style={styles.tipTitle}>Posibles soluciones:</Text>
            <Text style={styles.tipText}>1. Asegúrate que el servidor backend está ejecutándose</Text>
            <Text style={styles.tipText}>2. Si usas un emulador Android, usa 10.0.2.2 en lugar de localhost</Text>
            <Text style={styles.tipText}>3. Si usas un dispositivo físico, usa la IP de tu computadora</Text>
            <Text style={styles.tipText}>4. Verifica que el puerto sea correcto (generalmente 5000)</Text>
          </View>
        </View>
      )}
      
      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Respuesta:</Text>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#555',
  },
  currentUrl: {
    fontSize: 14,
    marginBottom: 15,
    color: '#007BFF',
    fontWeight: '500',
  },
  urlContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
    flex: 0.48,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  loading: {
    marginVertical: 20,
  },
  errorContainer: {
    backgroundColor: '#FFEEEE',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF0000',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#CC0000',
    marginBottom: 5,
  },
  errorText: {
    color: '#CC0000',
    marginBottom: 10,
  },
  tipContainer: {
    backgroundColor: '#FFFFF0',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  tipTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#666',
  },
  tipText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  resultContainer: {
    backgroundColor: '#E8F4FE',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007BFF',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 5,
  },
  resultText: {
    color: '#333',
    fontFamily: 'monospace',
  },
});

export default ApiConnectionTester;
