import React, { useState, useEffect } from "react";
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
import { useRoute, useNavigation } from "@react-navigation/native";
import tasksService from "../../services/tasks";
import projectsService from "../../services/projects";
import Loading from "../common/Loading";

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const CreateTask = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { projectId } = route.params;

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    id_asignado: "",
    fecha_vencimiento: "",
  });
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projectLoading, setProjectLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [dateError, setDateError] = useState("");

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      const response = await projectsService.getProject(projectId);
      setProject(response.data);
      setUsers(response.data.usuarios || []);

      // Establecer el creador como asignado por defecto
      if (response.data.usuarios && response.data.usuarios.length > 0) {
        setFormData((prev) => ({
          ...prev,
          id_asignado: response.data.usuarios[0].id_usuario.toString(),
        }));
      }
    } catch (error) {
      showMessage("Error", "Error al cargar los datos del proyecto");
    } finally {
      setProjectLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Limpiar error de fecha cuando el usuario empiece a escribir
    if (field === "fecha_vencimiento") {
      setDateError("");
    }
  };

  const validateDate = (dateString) => {
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return "Formato inválido. Use YYYY-MM-DD";
    }
    
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
    
    if (selectedDate < today) {
      return "La fecha no puede ser anterior al día actual";
    }
    
    return ""; // Fecha válida
  };

  const handleDateChange = (value) => {
    handleChange("fecha_vencimiento", value);
    
    // Validar fecha en tiempo real
    if (value.trim()) {
      const error = validateDate(value);
      setDateError(error);
    } else {
      setDateError("");
    }
  };

  const showMessage = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    const { titulo, descripcion, id_asignado, fecha_vencimiento } = formData;

    if (!titulo.trim()) {
      showMessage("Error", "El título de la tarea es obligatorio");
      return;
    }

    if (!descripcion.trim()) {
      showMessage("Error", "La descripción de la tarea es obligatoria");
      return;
    }

    if (!id_asignado) {
      showMessage("Error", "Debes asignar la tarea a un usuario");
      return;
    }

    // Validar fecha antes de enviar
    if (fecha_vencimiento.trim()) {
      const dateError = validateDate(fecha_vencimiento);
      if (dateError) {
        setDateError(dateError);
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        id_proyecto: parseInt(projectId, 10),
        id_asignado: parseInt(id_asignado, 10),
      };

      if (fecha_vencimiento && fecha_vencimiento.trim()) {
        payload.fecha_vencimiento = fecha_vencimiento.trim();
      }

      await tasksService.createTask(payload);
      setSuccessModalVisible(true);
    } catch (error) {
      showMessage("Error", error.message || "Error al crear la tarea");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessConfirm = () => {
    setSuccessModalVisible(false);
    navigation.goBack();
  };

  const isFormValid = () => {
    return formData.titulo.trim() && 
           formData.descripcion.trim() && 
           formData.id_asignado &&
           !dateError;
  };

  // Función para obtener la fecha actual en formato YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (projectLoading) {
    return <Loading />;
  }

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
          <Text style={styles.title}>Crear Nueva Tarea</Text>
          <Text style={styles.subtitle}>Proyecto: {project?.nombre}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título de la Tarea *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Diseñar interfaz de usuario"
              placeholderTextColor="#8E8E93"
              value={formData.titulo}
              onChangeText={(value) => handleChange("titulo", value)}
              maxLength={100}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe los detalles y requisitos de la tarea..."
              placeholderTextColor="#8E8E93"
              value={formData.descripcion}
              onChangeText={(value) => handleChange("descripcion", value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={1000}
              editable={!loading}
            />
            <Text style={styles.charCount}>
              {formData.descripcion.length}/1000 caracteres
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Asignar a *</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.usersScroll}
            >
              <View style={styles.usersContainer}>
                {users.map((user) => (
                  <TouchableOpacity
                    key={user.id_usuario}
                    style={[
                      styles.userOption,
                      formData.id_asignado === user.id_usuario.toString() &&
                        styles.userOptionSelected,
                    ]}
                    onPress={() =>
                      handleChange("id_asignado", user.id_usuario.toString())
                    }
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.userOptionText,
                        formData.id_asignado === user.id_usuario.toString() &&
                          styles.userOptionTextSelected,
                      ]}
                    >
                      {user.nombre}
                    </Text>
                    <Text
                      style={[
                        styles.userRole,
                        formData.id_asignado === user.id_usuario.toString() &&
                          styles.userRoleSelected,
                      ]}
                    >
                      {user.rol_proyecto}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fecha de Vencimiento (Opcional)</Text>
            <TextInput
              style={[
                styles.input,
                dateError && styles.inputError
              ]}
              placeholder={`Ej: ${getTodayDate()}`}
              placeholderTextColor="#8E8E93"
              value={formData.fecha_vencimiento}
              onChangeText={handleDateChange}
              editable={!loading}
            />
            {dateError ? (
              <Text style={styles.errorText}>{dateError}</Text>
            ) : (
              <Text style={styles.helperText}>
                Formato: Año-Mes-Día (ej: {getTodayDate()}) - No puede ser anterior al día actual
              </Text>
            )}
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                (loading || !isFormValid()) && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading || !isFormValid()}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Crear Tarea</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal para mensajes de error/validación */}
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

      {/* Modal para éxito */}
      <Modal
        visible={successModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={handleSuccessConfirm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.successModalTitle}>¡Éxito!</Text>
            <Text style={styles.modalMessage}>Tarea creada correctamente</Text>
            <TouchableOpacity
              style={styles.successModalButton}
              onPress={handleSuccessConfirm}
            >
              <Text style={styles.modalButtonText}>Continuar</Text>
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
    paddingHorizontal: isSmallDevice ? 16 : 20,
    paddingVertical: 20,
  },
  header: {
    marginBottom: isSmallDevice ? 24 : 30,
  },
  title: {
    fontSize: isSmallDevice ? 24 : 28,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: isSmallDevice ? 14 : 16,
    color: "#636E72",
    fontStyle: "italic",
  },
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: isSmallDevice ? 16 : 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#DFE6E9",
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#DFE6E9",
    borderRadius: 8,
    padding: isSmallDevice ? 12 : 14,
    fontSize: isSmallDevice ? 14 : 16,
    color: "#2D3436",
  },
  inputError: {
    borderColor: "#E74C3C",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: isSmallDevice ? 11 : 12,
    color: "#636E72",
    textAlign: "right",
    marginTop: 4,
  },
  errorText: {
    fontSize: isSmallDevice ? 11 : 12,
    color: "#E74C3C",
    marginTop: 4,
    fontWeight: "500",
  },
  helperText: {
    fontSize: isSmallDevice ? 11 : 12,
    color: "#636E72",
    marginTop: 4,
    fontStyle: "italic",
  },
  usersScroll: {
    marginHorizontal: -20,
  },
  usersContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  userOption: {
    backgroundColor: "#F8F9FA",
    padding: isSmallDevice ? 10 : 12,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "#DFE6E9",
    minWidth: 120,
  },
  userOptionSelected: {
    backgroundColor: "#0984E3",
    borderColor: "#0984E3",
  },
  userOptionText: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 2,
  },
  userOptionTextSelected: {
    color: "#FFFFFF",
  },
  userRole: {
    fontSize: isSmallDevice ? 11 : 12,
    color: "#636E72",
    textTransform: "capitalize",
  },
  userRoleSelected: {
    color: "rgba(255,255,255,0.8)",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: isSmallDevice ? 14 : 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#DFE6E9",
  },
  submitButton: {
    backgroundColor: "#0984E3",
    shadowColor: "#0984E3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: "#B2BEC3",
    shadowOpacity: 0,
    elevation: 0,
    borderColor: "#B2BEC3",
  },
  cancelButtonText: {
    color: "#636E72",
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: "600",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DFE6E9",
  },
  modalTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: "bold",
    color: "#E74C3C",
    marginBottom: 12,
    textAlign: "center",
  },
  successModalTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: "bold",
    color: "#27AE60",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: isSmallDevice ? 14 : 16,
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
    shadowColor: "#0984E3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  successModalButton: {
    backgroundColor: "#27AE60",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    shadowColor: "#27AE60",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default CreateTask;