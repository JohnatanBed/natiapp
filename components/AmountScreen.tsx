import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { launchCamera, launchImageLibrary, CameraOptions, ImageLibraryOptions } from 'react-native-image-picker';
import { amountStyles } from '../styles';
import { apiService } from '../services';
import { useNavigation } from '@react-navigation/native'
interface AmountScreenProps {
  phoneNumber: string;
  onBack: () => void;
  onUpdateTotal?: () => void;
}

interface ImageAsset {
  uri: string;
  type?: string;
  name?: string;
}

const AmountScreen = ({ phoneNumber, onBack, onUpdateTotal }: AmountScreenProps) => {
  const [cantidad, setCantidad] = useState('');
  const [loading, setLoading] = useState(false);
  const [imagen, setImagen] = useState<ImageAsset | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [descripcion, setDescripcion] = useState('');

  const fechaActual = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const horaActual = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Permiso para usar la cámara",
            message: "Necesitamos acceso a la cámara para tomar fotos.",
            buttonNeutral: "Preguntar luego",
            buttonNegative: "Cancelar",
            buttonPositive: "Aceptar"
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else {
          Alert.alert("Permiso denegado", "No se puede usar la cámara sin permiso");
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        let permission;
        if (Platform.Version >= 33) {
          permission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          );
        } else {
          permission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
          );
        }

        if (permission === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else {
          Alert.alert("Permiso denegado", "No se puede acceder a las imágenes");
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const seleccionarImagen = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) return;

    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.8,
      includeBase64: false,
    };

    try {
      setUploadingImage(true);

      launchImageLibrary(options, (response) => {
        if (response.didCancel) {
          console.log('Usuario canceló la selección de imagen');
        } else if (response.errorCode) {
          console.error('Error al seleccionar imagen:', response.errorMessage);
          Alert.alert('Error', 'No se pudo seleccionar la imagen. Intenta nuevamente.');
        } else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          if (asset.uri) {
            // Solo mostrar la imagen, no guardarla en la base de datos
            setImagen({
              uri: asset.uri,
              type: asset.type || 'image/jpeg',
              name: asset.fileName || 'photo.jpg',
            });
          }
        }
        setUploadingImage(false);
      });
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen. Intenta nuevamente.');
      setUploadingImage(false);
    }
  };

  const tomarFoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const options: CameraOptions = {
      mediaType: 'photo',
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.8,
      saveToPhotos: true,
    };

    try {
      setUploadingImage(true);

      launchCamera(options, (response) => {
        if (response.didCancel) {
          console.log('Usuario canceló la captura de foto');
        } else if (response.errorCode) {
          console.error('Error al tomar foto:', response.errorMessage);
          Alert.alert('Error', 'No se pudo tomar la foto. Intenta nuevamente.');
        } else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          if (asset.uri) {
            // Solo mostrar la imagen, no guardarla en la base de datos
            setImagen({
              uri: asset.uri,
              type: asset.type || 'image/jpeg',
              name: asset.fileName || 'photo.jpg',
            });
          }
        }
        setUploadingImage(false);
      });
    } catch (error) {
      console.error('Error al tomar foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto. Intenta nuevamente.');
      setUploadingImage(false);
    }
  };

  const eliminarImagen = () => {
    setImagen(null);
  };

  useEffect(() => {
    const loadToken = async () => {
      await apiService.loadToken();
    };

    loadToken();
  }, []);


  const handleAmount = async () => {
    if (!cantidad || cantidad.trim() === '') {
      Alert.alert('Error', 'Ingresa un valor para aportar...');
      return;
    }

    if (!cantidad || Number(cantidad) < 10000) {
      Alert.alert('Error', 'Ingresa un valor mayor a $10.000.');
      return;
    }

    if (Number(cantidad) > 999999) {
      Alert.alert('Error', 'Ingresa un valor menor a $1.000.000.');
      return;
    }

    setLoading(true);

    Alert.alert(
      'Confirmar valor',
      `¿Deseas aportar $${Number(cantidad).toLocaleString('es-CO')}?`,
      [
        {
          text: 'Corregir',
          style: 'cancel',
          onPress: () => setLoading(false)
        },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const response = await apiService.createAmount(cantidad, imagen || undefined);
              console.log('aporte creado correctamente:', response);
              if (typeof onUpdateTotal === 'function') {
                await onUpdateTotal();
              }
              Alert.alert('Aporte Exitoso', 'Tu aporte ha sido registrado correctamente.', [
                { text: 'OK', onPress: onBack }
              ],);
            } catch (error) {
              console.error('Error al crear aporte:', error);
              Alert.alert('Error', 'No se pudo procesar el aporte. Intenta nuevamente.', [
                { text: 'Entendido', style: 'cancel' }
              ]);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
    return;
  };

  const formatNumber = (text: string) => {
    const numericValue = text.replace(/\D/g, '');

    if (!numericValue) return '';

    return Number(numericValue).toLocaleString('es-CO');
  }

  return (
    <ScrollView style={amountStyles.container}>
      <View style={amountStyles.header}>
        <Text style={amountStyles.title}>
          Aportes
        </Text>
      </View>
      <View style={amountStyles.content}>

        <View style={amountStyles.formContainer}>
          <View style={amountStyles.inputGroup}>
            <Text style={amountStyles.label}>Cantidad del aporte *</Text>
            <View style={amountStyles.amountContainer}>
              <Text style={amountStyles.currencySymbol}>$</Text>
              <TextInput
                style={amountStyles.amountInput}
                value={formatNumber(cantidad)}
                onChangeText={(text) => {
                  const numericValue = text.replace(/\D/g, '');
                  setCantidad(numericValue);
                }}
                placeholder="0.000"
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <View style={amountStyles.inputGroup}>
            <Text style={amountStyles.label}>Adjuntar Imagen (Opcional)</Text>

            <View style={amountStyles.imageButtonsContainer}>
              <TouchableOpacity
                style={amountStyles.imageButton}
                onPress={seleccionarImagen}
                disabled={uploadingImage || !!imagen}>
                <Text style={amountStyles.imageButtonText}>
                  📁 Galería
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={amountStyles.imageButton}
                onPress={tomarFoto}
                disabled={uploadingImage || !!imagen}>
                <Text style={amountStyles.imageButtonText}>
                  📷 Cámara
                </Text>
              </TouchableOpacity>
            </View>

            {uploadingImage && (
              <View style={amountStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#16a34a" />
                <Text style={amountStyles.loadingText}>Cargando imagen...</Text>
              </View>
            )}

            {imagen && !uploadingImage && (
              <View style={amountStyles.imagePreviewContainer}>
                <Image
                  source={{ uri: imagen.uri }}
                  style={amountStyles.imagePreview}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={amountStyles.removeImageButton}
                  onPress={eliminarImagen}>
                  <Text style={amountStyles.removeImageText}>❌ Eliminar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={amountStyles.inputGroup}>
            <Text style={amountStyles.label}>Descripción (Opcional)</Text>
            <View style={amountStyles.amountContainer}>
              <TextInput
                style={amountStyles.amountInput}
                placeholder="Escribe una descripción..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                onChangeText={(text) => setDescripcion(text)}
                value={descripcion}
              />
            </View>

          </View>

        </View>
        {/*
        <View style={amountStyles.summaryCard}>
          <Text style={amountStyles.summaryTitle}>Resumen del Amount</Text>
          <View style={amountStyles.summaryRow}>
            <Text style={amountStyles.summaryLabel}>Cantidad:</Text>
            <Text style={amountStyles.summaryValue}>
              ${cantidad || '0.00'}
            </Text>
          </View>
          <View style={amountStyles.summaryRow}>
            <Text style={amountStyles.summaryLabel}>Fecha:</Text>
            <Text style={amountStyles.summaryValue}>{fechaActual}</Text>
          </View>
          <View style={amountStyles.summaryRow}>
            <Text style={amountStyles.summaryLabel}>Hora:</Text>
            <Text style={amountStyles.summaryValue}>{horaActual}</Text>
          </View>
        </View>
       */}
        <TouchableOpacity
          style={[
            amountStyles.amountButton,
            (!cantidad || loading || isNaN(Number(cantidad)) || Number(cantidad) <= 0) && amountStyles.amountButtonDisabled
          ]}
          onPress={handleAmount}
          disabled={!cantidad || loading || isNaN(Number(cantidad)) || Number(cantidad) <= 0}>
          <Text style={amountStyles.amountButtonText}>
            {loading ? 'Procesando...' : 'Realizar aporte'}
          </Text>



        </TouchableOpacity>

        <TouchableOpacity
          style={amountStyles.backButton}
          onPress={onBack}
          disabled={loading}>
          <Text style={amountStyles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AmountScreen;