import { View, Text, StyleSheet, ScrollView, Image } from "react-native";

export default function AppInfoScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.iconContainer}>
        <Image
          source={require("../assets/images/icon.png")}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>
      
      <Text style={styles.title}>PlacePulse</Text>
      <Text style={styles.version}>v1.0.0</Text>

      <Text style={styles.sectionTitle}>What this does</Text>
      <Text style={styles.body}>
        PlacePulse watches the BIT Mesra T&P placement portal and alerts you the
        moment a new job is posted — no need to keep checking the site yourself.
      </Text>

      <Text style={styles.sectionTitle}>How it works</Text>
      <Text style={styles.body}>
        A background service checks the portal periodically. When a new listing
        appears, it's added here and a notification is sent to everyone using
        the app.
      </Text>

      <Text style={styles.disclaimer}>
        This is an unofficial, independently built companion app — not run or
        endorsed by the T&P Division.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 24,
    paddingTop: 40,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  icon: {
    width: 72,
    height: 72,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
  },
  version: {
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 28,
  },
  sectionTitle: {
    alignSelf: "flex-start",
    fontSize: 15,
    fontWeight: "600",
    color: "#0d9488",
    marginTop: 16,
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 21,
    alignSelf: "flex-start",
  },
  disclaimer: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 32,
  },
});
