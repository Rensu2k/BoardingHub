import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
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
import { auth, db } from "@/constants/firebase";
import { useColorScheme } from "@/hooks/useColorScheme";

const { width } = Dimensions.get("window");

export default function LandlordDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();

            // Check if user is actually a tenant and redirect them
            if (userData.userType === "tenant") {
              console.log(
                "Tenant user detected, redirecting to tenant dashboard..."
              );
              router.replace("/tenant/dashboard");
              return;
            }

            setUserProfile(userData);
          } else {
            // User profile doesn't exist, sign out
            console.log("User profile not found, signing out...");
            await signOut(auth);
            router.replace("/auth/login");
            return;
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        // User is not authenticated, redirect to login
        router.replace("/auth/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            router.replace("/auth/login");
          } catch (error) {
            console.error("Error signing out:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ThemedText>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const dashboardStats = [
    {
      title: "Total Properties",
      value: "3",
      icon: "business-outline",
      color: "#007AFF",
    },
    {
      title: "Occupied Rooms",
      value: "12",
      icon: "people-outline",
      color: "#34C759",
    },
    {
      title: "Monthly Revenue",
      value: "₱45,000",
      icon: "cash-outline",
      color: "#FF9500",
    },
    {
      title: "Pending Payments",
      value: "2",
      icon: "time-outline",
      color: "#FF3B30",
    },
  ];

  const quickActions = [
    {
      title: "Add Property",
      icon: "add-circle-outline",
      action: () =>
        Alert.alert("Coming Soon", "Property management coming soon!"),
    },
    {
      title: "View Tenants",
      icon: "people-circle-outline",
      action: () =>
        Alert.alert("Coming Soon", "Tenant management coming soon!"),
    },
    {
      title: "Send Reminder",
      icon: "notifications-outline",
      action: () =>
        Alert.alert("Coming Soon", "Notification system coming soon!"),
    },
    {
      title: "Generate Report",
      icon: "document-text-outline",
      action: () =>
        Alert.alert("Coming Soon", "Report generation coming soon!"),
    },
  ];

  const recentActivities = [
    {
      type: "payment",
      message: "Juan Dela Cruz paid ₱5,000 rent",
      time: "2 hours ago",
      icon: "checkmark-circle-outline",
      color: "#34C759",
    },
    {
      type: "tenant",
      message: "New tenant Maria Santos moved in",
      time: "1 day ago",
      icon: "person-add-outline",
      color: "#007AFF",
    },
    {
      type: "reminder",
      message: "Rent due reminder sent to 3 tenants",
      time: "2 days ago",
      icon: "notifications-outline",
      color: "#FF9500",
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <ThemedText style={styles.greeting}>Good morning,</ThemedText>
              <ThemedText style={styles.landlordName}>
                {userProfile
                  ? `${userProfile.firstName} ${userProfile.lastName}`
                  : "Landlord"}
              </ThemedText>
              {userProfile?.propertyName && (
                <ThemedText style={styles.propertyName}>
                  {userProfile.propertyName}
                </ThemedText>
              )}
            </View>
            <TouchableOpacity
              style={[styles.profileButton, { backgroundColor: colors.tint }]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Stats Cards */}
        <ThemedView style={styles.statsSection}>
          <ThemedText style={styles.sectionTitle}>Overview</ThemedText>
          <View style={styles.statsGrid}>
            {dashboardStats.map((stat, index) => (
              <View
                key={index}
                style={[styles.statCard, { backgroundColor: colors.card }]}
              >
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: stat.color + "20" },
                  ]}
                >
                  <Ionicons name={stat.icon} size={24} color={stat.color} />
                </View>
                <View style={styles.statContent}>
                  <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
                  <ThemedText style={styles.statTitle}>{stat.title}</ThemedText>
                </View>
              </View>
            ))}
          </View>
        </ThemedView>

        {/* Quick Actions */}
        <ThemedView style={styles.actionsSection}>
          <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionCard, { backgroundColor: colors.card }]}
                onPress={action.action}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: colors.tint + "20" },
                  ]}
                >
                  <Ionicons name={action.icon} size={28} color={colors.tint} />
                </View>
                <ThemedText style={styles.actionTitle}>
                  {action.title}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>

        {/* Recent Activity */}
        <ThemedView style={styles.activitySection}>
          <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>
          <View style={styles.activityList}>
            {recentActivities.map((activity, index) => (
              <View
                key={index}
                style={[styles.activityItem, { backgroundColor: colors.card }]}
              >
                <View
                  style={[
                    styles.activityIcon,
                    { backgroundColor: activity.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={activity.icon}
                    size={20}
                    color={activity.color}
                  />
                </View>
                <View style={styles.activityContent}>
                  <ThemedText style={styles.activityMessage}>
                    {activity.message}
                  </ThemedText>
                  <ThemedText style={styles.activityTime}>
                    {activity.time}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 16,
    opacity: 0.7,
  },
  landlordName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 52) / 2,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statTitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  actionsSection: {
    padding: 20,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: (width - 52) / 2,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  activitySection: {
    padding: 20,
    paddingBottom: 40,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 16,
    fontWeight: "500",
  },
  activityTime: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 2,
  },
  propertyName: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
