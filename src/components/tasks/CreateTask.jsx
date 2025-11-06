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
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import tasksService from "../../services/tasks";
import projectsService from "../../services/projects";
import Loading from "../common/Loading";

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
  };

  const showMessage = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    const { titulo, descripcion, id_asignado } = formData;

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

    setLoading(true);
    try {
      // Build payload carefully: don't send empty strings for optional fields
      const payload = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        id_proyecto: parseInt(projectId, 10),
        id_asignado: parseInt(id_asignado, 10),
      };

      if (formData.fecha_vencimiento && formData.fecha_vencimiento.trim()) {
        payload.fecha_vencimiento = formData.fecha_vencimiento.trim();
      }

      await tasksService.createTask(payload);

      // Mostrar modal de éxito
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

  if (projectLoading) {
    return <Loading />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
              value={formData.titulo}
              onChangeText={(value) => handleChange("titulo", value)}
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe los detalles y requisitos de la tarea..."
              value={formData.descripcion}
              onChangeText={(value) => handleChange("descripcion", value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={1000}
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
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.fecha_vencimiento}
              onChangeText={(value) => handleChange("fecha_vencimiento", value)}
            />
            <Text style={styles.helperText}>
              Formato: Año-Mes-Día (ej: 2024-12-31)
            </Text>
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
                loading && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? "Creando..." : "Crear Tarea"}
              </Text>
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
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
  },
  form: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
  },
  usersScroll: {
    marginHorizontal: -20,
  },
  usersContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  userOption: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    minWidth: 120,
  },
  userOptionSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  userOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  userOptionTextSelected: {
    color: "white",
  },
  userRole: {
    fontSize: 12,
    color: "#666",
    textTransform: "capitalize",
  },
  userRoleSelected: {
    color: "rgba(255,255,255,0.8)",
  },
  helperText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    fontStyle: "italic",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  submitButton: {
    backgroundColor: "#007AFF",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
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
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  successModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  successModalButton: {
    backgroundColor: "#4CAF50",
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

export default CreateTask;
