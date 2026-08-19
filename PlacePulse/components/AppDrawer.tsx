import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/color';

const items: { icon: keyof typeof Ionicons.glyphMap; label: string; route?: string; action?: () => void }[] = [
  { icon: 'home-outline', label: 'Home', route: '/' },
  { icon: 'briefcase-outline', label: 'Jobs', route: '/jobs' },
  { icon: 'notifications-outline', label: 'Notifications', route: '/notifications' },
  { icon: 'information-circle-outline', label: 'App Info', route: '/modal' },
  { icon: 'share-social-outline', label: 'Share' },
  { icon: 'chatbubble-ellipses-outline', label: 'Feedback' },
  { icon: 'settings-outline', label: 'Settings', route: '/settings' },
];

export default function AppDrawer({ onClose }: { onClose: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PlacePulse</Text>
      <Text style={styles.subtitle}>Unofficial · BIT Mesra T&P</Text>
      <View style={styles.divider} />
      {items.map((item) => (
        <TouchableOpacity
          key={item.label}
          style={styles.row}
          onPress={() => {
            onClose();
            if (item.route) router.push(item.route);
            else item.action?.();
          }}
        >
          <Ionicons name={item.icon} size={22} color={colors.primary} style={styles.rowIcon} />
          <Text style={styles.rowLabel}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowIcon: {
    marginRight: 16,
  },
  rowLabel: {
    fontSize: 16,
    color: colors.text,
  },
});