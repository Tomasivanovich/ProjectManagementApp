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
        // Nota: `api` es una instancia personalizada (no axios) que
        // obtiene el token desde AsyncStorage en cada petición.
        // No intentamos usar `api.defaults.headers` porque no existe.
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

      // El backend puede devolver distintas formas. Normalizamos aquí.
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
        // Si la respuesta no contiene token/usuario, lanzamos con detalle para depuración.
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
      // Re-lanzar con message claro para la UI
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
      console.log("🔐 [AuthContext] Iniciando loginWithGoogle...");
      console.log(
        "📦 [AuthContext] Token recibido:",
        accessToken.substring(0, 20) + "..."
      );

      const response = await authService.loginWithGoogle(accessToken);

      // ✅ NORMALIZA LA RESPUESTA COMO EN LAS OTRAS FUNCIONES
      const newToken =
        response?.data?.token || // Primero buscamos en response.data.token
        response?.token || // Luego en response.token
        response?.access_token || // O en response.access_token
        null;

      const userData =
        response?.data?.user || // Primero buscamos en response.data.user
        response?.user || // Luego en response.user
        response?.usuario || // O en response.usuario
        response?.data?.usuario || // O en response.data.usuario
        null;

      console.log("📨 [AuthContext] Respuesta completa:", response);
      console.log("🔑 [AuthContext] Token extraído:", newToken ? "Sí" : "No");
      console.log("👤 [AuthContext] Usuario extraído:", userData ? "Sí" : "No");

      if (!newToken || !userData) {
        console.error(
          "❌ [AuthContext] Respuesta inválida del servicio:",
          response
        );
        throw new Error("Respuesta de login con Google inválida del servidor");
      }

      console.log("✅ [AuthContext] Login exitoso, guardando token...");

      await AsyncStorage.setItem("userToken", newToken);
      await AsyncStorage.setItem("userData", JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      console.log("🎉 [AuthContext] Usuario autenticado:", userData.email);

      return { token: newToken, user: userData };
    } catch (error) {
      console.error("❌ [AuthContext] Error en loginWithGoogle:", error);

      // ✅ MEJOR MANEJO DE ERRORES
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

  // ✅ FUNCIÓN PARA LOGIN CON DISCORD
  const loginWithDiscord = async (accessToken) => {
    try {
      const response = await authService.loginWithDiscord(accessToken);
      const { token: newToken, user: userData } = response;

      await AsyncStorage.setItem("userToken", newToken);
      await AsyncStorage.setItem("userData", JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      // El token ya está en AsyncStorage; ApiService lo utilizará.

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

      // 3. No es necesario manipular `api.defaults` (no usa axios).

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
