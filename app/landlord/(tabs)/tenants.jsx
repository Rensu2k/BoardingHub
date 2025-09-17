import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
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
import {
  assignTenantToRoom,
  checkOutTenant,
  filterTenantsByStatus,
  getAllRegisteredTenants,
  getTenantStatistics,
  searchTenants,
  updateTenantStatus,
} from "@/utils/tenantHelpers";

const { width } = Dimensions.get("window");

export default function TenantsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [allTenants, setAllTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Load tenants data
  const loadTenants = async () => {
    try {
      setLoading(true);
      const tenants = await getAllRegisteredTenants();
      setAllTenants(tenants);
    } catch (error) {
      console.error("Error loading tenants:", error);
      Alert.alert("Error", "Failed to load tenants. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Refresh function to reload tenants data
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadTenants();
    } catch (error) {
      console.error("Error refreshing tenants:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Load tenants when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadTenants();
    }, [])
  );

  // Filter and sort tenants
  const searchedTenants = searchTenants(allTenants, searchQuery);
  const filteredTenants = filterTenantsByStatus(searchedTenants, statusFilter);
  const statistics = getTenantStatistics(allTenants);

  const statusCounts = {
    all: statistics.total,
    active: statistics.active,
    overdue: statistics.overdue,
    movingOut: statistics.movingOut,
    registered: statistics.registered,
  };

  const handleTenantAction = async (tenant, action) => {
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
        Alert.alert("Check-out", `Process check-out for ${tenant.name}?`, [
          { text: "Cancel", style: "cancel" },
          {
            text: "Check-out",
            style: "destructive",
            onPress: async () => {
              try {
                await checkOutTenant(tenant.id);
                await loadTenants(); // Refresh the list
                Alert.alert("Success", `${tenant.name} has been checked out and room status updated.`);
              } catch (error) {
                console.error("Checkout error:", error);
                Alert.alert("Error", "Failed to check out tenant.");
              }
            },
          },
        ]);
        break;
      case "assign":
        // Show room assignment dialog
        Alert.prompt(
          "Assign Room",
          `Assign ${tenant.name} to room:`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Assign",
              onPress: async (roomNumber) => {
                if (roomNumber && roomNumber.trim()) {
                  try {
                    await assignTenantToRoom(tenant.id, roomNumber.trim(), {
                      leaseStart: new Date().toISOString(),
                      leaseEnd: new Date(
                        Date.now() + 365 * 24 * 60 * 60 * 1000
                      ).toISOString(), // 1 year lease
                    });
                    await loadTenants(); // Refresh the list
                    Alert.alert(
                      "Success",
                      `${tenant.name} has been assigned to room ${roomNumber}.`
                    );
                  } catch (error) {
                    Alert.alert("Error", "Failed to assign tenant to room.");
                  }
                }
              },
            },
          ],
          "plain-text",
          "",
          "numeric"
        );
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
            {tenant.roomNumber
              ? `Room ${tenant.roomNumber}`
              : "No room assigned"}
          </ThemedText>
          <ThemedText style={styles.phoneNumber}>{tenant.phone}</ThemedText>
        </View>
        {tenant.preferredRoomType && (
          <ThemedText style={styles.preferredRoom}>
            Prefers: {tenant.preferredRoomType}
          </ThemedText>
        )}
      </View>

      <View style={styles.tenantActions}>
        {/* Status Chip */}
        <View
          style={[
            styles.statusChip,
            {
              backgroundColor:
                tenant.status === "registered"
                  ? "#007AFF20"
                  : tenant.status === "active"
                  ? "#34C75920"
                  : tenant.status === "overdue"
                  ? "#FF950020"
                  : tenant.status === "moving-out"
                  ? "#FF3B3020"
                  : "#8E8E9320",
            },
          ]}
        >
          <ThemedText
            style={[
              styles.statusText,
              {
                color:
                  tenant.status === "registered"
                    ? "#007AFF"
                    : tenant.status === "active"
                    ? "#34C759"
                    : tenant.status === "overdue"
                    ? "#FF9500"
                    : tenant.status === "moving-out"
                    ? "#FF3B30"
                    : "#8E8E93",
              },
            ]}
          >
            {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
          </ThemedText>
        </View>

        {/* Balance (only show if assigned to room) */}
        {tenant.roomNumber && (
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
        )}

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: "#007AFF20" }]}
            onPress={() => handleTenantAction(tenant, "message")}
          >
            <Ionicons name="chatbubble-outline" size={16} color="#007AFF" />
          </TouchableOpacity>

          {tenant.status === "registered" ? (
            <TouchableOpacity
              style={[
                styles.quickActionButton,
                { backgroundColor: "#34C75920" },
              ]}
              onPress={() => handleTenantAction(tenant, "assign")}
            >
              <Ionicons name="home-outline" size={16} color="#34C759" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.quickActionButton,
                { backgroundColor: "#34C75920" },
              ]}
              onPress={() => handleTenantAction(tenant, "payments")}
            >
              <Ionicons name="card-outline" size={16} color="#34C759" />
            </TouchableOpacity>
          )}

          {tenant.status === "active" && (
            <TouchableOpacity
              style={[
                styles.quickActionButton,
                { backgroundColor: "#FF950020" },
              ]}
              onPress={() => handleTenantAction(tenant, "checkout")}
            >
              <Ionicons name="log-out-outline" size={16} color="#FF9500" />
            </TouchableOpacity>
          )}
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
            {
              key: "Registered",
              label: "Registered",
              count: statusCounts.registered,
            },
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
    paddingBottom: 20,
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
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  preferredRoom: {
    fontSize: 12,
    opacity: 0.7,
    fontStyle: "italic",
    marginTop: 2,
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
});
