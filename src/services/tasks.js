import api from './api';

class TasksService {
  async getProjectTasks(projectId) {
    return await api.get(`/tasks/proyecto/${projectId}`);
  }

  async getTask(taskId) {
    // Nota: Necesitarías crear este endpoint en tu backend
    // Por ahora simulamos obteniendo todas las tareas y filtrando
    const response = await api.get('/tasks/proyecto/0'); // Esto debería ser un endpoint específico
    return { data: response.data.find(task => task.id_tarea === taskId) };
  }

  async createTask(taskData) {
    return await api.post('/tasks', taskData);
  }

  async updateTask(taskId, taskData) {
    return await api.put(`/tasks/${taskId}`, taskData);
  }

  async updateTaskStatus(taskId, statusData) {
    return await api.patch(`/tasks/${taskId}/completar`, statusData);
  }

  async deleteTask(taskId) {
    return await api.delete(`/tasks/${taskId}`);
  }
}

export default new TasksService();