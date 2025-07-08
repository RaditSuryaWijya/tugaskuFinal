import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AuthNavigator from './AuthNavigator';
import BottomNavigation from '../components/navigation/BottomNavigation';
import AddTaskScreen from '../screens/AddTaskScreen';
import PickLocationScreen from '../screens/PickLocationScreen';
import DetailTaskScreen from '../screens/DetailTaskScreen';

const Stack = createStackNavigator();

export default function RootNavigator({ isAuthenticated }) {
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
            title: 'Tambah Tugas',
          }}
        />
        <Stack.Screen 
          name="PickLocation" 
          component={PickLocationScreen}
          options={{
            title: 'Pilih Lokasi',
          }}
        />
      </Stack.Group>
      <Stack.Screen 
        name="DetailTask" 
        component={DetailTaskScreen}
        options={{
          title: 'Detail Tugas',
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