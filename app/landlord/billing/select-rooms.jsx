import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
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

const { width } = Dimensions.get("window");

export default function SelectRoomsScreen() {
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const router = useRouter();
  const { propertyId, propertyName } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Mock rooms data - replace with Firebase data later
  const rooms = [
    {
      id: "1",
      number: "101",
      type: "Studio",
      rent: 2800,
      status: "occupied",
      tenant: "Anna Garcia",
    },
    {
      id: "2",
      number: "102",
      type: "1BR",
      rent: 3200,
      status: "occupied",
      tenant: "Carlos Mendoza",
    },
    {
      id: "3",
      number: "103",
      type: "Studio",
      rent: 2800,
      status: "vacant",
      tenant: null,
    },
    {
      id: "4",
      number: "201",
      type: "2BR",
      rent: 4500,
      status: "occupied",
      tenant: "Elena Rodriguez",
    },
    {
      id: "5",
      number: "202",
      type: "1BR",
      rent: 3200,
      status: "occupied",
      tenant: "Maria Fernandez",
    },
    {
      id: "6",
      number: "203",
      type: "Studio",
      rent: 2800,
      status: "maintenance",
      tenant: null,
    },
  ];

  const billableRooms = rooms.filter((room) => room.status === "occupied");
  const allBillableSelected = billableRooms.every((room) =>
    selectedRooms.includes(room.id)
  );

  const toggleRoomSelection = (roomId) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
  };

  const toggleSelectAll = () => {
    if (allBillableSelected) {
      setSelectedRooms([]);
    } else {
      setSelectedRooms(billableRooms.map((room) => room.id));
    }
  };

  const handleNext = () => {
    if (selectedRooms.length === 0) {
      Alert.alert(
        "Selection Required",
        "Please select at least one room to continue."
      );
      return;
    }

    const selectedRoomData = rooms.filter((room) =>
      selectedRooms.includes(room.id)
    );

    router.push({
      pathname: "/landlord/billing/select-period",
      params: {
        propertyId,
        propertyName,
        selectedRooms: JSON.stringify(selectedRoomData),
      },
    });
  };

  const RoomCard = ({ room }) => {
    const isSelected = selectedRooms.includes(room.id);
    const canSelect = room.status === "occupied";

    return (
      <TouchableOpacity
        style={[
          styles.roomCard,
          {
            backgroundColor: colors.card,
            borderColor: isSelected ? colors.tint : "transparent",
            borderWidth: isSelected ? 2 : 0,
            opacity: canSelect ? 1 : 0.6,
          },
        ]}
        onPress={() => canSelect && toggleRoomSelection(room.id)}
        disabled={!canSelect}
      >
        <View style={styles.roomHeader}>
          <View style={styles.roomInfo}>
            <ThemedText style={styles.roomNumber}>
              Room {room.number}
            </ThemedText>
            <ThemedText style={styles.roomType}>{room.type}</ThemedText>
          </View>

          <View style={styles.roomRight}>
            <StatusChip status={room.status} />
            {canSelect && (
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
            )}
          </View>
        </View>

        <View style={styles.roomDetails}>
          <ThemedText style={styles.roomRent}>
            ₱{room.rent.toLocaleString()}/month
          </ThemedText>

          {room.tenant && (
            <View style={styles.tenantInfo}>
              <Ionicons name="person" size={14} color={colors.text} />
              <ThemedText style={styles.tenantName}>{room.tenant}</ThemedText>
            </View>
          )}

          {!canSelect && (
            <ThemedText style={styles.notBillableText}>
              {room.status === "vacant" ? "Vacant room" : "Under maintenance"}
            </ThemedText>
          )}
        </View>
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

        <ThemedText style={styles.headerTitle}>Select Rooms</ThemedText>

        <View style={styles.stepIndicator}>
          <ThemedText style={styles.stepText}>2 of 6</ThemedText>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: "33.33%" }]} />
        </View>
        <View style={styles.progressSteps}>
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <View
              key={step}
              style={[
                styles.progressStep,
                step <= 2 && styles.progressStepActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Select Rooms for {propertyName}
          </ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Choose which occupied rooms to include in this billing cycle
          </ThemedText>
        </View>

        {/* Select All */}
        {billableRooms.length > 0 && (
          <View style={styles.selectAllContainer}>
            <TouchableOpacity
              style={styles.selectAllButton}
              onPress={toggleSelectAll}
            >
              <View
                style={[
                  styles.selectAllCheckbox,
                  allBillableSelected && { backgroundColor: colors.tint },
                ]}
              >
                {allBillableSelected && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
              <ThemedText style={styles.selectAllText}>
                Select all occupied rooms ({billableRooms.length})
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.roomsList}>
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </View>

        {rooms.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="bed-outline" size={48} color={colors.text + "40"} />
            <ThemedText style={styles.emptyStateText}>
              No rooms available in this property
            </ThemedText>
          </View>
        )}
      </ScrollView>

      {/* Selection Summary */}
      {selectedRooms.length > 0 && (
        <View style={styles.selectionSummary}>
          <ThemedText style={styles.selectionText}>
            {selectedRooms.length} room{selectedRooms.length !== 1 ? "s" : ""}{" "}
            selected
          </ThemedText>
        </View>
      )}

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: colors.tint }]}
          onPress={handleNext}
        >
          <ThemedText style={styles.nextButtonText}>Next</ThemedText>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  stepIndicator: {
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  stepText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E5E5E7",
    borderRadius: 2,
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 2,
  },
  progressSteps: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressStep: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E5E7",
  },
  progressStepActive: {
    backgroundColor: "#007AFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    lineHeight: 22,
  },
  selectAllContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  selectAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  selectAllCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#E5E5E7",
    alignItems: "center",
    justifyContent: "center",
  },
  selectAllText: {
    fontSize: 16,
    fontWeight: "500",
  },
  roomsList: {
    gap: 12,
    paddingHorizontal: 20,
  },
  roomCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  roomType: {
    fontSize: 14,
    opacity: 0.7,
  },
  roomRight: {
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#E5E5E7",
    alignItems: "center",
    justifyContent: "center",
  },
  roomDetails: {
    gap: 8,
  },
  roomRent: {
    fontSize: 16,
    fontWeight: "600",
    color: "#34C759",
  },
  tenantInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tenantName: {
    fontSize: 14,
    opacity: 0.8,
  },
  notBillableText: {
    fontSize: 14,
    color: "#FF9500",
    fontStyle: "italic",
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
  selectionSummary: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
  },
  selectionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
    backgroundColor: "#FFFFFF",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
