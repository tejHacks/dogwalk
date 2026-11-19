import { router } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { Body, Button, H1, Icon, Screen, type IconName } from '@/components/ui';
import { useOnboarded } from '@/data/store';
import { radius, space, usePalette } from '@/theme';

const slides: { icon: IconName; accent: IconName; title: string; body: string }[] = [
  { icon: 'paw', accent: 'heart', title: 'Walks your dog will love', body: 'Book a trusted, local walker in a few taps, for 30 or 60 minutes, whenever you need one.' },
  { icon: 'shield-checkmark', accent: 'star', title: 'Walkers you can trust', body: 'Every walker shares their experience, the dog sizes they handle and reviews from owners. Verified walkers have passed an ID check.' },
  { icon: 'navigate', accent: 'time', title: 'Follow every walk', body: 'See when the walk starts and ends, how long it lasted, and your walker’s notes afterwards.' },
  { icon: 'cash', accent: 'walk', title: 'Love dogs? Earn walking them', body: 'Sign up as a walker, set your own price and area, and accept the walks that suit you.' },
];

export default function Onboarding() {
  const c = usePalette();
  const { width } = useWindowDimensions();
  const [, setOnboarded] = useOnboarded();
  const [page, setPage] = useState(0);
  const scroller = useRef<ComponentRef<typeof ScrollView>>(null);
  const go = (i: number) => {
    scroller.current?.scrollTo({ x: i * width, animated: true });
    setPage(i);
  };

  const done = () => {
    setOnboarded(true);
    router.replace('/welcome');
  };
  const last = page === slides.length - 1;

  return (
    <Screen scroll={false} edges={['top', 'bottom']} style={{ paddingHorizontal: 0 }}>
      <View style={{ alignItems: 'flex-end', paddingHorizontal: space.md }}>
        <Pressable accessibilityRole="button" onPress={done} hitSlop={10}>
          <Text style={{ color: c.muted, fontWeight: '700', fontSize: 15 }}>Skip</Text>
        </Pressable>
      </View>
      <ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}>
        {slides.map((item) => (
          <View key={item.title} style={{ width, paddingHorizontal: space.lg, justifyContent: 'center', gap: space.lg }}>
            <View style={{ alignSelf: 'center', width: 220, height: 220, borderRadius: 110, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 132, height: 132, borderRadius: 40, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-6deg' }] }}>
                <Icon name={item.icon} size={64} color={c.primaryText} />
              </View>
              <View style={{ position: 'absolute', right: 26, top: 30, width: 52, height: 52, borderRadius: 26, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: c.bg }}>
                <Icon name={item.accent} size={24} color="#fff" />
              </View>
            </View>
            <H1 style={{ textAlign: 'center' }}>{item.title}</H1>
            <Body muted style={{ textAlign: 'center', fontSize: 17, lineHeight: 25 }}>
              {item.body}
            </Body>
          </View>
        ))}
      </ScrollView>
      <View style={{ paddingHorizontal: space.lg, gap: space.md, paddingBottom: space.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }} accessibilityLabel={`Page ${page + 1} of ${slides.length}`}>
          {slides.map((s, i) => (
            <View key={s.title} style={{ width: i === page ? 24 : 8, height: 8, borderRadius: radius.pill, backgroundColor: i === page ? c.primary : c.chip }} />
          ))}
        </View>
        <Button big title={last ? 'Get started' : 'Next'} icon={last ? 'checkmark' : 'arrow-forward'} onPress={() => (last ? done() : go(page + 1))} />
      </View>
    </Screen>
  );
}
