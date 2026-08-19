import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Fontisto from '@expo/vector-icons/Fontisto';
import { colors } from '../constants/colors';

type Item = {
  icon: string;
  iconFamily?: 'ionicons' | 'fontisto';
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
      {
        icon: 'bug-outline',
        label: 'Report an Issue',
        action: () =>
          Linking.openURL(
            'https://github.com/Sachin-840480/PlacePulse/issues/new?title=&body=**Describe%20the%20issue**%0A%0A**Steps%20to%20reproduce**%0A%0A**Device%20%2F%20Android%20version**%0A'
          ),
      },
      {
        icon: 'email',
        iconFamily: 'fontisto',
        label: 'Send Feedback',
        action: () =>
          Linking.openURL(
            'mailto:sachin1712003@gmail.com?subject=PlacePulse%20Feedback&body=Hi%20Sachin%2C%0A%0A'
          ),
      },
      { icon: 'share-social-outline', label: 'Share App' },
    ],
  },
  {
    label: 'App',
    items: [{ icon: 'settings-outline', label: 'Settings', route: '/coming-soon' }],
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
              {item.iconFamily === 'fontisto' ? (
                  <Fontisto name={item.icon as any} size={20} color={colors.primary} style={styles.rowIcon} />
              ) : (
                <Ionicons name={item.icon as any} size={22} color={colors.primary} style={styles.rowIcon} />
              )}
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