import { auth, db } from "@/constants/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

/**
 * Generate bills for tenants
 * @param {Array} tenants - Array of tenant objects
 * @param {Object} billingPeriod - Billing period details
 * @returns {Promise<Array>} - Array of generated bill IDs
 */
export const generateBills = async (tenants, billingPeriod) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const bills = [];
    const currentDate = new Date();
    const invoicePrefix = "INV-" + currentDate.getFullYear() + "-";

    for (const tenant of tenants) {
      // Skip if tenant doesn't have room assignment
      if (!tenant.roomId || !tenant.propertyId) continue;

      // Get room details for rent calculation
      const { getRoomById } = await import("./roomHelpers");
      const room = await getRoomById(tenant.roomId);

      if (!room) continue;

      // Get property details for property name
      let propertyName = "Unknown Property";
      if (tenant.propertyId) {
        try {
          const { getPropertyById } = await import("./propertyHelpers");
          const property = await getPropertyById(tenant.propertyId);
          propertyName = property?.name || "Unknown Property";
        } catch (propertyError) {
          console.warn(
            "Could not fetch property name for bill generation:",
            propertyError
          );
        }
      }

      // Calculate bill amount (rent + utilities)
      let totalAmount = parseFloat(room.rent) || 0;

      // Add utility charges if not free
      if (room.utilities) {
        Object.entries(room.utilities).forEach(([utilityType, utility]) => {
          if (utility.type === "fixed") {
            totalAmount += parseFloat(utility.amount) || 0;
          } else if (utility.type === "per-unit" && utility.rate) {
            // For per-unit, we'll use a default consumption for now
            // In a real app, you'd get actual meter readings
            const defaultConsumption = utilityType === "electricity" ? 100 : 50;
            totalAmount += (parseFloat(utility.rate) || 0) * defaultConsumption;
          }
          // Free utilities don't add to the cost
        });
      }

      // Generate unique invoice ID
      const invoiceNumber = String(bills.length + 1).padStart(3, "0");
      const invoiceId = invoicePrefix + invoiceNumber;

      // Calculate due date (typically 15 days from generation)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15);

      const billData = {
        tenantId: tenant.id,
        tenantName: tenant.name,
        tenantEmail: tenant.email,
        propertyId: tenant.propertyId,
        roomId: tenant.roomId,
        roomNumber: tenant.roomNumber,
        invoiceId,
        amount: totalAmount,
        baseRent: parseFloat(room.rent) || 0,
        utilityCharges: totalAmount - (parseFloat(room.rent) || 0),
        billingPeriod: {
          from: billingPeriod.from,
          to: billingPeriod.to,
          month: billingPeriod.month,
          year: billingPeriod.year,
        },
        dueDate: dueDate.toISOString().split("T")[0], // YYYY-MM-DD format
        status: "pending",
        landlordId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        // Additional details
        property: propertyName,
        room: tenant.roomNumber,
        paymentProofs: [],
        notes: "",
      };

      const docRef = await addDoc(collection(db, "bills"), billData);
      bills.push(docRef.id);
    }

    return bills;
  } catch (error) {
    console.error("Error generating bills:", error);
    throw error;
  }
};

/**
 * Get all bills for the current landlord
 * @returns {Promise<Array>} - Array of bills
 */
export const getLandlordBills = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const q = query(
      collection(db, "bills"),
      where("landlordId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const bills = [];

    querySnapshot.forEach((doc) => {
      bills.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return bills;
  } catch (error) {
    console.error("Error fetching landlord bills:", error);
    throw error;
  }
};

/**
 * Delete bills with placeholder tenant IDs
 * @returns {Promise<number>} - Number of bills deleted
 */
export const deleteInvalidBills = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const q = query(
      collection(db, "bills"),
      where("landlordId", "==", user.uid)
    );

    const querySnapshot = await getDocs(q);
    const billsToDelete = [];

    querySnapshot.forEach((doc) => {
      const billData = doc.data();
      // Check if tenant ID is a placeholder (t1, t2, etc.)
      if (billData.tenantId && billData.tenantId.match(/^t\d+$/)) {
        billsToDelete.push(doc.ref);
      }
    });

    // Delete all invalid bills
    const deletePromises = billsToDelete.map((billRef) => deleteDoc(billRef));
    await Promise.all(deletePromises);

    return billsToDelete.length;
  } catch (error) {
    console.error("Error deleting invalid bills:", error);
    throw error;
  }
};

