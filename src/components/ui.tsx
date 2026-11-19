/**
 * CribDoc UI kit: the few building blocks every screen is made from.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useState, type ComponentProps, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { radius, space, usePalette, type Palette } from '@/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export function Icon({ name, size = 20, color, style }: { name: IconName; size?: number; color?: string; style?: StyleProp<TextStyle> }) {
  const c = usePalette();
  return <Ionicons name={name} size={size} color={color ?? c.text} style={style} />;
}

export function Screen({
  children,
  scroll = true,
  style,
  edges = ['bottom', 'left', 'right'],
}: {
  children: ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}) {
  const c = usePalette();
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: c.bg }}>
      {scroll ? (
        <ScrollView contentContainerStyle={[styles.content, style]} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, { flex: 1 }, style]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

type TextProps = { children: ReactNode; style?: StyleProp<TextStyle>; numberOfLines?: number };

export function H1({ children, style }: TextProps) {
  const c = usePalette();
  return (
    <Text accessibilityRole="header" style={[styles.h1, { color: c.text }, style]}>
      {children}
    </Text>
  );
}

export function H2({ children, style, numberOfLines }: TextProps) {
  const c = usePalette();
  return (
    <Text accessibilityRole="header" numberOfLines={numberOfLines} style={[styles.h2, { color: c.text }, style]}>
      {children}
    </Text>
  );
}

export function Body({ children, muted, style, numberOfLines }: TextProps & { muted?: boolean }) {
  const c = usePalette();
  return (
    <Text numberOfLines={numberOfLines} style={[styles.body, { color: muted ? c.muted : c.text }, style]}>
      {children}
    </Text>
  );
}

export function Small({ children, style, numberOfLines }: TextProps) {
  const c = usePalette();
  return (
    <Text numberOfLines={numberOfLines} style={[styles.small, { color: c.muted }, style]}>
      {children}
    </Text>
  );
}

export function Label({ children, style }: TextProps) {
  const c = usePalette();
  return <Text style={[styles.label, { color: c.subtle }, style]}>{children}</Text>;
}

export function Card({ children, style, onPress, accessibilityLabel }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; accessibilityLabel?: string }) {
  const c = usePalette();
  const base = [styles.card, { backgroundColor: c.card, borderColor: c.border }, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [base, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}>
      {children}
    </Pressable>
  );
}

type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  title: string;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  style?: StyleProp<ViewStyle>;
  big?: boolean;
  loading?: boolean;
};

export function Button({ title, icon, variant = 'primary', style, big, loading, onPress, disabled, ...rest }: ButtonProps) {
  const c = usePalette();
  const bg = { primary: c.primary, danger: c.danger, secondary: c.card, ghost: 'transparent' }[variant];
  const fg = variant === 'primary' ? c.primaryText : variant === 'danger' ? '#fff' : variant === 'ghost' ? c.primary : c.text;
  const border = variant === 'secondary' ? c.border : variant === 'ghost' ? 'transparent' : bg;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      disabled={disabled || loading}
      onPress={(e) => {
        Haptics.selectionAsync().catch(() => {});
        onPress?.(e);
      }}
      style={({ pressed }) => [
        styles.button,
        big && styles.buttonBig,
        { backgroundColor: bg, borderColor: border, opacity: disabled ? 0.45 : pressed ? 0.85 : 1 },
        style,
      ]}
      {...rest}>
      {loading ? <ActivityIndicator color={fg} /> : icon ? <Icon name={icon} size={big ? 22 : 18} color={fg} /> : null}
      <Text style={[styles.buttonText, big && { fontSize: 18 }, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

export function IconButton({ icon, label, onPress, color }: { icon: IconName; label: string; onPress: () => void; color?: string }) {
  const c = usePalette();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} hitSlop={10} onPress={onPress} style={({ pressed }) => [styles.iconButton, { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.7 : 1 }]}>
      <Icon name={icon} size={20} color={color ?? c.text} />
    </Pressable>
  );
}

export type Tone = 'ok' | 'warn' | 'danger' | 'neutral' | 'info';

export function toneColors(c: Palette, tone: Tone) {
  return {
    ok: { fg: c.success, bg: c.successBg },
    warn: { fg: c.warn, bg: c.warnBg },
    danger: { fg: c.danger, bg: c.dangerBg },
    info: { fg: c.primary, bg: c.primarySoft },
    neutral: { fg: c.muted, bg: c.chip },
  }[tone];
}

export function Badge({ children, tone = 'neutral', icon }: { children: ReactNode; tone?: Tone; icon?: IconName }) {
  const c = usePalette();
  const t = toneColors(c, tone);
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      {icon ? <Icon name={icon} size={12} color={t.fg} /> : null}
      <Text style={{ color: t.fg, fontSize: 12, fontWeight: '700' }}>{children}</Text>
    </View>
  );
}

export function Avatar({ name, size = 44, color }: { name: string; size?: number; color?: string }) {
  const c = usePalette();
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color ?? c.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: c.primary, fontWeight: '800', fontSize: size * 0.38 }}>{initials}</Text>
    </View>
  );
}

/** A tappable row: leading element, title + subtitle, trailing element, chevron. */
export function ListItem({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  accessibilityLabel,
}: {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const c = usePalette();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel ?? title}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.listItem, { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}>
      {leading}
      <View style={{ flex: 1, gap: 2 }}>
        <Text numberOfLines={1} style={{ color: c.text, fontSize: 16, fontWeight: '700' }}>
          {title}
        </Text>
        {subtitle ? <Small numberOfLines={2}>{subtitle}</Small> : null}
      </View>
      {trailing}
      {onPress ? <Icon name="chevron-forward" size={18} color={c.subtle} /> : null}
    </Pressable>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  const c = usePalette();
  return (
    <View accessibilityRole="tablist" style={[styles.segmented, { backgroundColor: c.chip }]}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={[styles.segment, on && { backgroundColor: c.card, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } }]}>
            <Text style={{ color: on ? c.text : c.muted, fontWeight: on ? '700' : '600', fontSize: 14 }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Pill({ children, active, onPress }: { children: ReactNode; active?: boolean; onPress?: () => void }) {
  const c = usePalette();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ selected: active }}
      style={[styles.pill, { borderColor: active ? c.primary : c.border, backgroundColor: active ? c.primary : c.card }]}>
      <Text style={{ color: active ? c.primaryText : c.muted, fontSize: 14, fontWeight: '600' }}>{children}</Text>
    </Pressable>
  );
}

