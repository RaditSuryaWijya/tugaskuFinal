import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Surface, Text, Avatar, Button, Divider, Portal, Dialog } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { IS_DEVELOPMENT } from '../config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (e) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

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

  const renderProfileItem = (icon, label, value) => (
    <View style={styles.profileItem}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <View style={styles.profileItemContent}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.surface}>
        <ScrollView>
          <View style={styles.header}>
            <Avatar.Icon size={80} icon="account" style={styles.avatar} />
            <Text style={styles.username}>{user ? user.email : 'Azizah Salsa'}</Text>
            {IS_DEVELOPMENT && <Text style={styles.devBadge}>Mode Pengembangan</Text>}
          </View>

          <Divider style={styles.divider} />

          <View style={styles.content}>
            {renderProfileItem(
              <Avatar.Icon size={40} icon="phone" style={styles.fieldIcon} />,
              'No Telepon',
              profileData.noTelepon
            )}
            {renderProfileItem(
              <Avatar.Icon size={40} icon="email" style={styles.fieldIcon} />,
              'Email',
              profileData.email
            )}
            {renderProfileItem(
              <Avatar.Icon size={40} icon="gender-male-female" style={styles.fieldIcon} />,
              'Jenis Kelamin',
              profileData.jenisKelamin
            )}
            {renderProfileItem(
              <Avatar.Icon size={40} icon="calendar" style={styles.fieldIcon} />,
              'Tanggal Lahir',
              profileData.tanggalLahir
            )}
            {renderProfileItem(
              <Avatar.Icon size={40} icon="lock" style={styles.fieldIcon} />,
              'Kata Sandi',
              profileData.kataSandi
            )}

            <Button
              mode="contained"
              icon="logout"
              onPress={() => setShowLogoutDialog(true)}
              style={styles.logoutButton}
            >
              Logout
            </Button>
          </View>
        </ScrollView>

        <Portal>
          <Dialog visible={showLogoutDialog} onDismiss={() => setShowLogoutDialog(false)}>
            <Dialog.Title>Konfirmasi Logout</Dialog.Title>
            <Dialog.Content>
              <Text>Apakah Anda yakin ingin keluar dari aplikasi?</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowLogoutDialog(false)}>Batal</Button>
              <Button 
                mode="contained"
                onPress={handleLogout}
                loading={loading}
                disabled={loading}
              >
                Logout
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
  logoutButton: {
    backgroundColor: '#B00020',
    marginTop: 24,
    borderRadius: 8,
  },
}); 