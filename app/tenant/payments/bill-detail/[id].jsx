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
import { ThemedView } from "@/components/ThemedView";
import { StatusChip, UploadProofModal } from "@/components/tenant";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

const { width } = Dimensions.get("window");

export default function BillDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // null, 'pending_review', 'approved', 'rejected'
  const [uploadedProof, setUploadedProof] = useState(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Mock bill data - in real app, fetch by ID
  const bill = {
    id: parseInt(id),
    invoiceId: "INV-2024-002",
    month: "February 2024",
    amount: 4500,
    dueDate: "2024-02-15",
    status: "due",
    property: "Sunshine Apartments",
    room: "A-101",
    year: "2024",
    issueDate: "2024-01-15",
    description: "Monthly rent payment for Room A-101",
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
    paymentMethods: [
      { type: "Bank Transfer", details: "BPI - Account: 1234567890" },
      { type: "GCash", details: "09123456789" },
      { type: "Cash", details: "Pay at property office" },
    ],
    notes:
      "Please ensure payment is made before the due date to avoid late fees.",
  };

  const handleUploadProof = () => {
    setShowUploadModal(true);
  };

  const handleUploadComplete = (uploadData) => {
    setUploadedProof(uploadData);
    setUploadStatus("pending_review");
    // In a real app, you would update the bill status on the server
  };

  const handleEditProof = () => {
    setShowUploadModal(true);
  };

  const handleReplaceProof = () => {
    Alert.alert(
      "Replace Payment Proof",
      "Are you sure you want to replace the current payment proof?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Replace",
          style: "destructive",
          onPress: () => {
            setUploadedProof(null);
            setUploadStatus(null);
            setShowUploadModal(true);
          },
        },
      ]
    );
  };

  const handlePayNow = () => {
    Alert.alert("Pay Now", "Payment system coming soon!");
  };

  const handleContactLandlord = () => {
    Alert.alert("Contact Landlord", `Contact ${bill.landlord.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Call",
        onPress: () => Alert.alert("Calling", `Calling ${bill.landlord.phone}`),
      },
      {
        text: "Email",
        onPress: () => Alert.alert("Email", `Emailing ${bill.landlord.email}`),
      },
    ]);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Bill Details</ThemedText>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => Alert.alert("Share", "Share bill coming soon!")}
        >
          <Ionicons name="share-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Bill Header */}
        <ThemedView
          style={[styles.billHeader, { backgroundColor: colors.card }]}
        >
          <View style={styles.billTitleSection}>
            <ThemedText style={styles.invoiceId}>{bill.invoiceId}</ThemedText>
            <StatusChip status={bill.status} />
          </View>

          <ThemedText style={styles.billMonth}>{bill.month}</ThemedText>
          <ThemedText style={styles.billAmount}>
            ₱{bill.amount.toLocaleString()}
          </ThemedText>

          <View style={styles.dateSection}>
            <View style={styles.dateItem}>
              <ThemedText style={styles.dateLabel}>Issue Date</ThemedText>
              <ThemedText style={styles.dateValue}>
                {new Date(bill.issueDate).toLocaleDateString()}
              </ThemedText>
            </View>
            <View style={styles.dateItem}>
              <ThemedText style={styles.dateLabel}>Due Date</ThemedText>
              <ThemedText style={styles.dateValue}>
                {new Date(bill.dueDate).toLocaleDateString()}
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Property Info */}
        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>
            Property Information
          </ThemedText>
          <View style={styles.propertyInfo}>
            <View style={styles.propertyItem}>
              <Ionicons name="business-outline" size={20} color={colors.text} />
              <ThemedText style={styles.propertyText}>
                {bill.property}
              </ThemedText>
            </View>
            <View style={styles.propertyItem}>
              <Ionicons name="home-outline" size={20} color={colors.text} />
              <ThemedText style={styles.propertyText}>
                Room {bill.room}
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Bill Breakdown */}
        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>Bill Breakdown</ThemedText>
          <View style={styles.breakdown}>
            {bill.breakdown.map((item, index) => (
              <View key={index} style={styles.breakdownItem}>
                <ThemedText style={styles.breakdownLabel}>
                  {item.item}
                </ThemedText>
                <ThemedText style={styles.breakdownAmount}>
                  ₱{item.amount.toLocaleString()}
                </ThemedText>
              </View>
            ))}
            <View style={[styles.breakdownItem, styles.totalItem]}>
              <ThemedText style={styles.totalLabel}>Total Amount</ThemedText>
              <ThemedText style={styles.totalAmount}>
                ₱{bill.amount.toLocaleString()}
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Payment Proof Status */}
        {uploadedProof && (
          <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.sectionTitle}>Payment Proof Status</ThemedText>
            <View style={styles.proofStatus}>
              <View style={styles.statusHeader}>
                <View style={styles.statusIndicator}>
                  <Ionicons
                    name={uploadStatus === "pending_review" ? "time-outline" : "checkmark-circle-outline"}
                    size={20}
                    color={uploadStatus === "pending_review" ? "#FF9500" : "#34C759"}
                  />
                  <ThemedText
                    style={[
                      styles.statusText,
                      {
                        color: uploadStatus === "pending_review" ? "#FF9500" : "#34C759"
                      }
                    ]}
                  >
                    {uploadStatus === "pending_review" ? "Pending Review" : "Approved"}
                  </ThemedText>
                </View>
                <ThemedText style={styles.submittedDate}>
                  Submitted: {new Date(uploadedProof.submittedAt).toLocaleDateString()}
                </ThemedText>
              </View>

              {uploadedProof.note && (
                <View style={styles.proofNote}>
                  <ThemedText style={styles.noteLabel}>Note:</ThemedText>
                  <ThemedText style={styles.noteText}>{uploadedProof.note}</ThemedText>
                </View>
              )}

              {uploadStatus === "pending_review" && (
                <View style={styles.pendingActions}>
                  <TouchableOpacity
                    style={[styles.pendingAction, { borderColor: colors.tint }]}
                    onPress={handleEditProof}
                  >
                    <Ionicons name="pencil-outline" size={16} color={colors.tint} />
                    <ThemedText style={[styles.pendingActionText, { color: colors.tint }]}>
                      Edit
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.pendingAction, { borderColor: "#FF3B30" }]}
                    onPress={handleReplaceProof}
                  >
                    <Ionicons name="refresh-outline" size={16} color="#FF3B30" />
                    <ThemedText style={[styles.pendingActionText, { color: "#FF3B30" }]}>
                      Replace
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ThemedView>
        )}

        {/* Payment Methods */}
        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>Payment Methods</ThemedText>
          <View style={styles.paymentMethods}>
            {bill.paymentMethods.map((method, index) => (
              <View key={index} style={styles.paymentMethod}>
                <View style={styles.paymentIcon}>
                  <Ionicons
                    name={
                      method.type === "Bank Transfer"
                        ? "card-outline"
                        : method.type === "GCash"
                        ? "phone-portrait-outline"
                        : "cash-outline"
                    }
                    size={20}
                    color={colors.tint}
                  />
                </View>
                <View style={styles.paymentInfo}>
                  <ThemedText style={styles.paymentType}>
                    {method.type}
                  </ThemedText>
                  <ThemedText style={styles.paymentDetails}>
                    {method.details}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        </ThemedView>

        {/* Landlord Contact */}
        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>Landlord Contact</ThemedText>
          <TouchableOpacity
            style={styles.landlordContact}
            onPress={handleContactLandlord}
          >
            <View
              style={[
                styles.landlordAvatar,
                { backgroundColor: colors.tint + "20" },
              ]}
            >
              <ThemedText
                style={[styles.landlordInitials, { color: colors.tint }]}
              >
                {bill.landlord.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </ThemedText>
            </View>
            <View style={styles.landlordInfo}>
              <ThemedText style={styles.landlordName}>
                {bill.landlord.name}
              </ThemedText>
              <ThemedText style={styles.landlordEmail}>
                {bill.landlord.email}
              </ThemedText>
              <ThemedText style={styles.landlordPhone}>
                {bill.landlord.phone}
              </ThemedText>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.text}
              style={{ opacity: 0.5 }}
            />
          </TouchableOpacity>
        </ThemedView>

        {/* Notes */}
        {bill.notes && (
          <ThemedView
            style={[styles.section, { backgroundColor: colors.card }]}
          >
            <ThemedText style={styles.sectionTitle}>Notes</ThemedText>
            <ThemedText style={styles.notes}>{bill.notes}</ThemedText>
          </ThemedView>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      {bill.status !== "paid" && (
        <View
          style={[styles.bottomActions, { backgroundColor: colors.background }]}
        >
          {!uploadedProof ? (
            <>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.uploadButton,
                  { backgroundColor: colors.card },
                ]}
                onPress={handleUploadProof}
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={20}
                  color={colors.tint}
                />
                <ThemedText style={[styles.actionText, { color: colors.tint }]}>
                  Upload Proof
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.payButton,
                  { backgroundColor: colors.tint },
                ]}
                onPress={handlePayNow}
              >
                <Ionicons name="card-outline" size={20} color="white" />
                <ThemedText style={[styles.actionText, { color: "white" }]}>
                  Pay Now
                </ThemedText>
              </TouchableOpacity>
            </>
          ) : uploadStatus === "pending_review" ? (
            <View style={styles.pendingReviewContainer}>
              <View style={styles.pendingReviewInfo}>
                <Ionicons name="time-outline" size={24} color="#FF9500" />
                <View>
                  <ThemedText style={styles.pendingReviewTitle}>
                    Proof Submitted
                  </ThemedText>
                  <ThemedText style={styles.pendingReviewSubtitle}>
                    Awaiting landlord review
                  </ThemedText>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.payButton,
                  { backgroundColor: colors.tint, flex: 1 },
                ]}
                onPress={handlePayNow}
              >
                <Ionicons name="card-outline" size={20} color="white" />
                <ThemedText style={[styles.actionText, { color: "white" }]}>
                  Pay Now
                </ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.payButton,
                { backgroundColor: colors.tint, width: "100%" },
              ]}
              onPress={handlePayNow}
            >
              <Ionicons name="card-outline" size={20} color="white" />
              <ThemedText style={[styles.actionText, { color: "white" }]}>
                Pay Now
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Upload Modal */}
      <UploadProofModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        bill={bill}
        onUploadComplete={handleUploadComplete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  shareButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  billHeader: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  billTitleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  invoiceId: {
    fontSize: 18,
    fontWeight: "600",
  },
  billMonth: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 8,
  },
  billAmount: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },
  dateSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  dateItem: {
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  propertyInfo: {
    gap: 12,
  },
  propertyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  propertyText: {
    fontSize: 16,
  },
  breakdown: {
    gap: 12,
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  breakdownLabel: {
    fontSize: 16,
  },
  breakdownAmount: {
    fontSize: 16,
    fontWeight: "500",
  },
  totalItem: {
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
    paddingTop: 16,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
  },
  paymentMethods: {
    gap: 16,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF20",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentInfo: {
    flex: 1,
  },
  paymentType: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  paymentDetails: {
    fontSize: 14,
    opacity: 0.7,
  },
  landlordContact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  landlordAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  landlordInitials: {
    fontSize: 18,
    fontWeight: "bold",
  },
  landlordInfo: {
    flex: 1,
  },
  landlordName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  landlordEmail: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  landlordPhone: {
    fontSize: 14,
    opacity: 0.7,
  },
  notes: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  proofStatus: {
    gap: 16,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
  },
  submittedDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  proofNote: {
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
  },
  pendingActions: {
    flexDirection: "row",
    gap: 12,
  },
  pendingAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  pendingActionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  pendingReviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  pendingReviewInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  pendingReviewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF9500",
  },
  pendingReviewSubtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  bottomActions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: "#007AFF40",
  },
  payButton: {
    // backgroundColor set dynamically
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
