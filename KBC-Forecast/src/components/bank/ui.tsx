import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type TextProps, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from './icons';
import { Bank } from '@/constants/bank-theme';

export function T({ bold, style, ...props }: TextProps & { bold?: boolean }) {
  return <Text {...props} style={[styles.text, bold && { fontFamily: Bank.bold }, style]} />;
}

export function IconButton({ name, label, onPress, color, style, testID }: { name: IconName; label: string; onPress: () => void; color?: string; style?: ViewStyle; testID?: string }) {
  return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.iconButton, style, pressed && { opacity: 0.6 }]}><Icon name={name} color={color} size={22} /></Pressable>;
}

export function Button({ label, onPress, variant = 'primary', icon, disabled, testID }: { label: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'quiet' | 'danger'; icon?: IconName; disabled?: boolean; testID?: string }) {
  const foreground = variant === 'primary' ? Bank.white : variant === 'danger' ? Bank.red : Bank.blueDark;
  return <Pressable testID={testID} accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, variant === 'primary' && { backgroundColor: Bank.blue }, variant === 'secondary' && { backgroundColor: Bank.pale }, variant === 'danger' && { backgroundColor: '#FBEDEE' }, disabled && { opacity: 0.45 }, pressed && { opacity: 0.7 }]}>
    {icon && <Icon name={icon} color={foreground} size={18} />}
    <T bold style={{ color: foreground, textAlign: 'center', fontSize: 14, flexShrink: 1 }}>{label}</T>
  </Pressable>;
}

export function Sheet({ title, subtitle, onClose, children }: PropsWithChildren<{ title: string; subtitle?: string; onClose: () => void }>) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return <Modal transparent visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
    <KeyboardAvoidingView style={styles.modalRoot} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Venster sluiten" accessibilityRole="button" />
      <View testID="demo-sheet" accessibilityViewIsModal style={[styles.sheet, { maxHeight: height * 0.86, paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.handle} />
        <View style={styles.sheetHeader}>
          <View style={{ flex: 1, gap: 5 }}><T bold accessibilityRole="header" style={{ fontSize: 23, lineHeight: 29 }}>{title}</T>{subtitle && <T style={styles.muted}>{subtitle}</T>}</View>
          <IconButton name="close" label="Sluiten" onPress={onClose} style={{ backgroundColor: Bank.pale }} />
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>{children}</ScrollView>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}

export function DetailRow({ label, value, positive = false }: { label: string; value: string; positive?: boolean }) {
  return <View style={styles.detailRow}><T style={{ flex: 1, color: Bank.muted }}>{label}</T><T bold style={{ color: positive ? Bank.green : Bank.navy, flexShrink: 1, textAlign: 'right' }}>{value}</T></View>;
}

const styles = StyleSheet.create({
  text: { fontFamily: Bank.font, color: Bank.navy, fontSize: 15, lineHeight: 22 },
  muted: { color: Bank.muted, fontSize: 14, lineHeight: 20 },
  iconButton: { width: 44, height: 44, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  button: { minHeight: 46, borderRadius: 13, paddingHorizontal: 16, paddingVertical: 11, flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center' },
  modalRoot: { flex: 1, backgroundColor: 'rgba(9, 32, 53, 0.32)', justifyContent: 'flex-end', alignItems: 'center' },
  sheet: { width: '100%', maxWidth: Bank.maxWidth, backgroundColor: Bank.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, boxShadow: '0 -10px 60px rgba(16, 51, 90, 0.12)' },
  handle: { width: 36, height: 4, borderRadius: 4, backgroundColor: '#DAE6ED', marginTop: 10, alignSelf: 'center' },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 22, paddingBottom: 18 },
  sheetContent: { paddingHorizontal: 22, paddingBottom: 10, gap: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 14, justifyContent: 'space-between', paddingVertical: 13, borderBottomColor: Bank.line, borderBottomWidth: 1 },
});
