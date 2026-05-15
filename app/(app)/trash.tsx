import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../lib/theme';

export default function TrashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Trash</Text>
      </View>
      <View style={styles.center}>
        <Text style={styles.emoji}>🗑</Text>
        <Text style={styles.subtitle}>Nothing in the trash.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.skyBlue },
  topBar: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 4 },
  title: { fontFamily: 'PressStart', fontWeight: 'bold', fontSize: 22, color: Colors.darkInk },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 80, marginBottom: 16 },
  subtitle: { fontFamily: 'PressStart', fontSize: 12, color: Colors.mutedInk, textAlign: 'center' },
});
