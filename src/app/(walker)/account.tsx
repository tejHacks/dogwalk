import { useState } from 'react';

import { AccountScreen } from '@/components/account';
import { Badge, Button, Card, Field, Row, SectionTitle, Small } from '@/components/ui';
import { useSession, useWalkerProfiles } from '@/data/store';
import { naira } from '@/data/walkers';

export default function WalkerAccount() {
  const [user] = useSession();
  const [profiles, setProfiles] = useWalkerProfiles();
  const me = profiles.find((p) => p.userId === user?.id);
  const [price, setPrice] = useState(String(me?.pricePer30 ?? ''));
  const [bio, setBio] = useState(me?.bio ?? '');
  if (!me) return <AccountScreen />;
  const rate = Number(price.replace(/\D/g, ''));
  const update = (patch: Partial<typeof me>) => setProfiles((l) => l.map((p) => (p.userId === me.userId ? { ...p, ...patch } : p)));

  return (
    <AccountScreen>
      <SectionTitle>Walker profile</SectionTitle>
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Small>{me.area}</Small>
          {me.idStatus === 'verified' ? <Badge tone="ok" icon="shield-checkmark">Verified</Badge> : me.idStatus === 'pending' ? <Badge tone="warn">ID pending</Badge> : <Badge>Not verified</Badge>}
        </Row>
        <Field label="Price per 30 minutes (₦)" value={price} onChangeText={setPrice} keyboardType="number-pad" hint={rate >= 500 ? `${naira(rate)} for 30 min · ${naira(rate * 2)} for 60 min` : 'At least ₦500.'} />
        <Field label="About you" value={bio} onChangeText={setBio} multiline />
        <Button title="Save profile" variant="secondary" disabled={rate < 500 || bio.trim().length < 20 || (rate === me.pricePer30 && bio === me.bio)} onPress={() => update({ pricePer30: rate, bio: bio.trim() })} />
        {me.idStatus === 'not-submitted' ? <Button title="Start ID check" icon="id-card-outline" variant="ghost" onPress={() => update({ idStatus: 'pending' })} /> : null}
      </Card>
    </AccountScreen>
  );
}
