import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  Dimensions,
  Modal,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import tasksService from "../../services/tasks";
import { useAuth } from "../../contexts/AuthContext";
import { useProject } from "../../contexts/ProjectContext";
import Loading from "../common/Loading";
import ErrorMessage from "../common/ErrorMessage";
import TaskCard from "./TaskCard";

const { width } = Dimensions.get('window');

const TaskList = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { selectedProject } = useProject();
  const projectId = route.params?.projectId ?? selectedProject?.id_proyecto ?? null;

  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [containerWidth, setContainerWidth] = useState(width);

  const statusOptions = [
    { value: "todos", label: "Todos", color: "#636E72", icon: "" },
    { value: "pendiente", label: "Pendiente", color: "#E74C3C", icon: "" },
    { value: "en progreso", label: "En Progreso", color: "#0984E3", icon: "" },
    { value: "completada", label: "Completada", color: "#27AE60", icon: "" },
  ];

  // Determinar el layout basado en el ancho disponible
  const getLayoutMode = (availableWidth) => {
    const breakpoint = 400; // Punto de quiebre para cambiar a grid 2x2
    
    if (availableWidth >= breakpoint) {
      // Layout horizontal - todos los filtros en una línea
      return {
        mode: 'horizontal',
        filterWidth: (availableWidth - 48) / statusOptions.length, // 48 = padding(32) + spacing(16)
        filterHeight: 44,
        fontSize: 14,
        iconSize: 16,
        useScrollView: false
      };
    } else {
      // Layout grid 2x2
      const availableContentWidth = availableWidth - 32; // 32 = padding horizontal
      const filterWidth = (availableContentWidth - 16) / 2; // 16 = spacing entre filtros
      return {
        mode: 'grid',
        filterWidth: filterWidth,
        filterHeight: 44,
        fontSize: 13,
        iconSize: 15,
        useScrollView: false
      };
    }
  };

  const layout = getLayoutMode(containerWidth);

  const loadTasks = async () => {
    try {
      setError(null);
      if (!projectId) {
        setTasks([]);
        setFilteredTasks([]);
        setError("No se ha seleccionado un proyecto.");
        return;
      }

      const response = await tasksService.getProjectTasks(projectId);
      setTasks(response.data);
      filterTasks(response.data, searchTerm, statusFilter);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterTasks = (taskList, search, status) => {
    let filtered = taskList;

    if (search) {
      filtered = filtered.filter(
        (task) =>
          task.titulo.toLowerCase().includes(search.toLowerCase()) ||
          task.descripcion.toLowerCase().includes(search.toLowerCase()) ||
          task.asignado_nombre.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== "todos") {
      filtered = filtered.filter((task) => task.estado === status);
    }

    setFilteredTasks(filtered);
  };

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  useEffect(() => {
    filterTasks(tasks, searchTerm, statusFilter);
  }, [searchTerm, statusFilter, tasks]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  const handleTaskPress = (task) => {
    navigation.navigate("TaskDetail", {
      taskId: task.id_tarea,
      projectRole: task.rol_proyecto,
    });
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksService.updateTaskStatus(taskId, { estado: newStatus });
      setTasks((prev) =>
        prev.map((task) =>
          task.id_tarea === taskId ? { ...task, estado: newStatus } : task
        )
      );
    } catch (error) {
      showError(error.message || "Error al actualizar la tarea");
    }
  };

  const showError = (message) => {
    setErrorMessage(message);
    setErrorModalVisible(true);
  };

  const handleDeleteTask = (task) => {
    setSelectedTask(task);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedTask) return;

    try {
      await tasksService.deleteTask(selectedTask.id_tarea);
      setTasks((prev) =>
        prev.filter((task) => task.id_tarea !== selectedTask.id_tarea)
      );
      setDeleteModalVisible(false);
      setSelectedTask(null);
    } catch (error) {
      showError(error.message || "Error al eliminar la tarea");
      setDeleteModalVisible(false);
      setSelectedTask(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setSelectedTask(null);
  };

  const canEditTask = (task) => {
    return (
      user.rol_global === "admin" ||
      task.id_creador === user.id_usuario ||
      task.rol_proyecto === "lider" ||
      task.rol_proyecto === "creador"
    );
  };

  const handleCreateTask = () => {
    if (projectId) {
      navigation.navigate("CreateTask", { projectId });
    } else {
      showError("No se ha seleccionado un proyecto.");
    }
  };

  // Renderizar filtros según el layout
  const renderFilters = () => {
    if (layout.mode === 'horizontal') {
      // Layout horizontal - todos en una línea
      return (
        <View style={styles.filtersRow}>
          {statusOptions.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.statusFilter,
                { 
                  backgroundColor: item.color,
                  width: layout.filterWidth,
                  height: layout.filterHeight,
                  marginHorizontal: 4,
                },
                statusFilter === item.value && styles.statusFilterSelected,
              ]}
              onPress={() => setStatusFilter(item.value)}
            >
              <Text style={[styles.statusFilterIcon, { fontSize: layout.iconSize }]}>
                {item.icon}
              </Text>
              <Text
                style={[
                  styles.statusFilterText,
                  { fontSize: layout.fontSize },
                  statusFilter === item.value && styles.statusFilterTextSelected,
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    } else {
      // Layout grid 2x2
      return (
        <View style={styles.filtersGrid}>
          {/* Primera fila */}
          <View style={styles.filterRow}>
            {statusOptions.slice(0, 2).map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.statusFilter,
                  { 
                    backgroundColor: item.color,
                    width: layout.filterWidth,
                    height: layout.filterHeight,
                    marginHorizontal: 4,
                    marginVertical: 4,
                  },
                  statusFilter === item.value && styles.statusFilterSelected,
                ]}
                onPress={() => setStatusFilter(item.value)}
              >
                <Text style={[styles.statusFilterIcon, { fontSize: layout.iconSize }]}>
                  {item.icon}
                </Text>
                <Text
                  style={[
                    styles.statusFilterText,
                    { fontSize: layout.fontSize },
                    statusFilter === item.value && styles.statusFilterTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Segunda fila */}
          <View style={styles.filterRow}>
            {statusOptions.slice(2, 4).map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.statusFilter,
                  { 
                    backgroundColor: item.color,
                    width: layout.filterWidth,
                    height: layout.filterHeight,
                    marginHorizontal: 4,
                    marginVertical: 4,
                  },
                  statusFilter === item.value && styles.statusFilterSelected,
                ]}
                onPress={() => setStatusFilter(item.value)}
              >
                <Text style={[styles.statusFilterIcon, { fontSize: layout.iconSize }]}>
                  {item.icon}
                </Text>
                <Text
                  style={[
                    styles.statusFilterText,
                    { fontSize: layout.fontSize },
                    statusFilter === item.value && styles.statusFilterTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }
  };

  if (loading && !refreshing) {
    return <Loading />;
  }

  if (error && !refreshing) {
    return <ErrorMessage message={error} onRetry={loadTasks} />;
  }

  return (
    <View 
      style={styles.container}
      onLayout={(event) => {
        const { width: newWidth } = event.nativeEvent.layout;
        setContainerWidth(newWidth);
      }}
    >
      {/* Filtros y Búsqueda */}
      <View style={styles.filtersSection}>
        <TextInput
          style={[styles.searchInput, { fontSize: layout.fontSize }]}
          placeholder="Buscar tareas..."
          placeholderTextColor="#8E8E93"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />

        {renderFilters()}
      </View>

      {/* Información de filtros */}
      <View style={styles.filterInfo}>
        <Text style={styles.filterInfoText}>
          {filteredTasks.length} de {tasks.length} tareas
          {statusFilter !== "todos" && ` - Filtro: ${statusFilter}`}
          {searchTerm && ` - Búsqueda: "${searchTerm}"`}
        </Text>
      </View>

      {/* Lista de Tareas */}
      <FlatList
        data={filteredTasks}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => handleTaskPress(item)}
            onStatusChange={(newStatus) =>
              handleStatusChange(item.id_tarea, newStatus)
            }
            onDelete={() => handleDeleteTask(item)}
            canEdit={canEditTask(item)}
            currentUserId={user.id_usuario}
          />
        )}
        keyExtractor={(item) => item.id_tarea.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0984E3"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {tasks.length === 0
                ? "No hay tareas en este proyecto"
                : "No se encontraron tareas"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {tasks.length === 0
                ? "Crea la primera tarea para comenzar"
                : "Intenta con otros filtros o términos de búsqueda"}
            </Text>
          </View>
        }
      />

      {/* Botón Flotante para Crear Tarea */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateTask}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        visible={deleteModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Eliminar Tarea</Text>
            <Text style={styles.modalText}>
              ¿Estás seguro de que quieres eliminar la tarea "{selectedTask?.titulo}"?
            </Text>
            <Text style={styles.warningText}>
              Esta acción no se puede deshacer.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelDelete}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.confirmButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Error */}
      <Modal
        visible={errorModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.errorModalTitle}>Error</Text>
            <Text style={styles.modalText}>{errorMessage}</Text>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={() => setErrorModalVisible(false)}
            >
              <Text style={styles.confirmButtonText}>Aceptar</Text>
            </TouchableOpacity>
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
  filtersSection: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#DFE6E9",
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#DFE6E9",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    color: "#2D3436",
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filtersGrid: {
    flexDirection: 'column',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    opacity: 0.7,
  },
  statusFilterSelected: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  statusFilterIcon: {
    marginRight: 6,
  },
  statusFilterText: {
    color: "#FFFFFF",
    fontWeight: "600",
    textAlign: 'center',
  },
  statusFilterTextSelected: {
    fontWeight: "bold",
  },
  filterInfo: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#DFE6E9",
  },
  filterInfoText: {
    fontSize: 13,
    color: "#636E72",
    textAlign: "center",
    fontWeight: "500",
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    color: "#2D3436",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#636E72",
    textAlign: "center",
    lineHeight: 20,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0984E3",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0984E3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
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
    padding: 24,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "#DFE6E9",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E74C3C",
    marginBottom: 12,
    textAlign: "center",
  },
  errorModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E74C3C",
    marginBottom: 12,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#2D3436",
    marginBottom: 8,
    textAlign: "center",
    lineHeight: 22,
  },
  warningText: {
    fontSize: 14,
    color: "#E74C3C",
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
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
  cancelButtonText: {
    color: "#636E72",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default TaskList;