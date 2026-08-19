import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { colors } from '../constants/colors';

export default function ComingSoon({ title }: { title: string }) {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title }} />
      <Ionicons name="construct-outline" size={40} color={colors.textMuted} />
      <Text style={styles.text}>Currently in development</Text>
      <Text style={styles.subtext}>This section isn't set up yet — check back soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.bg,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
  },
  subtext: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
});