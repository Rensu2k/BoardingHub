import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Dimensions,
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
import {
  makePhoneCall,
  sendEmail,
  sendSMSMessage,
} from "@/utils/communicationHelpers";
import { updateApplicationStatus } from "@/utils/notificationHelpers";

const { width } = Dimensions.get("window");

export default function TenantApplicationModal({
  visible,
  onClose,
  applicationData,
  notificationId,
  onStatusUpdate,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  if (!applicationData) {
    return null;
  }

  const { tenant, room, applicationDate, status } = applicationData;

  const handleStatusUpdate = async (newStatus) => {
    const statusLabels = {
      approved: "approve",
      rejected: "reject",
      pending: "mark as pending",
    };

    const confirmationMessage =
      newStatus === "approved"
        ? `Are you sure you want to ${statusLabels[newStatus]} this application?\n\n⚠️ This will automatically:\n• Assign ${tenant?.fullName} to ${room?.title}\n• Mark the room as occupied\n• Create a 1-year lease starting today`
        : `Are you sure you want to ${statusLabels[newStatus]} this application?`;

    Alert.alert("Update Application Status", confirmationMessage, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: async () => {
          setIsLoading(true);
          try {
            const result = await updateApplicationStatus(
              notificationId,
              newStatus
            );

            if (result.success) {
              const successMessage =
                newStatus === "approved"
                  ? `✅ Application Approved!\n\n${tenant?.fullName} has been automatically assigned to ${room?.title}.\n\nThe room is now marked as occupied, a 1-year lease has been created, and your property occupancy has been updated.`
                  : `Application has been ${statusLabels[newStatus]}d successfully.`;

              Alert.alert("Success", successMessage, [
                {
                  text: "OK",
                  onPress: () => {
                    onStatusUpdate?.(newStatus);
                    onClose();
                  },
                },
              ]);
            } else {
              Alert.alert(
                "Error",
                result.message || "Failed to update application status."
              );
            }
          } catch (error) {
            console.error("Error updating status:", error);
            Alert.alert(
              "Error",
              "An error occurred while updating the status."
            );
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  const handleContactTenant = (method) => {
    const tenantName = tenant?.fullName || "Tenant";

    switch (method) {
      case "call":
        if (tenant?.phone) {
          makePhoneCall(tenant.phone, tenantName);
        } else {
          Alert.alert("Error", "Phone number not available");
        }
        break;
      case "sms":
        if (tenant?.phone) {
          const message = `Hi ${tenantName}, regarding your application for ${
            room?.title || "the room"
          } at our property. Please let me know when would be a good time to discuss further.`;
          sendSMSMessage(tenant.phone, message, tenantName);
        } else {
          Alert.alert("Error", "Phone number not available");
        }
        break;
      case "email":
        if (tenant?.email) {
          const subject = `Room Application - ${room?.title || "Room"}`;
          const body = `Dear ${tenantName},\n\nThank you for your application for ${
            room?.title || "the room"
          } at our property.\n\nWe have received your application and will review it shortly. Please feel free to contact us if you have any questions.\n\nBest regards`;
          sendEmail(tenant.email, subject, body, tenantName);
        } else {
          Alert.alert("Error", "Email address not available");
        }
        break;
      default:
        Alert.alert("Error", "Invalid contact method");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "#34C759";
      case "rejected":
        return "#FF3B30";
      case "pending":
        return "#FF9500";
      default:
        return colors.text;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return "checkmark-circle";
      case "rejected":
        return "close-circle";
      case "pending":
        return "time";
      default:
        return "help-circle";
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Room Application</ThemedText>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Application Status */}
          <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
            <View style={styles.statusHeader}>
              <View style={styles.statusIconContainer}>
                <Ionicons
                  name={getStatusIcon(status)}
                  size={24}
                  color={getStatusColor(status)}
                />
              </View>
              <View style={styles.statusInfo}>
                <ThemedText style={styles.statusLabel}>
                  Application Status
                </ThemedText>
                <ThemedText
                  style={[
                    styles.statusValue,
                    { color: getStatusColor(status) },
                  ]}
                >
                  {status?.charAt(0).toUpperCase() + status?.slice(1) ||
                    "Pending"}
                </ThemedText>
              </View>
            </View>
            <ThemedText style={styles.applicationDate}>
              Submitted:{" "}
              {new Date(applicationDate).toLocaleDateString("en-PH", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </ThemedText>
          </View>

          {/* Room Information */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.sectionTitle}>Room Details</ThemedText>
            <View style={styles.roomInfo}>
              <ThemedText style={styles.roomTitle}>
                {room?.title || "Room"}
              </ThemedText>
              <View style={styles.roomMeta}>
                <ThemedText style={styles.roomDetail}>
                  Room {room?.roomNumber || "N/A"} • ₱
                  {room?.price?.toLocaleString() || "0"}/month
                </ThemedText>
                <ThemedText style={styles.roomProperty}>
                  {room?.property?.name || "Property"}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Tenant Information */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.sectionTitle}>
              Applicant Information
            </ThemedText>

            {/* Personal Info */}
            <View style={styles.infoGroup}>
              <ThemedText style={styles.groupTitle}>
                Personal Details
              </ThemedText>
              <InfoRow
                label="Full Name"
                value={tenant?.fullName || "Not provided"}
              />
              <InfoRow label="Email" value={tenant?.email || "Not provided"} />
              <InfoRow label="Phone" value={tenant?.phone || "Not provided"} />
              <InfoRow
                label="Date of Birth"
                value={tenant?.dateOfBirth || "Not provided"}
              />
              <InfoRow
                label="Gender"
                value={tenant?.gender || "Not provided"}
              />
              <InfoRow
                label="Address"
                value={tenant?.address || "Not provided"}
              />
            </View>

            {/* Professional Info */}
            <View style={styles.infoGroup}>
              <ThemedText style={styles.groupTitle}>
                Professional Details
              </ThemedText>
              <InfoRow
                label="Occupation"
                value={tenant?.occupation || "Not provided"}
              />
              <InfoRow
                label="Company"
                value={tenant?.company || "Not provided"}
              />
            </View>

            {/* ID Information */}
            <View style={styles.infoGroup}>
              <ThemedText style={styles.groupTitle}>Identification</ThemedText>
              <InfoRow
                label="ID Type"
                value={tenant?.idType || "Not provided"}
              />
              <InfoRow
                label="ID Number"
                value={tenant?.idNumber || "Not provided"}
              />
            </View>

            {/* Emergency Contact */}
            <View style={styles.infoGroup}>
              <ThemedText style={styles.groupTitle}>
                Emergency Contact
              </ThemedText>
              <InfoRow
                label="Name"
                value={tenant?.emergencyContactName || "Not provided"}
              />
              <InfoRow
                label="Relation"
                value={tenant?.emergencyContactRelation || "Not provided"}
              />
              <InfoRow
                label="Phone"
                value={tenant?.emergencyContactPhone || "Not provided"}
              />
            </View>
          </View>

          {/* Contact Actions */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.sectionTitle}>
              Contact Applicant
            </ThemedText>
            <View style={styles.contactActions}>
              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: colors.tint }]}
                onPress={() => handleContactTenant("call")}
                disabled={!tenant?.phone}
              >
                <Ionicons name="call" size={20} color="white" />
                <ThemedText style={styles.contactButtonText}>Call</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: "#34C759" }]}
                onPress={() => handleContactTenant("sms")}
                disabled={!tenant?.phone}
              >
                <Ionicons name="chatbubble" size={20} color="white" />
                <ThemedText style={styles.contactButtonText}>SMS</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: "#007AFF" }]}
                onPress={() => handleContactTenant("email")}
                disabled={!tenant?.email}
              >
                <Ionicons name="mail" size={20} color="white" />
                <ThemedText style={styles.contactButtonText}>Email</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Status Actions */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.sectionTitle}>
              Application Actions
            </ThemedText>
            <View style={styles.statusActions}>
              <TouchableOpacity
                style={[styles.statusButton, styles.approveButton]}
                onPress={() => handleStatusUpdate("approved")}
                disabled={isLoading || status === "approved"}
              >
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <ThemedText style={styles.statusButtonText}>Approve</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statusButton, styles.rejectButton]}
                onPress={() => handleStatusUpdate("rejected")}
                disabled={isLoading || status === "rejected"}
              >
                <Ionicons name="close-circle" size={20} color="white" />
                <ThemedText style={styles.statusButtonText}>Reject</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statusButton, styles.pendingButton]}
                onPress={() => handleStatusUpdate("pending")}
                disabled={isLoading || status === "pending"}
              >
                <Ionicons name="time" size={20} color="white" />
                <ThemedText style={styles.statusButtonText}>Pending</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// Helper component for info rows
const InfoRow = ({ label, value }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={styles.infoRow}>
      <ThemedText style={styles.infoLabel}>{label}</ThemedText>
      <ThemedText style={[styles.infoValue, { color: colors.text }]}>
        {value}
      </ThemedText>
    </View>
  );
};

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
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusIconContainer: {
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: "600",
  },
  applicationDate: {
    fontSize: 14,
    opacity: 0.7,
  },
  section: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  roomInfo: {
    marginBottom: 8,
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  roomMeta: {
    marginBottom: 4,
  },
  roomDetail: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.8,
  },
  roomProperty: {
    fontSize: 14,
    opacity: 0.6,
  },
  infoGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    opacity: 0.9,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.7,
    flex: 1,
    marginRight: 16,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  contactActions: {
    flexDirection: "row",
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  contactButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  statusActions: {
    flexDirection: "row",
    gap: 12,
  },
  statusButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  approveButton: {
    backgroundColor: "#34C759",
  },
  rejectButton: {
    backgroundColor: "#FF3B30",
  },
  pendingButton: {
    backgroundColor: "#FF9500",
  },
  statusButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 40,
  },
});
