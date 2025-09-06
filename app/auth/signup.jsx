import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { auth, db } from "@/constants/firebase";
import { useColorScheme } from "@/hooks/useColorScheme";
import { isValidEmail } from "@/utils/auth-helpers";

const { width, height } = Dimensions.get("window");

export default function SignUpScreen() {
  const [userType, setUserType] = useState("tenant");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Additional fields for tenants
  const [preferredRoomType, setPreferredRoomType] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  // Additional fields for landlords
  const [propertyName, setPropertyName] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [totalRooms, setTotalRooms] = useState("");

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();

  const handleSignUp = async () => {
    // Validation
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (!agreeToTerms) {
      Alert.alert("Error", "Please agree to the terms and conditions");
      return;
    }

    // Additional validation for user type specific fields
    if (userType === "tenant") {
      if (!preferredRoomType || !moveInDate || !emergencyContact) {
        Alert.alert("Error", "Please fill in all tenant-specific information");
        return;
      }
    } else {
      if (!propertyName || !propertyAddress || !totalRooms) {
        Alert.alert("Error", "Please fill in all property information");
        return;
      }
    }

    setIsLoading(true);

    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );
      const user = userCredential.user;

      // Prepare user profile data for Firestore
      const userProfileData = {
        userType,
        firstName,
        lastName,
        email: email.trim().toLowerCase(),
        phone,
        createdAt: new Date().toISOString(),
        ...(userType === "tenant"
          ? {
              preferredRoomType,
              moveInDate,
              emergencyContact,
            }
          : {
              propertyName,
              propertyAddress,
              totalRooms: parseInt(totalRooms) || 0,
            }),
      };

      // Store user profile in Firestore
      await setDoc(doc(db, "users", user.uid), userProfileData);

      Alert.alert("Success", "Account created successfully! Please log in.", [
        {
          text: "OK",
          onPress: () => router.replace("/"),
        },
      ]);
    } catch (error) {
      let errorMessage = "Registration failed. Please try again.";

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (error.code === "auth/weak-password") {
        errorMessage =
          "Password is too weak. Please choose a stronger password.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection.";
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.replace("/");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.card }]}
              onPress={handleBackToLogin}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <View style={[styles.logo, { backgroundColor: colors.tint }]}>
                <Ionicons
                  name="person-add-outline"
                  size={32}
                  color={colors.tint === "#fff" ? "#0a7ea4" : "white"}
                />
              </View>
            </View>
            <ThemedText style={styles.appName}>BoardingHub</ThemedText>
            <ThemedText style={styles.subtitle}>Create Your Account</ThemedText>
          </View>

          {/* User Type Selection */}
          <View style={styles.userTypeSection}>
            <ThemedText style={styles.userTypeLabel}>
              I want to register as:
            </ThemedText>
            <View style={styles.userTypeButtons}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  {
                    borderColor: colors.border,
                    backgroundColor:
                      userType === "tenant" ? colors.tint : colors.card,
                  },
                  userType === "tenant" && {
                    borderColor: colors.tint,
                  },
                ]}
                onPress={() => setUserType("tenant")}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={
                    userType === "tenant"
                      ? colors.tint === "#fff"
                        ? "#0a7ea4"
                        : "white"
                      : colors.text
                  }
                />
                <ThemedText
                  style={[
                    styles.userTypeButtonText,
                    userType === "tenant" && {
                      color: colors.tint === "#fff" ? "#0a7ea4" : "white",
                    },
                  ]}
                >
                  Tenant
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  {
                    borderColor: colors.border,
                    backgroundColor:
                      userType === "landlord" ? colors.tint : colors.card,
                  },
                  userType === "landlord" && {
                    borderColor: colors.tint,
                  },
                ]}
                onPress={() => setUserType("landlord")}
              >
                <Ionicons
                  name="business-outline"
                  size={20}
                  color={
                    userType === "landlord"
                      ? colors.tint === "#fff"
                        ? "#0a7ea4"
                        : "white"
                      : colors.text
                  }
                />
                <ThemedText
                  style={[
                    styles.userTypeButtonText,
                    userType === "landlord" && {
                      color: colors.tint === "#fff" ? "#0a7ea4" : "white",
                    },
                  ]}
                >
                  Landlord
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Personal Information */}
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>
                Personal Information
              </ThemedText>
            </View>

            {/* Name Fields */}
            <View style={styles.nameRow}>
              <View
                style={[
                  styles.inputContainer,
                  styles.halfWidth,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.inputBackground,
                  },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.text}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="First Name"
                  placeholderTextColor={colors.text + "60"}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </View>

              <View
                style={[
                  styles.inputContainer,
                  styles.halfWidth,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.inputBackground,
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Last Name"
                  placeholderTextColor={colors.text + "60"}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email */}
            <View
              style={[styles.inputContainer, { borderColor: colors.border }]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.text}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Email address"
                placeholderTextColor={colors.text + "60"}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Phone */}
            <View
              style={[styles.inputContainer, { borderColor: colors.border }]}
            >
              <Ionicons
                name="call-outline"
                size={20}
                color={colors.text}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Phone number"
                placeholderTextColor={colors.text + "60"}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Password */}
            <View
              style={[styles.inputContainer, { borderColor: colors.border }]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.text}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Password (min. 6 characters)"
                placeholderTextColor={colors.text + "60"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <View
              style={[styles.inputContainer, { borderColor: colors.border }]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.text}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Confirm password"
                placeholderTextColor={colors.text + "60"}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            {/* Conditional Fields Based on User Type */}
            {userType === "tenant" ? (
              <>
                <View style={styles.sectionHeader}>
                  <ThemedText style={styles.sectionTitle}>
                    Tenant Information
                  </ThemedText>
                </View>

                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.inputBackground,
                    },
                  ]}
                >
                  <Ionicons
                    name="home-outline"
                    size={20}
                    color={colors.text}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Preferred room type (e.g., Single, Double)"
                    placeholderTextColor={colors.text + "60"}
                    value={preferredRoomType}
                    onChangeText={setPreferredRoomType}
                    autoCapitalize="words"
                  />
                </View>

                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.inputBackground,
                    },
                  ]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={colors.text}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Preferred move-in date (MM/DD/YYYY)"
                    placeholderTextColor={colors.text + "60"}
                    value={moveInDate}
                    onChangeText={setMoveInDate}
                  />
                </View>

                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.inputBackground,
                    },
                  ]}
                >
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={colors.text}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Emergency contact number"
                    placeholderTextColor={colors.text + "60"}
                    value={emergencyContact}
                    onChangeText={setEmergencyContact}
                    keyboardType="phone-pad"
                  />
                </View>
              </>
            ) : (
              <>
                <View style={styles.sectionHeader}>
                  <ThemedText style={styles.sectionTitle}>
                    Property Information
                  </ThemedText>
                </View>

                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.inputBackground,
                    },
                  ]}
                >
                  <Ionicons
                    name="business-outline"
                    size={20}
                    color={colors.text}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Property/Building name"
                    placeholderTextColor={colors.text + "60"}
                    value={propertyName}
                    onChangeText={setPropertyName}
                    autoCapitalize="words"
                  />
                </View>

                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.inputBackground,
                    },
                  ]}
                >
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={colors.text}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Property address"
                    placeholderTextColor={colors.text + "60"}
                    value={propertyAddress}
                    onChangeText={setPropertyAddress}
                    multiline
                  />
                </View>

                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.inputBackground,
                    },
                  ]}
                >
                  <Ionicons
                    name="grid-outline"
                    size={20}
                    color={colors.text}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Total number of rooms"
                    placeholderTextColor={colors.text + "60"}
                    value={totalRooms}
                    onChangeText={setTotalRooms}
                    keyboardType="numeric"
                  />
                </View>
              </>
            )}

            {/* Terms and Conditions */}
            <View style={styles.termsSection}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setAgreeToTerms(!agreeToTerms)}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: colors.border,
                    },
                    agreeToTerms && {
                      backgroundColor: colors.tint,
                      borderColor: colors.tint,
                    },
                  ]}
                >
                  {agreeToTerms && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <View style={styles.termsTextContainer}>
                  <ThemedText style={styles.termsText}>
                    I agree to the{" "}
                    <ThemedText
                      style={[styles.termsLink, { color: colors.tint }]}
                      onPress={() =>
                        Alert.alert(
                          "Terms",
                          "Terms and conditions coming soon!"
                        )
                      }
                    >
                      Terms and Conditions
                    </ThemedText>{" "}
                    and{" "}
                    <ThemedText
                      style={[styles.termsLink, { color: colors.tint }]}
                      onPress={() =>
                        Alert.alert("Privacy", "Privacy policy coming soon!")
                      }
                    >
                      Privacy Policy
                    </ThemedText>
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signupButton, { backgroundColor: colors.tint }]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons
                    name="refresh"
                    size={20}
                    color={colors.tint === "#fff" ? "#0a7ea4" : "white"}
                  />
                  <ThemedText
                    style={[
                      styles.signupButtonText,
                      { color: colors.tint === "#fff" ? "#0a7ea4" : "white" },
                    ]}
                  >
                    Creating Account...
                  </ThemedText>
                </View>
              ) : (
                <View style={styles.signupButtonContent}>
                  <Ionicons
                    name="person-add-outline"
                    size={20}
                    color={colors.tint === "#fff" ? "#0a7ea4" : "white"}
                  />
                  <ThemedText
                    style={[
                      styles.signupButtonText,
                      { color: colors.tint === "#fff" ? "#0a7ea4" : "white" },
                    ]}
                  >
                    Create Account
                  </ThemedText>
                </View>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <ThemedText style={styles.loginText}>
                Already have an account?{" "}
              </ThemedText>
              <TouchableOpacity onPress={handleBackToLogin}>
                <ThemedText style={[styles.loginLink, { color: colors.tint }]}>
                  Sign In
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    marginBottom: 16,
    marginTop: 10,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  userTypeSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  userTypeLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 16,
  },
  userTypeButtons: {
    flexDirection: "row",
    gap: 12,
  },
  userTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 2,
    gap: 8,
    minWidth: 120,
    justifyContent: "center",
  },
  userTypeButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  formSection: {
    flex: 1,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  nameRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  termsSection: {
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    fontWeight: "600",
  },
  signupButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  signupButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 16,
    opacity: 0.7,
  },
  loginLink: {
    fontSize: 16,
    fontWeight: "600",
  },
});
