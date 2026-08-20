import { View, Text, TouchableOpacity, StyleSheet, Image, Linking, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const PRIVACY_POLICY_URL = 'https://sachin-840480.github.io/PlacePulse/privacy-policy.html';
const GITHUB_URL = 'https://github.com/Sachin-840480/PlacePulse';

export default function AboutScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>About Us</Text>
      </View>

      <View style={styles.appCard}>
        <View style={styles.appCardText}>
          <Text style={styles.appName}>PlacePulse</Text>
          <Text style={styles.appMeta}>Developed by Satyam</Text>
          <Text style={styles.versionLabel}>Version</Text>
          <Text style={styles.versionValue}>1.0.0</Text>
        </View>
        <Image
          source={require('../assets/images/icon.png')}
          style={styles.appIcon}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.sectionLabel}>Developer</Text>
      <View style={styles.devCard}>
        {/* <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={22} color={colors.primary} />
        </View> */}
          <Image
            source={require('../assets/images/dev.png')}
            style={styles.devCardIcon}
            resizeMode="contain"
          />
        <View>
          <Text style={styles.devName}>Satyam</Text>
          <Text style={styles.devTagline}>Python, AI, Cloud</Text>
        </View>
      </View>

      <View style={styles.listCard}>
        <TouchableOpacity
          style={styles.listRow}
          onPress={() =>
            router.push({ pathname: '/coming-soon', params: { title: 'Credits' } })
          }
        >
          <Text style={styles.listRowLabel}>Credits</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.rowDivider} />

        <TouchableOpacity
          style={styles.listRow}
          onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
        >
          <Text style={styles.listRowLabel}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.rowDivider} />

        <TouchableOpacity
          style={styles.listRow}
          onPress={() => Linking.openURL(GITHUB_URL)}
        >
          <Text style={styles.listRowLabel}>GitHub Repo</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <Text style={styles.bodySectionTitle}>What this does</Text>
      <Text style={styles.body}>
        PlacePulse watches the BIT Mesra T&P placement portal and alerts you the
        moment a new job is posted — no need to keep checking the site yourself.
      </Text>

      <Text style={styles.bodySectionTitle}>How it works</Text>
      <Text style={styles.body}>
        A background service checks the portal periodically. When a new listing
        appears, it's added here and a notification is sent to everyone using
        the app.
      </Text>

      <Text style={styles.disclaimer}>
        This is an unofficial, independently built companion app — not run or
        endorsed by the T&P Division.
      </Text>

      <Text style={styles.footer}>Built for BIT Mesra T&P · unofficial</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.bg,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  topBarTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 16,
  },
  appCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 28,
  },
  appCardText: {
    flex: 1,
  },
  appName: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  appMeta: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  versionLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  versionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  appIcon: {
    width: 72,
    height: 72,
    marginLeft: 12,
    borderRadius:18,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  devCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
  },
  devCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  devName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  devTagline: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  listCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  listRowLabel: {
    fontSize: 15,
    color: colors.text,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 16,
  },
  body: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 21,
  },
    bodySectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 16,
    marginBottom: 6,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  footer: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
  },
});
