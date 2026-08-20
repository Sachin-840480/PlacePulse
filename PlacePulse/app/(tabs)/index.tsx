import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { getFirestore, collection, onSnapshot } from '@react-native-firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';

import AppDrawer from '../../components/AppDrawer';

const DRAWER_WIDTH = 300;

export default function HomeScreen() {
  const [jobCount, setJobCount] = useState<number | null>(null);
  const [openCount, setOpenCount] = useState<number | null>(null);
  const [newThisWeek, setNewThisWeek] = useState<number | null>(null);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  
  const dragX = useSharedValue(-DRAWER_WIDTH);
  const startX = useSharedValue(0);

  const openDrawer = () => {
    setDrawerVisible(true);
    dragX.value = withTiming(0, { duration: 220 });
  };

  const closeDrawer = () => {
    dragX.value = withTiming(-DRAWER_WIDTH, { duration: 200 }, (finished) => {
      if (finished) runOnJS(setDrawerVisible)(false);
    });
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-20, 20])
    .onStart(() => {
      startX.value = dragX.value;
    })
    .onUpdate((e) => {
      const next = startX.value + e.translationX;
      dragX.value = Math.min(0, Math.max(-DRAWER_WIDTH, next));
    })
    .onEnd((e) => {
      const shouldOpen =
        dragX.value > -DRAWER_WIDTH / 2 || e.velocityX > 600;

      if (shouldOpen) {
        dragX.value = withTiming(0, { duration: 150 });
        runOnJS(setDrawerVisible)(true);
      } else {
        dragX.value = withTiming(-DRAWER_WIDTH, { duration: 150 }, (finished) => {
          if (finished) runOnJS(setDrawerVisible)(false);
        });
      }
    });

  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          dragX.value,
          [-DRAWER_WIDTH, 0],
          [0, 260],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  useEffect(() => {
    const db = getFirestore();

    const unsubAll = onSnapshot(
      collection(db, 'jobs'),
      (snap) => {
        setJobCount(snap.size);

        const now = Date.now();
        let open = 0;
        let newWeek = 0;

        snap.docs.forEach((d) => {
          const data = d.data();

          if (data.deadline) {
            const [dd, mm, yyyy] = data.deadline.split('/').map(Number);
            const deadlineDate = new Date(yyyy, mm - 1, dd);
            if (deadlineDate.getTime() >= now) open++;
          } else {
            open++;
          }

          const posted = data.posted_on_date?.toDate?.();
          if (posted && now - posted.getTime() <= 7 * 24 * 60 * 60 * 1000) newWeek++;
        });

        setOpenCount(open);
        setNewThisWeek(newWeek);
      },
      (err) => console.error('jobs/all error:', err)
    );

    const unsubMeta = onSnapshot(
      collection(db, 'meta'),
      (snap) => {
        const doc = snap.docs.find((d) => d.id === 'sync');
        if (doc) {
          const ts = doc.data().lastSyncedAt?.toDate?.();
          if (ts) setLastSynced(timeAgo(ts));
        }
      },
      (err) => console.error('meta error:', err)
    );

    return () => {
      unsubAll();
      unsubMeta();
    };
  }, []);

  return (
    <GestureDetector gesture={panGesture}>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={styles.drawerBehind}>
          <AppDrawer onClose={closeDrawer} />
        </View>

        <Animated.View style={[{ flex: 1 }, contentStyle]}>
          <ScrollView contentContainerStyle={styles.container} scrollEnabled={!drawerVisible}>
            <View style={styles.topBar}>
              <TouchableOpacity onPress={drawerVisible ? closeDrawer : openDrawer} hitSlop={12}>
                <Ionicons name="menu-outline" size={26} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.hero}>
              <Image
                source={require('../../assets/images/icon.png')}
                style={styles.heroIcon}
                resizeMode="contain"
              />
              <Text style={styles.title}>PlacePulse</Text>
              <Text style={styles.tagline}>Never miss a placement update</Text>
            </View>

            <TouchableOpacity style={styles.fullCard} onPress={() => router.push('/jobs')}>
              <View style={styles.iconContainer}>
                <Ionicons name="briefcase-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.tileTextWrap}>
                <Text style={styles.tileTitle}>Job Listings</Text>
                <Text style={styles.tileSubtitle}>
                  {jobCount === null ? 'Loading…' : `${jobCount} opening${jobCount === 1 ? '' : 's'} tracked`}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.chevron} />
            </TouchableOpacity>

            <View style={styles.statGrid}>
              <StatCard icon="layers-outline" label="Total Jobs" value={jobCount === null ? '–' : jobCount} />
              <StatCard icon="checkmark-circle-outline" label="Open to Apply" value={openCount === null ? '–' : openCount} accent />
              <StatCard icon="trending-up-outline" label="New This Week" value={newThisWeek === null ? '–' : newThisWeek} />
              <StatCard icon="time-outline" label="Last Synced" value={lastSynced ?? '–'} small />
            </View>

            <TouchableOpacity style={styles.fullCard} onPress={() => router.push('/modal')}>
              <View style={styles.iconContainer}>
                <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.tileTextWrap}>
                <Text style={styles.tileTitle}>App Info</Text>
                <Text style={styles.tileSubtitle}>About PlacePulse, how it works</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.chevron} />
            </TouchableOpacity>

            <Text style={styles.footer}>Built for BIT Mesra T&P · unofficial</Text>
          </ScrollView>

          {drawerVisible && (
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              onPress={closeDrawer}
              activeOpacity={1}
            />
          )}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
  small,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <View style={styles.statCard}>
      <Ionicons
        name={icon}
        size={20}
        color={accent ? colors.accent : colors.primary}
        style={styles.statIcon}
      />
      <Text style={[styles.statValue, small && styles.statValueSmall]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function timeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: colors.bg,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroIcon: {
    width: 84,
    height: 84,
    marginBottom: 16,
    borderRadius:22,
  },
  topBar: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  drawerBehind: {
    ...StyleSheet.absoluteFillObject,
    width: DRAWER_WIDTH,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  tagline: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  fullCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  tileTextWrap: {
    flex: 1,
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  tileSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  statValueSmall: {
    fontSize: 16,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
  },
});