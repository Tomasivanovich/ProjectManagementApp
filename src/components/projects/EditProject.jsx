import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import projectsService from '../../services/projects';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';

const EditProject = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { project } = route.params;

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (project) {
      setFormData({
        nombre: project.nombre || '',
        descripcion: project.descripcion || '',
      });
    }
  }, [project]);

  const handleSubmit = async () => {
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre del proyecto es requerido');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await projectsService.updateProject(project.id_proyecto, formData);
      
      Alert.alert('Éxito', 'Proyecto actualizado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', 'No se pudo actualizar el proyecto');
    } finally {
      setLoading(false);
    }
  };

  if (!project) {
    return <ErrorMessage message="Proyecto no encontrado" />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre del Proyecto</Text>
          <TextInput
            style={styles.input}
            value={formData.nombre}
            onChangeText={(text) => setFormData({ ...formData, nombre: text })}
            placeholder="Ingresa el nombre del proyecto"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.descripcion}
            onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
            placeholder="Describe el proyecto..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {error && <ErrorMessage message={error} />}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    minHeight: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProject;