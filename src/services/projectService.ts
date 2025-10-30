import api from "./api";
import axios from "axios";

interface ProjectData {
  name: string;
  description?: string;
}

export const createProject = async (data: ProjectData) => {
  try {
    const payload = {
      nombre: data.name, // mapear name -> nombre
      descripcion: data.description || "", // mapear description -> descripcion
    };

    const response = await api.post("/projects", payload);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al crear proyecto:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getProjects = async () => {
  try {
    const response = await api.get("/projects");
    return response.data.data;
  } catch (error: any) {
    console.error(
      "Error al obtener proyectos:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updateProject = async (
  projectId: number,
  data: { nombre: string; descripcion?: string }
) => {
  const response = await api.put(`/projects/${projectId}`, data);
  return response.data;
};

export const getProjectById = async (id: number) => {
  try {
    const response = await api.get(`/projects/${id}`);
    return response.data.data; 
  } catch (error: any) {
    console.error(
      "Error al obtener proyecto:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getTasksByProject = async (projectId: number) => {
  try {
    const response = await api.get(`/projects/${projectId}/tasks`);
    return response.data.data; 
  } catch (error: any) {
    console.error(
      "Error al obtener tareas del proyecto:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const inviteUserToProject = async (
  projectId: number,
  email: string,
  rol_proyecto: string = "colaborador"
) => {
  const payload = { email, rol_proyecto };
  try {
    const response = await api.post(`/projects/${projectId}/invite`, payload);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al invitar usuario:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "No se pudo enviar la invitación"
    );
  }
};

export const removeUserFromProject = async (projectId: number, userId: number) => {
  try {
    const response = await api.delete(`/projects/${projectId}/members`, {
      data: { id_usuario: userId }, 
    });
    return response.data;
  } catch (error: any) {
    console.error("Error al remover usuario:", error.response?.data || error.message);
    throw error;
  }
};

export const getProjectUsers = async (projectId: number) => {
  const { data } = await axios.get(`/projects/${projectId}/users`);
  return data;
};

export const createTask = async (payload: any) => {
  try {
    console.log("Payload que se enviará:", payload);
    const response = await api.post("/tasks", payload);
    console.log("Resultado backend:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al crear tarea:",
      error.response?.data || error.message
    );
    throw error;
  }
};
