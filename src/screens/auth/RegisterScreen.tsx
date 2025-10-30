import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { register } from '../../services/authService';

const RegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const data = await register(name, email, password);
      await AsyncStorage.setItem('userToken', data.accessToken);
      navigation.replace('Projects');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Registro fallido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>
      <Input placeholder="Nombre" value={name} onChangeText={setName} />
      <Input placeholder="Email" value={email} onChangeText={setEmail} />
      <Input placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title={loading ? 'Cargando...' : 'Registrarse'} onPress={handleRegister} loading={loading} />
      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>Volver al login</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  link: { color: 'blue', marginTop: 10, textAlign: 'center' },
});

export default RegisterScreen;
