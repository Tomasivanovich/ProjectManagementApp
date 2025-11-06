import api from './api';

class ProjectsService {
  async getProjects() {
    return await api.get('/projects');
  }

  async getProject(id) {
    return await api.get(`/projects/${id}`);
  }

  async createProject(projectData) {
    return await api.post('/projects', projectData);
  }

  async updateProject(id, projectData) {
    return await api.put(`/projects/${id}`, projectData);
  }

  async deleteProject(id) {
    return await api.delete(`/projects/${id}`);
  }

  async inviteUser(projectId, email, role) {
    return await api.post(`/projects/${projectId}/invite`, {
      email,
      rol_proyecto: role,
    });
  }

  async updateUserRole(projectId, userId, role) {
    return await api.patch(`/projects/${projectId}/role`, {
      id_usuario: userId,
      rol_proyecto: role,
    });
  }

  async removeUser(projectId, userId) {
    return await api.delete(`/projects/${projectId}/members`, {
      id_usuario: userId,
    });
  }

  async searchUsers(projectId, searchTerm) {
    return await api.get(`/projects/${projectId}/users/search?search=${searchTerm}`);
  }
}

export default new ProjectsService();