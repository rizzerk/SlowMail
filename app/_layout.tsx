import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { Slot, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'PressStart': require('../assets/fonts/PressStart2P-Regular.ttf'),
  });

  useEffect(() => {
    if (!fontsLoaded) return;
    SplashScreen.hideAsync();
    AsyncStorage.getItem('token').then((token) => {
      setTimeout(() => {
        router.replace(token ? '/(app)/mailbox' : '/(auth)/login');
      }, 100);
    }).catch(() => {
      setTimeout(() => router.replace('/(auth)/login'), 100);
    });
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;
  return <Slot />;
}