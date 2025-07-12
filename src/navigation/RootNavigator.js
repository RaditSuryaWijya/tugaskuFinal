import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import AuthNavigator from './AuthNavigator';
import BottomNavigation from '../components/navigation/BottomNavigation';
import AddTaskScreen from '../screens/AddTaskScreen';
import PickLocationScreen from '../screens/PickLocationScreen';
import DetailTaskScreen from '../screens/DetailTaskScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

const Stack = createStackNavigator();

export default function RootNavigator({ isAuthenticated }) {
  const { t } = useTranslation();
  
  return (
    <Stack.Navigator>
      {!isAuthenticated ? (
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen 
          name="Main" 
          component={BottomNavigation}
          options={{ headerShown: false }}
        />
      )}
      <Stack.Group screenOptions={{
        headerStyle: {
          backgroundColor: '#3892c6',
        },
        headerTintColor: '#fff',
        headerShown: true,
        presentation: 'modal'
      }}>
        <Stack.Screen 
          name="AddTask" 
          component={AddTaskScreen}
          options={{
            title: t('task.info'),
          }}
        />
        <Stack.Screen 
          name="PickLocation" 
          component={PickLocationScreen}
          options={{
            title: t('location.add'),
          }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            title: t('settings'),
            headerStyle: {
              backgroundColor: '#E8F4FD',
            },
            headerTintColor: '#000',
          }}
        />
        <Stack.Screen 
          name="EditProfile" 
          component={EditProfileScreen}
          options={{
            title: t('profile.edit'),
            headerStyle: {
              backgroundColor: '#E8F4FD',
            },
            headerTintColor: '#000',
          }}
        />
      </Stack.Group>
      <Stack.Screen 
        name="DetailTask" 
        component={DetailTaskScreen}
        options={{
          title: t('task.info'),
          headerStyle: {
            backgroundColor: '#3892c6',
          },
          headerShown: false,
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
} 