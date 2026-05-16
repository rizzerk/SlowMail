import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert, FlatList, RefreshControl,
  StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import PinkTrash from '../../assets/svg/pinktrash.svg';
import { post } from '../../lib/api';
import { Colors, envelopeColors } from '../../lib/theme';
import { clearTrash, getTrash, removeFromTrash } from '../../lib/trash';

export default function TrashScreen() {
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getTrash();
    setLetters(data);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleRestore = async (id: number) => {
    try {
      await post('letters/keep', {}, { id });
      await removeFromTrash(id);
      setLetters(prev => prev.filter(l => l.id !== id));
      Alert.alert('✅ Restored', 'Letter moved back to your desk.');
    } catch {
      Alert.alert('Error', 'Could not restore letter. It may have been permanently deleted from the server.');
      await removeFromTrash(id);
      setLetters(prev => prev.filter(l => l.id !== id));
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert('Delete permanently?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await removeFromTrash(id);
          setLetters(prev => prev.filter(l => l.id !== id));
        }
      },
    ]);
  };

  const handleEmptyTrash = () => {
    Alert.alert('Empty trash?', 'All letters will be permanently deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Empty', style: 'destructive', onPress: async () => {
          await clearTrash();
          setLetters([]);
        }
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Trash</Text>
        {letters.length > 0 && (
          <TouchableOpacity onPress={handleEmptyTrash}>
            <Text style={styles.emptyBtn}>Empty</Text>
          </TouchableOpacity>
        )}
      </View>

      {letters.length === 0 ? (
        <View style={styles.center}>
          <PinkTrash width={150} height={150} />
          <Text style={styles.emptyText}>Trash is empty</Text>
        </View>
      ) : (
        <FlatList
          data={letters}
          keyExtractor={item => String(item.id)}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={[styles.card, { borderLeftColor: envelopeColors[item.envelope_style] ?? Colors.parchment, borderLeftWidth: 6 }]}>
              <Text style={styles.fromText}>✉ from {item.from}</Text>
              <Text style={styles.previewText} numberOfLines={2}>{item.body}</Text>
              <Text style={styles.dateText}>Trashed {new Date(item.trashed_at).toLocaleDateString()}</Text>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => handleRestore(item.id)} style={styles.restoreBtn}>
                  <Text style={styles.restoreBtnText}>↩ Restore</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>✕ Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.skyBlue },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 4 },
  title: { fontFamily: 'PressStart', fontWeight: 'bold', fontSize: 22, color: Colors.darkInk },
  emptyBtn: { fontFamily: 'PressStart', fontSize: 10, color: Colors.throwRed, textDecorationLine: 'underline' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  trashEmoji: { fontSize: 100, marginBottom: 16 },
  emptyText: { fontFamily: 'PressStart', fontSize: 12, color: Colors.mutedInk, textAlign: 'center', marginTop: 16 },
  card: { backgroundColor: Colors.white, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.darkInk, padding: 14, marginBottom: 12 },
  fromText: { fontFamily: 'PressStart', fontWeight: 'bold', fontSize: 12, color: Colors.darkInk, marginBottom: 4 },
  previewText: { fontFamily: 'PressStart', fontSize: 11, color: Colors.mutedInk, lineHeight: 18 },
  dateText: { fontFamily: 'PressStart', fontSize: 9, color: Colors.mutedInk, marginTop: 6 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 10 },
  restoreBtn: { backgroundColor: Colors.keepGreen, borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1.5, borderColor: Colors.darkInk },
  restoreBtnText: { fontFamily: 'PressStart', fontSize: 9, color: Colors.darkInk },
  deleteBtn: { backgroundColor: Colors.throwRed, borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1.5, borderColor: Colors.darkInk },
  deleteBtnText: { fontFamily: 'PressStart', fontSize: 9, color: Colors.darkInk },
});
