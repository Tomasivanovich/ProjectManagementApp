import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authService from "../services/auth";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("userToken");
      const storedUser = await AsyncStorage.getItem("userData");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Configurar el token en las peticiones API
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error("Error checking auth state:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const { token: newToken, user: userData } = response.data;

      await AsyncStorage.setItem("userToken", newToken);
      await AsyncStorage.setItem("userData", JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      
      // Configurar el token en las peticiones API
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      const { token: newToken, user: userInfo } = response.data;

      await AsyncStorage.setItem("userToken", newToken);
      await AsyncStorage.setItem("userData", JSON.stringify(userInfo));

      setToken(newToken);
      setUser(userInfo);
      
      // Configurar el token en las peticiones API
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return response;
    } catch (error) {
      throw error;
    }
  };

  // Nueva función para login con Google
  const loginWithGoogle = async (accessToken) => {
    try {
      const response = await authService.loginWithGoogle(accessToken);
      const { token: newToken, user: userData } = response.data;

      await AsyncStorage.setItem("userToken", newToken);
      await AsyncStorage.setItem("userData", JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      
      // Configurar el token en las peticiones API
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return response;
    } catch (error) {
      throw error;
    }
  };

  // Nueva función para login con Discord
  const loginWithDiscord = async (accessToken) => {
    try {
      const response = await authService.loginWithDiscord(accessToken);
      const { token: newToken, user: userData } = response.data;

      await AsyncStorage.setItem("userToken", newToken);
      await AsyncStorage.setItem("userData", JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      
      // Configurar el token en las peticiones API
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // 1. Limpiar AsyncStorage
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userData");

      // 2. Limpiar estado
      setUser(null);
      setToken(null);

      // 3. Remover token de las peticiones API
      delete api.defaults.headers.common['Authorization'];

      console.log("✅ Sesión cerrada correctamente");
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    AsyncStorage.setItem("userData", JSON.stringify(userData));
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    loginWithGoogle,
    loginWithDiscord,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};