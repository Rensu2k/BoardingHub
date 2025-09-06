// User management utilities for Firebase
import { db } from "@/constants/firebase";
import { deleteUser } from "firebase/auth";
import { deleteDoc, doc, getDoc } from "firebase/firestore";

/**
 * Properly delete a user from both Firebase Auth and Firestore
 * This should be called from admin functions or when a user deletes their own account
 */
export const deleteUserCompletely = async (user) => {
  try {
    console.log(`Deleting user completely: ${user.email} (${user.uid})`);

    // First, delete the user document from Firestore
    await deleteDoc(doc(db, "users", user.uid));
    console.log("User document deleted from Firestore");

    // Then, delete the user from Firebase Authentication
    await deleteUser(user);
    console.log("User deleted from Firebase Authentication");

    return true;
  } catch (error) {
    console.error("Error deleting user completely:", error);
    throw error;
  }
};

/**
 * Force refresh user token and handle deleted users
 * Returns true if user is valid, false if user should be signed out
 */
export const validateUserToken = async (user) => {
  try {
    // Force token refresh to check if user still exists in Firebase Auth
    await user.getIdToken(true);
    return true;
  } catch (error) {
    console.error("Token validation failed:", error);

    // Check for specific error codes that indicate deleted/disabled users
    if (
      error.code === "auth/user-token-expired" ||
      error.code === "auth/user-disabled" ||
      error.code === "auth/user-not-found"
    ) {
      console.log("User no longer valid, should sign out");
      return false;
    }

    // For other errors, assume user is still valid
    return true;
  }
};

/**
 * Check if user profile exists in Firestore
 */
export const checkUserProfileExists = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists();
  } catch (error) {
    console.error("Error checking user profile:", error);
    return false;
  }
};
