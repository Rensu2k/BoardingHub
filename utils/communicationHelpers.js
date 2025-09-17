import { doc, getDoc } from "firebase/firestore";
import { Alert, Linking, Platform } from "react-native";
import * as Communications from "react-native-communications";

import { auth, db } from "@/constants/firebase";
import { submitRoomApplication } from "./notificationHelpers";
import { getUserProfile } from "./profileSync";

/**
 * Utility functions for handling communication (calls, messages, etc.)
 */

/**
 * Format phone number for display and calling
 * @param {string} phone - Raw phone number
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return null;

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // If it's a Philippine number starting with 9, add +63
  if (cleaned.length === 10 && cleaned.startsWith("9")) {
    return `+63${cleaned}`;
  }

  // If it's already in international format
  if (cleaned.length === 12 && cleaned.startsWith("63")) {
    return `+${cleaned}`;
  }

  // If it's already prefixed with +63
  if (phone.startsWith("+63")) {
    return phone;
  }

  return phone;
};

/**
 * Make a phone call
 * @param {string} phoneNumber - Phone number to call
 * @param {string} contactName - Name of the contact (for display)
 */
export const makePhoneCall = async (phoneNumber, contactName = "Contact") => {
  try {
    const formattedNumber = formatPhoneNumber(phoneNumber);

    if (!formattedNumber) {
      Alert.alert("Error", "Invalid phone number");
      return;
    }

    Alert.alert("Make Call", `Call ${contactName}?\n${formattedNumber}`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Call Now",
        onPress: async () => {
          try {
            if (Platform.OS === "ios") {
              await Linking.openURL(`tel:${formattedNumber}`);
            } else {
              // For Android, use the communications library
              Communications.phonecall(formattedNumber, true);
            }
          } catch (error) {
            console.error("Error making phone call:", error);
            Alert.alert(
              "Error",
              "Unable to make phone call. Please check if the phone app is available."
            );
          }
        },
      },
    ]);
  } catch (error) {
    console.error("Error in makePhoneCall:", error);
    Alert.alert("Error", "Unable to initiate phone call");
  }
};

/**
 * Send SMS message
 * @param {string} phoneNumber - Phone number to send SMS to
 * @param {string} message - Message content
 * @param {string} contactName - Name of the contact (for display)
 */
export const sendSMSMessage = async (
  phoneNumber,
  message,
  contactName = "Contact"
) => {
  try {
    const formattedNumber = formatPhoneNumber(phoneNumber);

    if (!formattedNumber) {
      Alert.alert("Error", "Invalid phone number");
      return;
    }

    Alert.alert(
      "Send Message",
      `Send message to ${contactName}?\n${formattedNumber}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send SMS",
          onPress: async () => {
            try {
              if (Platform.OS === "ios") {
                await Linking.openURL(
                  `sms:${formattedNumber}&body=${encodeURIComponent(message)}`
                );
              } else {
                Communications.text(formattedNumber, message);
              }
            } catch (error) {
              console.error("Error sending SMS:", error);
              Alert.alert(
                "Error",
                "Unable to send SMS. Please check if the messaging app is available."
              );
            }
          },
        },
      ]
    );
  } catch (error) {
    console.error("Error in sendSMSMessage:", error);
    Alert.alert("Error", "Unable to send SMS");
  }
};

/**
 * Send email
 * @param {string} email - Email address
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 * @param {string} contactName - Name of the contact (for display)
 */
export const sendEmail = async (
  email,
  subject,
  body,
  contactName = "Contact"
) => {
  try {
    if (!email || !email.includes("@")) {
      Alert.alert("Error", "Invalid email address");
      return;
    }

    Alert.alert("Send Email", `Send email to ${contactName}?\n${email}`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Send Email",
        onPress: async () => {
          try {
            Communications.email(
              [email],
              null, // CC
              null, // BCC
              subject,
              body
            );
          } catch (error) {
            console.error("Error sending email:", error);
            Alert.alert(
              "Error",
              "Unable to send email. Please check if an email app is available."
            );
          }
        },
      },
    ]);
  } catch (error) {
    console.error("Error in sendEmail:", error);
    Alert.alert("Error", "Unable to send email");
  }
};

/**
 * Get current tenant profile for application
 * @returns {Promise<Object>} - Current tenant profile data
 */
export const getCurrentTenantProfile = async () => {
  try {
    // First try to get from Firebase if user is authenticated
    const user = auth.currentUser;
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Return the actual Firebase user data
          return {
            id: user.uid, // Include Firebase user ID
            userId: user.uid, // Alternative field name
            fullName:
              userData.fullName ||
              `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email || user.email,
            phone: userData.phone,
            dateOfBirth: userData.dateOfBirth,
            gender: userData.gender,
            occupation: userData.occupation,
            company: userData.company,
            idType: userData.idType,
            idNumber: userData.idNumber,
            address: userData.address,
            emergencyContactName: userData.emergencyContactName,
            emergencyContactRelation: userData.emergencyContactRelation,
            emergencyContactPhone: userData.emergencyContactPhone,
            profilePhoto: userData.profilePhoto,
          };
        }
      } catch (firebaseError) {
        console.error("Error fetching from Firebase:", firebaseError);
      }
    }

    // Fallback to profile sync if Firebase fails
    let profile = await getUserProfile();
    if (profile) {
      return profile;
    }

    // Last resort: use default mock data for demo
    console.warn("Using mock data - no user profile found");
    return {
      fullName: "Juan Dela Cruz",
      firstName: "Juan",
      lastName: "Dela Cruz",
      email: "juan.delacruz@email.com",
      phone: "+63 912 345 6789",
      occupation: "Software Engineer",
      company: "Tech Solutions Inc.",
      idType: "National ID",
      idNumber: "****-****-**98",
      address: "123 Main Street, Quezon City",
      emergencyContactName: "Maria Dela Cruz",
      emergencyContactRelation: "Mother",
      emergencyContactPhone: "+63 917 987 6543",
      dateOfBirth: "1995-06-15",
      gender: "Male",
    };
  } catch (error) {
    console.error("Error getting tenant profile:", error);
    // Return basic profile as fallback
    return {
      fullName: "New Applicant",
      email: "applicant@example.com",
      phone: "Not provided",
    };
  }
};

