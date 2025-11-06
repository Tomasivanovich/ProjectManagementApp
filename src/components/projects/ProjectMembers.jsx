import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import projectsService from "../../services/projects";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../common/Loading";
import ErrorMessage from "../common/ErrorMessage";

const ProjectMembers = () => {
  const route = useRoute();
  const { user } = useAuth();
  const { projectId } = route.params;

  console.log("ProjectMembers - projectId:", projectId);

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [inviteData, setInviteData] = useState({
    email: "",
    rol_proyecto: "colaborador",
  });

  const loadProject = async () => {
    try {
      setError(null);
      const response = await projectsService.getProject(projectId);
      console.log("Proyecto cargado:", response.data);
      setProject(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]);

  // Función corregida de permisos
  const canManageMembers = () => {
    if (!project || !user) {
      console.log("No hay proyecto o usuario");
      return false;
    }

    const userId = user.id_usuario;
    const projectCreatorId = project.id_creador;

    console.log("userId:", userId, "projectCreatorId:", projectCreatorId);

    if (!userId) {
      console.log("No se pudo encontrar el ID del usuario");
      return false;
    }

    const isAdmin = user.rol_global === "admin";
    const isProjectCreator = Number(projectCreatorId) === Number(userId);

    console.log("isAdmin:", isAdmin, "isProjectCreator:", isProjectCreator);

    return isAdmin || isProjectCreator;
  };

  const showMessage = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setMessageModalVisible(true);
  };

  const handleInvite = async () => {
    if (!inviteData.email.trim()) {
      showMessage("Error", "Por favor ingresa un email válido");
      return;
    }

    try {
      await projectsService.inviteUser(
        projectId,
        inviteData.email,
        inviteData.rol_proyecto
      );

      showMessage("Éxito", "Invitación enviada correctamente");
      setInviteModalVisible(false);
      setInviteData({ email: "", rol_proyecto: "colaborador" });
      loadProject();
    } catch (error) {
      // Aquí error.message ya debe tener el mensaje del backend
      showMessage("Error", error.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await projectsService.updateUserRole(projectId, userId, newRole);
      showMessage("Éxito", "Rol actualizado correctamente");
      loadProject();
    } catch (error) {
      showMessage("Error", error.message || "Error al actualizar el rol");
    }
  };

  const confirmRemoveMember = (member) => {
    // También corregir esta comparación
    if (Number(member.id_usuario) === Number(project.id_creador)) {
      showMessage("Error", "No puedes remover al creador del proyecto");
      return;
    }

    setSelectedMember(member);
    setConfirmModalVisible(true);
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    try {
      await projectsService.removeUser(projectId, selectedMember.id_usuario);
      showMessage("Éxito", "Usuario removido correctamente");
      setConfirmModalVisible(false);
      setSelectedMember(null);
      loadProject();
    } catch (error) {
      showMessage("Error", error.message || "Error al remover usuario");
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "creador":
        return "#FF6B6B";
      case "lider":
        return "#4ECDC4";
      case "colaborador":
        return "#45B7D1";
      default:
        return "#95A5A6";
    }
  };

  const renderMemberItem = ({ item }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.nombre}</Text>
        <Text style={styles.memberEmail}>{item.email}</Text>
        <Text style={styles.memberDate}>
          Se unió: {new Date(item.fecha_union).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.memberActions}>
        <View
          style={[
            styles.roleBadge,
            { backgroundColor: getRoleColor(item.rol_proyecto) },
          ]}
        >
          <Text style={styles.roleText}>{item.rol_proyecto}</Text>
        </View>

        {canManageMembers() &&
          Number(item.id_usuario) !== Number(project.id_creador) && (
            <View style={styles.actionButtons}>
              {item.rol_proyecto !== "lider" && (
                <TouchableOpacity
                  style={styles.roleButton}
                  onPress={() => handleRoleChange(item.id_usuario, "lider")}
                >
                  <Text style={styles.roleButtonText}>Hacer Líder</Text>
                </TouchableOpacity>
              )}

              {item.rol_proyecto !== "colaborador" && (
                <TouchableOpacity
                  style={styles.roleButton}
                  onPress={() =>
                    handleRoleChange(item.id_usuario, "colaborador")
                  }
                >
                  <Text style={styles.roleButtonText}>Hacer Colaborador</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => confirmRemoveMember(item)}
              >
                <Text style={styles.removeButtonText}>Remover</Text>
              </TouchableOpacity>
            </View>
          )}
      </View>
    </View>
  );

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadProject} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Miembros del Proyecto</Text>
        <Text style={styles.subtitle}>
          {project?.usuarios?.length || 0} miembros
        </Text>
      </View>

      {canManageMembers() && (
        <TouchableOpacity
          style={styles.inviteButton}
          onPress={() => setInviteModalVisible(true)}
        >
          <Text style={styles.inviteButtonText}>+ Invitar Miembro</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={project?.usuarios || []}
        renderItem={renderMemberItem}
        keyExtractor={(item) => item.id_usuario.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal para invitar miembros */}
      <Modal
        visible={inviteModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Invitar al Proyecto</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Email del usuario"
              value={inviteData.email}
              onChangeText={(text) =>
                setInviteData((prev) => ({ ...prev, email: text }))
              }
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.modalLabel}>Rol del usuario:</Text>
            <View style={styles.roleOptions}>
              {["colaborador", "lider"].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleOption,
                    inviteData.rol_proyecto === role &&
                      styles.roleOptionSelected,
                  ]}
                  onPress={() =>
                    setInviteData((prev) => ({ ...prev, rol_proyecto: role }))
                  }
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      inviteData.rol_proyecto === role &&
                        styles.roleOptionTextSelected,
                    ]}
                  >
                    {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setInviteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleInvite}
              >
                <Text style={styles.confirmButtonText}>Enviar Invitación</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación para remover miembro */}
      <Modal
        visible={confirmModalVisible}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar</Text>
            <Text style={styles.modalMessage}>
              ¿Estás seguro de que quieres remover a {selectedMember?.nombre}{" "}
              del proyecto?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setConfirmModalVisible(false);
                  setSelectedMember(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.removeConfirmButton]}
                onPress={handleRemoveMember}
              >
                <Text style={styles.removeConfirmButtonText}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para mostrar mensajes */}
      <Modal
        visible={messageModalVisible}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => setMessageModalVisible(false)}
              >
                <Text style={styles.confirmButtonText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Los estilos se mantienen igual
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  header: {
    marginBottom: 20,
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
  },
  inviteButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  inviteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContent: {
    paddingBottom: 20,
  },
  memberCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  memberInfo: {
    marginBottom: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  memberDate: {
    fontSize: 12,
    color: "#999",
  },
  memberActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  roleButton: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  roleButtonText: {
    fontSize: 12,
    color: "#333",
  },
  removeButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  removeButtonText: {
    fontSize: 12,
    color: "white",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  modalInput: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  roleOptions: {
    flexDirection: "row",
    marginBottom: 20,
  },
  roleOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    marginHorizontal: 4,
    borderRadius: 8,
  },
  roleOptionSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  roleOptionText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  roleOptionTextSelected: {
    color: "white",
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
    backgroundColor: "#007AFF",
  },
  removeConfirmButton: {
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
  removeConfirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProjectMembers;
