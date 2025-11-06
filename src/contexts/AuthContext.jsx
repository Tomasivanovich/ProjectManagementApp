import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authService from "../services/auth";
import api from "../services/api";

const API_URL = "https://projectmanagementappapi.onrender.com";

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

      const newToken =
        response?.token ||
        response?.data?.token ||
        response?.access_token ||
        null;

      const userData =
        response?.user ||
        response?.data?.user ||
        response?.usuario ||
        response?.data?.usuario ||
        null;

      if (!newToken || !userData) {
        console.error("AuthContext: respuesta inesperada de login:", response);
        throw new Error("Respuesta de login inválida del servidor");
      }

      await AsyncStorage.setItem("userToken", newToken);
      await AsyncStorage.setItem("userData", JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      return { token: newToken, user: userData };
    } catch (error) {
      console.error("AuthContext.login error:", error);
      throw new Error(error.message || "Error al iniciar sesión");
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);

      const newToken =
        response?.token ||
        response?.data?.token ||
        response?.access_token ||
        null;

      const userInfo =
        response?.user ||
        response?.data?.user ||
        response?.usuario ||
        response?.data?.usuario ||
        null;

      if (!newToken || !userInfo) {
        console.error(
          "AuthContext: respuesta inesperada de register:",
          response
        );
        throw new Error("Respuesta de registro inválida del servidor");
      }

      await AsyncStorage.setItem("userToken", newToken);
      await AsyncStorage.setItem("userData", JSON.stringify(userInfo));

      setToken(newToken);
      setUser(userInfo);

      return { token: newToken, user: userInfo };
    } catch (error) {
      console.error("AuthContext.register error:", error);
      throw new Error(error.message || "Error al registrar usuario");
    }
  };

  const loginWithGoogle = async (accessToken) => {
    try {
      console.log("[AuthContext] Iniciando loginWithGoogle...");
      console.log(
        "[AuthContext] Token recibido:",
        accessToken.substring(0, 20) + "..."
      );

      const response = await authService.loginWithGoogle(accessToken);

      // Normaliza la respuesta
      const newToken =
        response?.data?.token || 
        response?.token || 
        response?.access_token || 
        null;

      const userData =
        response?.data?.user || 
        response?.user || 
        response?.usuario || 
        response?.data?.usuario || 
        null;

      console.log("[AuthContext] Respuesta completa:", response);
      console.log("[AuthContext] Token extraído:", newToken ? "Sí" : "No");
      console.log("[AuthContext] Usuario extraído:", userData ? "Sí" : "No");

      if (!newToken || !userData) {
        console.error(
          "[AuthContext] Respuesta inválida del servicio:",
          response
        );
        throw new Error("Respuesta de login con Google inválida del servidor");
      }

      console.log("[AuthContext] Login exitoso, guardando token...");

      await AsyncStorage.setItem("userToken", newToken);
      await AsyncStorage.setItem("userData", JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      console.log("[AuthContext] Usuario autenticado:", userData.email);

      return { token: newToken, user: userData };
    } catch (error) {
      console.error("[AuthContext] Error en loginWithGoogle:", error);

      if (error.response) {
        // Error del servidor
        throw new Error(error.response.data?.message || "Error del servidor");
      } else if (error.request) {
        // Error de red
        throw new Error("Error de conexión con el servidor");
      } else {
        // Otros errores
        throw new Error(error.message || "Error al iniciar sesión con Google");
      }
    }
  };

  const logout = async () => {
    try {
      // Limpiar AsyncStorage
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userData");

      // Limpiar estado
      setUser(null);
      setToken(null);

      console.log("Sesión cerrada correctamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
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
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
