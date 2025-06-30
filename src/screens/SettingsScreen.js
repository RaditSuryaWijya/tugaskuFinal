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
                      color="#6200ee"
                    />
                  )}
                  onPress={() => handleLanguageChange(lang.value)}
                />
              ))}
            </RadioButton.Group>
          </List.Section>

          <Divider />

          <List.Section>
            <List.Subheader>Tampilan</List.Subheader>
            <List.Item
              title="Mode Gelap"
              left={() => <List.Icon icon="theme-light-dark" />}
              right={() => (
                <Switch
                  value={settings.darkMode}
                  onValueChange={() => handleSettingToggle('darkMode')}
                  color="#6200ee"
                />
              )}
            />
          </List.Section>

          <Divider />

          <List.Section>
            <List.Subheader>Notifikasi</List.Subheader>
            <List.Item
              title="Aktifkan Notifikasi"
              left={() => <List.Icon icon="bell" />}
              right={() => (
                <Switch
                  value={settings.notifications}
                  onValueChange={() => handleSettingToggle('notifications')}
                  color="#6200ee"
                />
              )}
            />
            <List.Item
              title="Suara"
              left={() => <List.Icon icon="volume-high" />}
              right={() => (
                <Switch
                  value={settings.soundEnabled}
                  onValueChange={() => handleSettingToggle('soundEnabled')}
                  color="#6200ee"
                />
              )}
            />
            <List.Item
              title="Getaran"
              left={() => <List.Icon icon="vibrate" />}
              right={() => (
                <Switch
                  value={settings.vibrationEnabled}
                  onValueChange={() => handleSettingToggle('vibrationEnabled')}
                  color="#6200ee"
                />
              )}
            />
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
    color: '#6200ee',
    textAlign: 'center',
    marginVertical: 16,
  },
}); 