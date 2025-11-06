import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

// Importar pantallas
import ProjectList from '../components/projects/ProjectList';
import ProjectDetail from '../components/projects/ProjectDetail';
import CreateProject from '../components/projects/CreateProject';
import EditProject from '../components/projects/EditProject';
import ProjectMembers from '../components/projects/ProjectMembers';
import TaskList from '../components/tasks/TaskList';
import TaskDetail from '../components/tasks/TaskDetail';
import CreateTask from '../components/tasks/CreateTask';
import ProfileScreen from '../components/users/ProfileScreen';
import EditProfile from '../components/users/EditProfile';
import UserList from '../components/users/UserList';
import Header from '../components/common/Header';

const Tab = createBottomTabNavigator();
const ProjectStack = createNativeStackNavigator();
const TaskStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const ProjectStackNavigator = () => (
  <ProjectStack.Navigator
    screenOptions={{
      header: ({ route, navigation }) => (
        <Header
          title={
            route.name === 'ProjectDetail' ? 'Detalle' : 
            route.name === 'CreateProject' ? 'Crear Proyecto' :
            route.name === 'EditProject' ? 'Editar Proyecto' :
            route.name === 'ProjectMembers' ? 'Miembros' : 'Proyectos'
          }
          showBack={route.name !== 'Projects'}
        />
      ),
    }}
  >
    <ProjectStack.Screen name="Projects" component={ProjectList} />
    <ProjectStack.Screen name="ProjectDetail" component={ProjectDetail} />
    <ProjectStack.Screen name="CreateProject" component={CreateProject} />
    <ProjectStack.Screen name="EditProject" component={EditProject} />
    <ProjectStack.Screen name="ProjectMembers" component={ProjectMembers} />
  </ProjectStack.Navigator>
);

const TaskStackNavigator = () => (
  <TaskStack.Navigator
    screenOptions={{
      header: ({ route, navigation }) => (
        <Header
          title={
            route.name === 'TaskDetail' ? 'Detalle Tarea' : 
            route.name === 'CreateTask' ? 'Crear Tarea' : 'Tareas'
          }
          showBack={route.name !== 'TaskList'}
        />
      ),
    }}
  >
    <TaskStack.Screen name="TaskList" component={TaskList} />
    <TaskStack.Screen name="TaskDetail" component={TaskDetail} />
    <TaskStack.Screen name="CreateTask" component={CreateTask} />
  </TaskStack.Navigator>
);

const ProfileStackNavigator = () => {
  const { user } = useAuth();

  return (
    <ProfileStack.Navigator
      screenOptions={{
        header: ({ route, navigation }) => (
          <Header
            title={
              route.name === 'EditProfile' ? 'Editar Perfil' : 
              route.name === 'UserList' ? 'Usuarios' : 'Perfil'
            }
            showBack={route.name !== 'Profile'}
            rightComponent={
              user.rol_global === 'admin' && route.name === 'Profile' ? (
                <Ionicons 
                  name="people" 
                  size={24} 
                  color="#007AFF" 
                  onPress={() => navigation.navigate('UserList')}
                />
              ) : null
            }
          />
        ),
      }}
    >
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfile} />
      <ProfileStack.Screen name="UserList" component={UserList} />
    </ProfileStack.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'ProjectsTab') {
            iconName = focused ? 'folder' : 'folder-outline';
          } else if (route.name === 'TasksTab') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="ProjectsTab" 
        component={ProjectStackNavigator}
        options={{ title: 'Proyectos' }}
      />
      <Tab.Screen 
        name="TasksTab" 
        component={TaskStackNavigator}
        options={{ title: 'Tareas' }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileStackNavigator}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;