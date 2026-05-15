import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import api from '../../lib/api';
import { Colors, envelopeColors } from '../../lib/theme';

const statusLabel: Record<string, { text: string; color: string }> = {
  pending:    { text: '⏳ sending...', color: '#aaa' },
  in_transit: { text: '🚚 in transit',  color: Colors.yellow },
  delivered:  { text: '✅ delivered',   color: Colors.keepGreen },
};

export default function OutboxScreen() {
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/outbox');
      setLetters(data);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Outbox</Text>
        <Text style={{ fontSize: 28 }}>📤</Text>
      </View>
      <Text style={styles.subtitle}>Letters you've sent</Text>
      <FlatList
        data={letters}
        keyExtractor={item => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>You haven't sent any letters yet.</Text> : null
        }
        renderItem={({ item }) => {
          const s = statusLabel[item.status] ?? statusLabel.pending;
          return (
            <View style={[styles.card, { borderLeftColor: envelopeColors[item.envelope_style] ?? Colors.parchment, borderLeftWidth: 6 }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.toText}>✉ to {item.to}</Text>
                <Text style={[styles.statusText, { color: s.color }]}>{s.text}</Text>
              </View>
              <Text style={styles.previewText} numberOfLines={2}>{item.body_preview}</Text>
              <Text style={styles.dateText}>{new Date(item.sent_at).toLocaleDateString()}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.cream },
  topBar:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 4 },
  title:      { fontFamily: 'PressStart', fontWeight: 'bold', fontSize: 22, color: Colors.darkInk },
  subtitle:   { fontFamily: 'PressStart', fontSize: 12, color: Colors.mutedInk, paddingHorizontal: 20, marginBottom: 8 },
  empty:      { fontFamily: 'PressStart', fontSize: 13, color: Colors.mutedInk, textAlign: 'center', marginTop: 40 },
  card:       { backgroundColor: Colors.white, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.darkInk, padding: 14, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  toText:     { fontFamily: 'PressStart', fontWeight: 'bold', fontSize: 13, color: Colors.darkInk },
  statusText: { fontFamily: 'PressStart', fontSize: 12 },
  previewText:{ fontFamily: 'PressStart', fontSize: 12, color: Colors.mutedInk, lineHeight: 18 },
  dateText:   { fontFamily: 'PressStart', fontSize: 11, color: Colors.mutedInk, marginTop: 6 },
});
