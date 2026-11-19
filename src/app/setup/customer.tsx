import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AuthHeader } from '@/components/auth';
import { Button, Field, Label, Pill, Row, Screen } from '@/components/ui';
import { auth } from '@/data/auth';
import { uid, useAuthActions, useDogs, useSession } from '@/data/store';
import type { DogSize } from '@/data/types';
import { sizeLabel } from '@/data/walkers';

/** First dog for a new customer. More can be added from Account later. */
export default function CustomerSetup() {
  const [user] = useSession();
  const [, setDogs] = useDogs();
  const { signedIn } = useAuthActions();
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [size, setSize] = useState<DogSize>('medium');
  const [age, setAge] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  if (!user) return null;

  const save = async () => {
    setBusy(true);
    setDogs((d) => [...d, { id: uid(), ownerId: user.id, name: name.trim(), breed: breed.trim(), size, ageYears: Number(age) || 0, notes: notes.trim() }]);
    signedIn(await auth.markProfileComplete(user.id));
    router.replace('/');
  };

  return (
    <Screen>
      <AuthHeader icon="paw-outline" title={`Hi ${user.name.split(' ')[0]}, who's walking?`} subtitle="Tell walkers about your dog so they come prepared." />
      <Field label="Dog's name" value={name} onChangeText={setName} placeholder="e.g. Bingo" />
      <Field label="Breed" value={breed} onChangeText={setBreed} placeholder="e.g. Boerboel, Local, Mixed" />
      <View style={{ gap: 6 }}>
        <Label>Size</Label>
        <Row style={{ flexWrap: 'wrap' }}>
          {(Object.keys(sizeLabel) as DogSize[]).map((s) => (
            <Pill key={s} active={size === s} onPress={() => setSize(s)}>
              {sizeLabel[s]}
            </Pill>
          ))}
        </Row>
      </View>
      <Field label="Age in years" value={age} onChangeText={setAge} placeholder="e.g. 3" keyboardType="number-pad" />
      <Field label="Anything a walker should know?" value={notes} onChangeText={setNotes} placeholder="Pulls on the lead, scared of motorbikes, no treats…" multiline />
      <Button big title="Save and find walkers" icon="checkmark" loading={busy} disabled={!name.trim()} onPress={save} />
    </Screen>
  );
}
