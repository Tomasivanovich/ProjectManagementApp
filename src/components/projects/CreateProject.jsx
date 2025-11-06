import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import projectsService from '../../services/projects';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const CreateProject = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const showMessage = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    const { nombre, descripcion } = formData;

    if (!nombre.trim()) {
      showMessage('Error', 'El nombre del proyecto es obligatorio');
      return;
    }

    if (!descripcion.trim()) {
      showMessage('Error', 'La descripción del proyecto es obligatoria');
      return;
    }

    setLoading(true);
    try {
      await projectsService.createProject({
        nombre: nombre.trim(),
        descripcion: descripcion.trim()
      });
      
      // Mostrar modal de éxito
      setSuccessModalVisible(true);
    } catch (error) {
      showMessage('Error', error.message || 'Error al crear el proyecto');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessConfirm = () => {
    setSuccessModalVisible(false);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Crear Nuevo Proyecto</Text>
          <Text style={styles.subtitle}>
            Completa la información para crear un nuevo proyecto
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre del Proyecto *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Desarrollo App Móvil"
              placeholderTextColor="#8E8E93"
              value={formData.nombre}
              onChangeText={(value) => handleChange('nombre', value)}
              maxLength={100}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe los objetivos y características del proyecto..."
              placeholderTextColor="#8E8E93"
              value={formData.descripcion}
              onChangeText={(value) => handleChange('descripcion', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
              editable={!loading}
            />
            <Text style={styles.charCount}>
              {formData.descripcion.length}/500 caracteres
            </Text>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button, 
                styles.submitButton, 
                (loading || !formData.nombre.trim() || !formData.descripcion.trim()) && styles.buttonDisabled
              ]}
              onPress={handleSubmit}
              disabled={loading || !formData.nombre.trim() || !formData.descripcion.trim()}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Crear Proyecto</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal para mensajes de error/validación */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para éxito */}
      <Modal
        visible={successModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={handleSuccessConfirm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.successModalTitle}>¡Éxito!</Text>
            <Text style={styles.modalMessage}>Proyecto creado correctamente</Text>
            <TouchableOpacity
              style={styles.successModalButton}
              onPress={handleSuccessConfirm}
            >
              <Text style={styles.modalButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: isSmallDevice ? 16 : 20,
    paddingVertical: 20,
  },
  header: {
    marginBottom: isSmallDevice ? 24 : 30,
  },
  title: {
    fontSize: isSmallDevice ? 24 : 28,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: isSmallDevice ? 14 : 16,
    color: '#636E72',
    lineHeight: 22,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: isSmallDevice ? 16 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#DFE6E9',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#DFE6E9',
    borderRadius: 8,
    padding: isSmallDevice ? 12 : 14,
    fontSize: isSmallDevice ? 14 : 16,
    color: '#2D3436',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#636E72',
    textAlign: 'right',
    marginTop: 4,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: isSmallDevice ? 14 : 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#DFE6E9',
  },
  submitButton: {
    backgroundColor: '#0984E3',
    shadowColor: '#0984E3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#B2BEC3',
    shadowOpacity: 0,
    elevation: 0,
    borderColor: '#B2BEC3',
  },
  cancelButtonText: {
    color: '#636E72',
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DFE6E9',
  },
  modalTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: 12,
    textAlign: 'center',
  },
  successModalTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: isSmallDevice ? 14 : 16,
    color: '#636E72',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#0984E3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    shadowColor: '#0984E3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  successModalButton: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CreateProject;