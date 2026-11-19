/* global jest */
// AsyncStorage keeps state in memory during tests.
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

// Deterministic stand-in for SHA-256 so password checks behave like the real thing.
jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: jest.fn(async (_algorithm, s) => `hash:${s.split('').reverse().join('')}`),
}));
jest.mock('expo-secure-store', () => ({ setItemAsync: jest.fn(), getItemAsync: jest.fn(async () => null), deleteItemAsync: jest.fn() }));
