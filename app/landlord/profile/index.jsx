import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { currentUser } from "../data/userData";

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    ...currentUser,
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const handleSave = () => {
    Alert.alert("Success", "Profile updated successfully!");
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      ...currentUser,
    });
    setIsEditing(false);
  };

  const updateFormField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const ProfileField = ({
    label,
    value,
    field,
    placeholder,
    keyboardType = "default",
    multiline = false,
  }) => (
    <View style={styles.fieldContainer}>
      <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
      {isEditing ? (
        <TextInput
          style={[
            styles.fieldInput,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          value={formData[field]}
          onChangeText={(text) => updateFormField(field, text)}
          placeholder={placeholder}
          placeholderTextColor={colors.text + "60"}
          keyboardType={keyboardType}
          multiline={multiline}
          maxLength={field === "bio" ? 200 : 100}
        />
      ) : (
        <ThemedText style={styles.fieldValue}>{value}</ThemedText>
      )}
    </View>
  );

  const SettingToggle = ({ title, subtitle, value, onValueChange }) => (
    <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
      <View style={styles.settingContent}>
        <ThemedText style={styles.settingTitle}>{title}</ThemedText>
        {subtitle && (
          <ThemedText style={styles.settingSubtitle}>{subtitle}</ThemedText>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#E5E5E7", true: colors.tint + "80" }}
        thumbColor={value ? colors.tint : "#FFFFFF"}
      />
    </View>
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
        <ThemedText style={styles.headerTitle}>Profile Settings</ThemedText>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push("/landlord/settings")}
        >
          <Ionicons name="settings-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          <View
            style={[
              styles.profilePicture,
              { backgroundColor: colors.tint + "20" },
            ]}
          >
            <Ionicons name="person-outline" size={48} color={colors.tint} />
          </View>
          {isEditing && (
            <TouchableOpacity style={styles.changePhotoButton}>
              <Ionicons name="camera-outline" size={20} color={colors.tint} />
              <ThemedText
                style={[styles.changePhotoText, { color: colors.tint }]}
              >
                Change Photo
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Personal Information
          </ThemedText>
          <View
            style={[styles.sectionContent, { backgroundColor: colors.card }]}
          >
            <ProfileField
              label="Full Name"
              value={formData.name}
              field="name"
              placeholder="Enter your full name"
            />
            <ProfileField
              label="Email"
              value={formData.email}
              field="email"
              placeholder="Enter your email"
              keyboardType="email-address"
            />
            <ProfileField
              label="GCash Number"
              value={formData.gcash}
              field="gcash"
              placeholder="Enter your GCash number"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Business Information */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Business Information
          </ThemedText>
          <View
            style={[styles.sectionContent, { backgroundColor: colors.card }]}
          >
            <ProfileField
              label="Company Name"
              value={formData.company}
              field="company"
              placeholder="Enter your company name"
            />
            <ProfileField
              label="Business Address"
              value={formData.address}
              field="address"
              placeholder="Enter your business address"
            />
            <ProfileField
              label="Website"
              value={formData.website}
              field="website"
              placeholder="Enter your website URL"
              keyboardType="url"
            />
            <ProfileField
              label="Bio"
              value={formData.bio}
              field="bio"
              placeholder="Tell us about yourself..."
              multiline={true}
            />
          </View>
        </View>

        {/* Notification Preferences */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Notification Preferences
          </ThemedText>
          <View style={styles.settingsContainer}>
            <SettingToggle
              title="Push Notifications"
              subtitle="Receive notifications about payments and updates"
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
            <SettingToggle
              title="Email Updates"
              subtitle="Receive email updates about your account"
              value={emailUpdates}
              onValueChange={setEmailUpdates}
            />
            <SettingToggle
              title="Marketing Emails"
              subtitle="Receive promotional emails and updates"
              value={marketingEmails}
              onValueChange={setMarketingEmails}
            />
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Account Actions</ThemedText>
          <View style={styles.settingsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card }]}
              onPress={() => router.push("/landlord/profile/change-password")}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.text}
              />
              <ThemedText style={styles.actionButtonText}>
                Change Password
              </ThemedText>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.text + "40"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card }]}
              onPress={() =>
                Alert.alert("Export Data", "Data export feature coming soon!")
              }
            >
              <Ionicons name="download-outline" size={20} color={colors.text} />
              <ThemedText style={styles.actionButtonText}>
                Export Account Data
              </ThemedText>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.text + "40"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View
        style={[styles.bottomActions, { backgroundColor: colors.background }]}
      >
        {isEditing ? (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: "#FF3B30" }]}
              onPress={handleCancel}
            >
              <ThemedText
                style={[styles.cancelButtonText, { color: "#FF3B30" }]}
              >
                Cancel
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.tint }]}
              onPress={handleSave}
            >
              <ThemedText style={[styles.saveButtonText, { color: "white" }]}>
                Save Changes
              </ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.tint }]}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="create-outline" size={20} color="white" />
            <ThemedText style={[styles.editButtonText, { color: "white" }]}>
              Edit Profile
            </ThemedText>
          </TouchableOpacity>
        )}
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
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  settingsButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profilePictureSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  changePhotoText: {
    fontSize: 16,
    marginLeft: 8,
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
  sectionContent: {
    borderRadius: 12,
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    opacity: 0.8,
  },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 44,
  },
  fieldValue: {
    fontSize: 16,
    paddingVertical: 12,
    minHeight: 44,
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
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
