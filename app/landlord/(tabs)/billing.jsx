import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

const { width } = Dimensions.get("window");

export default function BillingScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [propertyFilter, setPropertyFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Mock pending proofs count - replace with Firebase data later
  const pendingProofsCount = 4;

  // Mock data - replace with Firebase data later
  const allBills = [
    {
      id: "1",
      tenantName: "Juan Dela Cruz",
      amount: 2800,
      dueDate: "2024-02-15",
      status: "overdue",
      invoiceId: "INV-2024-001",
      property: "Sunset Apartments",
      room: "101",
      tenantId: "t1",
    },
    {
      id: "2",
      tenantName: "Maria Santos",
      amount: 2800,
      dueDate: "2024-02-20",
      status: "pending",
      invoiceId: "INV-2024-002",
      property: "Sunset Apartments",
      room: "205",
      tenantId: "t2",
    },
    {
      id: "3",
      tenantName: "Pedro Reyes",
      amount: 2800,
      dueDate: "2024-02-10",
      status: "paid",
      invoiceId: "INV-2024-003",
      property: "Garden Villas",
      room: "103",
      tenantId: "t3",
    },
    {
      id: "4",
      tenantName: "Elena Rodriguez",
      amount: 3200,
      dueDate: "2024-02-25",
      status: "pending",
      invoiceId: "INV-2024-004",
      property: "City Center Rooms",
      room: "103",
      tenantId: "t4",
    },
    {
      id: "5",
      tenantName: "Carlos Mendoza",
      amount: 2800,
      dueDate: "2024-02-05",
      status: "paid",
      invoiceId: "INV-2024-005",
      property: "Sunset Apartments",
      room: "102",
      tenantId: "t5",
    },
  ];

  // Get unique properties for filter
  const properties = ["All", ...new Set(allBills.map((bill) => bill.property))];

  // Filter and search bills
  const filteredBills = allBills.filter((bill) => {
    const matchesSearch =
      bill.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.room.includes(searchQuery);
    const matchesStatus =
      statusFilter === "All" || bill.status === statusFilter.toLowerCase();
    const matchesProperty =
      propertyFilter === "All" || bill.property === propertyFilter;
    return matchesSearch && matchesStatus && matchesProperty;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return { bg: "#34C75920", text: "#34C759" };
      case "pending":
        return { bg: "#FF950020", text: "#FF9500" };
      case "overdue":
        return { bg: "#FF3B3020", text: "#FF3B30" };
      default:
        return { bg: colors.card, text: colors.text };
    }
  };

  const handleBillAction = (bill, action) => {
    switch (action) {
      case "view":
        router.push(`/landlord/billing/invoice/${bill.id}`);
        break;
      case "mark-paid":
        Alert.alert("Mark as Paid", `Mark ${bill.invoiceId} as paid?`, [
          { text: "Cancel", style: "cancel" },
          {
            text: "Mark Paid",
            onPress: () => Alert.alert("Success", "Bill marked as paid!"),
          },
        ]);
        break;
      case "view-proofs":
        Alert.alert(
          "View Proofs",
          `View payment proofs for ${bill.invoiceId}?`
        );
        break;
    }
  };

  const BillRow = ({ bill }) => {
    const statusColors = getStatusColor(bill.status);

    return (
      <TouchableOpacity
        style={[styles.billRow, { backgroundColor: colors.card }]}
        onPress={() => handleBillAction(bill, "view")}
      >
        <View style={styles.billInfo}>
          <ThemedText style={styles.tenantName}>{bill.tenantName}</ThemedText>
          <ThemedText style={styles.propertyInfo}>
            {bill.property} • Room {bill.room}
          </ThemedText>
          <ThemedText style={styles.invoiceId}>{bill.invoiceId}</ThemedText>
        </View>

        <View style={styles.billDetails}>
          <ThemedText style={styles.amount}>
            ₱{bill.amount.toLocaleString()}
          </ThemedText>
          <ThemedText style={styles.dueDate}>Due: {bill.dueDate}</ThemedText>

          <View
            style={[styles.statusChip, { backgroundColor: statusColors.bg }]}
          >
            <ThemedText
              style={[styles.statusText, { color: statusColors.text }]}
            >
              {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: "#007AFF20" }]}
            onPress={() => handleBillAction(bill, "view")}
          >
            <Ionicons name="eye-outline" size={16} color="#007AFF" />
          </TouchableOpacity>

          {bill.status !== "paid" && (
            <TouchableOpacity
              style={[
                styles.quickActionButton,
                { backgroundColor: "#34C75920" },
              ]}
              onPress={() => handleBillAction(bill, "mark-paid")}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color="#34C759"
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: "#FF950020" }]}
            onPress={() => handleBillAction(bill, "view-proofs")}
          >
            <Ionicons name="document-outline" size={16} color="#FF9500" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Billing</ThemedText>
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

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.text + "60"}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by tenant or invoice ID..."
            placeholderTextColor={colors.text + "60"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.text + "60"}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Property Filter */}
        <View style={styles.propertyFilter}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.propertyFilterButtons}>
              {properties.map((property) => (
                <TouchableOpacity
                  key={property}
                  style={[
                    styles.propertyFilterButton,
                    {
                      backgroundColor:
                        propertyFilter === property ? colors.tint : colors.card,
                    },
                  ]}
                  onPress={() => setPropertyFilter(property)}
                >
                  <ThemedText
                    style={[
                      styles.propertyFilterText,
                      {
                        color:
                          propertyFilter === property ? "white" : colors.text,
                      },
                    ]}
                  >
                    {property}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </ThemedView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {["All", "Pending", "Paid", "Overdue"].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                {
                  backgroundColor: filter === "All" ? colors.tint : colors.card,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.filterTabText,
                  { color: filter === "All" ? "white" : colors.text },
                ]}
              >
                {filter}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.card }]}
            onPress={() => router.push("/landlord/billing/select-property")}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: colors.tint + "20" },
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={24}
                color={colors.tint}
              />
            </View>
            <ThemedText style={styles.actionTitle}>Generate Bills</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.card }]}
            onPress={() => router.push("/landlord/payment-proofs")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#34C75920" }]}>
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color="#34C759"
              />
              {pendingProofsCount > 0 && (
                <View style={styles.badge}>
                  <ThemedText style={styles.badgeText}>
                    {pendingProofsCount}
                  </ThemedText>
                </View>
              )}
            </View>
            <ThemedText style={styles.actionTitle}>Review Proofs</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Bills List */}
        <ThemedView style={styles.billsSection}>
          <View style={styles.billsList}>
            {filteredBills.map((bill) => (
              <BillRow key={bill.id} bill={bill} />
            ))}
          </View>
        </ThemedView>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={() =>
          Alert.alert("Coming Soon", "Create bill flow coming soon!")
        }
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
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
    marginBottom: 16,
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    fontSize: 16,
    flex: 1,
    paddingVertical: 0,
  },
  propertyFilter: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  propertyFilterButtons: {
    flexDirection: "row",
    gap: 8,
  },
  propertyFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  propertyFilterText: {
    fontSize: 14,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  filterTabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 20,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  billsSection: {
    paddingHorizontal: 20,
  },
  billsList: {
    gap: 12,
  },
  billRow: {
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
  billInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  propertyInfo: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  invoiceId: {
    fontSize: 12,
    opacity: 0.6,
  },
  billDetails: {
    alignItems: "flex-end",
    marginRight: 12,
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  quickActions: {
    flexDirection: "row",
    gap: 6,
  },
  quickActionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
