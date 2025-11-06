import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import tasksService from '../../services/tasks';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';

const TaskDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { taskId } = route.params;

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadTask = async () => {
    try {
      setError(null);
      // Nota: Necesitarías crear este endpoint en tu backend
      // Por ahora usamos el endpoint de lista y filtramos
      const response = await tasksService.getTask(taskId);
      setTask(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTask();
  };

  // NUEVA FUNCIÓN: Volver al detalle del proyecto
  const handleBackToProject = () => {
    if (task && task.id_proyecto) {
      navigation.navigate('ProjectDetail', { projectId: task.id_proyecto });
    } else {
      navigation.goBack();
    }
  };

  const canEditTask = () => {
    if (!task) return false;
    return user.rol_global === 'admin' || 
           task.id_creador === user.id_usuario ||
           task.rol_proyecto === 'lider' ||
           task.rol_proyecto === 'creador';
  };

  const canChangeStatus = () => {
    if (!task) return false;
    return user.rol_global === 'admin' || 
           task.id_asignado === user.id_usuario ||
           canEditTask();
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await tasksService.updateTaskStatus(taskId, { estado: newStatus });
      setTask(prev => ({ ...prev, estado: newStatus }));
      Alert.alert('Éxito', `Tarea marcada como ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', error.message || 'Error al actualizar la tarea');
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditTask', { task });
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Tarea',
      '¿Estás seguro de que quieres eliminar esta tarea? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await tasksService.deleteTask(taskId);
              Alert.alert('Éxito', 'Tarea eliminada correctamente');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error.message || 'Error al eliminar la tarea');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'completada': return '#4CAF50';
      case 'en progreso': return '#FF9800';
      case 'pendiente': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusOptions = () => {
    if (!task) return [];
    
    const allStatuses = ['pendiente', 'en progreso', 'completada'];
    return allStatuses.filter(status => status !== task.estado);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={loadTask}
      />
    );
  }

  if (!task) {
    return (
      <ErrorMessage 
        message="Tarea no encontrada" 
        onRetry={loadTask}
      />
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#007AFF']}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>{task.titulo}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.estado) }]}>
            <Text style={styles.statusText}>{task.estado}</Text>
          </View>
        </View>
        
        <Text style={styles.projectName}>
          Proyecto: {task.proyecto_nombre}
        </Text>
        
        {/* NUEVO BOTÓN: Volver al Proyecto */}
        <TouchableOpacity 
          style={styles.backToProjectButton}
          onPress={handleBackToProject}
        >
          <Text style={styles.backToProjectText}>← Volver al Proyecto</Text>
        </TouchableOpacity>
      </View>

      {/* Descripción */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.description}>{task.descripcion}</Text>
      </View>

      {/* Información de la Tarea */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información</Text>
        
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Asignado a</Text>
            <Text style={styles.infoValue}>{task.asignado_nombre}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Creado por</Text>
            <Text style={styles.infoValue}>{task.creador_nombre}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Fecha de creación</Text>
            <Text style={styles.infoValue}>
              {new Date(task.fecha_creacion).toLocaleDateString()}
            </Text>
          </View>
          
          {task.fecha_vencimiento && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Fecha de vencimiento</Text>
              <Text style={[
                styles.infoValue,
                new Date(task.fecha_vencimiento) < new Date() && task.estado !== 'completada' && styles.overdue
              ]}>
                {new Date(task.fecha_vencimiento).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Archivos Adjuntos */}
      {task.archivo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Archivo Adjunto</Text>
          <TouchableOpacity style={styles.fileContainer}>
            <Text style={styles.fileText}>📎 {task.archivo}</Text>
            <Text style={styles.fileAction}>Descargar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Acciones */}
      <View style={styles.actionsSection}>
        {/* Cambiar Estado */}
        {canChangeStatus() && getStatusOptions().length > 0 && (
          <View style={styles.actionGroup}>
            <Text style={styles.actionGroupTitle}>Cambiar Estado</Text>
            <View style={styles.statusButtons}>
              {getStatusOptions().map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[styles.statusButton, { backgroundColor: getStatusColor(status) }]}
                  onPress={() => handleStatusChange(status)}
                >
                  <Text style={styles.statusButtonText}>
                    Marcar como {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Acciones de Edición */}
        {canEditTask() && (
          <View style={styles.actionGroup}>
            <Text style={styles.actionGroupTitle}>Administrar Tarea</Text>
            <View style={styles.editButtons}>
              <TouchableOpacity
                style={[styles.editButton, styles.primaryButton]}
                onPress={handleEdit}
              >
                <Text style={styles.editButtonText}>Editar Tarea</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.editButton, styles.dangerButton]}
                onPress={handleDelete}
              >
                <Text style={styles.editButtonText}>Eliminar Tarea</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
    lineHeight: 28,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  projectName: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  // NUEVOS ESTILOS PARA EL BOTÓN
  backToProjectButton: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
    marginTop: 8,
  },
  backToProjectText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  infoItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  overdue: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  fileContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  fileText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  fileAction: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  actionsSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  actionGroup: {
    marginBottom: 24,
  },
  actionGroupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  statusButton: {
    flex: 1,
    minWidth: '48%',
    marginHorizontal: 4,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  editButtons: {
    flexDirection: 'row',
    marginHorizontal: -6,
  },
  editButton: {
    flex: 1,
    marginHorizontal: 6,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  dangerButton: {
    backgroundColor: '#FF6B6B',
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TaskDetail;