import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList, Image, Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { get, post } from '../../lib/api';
import { Colors, Fonts, envelopeColors } from '../../lib/theme';

export default function DeskScreen() {
  const [letters, setLetters]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(false);
  const [selected, setSelected] = useState<any>(null); // for modal preview
  const [opened, setOpened] = useState(false);


  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await get('desk');
      setLetters(data);
    } catch (e: any) {
      console.log('DESK ERROR:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const throwLetter = async (id: number) => {
    Alert.alert('Move to Trash?', 'This letter will go to the trash.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Trash', style: 'destructive', onPress: async () => {
          await post('letters/throw', {}, { id }).catch(() => {});
          setLetters(prev => prev.filter(l => l.id !== id));
          setSelected(null);
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
        {letters.length === 0 ? 'No kept letters yet.' : `${letters.length} letter${letters.length !== 1 ? 's' : ''} kept`}
      </Text>

      <FlatList
        data={letters}
        keyExtractor={item => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyBox}>
            <Image source={require('../../assets/images/empty.png')} style={{ width: 60, height: 60}} />
            <Text style={styles.emptyText}>Letters you keep will appear here.</Text>
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
              <Text style={styles.dateText}>{new Date(item.delivered_at).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.previewText} numberOfLines={2}>{item.body}</Text>
            <TouchableOpacity onPress={() => throwLetter(item.id)} style={styles.trashBtn}>
              <Text style={styles.trashIcon}>🗑</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

<TouchableOpacity onPress={() => setOpened(false)} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>← Back</Text>
          </TouchableOpacity>

      {/* Letter Preview Modal */}
      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={[styles.modalContainer, { backgroundColor: selected ? (envelopeColors[selected.envelope_style] ?? Colors.parchment) : Colors.cream }]}>
          <View style={styles.modalTopBar}>
            <TouchableOpacity onPress={() => setSelected(null)} style={styles.closeBtn}>
              <Text style={styles.redX}>✕</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => throwLetter(selected?.id)} style={styles.trashBtnModal}>
              <Text style={styles.trashIcon}>🗑</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.paperScroll} contentContainerStyle={styles.paperContent}>
            <View style={styles.paper}>
              <Text style={styles.heartIcon}>🩷</Text>
              <Text style={styles.bodyText}>{selected?.body}</Text>
              <Text style={styles.fromLine}>— {selected?.from}</Text>
              <Text style={styles.keptAtText}>kept on {selected ? new Date(selected.kept_at).toLocaleDateString() : ''}</Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
      </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.skyBlue },
  listContent:   { padding: 16, paddingBottom: 40, flexGrow: 1 },
  emptyBox:      { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon:     { fontSize: 48, marginBottom: 12 },
  emptyText:     {  fontFamily: Fonts.pixel, fontSize: 13, color: Colors.darkInk, lineHeight: 20 , textAlign: 'center' },
  topBar:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 4 },
  title:      { fontFamily: Fonts.pixel, fontWeight: 'bold', fontSize: 22, color: Colors.darkInk },
  deskImgContainer: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  deskImg:    { width: 300, height: 300 },
  subtitle:   { fontFamily: Fonts.pixel, fontSize: 12, color: Colors.mutedInk, paddingHorizontal: 20, marginBottom: 8, textAlign: 'center' },
  card:       { backgroundColor: Colors.white, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.darkInk, padding: 14, marginBottom: 12, position: 'relative' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  fromText:   { fontFamily: Fonts.pixel, fontWeight: 'bold', fontSize: 13, color: Colors.darkInk },
  dateText:   { fontFamily: Fonts.pixel, fontSize: 11, color: Colors.mutedInk },
  bodyText:   { fontFamily: Fonts.pixel, fontSize: 13, color: Colors.darkInk, lineHeight: 20 },
  previewText:{ fontFamily: Fonts.pixel, fontSize: 12, color: Colors.mutedInk, lineHeight: 18 },
  trashBtn:   { position: 'absolute', bottom: 10, right: 12 },
  trashIcon:  { fontSize: 18 },
  closeBtn:   { alignItems: 'center', paddingVertical: 14 },
  closeBtnText: { fontFamily: Fonts.pixel, fontSize: 12, color: Colors.darkInk, textDecorationLine: 'underline' },
  // Modal
  modalContainer:{ flex: 1 },
  modalTopBar:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12 },
  redX:          { fontSize: 22, color: Colors.redX, fontWeight: 'bold' },
  trashBtnModal: { padding: 4 },
  paperScroll:   { flex: 1, marginHorizontal: 20, marginBottom: 8 },
  paperContent:  { paddingBottom: 16 },
  paper:         { backgroundColor: Colors.cream, borderWidth: 2, borderColor: Colors.darkInk, borderRadius: 4, padding: 20, minHeight: 400 },
  heartIcon:     { position: 'absolute', top: 14, right: 14, fontSize: 22 },
  fromLine:      { fontFamily: Fonts.pixel, fontSize: 13, color: Colors.darkInk, marginTop: 24, fontWeight: 'bold' },
  keptAtText:    { fontFamily: Fonts.pixel, fontSize: 11, color: Colors.mutedInk, marginTop: 8 },
});