/**
 * Get bills for a specific tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Array>} - Array of bills for the tenant
 */
export const getTenantBills = async (tenantId) => {
  try {
    const q = query(collection(db, "bills"), where("tenantId", "==", tenantId));

    const querySnapshot = await getDocs(q);
    const bills = [];

    querySnapshot.forEach((doc) => {
      bills.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Sort bills by creation date in JavaScript (newest first)
    bills.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0);
      const bTime = b.createdAt?.toDate?.() || new Date(0);
      return bTime - aTime;
    });

    return bills;
  } catch (error) {
    console.error("Error fetching tenant bills:", error);
    throw error;
  }
};

/**
 * Get bill by ID
 * @param {string} billId - Bill ID
 * @returns {Promise<Object>} - Bill details
 */
export const getBillById = async (billId) => {
  try {
    const billRef = doc(db, "bills", billId);
    const billSnap = await getDoc(billRef);

    if (!billSnap.exists()) {
      throw new Error("Bill not found");
    }

    return {
      id: billSnap.id,
      ...billSnap.data(),
    };
  } catch (error) {
    console.error("Error fetching bill details:", error);
    throw error;
  }
};

/**
 * Update bill status
 * @param {string} billId - Bill ID
 * @param {string} status - New status (pending, paid, overdue)
 * @returns {Promise<void>}
 */
export const updateBillStatus = async (billId, status) => {
  try {
    const billRef = doc(db, "bills", billId);

    const updateData = {
      status,
      updatedAt: Timestamp.now(),
    };

    // If marking as paid, add payment date and create payment history
    if (status === "paid") {
      const paidAt = new Date().toISOString();
      updateData.paidAt = paidAt;
      updateData.paymentMethod = "Manual Payment";

      // Get bill details for payment history
      const billDoc = await getDoc(billRef);
      if (billDoc.exists()) {
        const bill = billDoc.data();
        
        // Update bill first
        await updateDoc(billRef, updateData);

        // Add to payment history
        try {
          await addPaymentToHistory({
            tenantId: bill.tenantId,
            billId: billId,
            invoiceId: bill.invoiceId,
            amount: bill.amount,
            paymentDate: paidAt,
            dueDate: bill.dueDate,
            month: bill.billingPeriod ? `${bill.billingPeriod.month} ${bill.billingPeriod.year}` : 
                   new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            year: bill.billingPeriod?.year?.toString() || new Date().getFullYear().toString(),
            property: bill.property,
            room: `Room ${bill.roomNumber}`,
            roomNumber: bill.roomNumber,
            tenantName: bill.tenantName,
            paymentMethod: "Manual Payment",
            baseRent: bill.baseRent,
            utilityCharges: bill.utilityCharges || 0,
          });
        } catch (historyError) {
          console.error("Error adding manual payment to history:", historyError);
          // Don't fail the whole operation if history fails
        }
      } else {
        // If we can't get bill details, just update the status
        await updateDoc(billRef, updateData);
      }
    } else {
      // For non-paid status updates, just update normally
      await updateDoc(billRef, updateData);
    }
  } catch (error) {
    console.error("Error updating bill status:", error);
    throw error;
  }
};

/**
 * Add payment proof to a bill
 * @param {string} billId - Bill ID
 * @param {Object} proofData - Payment proof data
 * @returns {Promise<void>}
 */
