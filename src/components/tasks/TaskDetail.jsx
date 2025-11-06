import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Dimensions,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import tasksService from "../../services/tasks";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../common/Loading";
import ErrorMessage from "../common/ErrorMessage";

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

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
      if (err.response?.status === 403) {
        setError("No tienes permisos para ver esta tarea");
      } else if (err.response?.status === 404) {
        setError("Tarea no encontrada");
      } else {
        setError(err.message || "Error al cargar la tarea");
      }
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

  const canEditTask = () => {
    if (!task || !user) return false;
    if (user.rol_global === "admin") return true;
    if (task.id_creador === user.id_usuario) return true;
    if (task.rol_proyecto === "lider" || task.rol_proyecto === "creador") return true;
    return false;
  };

  const canChangeStatus = () => {
    if (!task || !user) return false;
    if (user.rol_global === "admin") return true;
    if (task.id_creador === user.id_usuario) return true;
    if (task.id_asignado === user.id_usuario) return true;
    if (task.rol_proyecto === "lider" || task.rol_proyecto === "creador") return true;
    return false;
  };

  const canViewTask = () => {
    if (!task || !user) return false;
    if (user.rol_global === "admin") return true;
    if (task.id_creador === user.id_usuario) return true;
    if (task.id_asignado === user.id_usuario) return true;
    if (task.rol_proyecto === "lider" || task.rol_proyecto === "creador") return true;
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
      await tasksService.updateTaskStatus(taskId, { estado: newStatus });
      setTask((prev) => ({ ...prev, estado: newStatus }));
    } catch (error) {
      setError(error.message || "Error al actualizar el estado");
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
        return "#27AE60";
      case "en progreso":
        return "#0984E3";
      case "pendiente":
        return "#E74C3C";
      default:
        return "#636E72";
    }
  };

  const getStatusOptions = () => {
    if (!task) return [];
    const allStatuses = ["pendiente", "en progreso", "completada"];
    return allStatuses.filter((status) => status !== task.estado);
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

  const isOverdue = task.fecha_vencimiento && 
                   new Date(task.fecha_vencimiento) < new Date() && 
                   task.estado !== "completada";

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0984E3"]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
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
          <Text style={styles.description}>
            {task.descripcion || "No hay descripción disponible"}
          </Text>
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
                    isOverdue && styles.overdue,
                  ]}
                >
                  {new Date(task.fecha_vencimiento).toLocaleDateString()}
                  {isOverdue && " (Vencida)"}
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
              placeholderTextColor="#8E8E93"
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
    backgroundColor: "#F8F9FA",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: isSmallDevice ? 16 : 20,
  },
  errorTitle: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: "bold",
    color: "#E74C3C",
    marginBottom: isSmallDevice ? 12 : 16,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: isSmallDevice ? 14 : 16,
    color: "#636E72",
    textAlign: "center",
    marginBottom: isSmallDevice ? 20 : 24,
    lineHeight: 22,
  },
  backButton: {
    backgroundColor: "#0984E3",
    paddingHorizontal: isSmallDevice ? 18 : 20,
    paddingVertical: isSmallDevice ? 10 : 12,
    borderRadius: 8,
    shadowColor: "#0984E3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: "600",
  },
  header: {
    backgroundColor: "#FFFFFF",
    padding: isSmallDevice ? 16 : 20,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#DFE6E9",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: isSmallDevice ? 10 : 12,
  },
  title: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: "bold",
    color: "#2D3436",
    flex: 1,
    marginRight: 12,
    lineHeight: isSmallDevice ? 24 : 28,
  },
  statusBadge: {
    paddingHorizontal: isSmallDevice ? 10 : 12,
    paddingVertical: isSmallDevice ? 5 : 6,
    borderRadius: 16,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: isSmallDevice ? 12 : 14,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  projectName: {
    fontSize: isSmallDevice ? 14 : 16,
    color: "#636E72",
    fontStyle: "italic",
    marginBottom: 8,
  },
  backToProjectButton: {
    backgroundColor: "#F8F9FA",
    padding: isSmallDevice ? 10 : 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#0984E3",
    alignItems: "center",
    marginTop: 8,
  },
  backToProjectText: {
    color: "#0984E3",
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#FFFFFF",
    padding: isSmallDevice ? 16 : 20,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#DFE6E9",
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: isSmallDevice ? 10 : 12,
  },
  description: {
    fontSize: isSmallDevice ? 14 : 16,
    color: "#636E72",
    lineHeight: isSmallDevice ? 20 : 22,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  infoItem: {
    width: "50%",
    paddingHorizontal: 8,
    marginBottom: isSmallDevice ? 12 : 16,
  },
  infoLabel: {
    fontSize: isSmallDevice ? 13 : 14,
    color: "#636E72",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: isSmallDevice ? 14 : 16,
    color: "#2D3436",
    fontWeight: "600",
  },
  overdue: {
    color: "#E74C3C",
    fontWeight: "bold",
  },
  fileContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: isSmallDevice ? 14 : 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DFE6E9",
  },
  fileText: {
    fontSize: isSmallDevice ? 14 : 16,
    color: "#2D3436",
    flex: 1,
  },
  fileAction: {
    fontSize: isSmallDevice ? 13 : 14,
    color: "#0984E3",
    fontWeight: "600",
  },
  actionsSection: {
    backgroundColor: "#FFFFFF",
    padding: isSmallDevice ? 16 : 20,
    marginBottom: 16,
  },
  actionGroup: {
    marginBottom: isSmallDevice ? 20 : 24,
  },
  actionGroupTitle: {
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: isSmallDevice ? 10 : 12,
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
    padding: isSmallDevice ? 10 : 12,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusButtonText: {
    color: "#FFFFFF",
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: "600",
    textAlign: "center",
  },
  editButtons: {
    flexDirection: "row",
    marginHorizontal: -6,
    gap: 12,
  },
  editButton: {
    flex: 1,
    padding: isSmallDevice ? 12 : 14,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: "#0984E3",
  },
  dangerButton: {
    backgroundColor: "#E74C3C",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: isSmallDevice ? 20 : 24,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "#DFE6E9",
  },
  modalTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: "bold",
    color: "#E74C3C",
    marginBottom: isSmallDevice ? 10 : 12,
    textAlign: "center",
  },
  modalText: {
    fontSize: isSmallDevice ? 14 : 16,
    color: "#2D3436",
    marginBottom: 8,
    textAlign: "center",
    lineHeight: 22,
  },
  warningText: {
    fontSize: isSmallDevice ? 13 : 14,
    color: "#E74C3C",
    fontWeight: "600",
    marginBottom: isSmallDevice ? 14 : 16,
    textAlign: "center",
    lineHeight: 20,
  },
  confirmText: {
    fontSize: isSmallDevice ? 13 : 14,
    color: "#636E72",
    marginBottom: 8,
    textAlign: "center",
  },
  textInput: {
    borderWidth: 2,
    borderColor: "#DFE6E9",
    borderRadius: 8,
    padding: isSmallDevice ? 12 : 14,
    fontSize: isSmallDevice ? 14 : 16,
    textAlign: "center",
    marginBottom: isSmallDevice ? 14 : 16,
    backgroundColor: "#FFFFFF",
    color: "#2D3436",
  },
  errorText: {
    color: "#E74C3C",
    fontSize: isSmallDevice ? 13 : 14,
    textAlign: "center",
    marginBottom: isSmallDevice ? 14 : 16,
    fontWeight: "500",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: isSmallDevice ? 12 : 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#DFE6E9",
  },
  confirmButton: {
    backgroundColor: "#E74C3C",
    shadowColor: "#E74C3C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: "#B2BEC3",
    shadowOpacity: 0,
    elevation: 0,
  },
  cancelButtonText: {
    color: "#636E72",
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: "600",
  },
});

export default TaskDetail;