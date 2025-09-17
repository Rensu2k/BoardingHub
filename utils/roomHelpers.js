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
import { updatePropertyOccupancy } from "./propertyHelpers";

/**
 * Add a new room to a property
 * @param {string} propertyId - The ID of the property
 * @param {Object} roomData - The room data to add
 * @returns {Promise<string>} - The ID of the created room
 */
export const addRoom = async (propertyId, roomData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const roomWithMetadata = {
      ...roomData,
      propertyId,
      ownerId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, "rooms"), roomWithMetadata);

    // Update property occupancy after adding room
    await updatePropertyOccupancyFromRooms(propertyId);

    return docRef.id;
  } catch (error) {
    console.error("Error adding room:", error);
    throw error;
  }
};

/**
 * Get all rooms for a specific property
 * @param {string} propertyId - The ID of the property
 * @returns {Promise<Array>} - Array of rooms
 */
export const getPropertyRooms = async (propertyId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const q = query(
      collection(db, "rooms"),
      where("propertyId", "==", propertyId),
      where("ownerId", "==", user.uid)
    );

    const querySnapshot = await getDocs(q);
    const rooms = [];

    querySnapshot.forEach((doc) => {
      rooms.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Sort by room number or name
    return rooms.sort((a, b) => {
      const aNum = parseInt(a.roomNumber) || 0;
      const bNum = parseInt(b.roomNumber) || 0;
      return aNum - bNum;
    });
  } catch (error) {
    console.error("Error getting rooms:", error);
    throw error;
  }
};

/**
 * Get a specific room by ID
 * @param {string} roomId - The ID of the room to get
 * @returns {Promise<Object>} - The room data
 */
export const getRoomById = async (roomId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      throw new Error("Room not found");
    }

    const roomData = roomSnap.data();

    // Verify ownership
    if (roomData.ownerId !== user.uid) {
      throw new Error("Access denied");
    }

    return {
      id: roomSnap.id,
      ...roomData,
    };
  } catch (error) {
    console.error("Error getting room:", error);
    throw error;
  }
};

/**
 * Update a room
 * @param {string} roomId - The ID of the room to update
 * @param {Object} updateData - The data to update
 * @returns {Promise<void>}
 */
export const updateRoom = async (roomId, updateData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, {
      ...updateData,
      updatedAt: new Date(),
    });

    // Update property occupancy if room status changed
    if (updateData.status !== undefined) {
      let propertyId = updateData.propertyId;

      // If propertyId not provided, get it from the room record
      if (!propertyId) {
        const roomSnap = await getDoc(roomRef);
        if (roomSnap.exists()) {
          propertyId = roomSnap.data().propertyId;
        }
      }

      if (propertyId) {
        await updatePropertyOccupancyFromRooms(propertyId);
        console.log(`Property occupancy updated for property: ${propertyId}`);
      } else {
        console.warn(
          "Could not update property occupancy: propertyId not found"
        );
      }
    }
  } catch (error) {
    console.error("Error updating room:", error);
    throw error;
  }
};

/**
 * Delete a room
 * @param {string} roomId - The ID of the room to delete
 * @param {string} propertyId - The ID of the property (for occupancy update)
 * @returns {Promise<void>}
 */
export const deleteRoom = async (roomId, propertyId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check if room is currently occupied
    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);

    if (roomSnap.exists()) {
      const roomData = roomSnap.data();

      if (roomData.status === "occupied") {
        const tenantName = roomData.tenant?.name || "Unknown Tenant";
        throw new Error(
          `Cannot delete room ${
            roomData.number || roomData.title
          }. It is currently occupied by ${tenantName}. Please move out the tenant before deleting the room.`
        );
      }
    }

    await deleteDoc(roomRef);

    // Update property occupancy after deleting room
    await updatePropertyOccupancyFromRooms(propertyId);
  } catch (error) {
    console.error("Error deleting room:", error);
    throw error;
  }
};

/**
 * Update property occupancy based on room statuses
 * @param {string} propertyId - The ID of the property
 * @returns {Promise<void>}
 */
export const updatePropertyOccupancyFromRooms = async (propertyId) => {
  try {
    const rooms = await getPropertyRooms(propertyId);
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(
      (room) => room.status === "occupied"
    ).length;

    await updatePropertyOccupancy(propertyId, occupiedRooms, totalRooms);
  } catch (error) {
    console.error("Error updating property occupancy:", error);
    throw error;
  }
};

