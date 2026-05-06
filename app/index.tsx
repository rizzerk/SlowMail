import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View } from 'react-native';

export default function Index() {
  const [route, setRoute] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('token').then((token) => {
      setRoute(token ? '/(app)/mailbox' : '/(auth)/login');
    }).catch(() => setRoute('/(auth)/login'));
  }, []);

  if (!route) return <View />;
  return <Redirect href={route as any} />;
}
