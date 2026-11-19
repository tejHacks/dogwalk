import { Redirect, Tabs } from 'expo-router';

import { tabIcon, tabOptions } from '@/components/tabs';
import { useBookings, useSession } from '@/data/store';
import { usePalette } from '@/theme';

export default function WalkerTabs() {
  const c = usePalette();
  const [user, , ready] = useSession();
  const [bookings] = useBookings();
  if (!ready) return null;
  if (!user || user.role !== 'walker') return <Redirect href="/" />;
  const requests = bookings.filter((b) => b.walkerId === user.id && b.status === 'requested').length;
  return (
    <Tabs screenOptions={tabOptions(c)}>
      <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: tabIcon('today'), tabBarBadge: requests || undefined, tabBarBadgeStyle: { backgroundColor: c.danger } }} />
      <Tabs.Screen name="jobs" options={{ title: 'All walks', tabBarLabel: 'Walks', tabBarIcon: tabIcon('list') }} />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: tabIcon('person-circle') }} />
    </Tabs>
  );
}
