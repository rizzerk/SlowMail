import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { post, saveAuth } from '../../lib/api';
import { Colors } from '../../lib/theme';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const register = async () => {
    if (!username || !email || !password) return Alert.alert('Fill in all fields');
    setLoading(true);
    try {
      const { data } = await post('auth/register', { username, email, password });
      try {
        await saveAuth(data.token, data.user);
      } catch {
        // simulator storage issue, continue anyway
      }
      router.replace('/(app)/mailbox');
    } catch (e: any) {
      console.log('REGISTER ERROR:', JSON.stringify(e.response?.data));
      console.log('MESSAGE:', e.message);
      Alert.alert('Error', e.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.bg} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.title}>Sign Up</Text>

          <Text style={styles.label}>Username</Text>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" placeholder="your_name" />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@email.com" />

          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="min 6 chars" />

          <TouchableOpacity style={styles.btn} onPress={register} disabled={loading}>
            {loading ? <ActivityIndicator color={Colors.darkInk} /> : <Text style={styles.btnText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={{ alignItems: 'center', marginTop: 12 }}>
            <Text style={styles.back}>← Back to login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bg:      { flex: 1, backgroundColor: Colors.skyBlue },
  scroll:  { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card:    { backgroundColor: Colors.cream, borderRadius: 16, borderWidth: 2, borderColor: Colors.darkInk, padding: 28, width: '100%' },
  title:   { fontFamily: 'monospace', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: Colors.darkInk },
  label:   { fontFamily: 'monospace', fontSize: 13, color: Colors.darkInk, marginBottom: 4 },
  input:   { borderBottomWidth: 1.5, borderColor: Colors.darkInk, paddingVertical: 6, fontSize: 14, marginBottom: 16, color: Colors.darkInk },
  btn:     { backgroundColor: Colors.yellow, borderRadius: 24, paddingVertical: 12, alignItems: 'center', borderWidth: 2, borderColor: Colors.darkInk, marginTop: 4 },
  btnText: { fontFamily: 'monospace', fontWeight: 'bold', fontSize: 15, color: Colors.darkInk },
  back:    { fontFamily: 'monospace', fontSize: 12, color: Colors.darkInk, textDecorationLine: 'underline' },
});
