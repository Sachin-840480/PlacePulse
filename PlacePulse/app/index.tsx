import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { getFirestore, collection, query, orderBy, onSnapshot } from '@react-native-firebase/firestore';

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

  useEffect(() => {
    // Real-time listener — updates automatically when the backend writes a new job,
    // no manual refresh needed.
    const db = getFirestore();
    const jobsQuery = query(collection(db, 'jobs'), orderBy('first_seen_at', 'desc'));

    const unsubscribe = onSnapshot(
      jobsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => doc.data() as Job);
        setJobs(data);
        setLoading(false);
      },
      (error) => {
        console.error('Firestore listener error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (jobs.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No jobs posted yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={jobs}
      keyExtractor={(item) => item.job_id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.card}>
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
      )}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
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
