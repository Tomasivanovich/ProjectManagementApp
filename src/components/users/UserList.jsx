import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import usersService from '../../services/users';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const UserList = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadUsers = async () => {
    // Solo los administradores pueden ver la lista de usuarios
    if (user.rol_global !== 'admin') {
      setError('No tienes permisos para ver esta lista');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setError(null);
      const response = await usersService.getUsers();
      setUsers(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#E74C3C';
      case 'usuario': return '#0984E3';
      default: return '#636E72';
    }
  };

  const getAvatarColor = (name) => {
    const colors = ['#0984E3', '#27AE60', '#E74C3C', '#F39C12', '#9B59B6', '#1ABC9C'];
    const index = name.length % colors.length;
    return colors[index];
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.nombre) }]}>
          <Text style={styles.avatarText}>
            {item.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </Text>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.nombre}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <Text style={styles.userDate}>
            Registrado: {new Date(item.fecha_creacion).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.userFooter}>
        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.rol_global) }]}>
          <Text style={styles.roleText}>{item.rol_global}</Text>
        </View>
        
        <Text style={styles.userId}>ID: {item.id_usuario}</Text>
      </View>
    </View>
  );

  if (user.rol_global !== 'admin') {
    return (
      <View style={styles.container}>
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedTitle}>Acceso Denegado</Text>
          <Text style={styles.accessDeniedText}>
            Solo los administradores pueden ver la lista de usuarios.
          </Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={loadUsers}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Usuarios del Sistema</Text>
        <Text style={styles.subtitle}>
          {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id_usuario.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0984E3']}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No hay usuarios registrados</Text>
            <Text style={styles.emptySubtitle}>
              Los usuarios aparecerán aquí cuando se registren en el sistema
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: isSmallDevice ? 14 : 16,
    paddingVertical: 16,
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: isSmallDevice ? 16 : 20,
  },
  accessDeniedTitle: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: isSmallDevice ? 10 : 12,
    textAlign: 'center',
  },
  accessDeniedText: {
    fontSize: isSmallDevice ? 14 : 16,
    color: '#636E72',
    textAlign: 'center',
    lineHeight: 22,
  },
  header: {
    marginBottom: isSmallDevice ? 16 : 20,
  },
  title: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: isSmallDevice ? 14 : 16,
    color: '#636E72',
  },
  listContent: {
    paddingBottom: 20,
  },
  userCard: {
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
  userHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: isSmallDevice ? 44 : 50,
    height: isSmallDevice ? 44 : 50,
    borderRadius: isSmallDevice ? 22 : 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isSmallDevice ? 10 : 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#636E72',
    marginBottom: 4,
  },
  userDate: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#636E72',
  },
  userFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#DFE6E9',
  },
  roleBadge: {
    paddingHorizontal: isSmallDevice ? 6 : 8,
    paddingVertical: isSmallDevice ? 3 : 4,
    borderRadius: 12,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 10 : 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  userId: {
    fontSize: isSmallDevice ? 10 : 12,
    color: '#636E72',
    fontFamily: 'monospace',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: isSmallDevice ? 16 : 18,
    color: '#2D3436',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: isSmallDevice ? 14 : 16,
    color: '#636E72',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default UserList;