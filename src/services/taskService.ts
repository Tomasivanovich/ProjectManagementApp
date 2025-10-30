import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TaskData {
  title: string;
  description: string;
  projectId: number;
}

export const createTask = async (data: TaskData) => {
  const response = await api.post('/tasks', data);
  return response.data;
};


export const getTasksByProject = async (projectId: number) => {
  const token = await AsyncStorage.getItem('userToken');
  console.log('Token usado para obtener tareas:', token); // <-- debug
  const response = await api.get(`/tasks/proyecto/${projectId}`);
  return response.data;
};

export const updateTask = async (taskId: number, data: { title?: string; description?: string }) => {
  const response = await api.put(`/tasks/${taskId}`, data);
  return response.data;
};

export const toggleTaskStatus = async (taskId: number) => {
  const response = await api.patch(`/tasks/${taskId}/completar`);
  return response.data;
};

export const deleteTask = async (taskId: number) => {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
};

export const uploadTaskFile = async (taskId: number, file: any) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(`/tasks/${taskId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
