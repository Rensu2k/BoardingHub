import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

const { width } = Dimensions.get("window");

export default function AdjustChargesScreen() {
  const router = useRouter();
  const { propertyId, propertyName, selectedRooms, billingPeriod } =
    useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const selectedRoomsData = JSON.parse(selectedRooms || "[]");
  const billingPeriodData = JSON.parse(billingPeriod || "{}");

  const [roomCharges, setRoomCharges] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);

  // Initialize room charges with default values
  useEffect(() => {
    const initialCharges = {};
    let total = 0;

    selectedRoomsData.forEach((room) => {
      initialCharges[room.id] = {
        rent: room.rent.toString(),
        electricity: "0",
        water: "0",
        wifi: "0",
        other: "0",
        notes: "",
      };
      total += room.rent;
    });

    setRoomCharges(initialCharges);
    setTotalAmount(total);
  }, []);

  const updateRoomCharge = (roomId, field, value) => {
    const updatedCharges = {
      ...roomCharges,
      [roomId]: {
        ...roomCharges[roomId],
        [field]: value,
      },
    };
    setRoomCharges(updatedCharges);

    // Recalculate total
    let total = 0;
    Object.values(updatedCharges).forEach((charges) => {
      total +=
        parseFloat(charges.rent || 0) +
        parseFloat(charges.electricity || 0) +
        parseFloat(charges.water || 0) +
        parseFloat(charges.wifi || 0) +
        parseFloat(charges.other || 0);
    });
    setTotalAmount(total);
  };

  const applyToAll = (field, value) => {
    Alert.alert(
      "Apply to All Rooms",
      `Apply ${value} to ${field} for all rooms?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Apply",
          onPress: () => {
            const updatedCharges = { ...roomCharges };
            Object.keys(updatedCharges).forEach((roomId) => {
              updatedCharges[roomId][field] = value;
            });
            setRoomCharges(updatedCharges);
          },
        },
      ]
    );
  };

  const handleNext = () => {
    // Validate that all required fields are filled
    const invalidRooms = Object.entries(roomCharges).filter(
      ([roomId, charges]) => {
        return !charges.rent || parseFloat(charges.rent) <= 0;
      }
    );

    if (invalidRooms.length > 0) {
      Alert.alert(
        "Validation Error",
        "Please ensure all rooms have valid rent amounts."
      );
      return;
    }

    const billingData = {
      propertyId,
      propertyName,
      selectedRooms: selectedRoomsData,
      billingPeriod: billingPeriodData,
      roomCharges,
      totalAmount,
    };

    router.push({
      pathname: "/landlord/billing/preview",
      params: {
        billingData: JSON.stringify(billingData),
      },
    });
  };

  const RoomChargeCard = ({ room }) => {
    const charges = roomCharges[room.id] || {};

    return (
      <View style={[styles.roomCard, { backgroundColor: colors.card }]}>
        <View style={styles.roomHeader}>
          <View style={styles.roomInfo}>
            <ThemedText style={styles.roomNumber}>
              Room {room.number}
            </ThemedText>
            <ThemedText style={styles.roomType}>{room.type}</ThemedText>
            {room.tenant && (
              <ThemedText style={styles.tenantName}>{room.tenant}</ThemedText>
            )}
          </View>
          <TouchableOpacity
            style={styles.applyToAllButton}
            onPress={() =>
              Alert.alert(
                "Quick Apply",
                "Apply charges to all rooms with similar values"
              )
            }
          >
            <Ionicons name="copy-outline" size={16} color={colors.tint} />
          </TouchableOpacity>
        </View>

        <View style={styles.chargesGrid}>
          <View style={styles.chargeRow}>
            <ThemedText style={styles.chargeLabel}>Rent *</ThemedText>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.currencySymbol}>₱</ThemedText>
              <TextInput
                style={[styles.chargeInput, { color: colors.text }]}
                value={charges.rent}
                onChangeText={(value) =>
                  updateRoomCharge(room.id, "rent", value)
                }
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.text + "40"}
              />
            </View>
          </View>

          <View style={styles.chargeRow}>
            <ThemedText style={styles.chargeLabel}>Electricity</ThemedText>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.currencySymbol}>₱</ThemedText>
              <TextInput
                style={[styles.chargeInput, { color: colors.text }]}
                value={charges.electricity}
                onChangeText={(value) =>
                  updateRoomCharge(room.id, "electricity", value)
                }
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.text + "40"}
              />
            </View>
          </View>

          <View style={styles.chargeRow}>
            <ThemedText style={styles.chargeLabel}>Water</ThemedText>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.currencySymbol}>₱</ThemedText>
              <TextInput
                style={[styles.chargeInput, { color: colors.text }]}
                value={charges.water}
                onChangeText={(value) =>
                  updateRoomCharge(room.id, "water", value)
                }
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.text + "40"}
              />
            </View>
          </View>

          <View style={styles.chargeRow}>
            <ThemedText style={styles.chargeLabel}>WiFi</ThemedText>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.currencySymbol}>₱</ThemedText>
              <TextInput
                style={[styles.chargeInput, { color: colors.text }]}
                value={charges.wifi}
                onChangeText={(value) =>
                  updateRoomCharge(room.id, "wifi", value)
                }
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.text + "40"}
              />
            </View>
          </View>

          <View style={styles.chargeRow}>
            <ThemedText style={styles.chargeLabel}>Other</ThemedText>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.currencySymbol}>₱</ThemedText>
              <TextInput
                style={[styles.chargeInput, { color: colors.text }]}
                value={charges.other}
                onChangeText={(value) =>
                  updateRoomCharge(room.id, "other", value)
                }
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.text + "40"}
              />
            </View>
          </View>
        </View>

        <View style={styles.notesContainer}>
          <TextInput
            style={[styles.notesInput, { color: colors.text }]}
            value={charges.notes}
            onChangeText={(value) => updateRoomCharge(room.id, "notes", value)}
            placeholder="Add notes (optional)"
            placeholderTextColor={colors.text + "40"}
            multiline
            numberOfLines={2}
          />
        </View>

        <View style={styles.roomTotal}>
          <ThemedText style={styles.roomTotalLabel}>Room Total:</ThemedText>
          <ThemedText style={styles.roomTotalAmount}>
            ₱
            {(
              parseFloat(charges.rent || 0) +
              parseFloat(charges.electricity || 0) +
              parseFloat(charges.water || 0) +
              parseFloat(charges.wifi || 0) +
              parseFloat(charges.other || 0)
            ).toLocaleString()}
          </ThemedText>
        </View>
      </View>
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

        <ThemedText style={styles.headerTitle}>Adjust Charges</ThemedText>

        <View style={styles.stepIndicator}>
          <ThemedText style={styles.stepText}>4 of 6</ThemedText>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: "66.67%" }]} />
        </View>
        <View style={styles.progressSteps}>
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <View
              key={step}
              style={[
                styles.progressStep,
                step <= 4 && styles.progressStepActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <ThemedText style={styles.summaryLabel}>Property:</ThemedText>
          <ThemedText style={styles.summaryValue}>{propertyName}</ThemedText>
        </View>
        <View style={styles.summaryItem}>
          <ThemedText style={styles.summaryLabel}>Period:</ThemedText>
          <ThemedText style={styles.summaryValue}>
            {billingPeriodData.displayName}
          </ThemedText>
        </View>
        <View style={styles.summaryItem}>
          <ThemedText style={styles.summaryLabel}>Rooms:</ThemedText>
          <ThemedText style={styles.summaryValue}>
            {selectedRoomsData.length}
          </ThemedText>
        </View>
        <View style={styles.summaryItem}>
          <ThemedText style={styles.summaryLabel}>Total Amount:</ThemedText>
          <ThemedText
            style={[
              styles.summaryValue,
              { color: "#34C759", fontWeight: "bold" },
            ]}
          >
            ₱{totalAmount.toLocaleString()}
          </ThemedText>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Customize Charges</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Adjust rent and utility charges for each room (optional)
          </ThemedText>
        </View>

        <View style={styles.roomsList}>
          {selectedRoomsData.map((room) => (
            <RoomChargeCard key={room.id} room={room} />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: colors.tint }]}
          onPress={handleNext}
        >
          <ThemedText style={styles.nextButtonText}>Preview Bills</ThemedText>
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
  summaryContainer: {
    backgroundColor: "#F9F9F9",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
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
  roomsList: {
    gap: 16,
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
    marginBottom: 16,
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
    marginBottom: 2,
  },
  tenantName: {
    fontSize: 14,
    opacity: 0.8,
  },
  applyToAllButton: {
    padding: 8,
  },
  chargesGrid: {
    gap: 12,
  },
  chargeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chargeLabel: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E7",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minWidth: 120,
  },
  currencySymbol: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 4,
  },
  chargeInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  notesContainer: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  notesInput: {
    fontSize: 14,
    minHeight: 40,
  },
  roomTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  roomTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  roomTotalAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#34C759",
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
