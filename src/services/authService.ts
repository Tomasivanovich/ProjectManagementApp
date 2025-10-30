// src/services/authService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  nombre: string;
  email: string;
  password: string;
}

// ---------------- LOGIN ----------------
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    
    // Los datos vienen dentro de response.data.data
    const data = response.data.data;

    const token = data.token;
    if (token) {
      await AsyncStorage.setItem('userToken', token);
      console.log('Token guardado correctamente:', token);
    } else {
      console.warn('No se recibió token del backend');
    }

    return data; // { token, user }
  } catch (error: any) {
    console.error('Error en login:', error.response?.data || error.message);
    throw error;
  }
};

// ---------------- REGISTER ----------------
export const register = async (nombre: string, email: string, password: string) => {
  try {
    const response = await api.post('/auth/register', { nombre, email, password });
    
    const data = response.data.data;
    const token = data.token;
    if (token) {
      await AsyncStorage.setItem('userToken', token);
      console.log('Token guardado después de registro:', token);
    } else {
      console.warn('No se recibió token del backend');
    }

    return data; // { token, user }
  } catch (error: any) {
    console.error('Error en registro:', error.response?.data || error.message);
    throw error;
  }
};

// ---------------- REFRESH TOKEN ----------------
export const refreshToken = async () => {
  try {
    const response = await api.post('/auth/refresh');
    const data = response.data.data;

    const token = data.token;
    if (token) {
      await AsyncStorage.setItem('userToken', token);
      console.log('Token actualizado correctamente:', token);
    }

    return data; // { token, user }
  } catch (error: any) {
    console.error('Error en refresh token:', error.response?.data || error.message);
    throw error;
  }
};

// ---------------- LOGOUT ----------------
export const logout = async () => {
  try {
    await AsyncStorage.removeItem('userToken');
    console.log('Usuario deslogueado correctamente');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw error;
  }
};
