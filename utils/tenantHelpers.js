import { db } from "@/constants/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

/**
 * Get all registered tenants for landlord view
 * @returns {Promise<Array>} - Array of all registered tenants
 */
export const getAllRegisteredTenants = async () => {
  try {
    // Query all users with userType "tenant"
    const q = query(collection(db, "users"), where("userType", "==", "tenant"));
    const querySnapshot = await getDocs(q);

    const tenants = [];
    querySnapshot.forEach((doc) => {
      const tenantData = doc.data();
      tenants.push({
        id: doc.id,
        name: `${tenantData.firstName} ${tenantData.lastName}`,
        email: tenantData.email,
        phone: tenantData.phone,
        preferredRoomType: tenantData.preferredRoomType,
        moveInDate: tenantData.moveInDate,
        emergencyContact: tenantData.emergencyContact,
        createdAt: tenantData.createdAt,
        // Default status for newly registered tenants
        status: tenantData.status || "registered",
        roomNumber: tenantData.roomNumber || null,
        balance: tenantData.balance || 0,
        leaseStart: tenantData.leaseStart || null,
        leaseEnd: tenantData.leaseEnd || null,
        // Add avatar field
        avatar: tenantData.avatar || null,
      });
    });

    // Sort by creation date (newest first)
    return tenants.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error fetching registered tenants:", error);
    throw error;
  }
};

/**
 * Get tenants assigned to a specific landlord's properties
 * @param {string} landlordId - The landlord's user ID
 * @returns {Promise<Array>} - Array of tenants assigned to landlord's properties
 */
export const getTenantsForLandlord = async (landlordId) => {
  try {
    // For now, return all registered tenants
    // In a full implementation, you'd filter by assigned properties
    const allTenants = await getAllRegisteredTenants();

    // You could add additional filtering here based on property assignments
    // For example: filter tenants who have applied to or been assigned to this landlord's properties

    return allTenants;
  } catch (error) {
    console.error("Error fetching tenants for landlord:", error);
    throw error;
  }
};

/**
 * Assign a tenant to a room
 * @param {string} tenantId - The tenant's user ID
 * @param {string} roomNumber - Room number to assign
 * @param {Object} leaseDetails - Lease start/end dates and other details
 * @returns {Promise<void>}
 */
export const assignTenantToRoom = async (
  tenantId,
  roomNumber,
  leaseDetails
) => {
  try {
    const tenantRef = doc(db, "users", tenantId);

    await updateDoc(tenantRef, {
      roomNumber,
      status: "active",
      leaseStart: leaseDetails.leaseStart,
      leaseEnd: leaseDetails.leaseEnd,
      propertyId: leaseDetails.propertyId,
      roomId: leaseDetails.roomId,
      assignedAt: new Date().toISOString(),
      balance: 0, // Reset balance when assigning
    });
  } catch (error) {
    console.error("Error assigning tenant to room:", error);
    throw error;
  }
};

/**
 * Update tenant status
 * @param {string} tenantId - The tenant's user ID
 * @param {string} status - New status (active, overdue, moving-out, etc.)
 * @returns {Promise<void>}
 */
