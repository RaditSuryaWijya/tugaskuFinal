import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider, useAuth } from './src/context/AuthContext';

function AppContent() {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    // Tambahkan loading screen jika diperlukan
    return null;
  }

  return <RootNavigator isAuthenticated={isAuthenticated} />;
}

export default function App() {
  return (
    <AuthProvider>
      <PaperProvider>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </PaperProvider>
    </AuthProvider>
  );
}
