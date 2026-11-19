import { Redirect, Tabs } from 'expo-router';

import { tabIcon, tabOptions } from '@/components/tabs';
import { useBookings, useSession } from '@/data/store';
import { usePalette } from '@/theme';

export default function CustomerTabs() {
  const c = usePalette();
  const [user, , ready] = useSession();
  const [bookings] = useBookings();
  if (!ready) return null;
  if (!user || user.role !== 'customer') return <Redirect href="/" />;
  const live = bookings.filter((b) => b.customerId === user.id && b.status === 'in-progress').length;
  return (
    <Tabs screenOptions={tabOptions(c)}>
      <Tabs.Screen name="index" options={{ title: 'Find a walker', tabBarLabel: 'Walkers', tabBarIcon: tabIcon('paw') }} />
      <Tabs.Screen name="walks" options={{ title: 'My walks', tabBarLabel: 'Walks', tabBarIcon: tabIcon('calendar'), tabBarBadge: live || undefined }} />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: tabIcon('person-circle') }} />
    </Tabs>
  );
}
