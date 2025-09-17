import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
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
import { getAvailableRoomsForTenants } from "@/utils/roomHelpers";

const { width } = Dimensions.get("window");

export default function TenantDashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [browseListings, setBrowseListings] = useState([]);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Refresh function to reload dashboard data
  const refreshDashboard = async () => {
    try {
      // Simulate fetching fresh data
      console.log("Refreshing tenant dashboard data...");

      // Fetch user profile
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
      }

      // Fetch available rooms for browsing
      const availableRooms = await getAvailableRoomsForTenants();
      // Limit to first 4 rooms for dashboard preview
      setBrowseListings(availableRooms.slice(0, 4));
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

            // Load initial data
            await refreshDashboard();
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
      title: "Upload Payment Proof",
      icon: "cloud-upload-outline",
      action: () => Alert.alert("Upload", "Receipt upload coming soon!"),
      color: "#34C759",
    },
    {
      title: "View Bills",
      icon: "receipt-outline",
      action: () => router.push("/tenant/(tabs)/bills"),
      color: "#007AFF",
    },
    {
      title: "Report Maintenance",
      icon: "construct-outline",
      action: () =>
        Alert.alert("Maintenance", "Maintenance request coming soon!"),
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
            <View style={styles.greetingSection}>
              <ThemedText style={styles.greeting}>Good morning,</ThemedText>
              <ThemedText style={styles.tenantName}>
                {userProfile
                  ? `${userProfile.firstName} ${userProfile.lastName}`
                  : "Tenant"}
              </ThemedText>
              <ThemedText style={styles.propertyName}>
                Sunrise Boarding House
              </ThemedText>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() =>
                Alert.alert("Notifications", "No new notifications")
              }
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={colors.text}
              />
              <View style={styles.notificationBadge}>
                <ThemedText style={styles.badgeText}>3</ThemedText>
              </View>
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Upcoming Due Summary */}
        <ThemedView style={styles.dueSection}>
          <View style={[styles.dueCard, { backgroundColor: colors.card }]}>
            <View style={styles.dueInfo}>
              <View style={styles.dueAmount}>
                <ThemedText style={styles.dueLabel}>
                  Next Payment Due
                </ThemedText>
                <ThemedText style={styles.dueValue}>₱5,850</ThemedText>
                <ThemedText style={styles.dueDays}>
                  in 5 days (Dec 15)
                </ThemedText>
              </View>
              <TouchableOpacity
                style={[
                  styles.quickPayButton,
                  { backgroundColor: colors.tint },
                ]}
                onPress={() => {
                  // Navigate to bills tab for quick payment
                  router.push("/tenant/(tabs)/bills");
                }}
              >
                <Ionicons name="flash" size={16} color="white" />
                <ThemedText style={styles.quickPayText}>Quick Pay</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ThemedView>

        {/* Active Room Listing */}
        <ThemedView style={styles.activeRoomSection}>
          <ThemedText style={styles.sectionTitle}>My Active Room</ThemedText>
          <View
            style={[styles.activeRoomCard, { backgroundColor: colors.card }]}
          >
            <View style={styles.roomImageContainer}>
              <Image
                source={{
                  uri: "https://via.placeholder.com/120x80/4A90E2/FFFFFF?text=Room+A-101",
                }}
                style={styles.roomImage}
              />
              <View style={styles.roomBadge}>
                <ThemedText style={styles.roomBadgeText}>A-101</ThemedText>
              </View>
            </View>
            <View style={styles.roomDetails}>
              <ThemedText style={styles.roomTitle}>
                Single Room - 2nd Floor
              </ThemedText>
              <ThemedText style={styles.roomRent}>₱5,000/month</ThemedText>
              <View style={styles.landlordInfo}>
                <Ionicons
                  name="person-circle-outline"
                  size={16}
                  color={colors.text}
                />
                <ThemedText style={styles.landlordName}>
                  Ms. Maria Santos
                </ThemedText>
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => Alert.alert("Contact", "Calling landlord...")}
                >
                  <Ionicons name="call" size={14} color={colors.tint} />
                </TouchableOpacity>
              </View>
              <View style={styles.lastBillInfo}>
                <Ionicons name="receipt-outline" size={16} color="#FF9500" />
                <ThemedText style={styles.lastBillText}>
                  Last bill: Dec 2024 - ₱5,850
                </ThemedText>
              </View>
            </View>
          </View>
        </ThemedView>

        {/* Browse Listings */}
        <ThemedView style={styles.browseSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Browse Available Rooms
            </ThemedText>
            <TouchableOpacity onPress={() => router.push("/tenant/browse")}>
              <ThemedText style={[styles.viewAllText, { color: colors.tint }]}>
                View All
              </ThemedText>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.browseCarousel}
            contentContainerStyle={styles.browseContent}
          >
            {browseListings.map((listing, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.browseCard, { backgroundColor: colors.card }]}
                onPress={() =>
                  router.push(`/tenant/browse/listing-detail/${listing.id}`)
                }
              >
                <Image
                  source={{ uri: listing.images[0] }}
                  style={styles.browseImage}
                />
                <View style={styles.browseDetails}>
                  <ThemedText style={styles.browseRoomNumber}>
                    {listing.roomNumber}
                  </ThemedText>
                  <ThemedText style={styles.browseRoomType}>
                    {listing.type}
                  </ThemedText>
                  <ThemedText style={styles.browseRent}>
                    ₱{listing.price?.toLocaleString()}/month
                  </ThemedText>
                  <View
                    style={[
                      styles.browseStatus,
                      {
                        backgroundColor: listing.available
                          ? "#34C75920"
                          : "#FF950020",
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.browseStatusText,
                        {
                          color: listing.available ? "#34C759" : "#FF9500",
                        },
                      ]}
                    >
                      {listing.available ? "Available" : "Occupied"}
                    </ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {browseListings.length === 0 && !loading && (
              <View style={styles.noRoomsContainer}>
                <Ionicons
                  name="home-outline"
                  size={48}
                  color={colors.text}
                  style={{ opacity: 0.3 }}
                />
                <ThemedText style={styles.noRoomsText}>
                  No available rooms at the moment
                </ThemedText>
                <ThemedText style={styles.noRoomsSubtext}>
                  Check back later for new listings
                </ThemedText>
              </View>
            )}
          </ScrollView>
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
              onPress={() => router.push("/tenant/payments/payment-history")}
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
  propertyName: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 2,
  },
  notificationButton: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  greetingSection: {
    flex: 1,
  },
  dueSection: {
    padding: 16,
    paddingTop: 0,
  },
  dueCard: {
    padding: 16,
    borderRadius: 12,
  },
  dueInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dueAmount: {
    flex: 1,
  },
  dueLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  dueValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF9500",
    marginBottom: 4,
  },
  dueDays: {
    fontSize: 14,
    opacity: 0.8,
  },
  quickPayButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 6,
  },
  quickPayText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  activeRoomSection: {
    padding: 16,
  },
  activeRoomCard: {
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    gap: 16,
  },
  roomImageContainer: {
    position: "relative",
  },
  roomImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
  },
  roomBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roomBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  roomDetails: {
    flex: 1,
    gap: 8,
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  roomRent: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
  },
  landlordInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  landlordName: {
    fontSize: 14,
    flex: 1,
  },
  contactButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: "#007AFF20",
  },
  lastBillInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  lastBillText: {
    fontSize: 12,
    opacity: 0.8,
  },
  browseSection: {
    padding: 16,
  },
  browseCarousel: {
    marginHorizontal: -16,
  },
  browseContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  browseCard: {
    width: 160,
    borderRadius: 12,
    overflow: "hidden",
  },
  browseImage: {
    width: "100%",
    height: 100,
  },
  browseDetails: {
    padding: 12,
  },
  browseRoomNumber: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  browseRoomType: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  browseRent: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 8,
  },
  browseStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  browseStatusText: {
    fontSize: 10,
    fontWeight: "600",
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
  noRoomsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    width: width - 32,
  },
  noRoomsText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },
  noRoomsSubtext: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
    textAlign: "center",
  },
});
