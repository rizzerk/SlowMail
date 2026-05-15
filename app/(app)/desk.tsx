import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList, Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { get, post } from '../../lib/api';
import { Colors, envelopeColors } from '../../lib/theme';

export default function DeskScreen() {
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [opened, setOpened] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await get('desk');
      setLetters(data);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const throwFromDesk = async (id: number) => {
    Alert.alert('Remove from desk?', 'This will throw the letter away.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          await post('letters/throw', {}, { id }).catch(() => {});
          setLetters(prev => prev.filter(l => l.id !== id));
        }
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>My Desk</Text>
      </View>

      {!opened ? (
        <View style={styles.deskImgContainer}>
          <TouchableOpacity onPress={() => { setOpened(true); load(); }}>
            <Image source={require('../../assets/images/desk.png')} style={styles.deskImg} />
          </TouchableOpacity>
          <Text style={styles.subtitle}>
            {letters.length === 0 ? 'Your desk is empty.' : `${letters.length} kept letter${letters.length !== 1 ? 's' : ''} — tap to view`}
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.subtitle}>
            {letters.length} kept letter{letters.length !== 1 ? 's' : ''}
          </Text>
          <FlatList
            data={letters}
            keyExtractor={item => String(item.id)}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            renderItem={({ item }) => (
              <View style={[styles.card, { borderLeftColor: envelopeColors[item.envelope_style] ?? Colors.parchment, borderLeftWidth: 6 }]}>
                <TouchableOpacity onPress={() => setExpanded(expanded === item.id ? null : item.id)}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.fromText}>✉ from {item.from}</Text>
                    <Text style={styles.dateText}>{new Date(item.delivered_at).toLocaleDateString()}</Text>
                  </View>
                  {expanded === item.id ? (
                    <Text style={styles.bodyText}>{item.body}</Text>
                  ) : (
                    <Text style={styles.previewText} numberOfLines={2}>{item.body}</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => throwFromDesk(item.id)} style={styles.trashBtn}>
                  <Text style={styles.trashIcon}>🗑</Text>
                </TouchableOpacity>
              </View>
            )}
          />
          <TouchableOpacity onPress={() => setOpened(false)} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>← Back</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.skyBlue },
  topBar:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 4 },
  title:      { fontFamily: 'PressStart', fontWeight: 'bold', fontSize: 22, color: Colors.darkInk },
  deskImgContainer: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  deskImg:    { width: 300, height: 300 },
  subtitle:   { fontFamily: 'PressStart', fontSize: 12, color: Colors.mutedInk, paddingHorizontal: 20, marginBottom: 8, textAlign: 'center' },
  card:       { backgroundColor: Colors.white, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.darkInk, padding: 14, marginBottom: 12, position: 'relative' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  fromText:   { fontFamily: 'PressStart', fontWeight: 'bold', fontSize: 13, color: Colors.darkInk },
  dateText:   { fontFamily: 'PressStart', fontSize: 11, color: Colors.mutedInk },
  bodyText:   { fontFamily: 'PressStart', fontSize: 13, color: Colors.darkInk, lineHeight: 20 },
  previewText:{ fontFamily: 'PressStart', fontSize: 12, color: Colors.mutedInk, lineHeight: 18 },
  trashBtn:   { position: 'absolute', bottom: 10, right: 12 },
  trashIcon:  { fontSize: 18 },
  closeBtn:   { alignItems: 'center', paddingVertical: 14 },
  closeBtnText: { fontFamily: 'PressStart', fontSize: 12, color: Colors.darkInk, textDecorationLine: 'underline' },
});
