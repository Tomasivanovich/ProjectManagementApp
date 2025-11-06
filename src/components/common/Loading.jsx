import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const Loading = ({ message = 'Cargando...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0984E3" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: isSmallDevice ? 16 : 20,
  },
  text: {
    marginTop: isSmallDevice ? 12 : 16,
    fontSize: isSmallDevice ? 14 : 16,
    color: '#636E72',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default Loading;