export const addPaymentProof = async (billId, proofData) => {
  try {
    const billRef = doc(db, "bills", billId);
    const billSnap = await getDoc(billRef);

    if (!billSnap.exists()) {
      throw new Error("Bill not found");
    }

    const currentBill = billSnap.data();
    const currentProofs = currentBill.paymentProofs || [];

    const newProof = {
      id: Date.now().toString(),
      ...proofData,
      uploadedAt: new Date().toISOString(),
      status: "pending", // pending, approved, rejected
    };

    await updateDoc(billRef, {
      paymentProofs: [...currentProofs, newProof],
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error adding payment proof:", error);
    throw error;
  }
};

/**
 * Get bills with pending payment proofs
 * @returns {Promise<Array>} - Array of bills with pending proofs
 */
export const getBillsWithPendingProofs = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const q = query(
      collection(db, "bills"),
      where("landlordId", "==", user.uid)
    );

    const querySnapshot = await getDocs(q);
    const billsWithPendingProofs = [];

    querySnapshot.forEach((doc) => {
      const bill = { id: doc.id, ...doc.data() };
      const pendingProofs = (bill.paymentProofs || []).filter(
        (proof) => proof.status === "pending"
      );

      if (pendingProofs.length > 0) {
        billsWithPendingProofs.push({
          ...bill,
          pendingProofs,
        });
      }
    });

    return billsWithPendingProofs;
  } catch (error) {
    console.error("Error fetching bills with pending proofs:", error);
    throw error;
  }
};

/**
 * Update payment proof status
 * @param {string} billId - Bill ID
 * @param {string} proofId - Proof ID
 * @param {string} status - New status (approved, rejected)
 * @param {string} notes - Optional notes
 * @returns {Promise<void>}
 */
export const updatePaymentProofStatus = async (
  billId,
  proofId,
  status,
  notes = ""
) => {
  try {
    const billRef = doc(db, "bills", billId);
    const billSnap = await getDoc(billRef);

    if (!billSnap.exists()) {
      throw new Error("Bill not found");
    }

    const currentBill = billSnap.data();
    const updatedProofs = (currentBill.paymentProofs || []).map((proof) => {
      if (proof.id === proofId) {
        return {
          ...proof,
          status,
          reviewedAt: new Date().toISOString(),
          reviewNotes: notes,
        };
      }
      return proof;
    });

    const updateData = {
      paymentProofs: updatedProofs,
      updatedAt: Timestamp.now(),
    };

    // If proof is approved, mark bill as paid
    if (status === "approved") {
      updateData.status = "paid";
      updateData.paidAt = new Date().toISOString();
    }

    await updateDoc(billRef, updateData);
  } catch (error) {
    console.error("Error updating payment proof status:", error);
    throw error;
  }
};

/**
 * Delete a bill
 * @param {string} billId - Bill ID
 * @returns {Promise<void>}
 */
export const deleteBill = async (billId) => {
  try {
    await deleteDoc(doc(db, "bills", billId));
  } catch (error) {
    console.error("Error deleting bill:", error);
    throw error;
  }
};

/**
 * Get billing statistics for landlord
 * @returns {Promise<Object>} - Billing statistics
 */
export const getBillingStatistics = async () => {
  try {
    const bills = await getLandlordBills();

    const stats = {
      totalBills: bills.length,
      pendingBills: bills.filter((bill) => bill.status === "pending").length,
      paidBills: bills.filter((bill) => bill.status === "paid").length,
      overdueBills: bills.filter((bill) => {
        if (bill.status !== "pending") return false;
        const dueDate = new Date(bill.dueDate);
        const today = new Date();
        return dueDate < today;
      }).length,
      totalRevenue: bills
        .filter((bill) => bill.status === "paid")
        .reduce((sum, bill) => sum + (bill.amount || 0), 0),
      pendingRevenue: bills
        .filter((bill) => bill.status === "pending")
        .reduce((sum, bill) => sum + (bill.amount || 0), 0),
      overdueRevenue: bills
        .filter((bill) => {
          if (bill.status !== "pending") return false;
          const dueDate = new Date(bill.dueDate);
          const today = new Date();
          return dueDate < today;
        })
        .reduce((sum, bill) => sum + (bill.amount || 0), 0),
    };

    return stats;
  } catch (error) {
    console.error("Error getting billing statistics:", error);
    throw error;
  }
};

/**
 * Fix property names in existing bills
 * This function updates bills that have "Unknown Property" with the correct property names
 * @returns {Promise<number>} - Number of bills updated
 */
