import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import { useColors } from '../hooks/use-colors';

export default function NotificationsScreen() {
  const colors = useColors();
  const styles = getStyles(colors);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    async function checkPermission() {
      const settings = await notifee.getNotificationSettings();
      setPermissionDenied(settings.authorizationStatus === AuthorizationStatus.DENIED);
    }
    checkPermission();
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Notifications' }} />

      {permissionDenied && (
        <TouchableOpacity style={styles.warningBanner} onPress={() => Linking.openSettings()}>
          <Ionicons name="notifications-off-outline" size={20} color={colors.accent} />
          <View style={styles.warningTextWrap}>
            <Text style={styles.warningTitle}>Notifications are off</Text>
            <Text style={styles.warningSubtitle}>Tap to enable in Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.accent} />
        </TouchableOpacity>
      )}

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
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent,
    padding: 14,
    marginBottom: 24,
  },
  warningTextWrap: {
    flex: 1,
    marginLeft: 10,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  warningSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
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