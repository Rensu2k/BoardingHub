import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateRoom } from "./roomHelpers";
import { assignTenantToRoom } from "./tenantHelpers";

/**
 * Notification Management System for BoardingHub
 * Handles in-app notifications for landlords and tenants
 */

const STORAGE_KEYS = {
  LANDLORD_NOTIFICATIONS: "landlord_notifications",
  TENANT_NOTIFICATIONS: "tenant_notifications",
  LAST_NOTIFICATION_ID: "last_notification_id",
};

/**
 * Generate unique notification ID
 * @returns {string} - Unique notification ID
 */
const generateNotificationId = async () => {
  try {
    const lastId = await AsyncStorage.getItem(
      STORAGE_KEYS.LAST_NOTIFICATION_ID
    );
    const newId = lastId ? parseInt(lastId) + 1 : 1;
    await AsyncStorage.setItem(
      STORAGE_KEYS.LAST_NOTIFICATION_ID,
      newId.toString()
    );
    return `notif_${newId}_${Date.now()}`;
  } catch (error) {
    console.error("Error generating notification ID:", error);
    return `notif_${Date.now()}`;
  }
};

/**
 * Create a new room application notification for landlord
 * @param {Object} tenantInfo - Tenant information
 * @param {Object} roomInfo - Room information
 * @param {Object} landlordInfo - Landlord information
 * @returns {Promise<Object>} - Created notification
 */
export const createApplicationNotification = async (
  tenantInfo,
  roomInfo,
  landlordInfo
) => {
  try {
    const notificationId = await generateNotificationId();
    const timestamp = new Date().toISOString();

    const notification = {
      id: notificationId,
      type: "application",
      title: "New Room Application",
      message: `${tenantInfo?.fullName || "New applicant"} applied for ${
        roomInfo?.title || "a room"
      }`,
      tenantName: tenantInfo?.fullName || "Unknown Applicant",
      property: roomInfo?.property?.name || "Property",
      roomNumber: roomInfo?.roomNumber || "N/A",
      timestamp,
      isRead: false,
      contextType: "application",
      contextId: notificationId,
      // Store complete tenant and room data for the details modal
      applicationData: {
        tenant: {
          id: tenantInfo?.id || tenantInfo?.userId, // Firebase user ID
          fullName:
            tenantInfo?.fullName ||
            `${tenantInfo?.firstName || ""} ${
              tenantInfo?.lastName || ""
            }`.trim(),
          firstName: tenantInfo?.firstName,
          lastName: tenantInfo?.lastName,
          email: tenantInfo?.email,
          phone: tenantInfo?.phone,
          occupation: tenantInfo?.occupation,
          company: tenantInfo?.company,
          idType: tenantInfo?.idType,
          idNumber: tenantInfo?.idNumber,
          address: tenantInfo?.address,
          emergencyContactName: tenantInfo?.emergencyContactName,
          emergencyContactRelation: tenantInfo?.emergencyContactRelation,
          emergencyContactPhone: tenantInfo?.emergencyContactPhone,
          dateOfBirth: tenantInfo?.dateOfBirth,
          gender: tenantInfo?.gender,
        },
        room: {
          id: roomInfo?.id,
          title: roomInfo?.title,
          roomNumber: roomInfo?.roomNumber,
          price: roomInfo?.price,
          description: roomInfo?.description,
          amenities: roomInfo?.amenities,
          images: roomInfo?.images,
          property: roomInfo?.property,
          landlord: roomInfo?.landlord,
        },
        applicationDate: timestamp,
        status: "pending", // pending, approved, rejected
      },
    };

    // Save to landlord notifications
    await addNotificationToLandlord(notification);

    console.log("Application notification created:", notification.id);
    return notification;
  } catch (error) {
    console.error("Error creating application notification:", error);
    throw error;
  }
};

/**
 * Add notification to landlord's notification list
 * @param {Object} notification - Notification object
 * @returns {Promise<boolean>} - Success status
 */
export const addNotificationToLandlord = async (notification) => {
  try {
    // Get only the real stored notifications (not including mock data)
    const storedNotifications = await AsyncStorage.getItem(
      STORAGE_KEYS.LANDLORD_NOTIFICATIONS
    );
    const parsedNotifications = storedNotifications
      ? JSON.parse(storedNotifications)
      : [];

    // Add new notification to the beginning of the list
    const updatedNotifications = [notification, ...parsedNotifications];

    await AsyncStorage.setItem(
      STORAGE_KEYS.LANDLORD_NOTIFICATIONS,
      JSON.stringify(updatedNotifications)
    );

    return true;
  } catch (error) {
    console.error("Error adding notification to landlord:", error);
    return false;
  }
};

