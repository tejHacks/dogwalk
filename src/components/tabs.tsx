import Ionicons from '@expo/vector-icons/Ionicons';
import type { ColorValue } from 'react-native';

import type { Palette } from '@/theme';

export const tabIcon = (name: keyof typeof Ionicons.glyphMap) =>
  function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Ionicons name={(focused ? name : `${name}-outline`) as keyof typeof Ionicons.glyphMap} size={24} color={color as string} />;
  };

export const tabOptions = (c: Palette) => ({
  headerShadowVisible: false,
  headerStyle: { backgroundColor: c.bg },
  headerTitleStyle: { fontWeight: '800' as const, fontSize: 20 },
  headerTintColor: c.text,
  tabBarActiveTintColor: c.primary,
  tabBarInactiveTintColor: c.subtle,
  tabBarStyle: { backgroundColor: c.card, borderTopColor: c.border },
  tabBarLabelStyle: { fontWeight: '600' as const, fontSize: 11 },
});
