import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from 'react-i18next';

const LandingPage = ({ onLogin, onRegister }) => {
  const { t } = useTranslation();
  
  return (
    <View style={styles.container}>
      <Image source={require("../../../assets/logo.png")} style={styles.logo} />
      <Text style={styles.title}>{t('welcome.app_name')}</Text>
      <Text style={styles.description}>
        {t('welcome.landing.description')}
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={() => onLogin('Login')}
        >
          <Text style={styles.loginButtonText}>{t('welcome.landing.login_button')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.registerButton} 
          onPress={() => onRegister('Register')}
        >
          <Text style={styles.registerButtonText}>{t('welcome.landing.register_button')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1565C0",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#1976D2",
    textAlign: "center",
    marginBottom: 60,
    maxWidth: 300,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
  },
  loginButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#1976D2",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  loginButtonText: {
    color: "#1976D2",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  registerButton: {
    backgroundColor: "#1976D2",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  registerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default LandingPage;
