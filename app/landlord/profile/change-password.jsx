import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const handleChangePassword = () => {
    if (!currentPassword.trim()) {
      Alert.alert("Error", "Please enter your current password.");
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert("Error", "Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New password and confirmation do not match.");
      return;
    }

    // Mock password change
    Alert.alert("Success", "Password changed successfully!", [
      {
        text: "OK",
        onPress: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          router.back();
        },
      },
    ]);
  };

  const PasswordInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    showPassword,
    onTogglePassword,
  }) => (
    <View style={styles.inputContainer}>
      <ThemedText style={styles.inputLabel}>{label}</ThemedText>
      <View style={styles.passwordInputContainer}>
        <TextInput
          style={[
            styles.passwordInput,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text + "60"}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.eyeButton} onPress={onTogglePassword}>
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={colors.text + "60"}
          />
        </TouchableOpacity>
      </View>
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
        <ThemedText style={styles.headerTitle}>Change Password</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.description}>
          <ThemedText style={styles.descriptionText}>
            Your password must be at least 6 characters long and contain a mix
            of letters, numbers, and symbols for better security.
          </ThemedText>
        </View>

        <View style={styles.form}>
          <PasswordInput
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter your current password"
            showPassword={showCurrentPassword}
            onTogglePassword={() =>
              setShowCurrentPassword(!showCurrentPassword)
            }
          />

          <PasswordInput
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter your new password"
            showPassword={showNewPassword}
            onTogglePassword={() => setShowNewPassword(!showNewPassword)}
          />

          <PasswordInput
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your new password"
            showPassword={showConfirmPassword}
            onTogglePassword={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
          />
        </View>

        {/* Password Requirements */}
        <View style={styles.requirements}>
          <ThemedText style={styles.requirementsTitle}>
            Password Requirements:
          </ThemedText>
          <View style={styles.requirementList}>
            <View style={styles.requirementItem}>
              <Ionicons
                name={
                  newPassword.length >= 6
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={16}
                color={newPassword.length >= 6 ? "#34C759" : colors.text + "40"}
              />
              <ThemedText
                style={[
                  styles.requirementText,
                  {
                    color:
                      newPassword.length >= 6 ? "#34C759" : colors.text + "60",
                  },
                ]}
              >
                At least 6 characters
              </ThemedText>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons
                name={
                  newPassword === confirmPassword && newPassword.length > 0
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={16}
                color={
                  newPassword === confirmPassword && newPassword.length > 0
                    ? "#34C759"
                    : colors.text + "40"
                }
              />
              <ThemedText
                style={[
                  styles.requirementText,
                  {
                    color:
                      newPassword === confirmPassword && newPassword.length > 0
                        ? "#34C759"
                        : colors.text + "60",
                  },
                ]}
              >
                Passwords match
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Actions */}
      <View
        style={[styles.bottomActions, { backgroundColor: colors.background }]}
      >
        <TouchableOpacity
          style={[
            styles.changePasswordButton,
            {
              backgroundColor:
                currentPassword && newPassword && confirmPassword
                  ? colors.tint
                  : "#CCCCCC",
            },
          ]}
          onPress={handleChangePassword}
          disabled={!currentPassword || !newPassword || !confirmPassword}
        >
          <ThemedText
            style={[
              styles.changePasswordButtonText,
              {
                color:
                  currentPassword && newPassword && confirmPassword
                    ? "white"
                    : "#999999",
              },
            ]}
          >
            Change Password
          </ThemedText>
        </TouchableOpacity>
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
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  description: {
    paddingVertical: 20,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    textAlign: "center",
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    opacity: 0.8,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 44,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    padding: 4,
  },
  requirements: {
    paddingVertical: 20,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  requirementList: {
    gap: 8,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  requirementText: {
    fontSize: 14,
    marginLeft: 8,
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
  },
  changePasswordButton: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  changePasswordButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
