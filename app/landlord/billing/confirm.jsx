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

export default function ConfirmScreen() {
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
    invoices,
  } = billingDataObj;

  const [isProcessing, setIsProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleComplete = async () => {
    setIsProcessing(true);

    try {
      // Simulate processing and notifications
      await new Promise((resolve) => setTimeout(resolve, 3000));

      setCompleted(true);

      // Show success message
      Alert.alert(
        "Success!",
        `Successfully generated ${invoices.length} invoices and sent notifications to ${selectedRooms.length} tenants.`,
        [
          {
            text: "View Bills",
            onPress: () => {
              // Navigate back to billing list
              router.replace("/landlord/(tabs)/billing");
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to process billing. Please try again.");
      setIsProcessing(false);
    }
  };

  if (completed) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.successContainer}>
          <View style={[styles.successCard, { backgroundColor: colors.card }]}>
            <View
              style={[styles.successIcon, { backgroundColor: "#34C75920" }]}
            >
              <Ionicons name="checkmark-circle" size={64} color="#34C759" />
            </View>

            <ThemedText style={styles.successTitle}>
              Billing Complete!
            </ThemedText>

            <View style={styles.successStats}>
              <View style={styles.stat}>
                <ThemedText style={styles.statValue}>
                  {invoices.length}
                </ThemedText>
                <ThemedText style={styles.statLabel}>
                  Invoices Generated
                </ThemedText>
              </View>
              <View style={styles.stat}>
                <ThemedText style={styles.statValue}>
                  {selectedRooms.length}
                </ThemedText>
                <ThemedText style={styles.statLabel}>
                  Tenants Notified
                </ThemedText>
              </View>
              <View style={styles.stat}>
                <ThemedText style={styles.statValue}>
                  ₱{totalAmount.toLocaleString()}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Total Amount</ThemedText>
              </View>
            </View>

            <View style={styles.completedActions}>
              <TouchableOpacity
                style={[
                  styles.viewBillsButton,
                  { backgroundColor: colors.tint },
                ]}
                onPress={() => router.replace("/landlord/(tabs)/billing")}
              >
                <ThemedText style={styles.viewBillsText}>View Bills</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.generateMoreButton}
                onPress={() =>
                  router.replace("/landlord/billing/select-property")
                }
              >
                <ThemedText style={styles.generateMoreText}>
                  Generate More Bills
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
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
        <View style={styles.headerContent}>
          <Ionicons name="checkmark-circle" size={24} color="#34C759" />
          <ThemedText style={styles.headerTitle}>
            Ready to Generate Bills
          </ThemedText>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: "100%" }]} />
        </View>
        <View style={styles.progressSteps}>
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <View
              key={step}
              style={[styles.progressStep, styles.progressStepActive]}
            />
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Billing Summary</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Review final details before generating invoices
          </ThemedText>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Ionicons name="business-outline" size={20} color={colors.tint} />
              <View>
                <ThemedText style={styles.summaryLabel}>Property</ThemedText>
                <ThemedText style={styles.summaryValue}>
                  {propertyName}
                </ThemedText>
              </View>
            </View>

            <View style={styles.summaryItem}>
              <Ionicons name="calendar-outline" size={20} color={colors.tint} />
              <View>
                <ThemedText style={styles.summaryLabel}>
                  Billing Period
                </ThemedText>
                <ThemedText style={styles.summaryValue}>
                  {billingPeriod.displayName}
                </ThemedText>
              </View>
            </View>

            <View style={styles.summaryItem}>
              <Ionicons name="bed-outline" size={20} color={colors.tint} />
              <View>
                <ThemedText style={styles.summaryLabel}>Rooms</ThemedText>
                <ThemedText style={styles.summaryValue}>
                  {selectedRooms.length}
                </ThemedText>
              </View>
            </View>

            <View style={styles.summaryItem}>
              <Ionicons name="cash-outline" size={20} color={colors.tint} />
              <View>
                <ThemedText style={styles.summaryLabel}>
                  Total Amount
                </ThemedText>
                <ThemedText
                  style={[
                    styles.summaryValue,
                    { color: "#34C759", fontSize: 18 },
                  ]}
                >
                  ₱{totalAmount.toLocaleString()}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.notificationsCard}>
          <View style={styles.notificationHeader}>
            <Ionicons name="notifications-outline" size={20} color="#007AFF" />
            <ThemedText style={styles.notificationTitle}>
              Notifications
            </ThemedText>
          </View>

          <ThemedText style={styles.notificationText}>
            Invoices will be generated and sent to all {selectedRooms.length}{" "}
            tenants via:
          </ThemedText>

          <View style={styles.notificationMethods}>
            <View style={styles.method}>
              <Ionicons name="mail-outline" size={16} color="#007AFF" />
              <ThemedText style={styles.methodText}>Email</ThemedText>
            </View>
            <View style={styles.method}>
              <Ionicons
                name="phone-portrait-outline"
                size={16}
                color="#007AFF"
              />
              <ThemedText style={styles.methodText}>
                In-App Notification
              </ThemedText>
            </View>
          </View>
        </View>

        {isProcessing && (
          <View style={styles.processingCard}>
            <View style={styles.processingHeader}>
              <View style={styles.processingSpinner}>
                <Ionicons name="sync" size={20} color={colors.tint} />
              </View>
              <ThemedText style={styles.processingTitle}>
                Processing...
              </ThemedText>
            </View>

            <View style={styles.processingSteps}>
              <View style={styles.processingStep}>
                <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                <ThemedText style={styles.processingStepText}>
                  Generating invoices
                </ThemedText>
              </View>
              <View style={styles.processingStep}>
                <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                <ThemedText style={styles.processingStepText}>
                  Sending notifications
                </ThemedText>
              </View>
              <View style={styles.processingStep}>
                <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                <ThemedText style={styles.processingStepText}>
                  Updating tenant records
                </ThemedText>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.completeButton, { backgroundColor: colors.tint }]}
          onPress={handleComplete}
          disabled={isProcessing}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="white" />
          <ThemedText style={styles.completeButtonText}>
            {isProcessing ? "Processing..." : "Generate Bills & Notify"}
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
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
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
    backgroundColor: "#34C759",
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
    backgroundColor: "#34C759",
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
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
  },
  summaryGrid: {
    gap: 16,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryLabel: {
    fontSize: 12,
    opacity: 0.7,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  notificationsCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1976D2",
  },
  notificationText: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 12,
    lineHeight: 20,
  },
  notificationMethods: {
    flexDirection: "row",
    gap: 16,
  },
  method: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  methodText: {
    fontSize: 14,
    fontWeight: "500",
  },
  processingCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFCC02",
  },
  processingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  processingSpinner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  processingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F57C00",
  },
  processingSteps: {
    gap: 12,
  },
  processingStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  processingStepText: {
    fontSize: 14,
    opacity: 0.8,
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  successCard: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  successStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 24,
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#34C759",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
  },
  completedActions: {
    width: "100%",
    gap: 12,
  },
  viewBillsButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  viewBillsText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  generateMoreButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    alignItems: "center",
  },
  generateMoreText: {
    fontSize: 16,
    fontWeight: "500",
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
    backgroundColor: "#FFFFFF",
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  completeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
