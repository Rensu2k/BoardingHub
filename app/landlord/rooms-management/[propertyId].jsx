import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import StatusChip from "@/components/landlord/StatusChip";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

const { width, height } = Dimensions.get("window");

export default function RoomsManagementScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomModal, setShowRoomModal] = useState(false);

  const router = useRouter();
  const { propertyId } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Mock data - replace with Firebase data later
  const property = {
    id: propertyId,
    name: "Sunset Apartments",
    address: "123 Main St, Cebu City",
  };

  const [rooms, setRooms] = useState([
    {
      id: "1",
      number: "101",
      type: "Studio",
      rent: 2800,
      status: "occupied",
      tenant: {
        id: "t1",
        name: "John Doe",
        phone: "+63912345678",
      },
      utilities: {
        electricity: { type: "per-tenant", rate: 12 },
        water: { type: "flat", amount: 200 },
        wifi: { type: "flat", amount: 500 },
      },
      meterIds: {
        electricity: "E101",
        water: "W101",
      },
      photos: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
      ],
      notes: "Recently renovated, AC included",
      dateCreated: "2024-01-15",
      lastUpdated: "2024-03-10",
    },
    {
      id: "2",
      number: "102",
      type: "1BR",
      rent: 3200,
      status: "vacant",
      tenant: null,
      utilities: {
        electricity: { type: "per-tenant", rate: 12 },
        water: { type: "flat", amount: 200 },
        wifi: { type: "flat", amount: 500 },
      },
      meterIds: {
        electricity: "E102",
        water: "W102",
      },
      photos: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
      ],
      notes: "Needs minor repairs on bathroom tiles",
      dateCreated: "2024-01-15",
      lastUpdated: "2024-03-08",
    },
    {
      id: "3",
      number: "103",
      type: "Studio",
      rent: 2800,
      status: "maintenance",
      tenant: null,
      utilities: {
        electricity: { type: "per-tenant", rate: 12 },
        water: { type: "flat", amount: 200 },
        wifi: { type: "flat", amount: 500 },
      },
      meterIds: {
        electricity: "E103",
        water: "W103",
      },
      photos: [],
      notes: "Plumbing repair in progress",
      dateCreated: "2024-01-15",
      lastUpdated: "2024-03-12",
    },
  ]);

  const statusFilters = [
    { key: "all", label: "All", count: rooms.length },
    {
      key: "occupied",
      label: "Occupied",
      count: rooms.filter((r) => r.status === "occupied").length,
    },
    {
      key: "vacant",
      label: "Vacant",
      count: rooms.filter((r) => r.status === "vacant").length,
    },
    {
      key: "maintenance",
      label: "Maintenance",
      count: rooms.filter((r) => r.status === "maintenance").length,
    },
  ];

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.tenant?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || room.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRoomPress = (room) => {
    setSelectedRoom(room);
    setShowRoomModal(true);
  };

  const handleEditRoom = (room) => {
    router.push(`/landlord/room-form/${propertyId}?roomId=${room.id}`);
    setShowRoomModal(false);
  };

  const handleCreateRoom = () => {
    router.push(`/landlord/room-form/${propertyId}`);
  };

  const handleDeleteRoom = (roomId) => {
    Alert.alert(
      "Delete Room",
      "Are you sure you want to delete this room? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setRooms(rooms.filter((r) => r.id !== roomId));
            setShowRoomModal(false);
          },
        },
      ]
    );
  };

  const RoomCard = ({ room }) => (
    <TouchableOpacity
      style={[styles.roomCard, { backgroundColor: colors.card }]}
      onPress={() => handleRoomPress(room)}
    >
      <View style={styles.roomCardHeader}>
        <View style={styles.roomBasicInfo}>
          <ThemedText style={styles.roomNumber}>Room {room.number}</ThemedText>
          <ThemedText style={styles.roomType}>{room.type}</ThemedText>
        </View>
        <StatusChip status={room.status} />
      </View>

      <View style={styles.roomCardContent}>
        {room.photos.length > 0 && (
          <Image
            source={{ uri: room.photos[0] }}
            style={styles.roomCardImage}
          />
        )}

        <View style={styles.roomCardDetails}>
          <ThemedText style={styles.roomRent}>
            ₱{room.rent.toLocaleString()}/month
          </ThemedText>

          {room.tenant && (
            <View style={styles.tenantInfo}>
              <Ionicons name="person" size={14} color={colors.text} />
              <ThemedText style={styles.tenantName}>
                {room.tenant.name}
              </ThemedText>
            </View>
          )}

          <View style={styles.roomMetrics}>
            <View style={styles.metric}>
              <Ionicons name="flash" size={14} color="#FF9500" />
              <ThemedText style={styles.metricText}>
                {room.meterIds.electricity}
              </ThemedText>
            </View>
            <View style={styles.metric}>
              <Ionicons name="water" size={14} color="#007AFF" />
              <ThemedText style={styles.metricText}>
                {room.meterIds.water}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const RoomDetailModal = () => (
    <Modal
      visible={showRoomModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView
        style={[styles.modalContainer, { backgroundColor: colors.background }]}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={() => setShowRoomModal(false)}
            style={styles.modalCloseButton}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>

          <ThemedText style={styles.modalTitle}>
            Room {selectedRoom?.number}
          </ThemedText>

          <TouchableOpacity
            onPress={() => handleEditRoom(selectedRoom)}
            style={styles.modalEditButton}
          >
            <Ionicons name="pencil" size={20} color={colors.tint} />
          </TouchableOpacity>
        </View>

        {selectedRoom && (
          <ScrollView style={styles.modalContent}>
            {/* Room Photos */}
            {selectedRoom.photos.length > 0 && (
              <View style={styles.photosSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {selectedRoom.photos.map((photo, index) => (
                    <Image
                      key={index}
                      source={{ uri: photo }}
                      style={styles.roomPhoto}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Basic Info */}
            <View style={styles.detailSection}>
              <ThemedText style={styles.sectionTitle}>
                Basic Information
              </ThemedText>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Type:</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {selectedRoom.type}
                </ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Status:</ThemedText>
                <StatusChip status={selectedRoom.status} />
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>
                  Monthly Rent:
                </ThemedText>
                <ThemedText style={styles.detailValue}>
                  ₱{selectedRoom.rent.toLocaleString()}
                </ThemedText>
              </View>
            </View>

            {/* Tenant Info */}
            {selectedRoom.tenant && (
              <View style={styles.detailSection}>
                <ThemedText style={styles.sectionTitle}>
                  Current Tenant
                </ThemedText>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Name:</ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {selectedRoom.tenant.name}
                  </ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Phone:</ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {selectedRoom.tenant.phone}
                  </ThemedText>
                </View>
              </View>
            )}

            {/* Utilities */}
            <View style={styles.detailSection}>
              <ThemedText style={styles.sectionTitle}>Utilities</ThemedText>
              {Object.entries(selectedRoom.utilities).map(
                ([utility, config]) => (
                  <View key={utility} style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>
                      {utility.charAt(0).toUpperCase() + utility.slice(1)}:
                    </ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {config.type === "flat"
                        ? `₱${config.amount} (flat rate)`
                        : `₱${config.rate}/kWh (per usage)`}
                    </ThemedText>
                  </View>
                )
              )}
            </View>

            {/* Meter IDs */}
            <View style={styles.detailSection}>
              <ThemedText style={styles.sectionTitle}>Meter IDs</ThemedText>
              {Object.entries(selectedRoom.meterIds).map(
                ([utility, meterId]) => (
                  <View key={utility} style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>
                      {utility.charAt(0).toUpperCase() + utility.slice(1)}:
                    </ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {meterId}
                    </ThemedText>
                  </View>
                )
              )}
            </View>

            {/* Notes */}
            {selectedRoom.notes && (
              <View style={styles.detailSection}>
                <ThemedText style={styles.sectionTitle}>Notes</ThemedText>
                <ThemedText style={styles.notesText}>
                  {selectedRoom.notes}
                </ThemedText>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.tint }]}
                onPress={() => handleEditRoom(selectedRoom)}
              >
                <Ionicons name="pencil" size={20} color="white" />
                <ThemedText style={styles.actionButtonText}>
                  Edit Room
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#FF3B30" }]}
                onPress={() => handleDeleteRoom(selectedRoom.id)}
              >
                <Ionicons name="trash" size={20} color="white" />
                <ThemedText style={styles.actionButtonText}>
                  Delete Room
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <ThemedText style={styles.headerTitle}>Rooms</ThemedText>
          <ThemedText style={styles.headerSubtitle}>{property.name}</ThemedText>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleCreateRoom}>
          <Ionicons name="add" size={24} color={colors.tint} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.text + "60"} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search rooms, types, or tenants..."
            placeholderTextColor={colors.text + "60"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.text + "60"}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    statusFilter === filter.key ? colors.tint : colors.card,
                },
              ]}
              onPress={() => setStatusFilter(filter.key)}
            >
              <ThemedText
                style={[
                  styles.filterChipText,
                  {
                    color: statusFilter === filter.key ? "white" : colors.text,
                  },
                ]}
              >
                {filter.label} ({filter.count})
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Rooms List */}
      <ScrollView
        style={styles.roomsList}
        contentContainerStyle={styles.roomsListContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredRooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}

        {filteredRooms.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="bed-outline" size={48} color={colors.text + "40"} />
            <ThemedText style={styles.emptyStateText}>
              {searchQuery
                ? "No rooms found matching your search"
                : "No rooms available"}
            </ThemedText>
          </View>
        )}
      </ScrollView>

      <RoomDetailModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  addButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
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
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  roomsList: {
    flex: 1,
  },
  roomsListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  roomCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roomCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  roomBasicInfo: {
    flex: 1,
  },
  roomNumber: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 2,
  },
  roomType: {
    fontSize: 14,
    opacity: 0.7,
  },
  roomCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  roomCardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  roomCardDetails: {
    flex: 1,
  },
  roomRent: {
    fontSize: 16,
    fontWeight: "600",
    color: "#34C759",
    marginBottom: 4,
  },
  tenantInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 4,
  },
  tenantName: {
    fontSize: 14,
    opacity: 0.8,
  },
  roomMetrics: {
    flexDirection: "row",
    gap: 12,
  },
  metric: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metricText: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 12,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalEditButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
  },
  photosSection: {
    paddingVertical: 16,
  },
  roomPhoto: {
    width: width - 60,
    height: 200,
    borderRadius: 12,
    marginLeft: 20,
    marginRight: 8,
  },
  detailSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.7,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
