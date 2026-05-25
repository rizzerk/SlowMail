import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet,
  Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native';
import { get, post } from '../../lib/api';
import { Colors, Fonts, envelopeColors } from '../../lib/theme';

type Step = 'write' | 'envelope' | 'address';

export default function ComposeScreen() {
  const [step, setStep]             = useState<Step>('write');
  const [body, setBody]             = useState('');
  const [to, setTo]                 = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [envelope, setEnvelope]     = useState<'tan' | 'lavender' | 'pink'>('tan');
  const [loading, setLoading]       = useState(false);

  const searchUsers = async (q: string) => {
    setTo(q);
    if (q.length < 2) { setSuggestions([]); return; }
    try {
      const { data } = await get('users/search', { q });
      setSuggestions(data);
    } catch {}
  };

  const send = async () => {
    if (!to) return Alert.alert('Who is this for?', 'Enter a username to send to.');
    if (!body.trim()) return Alert.alert('Empty letter', 'Write something first.');
    setLoading(true);
    try {
      await post('letters/send', { to, body, envelope_style: envelope });
      Alert.alert('📮 Sent!', 'Your letter is on its way. It will arrive tomorrow.');
      setBody(''); setTo(''); setStep('write'); setEnvelope('tan');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to send.');
      console.log('SEND ERROR:', JSON.stringify(e.response?.data));
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Write
  if (step === 'write') {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          <Text style={styles.title}>Write a Letter</Text>
        </View>
        <View style={styles.paper}>
          <TextInput
            style={styles.letterInput}
            multiline
            placeholder="Dear..."
            placeholderTextColor={Colors.mutedInk}
            value={body}
            onChangeText={setBody}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{body.length} / 5000</Text>
        </View>
        <TouchableOpacity
          style={[styles.doneBtn, !body.trim() && styles.disabled]}
          onPress={() => body.trim() ? setStep('address') : Alert.alert('Write something first')}
        >
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    );
  }

  // Step 2: Address + envelope
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.addressContent} keyboardShouldPersistTaps="handled">
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setStep('write')}>
          <Text style={styles.backText}>← back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Send To</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Envelope preview */}
      <View style={[styles.envelopePreview, { backgroundColor: envelopeColors[envelope] }]}>
        <View style={styles.addrBlock}>
          <Text style={styles.addrLabel}>To: {to || '___________'}</Text>
        </View>
        <Text style={styles.stampDecor}>🌸</Text>
      </View>

      {/* Envelope picker */}
      <View style={styles.envRow}>
        {(['tan', 'lavender', 'pink'] as const).map(style => (
          <TouchableOpacity
            key={style}
            style={[
              styles.envOption,
              { backgroundColor: envelopeColors[style] },
              envelope === style && styles.envSelected,
            ]}
            onPress={() => setEnvelope(style)}
          >
            <Text style={styles.envLabel}>{style}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Username search */}
      <Text style={styles.toLabel}>Recipient username</Text>
      <TextInput
        style={styles.toInput}
        value={to}
        onChangeText={searchUsers}
        autoCapitalize="none"
        placeholder="search username..."
        placeholderTextColor={Colors.mutedInk}
      />
      {suggestions.map(u => (
        <TouchableOpacity key={u.id} style={styles.suggestion} onPress={() => { setTo(u.username); setSuggestions([]); }}>
          <Text style={styles.suggestionText}>@{u.username}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={[styles.mailBtn, loading && styles.disabled]} onPress={send} disabled={loading}>
        {loading ? <ActivityIndicator color={Colors.darkInk} /> : <Text style={styles.mailBtnText}>Mail ✉</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.cream },
  topBar:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12 },
  title:          { fontFamily: Fonts.pixel, fontWeight: 'bold', fontSize: 18, color: Colors.darkInk },
  backText:       { fontFamily: Fonts.pixel, fontSize: 13, color: Colors.mutedInk },
  paper:          { flex: 1, margin: 16, borderWidth: 2, borderColor: Colors.darkInk, borderRadius: 4, backgroundColor: Colors.cream, padding: 16 },
  letterInput:    { flex: 1, fontFamily: Fonts.pixel, fontSize: 14, color: Colors.darkInk, lineHeight: 24, minHeight: 400 },
  charCount:      { alignSelf: 'flex-end', fontFamily: Fonts.pixel, fontSize: 11, color: Colors.mutedInk },
  doneBtn:        { backgroundColor: Colors.pink, borderRadius: 24, marginHorizontal: 100, marginBottom: 32, paddingVertical: 12, alignItems: 'center', borderWidth: 2, borderColor: Colors.darkInk },
  doneBtnText:    { fontFamily: Fonts.pixel, fontWeight: 'bold', fontSize: 15, color: Colors.darkInk },
  disabled:       { opacity: 0.5 },
  addressContent: { padding: 20, paddingBottom: 60 },
  envelopePreview:{ borderRadius: 14, borderWidth: 2, borderColor: Colors.darkInk, padding: 20, marginBottom: 16, minHeight: 120, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-end' },
  addrBlock:      { flex: 1 },
  addrLabel:      { fontFamily: Fonts.pixel, fontSize: 14, color: Colors.darkInk, fontWeight: 'bold' },
  stampDecor:     { fontSize: 28 },
  envRow:         { flexDirection: 'row', gap: 10, marginBottom: 20 },
  envOption:      { flex: 1, borderRadius: 10, borderWidth: 2, borderColor: Colors.darkInk, padding: 10, alignItems: 'center' },
  envSelected:    { borderWidth: 3, borderColor: Colors.darkInk },
  envLabel:       { fontFamily: Fonts.pixel, fontSize: 11, color: Colors.darkInk },
  toLabel:        { fontFamily: Fonts.pixel, fontSize: 13, color: Colors.darkInk, marginBottom: 6 },
  toInput:        { borderWidth: 1.5, borderColor: Colors.darkInk, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontFamily: Fonts.pixel, fontSize: 14, color: Colors.darkInk, marginBottom: 4 },
  suggestion:     { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.darkInk, borderRadius: 8, padding: 10, marginBottom: 4 },
  suggestionText: { fontFamily: Fonts.pixel, fontSize: 14, color: Colors.darkInk },
  mailBtn:        { backgroundColor: Colors.pink, borderRadius: 24, marginTop: 20, paddingVertical: 14, alignItems: 'center', borderWidth: 2, borderColor: Colors.darkInk },
  mailBtnText:    { fontFamily: Fonts.pixel, fontWeight: 'bold', fontSize: 15, color: Colors.darkInk },
});
