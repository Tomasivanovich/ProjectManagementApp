import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  Platform
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import usersService from '../../services/users';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';

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
      case 'admin': return '#FF6B6B';
      case 'usuario': return '#45B7D1';
      default: return '#95A5A6';
    }
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.nombre.split(' ').map(n => n[0]).join('').toUpperCase()}
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
          {users.length} usuarios registrados
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
            colors={['#007AFF']}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 12,
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    paddingBottom: 20,
  },
  userCard: {
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
  userHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userDate: {
    fontSize: 12,
    color: '#999',
  },
  userFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
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
    textTransform: 'capitalize',
  },
  userId: {
    fontSize: 12,
    color: '#999',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
});

export default UserList;