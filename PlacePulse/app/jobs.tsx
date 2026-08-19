import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  StyleSheet,
  RefreshControl,
  TextInput,
} from 'react-native';
import { getFirestore, collection, query, orderBy, onSnapshot } from '@react-native-firebase/firestore';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type Job = {
  job_id: string;
  company: string;
  deadline: string;
  posted_on: string;
  notice_url: string;
  apply_url: string;
};

const PAGE_SIZE = 20;

export default function JobsScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
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
    const timer = setTimeout(() => setHighlightedId(undefined), 10000);
    return () => clearTimeout(timer);
  }, [highlight]);

  // Firestore's onSnapshot listener already pushes updates in real time,
  // so pull-to-refresh doesn't need a manual re-fetch — it just gives the
  // user a familiar gesture and a brief spinner for reassurance.
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const filteredJobs = useMemo(() => {
    if (!searchText.trim()) return jobs;
    const q = searchText.trim().toLowerCase();
    return jobs.filter((j) => j.company.toLowerCase().includes(q));
  }, [jobs, searchText]);

  // Reset how many rows are shown whenever the search term or underlying
  // job list changes, so a new search always starts from the top page.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchText, jobs.length]);

  const visibleJobs = filteredJobs.slice(0, visibleCount);
  const hasMore = visibleCount < filteredJobs.length;

  const loadMore = useCallback(() => {
    if (!hasMore) return;
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredJobs.length));
  }, [hasMore, filteredJobs.length]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0d9488" />
        <Text style={styles.loadingText}>Loading jobs…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by company"
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {jobs.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="file-tray-outline" size={40} color="#888" style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>No jobs yet</Text>
          <Text style={styles.emptySubtitle}>
            New postings from the T&P portal will show up here automatically.
          </Text>
        </View>
      ) : filteredJobs.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="search-outline" size={40} color="#888" style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>No matches</Text>
          <Text style={styles.emptySubtitle}>
            No jobs found for "{searchText}".
          </Text>
        </View>
      ) : (
        <FlatList
          data={visibleJobs}
          keyExtractor={(item) => item.job_id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0d9488']} />
          }
          onEndReachedThreshold={0.6}
          onEndReached={loadMore}
          ListFooterComponent={
            hasMore ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator size="small" color="#0d9488" />
              </View>
            ) : filteredJobs.length > PAGE_SIZE ? (
              <Text style={styles.footerEnd}>You've reached the end</Text>
            ) : null
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#222',
    padding: 0,
  },
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
  emptyIcon: {
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
  footerLoading: {
    paddingVertical: 20,
  },
  footerEnd: {
    textAlign: 'center',
    fontSize: 12,
    color: '#aaa',
    paddingVertical: 16,
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
    borderColor: '#0d9488',
    backgroundColor: '#f0fdfa',
  },
  newBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#0d9488',
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
    backgroundColor: '#0d9488',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});