export const fixBillPropertyNames = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get all bills for the current landlord
    const billsQuery = query(
      collection(db, "bills"),
      where("landlordId", "==", user.uid)
    );
    const billsSnapshot = await getDocs(billsQuery);

    // Get all properties for the current landlord
    const { getUserProperties } = await import("./propertyHelpers");
    const properties = await getUserProperties();

    let updatedCount = 0;
    const updatePromises = [];

    billsSnapshot.forEach((billDoc) => {
      const bill = billDoc.data();
      
      // Only update bills with "Unknown Property" or missing property names
      if (!bill.property || bill.property === "Unknown Property") {
        let propertyName = "Unknown Property";
        
        // Try to find the property by ID
        if (bill.propertyId) {
          const matchingProperty = properties.find(p => p.id === bill.propertyId);
          if (matchingProperty) {
            propertyName = matchingProperty.name;
          }
        }
        
        // If we still don't have a match and there's only one property, use it
        if (propertyName === "Unknown Property" && properties.length === 1) {
          propertyName = properties[0].name;
        }

        // Only update if we found a valid property name
        if (propertyName !== "Unknown Property") {
          updatePromises.push(
            updateDoc(billDoc.ref, {
              property: propertyName,
              updatedAt: Timestamp.now(),
            })
          );
          updatedCount++;
        }
      }
    });

    await Promise.all(updatePromises);
    return updatedCount;
  } catch (error) {
    console.error("Error fixing bill property names:", error);
    throw error;
  }
};

/**
 * Mark overdue bills
 * This function should be called periodically to update bill statuses
 * @returns {Promise<number>} - Number of bills marked as overdue
 */
export const markOverdueBills = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const q = query(
      collection(db, "bills"),
      where("landlordId", "==", user.uid),
      where("status", "==", "pending")
    );

    const querySnapshot = await getDocs(q);
    const today = new Date();
    let overdueCount = 0;

    const updatePromises = [];

    querySnapshot.forEach((doc) => {
      const bill = doc.data();
      const dueDate = new Date(bill.dueDate);

      if (dueDate < today) {
        updatePromises.push(
          updateDoc(doc.ref, {
            status: "overdue",
            overdueAt: new Date().toISOString(),
            updatedAt: Timestamp.now(),
          })
        );
        overdueCount++;
      }
    });

    await Promise.all(updatePromises);
    return overdueCount;
  } catch (error) {
    console.error("Error marking overdue bills:", error);
    throw error;
  }
};

/**
 * Submit payment proof for a bill
 * @param {string} billId - The bill ID
 * @param {Object} proofData - Payment proof data
 * @returns {Promise<string>} - Payment proof ID
 */
export const submitPaymentProof = async (billId, proofData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get the bill to verify it exists and get landlord info
    const billDoc = await getDoc(doc(db, "bills", billId));
    if (!billDoc.exists()) {
      throw new Error("Bill not found");
    }

    const bill = billDoc.data();

    // Create payment proof document
    const paymentProof = {
      billId: billId,
      invoiceId: bill.invoiceId,
      tenantId: user.uid,
      tenantName: bill.tenantName || "Unknown Tenant",
      landlordId: bill.landlordId,
      property: bill.property || "Unknown Property",
      roomNumber: bill.roomNumber || "N/A",
      amount: bill.amount,
      imageUri: proofData.imageUri,
      note: proofData.note || "",
      status: "pending_review",
      submittedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Add to payment proofs collection
    const proofRef = await addDoc(collection(db, "paymentProofs"), paymentProof);

    // Update bill status to indicate proof submitted
    await updateDoc(doc(db, "bills", billId), {
      status: "proof_submitted",
      proofSubmittedAt: Timestamp.now(),
      paymentProofId: proofRef.id,
      updatedAt: Timestamp.now(),
    });

    return proofRef.id;
  } catch (error) {
    console.error("Error submitting payment proof:", error);
    throw error;
  }
};

/**
 * Get payment proofs for a landlord (pending review)
 * @returns {Promise<Array>} - Array of payment proofs
 */
export const getLandlordPaymentProofs = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Use simple query without orderBy to avoid index requirement
    const q = query(
      collection(db, "paymentProofs"),
      where("landlordId", "==", user.uid)
    );

    const querySnapshot = await getDocs(q);
    const proofs = [];

    querySnapshot.forEach((doc) => {
      proofs.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Sort in JavaScript instead of Firestore to avoid index requirement
    proofs.sort((a, b) => {
      const dateA = a.submittedAt?.toDate?.() || new Date(a.submittedAt);
      const dateB = b.submittedAt?.toDate?.() || new Date(b.submittedAt);
      return dateB - dateA; // Descending order (newest first)
    });

    return proofs;
  } catch (error) {
    console.error("Error getting payment proofs:", error);
    throw error;
  }
};

