import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Surface, List, Divider, Text, Portal, Dialog, RadioButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { saveLanguage, getStoredLanguage } from '../i18n/i18n';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('id');
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);

  // Load saved language when screen mounts
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    const savedLanguage = await getStoredLanguage();
    setCurrentLanguage(savedLanguage);
  };

  const handleLanguageChange = async (newLanguage) => {
    setCurrentLanguage(newLanguage);
    await saveLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
    setShowLanguageDialog(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.surface}>
        <List.Section>
          <List.Subheader>{t('settings')}</List.Subheader>
          
          <List.Item
            title={t('language')}
            description={currentLanguage === 'id' ? 'Bahasa Indonesia' : 'English'}
            onPress={() => setShowLanguageDialog(true)}
          />
          
          <Divider />
          
          <List.Item
            title={t('app_version')}
            description="1.0.0"
          />
        </List.Section>
      </Surface>

      <Portal>
        <Dialog visible={showLanguageDialog} onDismiss={() => setShowLanguageDialog(false)}>
          <Dialog.Title>{t('language')}</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={handleLanguageChange} value={currentLanguage}>
              <RadioButton.Item label="Bahasa Indonesia" value="id" />
              <RadioButton.Item label="English" value="en" />
            </RadioButton.Group>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F4FD',
  },
  surface: {
    margin: 16,
    elevation: 1,
    borderRadius: 8,
  },
});
