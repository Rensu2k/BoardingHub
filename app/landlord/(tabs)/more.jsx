import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { currentUser } from "../data/userData";

const { width } = Dimensions.get("window");

export default function MoreScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const menuItems = [
    {
      id: "1",
      title: "Notifications",
      subtitle: "Manage alerts and reminders",
      icon: "notifications-outline",
      color: "#FF9500",
      action: () => router.push("/landlord/notifications"),
    },
    {
      id: "2",
      title: "Reports",
      subtitle: "View financial and occupancy reports",
      icon: "document-text-outline",
      color: "#007AFF",
      action: () =>
        Alert.alert("Coming Soon", "Reports dashboard coming soon!"),
    },
    {
      id: "3",
      title: "Settings",
      subtitle: "App preferences and account settings",
      icon: "settings-outline",
      color: "#8E8E93",
      action: () => router.push("/landlord/settings"),
    },
    {
      id: "4",
      title: "Support",
      subtitle: "Help and contact information",
      icon: "help-circle-outline",
      color: "#34C759",
      action: () => Alert.alert("Coming Soon", "Support screen coming soon!"),
    },
    {
      id: "5",
      title: "Team Management",
      subtitle: "Invite and manage staff members",
      icon: "people-outline",
      color: "#AF52DE",
      action: () => Alert.alert("Coming Soon", "Team management coming soon!"),
    },
    {
      id: "6",
      title: "Data Export",
      subtitle: "Export data for accounting",
      icon: "download-outline",
      color: "#FF3B30",
      action: () => Alert.alert("Coming Soon", "Data export coming soon!"),
    },
  ];

  const MenuItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: colors.card }]}
      onPress={item.action}
    >
      <View style={[styles.menuIcon, { backgroundColor: item.color + "20" }]}>
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>

      <View style={styles.menuContent}>
        <ThemedText style={styles.menuTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.menuSubtitle}>{item.subtitle}</ThemedText>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.text + "40"} />
    </TouchableOpacity>
  );

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          router.replace("/auth/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>More</ThemedText>
          <TouchableOpacity
            style={[
              styles.notificationButton,
              { backgroundColor: colors.tint + "20" },
            ]}
            onPress={() => router.push("/landlord/notifications")}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.tint}
            />
          </TouchableOpacity>
        </View>
      </ThemedView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Section */}
        <ThemedView style={styles.profileSection}>
          <TouchableOpacity
            style={[styles.profileCard, { backgroundColor: colors.card }]}
            onPress={() => router.push("/landlord/profile")}
          >
            <View
              style={[
                styles.profileAvatar,
                { backgroundColor: colors.tint + "20" },
              ]}
            >
              <Ionicons name="person-outline" size={32} color={colors.tint} />
            </View>

            <View style={styles.profileInfo}>
              <ThemedText style={styles.profileName}>
                {currentUser.name}
              </ThemedText>
              <ThemedText style={styles.profileEmail}>
                {currentUser.email}
              </ThemedText>
              <ThemedText style={styles.profileProperties}>
                {currentUser.properties} Properties Managed
              </ThemedText>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.text + "40"}
            />
          </TouchableOpacity>
        </ThemedView>

        {/* Menu Items */}
        <ThemedView style={styles.menuSection}>
          <View style={styles.menuList}>
            {menuItems.map((item) => (
              <MenuItem key={item.id} item={item} />
            ))}
          </View>
        </ThemedView>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={[styles.logoutButton, { borderColor: "#FF3B30" }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            <ThemedText style={[styles.logoutText, { color: "#FF3B30" }]}>
              Logout
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <ThemedText style={styles.versionText}>BoardingHub v1.0.0</ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileSection: {
    padding: 20,
    paddingBottom: 8,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  profileProperties: {
    fontSize: 12,
    opacity: 0.6,
  },
  menuSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  menuList: {
    gap: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  logoutSection: {
    padding: 20,
    paddingTop: 32,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
  versionSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  versionText: {
    fontSize: 14,
    opacity: 0.5,
  },
});
