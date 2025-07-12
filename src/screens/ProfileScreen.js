import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Image } from 'react-native';
import { Surface, Text, Avatar, Button, Divider, Portal, Dialog, IconButton } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { IS_DEVELOPMENT } from '../config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { API_CONFIG } from '../services/config/api.config';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigation = useNavigation();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        console.log('userData', userData);
        if (userData) {
          const parsedUser = JSON.parse(userData);
          if (parsedUser.tanggalLahir) {
            const date = new Date(parsedUser.tanggalLahir);
            parsedUser.tanggalLahir = date.toISOString().split('T')[0];
          }
          setUser(parsedUser);
        }
      } catch (e) {
        setUser(null);
      }
    };
    fetchUser();
    // Tambahkan listener untuk refresh saat screen difokuskan
    const unsubscribe = navigation.addListener('focus', fetchUser);
    return unsubscribe;
  }, [navigation]);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setLoading(false);
      setShowLogoutDialog(false);
    }
  };

  const profileData = user || {
    noTelepon: '-',
    email: '-',
    jenisKelamin: '-',
    tanggalLahir: '-',
    kataSandi: '********',
    fotoProfil: null,
    status: '-',
    idUser: '-',
  };

  const getProfilePhotoUrl = (fotoProfil) => {
    if (!fotoProfil) return null;
    if (fotoProfil.startsWith('http')) return fotoProfil;
    return `${API_CONFIG.IMAGE_URL}/${fotoProfil}`;
  };

  const renderProfileItem = (icon, label, value) => (
    <View style={styles.profileItem}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <View style={styles.profileItemContent}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      <IconButton
        icon="pencil"
        size={20}
        onPress={() => navigation.navigate('EditProfile')}
        style={styles.editButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.surface}>
        <ScrollView>
          <View style={styles.header}>
            {user && user.fotoProfil ? (
              <Image source={{ uri: getProfilePhotoUrl(user.fotoProfil) }} style={styles.profilePhoto} />
            ) : (
            <Avatar.Icon size={80} icon="account" style={styles.avatar} />
            )}
            <Text style={styles.username}>{user ? user.email : t('default_user')}</Text>
            {IS_DEVELOPMENT && <Text style={styles.devBadge}>{t('dev_mode')}</Text>}
            <IconButton
              icon="account-edit"
              size={24}
              onPress={() => navigation.navigate('EditProfile')}
              style={styles.editProfileButton}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.content}>
            {renderProfileItem(
              <Avatar.Icon size={40} icon="phone" style={styles.fieldIcon} />,
              t('phone_number'),
              profileData.noTelepon
            )}
            {renderProfileItem(
              <Avatar.Icon size={40} icon="email" style={styles.fieldIcon} />,
              t('email'),
              profileData.email
            )}
            {renderProfileItem(
              <Avatar.Icon size={40} icon="gender-male-female" style={styles.fieldIcon} />,
              t('gender'),
              profileData.jenisKelamin
            )}
            {renderProfileItem(
              <Avatar.Icon size={40} icon="calendar" style={styles.fieldIcon} />,
              t('birth_date'),
              profileData.tanggalLahir
            )}

            <Button
              mode="contained"
              icon="cog"
              onPress={() => navigation.navigate('Settings')}
              style={styles.settingsButton}
            >
              {t('settings')}
            </Button>

            <Button
              mode="contained"
              icon="logout"
              onPress={() => setShowLogoutDialog(true)}
              style={styles.logoutButton}
            >
              {t('logout')}
            </Button>
          </View>
        </ScrollView>

        <Portal>
          <Dialog visible={showLogoutDialog} onDismiss={() => setShowLogoutDialog(false)}>
            <Dialog.Title>{t('logout_confirm_title')}</Dialog.Title>
            <Dialog.Content>
              <Text>{t('logout_confirm_text')}</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowLogoutDialog(false)}>{t('cancel')}</Button>
              <Button 
                mode="contained"
                onPress={handleLogout}
                loading={loading}
                disabled={loading}
              >
                {t('logout')}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
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
  header: {
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    backgroundColor: '#3892c6',
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#3892c6',
  },
  devBadge: {
    color: '#666',
    fontSize: 12,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  divider: {
    marginVertical: 16,
  },
  content: {
    padding: 16,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
  },
  iconContainer: {
    marginRight: 16,
  },
  fieldIcon: {
    backgroundColor: '#3892c620',
  },
  profileItemContent: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  settingsButton: {
    backgroundColor: '#3892c6',
    marginTop: 24,
    marginBottom: 12,
    borderRadius: 8,
  },
  logoutButton: {
    backgroundColor: '#B00020',
    borderRadius: 8,
  },
  editButton: {
    margin: 0,
  },
  editProfileButton: {
    position: 'absolute',
    top: 24,
    right: 24,
    backgroundColor: '#3892c620',
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    backgroundColor: '#E1E1E1',
  },
}); 