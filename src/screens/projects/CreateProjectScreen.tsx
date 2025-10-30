import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { createProject } from '../../services/projectService';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';

type CreateProjectNavigationProp = NavigationProp<RootStackParamList, 'CreateProject'>;

const CreateProjectScreen = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<CreateProjectNavigationProp>();

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre del proyecto es obligatorio');
      return;
    }

    setLoading(true);
    try {
      await createProject({ name, description });
      Alert.alert('Éxito', 'Proyecto creado correctamente');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo crear el proyecto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Input placeholder="Nombre del proyecto" value={name} onChangeText={setName} />
      <Input placeholder="Descripción (opcional)" value={description} onChangeText={setDescription} />
      <Button title={loading ? 'Cargando...' : 'Crear Proyecto'} onPress={handleCreate} loading={loading} />
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, padding: 20 } });

export default CreateProjectScreen;
