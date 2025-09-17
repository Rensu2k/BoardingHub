import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { auth, db } from "@/constants/firebase";
import { useColorScheme } from "@/hooks/useColorScheme";
import { saveUserProfile } from "@/utils/profileSync";

export default function EditProfile() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Mock current user data
  const [profileData, setProfileData] = useState({
    firstName: "Juan",
    lastName: "Dela Cruz",
    email: "juan.delacruz@email.com",
    phone: "+63 912 345 6789",
    dateOfBirth: "1995-06-15",
    gender: "Male",
    occupation: "Software Engineer",
    company: "Tech Solutions Inc.",
    emergencyContactName: "Maria Dela Cruz",
    emergencyContactRelation: "Mother",
    emergencyContactPhone: "+63 917 987 6543",
    idType: "National ID",
    idNumber: "****-****-**98",
    address: "123 Main Street, Quezon City",
    profilePhoto: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];
  const idTypes = [
    "National ID",
    "Driver's License",
    "Passport",
    "SSS ID",
    "TIN ID",
    "Postal ID",
  ];

  useEffect(() => {
    // Load real user data from Firebase when component mounts
    loadUserProfile();
  }, []);

  useEffect(() => {
    // Mark as having changes whenever profile data changes
    setHasChanges(true);
  }, [profileData]);

  const loadUserProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfileData({
            firstName: userData.firstName || "Juan",
            lastName: userData.lastName || "Dela Cruz",
            email: userData.email || user.email || "juan.delacruz@email.com",
            phone: userData.phone || "+63 912 345 6789",
            dateOfBirth: userData.dateOfBirth || "1995-06-15",
            gender: userData.gender || "Male",
            occupation: userData.occupation || "Software Engineer",
            company: userData.company || "Tech Solutions Inc.",
            emergencyContactName:
              userData.emergencyContactName || "Maria Dela Cruz",
            emergencyContactRelation:
              userData.emergencyContactRelation || "Mother",
            emergencyContactPhone:
              userData.emergencyContactPhone || "+63 917 987 6543",
            idType: userData.idType || "National ID",
            idNumber: userData.idNumber || "****-****-**98",
            address: userData.address || "123 Main Street, Quezon City",
            profilePhoto: userData.profilePhoto || null,
          });
          setHasChanges(false); // Reset changes flag after loading
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== "granted" || libraryStatus !== "granted") {
        Alert.alert(
          "Permissions Required",
          "Camera and photo library permissions are required to update profile photo.",
          [{ text: "OK" }]
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async (source) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result;
    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    };

    if (source === "camera") {
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled) {
      setProfileData((prev) => ({
        ...prev,
        profilePhoto: result.assets[0].uri,
      }));
    }
    setShowImagePicker(false);
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Save to Firebase Firestore
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);

        // Create full name from first and last name
        const fullName = `${profileData.firstName.trim()} ${profileData.lastName.trim()}`;

        const updateData = {
          ...profileData,
          fullName,
          updatedAt: new Date().toISOString(),
        };

        await updateDoc(userDocRef, updateData);
        console.log("Profile saved to Firebase:", updateData);
      }

      // Also save to AsyncStorage for offline access
      const success = await saveUserProfile({
        ...profileData,
        fullName: `${profileData.firstName.trim()} ${profileData.lastName.trim()}`,
      });

      if (success) {
        console.log("Updated profile data:", profileData);

        Alert.alert(
          "Profile Updated",
          "Your profile has been updated successfully. Your information will be used for room applications.",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
        setHasChanges(false);
      } else {
        Alert.alert(
          "Error",
          "Failed to save profile locally. Please try again."
        );
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!profileData.firstName.trim()) {
      Alert.alert("Error", "First name is required.");
      return false;
    }
    if (!profileData.lastName.trim()) {
      Alert.alert("Error", "Last name is required.");
      return false;
    }
    if (!profileData.email.trim()) {
      Alert.alert("Error", "Email is required.");
      return false;
    }
    if (!profileData.phone.trim()) {
      Alert.alert("Error", "Phone number is required.");
      return false;
    }
    return true;
  };

  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Edit Profile</ThemedText>
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: hasChanges ? colors.tint : colors.text + "40" },
          ]}
          onPress={handleSave}
          disabled={!hasChanges || isLoading}
        >
          <ThemedText style={styles.saveButtonText}>
            {isLoading ? "Saving..." : "Save"}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Photo */}
        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>Profile Photo</ThemedText>

          <View style={styles.photoContainer}>
            <View
              style={[
                styles.photoPreview,
                { backgroundColor: colors.background },
              ]}
            >
              {profileData.profilePhoto ? (
                <View style={styles.photoWrapper}>
                  <Ionicons name="person" size={60} color={colors.tint} />
                </View>
              ) : (
                <View
                  style={[
                    styles.photoPlaceholder,
                    { backgroundColor: colors.tint + "20" },
                  ]}
                >
                  <Ionicons name="person" size={60} color={colors.tint} />
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.changePhotoButton,
                { backgroundColor: colors.tint },
              ]}
              onPress={() => setShowImagePicker(true)}
            >
              <Ionicons name="camera" size={16} color="white" />
              <ThemedText style={styles.changePhotoText}>
                Change Photo
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Personal Information */}
        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>
            Personal Information
          </ThemedText>

          <View style={styles.formRow}>
            <View style={styles.formField}>
              <ThemedText style={styles.fieldLabel}>First Name *</ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: colors.background, color: colors.text },
                ]}
                value={profileData.firstName}
                onChangeText={(value) => handleInputChange("firstName", value)}
                placeholder="Enter first name"
                placeholderTextColor={colors.text + "60"}
              />
            </View>

            <View style={styles.formField}>
              <ThemedText style={styles.fieldLabel}>Last Name *</ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: colors.background, color: colors.text },
                ]}
                value={profileData.lastName}
                onChangeText={(value) => handleInputChange("lastName", value)}
                placeholder="Enter last name"
                placeholderTextColor={colors.text + "60"}
              />
            </View>
          </View>

          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>Date of Birth</ThemedText>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: colors.background, color: colors.text },
              ]}
              value={profileData.dateOfBirth}
              onChangeText={(value) => handleInputChange("dateOfBirth", value)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.text + "60"}
            />
          </View>

          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>Gender</ThemedText>
            <View style={styles.genderContainer}>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.genderOption,
                    {
                      backgroundColor:
                        profileData.gender === option
                          ? colors.tint + "20"
                          : colors.background,
                      borderColor:
                        profileData.gender === option
                          ? colors.tint
                          : colors.border,
                    },
                  ]}
                  onPress={() => handleInputChange("gender", option)}
                >
                  <ThemedText
                    style={[
                      styles.genderText,
                      {
                        color:
                          profileData.gender === option
                            ? colors.tint
                            : colors.text,
                      },
                    ]}
                  >
                    {option}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>Occupation</ThemedText>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: colors.background, color: colors.text },
              ]}
              value={profileData.occupation}
              onChangeText={(value) => handleInputChange("occupation", value)}
              placeholder="Your occupation"
              placeholderTextColor={colors.text + "60"}
            />
          </View>

          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>Company</ThemedText>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: colors.background, color: colors.text },
              ]}
              value={profileData.company}
              onChangeText={(value) => handleInputChange("company", value)}
              placeholder="Company name"
              placeholderTextColor={colors.text + "60"}
            />
          </View>
        </ThemedView>

        {/* Contact Information */}
        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>
            Contact Information
          </ThemedText>

          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>Email Address *</ThemedText>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: colors.background, color: colors.text },
              ]}
              value={profileData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              placeholder="Enter email address"
              placeholderTextColor={colors.text + "60"}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>Phone Number *</ThemedText>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: colors.background, color: colors.text },
              ]}
              value={profileData.phone}
              onChangeText={(value) => handleInputChange("phone", value)}
              placeholder="Enter phone number"
              placeholderTextColor={colors.text + "60"}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>Address</ThemedText>
            <TextInput
              style={[
                styles.textAreaInput,
                { backgroundColor: colors.background, color: colors.text },
              ]}
              value={profileData.address}
              onChangeText={(value) => handleInputChange("address", value)}
              placeholder="Enter complete address"
              placeholderTextColor={colors.text + "60"}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </ThemedView>

        {/* Emergency Contact */}
        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>Emergency Contact</ThemedText>

          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>Contact Name</ThemedText>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: colors.background, color: colors.text },
              ]}
              value={profileData.emergencyContactName}
              onChangeText={(value) =>
                handleInputChange("emergencyContactName", value)
              }
              placeholder="Emergency contact name"
              placeholderTextColor={colors.text + "60"}
            />
          </View>

          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>Relationship</ThemedText>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: colors.background, color: colors.text },
              ]}
              value={profileData.emergencyContactRelation}
              onChangeText={(value) =>
                handleInputChange("emergencyContactRelation", value)
              }
              placeholder="Relationship (e.g., Mother, Father, Spouse)"
              placeholderTextColor={colors.text + "60"}
            />
          </View>

          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>Phone Number</ThemedText>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: colors.background, color: colors.text },
              ]}
              value={profileData.emergencyContactPhone}
              onChangeText={(value) =>
                handleInputChange("emergencyContactPhone", value)
              }
              placeholder="Emergency contact phone"
              placeholderTextColor={colors.text + "60"}
              keyboardType="phone-pad"
            />
          </View>
        </ThemedView>

        {/* ID Information */}
        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>ID Information</ThemedText>

          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>ID Type</ThemedText>
            <View style={styles.idTypeContainer}>
              {idTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.idTypeOption,
                    {
                      backgroundColor:
                        profileData.idType === type
                          ? colors.tint + "20"
                          : colors.background,
                      borderColor:
                        profileData.idType === type
                          ? colors.tint
                          : colors.border,
                    },
                  ]}
                  onPress={() => handleInputChange("idType", type)}
                >
                  <ThemedText
                    style={[
                      styles.idTypeText,
                      {
                        color:
                          profileData.idType === type
                            ? colors.tint
                            : colors.text,
                      },
                    ]}
                  >
                    {type}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>ID Number</ThemedText>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: colors.background, color: colors.text },
              ]}
              value={profileData.idNumber}
              onChangeText={(value) => handleInputChange("idNumber", value)}
              placeholder="Enter ID number"
              placeholderTextColor={colors.text + "60"}
            />
          </View>

          <View style={styles.infoCard}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={colors.tint}
            />
            <ThemedText style={styles.infoText}>
              Your ID information is encrypted and securely stored. This helps
              verify your identity for lease agreements.
            </ThemedText>
          </View>
        </ThemedView>
      </ScrollView>

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <View style={styles.imagePickerOverlay}>
          <View
            style={[
              styles.imagePickerContainer,
              { backgroundColor: colors.card },
            ]}
          >
            <View style={styles.imagePickerHeader}>
              <ThemedText style={styles.imagePickerTitle}>
                Update Profile Photo
              </ThemedText>
              <TouchableOpacity onPress={() => setShowImagePicker(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.imagePickerOptions}>
              <TouchableOpacity
                style={[
                  styles.imagePickerOption,
                  { backgroundColor: colors.background },
                ]}
                onPress={() => pickImage("camera")}
              >
                <Ionicons name="camera-outline" size={32} color={colors.tint} />
                <ThemedText style={styles.imagePickerOptionText}>
                  Take Photo
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.imagePickerOption,
                  { backgroundColor: colors.background },
                ]}
                onPress={() => pickImage("gallery")}
              >
                <Ionicons name="image-outline" size={32} color={colors.tint} />
                <ThemedText style={styles.imagePickerOptionText}>
                  Choose from Gallery
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  photoContainer: {
    alignItems: "center",
    gap: 16,
  },
  photoPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#E5E5E7",
  },
  photoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  changePhotoText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  formField: {
    flex: 1,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E5E5E7",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textAreaInput: {
    borderWidth: 1,
    borderColor: "#E5E5E7",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
  },
  genderContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  genderOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  genderText: {
    fontSize: 14,
    fontWeight: "500",
  },
  idTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  idTypeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  idTypeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#E3F2FD",
    marginTop: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.8,
  },
  imagePickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  imagePickerContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  imagePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  imagePickerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  imagePickerOptions: {
    flexDirection: "row",
    padding: 16,
    gap: 16,
  },
  imagePickerOption: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    borderRadius: 12,
    gap: 12,
  },
  imagePickerOptionText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
