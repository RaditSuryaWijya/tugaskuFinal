import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Text } from 'react-native';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3892c6',
    accent: '#2654a1',
    secondary: '#2654a1',
    surface: '#fff',
    background: '#FAFAFA',
    text: '#222',
    // Tambahkan warna lain jika perlu
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: { fontFamily: 'Poppins_400Regular', fontWeight: 'normal' },
    medium: { fontFamily: 'Poppins_500Medium', fontWeight: 'normal' },
    light: { fontFamily: 'Poppins_400Regular', fontWeight: 'normal' },
    thin: { fontFamily: 'Poppins_400Regular', fontWeight: 'normal' },
    // Paper v5+: tambahkan varian bodyMedium, bodyLarge, bodySmall, dsb
    bodyMedium: { fontFamily: 'Poppins_400Regular', fontWeight: 'normal' },
    bodyLarge: { fontFamily: 'Poppins_400Regular', fontWeight: 'normal' },
    bodySmall: { fontFamily: 'Poppins_400Regular', fontWeight: 'normal' },
    labelLarge: { fontFamily: 'Poppins_500Medium', fontWeight: 'normal' },
    labelMedium: { fontFamily: 'Poppins_400Regular', fontWeight: 'normal' },
    labelSmall: { fontFamily: 'Poppins_400Regular', fontWeight: 'normal' },
    titleLarge: { fontFamily: 'Poppins_700Bold', fontWeight: 'normal' },
    titleMedium: { fontFamily: 'Poppins_500Medium', fontWeight: 'normal' },
    titleSmall: { fontFamily: 'Poppins_400Regular', fontWeight: 'normal' },
    displayLarge: { fontFamily: 'Poppins_700Bold', fontWeight: 'normal' },
    displayMedium: { fontFamily: 'Poppins_500Medium', fontWeight: 'normal' },
    displaySmall: { fontFamily: 'Poppins_400Regular', fontWeight: 'normal' },
    headlineLarge: { fontFamily: 'Poppins_700Bold', fontWeight: 'normal' },
    headlineMedium: { fontFamily: 'Poppins_500Medium', fontWeight: 'normal' },
    headlineSmall: { fontFamily: 'Poppins_400Regular', fontWeight: 'normal' },
  },
};

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

function App() {
  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  // Override Text default font
  const oldRender = Text.render;
  Text.render = function (...args) {
    const origin = oldRender.call(this, ...args);
    return React.cloneElement(origin, {
      style: [{ fontFamily: 'Poppins_400Regular' }, origin.props.style],
    });
  };

  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </PaperProvider>
    </AuthProvider>
  );
}

export default App;
