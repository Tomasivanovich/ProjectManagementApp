import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Modal 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import usersService from "../../services/users";
import projectsService from "../../services/projects";
import Loading from "../common/Loading";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const [userStats, setUserStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const loadUserData = async () => {
    try {
      const projectsResponse = await projectsService.getProjects();
      const projects = projectsResponse.data;

      const totalProjects = projects.length;
      const createdProjects = projects.filter(
        (p) => p.id_creador === user.id_usuario
      ).length;

      setUserStats({
        totalProjects,
        createdProjects,
        assignedTasks: 0,
        completedTasks: 0,
      });

      setRecentProjects(projects.slice(0, 5));
    } catch (error) {
      Alert.alert("Error", "Error al cargar los datos del usuario");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadUserData();
  };

  const handleEditProfile = () => {
    navigation.navigate("EditProfile");
  };

  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      console.log("Ejecutando logout...");
      await logout();
      console.log("Logout completado");
    } catch (error) {
      console.error("Error en logout:", error);
      Alert.alert("Error", "No se pudo cerrar sesión");
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleProjectPress = (projectId) => {
    navigation.navigate("ProjectDetail", { projectId });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "#FF6B6B";
      case "usuario":
        return "#45B7D1";
      default:
        return "#95A5A6";
    }
  };

  if (loading) {
    return <Loading />;
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
        {/* Header del Perfil */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.nombre
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user.nombre}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: getRoleBadgeColor(user.rol_global) },
              ]}
            >
              <Text style={styles.roleText}>{user.rol_global}</Text>
            </View>
          </View>
        </View>

        {/* Estadísticas */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Mis Estadísticas</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {userStats?.totalProjects || 0}
              </Text>
              <Text style={styles.statLabel}>Proyectos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {userStats?.createdProjects || 0}
              </Text>
              <Text style={styles.statLabel}>Creados</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {userStats?.assignedTasks || 0}
              </Text>
              <Text style={styles.statLabel}>Tareas Asignadas</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {userStats?.completedTasks || 0}
              </Text>
              <Text style={styles.statLabel}>Completadas</Text>
            </View>
          </View>
        </View>

        {/* Proyectos Recientes */}
        <View style={styles.projectsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Proyectos Recientes</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Projects")}>
              <Text style={styles.seeAllButton}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {recentProjects.map((project) => (
            <TouchableOpacity
              key={project.id_proyecto}
              style={styles.projectCard}
              onPress={() => handleProjectPress(project.id_proyecto)}
            >
              <View style={styles.projectHeader}>
                <Text style={styles.projectName}>{project.nombre}</Text>
                <View
                  style={[
                    styles.projectRoleBadge,
                    { backgroundColor: getRoleBadgeColor(project.rol_proyecto) },
                  ]}
                >
                  <Text style={styles.projectRoleText}>
                    {project.rol_proyecto}
                  </Text>
                </View>
              </View>
              <Text style={styles.projectDescription} numberOfLines={2}>
                {project.descripcion}
              </Text>
              <Text style={styles.projectDate}>
                Creado: {new Date(project.fecha_creacion).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))}

          {recentProjects.length === 0 && (
            <View style={styles.emptyProjects}>
              <Text style={styles.emptyText}>No tienes proyectos aún</Text>
              <TouchableOpacity
                style={styles.createProjectButton}
                onPress={() => navigation.navigate("CreateProject")}
              >
                <Text style={styles.createProjectButtonText}>
                  Crear primer proyecto
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Acciones */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.actionButtonText}>Editar Perfil</Text>
          </TouchableOpacity>

          {/* SOLO UN BOTÓN DE LOGOUT */}
          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogoutPress}
          >
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL FUERA DEL SCROLLVIEW */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelLogout}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cerrar Sesión</Text>
            <Text style={styles.modalMessage}>
              ¿Estás seguro de que quieres cerrar sesión?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelLogout}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmLogout}
              >
                <Text style={styles.confirmButtonText}>Cerrar Sesión</Text>
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
  profileHeader: {
    backgroundColor: "white",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "capitalize",
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
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  statCard: {
    width: "50%",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  projectsSection: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 16,
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
  projectCard: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 12,
  },
  projectRoleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  projectRoleText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  projectDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 18,
  },
  projectDate: {
    fontSize: 12,
    color: "#999",
  },
  emptyProjects: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  createProjectButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createProjectButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  actionsSection: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  logoutButton: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  actionButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  // ESTILOS DEL MODAL
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  confirmButton: {
    backgroundColor: "#FF6B6B",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProfileScreen;