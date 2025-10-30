// src/screens/auth/LoginScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { login as loginService } from "../../services/authService";

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Google Auth
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId:
      "246365364357-d7l1ch3kj35082cdacngrv03huscl6fg.apps.googleusercontent.com",
  });

  // Manejar login tradicional
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Completá todos los campos");
      return;
    }

    setLoading(true);
    try {
      const data = await loginService(email, password);
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      navigation.reset({ index: 0, routes: [{ name: "Projects" }] });
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Error al iniciar sesión"
      );
    } finally {
      setLoading(false);
    }
  };

  // Manejar login con Google
  const handleGoogleLogin = async (id_token: string) => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Error login Google");

      await AsyncStorage.setItem("token", data.data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.data.user));

      navigation.reset({ index: 0, routes: [{ name: "Projects" }] });
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Detectar respuesta de Google
  useEffect(() => {
    if (response?.type === "success") {
      const id_token = response.params.id_token; // debe existir
      if (!id_token) {
        Alert.alert("Error", "No se recibió el token de Google");
        return;
      }
      handleGoogleLogin(id_token);
    }
  }, [response]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Iniciá sesión para continuar</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Cargando..." : "Iniciar sesión"}
          </Text>
        </TouchableOpacity>

        <Text style={{ textAlign: "center", marginVertical: 15 }}>o</Text>

        <TouchableOpacity
          style={[styles.button, styles.googleButton]}
          onPress={() => promptAsync()}
          disabled={!request || loading}
        >
          <Text style={styles.buttonText}>Iniciar sesión con Google</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          ¿No tenés cuenta?{" "}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate("RegisterScreen")}
          >
            Registrate
          </Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f6fa",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    maxWidth: 500,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 25,
    marginTop: 5,
  },
  input: {
    width: "100%",
    backgroundColor: "#f1f3f6",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  googleButton: { backgroundColor: "#DB4437" },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  footerText: { textAlign: "center", color: "#555", marginTop: 20 },
  link: { color: "#007AFF", fontWeight: "600" },
});

export default LoginScreen;
