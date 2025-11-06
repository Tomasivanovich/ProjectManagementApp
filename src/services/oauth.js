import api from './api';

export const oauthService = {
  // Autenticación con Google
  loginWithGoogle: async (accessToken) => {
    try {
      const response = await api.post('/auth/google', {
        access_token: accessToken
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al autenticar con Google');
    }
  },
};