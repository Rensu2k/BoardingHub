import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

const { width } = Dimensions.get("window");

export default function InvoiceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Mock invoice data - replace with Firebase data later
  const invoice = {
    id: id,
    invoiceNumber: "INV-2024-001",
    tenantName: "Anna Garcia",
    tenantId: "t1",
    roomNumber: "101",
    property: "Sunset Apartments",
    propertyId: "p1",
    billingPeriod: "January 2024",
    issueDate: "2024-01-15",
    dueDate: "2024-02-15",
    status: "pending",
    totalAmount: 2800,
    paidAmount: 0,
    balance: 2800,
    lineItems: [
      {
        id: "1",
        description: "Monthly Rent",
        amount: 2800,
        category: "rent",
      },
    ],
    payments: [],
    notes: "Monthly rent for January 2024. Due by end of month.",
    createdBy: "Landlord",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  };

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return { bg: "#34C75920", text: "#34C759" };
      case "overdue":
        return { bg: "#FF3B3020", text: "#FF3B30" };
      case "pending":
        return { bg: "#FF950020", text: "#FF9500" };
      default:
        return { bg: colors.card, text: colors.text };
    }
  };

  const statusColors = getStatusColor(invoice.status);

  const handleMarkAsPaid = () => {
    Alert.alert(
      "Mark as Paid",
      `Mark invoice ${invoice.invoiceNumber} as paid?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark Paid",
          onPress: () => {
            Alert.alert("Success", "Invoice marked as paid!");
            // In real app, update invoice status
          },
        },
      ]
    );
  };

  const handleAddPayment = () => {
    Alert.alert("Add Payment", "Payment recording functionality coming soon!");
  };

  const handleDownloadPDF = () => {
    Alert.alert("Download PDF", "PDF download functionality coming soon!");
  };

  const handleSendReminder = () => {
    Alert.alert(
      "Send Reminder",
      `Send payment reminder to ${invoice.tenantName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Reminder",
          onPress: () => Alert.alert("Success", "Reminder sent!"),
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <ThemedText style={styles.invoiceNumber}>
            {invoice.invoiceNumber}
          </ThemedText>
          <ThemedText style={styles.tenantName}>
            {invoice.tenantName}
          </ThemedText>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={handleDownloadPDF}
          >
            <Ionicons name="download-outline" size={20} color={colors.tint} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Banner */}
      <View style={[styles.statusBanner, { backgroundColor: statusColors.bg }]}>
        <View style={styles.statusContent}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: statusColors.text },
            ]}
          >
            <Ionicons
              name={
                invoice.status === "paid"
                  ? "checkmark-circle"
                  : invoice.status === "overdue"
                  ? "warning"
                  : "time-outline"
              }
              size={16}
              color="white"
            />
          </View>
          <View style={styles.statusText}>
            <ThemedText
              style={[styles.statusTitle, { color: statusColors.text }]}
            >
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </ThemedText>
            <ThemedText style={styles.statusSubtitle}>
              {invoice.status === "overdue"
                ? "Payment is overdue"
                : invoice.status === "paid"
                ? "Payment received"
                : "Awaiting payment"}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Invoice Details */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Invoice Details</ThemedText>

          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>Property</ThemedText>
              <ThemedText style={styles.detailValue}>
                {invoice.property}
              </ThemedText>
            </View>

            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>Room</ThemedText>
              <ThemedText style={styles.detailValue}>
                Room {invoice.roomNumber}
              </ThemedText>
            </View>

            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>Billing Period</ThemedText>
              <ThemedText style={styles.detailValue}>
                {invoice.billingPeriod}
              </ThemedText>
            </View>

            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>Issue Date</ThemedText>
              <ThemedText style={styles.detailValue}>
                {new Date(invoice.issueDate).toLocaleDateString()}
              </ThemedText>
            </View>

            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>Due Date</ThemedText>
              <ThemedText style={styles.detailValue}>
                {new Date(invoice.dueDate).toLocaleDateString()}
              </ThemedText>
            </View>

            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>Created By</ThemedText>
              <ThemedText style={styles.detailValue}>
                {invoice.createdBy}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Line Items */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Charges Breakdown</ThemedText>

          <View style={styles.lineItems}>
            {invoice.lineItems.map((item, index) => (
              <View key={index} style={styles.lineItem}>
                <View style={styles.lineItemInfo}>
                  <ThemedText style={styles.lineItemDescription}>
                    {item.description}
                  </ThemedText>
                  <View style={styles.lineItemCategory}>
                    <Ionicons
                      name={
                        item.category === "rent"
                          ? "home-outline"
                          : item.category === "electricity"
                          ? "flash-outline"
                          : item.category === "water"
                          ? "water-outline"
                          : item.category === "wifi"
                          ? "wifi-outline"
                          : "cash-outline"
                      }
                      size={14}
                      color={colors.tint}
                    />
                    <ThemedText style={styles.lineItemCategoryText}>
                      {item.category.charAt(0).toUpperCase() +
                        item.category.slice(1)}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.lineItemAmount}>
                  ₱{item.amount.toLocaleString()}
                </ThemedText>
              </View>
            ))}
          </View>

          <View style={styles.invoiceTotal}>
            <ThemedText style={styles.totalLabel}>Total Amount</ThemedText>
            <ThemedText style={styles.totalAmount}>
              ₱{invoice.totalAmount.toLocaleString()}
            </ThemedText>
          </View>
        </View>

        {/* Payment History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Payment History</ThemedText>
            {invoice.status !== "paid" && (
              <TouchableOpacity
                style={styles.addPaymentButton}
                onPress={handleAddPayment}
              >
                <Ionicons name="add" size={16} color={colors.tint} />
                <ThemedText style={styles.addPaymentText}>
                  Add Payment
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {invoice.payments.length === 0 ? (
            <View style={styles.emptyPayments}>
              <Ionicons
                name="cash-outline"
                size={32}
                color={colors.text + "40"}
              />
              <ThemedText style={styles.emptyPaymentsText}>
                No payments recorded yet
              </ThemedText>
            </View>
          ) : (
            <View style={styles.paymentsList}>
              {invoice.payments.map((payment, index) => (
                <View
                  key={index}
                  style={[styles.paymentItem, { backgroundColor: colors.card }]}
                >
                  <View style={styles.paymentInfo}>
                    <ThemedText style={styles.paymentAmount}>
                      ₱{payment.amount.toLocaleString()}
                    </ThemedText>
                    <ThemedText style={styles.paymentDate}>
                      {new Date(payment.date).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <View style={styles.paymentMethod}>
                    <Ionicons
                      name="card-outline"
                      size={16}
                      color={colors.text + "60"}
                    />
                    <ThemedText style={styles.paymentMethodText}>
                      {payment.method}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          )}

          {invoice.balance > 0 && (
            <View style={styles.balanceSummary}>
              <View style={styles.balanceItem}>
                <ThemedText style={styles.balanceLabel}>Total Paid</ThemedText>
                <ThemedText style={styles.balanceValue}>
                  ₱{invoice.paidAmount.toLocaleString()}
                </ThemedText>
              </View>
              <View style={styles.balanceItem}>
                <ThemedText style={styles.balanceLabel}>
                  Outstanding Balance
                </ThemedText>
                <ThemedText style={[styles.balanceValue, { color: "#FF3B30" }]}>
                  ₱{invoice.balance.toLocaleString()}
                </ThemedText>
              </View>
            </View>
          )}
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Notes</ThemedText>
            <ThemedText style={styles.notesText}>{invoice.notes}</ThemedText>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        {invoice.status === "pending" && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.markPaidButton,
              { backgroundColor: "#34C759" },
            ]}
            onPress={handleMarkAsPaid}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="white" />
            <ThemedText style={styles.actionButtonText}>
              Mark as Paid
            </ThemedText>
          </TouchableOpacity>
        )}

        {invoice.status === "overdue" && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.reminderButton,
              { backgroundColor: "#FF9500" },
            ]}
            onPress={() => router.push("/landlord/notifications/compose")}
          >
            <Ionicons name="notifications-outline" size={20} color="white" />
            <ThemedText style={styles.actionButtonText}>
              Send Reminder
            </ThemedText>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() =>
            router.push(`/landlord/tenant-profile/${invoice.tenantId}`)
          }
        >
          <Ionicons name="person-outline" size={20} color={colors.tint} />
          <ThemedText style={[styles.actionButtonText, { color: colors.tint }]}>
            View Tenant
          </ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    alignItems: "center",
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  tenantName: {
    fontSize: 14,
    opacity: 0.7,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerActionButton: {
    padding: 8,
  },
  statusBanner: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  statusContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  addPaymentButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
  },
  addPaymentText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#007AFF",
  },
  detailGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.7,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  lineItems: {
    marginBottom: 16,
  },
  lineItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  lineItemInfo: {
    flex: 1,
  },
  lineItemDescription: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  lineItemCategory: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  lineItemCategoryText: {
    fontSize: 12,
    opacity: 0.7,
  },
  lineItemAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  invoiceTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#34C759",
  },
  emptyPayments: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyPaymentsText: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 8,
  },
  paymentsList: {
    gap: 8,
  },
  paymentItem: {
    padding: 12,
    borderRadius: 8,
  },
  paymentInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#34C759",
  },
  paymentDate: {
    fontSize: 14,
    opacity: 0.7,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  paymentMethodText: {
    fontSize: 12,
    opacity: 0.7,
  },
  balanceSummary: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
  },
  balanceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
    backgroundColor: "#FFFFFF",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  markPaidButton: {
    backgroundColor: "#34C759",
  },
  reminderButton: {
    backgroundColor: "#FF9500",
  },
  secondaryButton: {
    backgroundColor: "#F2F2F7",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