/**
 * Submit room application and notify landlord via in-app notification
 * @param {Object} landlordInfo - Landlord contact information
 * @param {Object} roomInfo - Room information
 * @param {Object} tenantInfo - Tenant profile information
 * @returns {Promise<Object>} - Application result
 */
export const notifyLandlordOfApplication = async (
  landlordInfo,
  roomInfo,
  tenantInfo
) => {
  try {
    // Use the new notification system instead of sending SMS/Email
    const result = await submitRoomApplication(
      landlordInfo,
      roomInfo,
      tenantInfo
    );

    if (result.success) {
      return {
        success: true,
        notificationId: result.notificationId,
        message:
          "Application submitted successfully! The landlord has been notified in their notifications panel.",
        results: {
          notification: {
            success: true,
            message: "In-app notification created",
          },
        },
      };
    } else {
      return {
        success: false,
        error: result.error,
        message: result.message,
        results: {},
      };
    }
  } catch (error) {
    console.error("Error submitting application:", error);
    return {
      success: false,
      error: error.message,
      message: "Failed to submit application. Please try again.",
      results: {},
    };
  }
};

/**
 * Generate application notification message for landlord
 * @param {string} landlordName - Landlord name
 * @param {string} tenantName - Tenant name
 * @param {string} roomTitle - Room title
 * @param {string} roomNumber - Room number
 * @param {string} propertyName - Property name
 * @param {Object} tenantInfo - Complete tenant information
 * @returns {string} - Generated notification message
 */
export const generateApplicationNotification = (
  landlordName,
  tenantName,
  roomTitle,
  roomNumber,
  propertyName,
  tenantInfo
) => {
  const currentDate = new Date().toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `🏠 NEW ROOM APPLICATION - BoardingHub

Dear ${landlordName},

You have received a new application for:
📍 ${roomTitle} (Room ${roomNumber}) at ${propertyName}

👤 APPLICANT DETAILS:
• Name: ${tenantName}
• Email: ${tenantInfo?.email || "Not provided"}
• Phone: ${tenantInfo?.phone || "Not provided"}
• Occupation: ${tenantInfo?.occupation || "Not specified"}
• Company: ${tenantInfo?.company || "Not specified"}

🆔 IDENTIFICATION:
• ID Type: ${tenantInfo?.idType || "Not specified"}
• Address: ${tenantInfo?.address || "Not provided"}

🚨 EMERGENCY CONTACT:
• Name: ${tenantInfo?.emergencyContactName || "Not provided"}
• Relation: ${tenantInfo?.emergencyContactRelation || "Not specified"}
• Phone: ${tenantInfo?.emergencyContactPhone || "Not provided"}

📅 Application submitted: ${currentDate}

⚡ NEXT STEPS:
1. Review the application details
2. Contact the applicant to schedule viewing/interview
3. Request additional documents if needed
4. Update room availability status

📱 Reply to this message or call ${
    tenantInfo?.phone || "the applicant"
  } to proceed.

Thank you for using BoardingHub!
---
This is an automated notification from BoardingHub App.`;
};

/**
 * Send SMS notification directly (without user interaction)
 * @param {string} phoneNumber - Phone number to send SMS to
 * @param {string} message - Message content
 * @param {string} contactName - Name of the contact
 */
