import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import Button from "../../components/Button";
import {
  getProjectById,
  getTasksByProject,
} from "../../services/projectService";
import { useRoute, useNavigation } from "@react-navigation/native";

interface RouteParams {
  projectId: number;
}

const ProjectDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { projectId } = route.params as RouteParams;

  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const [projectData, taskData] = await Promise.all([
          getProjectById(projectId),
          getTasksByProject(projectId),
        ]);
        setProject(projectData);
        setTasks(taskData);
      } catch (error: any) {
        Alert.alert("Error", "No se pudo cargar la información del proyecto");
      } finally {
        setLoading(false);
      }
    };
    fetchProjectData();
  }, [projectId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se encontró el proyecto.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{project.nombre}</Text>
        <Text style={styles.description}>
          {project.descripcion || "Sin descripción"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Tareas del Proyecto</Text>

        {tasks.length > 0 ? (
          tasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <Text style={styles.taskTitle}>{task.titulo}</Text>
              <Text style={styles.taskStatus}>
                Estado:{" "}
                {task.estado === "completada"
                  ? "✅ Completada"
                  : "🕓 Pendiente"}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noTasks}>No hay tareas asignadas aún.</Text>
        )}
      </View>

      <View style={styles.footer}>
        <Button
          title="Editar Proyecto"
          onPress={() =>
            navigation.navigate("EditProjectScreen", { projectId })
          }
        />
        <View style={{ marginTop: 10 ,  maxWidth: 200, alignSelf: "center"}}>
          <Button
            title="Crear Tarea"
            onPress={() =>
              navigation.navigate("CreateTask", { projectId })
            }
          />
        </View>
        <View style={{ marginTop: 10, maxWidth: 200, alignSelf: "center" }}>
          <Button
            title="Invitar Usuarios"
            onPress={() =>
              navigation.navigate("InviteUsersScreen", { projectId })
            }
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fc",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e1e1e",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#555",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 10,
  },
  taskCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#007bff",
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  taskStatus: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  noTasks: {
    fontSize: 15,
    color: "#999",
    fontStyle: "italic",
  },
  footer: {
    marginTop: 20,
    maxWidth: 200, alignSelf: "center"
  },
  errorText: {
    textAlign: "center",
    fontSize: 16,
    color: "red",
  },
});

export default ProjectDetailScreen;
