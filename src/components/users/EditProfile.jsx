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
import { useAuth } from '../../contexts/AuthContext';
import usersService from '../../services/users';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const EditProfile = () => {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    nombre: user.nombre,
    email: user.email
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Función para validar que solo contenga letras y espacios
  const isValidName = (name) => {
    // Permite letras (incluyendo acentos y ñ), espacios y algunos caracteres especiales comunes en nombres
    const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s.'-]+$/;
    return nameRegex.test(name.trim());
  };

  // Función para sanitizar el nombre (remover números y caracteres no permitidos)
  const sanitizeName = (text) => {
    // Remover números y caracteres especiales no permitidos, manteniendo letras, espacios, acentos, ñ, apostrofes, puntos y guiones
    return text.replace(/[^a-zA-ZÀ-ÿ\u00f1\u00d1\s.'-]/g, '');
  };

  const handleChange = (field, value) => {
    let processedValue = value;
    
    // Aplicar sanitización solo al campo nombre
    if (field === 'nombre') {
      processedValue = sanitizeName(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validación del nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.nombre.trim().length > 100) {
      newErrors.nombre = 'El nombre no puede exceder los 100 caracteres';
    } else if (!isValidName(formData.nombre)) {
      newErrors.nombre = 'El nombre solo puede contener letras, espacios y caracteres especiales comunes (., \', -)';
    }

    // Validación del email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Por favor ingresa un email válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showError = (message) => {
    setErrorMessage(message);
    setErrorModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await usersService.updateUser(user.id_usuario, {
        nombre: formData.nombre.trim(),
        email: formData.email.trim()
      });
      
      updateUser(response.data);
      setSuccessModalVisible(true);
    } catch (error) {
      showError(error.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessConfirm = () => {
    setSuccessModalVisible(false);
    navigation.goBack();
  };

  const isFormValid = () => {
    return formData.nombre.trim() && 
           formData.email.trim() && 
           isValidName(formData.nombre);
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
          <Text style={styles.title}>Editar Perfil</Text>
          <Text style={styles.subtitle}>
            Actualiza tu información personal
          </Text>
        </View>

        <View style={styles.form}>
          {/* Campo Nombre */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre Completo *</Text>
            <TextInput
              style={[
                styles.input,
                errors.nombre && styles.inputError
              ]}
              placeholder="Tu nombre completo"
              placeholderTextColor="#8E8E93"
              value={formData.nombre}
              onChangeText={(value) => handleChange('nombre', value)}
              maxLength={100}
              editable={!loading}
              autoCapitalize="words"
              autoCorrect={false}
            />
            {errors.nombre && (
              <Text style={styles.fieldErrorText}>{errors.nombre}</Text>
            )}
            <Text style={styles.helperText}>
              Solo letras, espacios y caracteres especiales comunes (., ', -)
            </Text>
          </View>

          {/* Campo Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={[
                styles.input,
                errors.email && styles.inputError
              ]}
              placeholder="tu@email.com"
              placeholderTextColor="#8E8E93"
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              maxLength={100}
              editable={!loading}
            />
            {errors.email && (
              <Text style={styles.fieldErrorText}>{errors.email}</Text>
            )}
          </View>

          {/* Información Adicional */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Información Adicional</Text>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Rol:</Text>
              <Text style={styles.infoValue}>{user.rol_global}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Fecha de registro:</Text>
              <Text style={styles.infoValue}>
                {new Date(user.fecha_creacion).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>ID de usuario:</Text>
              <Text style={styles.infoValue}>{user.id_usuario}</Text>
            </View>
          </View>

          {/* Botones */}
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
                (loading || !isFormValid()) && styles.buttonDisabled
              ]}
              onPress={handleSubmit}
              disabled={loading || !isFormValid()}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Guardar Cambios</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal de Éxito */}
      <Modal
        visible={successModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={handleSuccessConfirm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.successModalTitle}>¡Éxito!</Text>
            <Text style={styles.modalMessage}>Perfil actualizado correctamente</Text>
            <TouchableOpacity
              style={styles.successModalButton}
              onPress={handleSuccessConfirm}
            >
              <Text style={styles.modalButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Error */}
      <Modal
        visible={errorModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.errorModalTitle}>Error</Text>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.errorModalButton}
              onPress={() => setErrorModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Aceptar</Text>
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
  inputError: {
    borderColor: '#E74C3C',
  },
  fieldErrorText: {
    color: '#E74C3C',
    fontSize: isSmallDevice ? 12 : 13,
    marginTop: 4,
    marginLeft: 4,
  },
  helperText: {
    color: '#636E72',
    fontSize: isSmallDevice ? 11 : 12,
    marginTop: 4,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  infoBox: {
    backgroundColor: '#F8F9FA',
    padding: isSmallDevice ? 14 : 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DFE6E9',
    borderLeftWidth: 4,
    borderLeftColor: '#0984E3',
  },
  infoTitle: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#636E72',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#2D3436',
    fontWeight: '600',
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
  successModalTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorModalTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: 'bold',
    color: '#E74C3C',
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
  errorModalButton: {
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
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default EditProfile;