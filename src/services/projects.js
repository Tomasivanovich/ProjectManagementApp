import api from "./api";

class ProjectsService {
  async getProjects() {
    return await api.get("/projects");
  }

  async getProject(id) {
    return await api.get(`/projects/${id}`);
  }

  async createProject(projectData) {
    return await api.post("/projects", projectData);
  }

  async updateProject(id, projectData) {
    return await api.put(`/projects/${id}`, projectData);
  }

  async deleteProject(id) {
    return await api.delete(`/projects/${id}`);
  }

  async inviteUser(projectId, email, rol_proyecto) {
    try {
      const response = await api.post(`/projects/${projectId}/invite`, {
        email,
        rol_proyecto,
      });
      return response;
    } catch (error) {
      // Ahora el error tiene status y data
      let errorMessage = "Error al enviar la invitación";
      if (error.data) {
        // Si hay errores de validación, unirlos
        if (error.data.errors && Array.isArray(error.data.errors)) {
          errorMessage = error.data.errors.map((e) => e.msg).join(", ");
        } else if (error.data.message) {
          errorMessage = error.data.message;
        }
      }
      throw new Error(errorMessage);
    }
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
    return await api.get(
      `/projects/${projectId}/users/search?search=${searchTerm}`
    );
  }
}

export default new ProjectsService();