// Cache for mock notifications to avoid duplicates
let mockNotificationsCache = null;

/**
 * Get mock notifications (cached to avoid duplicates)
 * @returns {Array} - Array of mock notifications
 */
const getMockNotifications = () => {
  if (!mockNotificationsCache) {
    mockNotificationsCache = [
      {
        id: "mock_1",
        type: "due",
        title: "Rent Due Reminder",
        message: "Rent payment due in 3 days for Room 101",
        tenantName: "Juan Dela Cruz",
        property: "Sunset Apartments",
        roomNumber: "101",
        timestamp: "2024-01-15T10:00:00Z",
        isRead: false,
        contextType: "invoice",
        contextId: "INV-2024-001",
      },
      {
        id: "mock_2",
        type: "payment",
        title: "Payment Received",
        message: "Payment proof uploaded by Maria Santos",
        tenantName: "Maria Santos",
        property: "Sunset Apartments",
        roomNumber: "205",
        timestamp: "2024-01-15T08:30:00Z",
        isRead: false,
        contextType: "proof",
        contextId: "PROOF-001",
      },
      {
        id: "mock_3",
        type: "system",
        title: "Maintenance Request",
        message: "New maintenance request for Room 305",
        tenantName: "Pedro Reyes",
        property: "Sunset Apartments",
        roomNumber: "305",
        timestamp: "2024-01-14T16:45:00Z",
        isRead: true,
        contextType: "maintenance",
        contextId: "MAINT-001",
      },
    ];
  }
  return mockNotificationsCache;
};

/**
 * Get all landlord notifications
 * @returns {Promise<Array>} - Array of notifications
 */
export const getLandlordNotifications = async () => {
  try {
    const notifications = await AsyncStorage.getItem(
      STORAGE_KEYS.LANDLORD_NOTIFICATIONS
    );
    const parsedNotifications = notifications ? JSON.parse(notifications) : [];

    // Get mock notifications (cached to avoid duplicates)
    const mockNotifications = getMockNotifications();

    // Create a Set to track existing IDs and avoid duplicates
    const existingIds = new Set(parsedNotifications.map((n) => n.id));
    const uniqueMockNotifications = mockNotifications.filter(
      (n) => !existingIds.has(n.id)
    );

    return [...parsedNotifications, ...uniqueMockNotifications];
  } catch (error) {
    console.error("Error getting landlord notifications:", error);
    return [];
  }
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<boolean>} - Success status
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notifications = await getLandlordNotifications();
    const updatedNotifications = notifications.map((notification) =>
      notification.id === notificationId
        ? { ...notification, isRead: true }
        : notification
    );

    await AsyncStorage.setItem(
      STORAGE_KEYS.LANDLORD_NOTIFICATIONS,
      JSON.stringify(
        updatedNotifications.filter((n) => !n.id.startsWith("mock_"))
      )
    );

    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
};

/**
 * Get notification by ID
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object|null>} - Notification object or null
 */
export const getNotificationById = async (notificationId) => {
  try {
    const notifications = await getLandlordNotifications();
    return (
      notifications.find(
        (notification) => notification.id === notificationId
      ) || null
    );
  } catch (error) {
    console.error("Error getting notification by ID:", error);
    return null;
  }
};

/**
 * Update application status and handle room assignment
 * @param {string} notificationId - Notification ID
 * @param {string} status - New status (pending, approved, rejected)
 * @returns {Promise<Object>} - Result with success status and details
 */
