import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Button from "../../components/Button";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  getProjectById,
  inviteUserToProject,
  removeUserFromProject,
} from "../../services/projectService";

type RootStackParamList = {
  InviteUsersScreen: {
    projectId: number;
    currentUserId: number;
    currentUserRole: string;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, "InviteUsersScreen">;

const InviteUsersScreen = ({ route }: Props) => {
  const { projectId, currentUserId, currentUserRole } = route.params;

  const [email, setEmail] = useState("");
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedRole, setSelectedRole] = useState("colaborador");
  const [availableRoles, setAvailableRoles] = useState<string[]>([
    "colaborador",
  ]);

  // 🔹 Mover función fuera del useEffect para poder reutilizarla
  const fetchProjectUsers = async () => {
    console.log("Cargando usuarios del proyecto", projectId);
    try {
      const project = await getProjectById(projectId);
      console.log("✅ Usuarios obtenidos:", project.usuarios);
      setUsuarios(project.usuarios || []);
    } catch (error: any) {
      console.log("❌ Error al obtener usuarios:", error);
      Alert.alert("Error", "No se pudo cargar los usuarios del proyecto");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchProjectUsers();

      // Definir roles disponibles para invitar
      let roles: string[] = ["colaborador"];
      if (currentUserRole === "creador") {
        roles = ["colaborador", "lider"];
      } else if (currentUserRole === "lider") {
        roles = ["colaborador"];
      }
      setAvailableRoles(roles);
      setSelectedRole(roles[0]);
    };
    init();
  }, [projectId]);

  const handleInvite = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Ingrese un correo electrónico válido");
      return;
    }

    Alert.alert(
      "Confirmación",
      `¿Estás seguro de invitar a ${email} como ${selectedRole}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Aceptar",
          onPress: async () => {
            setSending(true);
            console.log("📩 Invitando a:", email, "como:", selectedRole);
            try {
              await inviteUserToProject(projectId, email.trim(), selectedRole);
              Alert.alert("Éxito", "Invitación enviada correctamente");
              setEmail("");
              await fetchProjectUsers(); // 🔹 recargar lista
            } catch (error: any) {
              console.log("Error al invitar usuario:", error);
              Alert.alert("Error", error.message);
            } finally {
              setSending(false);
            }
          },
        },
      ]
    );
  };

  const handleRemoveUser = async (userId: number, userRole: string) => {
    console.log("🟡 handleRemoveUser llamado con:", { userId, userRole });
    console.log("🚀 Llamando a removeUserFromProject...");
    try {
      const result = await removeUserFromProject(projectId, userId);
      console.log("✅ Usuario eliminado:", result);
      Alert.alert("Éxito", "Usuario eliminado correctamente");

      // Recargar lista actualizada
      const updatedProject = await getProjectById(projectId);
      setUsuarios(updatedProject.usuarios || []);
    } catch (error) {
      console.error("❌ Error al eliminar usuario:", error);
      Alert.alert("Error", "No se pudo eliminar el usuario");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionTitle}>Usuarios actuales</Text>

      {usuarios.length > 0 ? (
        usuarios.map((user) => (
          <View key={user.id_usuario} style={styles.userRow}>
            <Text style={styles.userItem}>
              {user.nombre} ({user.email}) - {user.rol_proyecto}
            </Text>

            <TouchableOpacity
              onPress={() => {
                console.log("👆 Botón eliminar presionado para:", user);
                handleRemoveUser(user.id_usuario, user.rol_proyecto);
              }}
              disabled={user.rol_proyecto === "creador"}
              activeOpacity={0.7}
              style={[
                styles.removeButton,
                {
                  backgroundColor:
                    user.rol_proyecto === "creador" ? "#ccc" : "#dc3545",
                },
              ]}
            >
              <Text style={{ color: "#fff" }}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text style={styles.noUsers}>
          No hay usuarios aún en este proyecto.
        </Text>
      )}

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
        Invitar usuario
      </Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Correo del usuario"
      />

      <Text style={{ marginBottom: 5 }}>Seleccionar rol:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedRole}
          onValueChange={(value) => setSelectedRole(value)}
          style={{ flex: 1 }}
        >
          {availableRoles.map((role) => (
            <Picker.Item key={role} label={role} value={role} />
          ))}
        </Picker>
      </View>

      <Button
        title={sending ? "Enviando..." : "Enviar Invitación"}
        onPress={handleInvite}
        disabled={sending}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f9fc", padding: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 10,
  },
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  userItem: { fontSize: 16, color: "#333" },
  removeButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  noUsers: { fontSize: 15, color: "#999", fontStyle: "italic" },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
    justifyContent: "center",
  },
});

export default InviteUsersScreen;
