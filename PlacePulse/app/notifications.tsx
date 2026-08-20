import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../hooks/use-colors';

export default function NotificationsScreen() {
  const colors = useColors();
  const styles = getStyles(colors);
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Notifications' }} />
      <Ionicons name="notifications-outline" size={40} color={colors.primary} style={styles.icon} />
      <Text style={styles.heading}>How you get notified</Text>
      <Text style={styles.body}>
        Every device with PlacePulse installed subscribes to a shared notification channel.
        When the backend scraper finds a new job on the T&P portal, it writes it to the
        database and immediately fires one push to every subscribed device — no polling,
        no delay waiting for you to open the app.
      </Text>
      <Text style={styles.body}>
        Tapping a notification takes you straight to that job, highlighted at the top of
        the Jobs list.
      </Text>
    </View>
  );
}

const getStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
    backgroundColor: colors.bg,
  },
  icon: {
    marginBottom: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
    marginBottom: 14,
  },
});