/**
 * Get room statistics for a property
 * @param {string} propertyId - The ID of the property
 * @returns {Promise<Object>} - Room statistics
 */
export const getRoomStats = async (propertyId) => {
  try {
    const rooms = await getPropertyRooms(propertyId);

    const stats = {
      total: rooms.length,
      occupied: rooms.filter((room) => room.status === "occupied").length,
      vacant: rooms.filter((room) => room.status === "vacant").length,
      maintenance: rooms.filter((room) => room.status === "maintenance").length,
      totalRevenue: rooms
        .filter((room) => room.status === "occupied")
        .reduce((sum, room) => sum + (room.monthlyRate || 0), 0),
    };

    return stats;
  } catch (error) {
    console.error("Error getting room stats:", error);
    throw error;
  }
};

/**
 * Assign tenant to room
 * @param {string} roomId - The ID of the room
 * @param {Object} tenantData - Tenant information
 * @returns {Promise<void>}
 */
export const assignTenantToRoom = async (roomId, tenantData) => {
  try {
    await updateRoom(roomId, {
      status: "occupied",
      tenant: tenantData,
      occupiedDate: new Date(),
    });
  } catch (error) {
    console.error("Error assigning tenant to room:", error);
    throw error;
  }
};

/**
 * Remove tenant from room
 * @param {string} roomId - The ID of the room
 * @returns {Promise<void>}
 */
export const removeTenantFromRoom = async (roomId) => {
  try {
    await updateRoom(roomId, {
      status: "vacant",
      tenant: null,
      occupiedDate: null,
      vacatedDate: new Date(),
    });
  } catch (error) {
    console.error("Error removing tenant from room:", error);
    throw error;
  }
};

/**
 * Get all available rooms for tenant browsing (no authentication required)
 * @param {Object} filters - Filter options for rooms
 * @returns {Promise<Array>} - Array of available rooms with property details
 */
export const getAvailableRoomsForTenants = async (filters = {}) => {
  try {
    // Get all rooms that are available (vacant status)
    const q = query(collection(db, "rooms"), where("status", "==", "vacant"));

    const querySnapshot = await getDocs(q);
    const rooms = [];

    // Get all properties to join with room data
    const propertiesSnapshot = await getDocs(collection(db, "properties"));
    const propertiesMap = {};

    propertiesSnapshot.forEach((doc) => {
      propertiesMap[doc.id] = {
        id: doc.id,
        ...doc.data(),
      };
    });

    querySnapshot.forEach((doc) => {
      const roomData = doc.data();
      const property = propertiesMap[roomData.propertyId];

      if (property) {
        rooms.push({
          id: doc.id,
          ...roomData,
          property: {
            id: property.id,
            name: property.name,
            address: property.address,
            description: property.description,
            amenities: property.amenities || [],
            photos: property.photos || [],
          },
          // Map room data to tenant-friendly format
          title: `${roomData.type} - ${property.name}`,
          roomNumber: roomData.number,
          price: roomData.rent,
          location: property.address,
          description:
            roomData.notes ||
            property.description ||
            "Available room in " + property.name,
          images:
            roomData.photos && roomData.photos.length > 0
              ? roomData.photos
              : property.photos && property.photos.length > 0
              ? property.photos
              : [
                  `https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=${encodeURIComponent(
                    roomData.number || roomData.type
                  )}`,
                ],
          available: true,
          type: roomData.type,
          size: roomData.size || "Not specified",
          deposit: roomData.rent * 2, // Common 2-month deposit
          monthlyRent: roomData.rent,
          utilities: roomData.utilities,
          landlord: {
            name: property.ownerName || "Property Owner",
            phone: property.contactNumber || "+63 XXX XXX XXXX",
            email: property.ownerEmail || "owner@property.com",
            verified: true,
          },
          amenities: [
            ...Object.entries(roomData.utilities || {})
              .map(([utility, config]) => {
                if (config.type === "free")
                  return utility.charAt(0).toUpperCase() + utility.slice(1);
                return null;
              })
              .filter(Boolean),
            ...(property.amenities || []),
          ],
          rules: property.rules || [
            "No smoking inside the property",
            "No pets allowed",
            "Quiet hours: 10PM - 6AM",
            "Visitors must be registered",
          ],
        });
      }
    });

    // Apply filters
    let filteredRooms = rooms;

    // Price range filter
    if (filters.priceRange && filters.priceRange !== "all") {
      const ranges = {
        "under-4000": [0, 4000],
        "4000-6000": [4000, 6000],
        "6000-8000": [6000, 8000],
        "above-8000": [8000, Infinity],
      };
      const [min, max] = ranges[filters.priceRange] || [0, Infinity];
      filteredRooms = filteredRooms.filter(
        (room) => room.price >= min && room.price < max
      );
    }

    // Room type filter
    if (filters.roomType && filters.roomType !== "all") {
      filteredRooms = filteredRooms.filter((room) =>
        room.type.toLowerCase().includes(filters.roomType.toLowerCase())
      );
    }

    // Search filter
    if (filters.searchQuery) {
      filteredRooms = filteredRooms.filter(
        (room) =>
          room.title
            .toLowerCase()
            .includes(filters.searchQuery.toLowerCase()) ||
          room.location
            .toLowerCase()
            .includes(filters.searchQuery.toLowerCase()) ||
          room.description
            .toLowerCase()
            .includes(filters.searchQuery.toLowerCase())
      );
    }

    // Amenities filter
    if (filters.amenities && filters.amenities.length > 0) {
      filteredRooms = filteredRooms.filter((room) =>
        filters.amenities.every((amenity) =>
          room.amenities.some((roomAmenity) =>
            roomAmenity.toLowerCase().includes(amenity.toLowerCase())
          )
        )
      );
    }

    // Sort by creation date (newest first) then by price
    return filteredRooms.sort((a, b) => {
      const dateA =
        a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
      const dateB =
        b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
      if (dateB - dateA !== 0) return dateB - dateA;
      return a.price - b.price;
    });
  } catch (error) {
    console.error("Error getting available rooms for tenants:", error);
    throw error;
  }
};

