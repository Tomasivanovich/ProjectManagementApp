import { TASK_STATUS, PROJECT_ROLES, GLOBAL_ROLES } from './constants';

export const formatDate = (dateString) => {
  if (!dateString) return 'No especificada';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'No especificada';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusColor = (status) => {
  switch (status) {
    case TASK_STATUS.COMPLETED:
      return '#4CAF50';
    case TASK_STATUS.IN_PROGRESS:
      return '#FF9800';
    case TASK_STATUS.PENDING:
      return '#F44336';
    default:
      return '#9E9E9E';
  }
};

export const getRoleColor = (role) => {
  switch (role) {
    case PROJECT_ROLES.CREATOR:
    case GLOBAL_ROLES.ADMIN:
      return '#FF6B6B';
    case PROJECT_ROLES.LEADER:
      return '#4ECDC4';
    case PROJECT_ROLES.COLLABORATOR:
    case GLOBAL_ROLES.USER:
      return '#45B7D1';
    default:
      return '#95A5A6';
  }
};

export const canEditProject = (project, user) => {
  if (!project || !user) return false;
  
  return user.rol_global === GLOBAL_ROLES.ADMIN || 
         project.id_creador === user.id_usuario ||
         project.usuarios?.find(u => u.id_usuario === user.id_usuario)?.rol_proyecto === PROJECT_ROLES.CREATOR;
};

export const canCreateTask = (project, user) => {
  if (!project || !user) return false;
  
  return user.rol_global === GLOBAL_ROLES.ADMIN || 
         project.id_creador === user.id_usuario ||
         project.usuarios?.find(u => u.id_usuario === user.id_usuario)?.rol_proyecto === PROJECT_ROLES.LEADER;
};

export const canEditTask = (task, user) => {
  if (!task || !user) return false;
  
  return user.rol_global === GLOBAL_ROLES.ADMIN || 
         task.id_creador === user.id_usuario ||
         task.rol_proyecto === PROJECT_ROLES.LEADER ||
         task.rol_proyecto === PROJECT_ROLES.CREATOR;
};

export const isTaskOverdue = (task) => {
  if (!task.fecha_vencimiento || task.estado === TASK_STATUS.COMPLETED) {
    return false;
  }
  
  const dueDate = new Date(task.fecha_vencimiento);
  const today = new Date();
  return dueDate < today;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};