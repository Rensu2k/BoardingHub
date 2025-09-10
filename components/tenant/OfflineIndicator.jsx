import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [hasPendingUploads, setHasPendingUploads] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    // Simulate network detection
    // In a real app, you would use NetInfo or similar library
    const checkConnection = () => {
      // Mock offline state for demonstration
      setIsOffline(Math.random() < 0.3); // 30% chance of being offline
      setHasPendingUploads(Math.random() < 0.5); // 50% chance of pending uploads
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (!isOffline && !hasPendingUploads) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isOffline ? "#FF9500" : "#007AFF" },
      ]}
    >
      <View style={styles.content}>
        <Ionicons
          name={isOffline ? "cloud-offline-outline" : "cloud-upload-outline"}
          size={14}
          color="white"
        />
        <ThemedText style={styles.text}>
          {isOffline
            ? "You're offline"
            : hasPendingUploads
            ? "Uploads pending sync"
            : ""}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  text: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
});
