import { auth, db } from "@/constants/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

/**
 * Add a new property to Firestore
 * @param {Object} propertyData - The property data to add
 * @returns {Promise<string>} - The ID of the created property
 */
export const addProperty = async (propertyData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const propertyWithOwner = {
      ...propertyData,
      ownerId: user.uid,
      ownerEmail: user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(
      collection(db, "properties"),
      propertyWithOwner
    );
    return docRef.id;
  } catch (error) {
    console.error("Error adding property:", error);
    throw error;
  }
};

/**
 * Get all properties for the current user
 * @returns {Promise<Array>} - Array of properties
 */
export const getUserProperties = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Use simple where query without orderBy to avoid index requirement
    const q = query(
      collection(db, "properties"),
      where("ownerId", "==", user.uid)
    );

    const querySnapshot = await getDocs(q);
    const properties = [];

    querySnapshot.forEach((doc) => {
      properties.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Calculate real-time occupancy for each property
    const propertiesWithOccupancy = await Promise.all(
      properties.map(async (property) => {
        try {
          // Get rooms for this property to calculate real occupancy
          const { getPropertyRooms } = await import("./roomHelpers");
          const rooms = await getPropertyRooms(property.id);

          const totalRooms = rooms.length;
          const occupied = rooms.filter(
            (room) => room.status === "occupied"
          ).length;
          const vacancies = totalRooms - occupied;

          return {
            ...property,
            totalRooms,
            occupied,
            vacancies,
            // Keep the stored values as fallback but prioritize calculated values
            occupiedRooms: occupied,
          };
        } catch (roomError) {
          console.warn(
            `Failed to get rooms for property ${property.id}:`,
            roomError
          );
          // Return property with stored values if room calculation fails
          return {
            ...property,
            totalRooms: property.totalRooms || 0,
            occupied: property.occupied || 0,
            vacancies: property.vacancies || 0,
            occupiedRooms: property.occupied || 0,
          };
        }
      })
    );

    // Sort by createdAt in JavaScript instead of Firestore
    return propertiesWithOccupancy.sort((a, b) => {
      const dateA =
        a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
      const dateB =
        b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
      return dateB - dateA; // Descending order (newest first)
    });
  } catch (error) {
    console.error("Error getting properties:", error);
    throw error;
  }
};

/**
 * Get a specific property by ID
 * @param {string} propertyId - The ID of the property to get
 * @returns {Promise<Object>} - The property data
 */
export const getPropertyById = async (propertyId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const propertyRef = doc(db, "properties", propertyId);
    const propertySnap = await getDoc(propertyRef);

    if (!propertySnap.exists()) {
      throw new Error("Property not found");
    }

    const propertyData = propertySnap.data();

    // Verify ownership
    if (propertyData.ownerId !== user.uid) {
      throw new Error("Access denied");
    }

    return {
      id: propertySnap.id,
      ...propertyData,
    };
  } catch (error) {
    console.error("Error getting property:", error);
    throw error;
  }
};

/**
 * Update a property
 * @param {string} propertyId - The ID of the property to update
 * @param {Object} updateData - The data to update
 * @returns {Promise<void>}
 */
export const updateProperty = async (propertyId, updateData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const propertyRef = doc(db, "properties", propertyId);
    await updateDoc(propertyRef, {
      ...updateData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating property:", error);
    throw error;
  }
};

/**
 * Delete a property
 * @param {string} propertyId - The ID of the property to delete
 * @returns {Promise<void>}
 */
export const deleteProperty = async (propertyId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check if property has any occupied rooms
    const { getPropertyRooms } = await import("./roomHelpers");
    const rooms = await getPropertyRooms(propertyId);

    const occupiedRooms = rooms.filter((room) => room.status === "occupied");

    if (occupiedRooms.length > 0) {
      const tenantNames = occupiedRooms
        .map((room) => room.tenant?.name || "Unknown Tenant")
        .join(", ");

      throw new Error(
        `Cannot delete property. ${occupiedRooms.length} room(s) are currently occupied by: ${tenantNames}. Please move out all tenants before deleting the property.`
      );
    }

    const propertyRef = doc(db, "properties", propertyId);
    await deleteDoc(propertyRef);
  } catch (error) {
    console.error("Error deleting property:", error);
    throw error;
  }
};

/**
 * Update property occupancy
 * @param {string} propertyId - The ID of the property
 * @param {number} occupied - Number of occupied rooms
 * @param {number} totalRooms - Total number of rooms
 * @returns {Promise<void>}
 */
export const updatePropertyOccupancy = async (
  propertyId,
  occupied,
  totalRooms
) => {
  try {
    const vacancies = totalRooms - occupied;
    await updateProperty(propertyId, {
      occupied,
      vacancies,
    });
  } catch (error) {
    console.error("Error updating property occupancy:", error);
    throw error;
  }
};

/**
 * Get property statistics for dashboard
 * @returns {Promise<Object>} - Property statistics
 */
export const getPropertyStats = async () => {
  try {
    const properties = await getUserProperties();

    const stats = {
      totalProperties: properties.length,
      totalRooms: 0,
      totalOccupied: 0,
      totalVacant: 0,
      totalRevenue: 0,
    };

    properties.forEach((property) => {
      stats.totalRooms += property.totalRooms || 0;
      stats.totalOccupied += property.occupied || 0;
      stats.totalVacant += property.vacancies || 0;
      stats.totalRevenue +=
        (property.occupied || 0) * (property.monthlyRate || 0);
    });

    return stats;
  } catch (error) {
    console.error("Error getting property stats:", error);
    throw error;
  }
};
