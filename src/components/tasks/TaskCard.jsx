import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActionSheetIOS,
  Platform,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

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
      case 'completada': return '#27AE60';
      case 'en progreso': return '#0984E3';
      case 'pendiente': return '#E74C3C';
      default: return '#636E72';
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

  const isOverdue = task.fecha_vencimiento && 
                   new Date(task.fecha_vencimiento) < new Date() && 
                   task.estado !== 'completada';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isOverdue && styles.overdueCard
      ]}
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

      {task.descripcion ? (
        <Text style={styles.description} numberOfLines={3}>
          {task.descripcion}
        </Text>
      ) : (
        <Text style={styles.noDescription} numberOfLines={1}>
          Sin descripción
        </Text>
      )}

      <View style={styles.cardFooter}>
        <View style={styles.footerLeft}>
          <Text style={styles.assignee}>
             {task.asignado_nombre}
          </Text>
          {task.fecha_vencimiento && (
            <Text style={[
              styles.dueDate,
              isOverdue && styles.overdue
            ]}>
               {new Date(task.fecha_vencimiento).toLocaleDateString()}
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

      {isOverdue && (
        <View style={styles.overdueIndicator}>
          <Text style={styles.overdueText}> Vencida</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: isSmallDevice ? 14 : 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#DFE6E9',
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
    backgroundColor: '#FFF5F5',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: 'bold',
    color: '#2D3436',
    flex: 1,
    marginRight: 12,
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: isSmallDevice ? 70 : 80,
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
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 10 : 12,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#636E72',
    lineHeight: 18,
    marginBottom: 12,
  },
  noDescription: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#B2BEC3',
    fontStyle: 'italic',
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
    fontSize: isSmallDevice ? 11 : 12,
    color: '#636E72',
    marginBottom: 4,
  },
  dueDate: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#636E72',
  },
  overdue: {
    color: '#E74C3C',
    fontWeight: 'bold',
  },
  creator: {
    fontSize: isSmallDevice ? 10 : 11,
    color: '#636E72',
    marginBottom: 2,
  },
  date: {
    fontSize: isSmallDevice ? 10 : 11,
    color: '#636E72',
  },
  fileIndicator: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#DFE6E9',
  },
  fileText: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#0984E3',
    fontStyle: 'italic',
  },
  overdueIndicator: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FFE0E0',
    alignItems: 'center',
  },
  overdueText: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#E74C3C',
    fontWeight: 'bold',
  },
});

export default TaskCard;