/**
 * Get room details for tenant viewing
 * @param {string} roomId - The ID of the room
 * @returns {Promise<Object>} - Room details with property information
 */
export const getRoomDetailsForTenant = async (roomId) => {
  try {
    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      throw new Error("Room not found");
    }

    const roomData = roomSnap.data();

    // Get property details
    const propertyRef = doc(db, "properties", roomData.propertyId);
    const propertySnap = await getDoc(propertyRef);

    if (!propertySnap.exists()) {
      throw new Error("Property not found");
    }

    const propertyData = propertySnap.data();

    return {
      id: roomSnap.id,
      ...roomData,
      property: {
        id: propertySnap.id,
        ...propertyData,
      },
      // Format for tenant display
      title: `${roomData.type} - ${propertyData.name}`,
      roomNumber: roomData.number,
      price: roomData.rent,
      location: propertyData.address,
      description:
        roomData.notes ||
        propertyData.description ||
        "Available room in " + propertyData.name,
      images:
        roomData.photos && roomData.photos.length > 0
          ? roomData.photos
          : propertyData.photos && propertyData.photos.length > 0
          ? propertyData.photos
          : [
              `https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=${encodeURIComponent(
                roomData.number || roomData.type
              )}`,
            ],
      available: roomData.status === "vacant",
      type: roomData.type,
      size: roomData.size || "Not specified",
      deposit: roomData.rent * 2,
      monthlyRent: roomData.rent,
      utilities: roomData.utilities,
      landlord: {
        name: propertyData.ownerName || "Property Owner",
        phone: propertyData.contactNumber || "+63 XXX XXX XXXX",
        email: propertyData.ownerEmail || "owner@property.com",
        verified: true,
      },
      amenities: [
        ...Object.entries(roomData.utilities || {})
          .map(([utility, config]) => {
            if (config.type === "free")
              return utility.charAt(0).toUpperCase() + utility.slice(1);
            return null;
          })
          .filter(Boolean),
        ...(propertyData.amenities || []),
      ],
      rules: propertyData.rules || [
        "No smoking inside the property",
        "No pets allowed",
        "Quiet hours: 10PM - 6AM",
        "Visitors must be registered",
      ],
    };
  } catch (error) {
    console.error("Error getting room details for tenant:", error);
    throw error;
  }
};
