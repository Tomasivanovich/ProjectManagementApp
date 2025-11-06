import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Dimensions,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import tasksService from "../../services/tasks";
import projectsService from "../../services/projects";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../common/Loading";
import ErrorMessage from "../common/ErrorMessage";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;

const EditTask = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { task } = route.params;

  // Estados
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    estado: "pendiente",
    id_asignado: null,
    fecha_vencimiento: null,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [fechaCreacion, setFechaCreacion] = useState(new Date());

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Cargar el proyecto para obtener los usuarios
      const projectResponse = await projectsService.getProject(
        task.id_proyecto
      );
      setUsers(projectResponse.data.usuarios || []);

      // Establecer datos de la tarea
      if (task) {
        setFormData({
          titulo: task.titulo || "",
          descripcion: task.descripcion || "",
          estado: task.estado || "pendiente",
          id_asignado: task.id_asignado || null,
          fecha_vencimiento: task.fecha_vencimiento || null,
        });

        // Establecer fecha seleccionada si existe
        if (task.fecha_vencimiento) {
          setSelectedDate(new Date(task.fecha_vencimiento));
        }

        // Guardar fecha de creación para validaciones
        if (task.fecha_creacion) {
          setFechaCreacion(new Date(task.fecha_creacion));
        }
      }
    } catch (err) {
      setError("Error al cargar los datos de la tarea");
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en los campos
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Manejar selección de fecha
  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      // Validar que la fecha no sea anterior a la fecha de creación
      if (date < fechaCreacion) {
        setError(
          "La fecha de vencimiento no puede ser anterior a la fecha de creación de la tarea"
        );
        return;
      }

      setSelectedDate(date);
      const formattedDate = date.toISOString().split("T")[0];
      handleInputChange("fecha_vencimiento", formattedDate);
    }
  };

  // Manejar selección de usuario
  const handleUserSelect = (user) => {
    handleInputChange("id_asignado", user.id_usuario);
    setShowUsersModal(false);
  };

  // Validar que un string no contenga solo números
  const containsOnlyNumbers = (str) => {
    return /^\d+$/.test(str.trim());
  };

  // Validar formulario
  const validateForm = () => {
    // Validar título
    if (!formData.titulo.trim()) {
      setError("El título es requerido");
      return false;
    }

    if (formData.titulo.trim().length < 3) {
      setError("El título debe tener al menos 3 caracteres");
      return false;
    }

    if (containsOnlyNumbers(formData.titulo)) {
      setError("El título no puede contener solo números");
      return false;
    }

    // Validar descripción (si no está vacía)
    if (
      formData.descripcion.trim() &&
      containsOnlyNumbers(formData.descripcion)
    ) {
      setError("La descripción no puede contener solo números");
      return false;
    }

    // Validar fecha de vencimiento
    if (formData.fecha_vencimiento) {
      const fechaVencimiento = new Date(formData.fecha_vencimiento);
      if (fechaVencimiento < fechaCreacion) {
        setError(
          "La fecha de vencimiento no puede ser anterior a la fecha de creación de la tarea"
        );
        return false;
      }
    }

    return true;
  };

  // Guardar cambios
  const handleSave = async () => {
    try {
      setError(null);

      if (!validateForm()) {
        return;
      }

      setSaving(true);

      const updateData = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        estado: formData.estado,
        id_asignado: formData.id_asignado,
        fecha_vencimiento: formData.fecha_vencimiento,
      };

      await tasksService.updateTask(task.id_tarea, updateData);
      setSuccessModalVisible(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error al actualizar la tarea"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSuccessConfirm = () => {
    setSuccessModalVisible(false);
    navigation.goBack();
  };

  // Obtener nombre del usuario asignado
  const getAssignedUserName = () => {
    if (!formData.id_asignado) return "Sin asignar";
    const assignedUser = users.find(
      (u) => u.id_usuario === formData.id_asignado
    );
    return assignedUser ? assignedUser.nombre : "Usuario no encontrado";
  };

  // Formatear fecha para mostrar
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "Sin fecha";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Limpiar asignación
  const handleClearAssignment = () => {
    handleInputChange("id_asignado", null);
  };

  // Limpiar fecha
  const handleClearDate = () => {
    handleInputChange("fecha_vencimiento", null);
    setSelectedDate(new Date());
  };

  // Obtener fecha mínima para el date picker (fecha de creación)
  const getMinimumDate = () => {
    return fechaCreacion;
  };

  if (loading) {
    return <Loading message="Cargando datos de la tarea..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Editar Tarea</Text>
          <Text style={styles.subtitle}>ID: {task.id_tarea}</Text>
        </View>

        {/* Mensaje de error */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError(null)}>
              <Text style={styles.errorClose}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Formulario */}
        <View style={styles.form}>
          {/* Título */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              value={formData.titulo}
              onChangeText={(text) => handleInputChange("titulo", text)}
              placeholder="Ingresa el título de la tarea"
              placeholderTextColor="#8E8E93"
              editable={!saving}
            />
          </View>

          {/* Descripción */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.descripcion}
              onChangeText={(text) => handleInputChange("descripcion", text)}
              placeholder="Describe la tarea en detalle..."
              placeholderTextColor="#8E8E93"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!saving}
            />
          </View>

          {/* Estado */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Estado</Text>
            <View style={styles.statusContainer}>
              {[
                { value: "pendiente", label: "Pendiente", color: "#E74C3C" },
                {
                  value: "en progreso",
                  label: "En Progreso",
                  color: "#0984E3",
                },
                { value: "completada", label: "Completada", color: "#27AE60" },
              ].map((status) => (
                <TouchableOpacity
                  key={status.value}
                  style={[
                    styles.statusOption,
                    formData.estado === status.value &&
                      styles.statusOptionSelected,
                    { borderColor: status.color },
                  ]}
                  onPress={() => handleInputChange("estado", status.value)}
                  disabled={saving}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: status.color },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      formData.estado === status.value &&
                        styles.statusTextSelected,
                    ]}
                  >
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Usuario Asignado */}
          <View style={styles.inputGroup}>
            <View style={styles.selectorHeader}>
              <Text style={styles.label}>Asignado a</Text>
              {formData.id_asignado && (
                <TouchableOpacity
                  onPress={handleClearAssignment}
                  disabled={saving}
                >
                  <Text style={styles.clearText}>Limpiar</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setShowUsersModal(true)}
              disabled={saving}
            >
              <Text style={styles.selectorText}>{getAssignedUserName()}</Text>
              <Ionicons name="chevron-down" size={20} color="#636E72" />
            </TouchableOpacity>
          </View>

          {/* Fecha de Vencimiento */}
          <View style={styles.inputGroup}>
            <View style={styles.selectorHeader}>
              <Text style={styles.label}>Fecha de Vencimiento</Text>
              {formData.fecha_vencimiento && (
                <TouchableOpacity onPress={handleClearDate} disabled={saving}>
                  <Text style={styles.clearText}>Limpiar</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setShowDatePicker(true)}
              disabled={saving}
            >
              <Text style={styles.selectorText}>
                {formatDisplayDate(formData.fecha_vencimiento)}
              </Text>
              <Ionicons name="calendar" size={20} color="#636E72" />
            </TouchableOpacity>
            <Text style={styles.dateHelperText}>
              La fecha no puede ser anterior al{" "}
              {fechaCreacion.toLocaleDateString("es-ES")}
            </Text>
          </View>

          {/* Información de solo lectura */}
          <View style={styles.readOnlyInfo}>
            <Text style={styles.readOnlyTitle}>Información del Proyecto</Text>
            <View style={styles.readOnlyItem}>
              <Text style={styles.readOnlyLabel}>Proyecto:</Text>
              <Text style={styles.readOnlyValue}>{task.proyecto_nombre}</Text>
            </View>
            <View style={styles.readOnlyItem}>
              <Text style={styles.readOnlyLabel}>Creado por:</Text>
              <Text style={styles.readOnlyValue}>{task.creador_nombre}</Text>
            </View>
            <View style={styles.readOnlyItem}>
              <Text style={styles.readOnlyLabel}>Fecha de creación:</Text>
              <Text style={styles.readOnlyValue}>
                {fechaCreacion.toLocaleDateString("es-ES")}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Botones de acción */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.saveButton,
            (saving || !formData.titulo.trim()) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={saving || !formData.titulo.trim()}
        >
          {saving ? (
            <Loading size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal de selección de usuarios */}
      <Modal visible={showUsersModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Usuario</Text>
              <TouchableOpacity
                onPress={() => setShowUsersModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#2D3436" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={users}
              keyExtractor={(item) => item.id_usuario.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.userItem,
                    formData.id_asignado === item.id_usuario &&
                      styles.userItemSelected,
                  ]}
                  onPress={() => handleUserSelect(item)}
                >
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.nombre}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                  </View>
                  {formData.id_asignado === item.id_usuario && (
                    <Ionicons name="checkmark" size={20} color="#0984E3" />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No hay usuarios disponibles
                </Text>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Modal de éxito */}
      <Modal
        visible={successModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={handleSuccessConfirm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <Text style={styles.successModalTitle}>¡Éxito!</Text>
            <Text style={styles.successModalMessage}>
              Tarea actualizada correctamente
            </Text>
            <TouchableOpacity
              style={styles.successModalButton}
              onPress={handleSuccessConfirm}
            >
              <Text style={styles.modalButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={getMinimumDate()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: "#FFFFFF",
    padding: isSmallDevice ? 16 : 20,
    borderBottomWidth: 1,
    borderBottomColor: "#DFE6E9",
  },
  title: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: isSmallDevice ? 14 : 16,
    color: "#636E72",
    fontStyle: "italic",
  },
  errorContainer: {
    backgroundColor: "#FDEDED",
    margin: isSmallDevice ? 14 : 16,
    padding: isSmallDevice ? 12 : 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#E74C3C",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    color: "#E74C3C",
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: "500",
    flex: 1,
  },
  errorClose: {
    color: "#E74C3C",
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: "600",
    marginLeft: 12,
  },
  form: {
    backgroundColor: "#FFFFFF",
    marginTop: 16,
    padding: isSmallDevice ? 16 : 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
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
    borderWidth: 2,
    borderColor: "#DFE6E9",
    borderRadius: 8,
    padding: isSmallDevice ? 12 : 14,
    fontSize: isSmallDevice ? 14 : 16,
    backgroundColor: "#FFFFFF",
    color: "#2D3436",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  statusOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: isSmallDevice ? 10 : 12,
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
  },
  statusOptionSelected: {
    backgroundColor: "#FFFFFF",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: isSmallDevice ? 12 : 14,
    color: "#636E72",
    fontWeight: "500",
  },
  statusTextSelected: {
    color: "#2D3436",
    fontWeight: "600",
  },
  selectorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  clearText: {
    fontSize: isSmallDevice ? 13 : 14,
    color: "#0984E3",
    fontWeight: "500",
  },
  selectorButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#DFE6E9",
    borderRadius: 8,
    padding: isSmallDevice ? 12 : 14,
    backgroundColor: "#FFFFFF",
  },
  selectorText: {
    fontSize: isSmallDevice ? 14 : 16,
    color: "#2D3436",
  },
  dateHelperText: {
    fontSize: isSmallDevice ? 12 : 13,
    color: "#636E72",
    marginTop: 6,
    fontStyle: "italic",
  },
  readOnlyInfo: {
    backgroundColor: "#F8F9FA",
    padding: isSmallDevice ? 14 : 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#0984E3",
  },
  readOnlyTitle: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 12,
  },
  readOnlyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  readOnlyLabel: {
    fontSize: isSmallDevice ? 13 : 14,
    color: "#636E72",
    fontWeight: "500",
  },
  readOnlyValue: {
    fontSize: isSmallDevice ? 13 : 14,
    color: "#2D3436",
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    padding: isSmallDevice ? 14 : 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#DFE6E9",
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
  cancelButtonText: {
    color: "#636E72",
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#0984E3",
    shadowColor: "#0984E3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: "#B2BEC3",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
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
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: "#DFE6E9",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: isSmallDevice ? 16 : 20,
    borderBottomWidth: 1,
    borderBottomColor: "#DFE6E9",
  },
  modalTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: "bold",
    color: "#2D3436",
  },
  closeButton: {
    padding: 4,
  },
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: isSmallDevice ? 14 : 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F8F9FA",
  },
  userItemSelected: {
    backgroundColor: "#F0F7FF",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: "500",
    color: "#2D3436",
  },
  userEmail: {
    fontSize: isSmallDevice ? 13 : 14,
    color: "#636E72",
    marginTop: 2,
  },
  emptyText: {
    textAlign: "center",
    color: "#636E72",
    fontStyle: "italic",
    marginTop: 20,
    padding: 20,
  },
  successModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DFE6E9",
  },
  successModalTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: "bold",
    color: "#27AE60",
    marginBottom: 12,
    textAlign: "center",
  },
  successModalMessage: {
    fontSize: isSmallDevice ? 14 : 16,
    color: "#636E72",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
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

export default EditTask;
