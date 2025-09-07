import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
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

export default function PreviewNotificationScreen() {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState("now");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const { subject, message, templateId, recipients, recipientIds } = params;

  // Parse recipients data
  const recipientList = recipients ? JSON.parse(recipients) : [];
  const recipientIdsList = recipientIds ? JSON.parse(recipientIds) : [];

  const scheduleOptions = [
    { id: "now", label: "Send Now", description: "Send immediately" },
    {
      id: "morning",
      label: "Tomorrow Morning",
      description: "Send at 9:00 AM tomorrow",
    },
    {
      id: "afternoon",
      label: "Tomorrow Afternoon",
      description: "Send at 2:00 PM tomorrow",
    },
    {
      id: "custom",
      label: "Custom Time",
      description: "Choose specific date and time",
    },
  ];

  const handleSend = () => {
    const scheduleText =
      scheduleOptions.find((opt) => opt.id === selectedSchedule)?.label ||
      "Now";

    Alert.alert(
      "Send Notification",
      `Send "${subject}" to ${recipientList.length} recipient${
        recipientList.length > 1 ? "s" : ""
      }?\n\nSchedule: ${scheduleText}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          style: "default",
          onPress: () => {
            // Mock send functionality
            Alert.alert(
              "Success!",
              `Notification sent to ${recipientList.length} recipient${
                recipientList.length > 1 ? "s" : ""
              }`,
              [
                {
                  text: "OK",
                  onPress: () => {
                    router.dismissAll();
                    router.replace("/landlord/notifications");
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const renderRecipient = (recipient) => (
    <View key={recipient.id} style={styles.recipientItem}>
      <View style={styles.recipientAvatar}>
        <ThemedText style={styles.recipientAvatarText}>
          {recipient.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </ThemedText>
      </View>
      <View style={styles.recipientInfo}>
        <ThemedText style={styles.recipientName}>{recipient.name}</ThemedText>
        <ThemedText style={styles.recipientRoom}>
          Room {recipient.roomNumber}
        </ThemedText>
      </View>
    </View>
  );

  const renderScheduleOption = (option) => (
    <TouchableOpacity
      key={option.id}
      style={[
        styles.scheduleOption,
        {
          backgroundColor:
            selectedSchedule === option.id ? colors.tint + "20" : colors.card,
          borderColor:
            selectedSchedule === option.id ? colors.tint : colors.border,
        },
      ]}
      onPress={() => setSelectedSchedule(option.id)}
    >
      <View style={styles.scheduleOptionContent}>
        <ThemedText style={styles.scheduleOptionLabel}>
          {option.label}
        </ThemedText>
        <ThemedText style={styles.scheduleOptionDescription}>
          {option.description}
        </ThemedText>
      </View>
      {selectedSchedule === option.id && (
        <Ionicons name="checkmark-circle" size={24} color={colors.tint} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Preview Message</ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Recipients Summary */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Recipients ({recipientList.length})
            </ThemedText>
            <View style={styles.recipientsContainer}>
              {recipientList.slice(0, 3).map(renderRecipient)}
              {recipientList.length > 3 && (
                <View style={styles.moreRecipients}>
                  <ThemedText style={styles.moreRecipientsText}>
                    +{recipientList.length - 3} more
                  </ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* Message Preview */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Message Preview</ThemedText>
            <View
              style={[styles.messagePreview, { backgroundColor: colors.card }]}
            >
              <ThemedText style={styles.messageSubject}>{subject}</ThemedText>
              <View style={styles.messageDivider} />
              <ThemedText style={styles.messageBody}>{message}</ThemedText>
            </View>
          </View>

          {/* Schedule Options */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Send Schedule</ThemedText>
            <TouchableOpacity
              style={[
                styles.scheduleSelector,
                { backgroundColor: colors.card },
              ]}
              onPress={() => setShowScheduleModal(true)}
            >
              <View style={styles.scheduleSelectorContent}>
                <Ionicons name="time-outline" size={20} color={colors.text} />
                <ThemedText style={styles.scheduleSelectorText}>
                  {
                    scheduleOptions.find((opt) => opt.id === selectedSchedule)
                      ?.label
                  }
                </ThemedText>
              </View>
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.tabIconDefault}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View
          style={[styles.bottomActions, { backgroundColor: colors.background }]}
        >
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.tint }]}
            onPress={handleSend}
          >
            <Ionicons name="send" size={20} color="white" />
            <ThemedText style={styles.sendButtonText}>
              Send Notification
            </ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Schedule Modal */}
      <Modal
        visible={showScheduleModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowScheduleModal(false)}
      >
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowScheduleModal(false)}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>Choose Send Time</ThemedText>
            <View style={styles.modalHeaderSpacer} />
          </View>

          <ScrollView
            style={styles.modalScrollView}
            showsVerticalScrollIndicator={false}
          >
            {scheduleOptions.map(renderScheduleOption)}
          </ScrollView>

          <View
            style={[
              styles.modalActions,
              { backgroundColor: colors.background },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.modalConfirmButton,
                { backgroundColor: colors.tint },
              ]}
              onPress={() => setShowScheduleModal(false)}
            >
              <ThemedText style={styles.modalConfirmText}>Confirm</ThemedText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
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
    fontSize: 20,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  recipientsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  recipientItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  recipientAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  recipientAvatarText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  recipientInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  recipientName: {
    fontSize: 12,
    fontWeight: "500",
  },
  recipientRoom: {
    fontSize: 10,
    opacity: 0.7,
    marginLeft: 4,
  },
  moreRecipients: {
    backgroundColor: "#E5E5E7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  moreRecipientsText: {
    fontSize: 12,
    fontWeight: "500",
  },
  messagePreview: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  messageSubject: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  messageDivider: {
    height: 1,
    backgroundColor: "#E5E5E7",
    marginBottom: 12,
  },
  messageBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  scheduleSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  scheduleSelectorContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  scheduleSelectorText: {
    fontSize: 16,
    marginLeft: 12,
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  modalHeaderSpacer: {
    width: 40,
  },
  modalScrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scheduleOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  scheduleOptionContent: {
    flex: 1,
  },
  scheduleOptionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  scheduleOptionDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  modalActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
  },
  modalConfirmButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
