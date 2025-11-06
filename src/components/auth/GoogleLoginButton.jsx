import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

const GoogleLoginButton = () => {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  // Obtener configuración desde app.config.js
  const googleConfig = Constants.expoConfig?.extra?.google;

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: googleConfig?.expoClientId,
    iosClientId: googleConfig?.iosClientId,
    androidClientId: googleConfig?.androidClientId,
    webClientId: googleConfig?.webClientId,
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleSignIn(authentication.accessToken);
    } else if (response?.type === 'error') {
      console.error('Google OAuth Error:', response.error);
      Alert.alert('Error', 'No se pudo completar el inicio de sesión con Google');
      setLoading(false);
    }
  }, [response]);

  const handleGoogleSignIn = async (accessToken) => {
    try {
      await loginWithGoogle(accessToken);
    } catch (error) {
      console.error('Error en login con Google:', error);
      Alert.alert('Error', error.message || 'Error al iniciar sesión con Google');
    } finally {
      setLoading(false);
    }
  };

  const handlePress = async () => {
    setLoading(true);
    try {
      await promptAsync();
    } catch (error) {
      console.error('Error al abrir Google OAuth:', error);
      Alert.alert('Error', 'No se pudo abrir la ventana de autenticación');
      setLoading(false);
    }
  };

  // Verificar si la configuración está disponible
  if (!googleConfig || !googleConfig.androidClientId) {
    return (
      <TouchableOpacity style={[styles.button, styles.buttonDisabled]} disabled={true}>
        <Text style={styles.buttonText}>Google OAuth no configurado</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, loading && styles.buttonDisabled]}
      onPress={handlePress}
      disabled={loading || !request}
    >
      <View style={styles.buttonContent}>
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <Text style={styles.icon}>G</Text>
            <Text style={styles.buttonText}>Continuar con Google</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#DB4437',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#C1351D',
    minHeight: 50,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
    borderColor: '#999999',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
    backgroundColor: 'white',
    color: '#DB4437',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 22,
    overflow: 'hidden',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoogleLoginButton;