import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { clearAuth, getUser, post, saveAuth } from '../../lib/api';
import { Colors, Fonts } from '../../lib/theme';

export default function ProfileScreen() {
  const [user, setUser]         = useState<any>(null);
  const [editing, setEditing]   = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    getUser().then((u) => {
      setUser(u);
      setUsername(u?.username ?? '');
      setEmail(u?.email ?? '');
    });
  }, []);

  const logout = async () => {
    Alert.alert('Log out?', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out', style: 'destructive', onPress: async () => {
          try { await post('auth/logout'); } catch {}
          await clearAuth();
          router.replace('/(auth)/login');
        }
      }
    ]);
  };

  const save = async () => {
    setLoading(true);
    try {
      const { data } = await post('auth/update', {
        username,
        email,
        ...(password ? { password } : {}),
      });
      await saveAuth(await (async () => {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        return await AsyncStorage.getItem('token');
      })(), data.user);
      setUser(data.user);
      setPassword('');
      setEditing(false);
      Alert.alert('✅ Updated', 'Profile saved.');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={() => setEditing(!editing)}>
          <Text style={styles.editBtn}>{editing ? 'cancel' : 'edit'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.avatarRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.username?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
      </View>

      {!editing ? (
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Username</Text>
          <Text style={styles.fieldValue}>@{user?.username}</Text>
          <Text style={styles.fieldLabel}>Email</Text>
          <Text style={styles.fieldValue}>{user?.email}</Text>
          <Text style={styles.fieldLabel}>Password</Text>
          <Text style={styles.fieldValue}>••••••••</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Text style={styles.fieldLabel}>New Password (leave blank to keep)</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="min 6 chars"
            placeholderTextColor={Colors.mutedInk}
          />
          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.5 }]}
            onPress={save}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={Colors.darkInk} />
              : <Text style={styles.saveBtnText}>Save Changes</Text>
            }
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.cream },
  topBar:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12 },
  title:        { fontFamily: Fonts.pixel, fontWeight: 'bold', fontSize: 18, color: Colors.darkInk },
  back:         { fontFamily: Fonts.pixel, fontSize: 13, color: Colors.mutedInk },
  editBtn:      { fontFamily: Fonts.pixel, fontSize: 13, color: Colors.darkInk, textDecorationLine: 'underline' },
  avatarRow:    { alignItems: 'center', marginVertical: 20 },
  avatar:       { backgroundColor: Colors.yellow, borderRadius: 50, width: 80, height: 80, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.darkInk },
  avatarText:   { fontFamily: Fonts.pixel, fontWeight: 'bold', fontSize: 36, color: Colors.darkInk },
  card:         { margin: 20, backgroundColor: Colors.white, borderRadius: 16, borderWidth: 2, borderColor: Colors.darkInk, padding: 20 },
  fieldLabel:   { fontFamily: Fonts.pixel, fontSize: 11, color: Colors.mutedInk, marginTop: 12, marginBottom: 2 },
  fieldValue:   { fontFamily: Fonts.pixel, fontSize: 15, color: Colors.darkInk },
  input:        { borderBottomWidth: 1.5, borderColor: Colors.darkInk, paddingVertical: 6, fontSize: 14, fontFamily: Fonts.pixel, color: Colors.darkInk, marginBottom: 4 },
  saveBtn:      { backgroundColor: Colors.yellow, borderRadius: 24, paddingVertical: 12, alignItems: 'center', borderWidth: 2, borderColor: Colors.darkInk, marginTop: 16 },
  saveBtnText:  { fontFamily: Fonts.pixel, fontWeight: 'bold', fontSize: 14, color: Colors.darkInk },
  logoutBtn:    { margin: 20, backgroundColor: Colors.throwRed, borderRadius: 24, paddingVertical: 14, alignItems: 'center', borderWidth: 2, borderColor: Colors.darkInk },
  logoutText:   { fontFamily: Fonts.pixel, fontWeight: 'bold', fontSize: 15, color: Colors.darkInk },
});