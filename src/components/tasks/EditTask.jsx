import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import tasksService from "../../services/tasks";
import projectsService from "../../services/projects";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../common/Loading";
import ErrorMessage from "../common/ErrorMessage";

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

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Cargar el proyecto para obtener los usuarios
      const projectResponse = await projectsService.getProject(task.id_proyecto);
      console.log('👥 Proyecto cargado:', projectResponse.data);
      // Asumimos que la respuesta del proyecto tiene una propiedad `usuarios`
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
      }
    } catch (err) {
      console.error('❌ Error cargando datos:', err);
      setError("Error al cargar los datos de la tarea");
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en los campos
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Manejar selección de fecha
  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      // Formatear fecha como YYYY-MM-DD para el backend
      const formattedDate = date.toISOString().split('T')[0];
      handleInputChange('fecha_vencimiento', formattedDate);
    }
  };

  // Manejar selección de usuario
  const handleUserSelect = (user) => {
    handleInputChange('id_asignado', user.id_usuario);
    setShowUsersModal(false);
  };

  // Validar formulario
  const validateForm = () => {
    if (!formData.titulo.trim()) {
      setError("El título es requerido");
      return false;
    }
    if (formData.titulo.trim().length < 3) {
      setError("El título debe tener al menos 3 caracteres");
      return false;
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

      console.log('💾 Enviando datos de actualización:', updateData);

      await tasksService.updateTask(task.id_tarea, updateData);
      
      Alert.alert(
        "✅ Éxito", 
        "Tarea actualizada correctamente",
        [
          { 
            text: "OK", 
            onPress: () => navigation.goBack() 
          }
        ]
      );
    } catch (err) {
      console.error('❌ Error actualizando tarea:', err);
      setError(err.response?.data?.message || err.message || "Error al actualizar la tarea");
    } finally {
      setSaving(false);
    }
  };

  // Obtener nombre del usuario asignado
  const getAssignedUserName = () => {
    if (!formData.id_asignado) return "Sin asignar";
    const assignedUser = users.find(u => u.id_usuario === formData.id_asignado);
    return assignedUser ? assignedUser.nombre : "Usuario no encontrado";
  };

  // Formatear fecha para mostrar
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "Sin fecha";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Limpiar asignación
  const handleClearAssignment = () => {
    handleInputChange('id_asignado', null);
  };

  // Limpiar fecha
  const handleClearDate = () => {
    handleInputChange('fecha_vencimiento', null);
    setSelectedDate(new Date());
  };

  if (loading) {
    return <Loading message="Cargando datos de la tarea..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Editar Tarea</Text>
          <Text style={styles.subtitle}>ID: {task.id_tarea}</Text>
        </View>

        {/* Mensaje de error */}
        {error && (
          <ErrorMessage 
            message={error} 
            onRetry={() => setError(null)}
            showRetry={false}
          />
        )}

        {/* Formulario */}
        <View style={styles.form}>
          {/* Título */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              value={formData.titulo}
              onChangeText={(text) => handleInputChange('titulo', text)}
              placeholder="Ingresa el título de la tarea"
              placeholderTextColor="#999"
            />
          </View>

          {/* Descripción */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.descripcion}
              onChangeText={(text) => handleInputChange('descripcion', text)}
              placeholder="Describe la tarea en detalle..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Estado */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Estado</Text>
            <View style={styles.statusContainer}>
              {[
                { value: "pendiente", label: "Pendiente", color: "#F44336" },
                { value: "en progreso", label: "En Progreso", color: "#FF9800" },
                { value: "completada", label: "Completada", color: "#4CAF50" },
              ].map((status) => (
                <TouchableOpacity
                  key={status.value}
                  style={[
                    styles.statusOption,
                    formData.estado === status.value && styles.statusOptionSelected,
                    { borderColor: status.color }
                  ]}
                  onPress={() => handleInputChange('estado', status.value)}
                >
                  <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                  <Text style={[
                    styles.statusText,
                    formData.estado === status.value && styles.statusTextSelected
                  ]}>
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
                <TouchableOpacity onPress={handleClearAssignment}>
                  <Text style={styles.clearText}>Limpiar</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setShowUsersModal(true)}
            >
              <Text style={styles.selectorText}>
                {getAssignedUserName()}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Fecha de Vencimiento */}
          <View style={styles.inputGroup}>
            <View style={styles.selectorHeader}>
              <Text style={styles.label}>Fecha de Vencimiento</Text>
              {formData.fecha_vencimiento && (
                <TouchableOpacity onPress={handleClearDate}>
                  <Text style={styles.clearText}>Limpiar</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.selectorText}>
                {formatDisplayDate(formData.fecha_vencimiento)}
              </Text>
              <Ionicons name="calendar" size={20} color="#666" />
            </TouchableOpacity>
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
                {new Date(task.fecha_creacion).toLocaleDateString('es-ES')}
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
          style={[styles.button, styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Loading size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal de selección de usuarios */}
      <Modal
        visible={showUsersModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Usuario</Text>
            <TouchableOpacity
              onPress={() => setShowUsersModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={users}
            keyExtractor={(item) => item.id_usuario.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.userItem,
                  formData.id_asignado === item.id_usuario && styles.userItemSelected
                ]}
                onPress={() => handleUserSelect(item)}
              >
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.nombre}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                </View>
                {formData.id_asignado === item.id_usuario && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay usuarios disponibles</Text>
            }
          />
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: "white",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
  },
  form: {
    backgroundColor: "white",
    marginTop: 16,
    padding: 20,
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
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
    color: "#333",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 2,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: "#f8f9fa",
  },
  statusOptionSelected: {
    backgroundColor: "#fff",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  statusTextSelected: {
    color: "#333",
    fontWeight: "600",
  },
  selectorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  clearText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  selectorButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fafafa",
  },
  selectorText: {
    fontSize: 16,
    color: "#333",
  },
  readOnlyInfo: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  readOnlyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  readOnlyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  readOnlyLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  readOnlyValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#6c757d",
  },
  cancelButtonText: {
    color: "#6c757d",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  userItemSelected: {
    backgroundColor: "#f0f8ff",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginTop: 20,
    padding: 20,
  },
});

export default EditTask;