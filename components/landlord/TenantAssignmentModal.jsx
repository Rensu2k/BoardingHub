import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { db } from "@/constants/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { updateRoom } from "@/utils/roomHelpers";
import {
  assignTenantToRoom as assignTenantInUserRecord,
  checkoutPreviousTenantFromRoom,
  getAllRegisteredTenants,
  searchTenants,
} from "@/utils/tenantHelpers";

export default function TenantAssignmentModal({
  visible,
  onClose,
  room,
  onAssignmentComplete,
}) {
  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Load registered tenants
  const loadTenants = useCallback(async () => {
    try {
      setIsLoading(true);
      const registeredTenants = await getAllRegisteredTenants();
      
      // Filter out tenants who are already assigned to rooms
      const availableTenants = registeredTenants.filter(
        tenant => tenant.status === "registered" || tenant.status === "checked-out"
      );
      
      setTenants(availableTenants);
      setFilteredTenants(availableTenants);
    } catch (error) {
      console.error("Error loading tenants:", error);
      Alert.alert("Error", "Failed to load registered tenants. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadTenants();
      setSearchQuery("");
    }
  }, [visible, loadTenants]);

  // Handle search
  useEffect(() => {
    const filtered = searchTenants(tenants, searchQuery);
    setFilteredTenants(filtered);
  }, [searchQuery, tenants]);

  const handleAssignTenant = async (tenant) => {
    try {
      setIsAssigning(true);

      // Show confirmation dialog
      Alert.alert(
        "Assign Tenant",
        `Assign ${tenant.name} to Room ${room.number}?\n\nThis will:\n• Mark the room as occupied\n• Update tenant status to active\n• Set lease start date to today`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Assign",
            style: "default",
            onPress: async () => {
              try {
                const leaseStartDate = new Date().toISOString();
                const leaseEndDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year lease

                // Check out any previous tenant assigned to this room
                await checkoutPreviousTenantFromRoom(room.number, room.propertyId);

                // Update room with new tenant information
                await updateRoom(room.id, {
                  status: "occupied",
                  tenant: {
                    id: tenant.id,
                    name: tenant.name,
                    email: tenant.email,
                    phone: tenant.phone,
                  },
                  tenantId: tenant.id,
                  occupiedDate: leaseStartDate,
                  leaseStart: leaseStartDate,
                  leaseEnd: leaseEndDate,
                });

                // Update new tenant record
                await assignTenantInUserRecord(tenant.id, room.number, {
                  leaseStart: leaseStartDate,
                  leaseEnd: leaseEndDate,
                  propertyId: room.propertyId,
                  roomId: room.id,
                });

                Alert.alert(
                  "Success",
                  `${tenant.name} has been assigned to Room ${room.number}`,
                  [{ text: "OK", onPress: () => {
                    onAssignmentComplete?.();
                    onClose();
                  }}]
                );
              } catch (error) {
                console.error("Error assigning tenant:", error);
                Alert.alert("Error", "Failed to assign tenant. Please try again.");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error in assignment process:", error);
      Alert.alert("Error", "An error occurred. Please try again.");
    } finally {
      setIsAssigning(false);
    }
  };

  const renderTenantItem = ({ item: tenant }) => (
    <TouchableOpacity
      style={[styles.tenantCard, { backgroundColor: colors.card }]}
      onPress={() => handleAssignTenant(tenant)}
      disabled={isAssigning}
    >
      <View style={styles.tenantInfo}>
        <View style={styles.avatarContainer}>
          {tenant.avatar ? (
            <Image source={{ uri: tenant.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.tint }]}>
              <ThemedText style={styles.avatarText}>
                {tenant.name.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.tenantDetails}>
          <ThemedText style={styles.tenantName}>{tenant.name}</ThemedText>
          <ThemedText style={styles.tenantEmail}>{tenant.email}</ThemedText>
          <ThemedText style={styles.tenantPhone}>{tenant.phone}</ThemedText>
          {tenant.preferredRoomType && (
            <ThemedText style={styles.preferredType}>
              Prefers: {tenant.preferredRoomType}
            </ThemedText>
          )}
        </View>

        <View style={styles.statusContainer}>
          <View style={[
            styles.statusChip,
            { backgroundColor: tenant.status === "registered" ? "#34C75920" : "#FF950020" }
          ]}>
            <ThemedText style={[
              styles.statusText,
              { color: tenant.status === "registered" ? "#34C759" : "#FF9500" }
            ]}>
              {tenant.status === "registered" ? "Available" : "Previous Tenant"}
            </ThemedText>
          </View>
          
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={colors.text} 
            style={{ opacity: 0.5 }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <ThemedText style={styles.headerTitle}>Assign Tenant</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Room {room?.number} • ₱{room?.rent}/month
            </ThemedText>
          </View>
          
          <View style={styles.headerSpacer} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
            <Ionicons name="search" size={20} color={colors.text} style={{ opacity: 0.5 }} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search tenants by name, email, or phone..."
              placeholderTextColor={colors.text + "80"}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color={colors.text} style={{ opacity: 0.5 }} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tenants List */}
        <View style={styles.listContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ThemedText style={styles.loadingText}>Loading registered tenants...</ThemedText>
            </View>
          ) : filteredTenants.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={colors.text} style={{ opacity: 0.3 }} />
              <ThemedText style={styles.emptyTitle}>
                {searchQuery ? "No tenants found" : "No available tenants"}
              </ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                {searchQuery 
                  ? "Try adjusting your search terms"
                  : "All registered tenants are currently assigned to rooms"
                }
              </ThemedText>
            </View>
          ) : (
            <>
              <View style={styles.listHeader}>
                <ThemedText style={styles.listTitle}>
                  Available Tenants ({filteredTenants.length})
                </ThemedText>
                <ThemedText style={styles.listSubtitle}>
                  Tap a tenant to assign them to this room
                </ThemedText>
              </View>
              
              <FlatList
                data={filteredTenants}
                renderItem={renderTenantItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  closeButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  listSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tenantCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tenantInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  tenantDetails: {
    flex: 1,
  },
  tenantName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  tenantEmail: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  tenantPhone: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  preferredType: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: "italic",
  },
  statusContainer: {
    alignItems: "flex-end",
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
