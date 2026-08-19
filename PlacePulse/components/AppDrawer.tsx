import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

type Item = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route?: any;
  action?: () => void;
};

const sections: { label: string; items: Item[] }[] = [
  {
    label: '',
    items: [
      { icon: 'home-outline', label: 'Home', route: '/' },
      { icon: 'briefcase-outline', label: 'Jobs', route: '/jobs' },
      { icon: 'notifications-outline', label: 'Notifications', route: '/notifications' },
    ],
  },
  {
    label: 'About',
    items: [{ icon: 'information-circle-outline', label: 'About PlacePulse', route: '/modal' }],
  },
  {
    label: 'Project',
    items: [
      { icon: 'logo-github', label: 'GitHub', action: () => Linking.openURL('https://github.com/Sachin-840480') },
      { icon: 'share-social-outline', label: 'Share App' },
    ],
  },
  {
    label: 'App',
    items: [{ icon: 'settings-outline', label: 'Settings', route: '/settings' }],
  },
];

export default function AppDrawer({ onClose }: { onClose: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PlacePulse</Text>
      <Text style={styles.subtitle}>Placement Tracker</Text>

      {sections.map((section, i) => (
        <View key={i} style={styles.section}>
          <View style={styles.divider} />
          {section.label ? <Text style={styles.sectionLabel}>{section.label}</Text> : null}
          {section.items.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.row}
              onPress={() => {
                onClose();
                if (item.route) router.push(item.route as any);
                else if (item.action) item.action();
                else router.push({ pathname: '/coming-soon', params: { title: item.label } });
              }}
            >
              <Ionicons name={item.icon} size={22} color={colors.primary} style={styles.rowIcon} />
              <Text style={styles.rowLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  section: {
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowIcon: {
    marginRight: 16,
  },
  rowLabel: {
    fontSize: 16,
    color: colors.text,
  },
});