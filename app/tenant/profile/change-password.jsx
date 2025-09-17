import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
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
import { useColorScheme } from "@/hooks/useColorScheme";

export default function ChangePassword() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Check password strength for new password
    if (field === "newPassword") {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    let score = 0;
    const feedback = [];

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push("At least 8 characters");
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("One uppercase letter");
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("One lowercase letter");
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push("One number");
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push("One special character");
    }

    setPasswordStrength({ score, feedback });
  };

  const getStrengthColor = () => {
    if (passwordStrength.score <= 1) return "#FF3B30";
    if (passwordStrength.score <= 3) return "#FF9500";
    return "#34C759";
  };

  const getStrengthText = () => {
    if (passwordStrength.score <= 1) return "Weak";
    if (passwordStrength.score <= 3) return "Medium";
    return "Strong";
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      Alert.alert("Error", "Please enter your current password.");
      return false;
    }

    if (!formData.newPassword) {
      Alert.alert("Error", "Please enter a new password.");
      return false;
    }

    if (passwordStrength.score < 3) {
      Alert.alert("Error", "Please choose a stronger password.");
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert("Error", "New password and confirmation do not match.");
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      Alert.alert(
        "Error",
        "New password must be different from current password."
      );
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real app, this would call your authentication service
      console.log("Password change request:", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      Alert.alert(
        "Password Changed",
        "Your password has been changed successfully. Please log in again with your new password.",
        [
          {
            text: "OK",
            onPress: () => {
              // In a real app, you might want to log the user out
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to change password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

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
        <ThemedText style={styles.headerTitle}>Change Password</ThemedText>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Security Notice */}
        <View style={[styles.securityNotice, { backgroundColor: colors.card }]}>
          <Ionicons
            name="shield-checkmark-outline"
            size={24}
            color={colors.tint}
          />
          <View style={styles.noticeContent}>
            <ThemedText style={styles.noticeTitle}>
              Secure Password Change
            </ThemedText>
            <ThemedText style={styles.noticeText}>
              Choose a strong password to keep your account secure. You'll need
              to log in again after changing your password.
            </ThemedText>
          </View>
        </View>

        {/* Password Form */}
        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>
            Password Information
          </ThemedText>

          {/* Current Password */}
          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>Current Password</ThemedText>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  { backgroundColor: colors.background, color: colors.text },
                ]}
                value={formData.currentPassword}
                onChangeText={(value) =>
                  handleInputChange("currentPassword", value)
                }
                placeholder="Enter current password"
                placeholderTextColor={colors.text + "60"}
                secureTextEntry={!showPasswords.current}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => togglePasswordVisibility("current")}
              >
                <Ionicons
                  name={
                    showPasswords.current ? "eye-off-outline" : "eye-outline"
                  }
                  size={20}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>New Password</ThemedText>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  { backgroundColor: colors.background, color: colors.text },
                ]}
                value={formData.newPassword}
                onChangeText={(value) =>
                  handleInputChange("newPassword", value)
                }
                placeholder="Enter new password"
                placeholderTextColor={colors.text + "60"}
                secureTextEntry={!showPasswords.new}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => togglePasswordVisibility("new")}
              >
                <Ionicons
                  name={showPasswords.new ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            {/* Password Strength Indicator */}
            {formData.newPassword.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  <View
                    style={[
                      styles.strengthFill,
                      {
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor: getStrengthColor(),
                      },
                    ]}
                  />
                </View>
                <ThemedText
                  style={[styles.strengthText, { color: getStrengthColor() }]}
                >
                  {getStrengthText()}
                </ThemedText>
              </View>
            )}

            {/* Password Requirements */}
            {passwordStrength.feedback.length > 0 && (
              <View style={styles.requirementsContainer}>
                <ThemedText style={styles.requirementsTitle}>
                  Password must include:
                </ThemedText>
                {passwordStrength.feedback.map((requirement, index) => (
                  <View key={index} style={styles.requirementItem}>
                    <Ionicons name="close-circle" size={14} color="#FF3B30" />
                    <ThemedText style={styles.requirementText}>
                      {requirement}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>
              Confirm New Password
            </ThemedText>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  { backgroundColor: colors.background, color: colors.text },
                ]}
                value={formData.confirmPassword}
                onChangeText={(value) =>
                  handleInputChange("confirmPassword", value)
                }
                placeholder="Confirm new password"
                placeholderTextColor={colors.text + "60"}
                secureTextEntry={!showPasswords.confirm}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => togglePasswordVisibility("confirm")}
              >
                <Ionicons
                  name={
                    showPasswords.confirm ? "eye-off-outline" : "eye-outline"
                  }
                  size={20}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            {/* Password Match Indicator */}
            {formData.confirmPassword.length > 0 && (
              <View style={styles.matchContainer}>
                {formData.newPassword === formData.confirmPassword ? (
                  <View style={styles.matchItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color="#34C759"
                    />
                    <ThemedText
                      style={[styles.matchText, { color: "#34C759" }]}
                    >
                      Passwords match
                    </ThemedText>
                  </View>
                ) : (
                  <View style={styles.matchItem}>
                    <Ionicons name="close-circle" size={14} color="#FF3B30" />
                    <ThemedText
                      style={[styles.matchText, { color: "#FF3B30" }]}
                    >
                      Passwords do not match
                    </ThemedText>
                  </View>
                )}
              </View>
            )}
          </View>
        </ThemedView>

        {/* Security Tips */}
        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>Security Tips</ThemedText>

          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="shield-outline" size={20} color={colors.tint} />
              <ThemedText style={styles.tipText}>
                Use a unique password that you don't use for other accounts
              </ThemedText>
            </View>

            <View style={styles.tipItem}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.tint}
              />
              <ThemedText style={styles.tipText}>
                Include a mix of uppercase, lowercase, numbers, and symbols
              </ThemedText>
            </View>

            <View style={styles.tipItem}>
              <Ionicons name="time-outline" size={20} color={colors.tint} />
              <ThemedText style={styles.tipText}>
                Consider using a password manager for better security
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Change Password Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.changeButton,
              {
                backgroundColor:
                  passwordStrength.score >= 3 &&
                  formData.newPassword === formData.confirmPassword &&
                  formData.currentPassword &&
                  !isLoading
                    ? colors.tint
                    : colors.text + "40",
              },
            ]}
            onPress={handleChangePassword}
            disabled={
              passwordStrength.score < 3 ||
              formData.newPassword !== formData.confirmPassword ||
              !formData.currentPassword ||
              isLoading
            }
          >
            {isLoading ? (
              <ThemedText style={styles.changeButtonText}>
                Changing Password...
              </ThemedText>
            ) : (
              <>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color="white"
                />
                <ThemedText style={styles.changeButtonText}>
                  Change Password
                </ThemedText>
              </>
            )}
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
  headerButton: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  noticeText: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  formField: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E7",
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeButton: {
    padding: 12,
  },
  strengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 12,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#E5E5E7",
    borderRadius: 2,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
  },
  requirementsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#FFF3E0",
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    color: "#E65100",
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 12,
    color: "#E65100",
  },
  matchContainer: {
    marginTop: 8,
  },
  matchItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  matchText: {
    fontSize: 12,
    fontWeight: "500",
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 16,
  },
  changeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  changeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