export function Field({ label, hint, error, right, ...props }: TextInputProps & { label: string; hint?: string; error?: string; right?: ReactNode }) {
  const c = usePalette();
  return (
    <View style={{ gap: 6 }}>
      <Label>{label}</Label>
      <View style={{ justifyContent: 'center' }}>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={c.subtle}
          {...props}
          style={[
            styles.input,
            { color: c.text, backgroundColor: c.card, borderColor: error ? c.danger : c.border },
            right ? { paddingRight: 52 } : null,
            props.multiline && { minHeight: 96, textAlignVertical: 'top' },
            props.style,
          ]}
        />
        {right ? <View style={{ position: 'absolute', right: 6 }}>{right}</View> : null}
      </View>
      {error ? <Small style={{ color: c.danger }}>{error}</Small> : hint ? <Small>{hint}</Small> : null}
    </View>
  );
}

/** Password input with a show/hide button. */
export function PasswordField(props: TextInputProps & { label: string; hint?: string; error?: string }) {
  const c = usePalette();
  const [shown, setShown] = useState(false);
  return (
    <Field
      {...props}
      secureTextEntry={!shown}
      autoCapitalize="none"
      autoCorrect={false}
      right={
        <Pressable accessibilityRole="button" accessibilityLabel={shown ? 'Hide password' : 'Show password'} hitSlop={8} onPress={() => setShown((v) => !v)} style={{ padding: 10 }}>
          <Icon name={shown ? 'eye-off-outline' : 'eye-outline'} size={20} color={c.muted} />
        </Pressable>
      }
    />
  );
}

export function Row({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: space.sm }, style]}>{children}</View>;
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <Row style={{ justifyContent: 'space-between', marginTop: space.sm }}>
      <Label>{children}</Label>
      {action}
    </Row>
  );
}

export function Empty({ icon, title, body, action }: { icon: IconName; title: string; body: string; action?: ReactNode }) {
  const c = usePalette();
  return (
    <View style={{ alignItems: 'center', gap: space.sm, paddingVertical: space.xl, paddingHorizontal: space.md }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={30} color={c.primary} />
      </View>
      <H2 style={{ textAlign: 'center' }}>{title}</H2>
      <Body muted style={{ textAlign: 'center' }}>
        {body}
      </Body>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.md, gap: space.md, paddingBottom: space.xl * 2 },
  h1: { fontSize: 30, fontWeight: '800', letterSpacing: -0.8 },
  h2: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  body: { fontSize: 16, lineHeight: 23 },
  small: { fontSize: 13, lineHeight: 18 },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 1.1, textTransform: 'uppercase' },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: space.md, gap: space.sm },
  button: { flexDirection: 'row', gap: 8, borderWidth: 1, borderRadius: radius.pill, minHeight: 50, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center' },
  buttonBig: { minHeight: 62, borderRadius: radius.lg },
  buttonText: { fontSize: 16, fontWeight: '700' },
  iconButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderWidth: 1, borderRadius: radius.md, padding: space.md, minHeight: 64 },
  segmented: { flexDirection: 'row', borderRadius: radius.pill, padding: 4, gap: 4 },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: radius.pill },
  pill: { borderWidth: 1, borderRadius: radius.pill, paddingVertical: 9, paddingHorizontal: 16 },
  input: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16 },
});
