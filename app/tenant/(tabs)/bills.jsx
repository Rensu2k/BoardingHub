import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StatusChip, TenantHeader } from "@/components/tenant";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { usePullRefresh } from "@/hooks/usePullRefresh";

export default function Bills() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    property: "all",
    year: "all",
    status: "all",
  });
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Mock bills data - replace with real API data
  const allBills = [
    {
      id: 1,
      invoiceId: "INV-2024-001",
      month: "January 2024",
      amount: 4500,
      dueDate: "2024-01-15",
      status: "overdue",
      property: "Sunshine Apartments",
      room: "A-101",
      year: "2024",
    },
    {
      id: 2,
      invoiceId: "INV-2024-002",
      month: "February 2024",
      amount: 4500,
      dueDate: "2024-02-15",
      status: "due",
      property: "Sunshine Apartments",
      room: "A-101",
      year: "2024",
    },
    {
      id: 3,
      invoiceId: "INV-2024-003",
      month: "March 2024",
      amount: 4500,
      dueDate: "2024-03-15",
      status: "upcoming",
      property: "Sunshine Apartments",
      room: "A-101",
      year: "2024",
    },
    {
      id: 4,
      invoiceId: "INV-2023-012",
      month: "December 2023",
      amount: 4500,
      dueDate: "2023-12-15",
      status: "paid",
      property: "Sunshine Apartments",
      room: "A-101",
      paidDate: "2023-12-10",
      year: "2023",
    },
    {
      id: 5,
      invoiceId: "INV-2024-004",
      month: "April 2024",
      amount: 4500,
      dueDate: "2024-04-15",
      status: "upcoming",
      property: "Green Valley Residences",
      room: "B-205",
      year: "2024",
    },
    {
      id: 6,
      invoiceId: "INV-2024-005",
      month: "January 2024",
      amount: 6500,
      dueDate: "2024-01-10",
      status: "overdue",
      property: "Green Valley Residences",
      room: "B-205",
      year: "2024",
    },
  ];

  // Filter and search bills
  const filteredBills = useMemo(() => {
    let filtered = allBills;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((bill) =>
        bill.invoiceId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply property filter
    if (selectedFilters.property !== "all") {
      filtered = filtered.filter(
        (bill) => bill.property === selectedFilters.property
      );
    }

    // Apply year filter
    if (selectedFilters.year !== "all") {
      filtered = filtered.filter((bill) => bill.year === selectedFilters.year);
    }

    // Apply status filter
    if (selectedFilters.status !== "all") {
      filtered = filtered.filter(
        (bill) => bill.status === selectedFilters.status
      );
    }

    return filtered;
  }, [allBills, searchQuery, selectedFilters]);

  // Group bills by status with priority order
  const groupedBills = useMemo(() => {
    const groups = {
      overdue: [],
      due: [],
      upcoming: [],
      paid: [],
    };

    filteredBills.forEach((bill) => {
      if (groups[bill.status]) {
        groups[bill.status].push(bill);
      }
    });

    // Sort each group by due date
    Object.keys(groups).forEach((status) => {
      groups[status].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    });

    // Convert to section list format, only include sections with data
    const sections = [];

    if (groups.overdue.length > 0) {
      sections.push({
        title: "Overdue",
        data: groups.overdue,
        status: "overdue",
      });
    }
    if (groups.due.length > 0) {
      sections.push({ title: "Due Now", data: groups.due, status: "due" });
    }
    if (groups.upcoming.length > 0) {
      sections.push({
        title: "Upcoming",
        data: groups.upcoming,
        status: "upcoming",
      });
    }
    if (groups.paid.length > 0) {
      sections.push({ title: "Paid", data: groups.paid, status: "paid" });
    }

    return sections;
  }, [filteredBills]);

  const refreshBills = async () => {
    console.log("Refreshing bills...");
    // Simulate API call
  };

  const { refreshing, onRefresh } = usePullRefresh(refreshBills);

  // Memoized handlers
  const handlePropertyChange = useCallback((property) => {
    setSelectedFilters((prev) => ({ ...prev, property }));
  }, []);

  const handleYearChange = useCallback((year) => {
    setSelectedFilters((prev) => ({ ...prev, year }));
  }, []);

  const handleStatusChange = useCallback((status) => {
    setSelectedFilters((prev) => ({ ...prev, status }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedFilters({
      property: "all",
      year: "all",
      status: "all",
    });
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowFilters(false);
  }, []);

  const handleUploadProof = useCallback((bill) => {
    Alert.alert(
      "Upload Payment Proof",
      `Upload proof of payment for ${bill.invoiceId}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Upload",
          onPress: () => Alert.alert("Success", "Photo upload coming soon!"),
        },
      ]
    );
  }, []);

  const handleViewDetails = useCallback(
    (bill) => {
      // Navigate to bill detail screen
      router.push(`/tenant/payments/bill-detail/${bill.id}`);
    },
    [router]
  );

  const handleBillPress = useCallback(
    (bill) => {
      // Navigate to bill detail screen
      router.push(`/tenant/payments/bill-detail/${bill.id}`);
    },
    [router]
  );

  const renderBillCard = ({ item: bill }) => (
    <TouchableOpacity
      style={[styles.billCard, { backgroundColor: colors.card }]}
      onPress={() => handleBillPress(bill)}
      activeOpacity={0.7}
    >
      <View style={styles.billHeader}>
        <View style={styles.billInfo}>
          <ThemedText style={styles.invoiceId}>{bill.invoiceId}</ThemedText>
          <ThemedText style={styles.month}>{bill.month}</ThemedText>
          <ThemedText style={styles.property}>
            {bill.property} • {bill.room}
          </ThemedText>
        </View>
        <View style={styles.amountSection}>
          <ThemedText style={styles.amount}>
            ₱{bill.amount.toLocaleString()}
          </ThemedText>
          <StatusChip status={bill.status} />
        </View>
      </View>

      <View style={styles.billFooter}>
        <ThemedText style={styles.dueDate}>
          Due: {new Date(bill.dueDate).toLocaleDateString()}
          {bill.paidDate &&
            ` • Paid: ${new Date(bill.paidDate).toLocaleDateString()}`}
        </ThemedText>
        <View style={styles.actions}>
          {bill.status !== "paid" && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.tint + "20" },
              ]}
              onPress={(e) => {
                e.stopPropagation();
                handleUploadProof(bill);
              }}
            >
              <Ionicons
                name="cloud-upload-outline"
                size={16}
                color={colors.tint}
              />
              <ThemedText style={[styles.actionText, { color: colors.tint }]}>
                Upload Proof
              </ThemedText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.text + "10" },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              handleViewDetails(bill);
            }}
          >
            <Ionicons name="eye-outline" size={16} color={colors.text} />
            <ThemedText style={[styles.actionText, { color: colors.text }]}>
              View Details
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }) => (
    <View
      style={[styles.sectionHeader, { backgroundColor: colors.background }]}
    >
      <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
      <View style={styles.sectionBadge}>
        <ThemedText style={styles.sectionCount}>
          {section.data.length}
        </ThemedText>
      </View>
    </View>
  );

  // Get unique properties and years for filter options
  const filterOptions = useMemo(() => {
    const properties = [...new Set(allBills.map((bill) => bill.property))];
    const years = [...new Set(allBills.map((bill) => bill.year))];
    return { properties, years };
  }, [allBills]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <TenantHeader title="My Bills" />

      {/* Search & Filter Bar */}
      <ThemedView style={styles.searchSection}>
        <View style={styles.searchBar}>
          <View style={[styles.searchInput, { backgroundColor: colors.card }]}>
            <Ionicons
              name="search"
              size={20}
              color={colors.text}
              style={{ opacity: 0.5 }}
            />
            <TextInput
              style={[styles.searchText, { color: colors.text }]}
              placeholder="Search by invoice ID..."
              placeholderTextColor={colors.text + "50"}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: colors.tint }]}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="options" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Active Filters */}
        {(selectedFilters.property !== "all" ||
          selectedFilters.year !== "all" ||
          selectedFilters.status !== "all") && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.activeFilters}
          >
            {selectedFilters.property !== "all" && (
              <View
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.tint + "20" },
                ]}
              >
                <ThemedText
                  style={[styles.filterChipText, { color: colors.tint }]}
                >
                  {selectedFilters.property}
                </ThemedText>
              </View>
            )}
            {selectedFilters.year !== "all" && (
              <View
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.tint + "20" },
                ]}
              >
                <ThemedText
                  style={[styles.filterChipText, { color: colors.tint }]}
                >
                  {selectedFilters.year}
                </ThemedText>
              </View>
            )}
            {selectedFilters.status !== "all" && (
              <View
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.tint + "20" },
                ]}
              >
                <ThemedText
                  style={[styles.filterChipText, { color: colors.tint }]}
                >
                  {selectedFilters.status.charAt(0).toUpperCase() +
                    selectedFilters.status.slice(1)}
                </ThemedText>
              </View>
            )}
          </ScrollView>
        )}
      </ThemedView>

      {/* Bills List */}
      <SectionList
        sections={groupedBills}
        renderItem={renderBillCard}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id.toString()}
        style={styles.billsList}
        contentContainerStyle={styles.billsContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="receipt-outline"
              size={64}
              color={colors.text}
              style={{ opacity: 0.3 }}
            />
            <ThemedText style={styles.emptyTitle}>No Bills Found</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              {searchQuery ||
              Object.values(selectedFilters).some((f) => f !== "all")
                ? "Try adjusting your search or filters"
                : "Your bills will appear here when available"}
            </ThemedText>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      <BillsFilterModal
        visible={showFilters}
        onClose={handleCloseModal}
        selectedFilters={selectedFilters}
        onPropertyChange={handlePropertyChange}
        onYearChange={handleYearChange}
        onStatusChange={handleStatusChange}
        onClearFilters={handleClearFilters}
        filterOptions={filterOptions}
        colors={colors}
        resultCount={filteredBills.length}
      />
    </SafeAreaView>
  );
}

// Separate BillsFilterModal component to prevent re-renders
const BillsFilterModal = ({
  visible,
  onClose,
  selectedFilters,
  onPropertyChange,
  onYearChange,
  onStatusChange,
  onClearFilters,
  filterOptions,
  colors,
  resultCount,
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    presentationStyle="pageSheet"
    onRequestClose={onClose}
  >
    <SafeAreaView
      style={[styles.modalContainer, { backgroundColor: colors.background }]}
    >
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose}>
          <ThemedText style={[styles.modalAction, { color: colors.text }]}>
            Cancel
          </ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.modalTitle}>Filter Bills</ThemedText>
        <TouchableOpacity onPress={onClearFilters}>
          <ThemedText style={[styles.modalAction, { color: colors.tint }]}>
            Clear
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.filterContent}>
        {/* Property Filter */}
        <View style={styles.filterSection}>
          <ThemedText style={styles.filterTitle}>Property</ThemedText>
          {["all", ...filterOptions.properties].map((property) => (
            <TouchableOpacity
              key={property}
              style={styles.filterOption}
              onPress={() => onPropertyChange(property)}
            >
              <ThemedText style={styles.filterOptionText}>
                {property === "all" ? "All Properties" : property}
              </ThemedText>
              <Ionicons
                name={
                  selectedFilters.property === property
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={20}
                color={colors.tint}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Year Filter */}
        <View style={styles.filterSection}>
          <ThemedText style={styles.filterTitle}>Year</ThemedText>
          {["all", ...filterOptions.years].map((year) => (
            <TouchableOpacity
              key={year}
              style={styles.filterOption}
              onPress={() => onYearChange(year)}
            >
              <ThemedText style={styles.filterOptionText}>
                {year === "all" ? "All Years" : year}
              </ThemedText>
              <Ionicons
                name={
                  selectedFilters.year === year
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={20}
                color={colors.tint}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Status Filter */}
        <View style={styles.filterSection}>
          <ThemedText style={styles.filterTitle}>Status</ThemedText>
          {["all", "overdue", "due", "upcoming", "paid"].map((status) => (
            <TouchableOpacity
              key={status}
              style={styles.filterOption}
              onPress={() => onStatusChange(status)}
            >
              <ThemedText style={styles.filterOptionText}>
                {status === "all"
                  ? "All Statuses"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </ThemedText>
              <Ionicons
                name={
                  selectedFilters.status === status
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={20}
                color={colors.tint}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.modalFooter}>
        <TouchableOpacity
          style={[styles.applyButton, { backgroundColor: colors.tint }]}
          onPress={onClose}
        >
          <ThemedText style={styles.applyButtonText}>
            Apply Filters ({resultCount} results)
          </ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  </Modal>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchSection: {
    padding: 16,
  },
  searchBar: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchText: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeFilters: {
    flexDirection: "row",
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  billsList: {
    flex: 1,
  },
  billsContainer: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  sectionBadge: {
    backgroundColor: "#007AFF20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#007AFF",
  },
  billCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  billHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  billInfo: {
    flex: 1,
    marginRight: 16,
  },
  invoiceId: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  month: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 2,
  },
  property: {
    fontSize: 12,
    opacity: 0.6,
  },
  amountSection: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  billFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dueDate: {
    fontSize: 12,
    opacity: 0.6,
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  actionText: {
    fontSize: 11,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalAction: {
    fontSize: 16,
    fontWeight: "500",
  },
  filterContent: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  filterOptionText: {
    fontSize: 16,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
  },
  applyButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
