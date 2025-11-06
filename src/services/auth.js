import api from './api';

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

  // ✅ CORREGIDO: Usa la ruta correcta y envía los datos apropiados
  async loginWithGoogle(accessToken) {
    try {
      const response = await api.post('/auth/google', {
        access_token: accessToken
      });
      return response;
    } catch (error) {
      console.error("❌ [AuthService] Error en loginWithGoogle:", error);
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
}

export default new AuthService();