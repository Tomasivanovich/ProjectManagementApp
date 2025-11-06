import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Nuevas funciones para OAuth
  async loginWithGoogle(accessToken) {
    try {
      const response = await api.post('/auth/google', {
        access_token: accessToken
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async loginWithDiscord(accessToken) {
    try {
      const response = await api.post('/auth/discord', {
        access_token: accessToken
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async refreshToken() {
    try {
      const response = await api.post('/auth/refresh');
      return response;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    // Limpiar token del almacenamiento
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
  }
}

export default new AuthService();