import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  generateMessageTemplate,
  getCurrentTenantProfile,
  makePhoneCall,
  notifyLandlordOfApplication,
  sendEmail,
  sendSMSMessage,
} from "@/utils/communicationHelpers";

const { width } = Dimensions.get("window");

export default function MessageModal({
  visible,
  onClose,
  landlordInfo,
  roomInfo,
  messageType = "inquire",
  onApply,
  onBookmark,
}) {
  const [customMessage, setCustomMessage] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const defaultMessage = generateMessageTemplate(
    messageType,
    roomInfo,
    landlordInfo
  );

  const handleSendMessage = (method) => {
    const messageToSend = isCustomMode ? customMessage : defaultMessage;

    if (!messageToSend.trim()) {
      Alert.alert("Error", "Please enter a message");
      return;
    }

    const landlordName = landlordInfo?.name || "Property Owner";
    const phone = landlordInfo?.phone;
    const email = landlordInfo?.email;

    switch (method) {
      case "sms":
        if (phone) {
          sendSMSMessage(phone, messageToSend, landlordName);
          onClose();
        } else {
          Alert.alert("Error", "Phone number not available");
        }
        break;
      case "email":
        if (email) {
          const subject = `Inquiry about ${roomInfo?.title || "Room"}`;
          sendEmail(email, subject, messageToSend, landlordName);
          onClose();
        } else {
          Alert.alert("Error", "Email address not available");
        }
        break;
      case "call":
        if (phone) {
          makePhoneCall(phone, landlordName);
          onClose();
        } else {
          Alert.alert("Error", "Phone number not available");
        }
        break;
      default:
        Alert.alert("Error", "Invalid contact method");
    }
  };

  const handleApplyNow = () => {
    Alert.alert(
      "Submit Application",
      "Are you sure you want to submit your application for this room?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          onPress: async () => {
            try {
              if (onApply) {
                // If parent component provided onApply callback, use it
                onApply("Application submitted through BoardingHub app");
              } else {
                // Handle application directly in modal
                const tenantProfile = await getCurrentTenantProfile();

                const notificationResult = await notifyLandlordOfApplication(
                  landlordInfo,
                  roomInfo,
                  tenantProfile
                );

                if (notificationResult.success) {
                  Alert.alert(
                    "Application Submitted!",
                    "Your application has been submitted successfully! The landlord will be notified in their notifications panel and will contact you soon."
                  );
                } else {
                  Alert.alert(
                    "Application Error",
                    notificationResult.message ||
                      "Failed to submit your application. Please try again."
                  );
                }
              }
            } catch (error) {
              console.error("Error in application submission:", error);
              Alert.alert(
                "Application Error",
                "There was an error processing your application. Please try again or contact the landlord directly."
              );
            }
            onClose();
          },
        },
      ]
    );
  };

  const handleBookmark = () => {
    if (onBookmark) {
      onBookmark();
    } else {
      Alert.alert(
        "Success",
        "Room has been bookmarked! You can find it in your saved listings."
      );
    }
    onClose();
  };

  const getMessageTypeTitle = () => {
    const titles = {
      inquire: "Send Inquiry",
      apply: "Send Application",
      schedule: "Schedule Viewing",
      negotiate: "Negotiate Terms",
      followup: "Follow Up",
    };
    return titles[messageType] || "Send Message";
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
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>
              {getMessageTypeTitle()}
            </ThemedText>
            <View style={styles.headerSpacer} />
          </View>

          {/* Landlord Info */}
          <View style={[styles.landlordInfo, { backgroundColor: colors.card }]}>
            <View
              style={[
                styles.landlordAvatar,
                { backgroundColor: colors.tint + "20" },
              ]}
            >
              <ThemedText
                style={[styles.landlordInitials, { color: colors.tint }]}
              >
                {(landlordInfo?.name || "PO")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </ThemedText>
            </View>
            <View style={styles.landlordDetails}>
              <View style={styles.landlordNameRow}>
                <ThemedText style={styles.landlordName}>
                  {landlordInfo?.name || "Property Owner"}
                </ThemedText>
                {landlordInfo?.verified && (
                  <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                )}
              </View>
              <ThemedText style={styles.roomTitle}>
                {roomInfo?.title || "Room Inquiry"}
              </ThemedText>
              {landlordInfo?.phone && (
                <ThemedText style={styles.contactInfo}>
                  📞 {landlordInfo.phone}
                </ThemedText>
              )}
              {landlordInfo?.email && (
                <ThemedText style={styles.contactInfo}>
                  📧 {landlordInfo.email}
                </ThemedText>
              )}
            </View>
          </View>

          {/* Application Info */}
          {messageType === "apply" && (
            <View style={styles.applicationInfo}>
              <ThemedText style={styles.applicationTitle}>
                Ready to Apply?
              </ThemedText>
              <ThemedText style={styles.applicationDescription}>
                Your application will be submitted directly to the landlord.
                They will review your application and contact you using the
                information from your profile.
              </ThemedText>
              <ThemedText style={styles.contactNote}>
                💡 Need to contact the landlord? Visit the Contact page for
                messaging options.
              </ThemedText>
            </View>
          )}

          {/* Message Content - Only for non-apply message types */}
          {messageType !== "apply" && (
            <>
              {/* Message Type Toggle */}
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    !isCustomMode && { backgroundColor: colors.tint + "20" },
                    { borderColor: colors.border },
                  ]}
                  onPress={() => setIsCustomMode(false)}
                >
                  <ThemedText
                    style={[
                      styles.toggleText,
                      !isCustomMode && {
                        color: colors.tint,
                        fontWeight: "600",
                      },
                    ]}
                  >
                    Template
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    isCustomMode && { backgroundColor: colors.tint + "20" },
                    { borderColor: colors.border },
                  ]}
                  onPress={() => setIsCustomMode(true)}
                >
                  <ThemedText
                    style={[
                      styles.toggleText,
                      isCustomMode && { color: colors.tint, fontWeight: "600" },
                    ]}
                  >
                    Custom
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <View style={styles.messageContainer}>
                <ThemedText style={styles.messageLabel}>Message:</ThemedText>
                <TextInput
                  style={[
                    styles.messageInput,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={isCustomMode ? customMessage : defaultMessage}
                  onChangeText={isCustomMode ? setCustomMessage : undefined}
                  multiline
                  textAlignVertical="top"
                  placeholder={isCustomMode ? "Type your message here..." : ""}
                  placeholderTextColor={colors.text + "60"}
                  editable={isCustomMode}
                />
              </View>
            </>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {messageType === "apply" ? (
              // Apply-specific buttons
              <View style={styles.applyActions}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.bookmarkButton,
                    { backgroundColor: colors.card, borderColor: colors.tint },
                  ]}
                  onPress={() => handleBookmark()}
                >
                  <Ionicons
                    name="bookmark-outline"
                    size={20}
                    color={colors.tint}
                  />
                  <ThemedText
                    style={[styles.actionText, { color: colors.tint }]}
                  >
                    Bookmark
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.applyNowButton,
                    { backgroundColor: colors.tint },
                  ]}
                  onPress={() => handleApplyNow()}
                >
                  <Ionicons name="paper-plane" size={20} color="white" />
                  <ThemedText style={[styles.actionText, { color: "white" }]}>
                    Apply Now
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              // Regular contact options for other message types
              <>
                <View style={styles.primaryActions}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      styles.messageButton,
                      { backgroundColor: colors.tint },
                    ]}
                    onPress={() => handleSendMessage("sms")}
                    disabled={!landlordInfo?.phone}
                  >
                    <Ionicons name="chatbubble" size={20} color="white" />
                    <ThemedText style={[styles.actionText, { color: "white" }]}>
                      Send SMS
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      styles.emailButton,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.tint,
                      },
                    ]}
                    onPress={() => handleSendMessage("email")}
                    disabled={!landlordInfo?.email}
                  >
                    <Ionicons name="mail" size={20} color={colors.tint} />
                    <ThemedText
                      style={[styles.actionText, { color: colors.tint }]}
                    >
                      Send Email
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                {/* Quick Call Button */}
                {landlordInfo?.phone && (
                  <TouchableOpacity
                    style={[styles.callButton, { backgroundColor: "#34C759" }]}
                    onPress={() => handleSendMessage("call")}
                  >
                    <Ionicons name="call" size={20} color="white" />
                    <ThemedText style={[styles.actionText, { color: "white" }]}>
                      Call Now
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 32,
  },
  landlordInfo: {
    flexDirection: "row",
    padding: 16,
    margin: 16,
    borderRadius: 12,
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
  landlordDetails: {
    flex: 1,
  },
  landlordNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  landlordName: {
    fontSize: 16,
    fontWeight: "600",
  },
  roomTitle: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  toggleContainer: {
    flexDirection: "row",
    margin: 16,
    marginBottom: 0,
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "500",
  },
  messageContainer: {
    flex: 1,
    margin: 16,
  },
  messageLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    lineHeight: 22,
  },
  actionButtons: {
    padding: 16,
    gap: 12,
  },
  primaryActions: {
    flexDirection: "row",
    gap: 12,
  },
  applyActions: {
    flexDirection: "row",
    gap: 12,
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
  messageButton: {
    // backgroundColor set dynamically
  },
  emailButton: {
    borderWidth: 1,
  },
  bookmarkButton: {
    borderWidth: 1,
  },
  applyNowButton: {
    // backgroundColor set dynamically
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
  },
  applicationInfo: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
  },
  applicationTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  applicationDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    textAlign: "center",
    marginBottom: 16,
  },
  contactNote: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
    fontStyle: "italic",
  },
});
