import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ProjectsScreen from './src/screens/projects/ProjectsScreen';
import ProjectDetailScreen from './src/screens/projects/ProjectDetailScreen';
import CreateProjectScreen from './src/screens/projects/CreateProjectScreen';
import CreateTask from './src/screens/tasks/CreateTaskScreen';
import InviteUsersScreen from './src/screens/projects/InviteUsers';
import EditProjectScreen from './src/screens/projects/EditProjectsScreen';

import { RootStackParamList } from './src/navigation/types';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
    } catch (error) {
      console.log('Error al leer token:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={userToken ? 'Projects' : 'Login'}>
        {/* Auth */}
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />

        {/* Projects */}
        <Stack.Screen name="Projects" component={ProjectsScreen} options={{ title: 'Mis Proyectos' }} />
        <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ title: 'Detalle Proyecto' }} />
        <Stack.Screen name="CreateProject" component={CreateProjectScreen} options={{ title: 'Crear Proyecto' }} />
        <Stack.Screen name="InviteUsersScreen" component={InviteUsersScreen} />
        <Stack.Screen name="EditProjectScreen" component={EditProjectScreen} />

        {/* Tasks */}
        <Stack.Screen name="CreateTask" component={CreateTask} options={{ title: 'Crear Tarea' }} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