/**
 * Get payment proofs for a tenant
 * @returns {Promise<Array>} - Array of payment proofs
 */
export const getTenantPaymentProofs = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Use simple query without orderBy to avoid index requirement
    const q = query(
      collection(db, "paymentProofs"),
      where("tenantId", "==", user.uid)
    );

    const querySnapshot = await getDocs(q);
    const proofs = [];

    querySnapshot.forEach((doc) => {
      proofs.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Sort in JavaScript instead of Firestore to avoid index requirement
    proofs.sort((a, b) => {
      const dateA = a.submittedAt?.toDate?.() || new Date(a.submittedAt);
      const dateB = b.submittedAt?.toDate?.() || new Date(b.submittedAt);
      return dateB - dateA; // Descending order (newest first)
    });

    return proofs;
  } catch (error) {
    console.error("Error getting tenant payment proofs:", error);
    throw error;
  }
};

/**
 * Get payment history for a tenant
 * @param {string} tenantId - Optional tenant ID (defaults to current user)
 * @returns {Promise<Array>} - Array of payment history records
 */
export const getTenantPaymentHistory = async (tenantId = null) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const targetTenantId = tenantId || user.uid;

    const q = query(
      collection(db, "paymentHistory"),
      where("tenantId", "==", targetTenantId)
    );

    const querySnapshot = await getDocs(q);
    const payments = [];

    querySnapshot.forEach((doc) => {
      payments.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Sort by payment date (newest first)
    payments.sort((a, b) => {
      const dateA = new Date(a.paymentDate);
      const dateB = new Date(b.paymentDate);
      return dateB - dateA;
    });

    return payments;
  } catch (error) {
    console.error("Error getting tenant payment history:", error);
    throw error;
  }
};

/**
 * Fix payment proofs with missing tenant information
 * @returns {Promise<number>} - Number of proofs updated
 */
export const fixPaymentProofTenantInfo = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get all payment proofs for this landlord that might be missing tenant info
    const proofsQuery = query(
      collection(db, "paymentProofs"),
      where("landlordId", "==", user.uid)
    );

    const proofsSnapshot = await getDocs(proofsQuery);
    const proofs = [];
    
    proofsSnapshot.forEach((doc) => {
      const data = doc.data();
      // Check if tenant name is missing or is "Unknown Tenant"
      if (!data.tenantName || data.tenantName === "Unknown Tenant") {
        proofs.push({ id: doc.id, ...data });
      }
    });

    if (proofs.length === 0) {
      return 0;
    }

    // For each proof, get the bill and update the proof with correct tenant info
    const updatePromises = proofs.map(async (proof) => {
      try {
        const billDoc = await getDoc(doc(db, "bills", proof.billId));
        if (billDoc.exists()) {
          const bill = billDoc.data();
          
          const updateData = {
            tenantName: bill.tenantName || "Unknown Tenant",
            property: bill.property || "Unknown Property",
            roomNumber: bill.roomNumber || "N/A",
            updatedAt: Timestamp.now(),
          };

          await updateDoc(doc(db, "paymentProofs", proof.id), updateData);
          return true;
        }
        return false;
      } catch (error) {
        console.error(`Error updating proof ${proof.id}:`, error);
        return false;
      }
    });

    const results = await Promise.all(updatePromises);
    const updatedCount = results.filter(Boolean).length;
    
    console.log(`Updated ${updatedCount} payment proofs with tenant information`);
    return updatedCount;
  } catch (error) {
    console.error("Error fixing payment proof tenant info:", error);
    throw error;
  }
};

/**
 * Add payment to tenant's payment history
 * @param {Object} paymentData - Payment data
 * @returns {Promise<string>} - Payment history ID
 */
