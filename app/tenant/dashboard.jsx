import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  RefreshControl,
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
import { usePullRefresh } from "@/hooks/usePullRefresh";

const { width } = Dimensions.get("window");

export default function TenantDashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Refresh function to reload dashboard data
  const refreshDashboard = async () => {
    try {
      // Simulate fetching fresh data
      console.log("Refreshing tenant dashboard data...");

      // In a real app, you would:
      // - Refetch user profile
      // - Update payment history from API/Firebase
      // - Refresh utility bills
      // - Update tenant stats

      // For now, we'll just refresh the user profile
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
      }
    } catch (error) {
      console.error("Error refreshing dashboard:", error);
    }
  };

  // Use the pull refresh hook
  const { refreshing, onRefresh } = usePullRefresh(refreshDashboard);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();

            // Check if user is actually a landlord and redirect them
            if (userData.userType === "landlord") {
              console.log(
                "Landlord user detected, redirecting to landlord dashboard..."
              );
              router.replace("/landlord/dashboard");
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

  const tenantStats = [
    {
      title: "Room",
      value: "A-101",
      subtitle: "2nd Floor",
      icon: "home-outline",
      color: "#007AFF",
    },
    {
      title: "Rent Due",
      value: "₱5,000",
      subtitle: "Due in 5 days",
      icon: "cash-outline",
      color: "#FF9500",
    },
    {
      title: "Balance",
      value: "₱2,500",
      subtitle: "Outstanding",
      icon: "wallet-outline",
      color: "#FF3B30",
    },
    {
      title: "Due Date",
      value: "Dec 15",
      subtitle: "Monthly rent",
      icon: "calendar-outline",
      color: "#34C759",
    },
  ];

  const quickActions = [
    {
      title: "Pay Rent",
      icon: "card-outline",
      action: () => Alert.alert("Payment", "Payment system coming soon!"),
      color: "#007AFF",
    },
    {
      title: "Upload Receipt",
      icon: "cloud-upload-outline",
      action: () => Alert.alert("Upload", "Receipt upload coming soon!"),
      color: "#34C759",
    },
    {
      title: "Service Request",
      icon: "construct-outline",
      action: () => Alert.alert("Service", "Maintenance request coming soon!"),
      color: "#FF9500",
    },
    {
      title: "Contact Landlord",
      icon: "call-outline",
      action: () => Alert.alert("Contact", "Communication system coming soon!"),
      color: "#5856D6",
    },
  ];

  const recentPayments = [
    {
      date: "Nov 15, 2024",
      amount: "₱5,000",
      status: "Paid",
      method: "GCash",
      color: "#34C759",
    },
    {
      date: "Oct 15, 2024",
      amount: "₱5,000",
      status: "Paid",
      method: "Bank Transfer",
      color: "#34C759",
    },
    {
      date: "Sep 15, 2024",
      amount: "₱5,000",
      status: "Paid",
      method: "Cash",
      color: "#34C759",
    },
  ];

  const utilityBills = [
    {
      type: "Electricity",
      amount: "₱850",
      due: "Dec 10",
      status: "Pending",
    },
    {
      type: "Water",
      amount: "₱350",
      due: "Dec 8",
      status: "Paid",
    },
    {
      type: "Internet",
      amount: "₱1,200",
      due: "Dec 5",
      status: "Paid",
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <ThemedText style={styles.greeting}>Good morning,</ThemedText>
              <ThemedText style={styles.tenantName}>
                {userProfile
                  ? `${userProfile.firstName} ${userProfile.lastName}`
                  : "Tenant"}
              </ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.profileButton, { backgroundColor: colors.tint }]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Room & Rent Stats */}
        <ThemedView style={styles.statsSection}>
          <ThemedText style={styles.sectionTitle}>My Room</ThemedText>
          <View style={styles.statsGrid}>
            {tenantStats.map((stat, index) => (
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
                  <ThemedText style={styles.statSubtitle}>
                    {stat.subtitle}
                  </ThemedText>
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
                    { backgroundColor: action.color + "20" },
                  ]}
                >
                  <Ionicons name={action.icon} size={28} color={action.color} />
                </View>
                <ThemedText style={styles.actionTitle}>
                  {action.title}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>

        {/* Utility Bills */}
        <ThemedView style={styles.billsSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Utility Bills</ThemedText>
            <TouchableOpacity
              onPress={() =>
                Alert.alert("View All", "View all bills coming soon!")
              }
            >
              <ThemedText style={[styles.viewAllText, { color: colors.tint }]}>
                View All
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.billsList}>
            {utilityBills.map((bill, index) => (
              <View
                key={index}
                style={[styles.billItem, { backgroundColor: colors.card }]}
              >
                <View style={styles.billInfo}>
                  <ThemedText style={styles.billType}>{bill.type}</ThemedText>
                  <ThemedText style={styles.billAmount}>
                    {bill.amount}
                  </ThemedText>
                </View>
                <View style={styles.billMeta}>
                  <ThemedText style={styles.billDue}>
                    Due: {bill.due}
                  </ThemedText>
                  <View
                    style={[
                      styles.statusBadge,
                      bill.status === "Paid"
                        ? styles.paidBadge
                        : styles.pendingBadge,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.statusText,
                        bill.status === "Paid"
                          ? styles.paidText
                          : styles.pendingText,
                      ]}
                    >
                      {bill.status}
                    </ThemedText>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ThemedView>

        {/* Payment History */}
        <ThemedView style={styles.paymentsSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Payment History</ThemedText>
            <TouchableOpacity
              onPress={() =>
                Alert.alert("View All", "Full payment history coming soon!")
              }
            >
              <ThemedText style={[styles.viewAllText, { color: colors.tint }]}>
                View All
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.paymentsList}>
            {recentPayments.map((payment, index) => (
              <View
                key={index}
                style={[styles.paymentItem, { backgroundColor: colors.card }]}
              >
                <View
                  style={[
                    styles.paymentIcon,
                    { backgroundColor: payment.color + "20" },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={payment.color}
                  />
                </View>
                <View style={styles.paymentContent}>
                  <View style={styles.paymentInfo}>
                    <ThemedText style={styles.paymentAmount}>
                      {payment.amount}
                    </ThemedText>
                    <ThemedText style={styles.paymentMethod}>
                      {payment.method}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.paymentDate}>
                    {payment.date}
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
  tenantName: {
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: "500",
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
    fontSize: 20,
    fontWeight: "bold",
  },
  statTitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 12,
    opacity: 0.5,
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
  billsSection: {
    padding: 20,
  },
  billsList: {
    gap: 12,
  },
  billItem: {
    padding: 16,
    borderRadius: 12,
  },
  billInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  billType: {
    fontSize: 16,
    fontWeight: "500",
  },
  billAmount: {
    fontSize: 18,
    fontWeight: "600",
  },
  billMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  billDue: {
    fontSize: 14,
    opacity: 0.7,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paidBadge: {
    backgroundColor: "#34C75920",
  },
  pendingBadge: {
    backgroundColor: "#FF950020",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  paidText: {
    color: "#34C759",
  },
  pendingText: {
    color: "#FF9500",
  },
  paymentsSection: {
    padding: 20,
    paddingBottom: 40,
  },
  paymentsList: {
    gap: 12,
  },
  paymentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  paymentContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  paymentMethod: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  paymentDate: {
    fontSize: 14,
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
