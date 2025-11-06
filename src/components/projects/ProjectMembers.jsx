import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Dimensions,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import projectsService from "../../services/projects";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../common/Loading";
import ErrorMessage from "../common/ErrorMessage";

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const ProjectMembers = () => {
  const route = useRoute();
  const { user } = useAuth();
  const { projectId } = route.params;

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

  const canManageMembers = () => {
    if (!project || !user) return false;

    const userId = user.id_usuario;
    const projectCreatorId = project.id_creador;

    if (!userId) return false;

    const isAdmin = user.rol_global === "admin";
    const isProjectCreator = Number(projectCreatorId) === Number(userId);

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
        return "#E74C3C";
      case "lider":
        return "#0984E3";
      case "colaborador":
        return "#27AE60";
      default:
        return "#636E72";
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
              placeholderTextColor="#8E8E93"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: isSmallDevice ? 14 : 16,
  },
  header: {
    marginBottom: isSmallDevice ? 16 : 20,
  },
  title: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: isSmallDevice ? 14 : 16,
    color: "#636E72",
  },
  inviteButton: {
    backgroundColor: "#0984E3",
    padding: isSmallDevice ? 14 : 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: isSmallDevice ? 16 : 20,
    shadowColor: "#0984E3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  inviteButtonText: {
    color: "#FFFFFF",
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: "bold",
  },
  listContent: {
    paddingBottom: 20,
  },
  memberCard: {
    backgroundColor: "#FFFFFF",
    padding: isSmallDevice ? 14 : 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#DFE6E9",
  },
  memberInfo: {
    marginBottom: 12,
  },
  memberName: {
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: isSmallDevice ? 13 : 14,
    color: "#636E72",
    marginBottom: 4,
  },
  memberDate: {
    fontSize: isSmallDevice ? 11 : 12,
    color: "#636E72",
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
    color: "#FFFFFF",
    fontSize: isSmallDevice ? 10 : 12,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  roleButton: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#DFE6E9",
  },
  roleButtonText: {
    fontSize: isSmallDevice ? 10 : 12,
    color: "#636E72",
    fontWeight: "500",
  },
  removeButton: {
    backgroundColor: "#E74C3C",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeButtonText: {
    fontSize: isSmallDevice ? 10 : 12,
    color: "#FFFFFF",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: isSmallDevice ? 18 : 20,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "#DFE6E9",
  },
  modalTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 16,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: isSmallDevice ? 14 : 16,
    color: "#636E72",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  modalInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#DFE6E9",
    borderRadius: 8,
    padding: isSmallDevice ? 12 : 14,
    fontSize: isSmallDevice ? 14 : 16,
    marginBottom: 16,
    color: "#2D3436",
  },
  modalLabel: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 8,
  },
  roleOptions: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 8,
  },
  roleOption: {
    flex: 1,
    padding: isSmallDevice ? 10 : 12,
    borderWidth: 2,
    borderColor: "#DFE6E9",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
  },
  roleOptionSelected: {
    backgroundColor: "#0984E3",
    borderColor: "#0984E3",
  },
  roleOptionText: {
    fontSize: isSmallDevice ? 12 : 14,
    color: "#636E72",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  roleOptionTextSelected: {
    color: "#FFFFFF",
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
    backgroundColor: "#0984E3",
    shadowColor: "#0984E3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  removeConfirmButton: {
    backgroundColor: "#E74C3C",
    shadowColor: "#E74C3C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
  removeConfirmButtonText: {
    color: "#FFFFFF",
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: "600",
  },
});

export default ProjectMembers;