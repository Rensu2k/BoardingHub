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

export default function PrivacySettings() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    // Data Collection
    analyticsData: false,
    usageData: true,
    crashReporting: true,

    // Profile Visibility
    profileVisible: true,
    contactInfoVisible: false,
    roomInfoVisible: true,

    // Communication
    allowMessages: true,
    allowCalls: true,
    showOnlineStatus: false,

    // Data Sharing
    shareWithLandlord: true,
    shareWithMaintenanceTeam: true,
    shareWithPropertyManager: true,

    // Location & Tracking
    locationTracking: false,
    deviceTracking: false,
  });

  const [dataRetention, setDataRetention] = useState({
    keepPaymentHistory: true,
    keepMaintenanceHistory: true,
    keepMessageHistory: true,
    autoDeleteOldData: false,
    retentionPeriod: "2years", // 1year, 2years, 5years, forever
  });

  const [isLoading, setIsLoading] = useState(false);

  const handlePrivacyToggle = (key) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleDataToggle = (key) => {
    setDataRetention((prev) => ({
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
      console.log("Privacy settings saved:", {
        privacySettings,
        dataRetention,
      });

      Alert.alert(
        "Settings Saved",
        "Your privacy preferences have been updated successfully.",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      "Delete All Data",
      "This will permanently delete all your data including payment history, messages, and documents. This action cannot be undone.\n\nAre you sure you want to continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All Data",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Data Deletion Requested",
              "Your data deletion request has been submitted. You will receive a confirmation email within 24 hours.",
              [{ text: "OK" }]
            );
          },
        },
      ]
    );
  };

  const handleDownloadData = () => {
    Alert.alert(
      "Download Your Data",
      "We'll prepare a copy of your data and send you a download link via email within 24 hours.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Request Download",
          onPress: () => {
            Alert.alert(
              "Data Export Requested",
              "You'll receive an email with your data download link within 24 hours.",
              [{ text: "OK" }]
            );
          },
        },
      ]
    );
  };

  const privacySections = [
    {
      title: "Data Collection",
      description: "Control what data we collect to improve our services",
      items: [
        {
          key: "analyticsData",
          title: "Analytics Data",
          description: "Help us improve the app by sharing usage patterns",
          icon: "analytics-outline",
        },
        {
          key: "usageData",
          title: "Usage Statistics",
          description: "Share how you use features to help us optimize",
          icon: "bar-chart-outline",
        },
        {
          key: "crashReporting",
          title: "Crash Reporting",
          description: "Send crash reports to help us fix bugs",
          icon: "bug-outline",
        },
      ],
    },
    {
      title: "Profile Visibility",
      description: "Choose who can see your profile information",
      items: [
        {
          key: "profileVisible",
          title: "Profile Visible",
          description: "Allow your profile to be visible to property staff",
          icon: "person-outline",
        },
        {
          key: "contactInfoVisible",
          title: "Contact Information",
          description: "Share your contact details with property management",
          icon: "call-outline",
        },
        {
          key: "roomInfoVisible",
          title: "Room Information",
          description: "Display your room details to maintenance team",
          icon: "home-outline",
        },
      ],
    },
    {
      title: "Communication",
      description: "Manage how others can contact you",
      items: [
        {
          key: "allowMessages",
          title: "Allow Messages",
          description: "Receive messages from landlord and property staff",
          icon: "chatbubble-outline",
        },
        {
          key: "allowCalls",
          title: "Allow Phone Calls",
          description: "Allow property staff to call you for urgent matters",
          icon: "call-outline",
        },
        {
          key: "showOnlineStatus",
          title: "Show Online Status",
          description: "Let others see when you're active in the app",
          icon: "radio-button-on-outline",
        },
      ],
    },
    {
      title: "Data Sharing",
      description: "Control data sharing with property management team",
      items: [
        {
          key: "shareWithLandlord",
          title: "Share with Landlord",
          description: "Share relevant data with your landlord",
          icon: "people-outline",
          required: true,
        },
        {
          key: "shareWithMaintenanceTeam",
          title: "Share with Maintenance",
          description: "Share data needed for maintenance requests",
          icon: "construct-outline",
        },
        {
          key: "shareWithPropertyManager",
          title: "Share with Property Manager",
          description: "Share data with property management company",
          icon: "business-outline",
        },
      ],
    },
    {
      title: "Location & Tracking",
      description: "Control location-based features and tracking",
      items: [
        {
          key: "locationTracking",
          title: "Location Services",
          description:
            "Use location for nearby services and emergency features",
          icon: "location-outline",
        },
        {
          key: "deviceTracking",
          title: "Device Analytics",
          description: "Track device information for security purposes",
          icon: "phone-portrait-outline",
        },
      ],
    },
  ];

  const renderPrivacyItem = (item) => (
    <View
      key={item.key}
      style={[styles.privacyItem, { backgroundColor: colors.background }]}
    >
      <View style={styles.privacyInfo}>
        <View style={styles.privacyIcon}>
          <Ionicons
            name={item.icon}
            size={20}
            color={privacySettings[item.key] ? colors.tint : colors.text + "60"}
          />
        </View>
        <View style={styles.privacyContent}>
          <View style={styles.titleRow}>
            <ThemedText style={styles.privacyTitle}>{item.title}</ThemedText>
            {item.required && (
              <View style={styles.requiredBadge}>
                <ThemedText style={styles.requiredText}>Required</ThemedText>
              </View>
            )}
          </View>
          <ThemedText style={styles.privacyDescription}>
            {item.description}
          </ThemedText>
        </View>
      </View>
      <Switch
        value={privacySettings[item.key]}
        onValueChange={() => handlePrivacyToggle(item.key)}
        disabled={item.required}
        trackColor={{
          false: colors.text + "30",
          true: colors.tint + "50",
        }}
        thumbColor={privacySettings[item.key] ? colors.tint : colors.text}
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
        {section.items.map(renderPrivacyItem)}
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
        <ThemedText style={styles.headerTitle}>Privacy & Security</ThemedText>
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
        {/* Privacy Overview */}
        <View style={[styles.overviewCard, { backgroundColor: colors.card }]}>
          <View style={styles.overviewIcon}>
            <Ionicons name="shield-checkmark" size={24} color={colors.tint} />
          </View>
          <View style={styles.overviewContent}>
            <ThemedText style={styles.overviewTitle}>
              Your Privacy Matters
            </ThemedText>
            <ThemedText style={styles.overviewText}>
              Control your data and privacy settings. We're committed to
              protecting your personal information.
            </ThemedText>
          </View>
        </View>

        {/* Privacy Sections */}
        {privacySections.map(renderSection)}

        {/* Data Retention */}
        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Data Retention</ThemedText>
            <ThemedText style={styles.sectionDescription}>
              Control how long we keep your data
            </ThemedText>
          </View>

          <View style={styles.sectionContent}>
            <View
              style={[
                styles.privacyItem,
                { backgroundColor: colors.background },
              ]}
            >
              <View style={styles.privacyInfo}>
                <View style={styles.privacyIcon}>
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color={
                      dataRetention.autoDeleteOldData
                        ? colors.tint
                        : colors.text + "60"
                    }
                  />
                </View>
                <View style={styles.privacyContent}>
                  <ThemedText style={styles.privacyTitle}>
                    Auto-Delete Old Data
                  </ThemedText>
                  <ThemedText style={styles.privacyDescription}>
                    Automatically delete data older than 2 years
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={dataRetention.autoDeleteOldData}
                onValueChange={() => handleDataToggle("autoDeleteOldData")}
                trackColor={{
                  false: colors.text + "30",
                  true: colors.tint + "50",
                }}
                thumbColor={
                  dataRetention.autoDeleteOldData ? colors.tint : colors.text
                }
              />
            </View>
          </View>
        </ThemedView>

        {/* Data Management */}
        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Data Management</ThemedText>
            <ThemedText style={styles.sectionDescription}>
              Manage your personal data and account
            </ThemedText>
          </View>

          <View style={styles.dataActions}>
            <TouchableOpacity
              style={[
                styles.dataButton,
                {
                  backgroundColor: colors.tint + "20",
                  borderColor: colors.tint,
                },
              ]}
              onPress={handleDownloadData}
            >
              <Ionicons name="download-outline" size={20} color={colors.tint} />
              <View style={styles.dataButtonContent}>
                <ThemedText
                  style={[styles.dataButtonTitle, { color: colors.tint }]}
                >
                  Download My Data
                </ThemedText>
                <ThemedText style={styles.dataButtonDescription}>
                  Get a copy of all your data
                </ThemedText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dataButton,
                { backgroundColor: "#FF3B3020", borderColor: "#FF3B30" },
              ]}
              onPress={handleDeleteAllData}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <View style={styles.dataButtonContent}>
                <ThemedText
                  style={[styles.dataButtonTitle, { color: "#FF3B30" }]}
                >
                  Delete All Data
                </ThemedText>
                <ThemedText style={styles.dataButtonDescription}>
                  Permanently remove all your data
                </ThemedText>
              </View>
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Privacy Policy */}
        <View style={styles.footerSection}>
          <TouchableOpacity
            style={styles.policyButton}
            onPress={() =>
              Alert.alert(
                "Privacy Policy",
                "Privacy policy will open in browser"
              )
            }
          >
            <Ionicons
              name="document-text-outline"
              size={20}
              color={colors.tint}
            />
            <ThemedText style={[styles.policyText, { color: colors.tint }]}>
              View Privacy Policy
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.policyButton}
            onPress={() =>
              Alert.alert(
                "Terms of Service",
                "Terms of service will open in browser"
              )
            }
          >
            <Ionicons name="document-outline" size={20} color={colors.tint} />
            <ThemedText style={[styles.policyText, { color: colors.tint }]}>
              View Terms of Service
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
  overviewCard: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  overviewIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#007AFF20",
    alignItems: "center",
    justifyContent: "center",
  },
  overviewContent: {
    flex: 1,
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  overviewText: {
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
  privacyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
  },
  privacyInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 16,
  },
  privacyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#F0F0F0",
  },
  privacyContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  requiredBadge: {
    backgroundColor: "#FF9500",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  privacyDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 18,
  },
  dataActions: {
    gap: 12,
  },
  dataButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  dataButtonContent: {
    flex: 1,
  },
  dataButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  dataButtonDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  footerSection: {
    padding: 16,
    gap: 8,
  },
  policyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
  },
  policyText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