export const addPaymentToHistory = async (paymentData) => {
  try {
    const paymentHistory = {
      tenantId: paymentData.tenantId,
      billId: paymentData.billId,
      invoiceId: paymentData.invoiceId,
      receiptId: `RCP-${Date.now()}`,
      amount: paymentData.amount,
      paymentDate: paymentData.paymentDate || new Date().toISOString(),
      dueDate: paymentData.dueDate,
      month: paymentData.month || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      year: paymentData.year || new Date().getFullYear().toString(),
      property: paymentData.property,
      room: paymentData.room,
      roomNumber: paymentData.roomNumber,
      tenantName: paymentData.tenantName,
      status: "approved",
      paymentMethod: paymentData.paymentMethod || "Payment Proof",
      breakdown: paymentData.breakdown || [
        {
          description: "Monthly Rent",
          amount: paymentData.baseRent || paymentData.amount,
          category: "rent"
        },
        ...(paymentData.utilityCharges > 0 ? [{
          description: "Utility Charges", 
          amount: paymentData.utilityCharges,
          category: "utilities"
        }] : [])
      ],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const historyRef = await addDoc(collection(db, "paymentHistory"), paymentHistory);
    return historyRef.id;
  } catch (error) {
    console.error("Error adding payment to history:", error);
    throw error;
  }
};

/**
 * Review a payment proof (approve or reject)
 * @param {string} proofId - Payment proof ID
 * @param {string} action - "approve" or "reject"
 * @param {string} note - Optional note from landlord
 * @returns {Promise<void>}
 */
export const reviewPaymentProof = async (proofId, action, note = "") => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get the payment proof
    const proofDoc = await getDoc(doc(db, "paymentProofs", proofId));
    if (!proofDoc.exists()) {
      throw new Error("Payment proof not found");
    }

    const proof = proofDoc.data();

    // Verify landlord owns this proof
    if (proof.landlordId !== user.uid) {
      throw new Error("Unauthorized to review this payment proof");
    }

    const newStatus = action === "approve" ? "approved" : "rejected";
    const reviewedAt = Timestamp.now();

    // Update payment proof
    await updateDoc(doc(db, "paymentProofs", proofId), {
      status: newStatus,
      reviewedAt: reviewedAt,
      reviewNote: note,
      reviewedBy: user.uid,
      updatedAt: reviewedAt,
    });

    // Update the associated bill
    if (action === "approve") {
      // Get the bill details for payment history
      const billDoc = await getDoc(doc(db, "bills", proof.billId));
      if (billDoc.exists()) {
        const bill = billDoc.data();
        
        // Update bill status
        await updateDoc(doc(db, "bills", proof.billId), {
          status: "paid",
          paidAt: reviewedAt.toDate().toISOString(),
          paymentMethod: "Payment Proof",
          updatedAt: reviewedAt,
        });

        // Add to payment history
        try {
          await addPaymentToHistory({
            tenantId: proof.tenantId,
            billId: proof.billId,
            invoiceId: proof.invoiceId || bill.invoiceId,
            amount: proof.amount || bill.amount,
            paymentDate: reviewedAt.toDate().toISOString(),
            dueDate: bill.dueDate,
            month: bill.billingPeriod ? `${bill.billingPeriod.month} ${bill.billingPeriod.year}` : 
                   new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            year: bill.billingPeriod?.year?.toString() || new Date().getFullYear().toString(),
            property: proof.property || bill.property,
            room: `Room ${proof.roomNumber || bill.roomNumber}`,
            roomNumber: proof.roomNumber || bill.roomNumber,
            tenantName: proof.tenantName || bill.tenantName,
            paymentMethod: "Payment Proof",
            baseRent: bill.baseRent,
            utilityCharges: bill.utilityCharges || 0,
          });
        } catch (historyError) {
          console.error("Error adding payment to history:", historyError);
          // Don't fail the whole operation if history fails
        }
      }
    } else {
      // If rejected, set bill back to pending/overdue
      const billDoc = await getDoc(doc(db, "bills", proof.billId));
      if (billDoc.exists()) {
        const bill = billDoc.data();
        const dueDate = new Date(bill.dueDate);
        const today = new Date();
        const newBillStatus = dueDate < today ? "overdue" : "pending";

        await updateDoc(doc(db, "bills", proof.billId), {
          status: newBillStatus,
          paymentProofId: null,
          updatedAt: reviewedAt,
        });
      }
    }
  } catch (error) {
    console.error("Error reviewing payment proof:", error);
    throw error;
  }
};
