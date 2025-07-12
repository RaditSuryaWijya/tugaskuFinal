import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { TextInput, Button, Text, Surface, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services';
import { IS_DEVELOPMENT } from '../../config/constants';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const { setIsAuthenticated, loginSuccess } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t("login.error_empty_fields"));
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await authService.login(email, password);
      if (response && response.result === 200) {
        await loginSuccess(response.data);
      } else {
        setError(response?.message || t("login.error_generic"));
      }
    } catch (error) {
      setError(error?.response?.data?.message || error.message || t("login.error_generic"));
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
          <Text style={styles.title}>{t("login.title")}</Text>

          <TextInput
            label={t("login.email")}
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            mode="outlined"
            autoCapitalize="none"
          />

          <TextInput
            label={t("login.password")}
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
            {t("login.button_login")}
          </Button>

          <View style={styles.registerContainer}>
            <Text>{t("login.no_account")}</Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              style={styles.registerButton}
            >
              {t("login.register_button")}
            </Button>
          </View>

          {IS_DEVELOPMENT && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.developmentContainer}>
                <Text style={styles.developmentText}>{t("login.development_mode")}</Text>
                <Button
                  mode="outlined"
                  onPress={handleSkipLogin}
                  style={styles.skipButton}
                >
                  {t("login.skip_login")}
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
