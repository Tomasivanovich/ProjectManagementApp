import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProjects } from "../../services/projectService";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import Button from "../../components/Button";
import { RootStackParamList } from "../../navigation/types";

interface Project {
  id_proyecto: number;
  nombre: string;
  descripcion: string;
}

type ProjectsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Projects"
>;

const ProjectsScreen = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<ProjectsScreenNavigationProp>();
  const isFocused = useIsFocused();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "No se pudieron cargar los proyectos"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) fetchProjects();
  }, [isFocused]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.log("Error al cerrar sesión:", error);
      Alert.alert("Error", "No se pudo cerrar sesión");
    }
  };

  const renderItem = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={styles.projectItem}
      onPress={() =>
        navigation.navigate("ProjectDetail", { projectId: item.id_proyecto })
      }
    >
      <Text style={styles.projectName}>{item.nombre}</Text>
      {item.descripcion ? (
        <Text style={styles.projectDesc}>{item.descripcion}</Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.loadingText}>Cargando proyectos...</Text>
      ) : projects.length === 0 ? (
        <Text style={styles.emptyText}>No tenés proyectos aún</Text>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id_proyecto.toString()}
          renderItem={renderItem}
          style={{ marginTop: 20 }}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <View style={styles.buttonWrapper}>
        <Button
          title="Crear Nuevo Proyecto"
          onPress={() => navigation.navigate("CreateProject")}
        />
        <View style={{ marginTop: 10 }}>
          <Button
            title="Cerrar Sesión"
            onPress={handleLogout}
            color="#FF3B30"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#FFFFFF", // fondo limpio
  },
  projectItem: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // para Android
  },
  projectName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  projectDesc: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  emptyText: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 16,
  },
  loadingText: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 16,
    color: "#555",
  },
  buttonWrapper: {
    marginTop: 20,
    maxWidth: 400,
    alignSelf: "center",
  },
});

export default ProjectsScreen;
