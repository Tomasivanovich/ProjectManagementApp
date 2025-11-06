import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import projectsService from "../../services/projects";
import tasksService from "../../services/tasks";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../common/Loading";
import ErrorMessage from "../common/ErrorMessage";

const ProjectDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { projectId } = route.params;

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadProjectData = async () => {
    try {
      setError(null);
      const [projectResponse, tasksResponse] = await Promise.all([
        projectsService.getProject(projectId),
        tasksService.getProjectTasks(projectId),
      ]);

      setProject(projectResponse.data);
      setTasks(tasksResponse.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProjectData();
  };

  const handleEditProject = () => {
    navigation.navigate("EditProject", { project });
  };

  const handleManageMembers = () => {
    navigation.navigate("ProjectMembers", { projectId });
  };

  const handleCreateTask = () => {
    // Navegar al tab de Tareas y luego a CreateTask
    navigation.navigate("TasksTab", {
      screen: "CreateTask",
      params: { projectId },
    });
  };

  const handleTaskPress = (task) => {
    // Navegar al tab de Tareas y luego a TaskDetail
    navigation.navigate("TasksTab", {
      screen: "TaskDetail",
      params: { taskId: task.id_tarea },
    });
  };

  const handleViewAllTasks = () => {
    if (!project) {
      Alert.alert("Error", "Proyecto no disponible");
      return;
    }

    navigation.navigate("TasksTab", {
      screen: "TaskList",
      params: { projectId: project.id_proyecto },
    });
  };

  const canEditProject = () => {
    return (
      user.rol_global === "admin" ||
      project?.id_creador === user.id ||
      project?.usuarios?.find((u) => u.id_usuario === user.id)
        ?.rol_proyecto === "creador"
    );
  };

  const canCreateTask = () => {
    return (
      user.rol_global === "admin" ||
      project?.id_creador === user.id_usuario ||
      project?.usuarios?.find((u) => u.id_usuario === user.id)
        ?.rol_proyecto === "lider" ||
      project?.usuarios?.find((u) => u.id_usuario === user.id)
        ?.rol_proyecto === "creador" 
    );
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

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadProjectData} />;
  }

  if (!project) {
    return (
      <ErrorMessage
        message="Proyecto no encontrado"
        onRetry={loadProjectData}
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#007AFF"]}
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.projectName}>{project.nombre}</Text>
          {canEditProject() && (
            <TouchableOpacity onPress={handleEditProject}>
              <Text style={styles.editButton}>Editar</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.description}>{project.descripcion}</Text>
        <Text style={styles.creator}>Creado por: {project.creador_nombre}</Text>
        <Text style={styles.date}>
          Fecha de creación:{" "}
          {new Date(project.fecha_creacion).toLocaleDateString()}
        </Text>
      </View>

      {/* Estadísticas */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Estadísticas</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {project.estadisticas?.total_tareas || 0}
            </Text>
            <Text style={styles.statLabel}>Total Tareas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {project.estadisticas?.tareas_completadas || 0}
            </Text>
            <Text style={styles.statLabel}>Completadas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {project.estadisticas?.tareas_en_progreso || 0}
            </Text>
            <Text style={styles.statLabel}>En Progreso</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {project.estadisticas?.total_usuarios || 0}
            </Text>
            <Text style={styles.statLabel}>Miembros</Text>
          </View>
        </View>
      </View>

      {/* Acciones Rápidas */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleManageMembers}
        >
          <Text style={styles.actionButtonText}>Gestionar Miembros</Text>
        </TouchableOpacity>

        {canCreateTask() && (
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryAction]}
            onPress={handleCreateTask}
          >
            <Text style={styles.actionButtonText}>Crear Tarea</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tareas Recientes */}
      <View style={styles.tasksSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tareas Recientes</Text>
          <TouchableOpacity onPress={handleViewAllTasks}>
            <Text style={styles.seeAllButton}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {tasks.slice(0, 5).map((task) => (
          <TouchableOpacity
            key={task.id_tarea}
            style={styles.taskCard}
            onPress={() => handleTaskPress(task)}
          >
            <View style={styles.taskHeader}>
              <Text style={styles.taskTitle} numberOfLines={1}>
                {task.titulo}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(task.estado) },
                ]}
              >
                <Text style={styles.statusText}>{task.estado}</Text>
              </View>
            </View>
            <Text style={styles.taskDescription} numberOfLines={2}>
              {task.descripcion}
            </Text>
            <View style={styles.taskFooter}>
              <Text style={styles.assignee}>
                Asignado a: {task.asignado_nombre}
              </Text>
              {task.fecha_vencimiento && (
                <Text style={styles.dueDate}>
                  Vence: {new Date(task.fecha_vencimiento).toLocaleDateString()}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {tasks.length === 0 && (
          <View style={styles.emptyTasks}>
            <Text style={styles.emptyTasksText}>
              No hay tareas en este proyecto
            </Text>
            {canCreateTask() && (
              <TouchableOpacity
                style={styles.createTaskButton}
                onPress={handleCreateTask}
              >
                <Text style={styles.createTaskButtonText}>
                  Crear primera tarea
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
  projectName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 12,
  },
  editButton: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
    marginBottom: 8,
  },
  creator: {
    fontSize: 14,
    color: "#999",
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: "#999",
  },
  statsSection: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  actionsSection: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  primaryAction: {
    backgroundColor: "#007AFF",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  tasksSection: {
    backgroundColor: "white",
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllButton: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  taskCard: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  taskDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  assignee: {
    fontSize: 12,
    color: "#999",
  },
  dueDate: {
    fontSize: 12,
    color: "#999",
  },
  emptyTasks: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTasksText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  createTaskButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createTaskButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default ProjectDetail;
