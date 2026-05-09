import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList, RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import api, { clearAuth, get, getUser } from '../../lib/api';
import { Colors, envelopeColors } from '../../lib/theme';

type Letter = {
  id: number;
  from: string;
  body: string;
  envelope_style: string;
  delivered_at: string;
  kept: boolean;
};

export default function MailboxScreen() {
  const [letters, setLetters]     = useState<Letter[]>([]);
  const [loading, setLoading]     = useState(false);
  const [user, setUser]           = useState<any>(null);
  const [opened, setOpened]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await get('mailbox');
      console.log('MAILBOX DATA:', JSON.stringify(data));
      setLetters(data);
    } catch (e: any) {
      console.log('MAILBOX ERROR:', e.message, JSON.stringify(e.response?.data));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      getUser().then(setUser);
      load();
  
      // optional cleanup
      return () => {};
    }, [])
  );

  const logout = async () => {
    await api.post('/auth/logout').catch(() => {});
    await clearAuth();
    router.replace('/(auth)/login');
  };

  const openMailbox = () => {
    setOpened(true);
    load();
  };

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => Alert.alert('Settings', 'Coming soon')} style={styles.iconBtn}>
          <Text style={styles.icon}>⚙️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(app)/profile')} style={[styles.iconBtn, styles.profileBtn]}>
          <Text style={styles.profileText}>{user?.username?.[0]?.toUpperCase() ?? '?'}</Text>
        </TouchableOpacity>
      </View>

      {!opened ? (
        /* Mailbox closed — tap to collect */
        <View style={styles.center}>
          <Text style={styles.pixelMailbox}>📬</Text>
          <Text style={styles.tapHint}>tap to check your mail</Text>
          <TouchableOpacity style={styles.collectBtn} onPress={openMailbox}>
            <Text style={styles.collectText}>Open Mailbox</Text>
          </TouchableOpacity>
          {letters.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{letters.length}</Text>
            </View>
          )}
        </View>
      ) : (
        /* Letters list */
        <View style={styles.listWrapper}>
          <Text style={styles.sectionTitle}>
            {letters.length === 0 ? 'No mail today.' : `${letters.length} letter${letters.length > 1 ? 's' : ''} arrived`}
          </Text>
          <FlatList
            data={letters}
            keyExtractor={(item) => String(item.id)}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.envelope, { backgroundColor: envelopeColors[item.envelope_style] ?? Colors.parchment }]}
                onPress={() => router.push(`/(app)/letter/${item.id}`)}
                >
                <View style={styles.envelopeInner}>
                  <Text style={styles.fromText}>from: {item.from}</Text>
                  <Text style={styles.previewText} numberOfLines={1}>
                    {item.body.substring(0, 60)}…
                  </Text>
                  {item.kept && <Text style={styles.keptBadge}>kept</Text>}
                </View>
                <Text style={styles.stamp}>🌸</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
          <TouchableOpacity onPress={() => setOpened(false)} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Close Mailbox</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.skyBlue },
  topBar:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12 },
  iconBtn:      { padding: 6 },
  icon:         { fontSize: 26 },
  profileBtn:   { backgroundColor: Colors.yellow, borderRadius: 8, borderWidth: 2, borderColor: Colors.darkInk, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  profileText:  { fontFamily: 'monospace', fontWeight: 'bold', fontSize: 18, color: Colors.darkInk },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pixelMailbox: { fontSize: 100, marginBottom: 12 },
  tapHint:      { fontFamily: 'monospace', fontSize: 13, color: Colors.white, marginBottom: 20, opacity: 0.85 },
  collectBtn:   { backgroundColor: Colors.cream, borderRadius: 24, paddingVertical: 12, paddingHorizontal: 28, borderWidth: 2, borderColor: Colors.darkInk },
  collectText:  { fontFamily: 'monospace', fontWeight: 'bold', fontSize: 14, color: Colors.darkInk },
  badge:        { position: 'absolute', top: -10, right: -10, backgroundColor: Colors.redX, borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  badgeText:    { color: Colors.white, fontSize: 12, fontWeight: 'bold' },
  listWrapper:  { flex: 1, backgroundColor: Colors.cream, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, marginTop: 8 },
  sectionTitle: { fontFamily: 'monospace', fontWeight: 'bold', fontSize: 15, color: Colors.darkInk, marginBottom: 14 },
  envelope:     { borderRadius: 12, borderWidth: 2, borderColor: Colors.darkInk, padding: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  envelopeInner:{ flex: 1 },
  fromText:     { fontFamily: 'monospace', fontSize: 12, color: Colors.mutedInk, marginBottom: 2 },
  previewText:  { fontFamily: 'monospace', fontSize: 13, color: Colors.darkInk },
  keptBadge:    { marginTop: 4, alignSelf: 'flex-start', backgroundColor: Colors.keepGreen, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  stamp:        { fontSize: 24, marginLeft: 8 },
  closeBtn:     { alignItems: 'center', paddingVertical: 10 },
  closeBtnText: { fontFamily: 'monospace', fontSize: 12, color: Colors.mutedInk, textDecorationLine: 'underline' },
});
