import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import AgendaScreen from '../../screens/AgendaScreen';
import HistoryScreen from '../../screens/HistoryScreen';
import AddTaskScreen from '../../screens/AddTaskScreen';
import NotificationScreen from '../../screens/NotificationScreen';
import ProfileScreen from '../../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const Logo = () => (
    <View style={styles.logoContainer}>
      <Text style={styles.logoText}>T</Text>
    </View>
  );

const TabButton = ({ label, isFocused, onPress, iconName }) => {
  const translateYValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
      Animated.parallel([
        Animated.spring(translateYValue, {
        toValue: isFocused ? -20 : 0,
          useNativeDriver: true,
          friction: 6,
          tension: 40,
        }),
        Animated.spring(scaleValue, {
        toValue: isFocused ? 1.2 : 1,
          useNativeDriver: true,
          friction: 6,
          tension: 40,
        }),
      ]).start();
  }, [isFocused]);

  return (
    <TouchableOpacity onPress={onPress} style={styles.tabItem} activeOpacity={1}>
      <Animated.View
        style={[
          styles.tabButton,
          {
            transform: [{ translateY: translateYValue }, { scale: scaleValue }],
          },
        ]}
      >
        <View style={[styles.iconContainer, isFocused && styles.focusedIconContainer]}>
          <MaterialCommunityIcons
            name={iconName}
            size={24}
            color={isFocused ? '#ffffff' : '#757575'}
          />
        </View>
        {isFocused && typeof label === 'string' && (
          <Text style={styles.tabText}>{label}</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let iconName;
        switch (route.name) {
          case 'Agenda':
            iconName = 'calendar-check';
            break;
          case 'Riwayat':
            iconName = 'history';
            break;
          case 'Tambah':
            iconName = 'plus-circle';
            break;
          case 'Notifikasi':
            iconName = 'bell';
            break;
          case 'Profil':
            iconName = 'account';
            break;
          default:
            iconName = 'circle';
        }

        const label = t(`tabBar.${route.name.toLowerCase()}`) || route.name;

        return (
          <TabButton
            key={index}
            label={label}
            isFocused={isFocused}
            onPress={onPress}
            iconName={iconName}
          />
        );
      })}
    </View>
  );
};

export default function BottomNavigation() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: true, // Selalu tampilkan header di semua tab, termasuk Profil
        headerShadowVisible: false,
        headerTitle: () => (
          <View style={styles.headerContainer}>
            <Logo />
            <Text style={styles.headerTitle}>TugasKu</Text>
          </View>
        ),
        headerStyle: {
          height: 85,
          backgroundColor: '#E8F4FD',
        },
      }}
    >
      {['Agenda', 'Riwayat', 'Tambah', 'Notifikasi', 'Profil'].map((name) => (
        <Tab.Screen
          key={name}
          name={name}
          component={
            name === 'Agenda' ? AgendaScreen :
            name === 'Riwayat' ? HistoryScreen :
            name === 'Tambah' ? AddTaskScreen :
            name === 'Notifikasi' ? NotificationScreen :
            ProfileScreen
          }
          options={{
            // headerShown: name !== 'Profil', // DIHAPUS AGAR HEADER MUNCUL DI PROFIL
        headerShadowVisible: false,
        headerTitle: () => (
          <View style={styles.headerContainer}>
            <Logo />
                <Text style={styles.headerTitle}>TugasKu</Text>
          </View>
        ),
        headerStyle: {
          height: 85,
              backgroundColor: '#E8F4FD',
          },
        }}
      />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 80,
    paddingHorizontal: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    padding: 8,
    borderRadius: 12,
  },
  focusedIconContainer: {
    backgroundColor: '#3892c6',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#3892c6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tabText: {
    color: '#3892c6',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#000000',
  },
  logoContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#3892c6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
