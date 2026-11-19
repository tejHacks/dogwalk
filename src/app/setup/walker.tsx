import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AuthHeader } from '@/components/auth';
import { Badge, Body, Button, Card, Field, Label, Pill, Row, Screen, Small } from '@/components/ui';
import { auth } from '@/data/auth';
import { useAuthActions, useSession, useWalkerProfiles } from '@/data/store';
import type { DogSize } from '@/data/types';
import { naira, sizeLabel } from '@/data/walkers';

export default function WalkerSetup() {
  const [user] = useSession();
  const [, setProfiles] = useWalkerProfiles();
  const { signedIn } = useAuthActions();
  const [area, setArea] = useState('');
  const [bio, setBio] = useState('');
  const [price, setPrice] = useState('2500');
  const [years, setYears] = useState('');
  const [sizes, setSizes] = useState<DogSize[]>(['small', 'medium']);
  const [idSubmitted, setIdSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!user) return null;

  const rate = Number(price.replace(/\D/g, ''));
  const valid = area.trim().length > 1 && bio.trim().length >= 20 && rate >= 500 && sizes.length > 0;
  const toggle = (s: DogSize) => setSizes((l) => (l.includes(s) ? l.filter((x) => x !== s) : [...l, s]));

  const save = async () => {
    setBusy(true);
    setProfiles((list) => [
      ...list.filter((p) => p.userId !== user.id),
      { userId: user.id, name: user.name, area: area.trim(), bio: bio.trim(), pricePer30: rate, sizes, yearsExperience: Number(years) || 0, idStatus: idSubmitted ? 'pending' : 'not-submitted', available: true, rating: 0, walks: 0 },
    ]);
    signedIn(await auth.markProfileComplete(user.id));
    router.replace('/');
  };

  return (
    <Screen>
      <AuthHeader icon="walk-outline" title="Your walker profile" subtitle="This is what dog owners see when they choose a walker." />
      <Field label="Area you walk in" value={area} onChangeText={setArea} placeholder="e.g. Bodija, Ibadan" />
      <Field label="About you" value={bio} onChangeText={setBio} placeholder="Your experience with dogs, what you’re great at, when you’re free…" multiline hint={`${bio.trim().length}/20 characters minimum`} />
      <Field label="Price per 30-minute walk (₦)" value={price} onChangeText={setPrice} keyboardType="number-pad" hint={rate >= 500 ? `Owners pay ${naira(rate)} for 30 min, ${naira(rate * 2)} for 60 min.` : 'At least ₦500.'} />
      <Field label="Years of experience with dogs" value={years} onChangeText={setYears} placeholder="e.g. 2" keyboardType="number-pad" />
      <View style={{ gap: 6 }}>
        <Label>Dog sizes you can handle</Label>
        <Row style={{ flexWrap: 'wrap' }}>
          {(Object.keys(sizeLabel) as DogSize[]).map((s) => (
            <Pill key={s} active={sizes.includes(s)} onPress={() => toggle(s)}>
              {sizeLabel[s]}
            </Pill>
          ))}
        </Row>
      </View>
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Label>ID verification</Label>
          {idSubmitted ? <Badge tone="warn" icon="time-outline">Pending review</Badge> : <Badge>Recommended</Badge>}
        </Row>
        <Body muted>Verified walkers get a badge and more bookings. You&apos;ll upload a government ID (NIN slip, driver&apos;s licence or passport) and a selfie for the DogWalk team to review.</Body>
        {idSubmitted ? (
          <Small>Thanks. We&apos;ll let you know once it&apos;s reviewed.</Small>
        ) : (
          <Button title="Start ID check" icon="id-card-outline" variant="secondary" onPress={() => setIdSubmitted(true)} />
        )}
      </Card>
      <Button big title="Finish and go online" icon="checkmark" loading={busy} disabled={!valid} onPress={save} />
    </Screen>
  );
}