export const updateTenantStatus = async (tenantId, status) => {
  try {
    const tenantRef = doc(db, "users", tenantId);

    await updateDoc(tenantRef, {
      status,
      statusUpdatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating tenant status:", error);
    throw error;
  }
};

/**
 * Update tenant balance
 * @param {string} tenantId - The tenant's user ID
 * @param {number} balance - New balance amount
 * @returns {Promise<void>}
 */
export const updateTenantBalance = async (tenantId, balance) => {
  try {
    const tenantRef = doc(db, "users", tenantId);

    await updateDoc(tenantRef, {
      balance,
      balanceUpdatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating tenant balance:", error);
    throw error;
  }
};

/**
 * Get tenant details by ID
 * @param {string} tenantId - The tenant's user ID
 * @returns {Promise<Object>} - Tenant details
 */
export const getTenantById = async (tenantId) => {
  try {
    const tenantRef = doc(db, "users", tenantId);
    const tenantSnap = await getDoc(tenantRef);

    if (!tenantSnap.exists()) {
      throw new Error("Tenant not found");
    }

    const tenantData = tenantSnap.data();
    return {
      id: tenantSnap.id,
      name: `${tenantData.firstName} ${tenantData.lastName}`,
      email: tenantData.email,
      phone: tenantData.phone,
      preferredRoomType: tenantData.preferredRoomType,
      moveInDate: tenantData.moveInDate,
      emergencyContact: tenantData.emergencyContact,
      createdAt: tenantData.createdAt,
      status: tenantData.status || "registered",
      roomNumber: tenantData.roomNumber || null,
      balance: tenantData.balance || 0,
      leaseStart: tenantData.leaseStart || null,
      leaseEnd: tenantData.leaseEnd || null,
      avatar: tenantData.avatar || null,
      // Include all original data
      ...tenantData,
    };
  } catch (error) {
    console.error("Error fetching tenant details:", error);
    throw error;
  }
};

/**
 * Check out a tenant (remove from room)
 * @param {string} tenantId - The tenant's user ID
 * @returns {Promise<void>}
 */
export const checkOutTenant = async (tenantId) => {
  try {
    // Get tenant data first to find their room
    const tenantRef = doc(db, "users", tenantId);
    const tenantSnap = await getDoc(tenantRef);
    
    if (!tenantSnap.exists()) {
      throw new Error("Tenant not found");
    }
    
    const tenantData = tenantSnap.data();
    const roomId = tenantData.roomId;

    // Update tenant record
    await updateDoc(tenantRef, {
      roomNumber: null,
      status: "checked-out",
      leaseEnd: new Date().toISOString(),
      checkedOutAt: new Date().toISOString(),
      balance: 0, // Clear balance on checkout
      propertyId: null,
      roomId: null,
    });

    // Update room record if roomId exists
    if (roomId) {
      const { updateRoom } = await import("./roomHelpers");
      await updateRoom(roomId, {
        status: "vacant",
        tenant: null,
        tenantId: null,
        occupiedDate: null,
        vacatedDate: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error checking out tenant:", error);
    throw error;
  }
};

/**
 * Find and checkout previous tenant assigned to a room
 * @param {string} roomNumber - The room number to check
 * @param {string} propertyId - The property ID
 * @returns {Promise<void>}
 */
export const checkoutPreviousTenantFromRoom = async (roomNumber, propertyId) => {
  try {
    // Find tenant currently assigned to this room - try both string and number formats
    const queries = [
      query(
        collection(db, "users"), 
        where("roomNumber", "==", roomNumber),
        where("propertyId", "==", propertyId),
        where("status", "==", "active")
      ),
      query(
        collection(db, "users"), 
        where("roomNumber", "==", roomNumber.toString()),
        where("propertyId", "==", propertyId),
        where("status", "==", "active")
      ),
      query(
        collection(db, "users"), 
        where("roomNumber", "==", parseInt(roomNumber)),
        where("propertyId", "==", propertyId),
        where("status", "==", "active")
      )
    ];
    
    const checkoutPromises = [];
    
    // Try all query variations to handle different room number formats
    for (const q of queries) {
      try {
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          // Avoid duplicates by checking if we already have this tenant ID
          if (!checkoutPromises.find(promise => promise.tenantId === doc.id)) {
            checkoutPromises.push({ 
              promise: checkOutTenant(doc.id),
              tenantId: doc.id 
            });
          }
        });
      } catch (queryError) {
        console.log("Query variation failed, continuing...", queryError);
      }
    }
    
    // Execute all checkout operations
    await Promise.all(checkoutPromises.map(item => item.promise));
    
    console.log(`Checked out ${checkoutPromises.length} tenants from room ${roomNumber}`);
  } catch (error) {
    console.error("Error checking out previous tenant from room:", error);
    throw error;
  }
};

/**
 * Force checkout a tenant from a specific room (for fixing data inconsistencies)
 * @param {string} tenantName - Name of the tenant to checkout
 * @param {string} roomNumber - Room number to clear
 * @param {string} propertyId - Property ID
 * @returns {Promise<void>}
 */
export const forceCheckoutTenantFromRoom = async (tenantName, roomNumber, propertyId) => {
  try {
    // Find tenant by name and room
    const q = query(
      collection(db, "users"),
      where("roomNumber", "in", [roomNumber, roomNumber.toString(), parseInt(roomNumber)])
    );
    
    const querySnapshot = await getDocs(q);
    let tenantFound = false;
    
    for (const docSnap of querySnapshot.docs) {
      const tenantData = docSnap.data();
      const fullName = `${tenantData.firstName} ${tenantData.lastName}`;
      
      if (fullName === tenantName || tenantData.name === tenantName) {
        await checkOutTenant(docSnap.id);
        tenantFound = true;
        console.log(`Force checked out ${tenantName} from room ${roomNumber}`);
      }
    }
    
    if (!tenantFound) {
      console.log(`Tenant ${tenantName} not found in room ${roomNumber}`);
    }
    
    // Also directly update the room to vacant status
    const roomQuery = query(
      collection(db, "rooms"),
      where("number", "in", [roomNumber, roomNumber.toString(), parseInt(roomNumber)]),
      where("propertyId", "==", propertyId)
    );
    
    const roomSnapshot = await getDocs(roomQuery);
    const { updateRoom } = await import("./roomHelpers");
    
    for (const roomDoc of roomSnapshot.docs) {
      await updateRoom(roomDoc.id, {
        status: "vacant",
        tenant: null,
        tenantId: null,
        occupiedDate: null,
        vacatedDate: new Date().toISOString(),
      });
      console.log(`Updated room ${roomNumber} to vacant status`);
    }
    
  } catch (error) {
    console.error("Error in force checkout:", error);
    throw error;
  }
};

/**
 * Search tenants by name, email, phone, or room number
 * @param {Array} tenants - Array of tenants to search
 * @param {string} searchQuery - Search query string
 * @returns {Array} - Filtered tenants
 */
export const searchTenants = (tenants, searchQuery) => {
  if (!searchQuery.trim()) return tenants;

  const query = searchQuery.toLowerCase().trim();

  return tenants.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(query) ||
      tenant.email.toLowerCase().includes(query) ||
      tenant.phone.includes(query) ||
      (tenant.roomNumber && tenant.roomNumber.toString().includes(query))
  );
};

/**
 * Filter tenants by status
 * @param {Array} tenants - Array of tenants to filter
 * @param {string} statusFilter - Status to filter by
 * @returns {Array} - Filtered tenants
 */
export const filterTenantsByStatus = (tenants, statusFilter) => {
  if (statusFilter === "All") return tenants;

  const statusMap = {
    Active: ["active"],
    Overdue: ["overdue"],
    "Moving Out": ["moving-out"],
    Registered: ["registered"],
    "Checked Out": ["checked-out"],
  };

  const allowedStatuses = statusMap[statusFilter] || [
    statusFilter.toLowerCase(),
  ];

  return tenants.filter((tenant) =>
    allowedStatuses.includes(tenant.status.toLowerCase())
  );
};

/**
 * Get tenant statistics
 * @param {Array} tenants - Array of tenants
 * @returns {Object} - Statistics object
 */
export const getTenantStatistics = (tenants) => {
  const stats = {
    total: tenants.length,
    active: tenants.filter((t) => t.status === "active").length,
    overdue: tenants.filter((t) => t.status === "overdue").length,
    movingOut: tenants.filter((t) => t.status === "moving-out").length,
    registered: tenants.filter((t) => t.status === "registered").length,
    checkedOut: tenants.filter((t) => t.status === "checked-out").length,
    totalBalance: tenants.reduce(
      (sum, tenant) => sum + (tenant.balance || 0),
      0
    ),
    overdueBalance: tenants
      .filter((t) => t.status === "overdue")
      .reduce((sum, tenant) => sum + (tenant.balance || 0), 0),
  };

  return stats;
};
