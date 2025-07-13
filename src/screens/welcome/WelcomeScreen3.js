import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from 'react-i18next';

const WelcomeScreen3 = ({ onNext }) => {
  const { t } = useTranslation();
  
  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/character.png")}
        style={styles.logo}
      />
      <View style={styles.card}>
        <Text style={styles.title}>{t('welcome.app_name')}</Text>
        <Text style={styles.description}>
          {t('welcome.screen3.description')}
        </Text>
        <TouchableOpacity onPress={onNext} style={styles.button}>
          <Text style={styles.buttonText}>{t('welcome.screen3.next_button')}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.pagination}>
        <View style={styles.dotInactive} />
        <View style={styles.dotActive} />
        <View style={styles.dotInactive} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 24,
    resizeMode: "contain",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    maxWidth: 320,
    width: "100%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E3A8A",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
  },
  pagination: {
    flexDirection: "row",
    gap: 8,
    marginTop: 32,
  },
  dotInactive: {
    width: 8,
    height: 8,
    backgroundColor: "#93C5FD",
    borderRadius: 4,
  },
  dotActive: {
    width: 32,
    height: 8,
    backgroundColor: "#2563EB",
    borderRadius: 4,
  },
});

export default WelcomeScreen3;
