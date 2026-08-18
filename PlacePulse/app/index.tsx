import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { getFirestore, collection, query, orderBy, onSnapshot } from '@react-native-firebase/firestore';
import { useLocalSearchParams } from 'expo-router';

type Job = {
  job_id: string;
  company: string;
  deadline: string;
  posted_on: string;
  notice_url: string;
  apply_url: string;
};

export default function JobListScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { highlight } = useLocalSearchParams<{ highlight?: string }>();
  const [highlightedId, setHighlightedId] = useState<string | undefined>(highlight);

  useEffect(() => {
    const db = getFirestore();
    const jobsQuery = query(collection(db, 'jobs'), orderBy('posted_on_date', 'desc'));

    const unsubscribe = onSnapshot(
      jobsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => doc.data() as Job);
        setJobs(data);
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        console.error('Firestore listener error:', error);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Update the highlight when a fresh notification tap sends a new param,
  // and clear it after a few seconds so it doesn't stay highlighted forever.
  useEffect(() => {
    if (!highlight) return;
    setHighlightedId(highlight);
    const timer = setTimeout(() => setHighlightedId(undefined), 4000);
    return () => clearTimeout(timer);
  }, [highlight]);

  // Firestore's onSnapshot listener already pushes updates in real time,
  // so pull-to-refresh doesn't need a manual re-fetch — it just gives the
  // user a familiar gesture and a brief spinner for reassurance.
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d62828" />
        <Text style={styles.loadingText}>Loading jobs…</Text>
      </View>
    );
  }

  if (jobs.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyEmoji}>📭</Text>
        <Text style={styles.emptyTitle}>No jobs yet</Text>
        <Text style={styles.emptySubtitle}>
          New postings from the T&P portal will show up here automatically.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={jobs}
      keyExtractor={(item) => item.job_id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#d62828']} />
      }
      renderItem={({ item }) => {
        const isHighlighted = item.job_id === highlightedId;
        return (
          <View style={[styles.card, isHighlighted && styles.cardHighlighted]}>
            {isHighlighted && <Text style={styles.newBadge}>NEW</Text>}
            <Text style={styles.company}>{item.company}</Text>
            <Text style={styles.meta}>Posted: {item.posted_on}</Text>
            <Text style={styles.meta}>Deadline: {item.deadline}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => Linking.openURL(item.apply_url)}
            >
              <Text style={styles.buttonText}>View & Apply</Text>
            </TouchableOpacity>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#888',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  list: {
    padding: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHighlighted: {
    borderWidth: 2,
    borderColor: '#d62828',
    backgroundColor: '#fff5f5',
  },
  newBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#d62828',
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  company: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#d62828',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
