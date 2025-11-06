import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import projectsService from '../../services/projects';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  const loadProjects = async () => {
    try {
      setError(null);
      const response = await projectsService.getProjects();
      setProjects(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadProjects();
  };

  const handleProjectPress = (project) => {
    navigation.navigate('ProjectDetail', { projectId: project.id_proyecto });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'creador': return '#FF6B6B';
      case 'lider': return '#4ECDC4';
      case 'colaborador': return '#45B7D1';
      default: return '#95A5A6';
    }
  };

  const renderProjectItem = ({ item }) => (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() => handleProjectPress(item)}
    >
      <View style={styles.projectHeader}>
        <Text style={styles.projectName}>{item.nombre}</Text>
        <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(item.rol_proyecto) }]}>
          <Text style={styles.roleText}>{item.rol_proyecto}</Text>
        </View>
      </View>
      
      <Text style={styles.projectDescription} numberOfLines={2}>
        {item.descripcion}
      </Text>
      
      <View style={styles.projectFooter}>
        <Text style={styles.creatorText}>
          Creado por: {item.creador_nombre}
        </Text>
        <Text style={styles.dateText}>
          {new Date(item.fecha_creacion).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return <Loading />;
  }

  if (error && !refreshing) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={loadProjects}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={projects}
        renderItem={renderProjectItem}
        keyExtractor={(item) => item.id_proyecto.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes proyectos aún</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('CreateProject')}
            >
              <Text style={styles.createButtonText}>Crear primer proyecto</Text>
            </TouchableOpacity>
          </View>
        }
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateProject')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
  },
  projectCard: {
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
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  projectDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creatorText: {
    fontSize: 12,
    color: '#999',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default ProjectList;