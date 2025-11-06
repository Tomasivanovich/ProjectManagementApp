import api from "./api";

class TasksService {
  async getProjectTasks(projectId) {
    return await api.get(`/tasks/proyecto/${projectId}`);
  }

  async getTask(taskId) {
    return await api.get(`/tasks/${taskId}`);
  }

  async createTask(taskData) {
    return await api.post("/tasks", taskData);
  }

  async updateTask(taskId, taskData) {
    return await api.put(`/tasks/${taskId}`, taskData);
  }

  async updateTaskStatus(taskId, statusData) {
    return await api.patch(`/tasks/${taskId}/completar`, statusData);
  }
  
  async updateTaskStatusAlternative(taskId, statusData) {
    return await api.put(`/tasks/${taskId}/status`, statusData);
  }

  async uploadFile(taskId, file) {
    const formData = new FormData();
    formData.append("archivo", file);
    return await api.post(`/tasks/${taskId}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  async deleteTask(taskId) {
    return await api.delete(`/tasks/${taskId}`);
  }
}

export default new TasksService();