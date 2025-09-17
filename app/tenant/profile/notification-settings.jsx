import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function NotificationSettings() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    // General Settings
    pushNotifications: true,
    emailNotifications: true,

    // Bill & Payment Notifications
    billReminders: true,
    paymentDue: true,
    paymentConfirmation: true,
    lateFees: true,

    // Maintenance & Property
    maintenanceUpdates: true,
    propertyAnnouncements: true,
    emergencyAlerts: true,

    // Communication
    landlordMessages: true,
    systemUpdates: false,
    marketingEmails: false,
  });

  const [notificationTiming, setNotificationTiming] = useState({
    billReminderDays: 3, // Days before due date
    quietHoursEnabled: true,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real app, this would save to backend
      console.log("Notification settings saved:", notifications);

      Alert.alert(
        "Settings Saved",
        "Your notification preferences have been updated successfully.",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const notificationSections = [
    {
      title: "General",
      description: "Control overall notification delivery",
      items: [
        {
          key: "pushNotifications",
          title: "Push Notifications",
          description: "Receive notifications on this device",
          icon: "notifications-outline",
        },
        {
          key: "emailNotifications",
          title: "Email Notifications",
          description: "Receive notifications via email",
          icon: "mail-outline",
        },
      ],
    },
    {
      title: "Bills & Payments",
      description: "Stay updated on payment schedules and confirmations",
      items: [
        {
          key: "billReminders",
          title: "Bill Reminders",
          description: "Get reminded about upcoming bills",
          icon: "calendar-outline",
        },
        {
          key: "paymentDue",
          title: "Payment Due Alerts",
          description: "Notifications when payment is due soon",
          icon: "alarm-outline",
        },
        {
          key: "paymentConfirmation",
          title: "Payment Confirmations",
          description: "Confirm when payments are processed",
          icon: "checkmark-circle-outline",
        },
        {
          key: "lateFees",
          title: "Late Fee Warnings",
          description: "Alerts about potential late fees",
          icon: "warning-outline",
        },
      ],
    },
    {
      title: "Property & Maintenance",
      description: "Updates about your property and maintenance requests",
      items: [
        {
          key: "maintenanceUpdates",
          title: "Maintenance Updates",
          description: "Status updates on your maintenance requests",
          icon: "construct-outline",
        },
        {
          key: "propertyAnnouncements",
          title: "Property Announcements",
          description: "Important updates from property management",
          icon: "megaphone-outline",
        },
        {
          key: "emergencyAlerts",
          title: "Emergency Alerts",
          description: "Critical safety and emergency notifications",
          icon: "alert-circle-outline",
        },
      ],
    },
    {
      title: "Communication",
      description: "Messages and updates from the system",
      items: [
        {
          key: "landlordMessages",
          title: "Landlord Messages",
          description: "Direct messages from your landlord",
          icon: "chatbubble-outline",
        },
        {
          key: "systemUpdates",
          title: "System Updates",
          description: "App updates and new feature announcements",
          icon: "refresh-outline",
        },
        {
          key: "marketingEmails",
          title: "Marketing Communications",
          description: "Promotional offers and tips",
          icon: "gift-outline",
        },
      ],
    },
  ];

  const renderNotificationItem = (item) => (
    <View
      key={item.key}
      style={[styles.notificationItem, { backgroundColor: colors.background }]}
    >
      <View style={styles.notificationInfo}>
        <View style={styles.notificationIcon}>
          <Ionicons
            name={item.icon}
            size={20}
            color={notifications[item.key] ? colors.tint : colors.text + "60"}
          />
        </View>
        <View style={styles.notificationContent}>
          <ThemedText style={styles.notificationTitle}>{item.title}</ThemedText>
          <ThemedText style={styles.notificationDescription}>
            {item.description}
          </ThemedText>
        </View>
      </View>
      <Switch
        value={notifications[item.key]}
        onValueChange={() => handleNotificationToggle(item.key)}
        trackColor={{
          false: colors.text + "30",
          true: colors.tint + "50",
        }}
        thumbColor={notifications[item.key] ? colors.tint : colors.text}
      />
    </View>
  );

  const renderSection = (section) => (
    <ThemedView
      key={section.title}
      style={[styles.section, { backgroundColor: colors.card }]}
    >
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
        <ThemedText style={styles.sectionDescription}>
          {section.description}
        </ThemedText>
      </View>
      <View style={styles.sectionContent}>
        {section.items.map(renderNotificationItem)}
      </View>
    </ThemedView>
  );

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
        <ThemedText style={styles.headerTitle}>
          Notification Settings
        </ThemedText>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveSettings}
          disabled={isLoading}
        >
          <ThemedText style={[styles.saveText, { color: colors.tint }]}>
            {isLoading ? "Saving..." : "Save"}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <View style={styles.summaryIcon}>
            <Ionicons name="notifications" size={24} color={colors.tint} />
          </View>
          <View style={styles.summaryContent}>
            <ThemedText style={styles.summaryTitle}>Stay Informed</ThemedText>
            <ThemedText style={styles.summaryText}>
              Customize which notifications you receive to stay updated on what
              matters most to you.
            </ThemedText>
          </View>
        </View>

        {/* Notification Sections */}
        {notificationSections.map(renderSection)}

        {/* Quiet Hours Section */}
        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Quiet Hours</ThemedText>
            <ThemedText style={styles.sectionDescription}>
              Limit notifications during certain hours
            </ThemedText>
          </View>

          <View style={styles.sectionContent}>
            <View
              style={[
                styles.notificationItem,
                { backgroundColor: colors.background },
              ]}
            >
              <View style={styles.notificationInfo}>
                <View style={styles.notificationIcon}>
                  <Ionicons
                    name="moon-outline"
                    size={20}
                    color={
                      notificationTiming.quietHoursEnabled
                        ? colors.tint
                        : colors.text + "60"
                    }
                  />
                </View>
                <View style={styles.notificationContent}>
                  <ThemedText style={styles.notificationTitle}>
                    Enable Quiet Hours
                  </ThemedText>
                  <ThemedText style={styles.notificationDescription}>
                    {notificationTiming.quietHoursEnabled
                      ? `${notificationTiming.quietHoursStart} - ${notificationTiming.quietHoursEnd}`
                      : "Notifications will be delivered anytime"}
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={notificationTiming.quietHoursEnabled}
                onValueChange={(value) =>
                  setNotificationTiming((prev) => ({
                    ...prev,
                    quietHoursEnabled: value,
                  }))
                }
                trackColor={{
                  false: colors.text + "30",
                  true: colors.tint + "50",
                }}
                thumbColor={
                  notificationTiming.quietHoursEnabled
                    ? colors.tint
                    : colors.text
                }
              />
            </View>

            {notificationTiming.quietHoursEnabled && (
              <View style={styles.quietHoursDetails}>
                <ThemedText style={styles.quietHoursNote}>
                  Emergency alerts will still be delivered during quiet hours
                </ThemedText>
              </View>
            )}
          </View>
        </ThemedView>

        {/* Notification Statistics */}
        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Notification Activity
            </ThemedText>
            <ThemedText style={styles.sectionDescription}>
              Your notification history this month
            </ThemedText>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>47</ThemedText>
              <ThemedText style={styles.statLabel}>Total Sent</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>3</ThemedText>
              <ThemedText style={styles.statLabel}>Bill Reminders</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>2</ThemedText>
              <ThemedText style={styles.statLabel}>Maintenance</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>12</ThemedText>
              <ThemedText style={styles.statLabel}>Messages</ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Test Notification */}
        <View style={styles.testSection}>
          <TouchableOpacity
            style={[
              styles.testButton,
              { backgroundColor: colors.tint + "20", borderColor: colors.tint },
            ]}
            onPress={() =>
              Alert.alert(
                "Test Notification",
                "This is how your notifications will look!"
              )
            }
          >
            <Ionicons name="send-outline" size={20} color={colors.tint} />
            <ThemedText style={[styles.testButtonText, { color: colors.tint }]}>
              Send Test Notification
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  saveButton: {
    padding: 4,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#007AFF20",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  sectionContent: {
    gap: 1,
  },
  notificationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
  },
  notificationInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 16,
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#F0F0F0",
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  notificationDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 18,
  },
  quietHoursDetails: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  quietHoursNote: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: "italic",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
  },
  testSection: {
    padding: 16,
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
