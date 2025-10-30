import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import Button from "../../components/Button";
import { useRoute, useNavigation } from "@react-navigation/native";
import { getProjectById, updateProject } from "../../services/projectService";

interface RouteParams {
  projectId: number;
}

const EditProjectScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { projectId } = route.params as RouteParams;

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const project = await getProjectById(projectId);
        setNombre(project.nombre);
        setDescripcion(project.descripcion || "");
      } catch (error: any) {
        Alert.alert("Error", "No se pudo cargar la información del proyecto");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  const handleSave = async () => {
    if (!nombre.trim()) {
      Alert.alert("Error", "El nombre del proyecto es obligatorio");
      return;
    }
    setSaving(true);
    try {
      await updateProject(projectId, { nombre: nombre.trim(), descripcion: descripcion.trim() });
      Alert.alert("Éxito", "Proyecto actualizado correctamente", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "No se pudo actualizar el proyecto");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Nombre del Proyecto</Text>
      <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Nombre del proyecto" />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={descripcion}
        onChangeText={setDescripcion}
        placeholder="Descripción del proyecto"
        multiline
      />

      <Button title={saving ? "Guardando..." : "Guardar Cambios"} onPress={handleSave} disabled={saving} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f9fc", padding: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 6, color: "#333" },
  input: { backgroundColor: "#fff", padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#ccc", marginBottom: 15 },
});

export default EditProjectScreen;
