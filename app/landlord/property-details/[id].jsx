import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
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
import TenantAssignmentModal from "@/components/landlord/TenantAssignmentModal";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { getPropertyById } from "@/utils/propertyHelpers";
import { getPropertyRooms } from "@/utils/roomHelpers";
import { forceCheckoutTenantFromRoom } from "@/utils/tenantHelpers";

const { width, height } = Dimensions.get("window");

export default function PropertyDetailsScreen() {
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const scrollViewRef = useRef(null);
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Auto-slide images every 3 seconds
  useEffect(() => {
    if (!property?.photos || property.photos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % property.photos.length;
        
        // Scroll to the next image
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            x: nextIndex * width,
            animated: true,
          });
        }
        
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [property?.photos, width]);

  // Load property and room data from Firebase
  const loadPropertyData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch property details
      const propertyData = await getPropertyById(id);
      console.log('Property data loaded:', propertyData);
      console.log('Property photos:', propertyData?.photos);
      setProperty(propertyData);
      
      // Fetch rooms for this property
      const roomsData = await getPropertyRooms(id);
      setRooms(roomsData);
      
    } catch (error) {
      console.error("Error loading property data:", error);
      Alert.alert("Error", "Failed to load property data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadPropertyData();
    }, [loadPropertyData])
  );

  // Calculate statistics from actual room data
  const calculateStats = () => {
    if (!rooms.length) {
      return { totalRooms: 0, occupied: 0, vacant: 0, maintenance: 0, monthlyRevenue: 0 };
    }

    const stats = rooms.reduce(
      (acc, room) => {
        acc.totalRooms++;
        if (room.status === "occupied") {
          acc.occupied++;
          acc.monthlyRevenue += room.rent || 0;
        } else if (room.status === "vacant") {
          acc.vacant++;
        } else if (room.status === "maintenance") {
          acc.maintenance++;
        }
        return acc;
      },
      { totalRooms: 0, occupied: 0, vacant: 0, maintenance: 0, monthlyRevenue: 0 }
    );

    return stats;
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading property details...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!property) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>Property not found</ThemedText>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.tint }]}
            onPress={loadPropertyData}
          >
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleRoomAction = (room, action) => {
    switch (action) {
      case "assign":
        if (room.status === "occupied") {
          Alert.alert(
            "Room Occupied", 
            `Room ${room.number} is currently occupied by ${room.tenant?.name || 'a tenant'}. Would you like to reassign it?`,
            [
              { text: "Cancel", style: "cancel" },
              { 
                text: "Reassign", 
                style: "destructive",
                onPress: () => {
                  setSelectedRoom(room);
                  setShowAssignmentModal(true);
                }
              }
            ]
          );
        } else {
          setSelectedRoom(room);
          setShowAssignmentModal(true);
        }
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
            source={{ 
              uri: room.photos && room.photos.length > 0 
                ? room.photos[0] 
                : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200"
            }}
            style={styles.roomThumbnail}
          />

          <View style={styles.roomDetails}>
            <ThemedText style={styles.roomType}>{room.type || "Studio"}</ThemedText>
            {room.tenant && (
              <ThemedText style={styles.tenantName}>
                {typeof room.tenant === 'string' ? room.tenant : room.tenant.name}
              </ThemedText>
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
                    size={20}
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
                  <Ionicons name="cash-outline" size={20} color="#34C759" />
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
                    size={20}
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
          onPress={() => router.push(`/landlord/edit-property/${property.id}`)}
        >
          <Ionicons name="pencil" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Image Carousel */}
        <View style={styles.heroContainer}>
          {property.photos && property.photos.length > 0 ? (
            <>
              <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                  setCurrentImageIndex(newIndex);
                }}
                style={styles.imageCarousel}
                contentContainerStyle={{ flexDirection: 'row' }}
              >
                {property.photos.map((photo, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image
                      source={{ uri: photo }}
                      style={styles.heroImage}
                      resizeMode="cover"
                      onError={(error) => console.log('Image load error:', error)}
                      onLoad={() => console.log('Image loaded successfully:', photo)}
                    />
                  </View>
                ))}
              </ScrollView>
              
              {/* Image Indicators */}
              {property.photos.length > 1 && (
                <View style={styles.imageIndicators}>
                  {property.photos.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.indicator,
                        {
                          backgroundColor: index === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)',
                        },
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400" }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          )}
          
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
              {stats.totalRooms}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: "#007AFF" }]}>
              Total Rooms
            </ThemedText>
          </View>

          <View style={[styles.statChip, { backgroundColor: "#34C75920" }]}>
            <ThemedText style={[styles.statNumber, { color: "#34C759" }]}>
              {stats.occupied}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: "#34C759" }]}>
              Occupied
            </ThemedText>
          </View>

          <View style={[styles.statChip, { backgroundColor: "#FF950020" }]}>
            <ThemedText style={[styles.statNumber, { color: "#FF9500" }]}>
              {stats.vacant}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: "#FF9500" }]}>
              Vacant
            </ThemedText>
          </View>

          <View style={[styles.statChip, { backgroundColor: "#FFCC0020" }]}>
            <ThemedText style={[styles.statNumber, { color: "#FFCC00" }]}>
              ₱{stats.monthlyRevenue.toLocaleString()}
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
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="home-outline" size={48} color={colors.text} opacity={0.3} />
                <ThemedText style={styles.emptyStateText}>No rooms added yet</ThemedText>
                <TouchableOpacity
                  style={[styles.addRoomButton, { backgroundColor: colors.tint }]}
                  onPress={() => router.push(`/landlord/rooms-management/${property.id}`)}
                >
                  <ThemedText style={styles.addRoomButtonText}>Add Rooms</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Tenant Assignment Modal */}
      <TenantAssignmentModal
        visible={showAssignmentModal}
        onClose={() => {
          setShowAssignmentModal(false);
          setSelectedRoom(null);
        }}
        room={selectedRoom}
        onAssignmentComplete={() => {
          // Reload property data to reflect changes
          loadPropertyData();
        }}
      />
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
    height: 250,
    position: "relative",
  },
  heroImage: {
    width: width,
    height: 250,
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
    gap: 8,
  },
  roomCard: {
    borderRadius: 12,
    padding: 12,
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
    marginBottom: 8,
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
    marginRight: 12,
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
    justifyContent: "flex-end",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    opacity: 0.7,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 16,
    marginBottom: 20,
  },
  addRoomButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addRoomButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  roomType: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  imageCarousel: {
    height: 250,
  },
  imageContainer: {
    width: width,
    height: 250,
  },
  imageIndicators: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
