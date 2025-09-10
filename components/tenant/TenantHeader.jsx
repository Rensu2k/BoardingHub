import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TenantHeader({
  title,
  showNotifications = true,
  notificationCount = 0,
  onNotificationPress,
  rightComponent,
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <ThemedView style={styles.header}>
      <View style={styles.headerContent}>
        <ThemedText style={styles.headerTitle}>{title}</ThemedText>

        {rightComponent ||
          (showNotifications && (
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={onNotificationPress}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={colors.text}
              />
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <ThemedText style={styles.badgeText}>
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </ThemedText>
                </View>
              )}
            </TouchableOpacity>
          ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  notificationButton: {
    position: "relative",
    padding: 4,
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
});
