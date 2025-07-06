import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { TextInput, Button, Text, Surface, Divider } from 'react-native-paper';
import { authService } from '../../services';
import { IS_DEVELOPMENT } from '../../config/constants';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const { setIsAuthenticated, loginSuccess } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email dan password harus diisi');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await authService.login(email, password);
      if (response && response.result === 200) {
        await loginSuccess(response.data);
      } else {
        setError(response?.message || 'Gagal login. Silakan coba lagi.');
      }
    } catch (error) {
      setError(error?.response?.data?.message || error.message || 'Gagal login. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipLogin = async () => {
    try {
      await authService.setDevelopmentToken();
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error skipping login:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.surface}>
        <View style={styles.content}>
          <Text style={styles.title}>Login TugasKu</Text>
          
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            mode="outlined"
            autoCapitalize="none"
          />
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
            mode="outlined"
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            Login
          </Button>

          <View style={styles.registerContainer}>
            <Text>Belum punya akun? </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              style={styles.registerButton}
            >
              Daftar
            </Button>
          </View>

          {IS_DEVELOPMENT && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.developmentContainer}>
                <Text style={styles.developmentText}>Mode Pengembangan</Text>
                <Button
                  mode="outlined"
                  onPress={handleSkipLogin}
                  style={styles.skipButton}
                >
                  Skip Login
                </Button>
              </View>
            </>
          )}
        </View>
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  surface: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 24,
    paddingVertical: 8,
    backgroundColor: '#2654a1',
  },
  errorText: {
    color: '#B00020',
    marginBottom: 16,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  registerButton: {
    marginLeft: -8,
  },
  divider: {
    marginVertical: 24,
  },
  developmentContainer: {
    alignItems: 'center',
  },
  developmentText: {
    color: '#666',
    marginBottom: 8,
    fontSize: 12,
  },
  skipButton: {
    width: '50%',
  },
}); 