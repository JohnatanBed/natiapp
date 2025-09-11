// Jest setup file para React Native

// Mock para AsyncStorage
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock para react-native-sms-retriever
jest.mock('react-native-sms-retriever', () => ({
  requestPhoneNumber: jest.fn(() => Promise.resolve('1234567890')),
  startSmsRetriever: jest.fn(() => Promise.resolve(true)),
  addSmsListener: jest.fn(),
  removeSmsListener: jest.fn(),
}));

// Mock para otros módulos nativos comunes
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Silenciar warnings de deprecated APIs en tests
console.warn = jest.fn();
console.error = jest.fn();
