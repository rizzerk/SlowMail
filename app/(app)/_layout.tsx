import { Tabs } from 'expo-router';
import { Colors } from '../../lib/theme';
import { Text } from 'react-native';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.cream,
          borderTopWidth: 2,
          borderTopColor: Colors.darkInk,
          height: 60,
        },
        tabBarLabelStyle: { fontFamily: 'monospace', fontSize: 11 },
        tabBarActiveTintColor: Colors.darkInk,
        tabBarInactiveTintColor: Colors.mutedInk,
      }}
    >
      <Tabs.Screen
        name="mailbox"
        options={{
          title: 'Mailbox',
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 22 }}>{focused ? '📬' : '📭'}</Text>,
        }}
      />
      <Tabs.Screen
        name="compose"
        options={{
          title: 'Write',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>✉️</Text>,
        }}
      />
      <Tabs.Screen
        name="desk"
        options={{
          title: 'Desk',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>📚</Text>,
        }}
      />
      <Tabs.Screen
        name="outbox"
        options={{
          title: 'Outbox',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>📤</Text>,
        }}
      />
      {/* Hidden screens — not in tab bar */}
      <Tabs.Screen name="letter/[id]" options={{ href: null }} />
    </Tabs>
  );
}
