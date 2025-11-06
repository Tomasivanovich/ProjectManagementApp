import React, { useState, useEffect, useRef } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import * as AuthSession from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

const GoogleLoginButton = () => {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const responseProcessed = useRef(false);

  const googleConfig = Constants.expoConfig?.extra?.google;

  // ✅ CONFIGURACIÓN ÚNICA PARA AMBAS PLATAFORMAS
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: googleConfig?.webClientId,
    androidClientId: googleConfig?.androidClientId,
    scopes: ["openid", "profile", "email"],
  });

  // ✅ EFECTO ÚNICO PARA PROCESAR RESPUESTA
  useEffect(() => {
    console.log("🔄 [Universal] RESPONSE:", response?.type);
    
    if (responseProcessed.current) return;

    if (response?.type === "success") {
      responseProcessed.current = true;
      
      let accessToken;
      
      if (Platform.OS === "web") {
        // Para web
        accessToken = response.authentication?.accessToken || response.params?.access_token;
      } else {
        // Para Android/iOS
        accessToken = response.authentication?.accessToken;
      }

      console.log("🔑 [Universal] Token:", accessToken ? accessToken.substring(0, 20) + "..." : "NO ENCONTRADO");

      if (accessToken) {
        handleGoogleSignIn(accessToken);
      } else {
        console.error("❌ [Universal] No se pudo extraer token");
        Alert.alert("Error", "No se pudo obtener el token de acceso");
        setLoading(false);
        responseProcessed.current = false;
      }
    } else if (response?.type === "error") {
      console.error("❌ [Universal] Error:", response.error);
      Alert.alert("Error", `Error: ${response.error?.message || response.error}`);
      setLoading(false);
      responseProcessed.current = false;
    }
  }, [response]);

  // ✅ FUNCIÓN ÚNICA PARA MANEJAR EL LOGIN
  const handlePress = async () => {
    if (!request) {
      Alert.alert("Error", "Google OAuth no está configurado");
      return;
    }

    console.log("🚀 [Universal] Iniciando login...");
    setLoading(true);
    responseProcessed.current = false;

    try {
      await promptAsync();
    } catch (error) {
      console.error("💥 [Universal] Error en promptAsync:", error);
      Alert.alert("Error", "No se pudo conectar con Google");
      setLoading(false);
      responseProcessed.current = false;
    }
  };

  // ✅ FUNCIÓN PARA PROCESAR EL TOKEN
  const handleGoogleSignIn = async (accessToken) => {
    try {
      console.log("🔐 [Button] Iniciando login con token...");
      await loginWithGoogle(accessToken);
      console.log("✅ [Button] Login completado exitosamente");
    } catch (error) {
      console.error("❌ [Button] Error:", error);
      Alert.alert("Error", error.message || "Error al iniciar sesión con Google");
    } finally {
      setLoading(false);
      // Reset después de un delay para evitar problemas
      setTimeout(() => {
        responseProcessed.current = false;
      }, 1000);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, loading && styles.buttonDisabled]}
      onPress={handlePress}
      disabled={loading || !request}
    >
      <View style={styles.buttonContent}>
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <Text style={styles.icon}>G</Text>
            <Text style={styles.buttonText}>Continuar con Google</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#DB4437",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#C1351D",
    minHeight: 50,
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#CCCCCC",
    borderColor: "#999999",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 12,
    backgroundColor: "white",
    color: "#DB4437",
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: "center",
    lineHeight: 22,
    overflow: "hidden",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default GoogleLoginButton;