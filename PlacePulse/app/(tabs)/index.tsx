import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { getFirestore, collection, onSnapshot } from '@react-native-firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [jobCount, setJobCount] = useState<number | null>(null);

  useEffect(() => {
    const db = getFirestore();
    // Lightweight count-only listener — just for the tile subtitle, doesn't
    // need full job data like the jobs screen does.
    const unsubscribe = onSnapshot(collection(db, 'jobs'), (snapshot) => {
      setJobCount(snapshot.size);
    });
    return () => unsubscribe();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Image
          source={require('../../assets/images/icon.png')}
          style={styles.heroIcon}
          resizeMode="contain"
        />
        <Text style={styles.title}>PlacePulse</Text>
        <Text style={styles.tagline}>Never miss a placement update</Text>
      </View>

      <View style={styles.tiles}>
        <TouchableOpacity style={styles.tile} onPress={() => router.push('/jobs')}>
          <View style={styles.iconContainer}>
            <Ionicons name="briefcase-outline" size={24} color="#2563eb" />
          </View>
          <View style={styles.tileTextWrap}>
            <Text style={styles.tileTitle}>Job Listings</Text>
            <Text style={styles.tileSubtitle}>
              {jobCount === null ? 'Loading…' : `${jobCount} opening${jobCount === 1 ? '' : 's'} tracked`}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
        </TouchableOpacity>

        <View style={styles.tile}>
          <View style={styles.iconContainer}>
            <Ionicons name="notifications-outline" size={24} color="#2563eb" />
          </View>
          <View style={styles.tileTextWrap}>
            <Text style={styles.tileTitle}>Notifications</Text>
            <Text style={styles.tileSubtitle}>You'll be alerted the moment a new job is posted</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.tile} onPress={() => router.push('/modal')}>
          <View style={styles.iconContainer}>
            <Ionicons name="information-circle-outline" size={24} color="#2563eb" />
          </View>
          <View style={styles.tileTextWrap}>
            <Text style={styles.tileTitle}>App Info</Text>
            <Text style={styles.tileSubtitle}>About PlacePulse, how it works</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Built for BIT Mesra T&P · unofficial</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f7fafa',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 36,
  },
  heroIcon: {
    width: 84,
    height: 84,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  tagline: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  tiles: {
    gap: 12,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
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
    color: '#0f172a',
    marginBottom: 2,
  },
  tileSubtitle: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  footer: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 12,
    color: '#94a3b8',
  },
});
