import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { get, post, clearAuth, getUser } from '../../lib/api';
import { Colors } from '../../lib/theme';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getUser().then(setUser);
  }, []);

  const logout = async () => {
    await post('auth/logout').catch(() => {});
    await clearAuth();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.center}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.username?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={styles.username}>@{user?.username ?? '...'}</Text>
        <Text style={styles.email}>{user?.email ?? ''}</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.skyBlue },
  topBar: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12 },
  back: { fontFamily: 'PressStart', fontSize: 12, color: Colors.darkInk, textDecorationLine: 'underline' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatar: { backgroundColor: Colors.yellow, borderRadius: 50, borderWidth: 3, borderColor: Colors.darkInk, width: 100, height: 100, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontFamily: 'PressStart', fontSize: 40, color: Colors.darkInk },
  username: { fontFamily: 'PressStart', fontSize: 16, color: Colors.darkInk, marginBottom: 8 },
  email: { fontFamily: 'PressStart', fontSize: 10, color: Colors.mutedInk, marginBottom: 32 },
  logoutBtn: { backgroundColor: Colors.throwRed, borderRadius: 24, paddingVertical: 12, paddingHorizontal: 32, borderWidth: 2, borderColor: Colors.darkInk },
  logoutText: { fontFamily: 'PressStart', fontSize: 12, color: Colors.darkInk },
});
