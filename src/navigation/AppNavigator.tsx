import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ProjectsScreen from "../screens/projects/ProjectsScreen";
import ProjectDetailScreen from "../screens/projects/ProjectDetailScreen";
import CreateProjectScreen from "../screens/projects/CreateProjectScreen";
import CreateTask from "../screens/tasks/CreateTaskScreen";
import InviteUsersScreen from "../screens/projects/InviteUsers";
import EditProjectScreen from "../screens/projects/EditProjectsScreen";

import { RootStackParamList } from "./types"; 

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen name="Projects" component={ProjectsScreen} />
        <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
        <Stack.Screen name="CreateProject" component={CreateProjectScreen} />
        <Stack.Screen
          name="CreateTask"
          component={CreateTask}
          options={{ title: "Crear Tarea" }}
        />
        <Stack.Screen
          name="InviteUsersScreen"
          component={InviteUsersScreen}
          initialParams={{ currentUserId: 1, currentUserRole: "creador" }}
        />
        <Stack.Screen name="EditProjectScreen" component={EditProjectScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
