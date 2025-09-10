import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
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
import { auth, db } from "@/constants/firebase";
import { useColorScheme } from "@/hooks/useColorScheme";

// Move ProfileField component outside to prevent re-creation
const ProfileField = ({
  label,
  value,
  field,
  placeholder,
  keyboardType = "default",
  multiline = false,
  isEditing,
  colors,
  styles,
  formData,
  updateFormField,
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

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gcash: "",
    propertyName: "",
    propertyAddress: "",
    totalRooms: "",
    website: "",
    bio: "",
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [saving, setSaving] = useState(false);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const handleSave = async () => {
    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in to update your profile.");
      return;
    }

    // Basic validation
    if (!formData.fullName.trim()) {
      Alert.alert("Error", "Full name is required.");
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert("Error", "Email is required.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    setSaving(true);
    try {
      // Update user document in Firestore
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        gcash: formData.gcash.trim(),
        propertyName: formData.propertyName.trim(),
        propertyAddress: formData.propertyAddress.trim(),
        totalRooms: formData.totalRooms ? parseInt(formData.totalRooms) : null,
        website: formData.website.trim(),
        bio: formData.bio.trim(),
        updatedAt: new Date().toISOString(),
      });

      // Update local userProfile state
      setUserProfile((prev) => ({
        ...prev,
        ...formData,
        totalRooms: formData.totalRooms ? parseInt(formData.totalRooms) : null,
      }));

      Alert.alert("Success", "Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(
        "Error",
        "Failed to update profile. Please check your connection and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (userProfile) {
      setFormData({
        fullName:
          userProfile.fullName ||
          `${userProfile.firstName || ""} ${
            userProfile.lastName || ""
          }`.trim() ||
          "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        gcash: userProfile.gcash || "",
        propertyName: userProfile.propertyName || "",
        propertyAddress: userProfile.propertyAddress || "",
        totalRooms: userProfile.totalRooms || "",
        website: userProfile.website || "",
        bio: userProfile.bio || "",
      });
    }
    setIsEditing(false);
  };

  const updateFormField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Fetch user data from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserProfile(userData);

            // Update form data with real user data
            setFormData({
              fullName:
                userData.fullName ||
                `${userData.firstName || ""} ${
                  userData.lastName || ""
                }`.trim() ||
                "",
              email: userData.email || "",
              phone: userData.phone || "",
              gcash: userData.gcash || "",
              propertyName: userData.propertyName || "",
              propertyAddress: userData.propertyAddress || "",
              totalRooms: userData.totalRooms || "",
              website: userData.website || "",
              bio: userData.bio || "",
            });
          } else {
            console.log("User profile not found");
            router.replace("/auth/login");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        router.replace("/auth/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ThemedText>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

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
              value={formData.fullName}
              field="fullName"
              placeholder="Enter your full name"
              isEditing={isEditing}
              colors={colors}
              styles={styles}
              formData={formData}
              updateFormField={updateFormField}
            />
            <ProfileField
              label="Email"
              value={formData.email}
              field="email"
              placeholder="Enter your email"
              keyboardType="email-address"
              isEditing={isEditing}
              colors={colors}
              styles={styles}
              formData={formData}
              updateFormField={updateFormField}
            />
            <ProfileField
              label="GCash Number"
              value={formData.gcash}
              field="gcash"
              placeholder="Enter your GCash number"
              keyboardType="phone-pad"
              isEditing={isEditing}
              colors={colors}
              styles={styles}
              formData={formData}
              updateFormField={updateFormField}
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
              label="Property Name"
              value={formData.propertyName}
              field="propertyName"
              placeholder="Enter your property name"
              isEditing={isEditing}
              colors={colors}
              styles={styles}
              formData={formData}
              updateFormField={updateFormField}
            />
            <ProfileField
              label="Property Address"
              value={formData.propertyAddress}
              field="propertyAddress"
              placeholder="Enter your property address"
              isEditing={isEditing}
              colors={colors}
              styles={styles}
              formData={formData}
              updateFormField={updateFormField}
            />
            <ProfileField
              label="Total Rooms"
              value={formData.totalRooms?.toString() || ""}
              field="totalRooms"
              placeholder="Enter total number of rooms"
              keyboardType="numeric"
              isEditing={isEditing}
              colors={colors}
              styles={styles}
              formData={formData}
              updateFormField={updateFormField}
            />
            <ProfileField
              label="Website"
              value={formData.website}
              field="website"
              placeholder="Enter your website URL"
              keyboardType="url"
              isEditing={isEditing}
              colors={colors}
              styles={styles}
              formData={formData}
              updateFormField={updateFormField}
            />
            <ProfileField
              label="Bio"
              value={formData.bio}
              field="bio"
              placeholder="Tell us about yourself..."
              multiline={true}
              isEditing={isEditing}
              colors={colors}
              styles={styles}
              formData={formData}
              updateFormField={updateFormField}
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
              style={[
                styles.saveButton,
                {
                  backgroundColor: saving ? colors.tint + "80" : colors.tint,
                  opacity: saving ? 0.7 : 1,
                },
              ]}
              onPress={handleSave}
              disabled={saving}
            >
              <ThemedText style={[styles.saveButtonText, { color: "white" }]}>
                {saving ? "Saving..." : "Save Changes"}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
