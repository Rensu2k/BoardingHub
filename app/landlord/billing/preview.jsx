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

export default function PreviewScreen() {
  const router = useRouter();
  const { billingData } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const billingDataObj = JSON.parse(billingData || "{}");
  const {
    propertyName,
    selectedRooms,
    billingPeriod,
    roomCharges,
    totalAmount,
  } = billingDataObj;

  const [isConfirming, setIsConfirming] = useState(false);

  const generateInvoicePreview = () => {
    return selectedRooms.map((room) => {
      const charges = roomCharges[room.id] || {};
      const lineItems = [
        { description: "Rent", amount: parseFloat(charges.rent || 0) },
        {
          description: "Electricity",
          amount: parseFloat(charges.electricity || 0),
        },
        { description: "Water", amount: parseFloat(charges.water || 0) },
        { description: "WiFi", amount: parseFloat(charges.wifi || 0) },
        { description: "Other", amount: parseFloat(charges.other || 0) },
      ].filter((item) => item.amount > 0);

      return {
        room,
        lineItems,
        total: lineItems.reduce((sum, item) => sum + item.amount, 0),
        invoiceNumber: `INV-${billingPeriod.year}${String(
          billingPeriod.billingMonth + 1
        ).padStart(2, "0")}-${room.number}`,
        dueDate: new Date(billingPeriod.endDate),
      };
    });
  };

  const invoicePreviews = generateInvoicePreview();

  const handleConfirm = () => {
    Alert.alert(
      "Confirm Billing",
      `Generate ${
        invoicePreviews.length
      } invoices for ₱${totalAmount.toLocaleString()}? This will notify all tenants.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Generate Bills",
          onPress: () => {
            setIsConfirming(true);
            // Simulate API call
            setTimeout(() => {
              setIsConfirming(false);
              router.push({
                pathname: "/landlord/billing/confirm",
                params: {
                  billingData: JSON.stringify({
                    ...billingDataObj,
                    invoices: invoicePreviews,
                  }),
                },
              });
            }, 2000);
          },
        },
      ]
    );
  };

  const InvoicePreviewCard = ({ invoice }) => (
    <View style={[styles.invoiceCard, { backgroundColor: colors.card }]}>
      <View style={styles.invoiceHeader}>
        <View style={styles.invoiceInfo}>
          <ThemedText style={styles.invoiceNumber}>
            {invoice.invoiceNumber}
          </ThemedText>
          <ThemedText style={styles.roomInfo}>
            Room {invoice.room.number} • {invoice.room.tenant}
          </ThemedText>
        </View>
        <View style={styles.invoiceTotal}>
          <ThemedText style={styles.totalAmount}>
            ₱{invoice.total.toLocaleString()}
          </ThemedText>
        </View>
      </View>

      <View style={styles.lineItems}>
        {invoice.lineItems.map((item, index) => (
          <View key={index} style={styles.lineItem}>
            <ThemedText style={styles.itemDescription}>
              {item.description}
            </ThemedText>
            <ThemedText style={styles.itemAmount}>
              ₱{item.amount.toLocaleString()}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.invoiceFooter}>
        <ThemedText style={styles.dueDate}>
          Due: {invoice.dueDate.toLocaleDateString()}
        </ThemedText>
      </View>
    </View>
  );

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

        <ThemedText style={styles.headerTitle}>Preview Invoices</ThemedText>

        <View style={styles.stepIndicator}>
          <ThemedText style={styles.stepText}>5 of 6</ThemedText>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: "83.33%" }]} />
        </View>
        <View style={styles.progressSteps}>
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <View
              key={step}
              style={[
                styles.progressStep,
                step <= 5 && styles.progressStepActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryLabel}>Property</ThemedText>
            <ThemedText style={styles.summaryValue}>{propertyName}</ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryLabel}>Period</ThemedText>
            <ThemedText style={styles.summaryValue}>
              {billingPeriod.displayName}
            </ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryLabel}>Invoices</ThemedText>
            <ThemedText style={styles.summaryValue}>
              {invoicePreviews.length}
            </ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryLabel}>Total Amount</ThemedText>
            <ThemedText style={[styles.summaryValue, styles.totalValue]}>
              ₱{totalAmount.toLocaleString()}
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
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Invoice Preview</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Review all invoices before generating them
          </ThemedText>
        </View>

        <View style={styles.invoicesList}>
          {invoicePreviews.map((invoice, index) => (
            <InvoicePreviewCard key={index} invoice={invoice} />
          ))}
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {isConfirming && (
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingCard, { backgroundColor: colors.card }]}>
            <Ionicons
              name="document-text-outline"
              size={48}
              color={colors.tint}
            />
            <ThemedText style={styles.loadingTitle}>
              Generating Bills...
            </ThemedText>
            <ThemedText style={styles.loadingText}>
              Creating {invoicePreviews.length} invoices and sending
              notifications
            </ThemedText>
          </View>
        </View>
      )}

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: colors.tint }]}
          onPress={handleConfirm}
          disabled={isConfirming}
        >
          <Ionicons name="checkmark-circle" size={20} color="white" />
          <ThemedText style={styles.confirmButtonText}>
            {isConfirming ? "Generating..." : "Generate Bills"}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  stepIndicator: {
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  stepText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E5E5E7",
    borderRadius: 2,
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 2,
  },
  progressSteps: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressStep: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E5E7",
  },
  progressStepActive: {
    backgroundColor: "#007AFF",
  },
  summaryContainer: {
    backgroundColor: "#F9F9F9",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    minWidth: width * 0.4,
  },
  summaryLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  totalValue: {
    color: "#34C759",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    lineHeight: 22,
  },
  invoicesList: {
    gap: 12,
    paddingHorizontal: 20,
  },
  invoiceCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  roomInfo: {
    fontSize: 14,
    opacity: 0.7,
  },
  invoiceTotal: {
    alignItems: "flex-end",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#34C759",
  },
  lineItems: {
    marginBottom: 12,
  },
  lineItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  itemDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: "500",
  },
  invoiceFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
    paddingTop: 8,
  },
  dueDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 32,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
    backgroundColor: "#FFFFFF",
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
