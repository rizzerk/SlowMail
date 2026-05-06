import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView, Platform,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { post, saveAuth } from '../../lib/api';
import { Colors } from '../../lib/theme';

export default function LoginScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);

  const login = async () => {
    if (!email || !password) return Alert.alert('Fill in all fields');
    setLoading(true);
    try {
      const { data } = await post('auth/login', { email, password });
      await saveAuth(data.token, data.user);
      router.replace('/(app)/mailbox');
    } catch (e: any) {
      Alert.alert('Login failed', e.response?.data?.message || 'Check credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.bg}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Log In</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@email.com"
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.pwRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPw}
            placeholder="••••••"
          />
          <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
            <Text style={styles.eyeIcon}>{showPw ? '👁' : '🙈'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => Alert.alert('Contact admin to reset password.')}>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signInBtn} onPress={login} disabled={loading}>
          {loading
            ? <ActivityIndicator color={Colors.darkInk} />
            : <Text style={styles.signInText}>Sign in</Text>
          }
        </TouchableOpacity>

        <View style={styles.signUpRow}>
          <Text style={styles.noAccount}>No account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <View style={styles.signUpBtn}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bg:         { flex: 1, backgroundColor: Colors.skyBlue, justifyContent: 'center', alignItems: 'center' },
  card:       { backgroundColor: Colors.cream, borderRadius: 16, borderWidth: 2, borderColor: Colors.darkInk, padding: 28, width: '82%' },
  title:      { fontFamily: 'monospace', fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: Colors.darkInk },
  label:      { fontFamily: 'monospace', fontSize: 13, color: Colors.darkInk, marginBottom: 4 },
  input:      { borderBottomWidth: 1.5, borderColor: Colors.darkInk, paddingVertical: 6, fontSize: 14, marginBottom: 16, color: Colors.darkInk },
  pwRow:      { flexDirection: 'row', alignItems: 'center' },
  eyeBtn:     { paddingHorizontal: 8, paddingBottom: 16 },
  eyeIcon:    { fontSize: 16 },
  forgot:     { fontFamily: 'monospace', fontSize: 12, color: Colors.darkInk, textDecorationLine: 'underline', textAlign: 'center', marginBottom: 16 },
  signInBtn:  { backgroundColor: Colors.yellow, borderRadius: 24, paddingVertical: 12, alignItems: 'center', borderWidth: 2, borderColor: Colors.darkInk, marginBottom: 16 },
  signInText: { fontFamily: 'monospace', fontWeight: 'bold', fontSize: 15, color: Colors.darkInk },
  signUpRow:  { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  noAccount:  { fontFamily: 'monospace', fontSize: 13, color: Colors.darkInk },
  signUpBtn:  { borderWidth: 2, borderColor: Colors.darkInk, borderRadius: 24, paddingHorizontal: 14, paddingVertical: 6 },
  signUpText: { fontFamily: 'monospace', fontSize: 13, color: Colors.darkInk },
});
