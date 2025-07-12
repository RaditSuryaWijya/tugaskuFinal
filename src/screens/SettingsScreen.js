import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Surface, List, Switch, Divider, Text, RadioButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/i18n'; // pastikan path ini sesuai dengan lokasi file i18n.js kamu

export default function SettingsScreen({ navigation }) {
  const { t } = useTranslation();

  const [settings, setSettings] = useState({
    language: i18n.language || 'id',
    darkMode: false,
    notifications: true,
    soundEnabled: true,
    vibrationEnabled: true,
  });

  const languages = [
    { label: 'Bahasa Indonesia', value: 'id' },
    { label: 'English', value: 'en' },
  ];

  const handleLanguageChange = (value) => {
    setSettings(prev => ({ ...prev, language: value }));
    i18n.changeLanguage(value);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.surface}>
        <ScrollView>
          <Text style={styles.title}>{t('settings')}</Text>

          <List.Section>
            <List.Subheader>{t('language')}</List.Subheader>
            <RadioButton.Group 
              onValueChange={handleLanguageChange} 
              value={settings.language}
            >
              {languages.map((lang) => (
                <List.Item
                  key={lang.value}
                  title={lang.label}
                  left={() => (
                    <RadioButton.Android 
                      value={lang.value} 
                      color="#3892c6"
                    />
                  )}
                  onPress={() => handleLanguageChange(lang.value)}
                />
              ))}
            </RadioButton.Group>
          </List.Section>

          <List.Section>
            <List.Subheader>{t('about')}</List.Subheader>
            <List.Item
              title={t('app_version')}
              description="1.0.0"
              left={() => <List.Icon icon="information" />}
            />
          </List.Section>
        </ScrollView>
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  surface: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3892c6',
    textAlign: 'center',
    marginVertical: 16,
  },
});
