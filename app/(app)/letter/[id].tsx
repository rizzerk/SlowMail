import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { get, post } from '../../../lib/api';
import { addToTrash } from '../../../lib/trash';
import { Colors, envelopeColors } from '../../../lib/theme';

export default function LetterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [letter, setLetter] = useState<any>(null);
  const [kept, setKept]     = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get('mailbox').then(({ data }) => {
      const found = data.find((l: any) => String(l.id) === id);
      if (found) { setLetter(found); setKept(found.kept); }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleKeep = async () => {
    try {
      await post('letters/keep', {}, { id });
      setKept(true);
      Alert.alert('📚 Kept', 'This letter is saved to your desk.');
    } catch {
      Alert.alert('Error', 'Could not keep letter.');
    }
  };

  const handleTrash = async () => {
    Alert.alert('Move to trash?', 'You can restore it later or delete permanently.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Trash', style: 'destructive', onPress: async () => {
          await addToTrash(letter);
          await post('letters/throw', {}, { id }).catch(() => {});
          router.back();
        }
      },
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
  if (!letter) return (
    <View style={styles.center}>
      <Text style={styles.mono}>Letter not found.</Text>
      <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← back</Text></TouchableOpacity>
    </View>
  );

  const bgColor = envelopeColors[letter.envelope_style] ?? Colors.parchment;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.redX}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.paperScroll} contentContainerStyle={styles.paperContent}>
        <View style={styles.paper}>
          <Text style={styles.heartIcon}>🩷</Text>
          <Text style={styles.bodyText}>{letter.body}</Text>
          <Text style={styles.fromLine}>— {letter.from}</Text>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        {kept ? (
          <TouchableOpacity style={[styles.actionBtn, styles.trashBtn]} onPress={handleTrash}>
            <Text style={styles.actionBtnText}>🗑 Trash</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={[styles.actionBtn, styles.trashBtn]} onPress={handleTrash}>
              <Text style={styles.actionBtnText}>🗑 Trash</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.keepBtn]} onPress={handleKeep}>
              <Text style={styles.actionBtnText}>📚 Keep</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.cream },
  mono:        { fontFamily: 'PressStart', fontSize: 14, color: Colors.darkInk },
  back:        { fontFamily: 'PressStart', fontSize: 13, color: Colors.mutedInk, marginTop: 10, textDecorationLine: 'underline' },
  topBar:      { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12 },
  closeBtn:    { padding: 4 },
  redX:        { fontSize: 22, color: Colors.redX, fontWeight: 'bold' },
  paperScroll: { flex: 1, marginHorizontal: 20, marginBottom: 8 },
  paperContent:{ paddingBottom: 16 },
  paper:       { backgroundColor: Colors.cream, borderWidth: 2, borderColor: Colors.darkInk, borderRadius: 4, padding: 20, minHeight: 400 },
  heartIcon:   { position: 'absolute', top: 14, right: 14, fontSize: 22 },
  bodyText:    { fontFamily: 'PressStart', fontSize: 13, color: Colors.darkInk, lineHeight: 22, marginTop: 8 },
  fromLine:    { fontFamily: 'PressStart', fontSize: 13, color: Colors.darkInk, marginTop: 24, fontWeight: 'bold' },
  actions:     { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingVertical: 20, paddingHorizontal: 40 },
  actionBtn:   { flex: 1, paddingVertical: 12, borderRadius: 24, alignItems: 'center', borderWidth: 2, borderColor: Colors.darkInk },
  trashBtn:    { backgroundColor: Colors.throwRed },
  keepBtn:     { backgroundColor: Colors.keepGreen },
  actionBtnText:{ fontFamily: 'PressStart', fontWeight: 'bold', fontSize: 12, color: Colors.darkInk },
});
