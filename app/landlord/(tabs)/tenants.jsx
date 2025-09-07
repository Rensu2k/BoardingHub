import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  RefreshControl,
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

export default function TenantsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Refresh function to reload tenants data
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate fetching fresh data
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error refreshing tenants:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Mock data - replace with Firebase data later
  const allTenants = [
    {
      id: "1",
      name: "Anna Garcia",
      roomNumber: "101",
      phone: "+63 912 345 6789",
      avatar: null,
      status: "active",
      balance: 0,
      leaseStart: "2024-01-15",
      leaseEnd: "2024-12-15",
    },
    {
      id: "2",
      name: "Carlos Mendoza",
      roomNumber: "102",
      phone: "+63 917 654 3210",
      avatar: null,
      status: "overdue",
      balance: 2800,
      leaseStart: "2023-06-01",
      leaseEnd: "2024-06-01",
    },
    {
      id: "3",
      name: "Elena Rodriguez",
      roomNumber: "103",
      phone: "+63 918 123 4567",
      avatar: null,
      status: "active",
      balance: 0,
      leaseStart: "2024-02-01",
      leaseEnd: "2025-02-01",
    },
    {
      id: "4",
      name: "Jose Santos",
      roomNumber: "201",
      phone: "+63 919 876 5432",
      avatar: null,
      status: "moving-out",
      balance: 1400,
      leaseStart: "2023-08-15",
      leaseEnd: "2024-08-15",
    },
    {
      id: "5",
      name: "Maria Fernandez",
      roomNumber: "202",
      phone: "+63 920 111 2233",
      avatar: null,
      status: "active",
      balance: 0,
      leaseStart: "2024-03-01",
      leaseEnd: "2025-03-01",
    },
  ];

  // Filter and sort tenants
  const filteredTenants = allTenants
    .filter((tenant) => {
      const matchesSearch =
        tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.roomNumber.includes(searchQuery) ||
        tenant.phone.includes(searchQuery);
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && tenant.status === "active") ||
        (statusFilter === "Overdue" && tenant.status === "overdue") ||
        (statusFilter === "Moving Out" && tenant.status === "moving-out");
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const statusCounts = {
    all: allTenants.length,
    active: allTenants.filter((t) => t.status === "active").length,
    overdue: allTenants.filter((t) => t.status === "overdue").length,
    movingOut: allTenants.filter((t) => t.status === "moving-out").length,
  };

  const handleTenantAction = (tenant, action) => {
    switch (action) {
      case "message":
        Alert.alert("Message Tenant", `Send message to ${tenant.name}?`);
        break;
      case "payments":
        Alert.alert(
          "View Payments",
          `View payment history for ${tenant.name}?`
        );
        break;
      case "checkout":
        Alert.alert("Check-out", `Process check-out for ${tenant.name}?`);
        break;
    }
  };

  const TenantRow = ({ tenant }) => (
    <TouchableOpacity
      style={[styles.tenantRow, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/landlord/tenant-profile/${tenant.id}`)}
    >
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: colors.tint + "20" }]}>
        <Ionicons name="person-outline" size={24} color={colors.tint} />
      </View>

      <View style={styles.tenantInfo}>
        <ThemedText style={styles.tenantName}>{tenant.name}</ThemedText>
        <View style={styles.tenantDetails}>
          <ThemedText style={styles.roomNumber}>
            Room {tenant.roomNumber}
          </ThemedText>
          <ThemedText style={styles.phoneNumber}>{tenant.phone}</ThemedText>
        </View>
      </View>

      <View style={styles.tenantActions}>
        <View
          style={[
            styles.balanceChip,
            {
              backgroundColor:
                tenant.balance === 0
                  ? "#34C75920"
                  : tenant.balance > 0
                  ? "#FF950020"
                  : "#FF3B3020",
            },
          ]}
        >
          <ThemedText
            style={[
              styles.balanceText,
              {
                color:
                  tenant.balance === 0
                    ? "#34C759"
                    : tenant.balance > 0
                    ? "#FF9500"
                    : "#FF3B30",
              },
            ]}
          >
            ₱{tenant.balance.toLocaleString()}
          </ThemedText>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: "#007AFF20" }]}
            onPress={() => handleTenantAction(tenant, "message")}
          >
            <Ionicons name="chatbubble-outline" size={16} color="#007AFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: "#34C75920" }]}
            onPress={() => handleTenantAction(tenant, "payments")}
          >
            <Ionicons name="card-outline" size={16} color="#34C759" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: "#FF950020" }]}
            onPress={() => handleTenantAction(tenant, "checkout")}
          >
            <Ionicons name="log-out-outline" size={16} color="#FF9500" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Tenants</ThemedText>
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
            placeholder="Search tenants by name or room..."
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
      </ThemedView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
      >
        {/* Status Filter */}
        <View style={styles.filterTabs}>
          {[
            { key: "All", label: "All", count: statusCounts.all },
            { key: "Active", label: "Active", count: statusCounts.active },
            { key: "Overdue", label: "Overdue", count: statusCounts.overdue },
            {
              key: "Moving Out",
              label: "Moving Out",
              count: statusCounts.movingOut,
            },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                {
                  backgroundColor:
                    statusFilter === filter.key ? colors.tint : colors.card,
                },
              ]}
              onPress={() => setStatusFilter(filter.key)}
            >
              <ThemedText
                style={[
                  styles.filterTabText,
                  {
                    color: statusFilter === filter.key ? "white" : colors.text,
                  },
                ]}
              >
                {filter.label} ({filter.count})
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tenants List */}
        <ThemedView style={styles.tenantsSection}>
          <View style={styles.tenantsList}>
            {filteredTenants.map((tenant) => (
              <TenantRow key={tenant.id} tenant={tenant} />
            ))}

            {filteredTenants.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons
                  name="people-outline"
                  size={48}
                  color={colors.text + "40"}
                />
                <ThemedText style={styles.emptyStateText}>
                  {searchQuery
                    ? "No tenants found matching your search"
                    : "No tenants available"}
                </ThemedText>
              </View>
            )}
          </View>
        </ThemedView>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={() =>
          Alert.alert("Coming Soon", "Add Tenant flow coming soon!")
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
  tenantsSection: {
    paddingHorizontal: 20,
  },
  tenantsList: {
    gap: 12,
  },
  tenantRow: {
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  tenantDetails: {
    flexDirection: "row",
    gap: 12,
  },
  roomNumber: {
    fontSize: 14,
    opacity: 0.7,
  },
  phoneNumber: {
    fontSize: 14,
    opacity: 0.7,
  },
  tenantActions: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 8,
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
  balanceChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  balanceText: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 12,
    textAlign: "center",
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
