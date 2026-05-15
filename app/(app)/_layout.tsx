import { Tabs } from 'expo-router';
import { Image } from 'react-native';
import { Colors } from '../../lib/theme';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: Colors.cream,
          borderTopWidth: 2,
          borderTopColor: Colors.darkInk,
          height: 70,
        },
        tabBarActiveTintColor: Colors.darkInk,
        tabBarInactiveTintColor: Colors.mutedInk,
      }}
    >
      <Tabs.Screen
        name="mailbox"
        options={{
          tabBarIcon: ({ focused }) => (
            <Image source={focused ? require('../../assets/images/notempty.png') : require('../../assets/images/empty.png')} style={{ width: 40, height: 40, opacity: focused ? 1 : 0.4 }} />
          ),
        }}
      />
      <Tabs.Screen
        name="desk"
        options={{
          tabBarIcon: ({ focused }) => (
            <Image source={require('../../assets/images/desk.png')} style={{ width: 60, height: 60, opacity: focused ? 1 : 0.4 }} />
          ),
        }}
      />
      <Tabs.Screen
        name="compose"
        options={{
          tabBarIcon: ({ focused }) => (
            <Image source={require('../../assets/images/quillandink.png')} style={{ width: 60, height: 60, opacity: focused ? 1 : 0.4 }} />
          ),
        }}
      />
      <Tabs.Screen
        name="outbox"
        options={{ href: null }}
      />
      {/* Hidden screens — not in tab bar */}
      <Tabs.Screen name="letter/[id]" options={{ href: null }} />
    </Tabs>
  );
}
