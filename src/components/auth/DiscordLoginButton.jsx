import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import * as WebBrowser from 'expo-web-browser';

// Configura esto con tus credenciales de Discord Developer Portal
const DISCORD_CONFIG = {
  clientId: 'TU_DISCORD_CLIENT_ID', // Reemplaza con tu Client ID de Discord
  redirectUri: 'exp://localhost:19000/--/oauth', // Para desarrollo
  responseType: 'token',
  scope: 'identify email',
};

const DiscordLoginButton = () => {
  const { loginWithDiscord } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDiscordLogin = async () => {
    setLoading(true);
    try {
      const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CONFIG.clientId}&redirect_uri=${encodeURIComponent(DISCORD_CONFIG.redirectUri)}&response_type=${DISCORD_CONFIG.responseType}&scope=${DISCORD_CONFIG.scope}`;
      
      const result = await WebBrowser.openAuthSessionAsync(authUrl, DISCORD_CONFIG.redirectUri);
      
      if (result.type === 'success') {
        // Extraer el access token de la URL
        const url = result.url;
        const accessToken = extractAccessTokenFromUrl(url);
        
        if (accessToken) {
          await loginWithDiscord(accessToken);
        } else {
          Alert.alert('Error', 'No se pudo obtener el token de acceso');
        }
      }
    } catch (error) {
      console.error('Error en login con Discord:', error);
      Alert.alert('Error', error.message || 'Error al iniciar sesión con Discord');
    } finally {
      setLoading(false);
    }
  };

  const extractAccessTokenFromUrl = (url) => {
    // La URL vendrá como: exp://localhost:19000/--/oauth#access_token=...
    const match = url.match(/access_token=([^&]+)/);
    return match ? match[1] : null;
  };

  return (
    <TouchableOpacity
      style={[styles.button, loading && styles.buttonDisabled]}
      onPress={handleDiscordLogin}
      disabled={loading}
    >
      <View style={styles.buttonContent}>
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <Text style={styles.icon}>D</Text>
            <Text style={styles.buttonText}>Continuar con Discord</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#5865F2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#4752C4',
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
    backgroundColor: 'white',
    color: '#5865F2',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DiscordLoginButton;