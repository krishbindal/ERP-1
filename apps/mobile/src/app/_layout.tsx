import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useState, useEffect } from 'react';
import { Appearance, ColorSchemeName, Platform, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ThemeContext } from '@/hooks/useThemePreference';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const [colorScheme, setColorSchemeState] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  // Keep state in sync if system setting changes and no override is set
  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme: next }) => {
      setColorSchemeState(next);
    });
    return () => listener.remove();
  }, []);

  const setColorScheme = (scheme: ColorSchemeName) => {
    // setColorScheme is not implemented in react-native-web
    if (Platform.OS !== 'web') {
      Appearance.setColorScheme(scheme);
    }
    setColorSchemeState(scheme ?? Appearance.getColorScheme());
  };

  const resolved = colorScheme ?? systemScheme;

  return (
    <ThemeContext.Provider value={{ colorScheme: resolved, setColorScheme }}>
      <ThemeProvider value={resolved === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="notifications" options={{ title: 'Notices' }} />
          <Stack.Screen name="fees" options={{ title: 'Fees' }} />
          <Stack.Screen name="attendance" options={{ title: 'Attendance' }} />
          <Stack.Screen name="homework" options={{ title: 'Homework' }} />
          <Stack.Screen name="timetable" options={{ title: 'Timetable' }} />
          <Stack.Screen name="exams" options={{ title: 'Exams & Results' }} />
          <Stack.Screen name="appearance" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
