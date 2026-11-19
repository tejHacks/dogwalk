import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Badge, Body, H1, Icon, Small, type IconName } from '@/components/ui';
import { auth, DEMO_CODE } from '@/data/auth';
import { usePalette } from '@/theme';

/** Big icon, title and subtitle at the top of every auth screen. */
export function AuthHeader({ icon, title, subtitle }: { icon: IconName; title: string; subtitle?: ReactNode }) {
  const c = usePalette();
  return (
    <View style={{ gap: 10, marginBottom: 6 }}>
      <View style={{ width: 60, height: 60, borderRadius: 18, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={30} color={c.primary} />
      </View>
      <H1 style={{ fontSize: 28 }}>{title}</H1>
      {subtitle ? <Body muted>{subtitle}</Body> : null}
    </View>
  );
}

/** Shown on code screens while there's no backend, so testers aren't stuck. */
export function DemoCodeNote() {
  if (auth.mode !== 'demo') return null;
  return (
    <View style={{ gap: 4 }}>
      <Badge tone="info" icon="flask-outline">Demo mode</Badge>
      <Small>Emails aren&apos;t sent until the DogWalk server is connected. Use code {DEMO_CODE}.</Small>
    </View>
  );
}