export const updateApplicationStatus = async (notificationId, status) => {
  try {
    const notifications = await getLandlordNotifications();
    const notification = notifications.find((n) => n.id === notificationId);

    if (!notification || !notification.applicationData) {
      throw new Error("Notification or application data not found");
    }

    // If approving the application, assign tenant to room
    if (status === "approved") {
      const { tenant, room } = notification.applicationData;

      if (!tenant || !room) {
        throw new Error("Missing tenant or room data for assignment");
      }

      try {
        // Create lease details
        const leaseStartDate = new Date().toISOString();
        const leaseEndDate = new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ).toISOString(); // 1 year lease

        // Update room status to occupied and assign tenant
        await updateRoom(room.id, {
          status: "occupied",
          propertyId: room.property?.id, // Include propertyId to trigger occupancy update
          tenant: {
            id: tenant.id || notificationId, // Use notification ID if no tenant ID
            name: tenant.fullName,
            email: tenant.email,
            phone: tenant.phone,
          },
          tenantId: tenant.id || notificationId,
          occupiedDate: leaseStartDate,
          leaseStart: leaseStartDate,
          leaseEnd: leaseEndDate,
        });

        // Create tenant assignment record (this will create a user record if it doesn't exist)
        await assignTenantToRoom(tenant.id || notificationId, room.roomNumber, {
          leaseStart: leaseStartDate,
          leaseEnd: leaseEndDate,
          propertyId: room.property?.id,
          roomId: room.id,
        });

        console.log(
          `Successfully assigned ${tenant.fullName} to room ${room.roomNumber}`
        );

        // Force property occupancy update to ensure UI reflects changes
        try {
          const { updatePropertyOccupancyFromRooms } = await import(
            "./roomHelpers"
          );
          await updatePropertyOccupancyFromRooms(room.property?.id);
          console.log("Property occupancy manually updated after assignment");
        } catch (occupancyError) {
          console.warn(
            "Failed to manually update property occupancy:",
            occupancyError
          );
        }

        // Create a notification for the tenant about approval (future enhancement)
        // await createTenantNotification(tenant.id, {
        //   type: "application_approved",
        //   title: "Application Approved!",
        //   message: `Your application for ${room.title} has been approved. You are now assigned to room ${room.roomNumber}.`,
        //   roomInfo: room
        // });
      } catch (assignmentError) {
        console.error("Error during room assignment:", assignmentError);
        throw new Error(
          `Failed to assign tenant to room: ${assignmentError.message}`
        );
      }
    }

    // Update notification status
    const updatedNotifications = notifications.map((n) => {
      if (n.id === notificationId && n.applicationData) {
        return {
          ...n,
          applicationData: {
            ...n.applicationData,
            status,
            statusUpdatedAt: new Date().toISOString(),
          },
        };
      }
      return n;
    });

    await AsyncStorage.setItem(
      STORAGE_KEYS.LANDLORD_NOTIFICATIONS,
      JSON.stringify(
        updatedNotifications.filter((n) => !n.id.startsWith("mock_"))
      )
    );

    return {
      success: true,
      status,
      roomAssigned: status === "approved",
      message:
        status === "approved"
          ? `Application approved and tenant assigned to ${notification.applicationData.room.roomNumber}`
          : `Application ${status} successfully`,
    };
  } catch (error) {
    console.error("Error updating application status:", error);
    return {
      success: false,
      error: error.message,
      message: `Failed to ${status} application: ${error.message}`,
    };
  }
};

/**
 * Delete notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<boolean>} - Success status
 */
export const deleteNotification = async (notificationId) => {
  try {
    const notifications = await getLandlordNotifications();
    const filteredNotifications = notifications.filter(
      (notification) =>
        notification.id !== notificationId &&
        !notification.id.startsWith("mock_")
    );

    await AsyncStorage.setItem(
      STORAGE_KEYS.LANDLORD_NOTIFICATIONS,
      JSON.stringify(filteredNotifications)
    );

    return true;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return false;
  }
};

/**
 * Get unread notifications count
 * @returns {Promise<number>} - Count of unread notifications
 */
export const getUnreadNotificationsCount = async () => {
  try {
    const notifications = await getLandlordNotifications();
    return notifications.filter((notification) => !notification.isRead).length;
  } catch (error) {
    console.error("Error getting unread notifications count:", error);
    return 0;
  }
};

/**
 * Clear all notifications
 * @returns {Promise<boolean>} - Success status
 */
export const clearAllNotifications = async () => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.LANDLORD_NOTIFICATIONS,
      JSON.stringify([])
    );
    return true;
  } catch (error) {
    console.error("Error clearing all notifications:", error);
    return false;
  }
};

/**
 * Submit room application and create notification
 * @param {Object} landlordInfo - Landlord information
 * @param {Object} roomInfo - Room information
 * @param {Object} tenantInfo - Tenant information
 * @returns {Promise<Object>} - Application result
 */
export const submitRoomApplication = async (
  landlordInfo,
  roomInfo,
  tenantInfo
) => {
  try {
    // Create the notification for the landlord
    const notification = await createApplicationNotification(
      tenantInfo,
      roomInfo,
      landlordInfo
    );

    // In a real app, you would also:
    // 1. Save application to database
    // 2. Send push notifications
    // 3. Update room availability if needed
    // 4. Log the application for analytics

    return {
      success: true,
      notificationId: notification.id,
      message:
        "Application submitted successfully! The landlord will be notified.",
    };
  } catch (error) {
    console.error("Error submitting room application:", error);
    return {
      success: false,
      error: error.message,
      message: "Failed to submit application. Please try again.",
    };
  }
};
