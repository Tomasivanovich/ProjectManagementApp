import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const Header = ({ title, showBack = false, rightComponent }) => {
  const navigation = useNavigation();
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {user && (
            <Text style={styles.userRole}>
              {user.rol_global === 'admin' ? 'Administrador' : 'Usuario'}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        {rightComponent}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: isSmallDevice ? 16 : 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DFE6E9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DFE6E9',
  },
  backButtonText: {
    fontSize: 20,
    color: '#0984E3',
    fontWeight: 'bold',
    marginTop: -2,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  userRole: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#636E72',
    marginTop: 2,
    fontWeight: '500',
  },
  rightSection: {
    marginLeft: 12,
  },
});

export default Header;