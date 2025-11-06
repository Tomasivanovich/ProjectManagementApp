import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';

const TaskCard = ({ 
  task, 
  onPress, 
  onStatusChange, 
  onDelete, 
  canEdit,
  currentUserId 
}) => {
  const [changingStatus, setChangingStatus] = useState(false);

  const isAssignedToMe = task.id_asignado === currentUserId;

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'completada': return '#4CAF50';
      case 'en progreso': return '#FF9800';
      case 'pendiente': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'pendiente': return 'en progreso';
      case 'en progreso': return 'completada';
      case 'completada': return 'pendiente';
      default: return 'pendiente';
    }
  };

  const handleStatusPress = () => {
    if (changingStatus) return;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Marcar como En Progreso', 'Marcar como Completada', 'Marcar como Pendiente'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: -1,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) return;
          
          let newStatus;
          switch (buttonIndex) {
            case 1: newStatus = 'en progreso'; break;
            case 2: newStatus = 'completada'; break;
            case 3: newStatus = 'pendiente'; break;
            default: return;
          }

          if (newStatus !== task.estado) {
            setChangingStatus(true);
            onStatusChange(newStatus);
            setTimeout(() => setChangingStatus(false), 500);
          }
        }
      );
    } else {
      const newStatus = getNextStatus(task.estado);
      setChangingStatus(true);
      onStatusChange(newStatus);
      setTimeout(() => setChangingStatus(false), 500);
    }
  };

  const handleLongPress = () => {
    if (!canEdit) return;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Eliminar Tarea'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 1,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            onDelete();
          }
        }
      );
    } else {
      Alert.alert(
        'Opciones de Tarea',
        '¿Qué acción deseas realizar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: onDelete },
        ]
      );
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={handleLongPress}
      delayLongPress={500}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.title} numberOfLines={2}>
          {task.titulo}
        </Text>
        
        <TouchableOpacity
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(task.estado) },
            (isAssignedToMe || canEdit) && styles.statusBadgeInteractive,
            changingStatus && styles.statusChanging
          ]}
          onPress={isAssignedToMe || canEdit ? handleStatusPress : undefined}
          disabled={!isAssignedToMe && !canEdit}
        >
          <Text style={styles.statusText}>
            {changingStatus ? '...' : task.estado}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.description} numberOfLines={3}>
        {task.descripcion}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.footerLeft}>
          <Text style={styles.assignee}>
            👤 {task.asignado_nombre}
          </Text>
          {task.fecha_vencimiento && (
            <Text style={[
              styles.dueDate,
              new Date(task.fecha_vencimiento) < new Date() && task.estado !== 'completada' && styles.overdue
            ]}>
              📅 {new Date(task.fecha_vencimiento).toLocaleDateString()}
            </Text>
          )}
        </View>
        
        <View style={styles.footerRight}>
          <Text style={styles.creator}>
            Por: {task.creador_nombre}
          </Text>
          <Text style={styles.date}>
            {new Date(task.fecha_creacion).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {task.archivo && (
        <View style={styles.fileIndicator}>
          <Text style={styles.fileText}>📎 Tiene archivo adjunto</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  statusBadgeInteractive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  statusChanging: {
    opacity: 0.7,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerLeft: {
    flex: 1,
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  assignee: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 12,
    color: '#666',
  },
  overdue: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  creator: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  date: {
    fontSize: 11,
    color: '#999',
  },
  fileIndicator: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  fileText: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
  },
});

export default TaskCard;