import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Button from "../../components/Button";
import { useRoute, useNavigation } from "@react-navigation/native";
import { createTask } from "../../services/projectService";
import api from "../../services/api";
import { TouchableOpacity } from "react-native";

interface RouteParams {
  projectId: number;
}

const CreateTask = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { projectId } = route.params as RouteParams;

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [asignado, setAsignado] = useState<number | null>(null);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Obtener usuarios del proyecto
  useEffect(() => {
    const fetchProjectUsers = async () => {
      try {
        const response = await api.get(`/projects/${projectId}`);
        const users = Array.isArray(response.data.data?.usuarios)
          ? response.data.data.usuarios
          : [];
        setUsuarios(users);
        if (users.length > 0) setAsignado(users[0].id_usuario);
      } catch (err: any) {
        console.error(
          "Error al obtener usuarios:",
          err.response?.data || err.message
        );
        setUsuarios([]);
      }
    };
    fetchProjectUsers();
  }, [projectId]);

  const handleSubmit = async () => {
    console.log("🟢 handleSubmit ejecutado");

    // Log inicial de los valores actuales del formulario
    console.log("📋 Estado actual del formulario:", {
      titulo,
      descripcion,
      asignado,
      fechaVencimiento,
      projectId,
    });

    if (!titulo.trim()) {
      console.warn("⚠️ Falta el título");
      Alert.alert("Error", "El título es obligatorio");
      return;
    }

    // Validación de fecha si existe
    if (fechaVencimiento.trim()) {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      if (!regex.test(fechaVencimiento.trim())) {
        console.warn("⚠️ Fecha con formato incorrecto:", fechaVencimiento);
        Alert.alert("Error", "La fecha debe tener formato AAAA-MM-DD");
        return;
      }
    }

    console.log("⏳ Iniciando envío de tarea...");
    setLoading(true);

    try {
      const payload: any = {
        id_proyecto: Number(projectId),
        titulo: titulo.trim(),
      };

      if (descripcion.trim()) payload.descripcion = descripcion.trim();
      if (asignado !== null && asignado !== undefined)
        payload.id_asignado = Number(asignado);
      if (fechaVencimiento.trim())
        payload.fecha_vencimiento = fechaVencimiento.trim();

      console.log("📦 Payload listo para enviar:", payload);

      const result = await createTask(payload);

      console.log("✅ Tarea creada correctamente:", result);

      Alert.alert("Éxito", "Tarea creada correctamente", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error("❌ Error al crear tarea:", error);

      // Si hay respuesta del backend
      if (error.response) {
        console.log("🧾 Respuesta del backend:", error.response.data);
      }

      // Mostrar mensaje de validación específico del backend
      if (
        error.response?.data?.errors &&
        error.response.data.errors.length > 0
      ) {
        const mensajes = error.response.data.errors
          .map((e: any) => e.msg || e.message)
          .join("\n");
        Alert.alert("Error de validación", mensajes);
      } else {
        Alert.alert(
          "Error",
          error.response?.data?.message || "No se pudo crear la tarea"
        );
      }
    } finally {
      console.log("🏁 Finalizando handleSubmit (loading -> false)");
      setLoading(false);
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
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.input}
        value={titulo}
        onChangeText={setTitulo}
        placeholder="Título de la tarea"
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={descripcion}
        onChangeText={setDescripcion}
        placeholder="Descripción de la tarea"
        multiline
      />

      <Text style={styles.label}>Fecha de vencimiento</Text>
      <TextInput
        style={styles.input}
        value={fechaVencimiento}
        onChangeText={setFechaVencimiento}
        placeholder="AAAA-MM-DD"
      />

      <Text style={styles.label}>Asignar a</Text>
      {usuarios.length > 0 ? (
        Platform.OS === "web" ? (
          <select
            value={asignado || ""}
            onChange={(e) => setAsignado(Number(e.target.value))}
            style={{ ...styles.input, height: 45 }}
          >
            {usuarios.map((user) => (
              <option key={user.id_usuario} value={user.id_usuario}>
                {user.nombre}
              </option>
            ))}
          </select>
        ) : (
          <Picker
            selectedValue={asignado}
            onValueChange={(itemValue) => setAsignado(itemValue)}
            style={styles.picker}
          >
            {usuarios.map((user) => (
              <Picker.Item
                key={user.id_usuario}
                label={user.nombre}
                value={user.id_usuario}
              />
            ))}
          </Picker>
        )
      ) : (
        <Text style={styles.noUsers}>No hay usuarios en este proyecto</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>
          {loading ? "Creando..." : "Crear Tarea"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fc",
    padding: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#333",
  },
  picker: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 15,
  },
  noUsers: {
    fontStyle: "italic",
    color: "#999",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: "center",
  },

  button: {
    backgroundColor: "#007bff", // azul similar al header/section
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDisabled: {
    backgroundColor: "#f0f0f0",
    borderColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default CreateTask;