export const sendSMSNotificationDirect = async (
  phoneNumber,
  message,
  contactName = "Contact"
) => {
  try {
    const formattedNumber = formatPhoneNumber(phoneNumber);

    if (!formattedNumber) {
      throw new Error("Invalid phone number");
    }

    // For direct notifications, we'll use the native SMS without user confirmation
    if (Platform.OS === "ios") {
      await Linking.openURL(
        `sms:${formattedNumber}&body=${encodeURIComponent(message)}`
      );
    } else {
      Communications.text(formattedNumber, message);
    }

    console.log(
      `SMS notification sent to ${contactName} at ${formattedNumber}`
    );
    return { success: true, method: "sms" };
  } catch (error) {
    console.error("Error sending SMS notification:", error);
    throw error;
  }
};

/**
 * Send email notification directly (without user interaction)
 * @param {string} email - Email address
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 * @param {string} contactName - Name of the contact
 */
export const sendEmailNotificationDirect = async (
  email,
  subject,
  body,
  contactName = "Contact"
) => {
  try {
    if (!email || !email.includes("@")) {
      throw new Error("Invalid email address");
    }

    // For direct notifications, we'll use the native email without user confirmation
    Communications.email(
      [email],
      null, // CC
      null, // BCC
      subject,
      body
    );

    console.log(`Email notification sent to ${contactName} at ${email}`);
    return { success: true, method: "email" };
  } catch (error) {
    console.error("Error sending email notification:", error);
    throw error;
  }
};

/**
 * Generate message templates for different scenarios
 * @param {string} type - Type of message (inquire, apply, schedule, etc.)
 * @param {Object} roomInfo - Room information
 * @param {Object} landlordInfo - Landlord information
 * @returns {string} - Generated message template
 */
export const generateMessageTemplate = (type, roomInfo, landlordInfo) => {
  const landlordName = landlordInfo?.name || "Property Owner";
  const roomTitle = roomInfo?.title || "Room";
  const roomNumber = roomInfo?.roomNumber || "N/A";
  const price = roomInfo?.price || 0;
  const propertyName = roomInfo?.property?.name || "the property";

  const templates = {
    inquire: `Hi ${landlordName},

I'm interested in the ${roomTitle} (Room ${roomNumber}) at ${propertyName} listed at ₱${price.toLocaleString()}/month.

Could you please provide more details about:
- Current availability
- Viewing schedule
- Move-in requirements

I'm a responsible tenant and can provide references if needed.

Thank you!`,

    apply: `Hi ${landlordName},

I would like to formally apply for the ${roomTitle} (Room ${roomNumber}) at ${propertyName}.

I'm a responsible tenant and can provide:
- Valid IDs
- Employment certification
- Previous landlord references
- Security deposit

Please let me know the next steps in the application process.

Thank you!`,

    schedule: `Hi ${landlordName},

I'm interested in viewing the ${roomTitle} (Room ${roomNumber}) at ${propertyName}.

When would be a good time for a visit? I'm generally available:
- Weekdays: 6PM onwards
- Weekends: Flexible

Please let me know your preferred schedule.

Thank you!`,

    negotiate: `Hi ${landlordName},

I'm very interested in the ${roomTitle} (Room ${roomNumber}) at ${propertyName}.

I'd like to discuss the terms, particularly:
- Rental rate
- Security deposit
- Lease duration
- Included utilities

Would you be open to negotiation?

Thank you!`,

    followup: `Hi ${landlordName},

I'm following up on my inquiry about the ${roomTitle} (Room ${roomNumber}) at ${propertyName}.

Is the room still available? I'm ready to proceed with the application process if it is.

Looking forward to your response.

Thank you!`,
  };

  return templates[type] || templates.inquire;
};

/**
 * Show contact options modal
 * @param {Object} landlordInfo - Landlord contact information
 * @param {Object} roomInfo - Room information
 * @param {string} messageType - Type of message to send
 */
export const showContactOptions = (
  landlordInfo,
  roomInfo,
  messageType = "inquire"
) => {
  const landlordName = landlordInfo?.name || "Property Owner";
  const phone = landlordInfo?.phone;
  const email = landlordInfo?.email;
  const message = generateMessageTemplate(messageType, roomInfo, landlordInfo);

  const options = [];

  // Add phone call option
  if (phone) {
    options.push({
      text: "📞 Call",
      onPress: () => makePhoneCall(phone, landlordName),
    });
  }

  // Add SMS option
  if (phone) {
    options.push({
      text: "💬 SMS",
      onPress: () => sendSMSMessage(phone, message, landlordName),
    });
  }

  // Add email option
  if (email) {
    options.push({
      text: "📧 Email",
      onPress: () =>
        sendEmail(
          email,
          `Inquiry about ${roomInfo?.title || "Room"}`,
          message,
          landlordName
        ),
    });
  }

  // Add cancel option
  options.push({ text: "Cancel", style: "cancel" });

  Alert.alert(
    `Contact ${landlordName}`,
    "Choose how you would like to contact the landlord:",
    options
  );
};
