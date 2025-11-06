import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import tasksService from "../../services/tasks";
import { useAuth } from "../../contexts/AuthContext";
import { useProject } from "../../contexts/ProjectContext";
import Loading from "../common/Loading";
import ErrorMessage from "../common/ErrorMessage";
import TaskCard from "./TaskCard";

const TaskList = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  // route.params may be undefined when this screen is mounted directly.
  // Use optional chaining and a safe default to avoid destructuring errors.
  const { selectedProject } = useProject();
  // Prefer explicit route param, otherwise fall back to the globally selected project.
  const projectId =
    route.params?.projectId ?? selectedProject?.id_proyecto ?? null;

  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  const loadTasks = async () => {
    try {
      setError(null);
      // If there's no projectId, avoid calling the API and show an informative state.
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

    // Filtrar por búsqueda
    if (search) {
      filtered = filtered.filter(
        (task) =>
          task.titulo.toLowerCase().includes(search.toLowerCase()) ||
          task.descripcion.toLowerCase().includes(search.toLowerCase()) ||
          task.asignado_nombre.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filtrar por estado
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
      projectRole: task.rol_proyecto, // ← Asegúrate de que esto esté en la tarea
    });
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksService.updateTaskStatus(taskId, { estado: newStatus });
      // Actualizar la lista localmente
      setTasks((prev) =>
        prev.map((task) =>
          task.id_tarea === taskId ? { ...task, estado: newStatus } : task
        )
      );
    } catch (error) {
      Alert.alert("Error", error.message || "Error al actualizar la tarea");
    }
  };

  const handleDeleteTask = (taskId) => {
    Alert.alert(
      "Eliminar Tarea",
      "¿Estás seguro de que quieres eliminar esta tarea?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await tasksService.deleteTask(taskId);
              setTasks((prev) =>
                prev.filter((task) => task.id_tarea !== taskId)
              );
              Alert.alert("Éxito", "Tarea eliminada correctamente");
            } catch (error) {
              Alert.alert(
                "Error",
                error.message || "Error al eliminar la tarea"
              );
            }
          },
        },
      ]
    );
  };

  const canEditTask = (task) => {
    return (
      user.rol_global === "admin" ||
      task.id_creador === user.id_usuario ||
      task.rol_proyecto === "lider" ||
      task.rol_proyecto === "creador"
    );
  };

  const statusOptions = [
    { value: "todos", label: "Todos", color: "#95A5A6" },
    { value: "pendiente", label: "Pendiente", color: "#F44336" },
    { value: "en progreso", label: "En Progreso", color: "#FF9800" },
    { value: "completada", label: "Completada", color: "#4CAF50" },
  ];

  if (loading && !refreshing) {
    return <Loading />;
  }

  if (error && !refreshing) {
    return <ErrorMessage message={error} onRetry={loadTasks} />;
  }

  return (
    <View style={styles.container}>
      {/* Filtros y Búsqueda */}
      <View style={styles.filtersSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar tareas..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />

        <FlatList
          horizontal
          data={statusOptions}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.statusFilter,
                { backgroundColor: item.color },
                statusFilter === item.value && styles.statusFilterSelected,
              ]}
              onPress={() => setStatusFilter(item.value)}
            >
              <Text
                style={[
                  styles.statusFilterText,
                  statusFilter === item.value &&
                    styles.statusFilterTextSelected,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
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
            onDelete={() => handleDeleteTask(item.id_tarea)}
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
            colors={["#007AFF"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {tasks.length === 0
                ? "No hay tareas en este proyecto"
                : "No se encontraron tareas"}
            </Text>
          </View>
        }
      />

      {/* Botón Flotante para Crear Tarea */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          if (projectId) {
            navigation.navigate("CreateTask", { projectId });
          } else {
            Alert.alert(
              "Seleccionar proyecto",
              "No se ha seleccionado un proyecto."
            );
          }
        }}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  filtersSection: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchInput: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  filtersList: {
    paddingVertical: 4,
  },
  statusFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    opacity: 0.7,
  },
  statusFilterSelected: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
  },
  statusFilterText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  statusFilterTextSelected: {
    fontWeight: "bold",
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default TaskList;
