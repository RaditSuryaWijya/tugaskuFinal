import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Surface, List, Switch, Divider, Text, RadioButton } from 'react-native-paper';

export default function SettingsScreen({ navigation }) {
  const [settings, setSettings] = useState({
    language: 'id', // id = Indonesia, en = English
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
    // TODO: Implement language change logic
  };

  const handleSettingToggle = (setting) => {
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
    // TODO: Implement setting change logic
  };

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.surface}>
        <ScrollView>
          <Text style={styles.title}>Pengaturan</Text>

          <List.Section>
            <List.Subheader>Bahasa</List.Subheader>
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
            <List.Subheader>Tentang</List.Subheader>
            <List.Item
              title="Versi Aplikasi"
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