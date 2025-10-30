import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  color?: string; // <- agregamos color opcional
}

const Button: React.FC<ButtonProps> = ({ title, onPress, loading = false, disabled = false, color }) => {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color || '#007bff' }, (disabled || loading) && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>{title}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  disabled: {
    backgroundColor: '#999',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Button;
