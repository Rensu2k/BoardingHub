import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { getBillById, getLandlordPaymentProofs, reviewPaymentProof } from "@/utils/billingHelpers";

const { width } = Dimensions.get("window");

export default function InvoiceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProof, setPaymentProof] = useState(null);
  const [showProofModal, setShowProofModal] = useState(false);

  // Load invoice data from Firebase
  const loadInvoiceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        throw new Error("No invoice ID provided");
      }

      const [invoiceData, paymentProofs] = await Promise.all([
        getBillById(id),
        getLandlordPaymentProofs()
      ]);

      // Find payment proof for this specific bill
      const billProof = paymentProofs.find(proof => proof.billId === id);
      setPaymentProof(billProof || null);

      // Process the invoice data to match the expected format
      const processedInvoice = {
        id: invoiceData.id,
        invoiceNumber: invoiceData.invoiceId || `INV-${invoiceData.id}`,
        tenantName: invoiceData.tenantName,
        tenantId: invoiceData.tenantId,
        roomNumber: invoiceData.roomNumber,
        property: invoiceData.property,
        propertyId: invoiceData.propertyId,
        billingPeriod: invoiceData.billingPeriod
          ? `${invoiceData.billingPeriod.month} ${invoiceData.billingPeriod.year}`
          : "Unknown Period",
        issueDate:
          invoiceData.createdAt?.toDate?.()?.toISOString?.()?.split("T")[0] ||
          invoiceData.createdAt ||
          new Date().toISOString().split("T")[0],
        dueDate: invoiceData.dueDate,
        status: invoiceData.status || "pending",
        totalAmount: invoiceData.amount || 0,
        paidAmount: invoiceData.status === "paid" ? invoiceData.amount || 0 : 0,
        balance: invoiceData.status === "paid" ? 0 : invoiceData.amount || 0,
        lineItems: [
          {
            id: "1",
            description: "Monthly Rent",
            amount: invoiceData.baseRent || 0,
            category: "rent",
          },
          ...(invoiceData.utilityCharges > 0
            ? [
                {
                  id: "2",
                  description: "Utility Charges",
                  amount: invoiceData.utilityCharges,
                  category: "utilities",
                },
              ]
            : []),
        ],
        payments: invoiceData.paymentProofs || [],
        notes: invoiceData.notes || "No additional notes.",
        createdBy: "Landlord",
        createdAt:
          invoiceData.createdAt?.toDate?.()?.toISOString?.() ||
          invoiceData.createdAt ||
          new Date().toISOString(),
        updatedAt:
          invoiceData.updatedAt?.toDate?.()?.toISOString?.() ||
          invoiceData.updatedAt ||
          new Date().toISOString(),
      };

      setInvoice(processedInvoice);
    } catch (error) {
      console.error("Error loading invoice data:", error);
      setError(`Failed to load invoice details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Load data when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadInvoiceData();
    }, [loadInvoiceData])
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return { bg: "#34C75920", text: "#34C759" };
      case "overdue":
        return { bg: "#FF3B3020", text: "#FF3B30" };
      case "pending":
        return { bg: "#FF950020", text: "#FF9500" };
      case "proof_submitted":
        return { bg: "#5856D620", text: "#5856D6" };
      default:
        return { bg: colors.card, text: colors.text };
    }
  };

  // Remove this line - statusColors will be calculated in the render after null check

  const handleMarkAsPaid = () => {
    if (!invoice) return;

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
    if (!invoice) return;

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

  const handleViewProof = () => {
    if (paymentProof) {
      setShowProofModal(true);
    } else {
      Alert.alert("No Proof Found", "No payment proof found for this bill.");
    }
  };

  const handleReviewProof = async (action) => {
    if (!paymentProof) return;

    const actionText = action === "approve" ? "approve" : "reject";
    Alert.alert(
      `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Proof`,
      `Are you sure you want to ${actionText} this payment proof?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: actionText.charAt(0).toUpperCase() + actionText.slice(1),
          style: action === "reject" ? "destructive" : "default",
          onPress: async () => {
            try {
              await reviewPaymentProof(paymentProof.id, action);
              Alert.alert("Success", `Payment proof ${action}d successfully!`);
              setShowProofModal(false);
              // Reload data to reflect changes
              loadInvoiceData();
            } catch (error) {
              Alert.alert("Error", `Failed to ${actionText} payment proof. Please try again.`);
            }
          },
        },
      ]
    );
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={styles.invoiceNumber}>Loading...</ThemedText>
        </View>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>
            Loading invoice details...
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={styles.invoiceNumber}>Error</ThemedText>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.tint }]}
            onPress={loadInvoiceData}
          >
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show invoice not found state
  if (!invoice) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={styles.invoiceNumber}>Not Found</ThemedText>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="document-outline" size={48} color={colors.text} />
          <ThemedText style={styles.errorText}>Invoice not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

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
      <View
        style={[
          styles.statusBanner,
          { backgroundColor: getStatusColor(invoice.status).bg },
        ]}
      >
        <View style={styles.statusContent}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor(invoice.status).text },
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
              style={[
                styles.statusTitle,
                { color: getStatusColor(invoice.status).text },
              ]}
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

        {/* View Proof Button - only show if payment proof exists */}
        {paymentProof && (
          <TouchableOpacity
            style={[
              styles.actionButton, 
              styles.viewProofButton, 
              { backgroundColor: paymentProof.status === "approved" ? "#34C759" : 
                                  paymentProof.status === "rejected" ? "#FF3B30" : "#5856D6" }
            ]}
            onPress={handleViewProof}
          >
            <Ionicons 
              name={paymentProof.status === "approved" ? "checkmark-circle-outline" :
                    paymentProof.status === "rejected" ? "close-circle-outline" : "image-outline"} 
              size={20} 
              color="white" 
            />
            <ThemedText style={styles.actionButtonText}>
              {paymentProof.status === "approved" ? "View Approved Proof" :
               paymentProof.status === "rejected" ? "View Rejected Proof" : "View Proof"}
            </ThemedText>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={async () => {
            // Navigate to tenant profile

            // Validate tenant ID before navigating
            if (!invoice.tenantId) {
              Alert.alert(
                "Tenant Not Available",
                "This bill has no tenant reference."
              );
              return;
            }

            // Note: Removed placeholder ID check since we're now using real Firebase data

            // Try to verify if tenant exists before navigating
            try {
              const { getTenantById } = await import("@/utils/tenantHelpers");
              const tenantData = await getTenantById(invoice.tenantId);

              // If we get here, tenant exists, so navigate
              router.push(`/landlord/tenant-profile/${invoice.tenantId}`);
            } catch (error) {
              console.error("Error fetching tenant:", error);

              Alert.alert(
                "Tenant Not Available",
                `Unable to find tenant details for "${
                  invoice.tenantName || "Unknown"
                }".
                
Debug Info:
• Tenant ID: ${invoice.tenantId}
• Error: ${error.message}

This tenant may have been removed or the bill contains invalid data.`
              );
            }
          }}
        >
          <Ionicons name="person-outline" size={20} color={colors.tint} />
          <ThemedText style={[styles.actionButtonText, { color: colors.tint }]}>
            View Tenant
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Payment Proof Modal */}
      <Modal
        visible={showProofModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowProofModal(false)}
      >
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowProofModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>Payment Proof</ThemedText>
            <View style={{ width: 24 }} />
          </View>

          {paymentProof && (
            <ScrollView style={styles.proofContent} showsVerticalScrollIndicator={false}>
              {/* Bill Information */}
              <View style={[styles.proofBillInfo, { backgroundColor: colors.card }]}>
                <ThemedText style={styles.proofInvoiceId}>{invoice?.invoiceNumber}</ThemedText>
                <ThemedText style={styles.proofAmount}>₱{paymentProof.amount?.toLocaleString()}</ThemedText>
                <ThemedText style={styles.proofSubmittedAt}>
                  Submitted: {new Date(paymentProof.submittedAt?.toDate?.() || paymentProof.submittedAt).toLocaleDateString()}
                </ThemedText>
              </View>

              {/* GCash Receipt Image */}
              <View style={[styles.proofImageContainer, { backgroundColor: colors.card }]}>
                <ThemedText style={styles.proofImageTitle}>Payment Receipt</ThemedText>
                <Image
                  source={{ uri: paymentProof.imageUri }}
                  style={styles.proofImage}
                  resizeMode="contain"
                />
              </View>

              {/* Additional Notes */}
              {paymentProof.note && (
                <View style={[styles.proofNoteContainer, { backgroundColor: colors.card }]}>
                  <ThemedText style={styles.proofNoteTitle}>Additional Notes</ThemedText>
                  <ThemedText style={styles.proofNoteText}>{paymentProof.note}</ThemedText>
                </View>
              )}

              {/* Action Buttons - only show for pending proofs */}
              {(paymentProof.status === "pending" || paymentProof.status === "pending_review") && (
                <View style={styles.proofActions}>
                  <TouchableOpacity
                    style={[styles.proofActionButton, { backgroundColor: "#FF3B30" }]}
                    onPress={() => handleReviewProof("reject")}
                  >
                    <Ionicons name="close-circle-outline" size={20} color="white" />
                    <ThemedText style={styles.proofActionText}>Reject</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.proofActionButton, { backgroundColor: "#34C759" }]}
                    onPress={() => handleReviewProof("approve")}
                  >
                    <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                    <ThemedText style={styles.proofActionText}>Approve</ThemedText>
                  </TouchableOpacity>
                </View>
              )}

              {/* Status indicator for processed proofs */}
              {(paymentProof.status === "approved" || paymentProof.status === "rejected") && (
                <View style={styles.proofStatusIndicator}>
                  <View style={[
                    styles.proofStatusBadge,
                    { backgroundColor: paymentProof.status === "approved" ? "#34C75920" : "#FF3B3020" }
                  ]}>
                    <Ionicons 
                      name={paymentProof.status === "approved" ? "checkmark-circle-outline" : "close-circle-outline"} 
                      size={20} 
                      color={paymentProof.status === "approved" ? "#34C759" : "#FF3B30"} 
                    />
                    <ThemedText style={[
                      styles.proofStatusText,
                      { color: paymentProof.status === "approved" ? "#34C759" : "#FF3B30" }
                    ]}>
                      {paymentProof.status === "approved" ? "Approved" : "Rejected"}
                    </ThemedText>
                  </View>
                </View>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 22,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  viewProofButton: {
    backgroundColor: "#5856D6",
  },
  // Payment Proof Modal Styles
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  proofContent: {
    flex: 1,
    padding: 16,
  },
  proofBillInfo: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  proofInvoiceId: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  proofAmount: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  proofSubmittedAt: {
    fontSize: 14,
    opacity: 0.7,
  },
  proofImageContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  proofImageTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  proofImage: {
    width: "100%",
    height: 400,
    borderRadius: 8,
  },
  proofNoteContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  proofNoteTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  proofNoteText: {
    fontSize: 14,
    lineHeight: 20,
  },
  proofActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  proofActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  proofActionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  proofStatusIndicator: {
    marginTop: 16,
    alignItems: "center",
  },
  proofStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  proofStatusText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
