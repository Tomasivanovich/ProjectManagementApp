import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";

const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 375;

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [errors, setErrors] = useState({});
  const { register } = useAuth();

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/; // Solo letras y espacios

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    } else if (/\d/.test(formData.nombre)) {
      newErrors.nombre = "El nombre no puede contener números";
    } else if (!nombreRegex.test(formData.nombre)) {
      newErrors.nombre = "El nombre solo puede contener letras y espacios";
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres";
    }

    if (!formData.email) {
      newErrors.email = "El email es requerido";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Por favor ingresa un email válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showMessage = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register({
        nombre: formData.nombre.trim(),
        email: formData.email,
        password: formData.password,
      });
      // Si el registro es exitoso, el AuthContext debería redirigir automáticamente
    } catch (error) {
      showMessage("Error", error.message || "Error al registrar usuario");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.nombre &&
      formData.email &&
      formData.password &&
      formData.confirmPassword
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Regístrate para comenzar</Text>
        </View>

        <View style={styles.form}>
          {/* Campo Nombre */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.nombre && styles.inputError]}
              placeholder="Nombre completo *"
              placeholderTextColor="#8E8E93"
              value={formData.nombre}
              onChangeText={(value) => handleChange("nombre", value)}
              autoCapitalize="words"
              editable={!loading}
            />
            {errors.nombre && (
              <Text style={styles.fieldErrorText}>{errors.nombre}</Text>
            )}
          </View>

          {/* Campo Email */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Email *"
              placeholderTextColor="#8E8E93"
              value={formData.email}
              onChangeText={(value) => handleChange("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              editable={!loading}
            />
            {errors.email && (
              <Text style={styles.fieldErrorText}>{errors.email}</Text>
            )}
          </View>

          {/* Campo Contraseña */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Contraseña *"
              placeholderTextColor="#8E8E93"
              value={formData.password}
              onChangeText={(value) => handleChange("password", value)}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
              textContentType="newPassword"
              editable={!loading}
            />
            {errors.password && (
              <Text style={styles.fieldErrorText}>{errors.password}</Text>
            )}
          </View>

          {/* Campo Confirmar Contraseña */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                errors.confirmPassword && styles.inputError,
              ]}
              placeholder="Confirmar contraseña *"
              placeholderTextColor="#8E8E93"
              value={formData.confirmPassword}
              onChangeText={(value) => handleChange("confirmPassword", value)}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
              textContentType="newPassword"
              editable={!loading}
            />
            {errors.confirmPassword && (
              <Text style={styles.fieldErrorText}>
                {errors.confirmPassword}
              </Text>
            )}
          </View>

          {/* Botón Registrarse */}
          <TouchableOpacity
            style={[
              styles.button,
              (loading || !isFormValid()) && styles.buttonDisabled,
            ]}
            onPress={handleRegister}
            disabled={loading || !isFormValid()}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Registrarse</Text>
            )}
          </TouchableOpacity>

          {/* Enlace a Login */}
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate("Login")}
            disabled={loading}
          >
            <Text style={styles.linkText}>
              ¿Ya tienes cuenta?{" "}
              <Text style={styles.linkBold}>Inicia sesión aquí</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal para mensajes */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: isSmallDevice ? 16 : 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: isSmallDevice ? 30 : 40,
  },
  title: {
    fontSize: isSmallDevice ? 28 : 32,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: isSmallDevice ? 14 : 16,
    color: "#636E72",
    textAlign: "center",
  },
  form: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#FFFFFF",
    padding: isSmallDevice ? 14 : 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#DFE6E9",
    color: "#2D3436",
    fontSize: isSmallDevice ? 14 : 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputError: {
    borderColor: "#E74C3C",
  },
  fieldErrorText: {
    color: "#E74C3C",
    fontSize: isSmallDevice ? 12 : 13,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    backgroundColor: "#0984E3",
    padding: isSmallDevice ? 14 : 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#0984E3",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: "#B2BEC3",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: "bold",
  },
  linkButton: {
    alignItems: "center",
    padding: 8,
  },
  linkText: {
    color: "#636E72",
    fontSize: isSmallDevice ? 13 : 14,
    textAlign: "center",
  },
  linkBold: {
    color: "#0984E3",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#636E72",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: "#0984E3",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default RegisterScreen;
