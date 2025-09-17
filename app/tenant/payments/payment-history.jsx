import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  SectionList,
  Share,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TenantHeader } from "@/components/tenant";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { usePullRefresh } from "@/hooks/usePullRefresh";
import { generateReceiptPDF } from "@/utils/receiptGenerator";

export default function PaymentHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedYear, setSelectedYear] = useState("all");
  const [downloadingReceipt, setDownloadingReceipt] = useState(null);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Mock payment history data - replace with real API data
  const allPayments = [
    {
      id: 1,
      invoiceId: "INV-2023-012",
      receiptId: "RCP-2023-012",
      month: "December 2023",
      amount: 4500,
      paymentDate: "2023-12-10",
      dueDate: "2023-12-15",
      property: "Sunshine Apartments",
      room: "A-101",
      year: "2023",
      status: "approved",
      paymentMethod: "Bank Transfer",
      breakdown: [
        { item: "Monthly Rent", amount: 4000 },
        { item: "Maintenance Fee", amount: 300 },
        { item: "Utilities", amount: 200 },
      ],
      landlord: {
        name: "Ms. Maria Santos",
        email: "maria.santos@email.com",
        phone: "+63 912 345 6789",
      },
      approvedDate: "2023-12-11",
      notes: "Payment received and verified.",
    },
    {
      id: 2,
      invoiceId: "INV-2023-011",
      receiptId: "RCP-2023-011",
      month: "November 2023",
      amount: 4500,
      paymentDate: "2023-11-12",
      dueDate: "2023-11-15",
      property: "Sunshine Apartments",
      room: "A-101",
      year: "2023",
      status: "approved",
      paymentMethod: "GCash",
      breakdown: [
        { item: "Monthly Rent", amount: 4000 },
        { item: "Maintenance Fee", amount: 300 },
        { item: "Utilities", amount: 200 },
      ],
      landlord: {
        name: "Ms. Maria Santos",
        email: "maria.santos@email.com",
        phone: "+63 912 345 6789",
      },
      approvedDate: "2023-11-13",
      notes: "Payment confirmed via GCash.",
    },
    {
      id: 3,
      invoiceId: "INV-2023-010",
      receiptId: "RCP-2023-010",
      month: "October 2023",
      amount: 4500,
      paymentDate: "2023-10-14",
      dueDate: "2023-10-15",
      property: "Sunshine Apartments",
      room: "A-101",
      year: "2023",
      status: "approved",
      paymentMethod: "Cash",
      breakdown: [
        { item: "Monthly Rent", amount: 4000 },
        { item: "Maintenance Fee", amount: 300 },
        { item: "Utilities", amount: 200 },
      ],
      landlord: {
        name: "Ms. Maria Santos",
        email: "maria.santos@email.com",
        phone: "+63 912 345 6789",
      },
      approvedDate: "2023-10-14",
      notes: "Cash payment received at office.",
    },
    {
      id: 4,
      invoiceId: "INV-2024-001",
      receiptId: "RCP-2024-001",
      month: "January 2024",
      amount: 4500,
      paymentDate: "2024-01-10",
      dueDate: "2024-01-15",
      property: "Sunshine Apartments",
      room: "A-101",
      year: "2024",
      status: "approved",
      paymentMethod: "Bank Transfer",
      breakdown: [
        { item: "Monthly Rent", amount: 4000 },
        { item: "Maintenance Fee", amount: 300 },
        { item: "Utilities", amount: 200 },
      ],
      landlord: {
        name: "Ms. Maria Santos",
        email: "maria.santos@email.com",
        phone: "+63 912 345 6789",
      },
      approvedDate: "2024-01-11",
      notes: "Payment processed successfully.",
    },
    {
      id: 5,
      invoiceId: "INV-2023-009",
      receiptId: "RCP-2023-009",
      month: "September 2023",
      amount: 4500,
      paymentDate: "2023-09-08",
      dueDate: "2023-09-15",
      property: "Sunshine Apartments",
      room: "A-101",
      year: "2023",
      status: "approved",
      paymentMethod: "Bank Transfer",
      breakdown: [
        { item: "Monthly Rent", amount: 4000 },
        { item: "Maintenance Fee", amount: 300 },
        { item: "Utilities", amount: 200 },
      ],
      landlord: {
        name: "Ms. Maria Santos",
        email: "maria.santos@email.com",
        phone: "+63 912 345 6789",
      },
      approvedDate: "2023-09-09",
      notes: "Early payment discount applied.",
    },
    {
      id: 6,
      invoiceId: "INV-2024-002",
      receiptId: "RCP-2024-002",
      month: "February 2024",
      amount: 4500,
      paymentDate: "2024-02-12",
      dueDate: "2024-02-15",
      property: "Sunshine Apartments",
      room: "A-101",
      year: "2024",
      status: "approved",
      paymentMethod: "GCash",
      breakdown: [
        { item: "Monthly Rent", amount: 4000 },
        { item: "Maintenance Fee", amount: 300 },
        { item: "Utilities", amount: 200 },
      ],
      landlord: {
        name: "Ms. Maria Santos",
        email: "maria.santos@email.com",
        phone: "+63 912 345 6789",
      },
      approvedDate: "2024-02-13",
      notes: "Payment verified and approved.",
    },
  ];

  // Filter and search payments
  const filteredPayments = useMemo(() => {
    let filtered = allPayments;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (payment) =>
          payment.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payment.receiptId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payment.month.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply year filter
    if (selectedYear !== "all") {
      filtered = filtered.filter((payment) => payment.year === selectedYear);
    }

    return filtered;
  }, [allPayments, searchQuery, selectedYear]);

  // Group payments by year
  const groupedPayments = useMemo(() => {
    const groups = {};

    filteredPayments.forEach((payment) => {
      if (!groups[payment.year]) {
        groups[payment.year] = [];
      }
      groups[payment.year].push(payment);
    });

    // Sort each group by payment date (newest first)
    Object.keys(groups).forEach((year) => {
      groups[year].sort(
        (a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)
      );
    });

    // Convert to section list format
    const sections = Object.keys(groups)
      .sort((a, b) => b - a) // Sort years descending
      .map((year) => ({
        title: year,
        data: groups[year],
      }));

    return sections;
  }, [filteredPayments]);

  const refreshPayments = async () => {
    console.log("Refreshing payment history...");
    // Simulate API call
  };

  const { refreshing, onRefresh } = usePullRefresh(refreshPayments);

  const handleDownloadReceipt = useCallback(async (payment) => {
    setDownloadingReceipt(payment.id);

    try {
      // Generate PDF receipt
      const pdfUri = await generateReceiptPDF(payment);

      // Share the PDF
      await Share.share({
        url: pdfUri,
        title: `Receipt ${payment.receiptId}`,
        message: `Receipt for ${payment.month} - ${payment.property}`,
      });
    } catch (error) {
      console.error("Error generating receipt:", error);
      Alert.alert(
        "Download Failed",
        "There was an error generating your receipt. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setDownloadingReceipt(null);
    }
  }, []);

  const handleViewInvoice = useCallback(
    (payment) => {
      // Navigate to the original bill detail page
      const billId = payment.id; // In real app, you'd map invoice ID to bill ID
      router.push(`/tenant/payments/bill-detail/${billId}`);
    },
    [router]
  );

  const handlePaymentPress = useCallback(
    (payment) => {
      // Show payment details modal or navigate to detail view
      Alert.alert(
        "Payment Details",
        `Receipt: ${payment.receiptId}\nPaid: ${new Date(
          payment.paymentDate
        ).toLocaleDateString()}\nMethod: ${
          payment.paymentMethod
        }\nAmount: ₱${payment.amount.toLocaleString()}`,
        [
          { text: "Close", style: "cancel" },
          {
            text: "View Invoice",
            onPress: () => handleViewInvoice(payment),
          },
          {
            text: "Download Receipt",
            onPress: () => handleDownloadReceipt(payment),
          },
        ]
      );
    },
    [handleViewInvoice, handleDownloadReceipt]
  );

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "Bank Transfer":
        return "card-outline";
      case "GCash":
        return "phone-portrait-outline";
      case "Cash":
        return "cash-outline";
      default:
        return "wallet-outline";
    }
  };

  const renderPaymentCard = ({ item: payment }) => (
    <TouchableOpacity
      style={[styles.paymentCard, { backgroundColor: colors.card }]}
      onPress={() => handlePaymentPress(payment)}
      activeOpacity={0.7}
    >
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <View style={styles.paymentTitleRow}>
            <ThemedText style={styles.receiptId}>
              {payment.receiptId}
            </ThemedText>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: "#34C759" + "20" },
              ]}
            >
              <Ionicons name="checkmark-circle" size={12} color="#34C759" />
              <ThemedText style={[styles.statusText, { color: "#34C759" }]}>
                Approved
              </ThemedText>
            </View>
          </View>

          <ThemedText style={styles.month}>{payment.month}</ThemedText>
          <ThemedText style={styles.property}>
            {payment.property} • {payment.room}
          </ThemedText>

          <View style={styles.paymentDetails}>
            <View style={styles.paymentMethod}>
              <Ionicons
                name={getPaymentMethodIcon(payment.paymentMethod)}
                size={14}
                color={colors.text}
                style={{ opacity: 0.7 }}
              />
              <ThemedText style={styles.paymentMethodText}>
                {payment.paymentMethod}
              </ThemedText>
            </View>
            <ThemedText style={styles.paymentDate}>
              Paid: {new Date(payment.paymentDate).toLocaleDateString()}
            </ThemedText>
          </View>
        </View>

        <View style={styles.amountSection}>
          <ThemedText style={styles.amount}>
            ₱{payment.amount.toLocaleString()}
          </ThemedText>
        </View>
      </View>

      <View style={styles.paymentFooter}>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.text + "10" },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              handleViewInvoice(payment);
            }}
          >
            <Ionicons
              name="document-text-outline"
              size={16}
              color={colors.text}
            />
            <ThemedText style={[styles.actionText, { color: colors.text }]}>
              View Invoice
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.tint + "20" },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              handleDownloadReceipt(payment);
            }}
            disabled={downloadingReceipt === payment.id}
          >
            {downloadingReceipt === payment.id ? (
              <>
                <Ionicons name="refresh" size={16} color={colors.tint} />
                <ThemedText style={[styles.actionText, { color: colors.tint }]}>
                  Generating...
                </ThemedText>
              </>
            ) : (
              <>
                <Ionicons
                  name="download-outline"
                  size={16}
                  color={colors.tint}
                />
                <ThemedText style={[styles.actionText, { color: colors.tint }]}>
                  Download Receipt
                </ThemedText>
              </>
            )}
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
          {section.data.length} payments
        </ThemedText>
      </View>
    </View>
  );

  // Get unique years for filter options
  const availableYears = useMemo(() => {
    return [...new Set(allPayments.map((payment) => payment.year))].sort(
      (a, b) => b - a
    );
  }, [allPayments]);

  const totalAmount = useMemo(() => {
    return filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  }, [filteredPayments]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <TenantHeader
        title="Payment History"
        rightComponent={
          <TouchableOpacity onPress={() => setShowFilters(true)}>
            <Ionicons name="options-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />

      {/* Search & Summary Bar */}
      <ThemedView style={styles.searchSection}>
        <View style={[styles.searchInput, { backgroundColor: colors.card }]}>
          <Ionicons
            name="search"
            size={20}
            color={colors.text}
            style={{ opacity: 0.5 }}
          />
          <TextInput
            style={[styles.searchText, { color: colors.text }]}
            placeholder="Search receipts, invoices..."
            placeholderTextColor={colors.text + "50"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryLabel}>Total Payments</ThemedText>
            <ThemedText style={styles.summaryValue}>
              {filteredPayments.length}
            </ThemedText>
          </View>
          <View style={styles.summarySeparator} />
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryLabel}>Total Amount</ThemedText>
            <ThemedText style={styles.summaryValue}>
              ₱{totalAmount.toLocaleString()}
            </ThemedText>
          </View>
        </View>

        {/* Active Filters */}
        {selectedYear !== "all" && (
          <View style={styles.activeFilters}>
            <View
              style={[
                styles.filterChip,
                { backgroundColor: colors.tint + "20" },
              ]}
            >
              <ThemedText
                style={[styles.filterChipText, { color: colors.tint }]}
              >
                {selectedYear}
              </ThemedText>
              <TouchableOpacity
                onPress={() => setSelectedYear("all")}
                style={styles.filterChipRemove}
              >
                <Ionicons name="close" size={14} color={colors.tint} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ThemedView>

      {/* Payment History List */}
      <SectionList
        sections={groupedPayments}
        renderItem={renderPaymentCard}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id.toString()}
        style={styles.paymentsList}
        contentContainerStyle={styles.paymentsContainer}
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
            <ThemedText style={styles.emptyTitle}>
              No Payment History
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              {searchQuery || selectedYear !== "all"
                ? "Try adjusting your search or filters"
                : "Your payment history will appear here when payments are made"}
            </ThemedText>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilters(false)}
      >
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <ThemedText style={[styles.modalAction, { color: colors.text }]}>
                Cancel
              </ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>Filter by Year</ThemedText>
            <TouchableOpacity onPress={() => setSelectedYear("all")}>
              <ThemedText style={[styles.modalAction, { color: colors.tint }]}>
                Clear
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            <View style={styles.filterSection}>
              <ThemedText style={styles.filterTitle}>Year</ThemedText>
              {["all", ...availableYears].map((year) => (
                <TouchableOpacity
                  key={year}
                  style={styles.filterOption}
                  onPress={() => {
                    setSelectedYear(year);
                    setShowFilters(false);
                  }}
                >
                  <ThemedText style={styles.filterOptionText}>
                    {year === "all" ? "All Years" : year}
                  </ThemedText>
                  <Ionicons
                    name={
                      selectedYear === year
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
              onPress={() => setShowFilters(false)}
            >
              <ThemedText style={styles.applyButtonText}>
                Apply Filter ({filteredPayments.length} results)
              </ThemedText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchSection: {
    padding: 16,
    gap: 16,
  },
  searchInput: {
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
  summaryCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  summarySeparator: {
    width: 1,
    height: 30,
    backgroundColor: "#E5E5E7",
    marginHorizontal: 16,
  },
  activeFilters: {
    flexDirection: "row",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  filterChipRemove: {
    padding: 2,
  },
  paymentsList: {
    flex: 1,
  },
  paymentsContainer: {
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
  paymentCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
    marginRight: 16,
  },
  paymentTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  receiptId: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  month: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 2,
  },
  property: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 8,
  },
  paymentDetails: {
    gap: 4,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  paymentMethodText: {
    fontSize: 12,
    opacity: 0.7,
  },
  paymentDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  amountSection: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#34C759",
  },
  paymentFooter: {
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
    paddingTop: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionText: {
    fontSize: 12,
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
