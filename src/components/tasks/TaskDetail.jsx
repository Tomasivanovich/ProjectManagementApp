import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import tasksService from "../../services/tasks";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../common/Loading";
import ErrorMessage from "../common/ErrorMessage";

const TaskDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const taskId = route.params?.taskId ?? null;

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    if (task) {
      console.log("Tarea recibida en TaskDetail:", task);
    }
  }, [task]);

  const loadTask = async () => {
    try {
      setError(null);
      if (!taskId) {
        setError("ID de tarea faltante");
        return;
      }
      const response = await tasksService.getTask(taskId);
      setTask(response.data || response);
    } catch (err) {
      // MEJORADO: Manejo de errores más específico
      if (err.response?.status === 403) {
        setError("No tienes permisos para ver esta tarea");
      } else if (err.response?.status === 404) {
        setError("Tarea no encontrada");
      } else {
        setError(err.message || "Error al cargar la tarea");
      }
      console.error("Error loading task:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTask();
  };

  // CORREGIDO: Funciones de permisos mejoradas
  const canEditTask = () => {
    if (!task || !user) return false;

    // Admin global siempre puede editar
    if (user.rol_global === "admin") return true;

    // Creador de la tarea puede editar
    if (task.id_creador === user.id_usuario) return true;

    // Líder o creador del proyecto pueden editar
    if (task.rol_proyecto === "lider" || task.rol_proyecto === "creador")
      return true;

    return false;
  };

  const canChangeStatus = () => {
    if (!task || !user) return false;

    // Admin global siempre puede cambiar estado
    if (user.rol_global === "admin") return true;

    // Creador de la tarea puede cambiar estado
    if (task.id_creador === user.id_usuario) return true;

    // Persona asignada puede cambiar estado
    if (task.id_asignado === user.id_usuario) return true;

    // Líder o creador del proyecto pueden cambiar estado
    if (task.rol_proyecto === "lider" || task.rol_proyecto === "creador")
      return true;

    return false;
  };

  const canViewTask = () => {
    if (!task || !user) return false;

    // Admin global siempre puede ver
    if (user.rol_global === "admin") return true;

    // Creador de la tarea puede ver
    if (task.id_creador === user.id_usuario) return true;

    // Persona asignada puede ver
    if (task.id_asignado === user.id_usuario) return true;

    // Líder o creador del proyecto pueden ver
    if (task.rol_proyecto === "lider" || task.rol_proyecto === "creador")
      return true;

    return false;
  };

  const handleBackToProject = () => {
    if (task && task.id_proyecto) {
      navigation.navigate("ProjectsTab", {
        screen: "ProjectDetail",
        params: { projectId: task.id_proyecto },
      });
    } else {
      navigation.goBack();
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      // CORREGIDO: Usar el endpoint correcto
      await tasksService.updateTaskStatus(taskId, { estado: newStatus });
      setTask((prev) => ({ ...prev, estado: newStatus }));
      Alert.alert("Éxito", `Tarea marcada como ${newStatus}`);
    } catch (error) {
      // MEJORADO: Manejo de errores específico
      if (error.response?.status === 403) {
        Alert.alert(
          "Error",
          "No tienes permisos para cambiar el estado de esta tarea"
        );
      } else {
        Alert.alert("Error", error.message || "Error al actualizar la tarea");
      }
      console.error("Error updating task status:", error);
    }
  };

  const handleEdit = () => {
    navigation.navigate("EditTask", { task });
  };

  const handleDelete = () => {
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (deleteConfirmText.toLowerCase() !== "eliminar") {
      setError("Por favor escribe 'ELIMINAR' para confirmar");
      return;
    }

    try {
      setLoading(true);
      await tasksService.deleteTask(taskId);

      navigation.navigate("ProjectsTab", {
        screen: "ProjectDetail",
        params: {
          projectId: task.id_proyecto,
          taskDeleted: true,
        },
      });
    } catch (error) {
      setError(error.message || "Error al eliminar la tarea");
      setDeleteModalVisible(false);
    } finally {
      setLoading(false);
      setDeleteConfirmText("");
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setDeleteConfirmText("");
    setError(null);
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case "completada":
        return "#4CAF50";
      case "en progreso":
        return "#FF9800";
      case "pendiente":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const getStatusOptions = () => {
    if (!task) return [];
    const allStatuses = ["pendiente", "en progreso", "completada"];
    return allStatuses.filter((status) => status !== task.estado);
  };

  // NUEVO: Información de debug para verificar permisos
  const debugPermissions = () => {
    if (!task || !user) return null;

    return (
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>Debug Info:</Text>
        <Text style={styles.debugText}>User ID: {user.id_usuario}</Text>
        <Text style={styles.debugText}>User Role: {user.rol_global}</Text>
        <Text style={styles.debugText}>Task Creator: {task.id_creador}</Text>
        <Text style={styles.debugText}>Task Assigned: {task.id_asignado}</Text>
        <Text style={styles.debugText}>Project Role: {task.rol_proyecto}</Text>
        <Text style={styles.debugText}>
          Can Edit: {canEditTask() ? "YES" : "NO"}
        </Text>
        <Text style={styles.debugText}>
          Can Change Status: {canChangeStatus() ? "YES" : "NO"}
        </Text>
      </View>
    );
  };

  if (loading) {
    return <Loading />;
  }

  if (error && !deleteModalVisible) {
    return <ErrorMessage message={error} onRetry={loadTask} />;
  }

  if (!task) {
    return <ErrorMessage message="Tarea no encontrada" onRetry={loadTask} />;
  }

  if (!canViewTask()) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Acceso Denegado</Text>
          <Text style={styles.errorMessage}>
            No tienes permisos para ver esta tarea.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007AFF"]}
          />
        }
      >
        {/* Debug info - puedes remover esto en producción */}
        {debugPermissions()}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>{task.titulo}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(task.estado) },
              ]}
            >
              <Text style={styles.statusText}>{task.estado}</Text>
            </View>
          </View>

          <Text style={styles.projectName}>
            Proyecto: {task.proyecto_nombre}
          </Text>

          <TouchableOpacity
            style={styles.backToProjectButton}
            onPress={handleBackToProject}
          >
            <Text style={styles.backToProjectText}>← Volver al Proyecto</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{task.descripcion}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Asignado a</Text>
              <Text style={styles.infoValue}>{task.asignado_nombre}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Creado por</Text>
              <Text style={styles.infoValue}>{task.creador_nombre}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Fecha de creación</Text>
              <Text style={styles.infoValue}>
                {new Date(task.fecha_creacion).toLocaleDateString()}
              </Text>
            </View>

            {task.fecha_vencimiento && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Fecha de vencimiento</Text>
                <Text
                  style={[
                    styles.infoValue,
                    new Date(task.fecha_vencimiento) < new Date() &&
                      task.estado !== "completada" &&
                      styles.overdue,
                  ]}
                >
                  {new Date(task.fecha_vencimiento).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {task.archivo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Archivo Adjunto</Text>
            <TouchableOpacity style={styles.fileContainer}>
              <Text style={styles.fileText}>📎 {task.archivo}</Text>
              <Text style={styles.fileAction}>Descargar</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.actionsSection}>
          {canChangeStatus() && getStatusOptions().length > 0 && (
            <View style={styles.actionGroup}>
              <Text style={styles.actionGroupTitle}>Cambiar Estado</Text>
              <View style={styles.statusButtons}>
                {getStatusOptions().map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      { backgroundColor: getStatusColor(status) },
                    ]}
                    onPress={() => handleStatusChange(status)}
                  >
                    <Text style={styles.statusButtonText}>
                      Marcar como {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {canEditTask() && (
            <View style={styles.actionGroup}>
              <Text style={styles.actionGroupTitle}>Administrar Tarea</Text>
              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={[styles.editButton, styles.primaryButton]}
                  onPress={handleEdit}
                >
                  <Text style={styles.editButtonText}>Editar Tarea</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.editButton, styles.dangerButton]}
                  onPress={handleDelete}
                >
                  <Text style={styles.editButtonText}>Eliminar Tarea</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Eliminar Tarea</Text>

            <Text style={styles.modalText}>
              ¿Estás seguro de que quieres eliminar la tarea "{task.titulo}"?
            </Text>

            <Text style={styles.warningText}>
              Esta acción no se puede deshacer y se perderán todos los datos de
              la tarea.
            </Text>

            <Text style={styles.confirmText}>
              Escribe "ELIMINAR" para confirmar:
            </Text>

            <TextInput
              style={styles.textInput}
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              placeholder="ELIMINAR"
              autoCapitalize="characters"
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelDelete}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  deleteConfirmText.toLowerCase() !== "eliminar" &&
                    styles.disabledButton,
                ]}
                onPress={confirmDelete}
                disabled={deleteConfirmText.toLowerCase() !== "eliminar"}
              >
                <Text style={styles.confirmButtonText}>
                  {loading ? "Eliminando..." : "Eliminar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  // Estilos para debug
  debugInfo: {
    backgroundColor: "#fff3cd",
    padding: 12,
    borderRadius: 8,
    margin: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
  },
  debugText: {
    fontSize: 12,
    color: "#856404",
    marginBottom: 2,
  },
  // ... (el resto de los estilos permanecen igual)
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: 12,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  warningText: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  confirmText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#6c757d",
  },
  confirmButton: {
    backgroundColor: "#FF6B6B",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    opacity: 0.6,
  },
  cancelButtonText: {
    color: "#6c757d",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 12,
    lineHeight: 28,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  projectName: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 8,
  },
  backToProjectButton: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007AFF",
    alignItems: "center",
    marginTop: 8,
  },
  backToProjectText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  infoItem: {
    width: "50%",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: "#999",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  overdue: {
    color: "#FF6B6B",
    fontWeight: "bold",
  },
  fileContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  fileText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  fileAction: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  actionsSection: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 16,
  },
  actionGroup: {
    marginBottom: 24,
  },
  actionGroupTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  statusButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  statusButton: {
    flex: 1,
    minWidth: "48%",
    marginHorizontal: 4,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  statusButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  editButtons: {
    flexDirection: "row",
    marginHorizontal: -6,
  },
  editButton: {
    flex: 1,
    marginHorizontal: 6,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#007AFF",
  },
  dangerButton: {
    backgroundColor: "#FF6B6B",
  },
  editButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default TaskDetail;
