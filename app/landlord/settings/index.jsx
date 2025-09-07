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
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("English");

  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const SettingToggle = ({
    title,
    subtitle,
    value,
    onValueChange,
    disabled = false,
  }) => (
    <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
      <View style={styles.settingContent}>
        <ThemedText style={[styles.settingTitle, disabled && { opacity: 0.5 }]}>
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText
            style={[styles.settingSubtitle, disabled && { opacity: 0.5 }]}
          >
            {subtitle}
          </ThemedText>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#E5E5E7", true: colors.tint + "80" }}
        thumbColor={value ? colors.tint : "#FFFFFF"}
        disabled={disabled}
      />
    </View>
  );

  const SettingButton = ({
    title,
    subtitle,
    icon,
    onPress,
    showArrow = true,
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: colors.card }]}
      onPress={onPress}
    >
      <View style={styles.settingContent}>
        <View style={styles.settingHeader}>
          {icon && (
            <View
              style={[
                styles.settingIcon,
                { backgroundColor: icon.color + "20" },
              ]}
            >
              <Ionicons name={icon.name} size={20} color={icon.color} />
            </View>
          )}
          <View style={styles.settingTextContainer}>
            <ThemedText style={styles.settingTitle}>{title}</ThemedText>
            {subtitle && (
              <ThemedText style={styles.settingSubtitle}>{subtitle}</ThemedText>
            )}
          </View>
        </View>
      </View>
      {showArrow && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.tabIconDefault}
        />
      )}
    </TouchableOpacity>
  );

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
        <ThemedText style={styles.headerTitle}>Settings</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Account Settings */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Account</ThemedText>
          <View style={styles.settingsContainer}>
            <SettingButton
              title="Profile Settings"
              subtitle="Manage your personal information"
              icon={{ name: "person-outline", color: "#007AFF" }}
              onPress={() => router.push("/landlord/profile")}
            />
            <SettingButton
              title="Change Password"
              subtitle="Update your account password"
              icon={{ name: "lock-closed-outline", color: "#34C759" }}
              onPress={() => router.push("/landlord/profile/change-password")}
            />
            <SettingButton
              title="Privacy Settings"
              subtitle="Control your data and privacy"
              icon={{ name: "shield-outline", color: "#FF9500" }}
              onPress={() =>
                Alert.alert("Coming Soon", "Privacy settings coming soon!")
              }
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Notifications</ThemedText>
          <View style={styles.settingsContainer}>
            <SettingToggle
              title="Push Notifications"
              subtitle="Receive notifications on your device"
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
            <SettingToggle
              title="Email Notifications"
              subtitle="Receive email updates and alerts"
              value={autoBackup}
              onValueChange={setAutoBackup}
            />
          </View>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Security</ThemedText>
          <View style={styles.settingsContainer}>
            <SettingToggle
              title="Biometric Authentication"
              subtitle="Use fingerprint or face unlock"
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
            />
            <SettingButton
              title="Two-Factor Authentication"
              subtitle="Add an extra layer of security"
              icon={{ name: "key-outline", color: "#FF3B30" }}
              onPress={() =>
                Alert.alert("Coming Soon", "2FA setup coming soon!")
              }
            />
          </View>
        </View>

        {/* Data & Storage */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Data & Storage</ThemedText>
          <View style={styles.settingsContainer}>
            <SettingToggle
              title="Auto Backup"
              subtitle="Automatically backup your data"
              value={autoBackup}
              onValueChange={setAutoBackup}
            />
            <SettingButton
              title="Data Export"
              subtitle="Export your account data"
              icon={{ name: "download-outline", color: "#8E8E93" }}
              onPress={() =>
                Alert.alert("Coming Soon", "Data export coming soon!")
              }
            />
            <SettingButton
              title="Clear Cache"
              subtitle="Free up storage space"
              icon={{ name: "trash-outline", color: "#FF3B30" }}
              onPress={() =>
                Alert.alert(
                  "Cache Cleared",
                  "App cache has been cleared successfully!"
                )
              }
            />
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Appearance</ThemedText>
          <View style={styles.settingsContainer}>
            <SettingToggle
              title="Dark Mode"
              subtitle="Switch to dark theme"
              value={darkMode}
              onValueChange={setDarkMode}
              disabled={true} // For demo purposes
            />
            <SettingButton
              title="Language"
              subtitle={`Current: ${language}`}
              icon={{ name: "language-outline", color: "#007AFF" }}
              onPress={() =>
                Alert.alert("Language", "Language selection coming soon!")
              }
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Support & Help</ThemedText>
          <View style={styles.settingsContainer}>
            <SettingButton
              title="Help Center"
              subtitle="Get help and find answers"
              icon={{ name: "help-circle-outline", color: "#34C759" }}
              onPress={() =>
                Alert.alert("Coming Soon", "Help center coming soon!")
              }
            />
            <SettingButton
              title="Contact Support"
              subtitle="Get in touch with our team"
              icon={{ name: "chatbubble-outline", color: "#FF9500" }}
              onPress={() =>
                Alert.alert("Contact Support", "support@boardinghub.com")
              }
            />
            <SettingButton
              title="Report Issue"
              subtitle="Report bugs or suggest improvements"
              icon={{ name: "bug-outline", color: "#FF3B30" }}
              onPress={() =>
                Alert.alert("Report Issue", "Issue reporting coming soon!")
              }
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>About</ThemedText>
          <View style={styles.settingsContainer}>
            <SettingButton
              title="App Version"
              subtitle="BoardingHub v1.0.0"
              icon={{ name: "information-circle-outline", color: "#8E8E93" }}
              onPress={() =>
                Alert.alert(
                  "App Version",
                  "BoardingHub v1.0.0\n© 2024 BoardingHub"
                )
              }
              showArrow={false}
            />
            <SettingButton
              title="Terms of Service"
              subtitle="Read our terms and conditions"
              icon={{ name: "document-text-outline", color: "#007AFF" }}
              onPress={() =>
                Alert.alert("Coming Soon", "Terms of service coming soon!")
              }
            />
            <SettingButton
              title="Privacy Policy"
              subtitle="Learn about our privacy practices"
              icon={{ name: "shield-checkmark-outline", color: "#34C759" }}
              onPress={() =>
                Alert.alert("Coming Soon", "Privacy policy coming soon!")
              }
            />
          </View>
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
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  settingsContainer: {
    gap: 8,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
});
