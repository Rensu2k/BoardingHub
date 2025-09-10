import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { usePullRefresh } from "@/hooks/usePullRefresh";

const { width } = Dimensions.get("window");

export default function MyRoom() {
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Mock room data - replace with real data from your backend
  const roomData = {
    roomNumber: "A-101",
    floor: "2nd Floor",
    type: "Single Room",
    size: "12 sqm",
    monthlyRent: "₱5,000",
    deposit: "₱10,000",
    moveInDate: "Aug 15, 2024",
    leaseEndDate: "Aug 15, 2025",
    images: [
      "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Room+View+1",
      "https://via.placeholder.com/300x200/7ED321/FFFFFF?text=Room+View+2",
      "https://via.placeholder.com/300x200/F5A623/FFFFFF?text=Room+View+3",
    ],
  };

  const amenities = [
    { name: "Air Conditioning", icon: "snow-outline", available: true },
    { name: "WiFi Internet", icon: "wifi-outline", available: true },
    { name: "Private Bathroom", icon: "water-outline", available: true },
    { name: "Bed & Mattress", icon: "bed-outline", available: true },
    { name: "Study Desk", icon: "desktop-outline", available: true },
    { name: "Closet", icon: "shirt-outline", available: true },
    { name: "Window View", icon: "sunny-outline", available: true },
    { name: "Laundry Access", icon: "shirt-outline", available: false },
  ];

  const houseRules = [
    "No smoking inside the room",
    "No pets allowed",
    "Quiet hours: 10PM - 6AM",
    "No overnight guests without prior notice",
    "Keep common areas clean",
    "Utilities to be paid separately",
  ];

  const serviceTypes = [
    {
      id: 1,
      title: "Maintenance Request",
      description: "Report broken appliances, plumbing, electrical issues",
      icon: "construct-outline",
      color: "#FF9500",
    },
    {
      id: 2,
      title: "Cleaning Service",
      description: "Request room cleaning or housekeeping",
      icon: "brush-outline",
      color: "#007AFF",
    },
    {
      id: 3,
      title: "Key Replacement",
      description: "Lost key or need spare key",
      icon: "key-outline",
      color: "#5856D6",
    },
    {
      id: 4,
      title: "General Inquiry",
      description: "Other concerns or questions",
      icon: "help-circle-outline",
      color: "#34C759",
    },
  ];

  const refreshRoom = async () => {
    console.log("Refreshing room data...");
    // Simulate API call
  };

  const { refreshing, onRefresh } = usePullRefresh(refreshRoom);

  const handleServiceRequest = (service) => {
    setSelectedService(service);
    setShowServiceModal(true);
  };

  const submitServiceRequest = () => {
    Alert.alert("Service Request", "Your request has been submitted!");
    setShowServiceModal(false);
  };

  const renderImageCarousel = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      pagingEnabled
      style={styles.imageCarousel}
    >
      {roomData.images.map((image, index) => (
        <Image
          key={index}
          source={{ uri: image }}
          style={styles.roomImage}
          resizeMode="cover"
        />
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>My Room</ThemedText>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => Alert.alert("Notifications", "No new notifications")}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>
      </ThemedView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
      >
        {/* Room Images */}
        <ThemedView style={styles.imageSection}>
          {renderImageCarousel()}
          <View style={styles.imageIndicator}>
            <ThemedText style={styles.imageCounter}>
              1 / {roomData.images.length}
            </ThemedText>
          </View>
        </ThemedView>

        {/* Room Details */}
        <ThemedView style={styles.detailsSection}>
          <View style={styles.roomHeader}>
            <View>
              <ThemedText style={styles.roomNumber}>
                {roomData.roomNumber}
              </ThemedText>
              <ThemedText style={styles.roomType}>
                {roomData.type} • {roomData.floor} • {roomData.size}
              </ThemedText>
            </View>
            <View style={styles.rentInfo}>
              <ThemedText style={styles.rentAmount}>
                {roomData.monthlyRent}
              </ThemedText>
              <ThemedText style={styles.rentLabel}>per month</ThemedText>
            </View>
          </View>

          <View style={styles.contractDetails}>
            <View style={styles.contractItem}>
              <Ionicons name="calendar-outline" size={20} color={colors.text} />
              <View style={styles.contractText}>
                <ThemedText style={styles.contractLabel}>
                  Move-in Date
                </ThemedText>
                <ThemedText style={styles.contractValue}>
                  {roomData.moveInDate}
                </ThemedText>
              </View>
            </View>
            <View style={styles.contractItem}>
              <Ionicons name="time-outline" size={20} color={colors.text} />
              <View style={styles.contractText}>
                <ThemedText style={styles.contractLabel}>Lease End</ThemedText>
                <ThemedText style={styles.contractValue}>
                  {roomData.leaseEndDate}
                </ThemedText>
              </View>
            </View>
            <View style={styles.contractItem}>
              <Ionicons name="shield-outline" size={20} color={colors.text} />
              <View style={styles.contractText}>
                <ThemedText style={styles.contractLabel}>
                  Security Deposit
                </ThemedText>
                <ThemedText style={styles.contractValue}>
                  {roomData.deposit}
                </ThemedText>
              </View>
            </View>
          </View>
        </ThemedView>

        {/* Amenities */}
        <ThemedView style={styles.amenitiesSection}>
          <ThemedText style={styles.sectionTitle}>Room Amenities</ThemedText>
          <View style={styles.amenitiesGrid}>
            {amenities.map((amenity, index) => (
              <View
                key={index}
                style={[
                  styles.amenityItem,
                  { backgroundColor: colors.card },
                  !amenity.available && styles.unavailableAmenity,
                ]}
              >
                <View
                  style={[
                    styles.amenityIcon,
                    {
                      backgroundColor: amenity.available
                        ? colors.tint + "20"
                        : colors.text + "10",
                    },
                  ]}
                >
                  <Ionicons
                    name={amenity.icon}
                    size={24}
                    color={amenity.available ? colors.tint : colors.text}
                    style={{ opacity: amenity.available ? 1 : 0.5 }}
                  />
                </View>
                <ThemedText
                  style={[
                    styles.amenityName,
                    !amenity.available && styles.unavailableText,
                  ]}
                >
                  {amenity.name}
                </ThemedText>
                {!amenity.available && (
                  <ThemedText style={styles.unavailableLabel}>
                    Not Available
                  </ThemedText>
                )}
              </View>
            ))}
          </View>
        </ThemedView>

        {/* Service Requests */}
        <ThemedView style={styles.serviceSection}>
          <ThemedText style={styles.sectionTitle}>Service Requests</ThemedText>
          <View style={styles.serviceGrid}>
            {serviceTypes.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[styles.serviceCard, { backgroundColor: colors.card }]}
                onPress={() => handleServiceRequest(service)}
              >
                <View
                  style={[
                    styles.serviceIcon,
                    { backgroundColor: service.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={service.icon}
                    size={28}
                    color={service.color}
                  />
                </View>
                <ThemedText style={styles.serviceTitle}>
                  {service.title}
                </ThemedText>
                <ThemedText style={styles.serviceDescription}>
                  {service.description}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>

        {/* House Rules */}
        <ThemedView style={styles.rulesSection}>
          <ThemedText style={styles.sectionTitle}>House Rules</ThemedText>
          <View
            style={[styles.rulesContainer, { backgroundColor: colors.card }]}
          >
            {houseRules.map((rule, index) => (
              <View key={index} style={styles.ruleItem}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={16}
                  color={colors.tint}
                />
                <ThemedText style={styles.ruleText}>{rule}</ThemedText>
              </View>
            ))}
          </View>
        </ThemedView>
      </ScrollView>

      {/* Service Request Modal */}
      <Modal
        visible={showServiceModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowServiceModal(false)}
      >
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowServiceModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>Service Request</ThemedText>
            <View style={{ width: 24 }} />
          </View>

          <ThemedView style={styles.modalContent}>
            {selectedService && (
              <>
                <View
                  style={[
                    styles.servicePreview,
                    { backgroundColor: colors.card },
                  ]}
                >
                  <View
                    style={[
                      styles.serviceIcon,
                      { backgroundColor: selectedService.color + "20" },
                    ]}
                  >
                    <Ionicons
                      name={selectedService.icon}
                      size={32}
                      color={selectedService.color}
                    />
                  </View>
                  <ThemedText style={styles.servicePreviewTitle}>
                    {selectedService.title}
                  </ThemedText>
                  <ThemedText style={styles.servicePreviewDescription}>
                    {selectedService.description}
                  </ThemedText>
                </View>

                <View style={styles.requestForm}>
                  <ThemedText style={styles.formLabel}>
                    Describe your request:
                  </ThemedText>
                  <View
                    style={[styles.textArea, { backgroundColor: colors.card }]}
                  >
                    <ThemedText style={styles.placeholder}>
                      Please provide details about your request...
                    </ThemedText>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      { backgroundColor: colors.tint },
                    ]}
                    onPress={submitServiceRequest}
                  >
                    <ThemedText style={styles.submitButtonText}>
                      Submit Request
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ThemedView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  notificationButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    position: "relative",
  },
  imageCarousel: {
    height: 240,
  },
  roomImage: {
    width: width,
    height: 240,
  },
  imageIndicator: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounter: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  detailsSection: {
    padding: 16,
  },
  roomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  roomNumber: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  roomType: {
    fontSize: 16,
    opacity: 0.7,
  },
  rentInfo: {
    alignItems: "flex-end",
  },
  rentAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  rentLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  contractDetails: {
    gap: 16,
  },
  contractItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contractText: {
    flex: 1,
  },
  contractLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  contractValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  amenitiesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  amenityItem: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  unavailableAmenity: {
    opacity: 0.6,
  },
  amenityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  amenityName: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 4,
  },
  unavailableText: {
    opacity: 0.6,
  },
  unavailableLabel: {
    fontSize: 12,
    opacity: 0.5,
    fontStyle: "italic",
  },
  serviceSection: {
    padding: 16,
  },
  serviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  serviceCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 16,
  },
  rulesSection: {
    padding: 16,
    paddingBottom: 40,
  },
  rulesContainer: {
    padding: 16,
    borderRadius: 12,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  servicePreview: {
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  servicePreviewTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  servicePreviewDescription: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
  requestForm: {
    flex: 1,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
  },
  textArea: {
    minHeight: 120,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  placeholder: {
    opacity: 0.5,
    lineHeight: 20,
  },
  submitButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
