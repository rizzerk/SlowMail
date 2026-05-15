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
  card:       { backgroundColor: Colors.cream, borderRadius: 32, borderWidth: 4, borderColor: Colors.darkInk, padding: 28, width: '85%' },
  title:      { fontFamily: 'PressStart', fontSize: 18, textAlign: 'center', marginBottom: 24, color: Colors.darkInk },
  label:      { fontFamily: 'PressStart', fontSize: 8, color: Colors.darkInk, marginBottom: 6 },
  input:      { fontFamily: 'PressStart', borderBottomWidth: 3, borderColor: Colors.darkInk, paddingVertical: 8, fontSize: 10, marginBottom: 18, color: Colors.darkInk },
  pwRow:      { flexDirection: 'row', alignItems: 'center' },
  eyeBtn:     { paddingHorizontal: 8, paddingBottom: 16 },
  eyeIcon:    { fontSize: 16 },
  forgot:     { fontFamily: 'PressStart', fontSize: 7, color: Colors.darkInk, textDecorationLine: 'underline', textAlign: 'center', marginBottom: 18 },
  signInBtn:  { backgroundColor: Colors.yellow, borderRadius: 28, paddingVertical: 14, alignItems: 'center', borderWidth: 3, borderColor: Colors.darkInk, marginBottom: 18 },
  signInText: { fontFamily: 'PressStart', fontSize: 10, color: Colors.darkInk },
  signUpRow:  { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  noAccount:  { fontFamily: 'PressStart', fontSize: 7, color: Colors.darkInk },
  signUpBtn:  { borderWidth: 3, borderColor: Colors.darkInk, borderRadius: 28, paddingHorizontal: 14, paddingVertical: 8 },
  signUpText: { fontFamily: 'PressStart', fontSize: 7, color: Colors.darkInk },
});
