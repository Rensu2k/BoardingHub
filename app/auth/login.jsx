import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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
import {
  getAuthErrorMessage,
  isValidEmail,
  shouldSuggestAccountCreation,
  validateLoginInputs,
} from "@/utils/auth-helpers";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();

  const handleLogin = async () => {
    const validation = validateLoginInputs(email, password);

    if (!validation.isValid) {
      Alert.alert("Error", validation.errors.join("\n"));
      return;
    }

    setIsLoading(true);

    try {
      // Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );
      const user = userCredential.user;

      // Fetch user profile to determine user type
      const userDoc = await getDoc(doc(db, "users", user.uid));
      let userProfile = null;
      let userTypeFromDB = "tenant"; // default

      if (userDoc.exists()) {
        userProfile = userDoc.data();
        userTypeFromDB = userProfile.userType || "tenant";
      } else {
        Alert.alert("Error", "User profile not found. Please contact support.");
        return;
      }

      // Route based on user type from database
      if (userTypeFromDB === "tenant") {
        Alert.alert(
          "Success",
          `Welcome back, ${userProfile?.firstName || "Tenant"}!`,
          [
            {
              text: "OK",
              onPress: () => router.replace("/tenant/(tabs)/dashboard"),
            },
          ]
        );
      } else if (userTypeFromDB === "landlord") {
        Alert.alert(
          "Success",
          `Welcome back, ${userProfile?.firstName || "Landlord"}!`,
          [{ text: "OK", onPress: () => router.replace("/landlord/dashboard") }]
        );
      } else {
        Alert.alert("Error", `Unknown user type: ${userTypeFromDB}`);
      }
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error.code);
      const showCreateAccount = shouldSuggestAccountCreation(error.code);

      // Show alert with option to create account for certain errors
      if (showCreateAccount) {
        Alert.alert("Login Failed", errorMessage, [
          { text: "Try Again", style: "cancel" },
          {
            text: "Create Account",
            onPress: () => router.push("/auth/signup"),
            style: "default",
          },
        ]);
      } else {
        Alert.alert("Error", errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert(
        "Reset Password",
        "Please enter your email address first, then tap 'Forgot Password?'",
        [{ text: "OK" }]
      );
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      Alert.alert(
        "Password Reset Email Sent",
        `A password reset link has been sent to ${email
          .trim()
          .toLowerCase()}. Please check your email (including spam folder) and follow the instructions to reset your password.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      let errorMessage =
        "Failed to send password reset email. Please try again.";

      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage =
          "Too many password reset attempts. Please try again later.";
      }

      Alert.alert("Error", errorMessage);
    }
  };

  const handleSignUp = () => {
    router.push("/auth/signup");
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
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={[styles.logo, { backgroundColor: colors.tint }]}>
                <Ionicons
                  name="home-outline"
                  size={40}
                  color={colors.tint === "#fff" ? "#0a7ea4" : "white"}
                />
              </View>
            </View>
            <ThemedText style={styles.appName}>BoardingHub</ThemedText>
            <ThemedText style={styles.subtitle}>
              Boarding House Management
            </ThemedText>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <ThemedText style={styles.welcomeTitle}>Welcome Back</ThemedText>
            <ThemedText style={styles.welcomeText}>
              Sign in to your account to continue
            </ThemedText>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Email Input */}
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

            {/* Password Input */}
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
                name="lock-closed-outline"
                size={20}
                color={colors.text}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Password"
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

            {/* Remember Me & Forgot Password */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: colors.border,
                    },
                    rememberMe && {
                      backgroundColor: colors.tint,
                      borderColor: colors.tint,
                    },
                  ]}
                >
                  {rememberMe && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <ThemedText style={styles.checkboxLabel}>
                  Remember me
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleForgotPassword}>
                <ThemedText
                  style={[styles.forgotPassword, { color: colors.tint }]}
                >
                  Forgot Password?
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: colors.tint }]}
              onPress={handleLogin}
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
                      styles.loginButtonText,
                      { color: colors.tint === "#fff" ? "#0a7ea4" : "white" },
                    ]}
                  >
                    Signing in...
                  </ThemedText>
                </View>
              ) : (
                <ThemedText
                  style={[
                    styles.loginButtonText,
                    { color: colors.tint === "#fff" ? "#0a7ea4" : "white" },
                  ]}
                >
                  Sign In
                </ThemedText>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <ThemedText style={styles.signupText}>
                Don't have an account?{" "}
              </ThemedText>
              <TouchableOpacity onPress={handleSignUp}>
                <ThemedText style={[styles.signupLink, { color: colors.tint }]}>
                  Sign Up
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
  },
  formSection: {
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
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 14,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    fontSize: 16,
    opacity: 0.7,
  },
  signupLink: {
    fontSize: 16,
    fontWeight: "600",
  },
});
