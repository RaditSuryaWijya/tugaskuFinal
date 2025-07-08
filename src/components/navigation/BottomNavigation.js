import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import AgendaScreen from '../../screens/AgendaScreen';
import HistoryScreen from '../../screens/HistoryScreen';
import AddTaskScreen from '../../screens/AddTaskScreen';
import NotificationScreen from '../../screens/NotificationScreen';
import ProfileScreen from '../../screens/ProfileScreen';
import SettingsScreen from '../../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const Logo = () => {
  return (
    <View style={styles.logoContainer}>
      <Text style={styles.logoText}>T</Text>
    </View>
  );
};

const TabButton = ({ label, isFocused, onPress, iconName }) => {
  const translateYValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isFocused) {
      // Animasi naik dan membesar
      Animated.parallel([
        Animated.spring(translateYValue, {
          toValue: -20,
          useNativeDriver: true,
          friction: 6,
          tension: 40,
        }),
        Animated.spring(scaleValue, {
          toValue: 1.2,
          useNativeDriver: true,
          friction: 6,
          tension: 40,
        }),
      ]).start();
    } else {
      // Animasi turun dan mengecil
      Animated.parallel([
        Animated.spring(translateYValue, {
          toValue: 0,
          useNativeDriver: true,
          friction: 6,
          tension: 40,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          friction: 6,
          tension: 40,
        }),
      ]).start();
    }
  }, [isFocused]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.tabItem}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          styles.tabButton,
          {
            transform: [
              { translateY: translateYValue },
              { scale: scaleValue }
            ]
          }
        ]}
      >
        <View style={[styles.iconContainer, isFocused && styles.focusedIconContainer]}>
          <MaterialCommunityIcons
            name={iconName}
            size={24}
            color={isFocused ? '#ffffff' : '#757575'}
          />
        </View>
        {isFocused && (
          <Text style={styles.tabText}>{label}</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = route.name;
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

        // Icon berdasarkan route name
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
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false,
        headerStyle: {
          height: 50
        }
      }}
    >
      <Tab.Screen name="Agenda" component={AgendaScreen} options={({ navigation }) => ({
        headerShown: true,
        headerShadowVisible: false,
        headerTitle: () => (
          <View style={styles.headerContainer}>
            <Logo />
            <Text style={styles.headerTitle}>TugasKu</Text>
          </View>
        ),
        headerStyle: {
          height: 75
        },
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => navigation.navigate('Settings')}
            style={{marginRight: 16}}
          >
            <MaterialCommunityIcons name="cog" size={24} color="#3892c6" />
          </TouchableOpacity>
        )
      })} />
      <Tab.Screen name="Riwayat" component={HistoryScreen} options={({ navigation }) => ({
        headerShown: true,
        headerShadowVisible: false,
        headerTitle: () => (
          <View style={styles.headerContainer}>
            <Logo />
            <Text style={styles.headerTitle}>TugasKu</Text>
          </View>
        ),
        headerStyle: {
          height: 75
        },
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => navigation.navigate('Settings')}
            style={{marginRight: 16}}
          >
            <MaterialCommunityIcons name="cog" size={24} color="#3892c6" />
          </TouchableOpacity>
        )
      })} />
      <Tab.Screen name="Tambah" component={AddTaskScreen} options={({ navigation }) => ({
        headerShown: true,
        headerShadowVisible: false,
        headerTitle: () => (
          <View style={styles.headerContainer}>
            <Logo />
            <Text style={styles.headerTitle}>TugasKu</Text>
          </View>
        ),
        headerStyle: {
          height: 75
        },
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => navigation.navigate('Settings')}
            style={{marginRight: 16}}
          >
            <MaterialCommunityIcons name="cog" size={24} color="#3892c6" />
          </TouchableOpacity>
        )
      })} />
      <Tab.Screen name="Notifikasi" component={NotificationScreen} options={({ navigation }) => ({
        headerShown: true,
        headerShadowVisible: false,
        headerTitle: () => (
          <View style={styles.headerContainer}>
            <Logo />
            <Text style={styles.headerTitle}>TugasKu</Text>
          </View>
        ),
        headerStyle: {
          height: 75
        },
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => navigation.navigate('Settings')}
            style={{marginRight: 16}}
          >
            <MaterialCommunityIcons name="cog" size={24} color="#3892c6" />
          </TouchableOpacity>
        )
      })} />
      <Tab.Screen name="Profil" component={ProfileScreen} options={({ navigation }) => ({
        headerShown: true,
        headerShadowVisible: false,
        headerTitle: "",
        headerStyle: {
          height: 35
        },
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => navigation.navigate('Settings')}
            style={{marginRight: 16}}
          >
            <MaterialCommunityIcons name="cog" size={24} color="#3892c6" />
          </TouchableOpacity>
        )
      })} />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarButton: () => null,
          headerShown: true,
          headerTitle: '',
          headerStyle: {
            height: 35
          },
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
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
