import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { get, post } from '../../lib/api';
import { Colors, envelopeColors } from '../../lib/theme';

export default function TrashScreen() {
  const [letters, setLetters]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await get('trash');
      setLetters(data);
    } catch (e: any) {
      console.log('TRASH ERROR:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const restore = async (id: number) => {
    await post('letters/restore', {}, { id }).catch(() => {});
    setLetters(prev => prev.filter(l => l.id !== id));
    setSelected(null);
  };

  const deletePermanently = async (id: number) => {
    Alert.alert('Delete forever?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await post('letters/delete', {}, { id }).catch(() => {});
          setLetters(prev => prev.filter(l => l.id !== id));
          setSelected(null);
        }
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Trash</Text>
        <Text style={{ fontSize: 28 }}>🗑</Text>
      </View>
      <Text style={styles.subtitle}>Thrown away letters</Text>

      <FlatList
        data={letters}
        keyExtractor={item => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>✨</Text>
              <Text style={styles.emptyText}>Trash is empty.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { borderLeftColor: envelopeColors[item.envelope_style] ?? Colors.parchment }]}
            onPress={() => setSelected(item)}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.fromText}>✉ from {item.from}</Text>
              <Text style={styles.dateText}>{new Date(item.trashed_at).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.previewText} numberOfLines={2}>{item.body}</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={() => restore(item.id)} style={styles.restoreBtn}>
                <Text style={styles.restoreText}>↩ restore</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deletePermanently(item.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteText}>✕ delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Letter Preview Modal */}
      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={[styles.modalContainer, { backgroundColor: selected ? (envelopeColors[selected.envelope_style] ?? Colors.parchment) : Colors.cream }]}>
          <View style={styles.modalTopBar}>
            <TouchableOpacity onPress={() => setSelected(null)} style={styles.closeBtn}>
              <Text style={styles.redX}>✕</Text>
            </TouchableOpacity>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => restore(selected?.id)} style={styles.restoreBtn}>
                <Text style={styles.restoreText}>↩ restore</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deletePermanently(selected?.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteText}>✕ delete</Text>
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView style={styles.paperScroll} contentContainerStyle={styles.paperContent}>
            <View style={styles.paper}>
              <Text style={styles.bodyText}>{selected?.body}</Text>
              <Text style={styles.fromLine}>— {selected?.from}</Text>
              <Text style={styles.trashedAtText}>trashed on {selected ? new Date(selected.trashed_at).toLocaleDateString() : ''}</Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.cream },
  topBar:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 4 },
  title:         { fontFamily: 'monospace', fontWeight: 'bold', fontSize: 22, color: Colors.darkInk },
  subtitle:      { fontFamily: 'monospace', fontSize: 12, color: Colors.mutedInk, paddingHorizontal: 20, marginBottom: 8 },
  listContent:   { padding: 16, paddingBottom: 40, flexGrow: 1 },
  emptyBox:      { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon:     { fontSize: 48, marginBottom: 12 },
  emptyText:     { fontFamily: 'monospace', fontSize: 13, color: Colors.mutedInk },
  card:          { backgroundColor: Colors.white, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.darkInk, borderLeftWidth: 6, padding: 14, marginBottom: 12 },
  cardHeader:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  fromText:      { fontFamily: 'monospace', fontWeight: 'bold', fontSize: 13, color: Colors.darkInk },
  dateText:      { fontFamily: 'monospace', fontSize: 11, color: Colors.mutedInk },
  previewText:   { fontFamily: 'monospace', fontSize: 12, color: Colors.mutedInk, lineHeight: 18, marginBottom: 8 },
  actionRow:     { flexDirection: 'row', gap: 10 },
  restoreBtn:    { backgroundColor: Colors.keepGreen, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: Colors.darkInk },
  restoreText:   { fontFamily: 'monospace', fontSize: 11, color: Colors.darkInk },
  deleteBtn:     { backgroundColor: Colors.throwRed, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: Colors.darkInk },
  deleteText:    { fontFamily: 'monospace', fontSize: 11, color: Colors.darkInk },
  // Modal
  modalContainer:{ flex: 1 },
  modalTopBar:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12 },
  closeBtn:      { padding: 4 },
  redX:          { fontSize: 22, color: Colors.redX, fontWeight: 'bold' },
  modalActions:  { flexDirection: 'row', gap: 10 },
  paperScroll:   { flex: 1, marginHorizontal: 20, marginBottom: 8 },
  paperContent:  { paddingBottom: 16 },
  paper:         { backgroundColor: Colors.cream, borderWidth: 2, borderColor: Colors.darkInk, borderRadius: 4, padding: 20, minHeight: 400 },
  bodyText:      { fontFamily: 'monospace', fontSize: 13, color: Colors.darkInk, lineHeight: 22, marginTop: 8 },
  fromLine:      { fontFamily: 'monospace', fontSize: 13, color: Colors.darkInk, marginTop: 24, fontWeight: 'bold' },
  trashedAtText: { fontFamily: 'monospace', fontSize: 11, color: Colors.mutedInk, marginTop: 8 },
});