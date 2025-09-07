import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import StatusChip from "@/components/landlord/StatusChip";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

const { width, height } = Dimensions.get("window");

export default function PropertyDetailsScreen() {
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Mock property data - replace with Firebase data later
  const property = {
    id: id,
    name: "Sunset Apartments",
    address: "123 Main St, Cebu City",
    images: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
    ],
    totalRooms: 15,
    occupied: 13,
    vacant: 2,
    monthlyRevenue: 15750,
    rooms: [
      {
        id: "1",
        number: "101",
        rent: 2800,
        status: "occupied",
        tenant: "John Doe",
        thumbnail:
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200",
      },
      {
        id: "2",
        number: "102",
        rent: 2800,
        status: "occupied",
        tenant: "Jane Smith",
        thumbnail:
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200",
      },
      {
        id: "3",
        number: "103",
        rent: 2800,
        status: "vacant",
        tenant: null,
        thumbnail:
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200",
      },
      {
        id: "4",
        number: "104",
        rent: 2800,
        status: "maintenance",
        tenant: null,
        thumbnail:
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200",
      },
      {
        id: "5",
        number: "105",
        rent: 2800,
        status: "occupied",
        tenant: "Mike Johnson",
        thumbnail:
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200",
      },
    ],
  };

  const handleRoomAction = (room, action) => {
    switch (action) {
      case "assign":
        Alert.alert("Assign Tenant", `Assign tenant to Room ${room.number}?`);
        break;
      case "bill":
        Alert.alert("Generate Bill", `Generate bill for Room ${room.number}?`);
        break;
      case "maintenance":
        Alert.alert(
          "Mark Maintenance",
          `Mark Room ${room.number} for maintenance?`
        );
        break;
    }
  };

  const toggleRoomSelection = (roomId) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleBulkBill = () => {
    if (selectedRooms.length === 0) {
      Alert.alert("No Selection", "Please select rooms to bill.");
      return;
    }
    Alert.alert(
      "Generate Bills",
      `Generate bills for ${selectedRooms.length} selected rooms?`
    );
  };

  const RoomCard = ({ room }) => {
    const isSelected = selectedRooms.includes(room.id);

    return (
      <TouchableOpacity
        style={[
          styles.roomCard,
          { backgroundColor: colors.card },
          isSelectionMode &&
            isSelected && { borderColor: colors.tint, borderWidth: 2 },
        ]}
        onPress={() => (isSelectionMode ? toggleRoomSelection(room.id) : null)}
        onLongPress={() => {
          setIsSelectionMode(true);
          toggleRoomSelection(room.id);
        }}
      >
        <View style={styles.roomHeader}>
          <View style={styles.roomInfo}>
            <ThemedText style={styles.roomNumber}>
              Room {room.number}
            </ThemedText>
            <ThemedText style={styles.roomRent}>₱{room.rent}/month</ThemedText>
          </View>
          <StatusChip status={room.status} />
        </View>

        <View style={styles.roomContent}>
          <Image
            source={{ uri: room.thumbnail }}
            style={styles.roomThumbnail}
          />

          <View style={styles.roomDetails}>
            {room.tenant && (
              <ThemedText style={styles.tenantName}>{room.tenant}</ThemedText>
            )}

            {!isSelectionMode && (
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: "#007AFF20" },
                  ]}
                  onPress={() => handleRoomAction(room, "assign")}
                >
                  <Ionicons
                    name="person-add-outline"
                    size={16}
                    color="#007AFF"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: "#34C75920" },
                  ]}
                  onPress={() => handleRoomAction(room, "bill")}
                >
                  <Ionicons name="cash-outline" size={16} color="#34C759" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: "#FFCC0020" },
                  ]}
                  onPress={() => handleRoomAction(room, "maintenance")}
                >
                  <Ionicons
                    name="construct-outline"
                    size={16}
                    color="#FFCC00"
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {isSelectionMode && (
          <TouchableOpacity
            style={styles.selectionIndicator}
            onPress={() => toggleRoomSelection(room.id)}
          >
            <View
              style={[
                styles.checkbox,
                isSelected && { backgroundColor: colors.tint },
              ]}
            >
              {isSelected && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </View>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

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

        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            Alert.alert("Edit Property", "Edit functionality coming soon!")
          }
        >
          <Ionicons name="pencil" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: property.images[0] }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <ThemedText style={styles.heroTitle}>{property.name}</ThemedText>
            <ThemedText style={styles.heroAddress}>
              {property.address}
            </ThemedText>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={[styles.statChip, { backgroundColor: "#007AFF20" }]}>
            <ThemedText style={[styles.statNumber, { color: "#007AFF" }]}>
              {property.totalRooms}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: "#007AFF" }]}>
              Total Rooms
            </ThemedText>
          </View>

          <View style={[styles.statChip, { backgroundColor: "#34C75920" }]}>
            <ThemedText style={[styles.statNumber, { color: "#34C759" }]}>
              {property.occupied}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: "#34C759" }]}>
              Occupied
            </ThemedText>
          </View>

          <View style={[styles.statChip, { backgroundColor: "#FF950020" }]}>
            <ThemedText style={[styles.statNumber, { color: "#FF9500" }]}>
              {property.vacant}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: "#FF9500" }]}>
              Vacant
            </ThemedText>
          </View>

          <View style={[styles.statChip, { backgroundColor: "#FFCC0020" }]}>
            <ThemedText style={[styles.statNumber, { color: "#FFCC00" }]}>
              ₱{property.monthlyRevenue.toLocaleString()}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: "#FFCC00" }]}>
              Monthly Revenue
            </ThemedText>
          </View>
        </View>

        {/* Selection Mode Header */}
        {isSelectionMode && (
          <View style={styles.selectionHeader}>
            <TouchableOpacity
              onPress={() => {
                setIsSelectionMode(false);
                setSelectedRooms([]);
              }}
            >
              <ThemedText style={styles.cancelText}>Cancel</ThemedText>
            </TouchableOpacity>

            <ThemedText style={styles.selectionCount}>
              {selectedRooms.length} selected
            </ThemedText>

            <TouchableOpacity
              onPress={handleBulkBill}
              disabled={selectedRooms.length === 0}
            >
              <ThemedText
                style={[
                  styles.bulkActionText,
                  selectedRooms.length === 0 && { opacity: 0.5 },
                ]}
              >
                Bill All
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Rooms List */}
        <View style={styles.roomsSection}>
          <View style={styles.roomsHeader}>
            <ThemedText style={styles.sectionTitle}>Rooms</ThemedText>
            <TouchableOpacity
              style={styles.manageRoomsButton}
              onPress={() =>
                router.push(`/landlord/rooms-management/${property.id}`)
              }
            >
              <ThemedText
                style={[styles.manageRoomsText, { color: colors.tint }]}
              >
                Manage
              </ThemedText>
              <Ionicons name="chevron-forward" size={16} color={colors.tint} />
            </TouchableOpacity>
          </View>
          <View style={styles.roomsList}>
            {property.rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroContainer: {
    height: height * 0.3,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  heroAddress: {
    fontSize: 16,
    color: "white",
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  statChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  selectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#F2F2F7",
  },
  cancelText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  selectionCount: {
    fontSize: 16,
    fontWeight: "600",
  },
  bulkActionText: {
    fontSize: 16,
    color: "#34C759",
    fontWeight: "500",
  },
  roomsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  roomsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  manageRoomsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  manageRoomsText: {
    fontSize: 16,
    fontWeight: "500",
  },
  roomsList: {
    gap: 12,
  },
  roomCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  roomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  roomInfo: {
    flex: 1,
  },
  roomNumber: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  roomRent: {
    fontSize: 16,
    color: "#34C759",
    fontWeight: "500",
  },
  roomContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  roomThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  roomDetails: {
    flex: 1,
  },
  tenantName: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  quickActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  selectionIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#C7C7CC",
    alignItems: "center",
    justifyContent: "center",
  },
});
