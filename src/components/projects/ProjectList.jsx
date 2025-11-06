import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import projectsService from '../../services/projects';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

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
      case 'creador': return '#E74C3C';
      case 'lider': return '#0984E3';
      case 'colaborador': return '#27AE60';
      default: return '#636E72';
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
            colors={['#0984E3']}
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
    backgroundColor: '#F8F9FA',
  },
  listContent: {
    padding: isSmallDevice ? 12 : 16,
  },
  projectCard: {
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
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectName: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: 'bold',
    color: '#2D3436',
    flex: 1,
    marginRight: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 10 : 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  projectDescription: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#636E72',
    marginBottom: 12,
    lineHeight: 20,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creatorText: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#636E72',
  },
  dateText: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#636E72',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: isSmallDevice ? 15 : 16,
    color: '#636E72',
    marginBottom: 16,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#0984E3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#0984E3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: isSmallDevice ? 16 : 20,
    bottom: isSmallDevice ? 16 : 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0984E3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0984E3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default ProjectList;