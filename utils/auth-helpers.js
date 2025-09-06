// Authentication helper utilities
import { db } from "@/constants/firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * Check if a user profile exists in Firestore by UID
 */
export const checkUserProfileExists = async (uid) => {
  try {
    if (!uid) return false;

    const userDoc = await getDoc(doc(db, "users", uid));
    const exists = userDoc.exists();

    return exists;
  } catch (error) {
    return false;
  }
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Common validation for login/signup
 */
export const validateLoginInputs = (email, password) => {
  const errors = [];

  if (!email?.trim()) {
    errors.push("Email is required");
  } else if (!isValidEmail(email)) {
    errors.push("Please enter a valid email address");
  }

  if (!password?.trim()) {
    errors.push("Password is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get user-friendly error message for Firebase auth errors
 */
export const getAuthErrorMessage = (errorCode) => {
  const errorMessages = {
    "auth/invalid-credential":
      "Invalid email or password. Please check your credentials and try again.",
    "auth/user-not-found": "No account found with this email address.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-disabled":
      "This account has been disabled. Please contact support.",
    "auth/too-many-requests":
      "Too many failed attempts. Please try again later or reset your password.",
    "auth/network-request-failed":
      "Network error. Please check your internet connection and try again.",
    "auth/configuration-not-found":
      "App configuration error. Please contact support.",
    "auth/api-key-not-valid":
      "App configuration error. Please contact support.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password":
      "Password is too weak. Please choose a stronger password.",
  };

  return (
    errorMessages[errorCode] ||
    "An unexpected error occurred. Please try again."
  );
};

/**
 * Check if an error suggests the user should create an account
 */
export const shouldSuggestAccountCreation = (errorCode) => {
  return ["auth/invalid-credential", "auth/user-not-found"].includes(errorCode);
};
