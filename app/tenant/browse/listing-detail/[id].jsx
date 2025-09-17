import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { MessageModal } from "@/components/tenant";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  getCurrentTenantProfile,
  makePhoneCall,
  notifyLandlordOfApplication,
} from "@/utils/communicationHelpers";
import { getRoomDetailsForTenant } from "@/utils/roomHelpers";

const { width } = Dimensions.get("window");

export default function ListingDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageType, setMessageType] = useState("inquire");
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    const loadListing = async () => {
      try {
        setLoading(true);
        const roomDetails = await getRoomDetailsForTenant(id);
        setListing(roomDetails);
      } catch (error) {
        console.error("Error loading listing details:", error);
        Alert.alert("Error", "Failed to load room details. Please try again.");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadListing();
    }
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ThemedText>Loading room details...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!listing || !listing.id) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ThemedText>Room not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const contactLandlord = (action = "inquire") => {
    setMessageType(action);
    setShowMessageModal(true);
  };

  const quickCall = () => {
    if (listing?.landlord?.phone) {
      makePhoneCall(listing.landlord.phone, listing.landlord.name);
    } else {
      Alert.alert("Error", "Phone number not available");
    }
  };

  const handleApply = async (applicationMessage) => {
    try {
      // Get current tenant profile
      const tenantProfile = await getCurrentTenantProfile();

      // Submit application and create notification for landlord
      const notificationResult = await notifyLandlordOfApplication(
        listing?.landlord,
        listing,
        tenantProfile
      );

      if (notificationResult.success) {
        Alert.alert(
          "Application Submitted!",
          `Your application for ${listing?.title} has been submitted successfully! The landlord will be notified in their notifications panel and will review your application soon.`,
          [{ text: "OK" }]
        );
      } else {
        // Application submission failed
        Alert.alert(
          "Application Error",
          notificationResult.message ||
            "Failed to submit your application. Please try again.",
          [{ text: "OK" }]
        );
      }

      // You could also add the application to a local storage or send to Firebase
      console.log(
        "Application submitted with notification result:",
        notificationResult
      );
    } catch (error) {
      console.error("Error submitting application:", error);
      Alert.alert(
        "Application Error",
        "There was an error submitting your application. Please try again or contact the landlord directly.",
        [{ text: "OK" }]
      );
    }
  };

  const handleBookmark = () => {
    setIsFavorite(true);
    Alert.alert(
      "Room Bookmarked!",
      `${listing?.title} has been added to your favorites. You can find it in your saved listings.`,
      [{ text: "OK" }]
    );
    // You could also save to AsyncStorage or Firebase
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // In real app: save to AsyncStorage and sync with backend
  };

  const renderImageCarousel = () => {
    const images =
      listing?.images && Array.isArray(listing.images) ? listing.images : [];

    return (
      <View style={styles.imageCarousel}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentImageIndex(index);
          }}
        >
          {images.map((image, index) => (
            <TouchableOpacity key={index} onPress={() => setShowGallery(true)}>
              <Image source={{ uri: image }} style={styles.carouselImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Image Indicators */}
        <View style={styles.imageIndicators}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                {
                  backgroundColor:
                    currentImageIndex === index
                      ? "white"
                      : "rgba(255,255,255,0.4)",
                },
              ]}
            />
          ))}
        </View>

        {/* Overlay Controls */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={toggleFavorite}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? "#FF3B30" : "white"}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const GalleryModal = () => {
    const images =
      listing?.images && Array.isArray(listing.images) ? listing.images : [];

    return (
      <Modal
        visible={showGallery}
        animationType="fade"
        onRequestClose={() => setShowGallery(false)}
      >
        <SafeAreaView style={styles.galleryContainer}>
          <View style={styles.galleryHeader}>
            <TouchableOpacity onPress={() => setShowGallery(false)}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <ThemedText style={styles.galleryTitle}>
              {currentImageIndex + 1} of {images.length}
            </ThemedText>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.galleryScroll}
            contentOffset={{ x: currentImageIndex * width, y: 0 }}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
          >
            {images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.galleryImage}
              />
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Carousel */}
        {renderImageCarousel()}

        {/* Content */}
        <ThemedView style={styles.content}>
          {/* Header */}
          <View style={styles.listingHeader}>
            <View style={styles.titleSection}>
              <ThemedText style={styles.listingTitle}>
                {listing.title}
              </ThemedText>
              <ThemedText style={styles.listingPrice}>
                ₱{listing.price.toLocaleString()}/month
              </ThemedText>
            </View>

            <View style={styles.locationSection}>
              <Ionicons name="location" size={16} color={colors.text} />
              <ThemedText style={styles.locationText}>
                {listing.location}
              </ThemedText>
            </View>

            <View style={styles.roomDetails}>
              <View style={styles.roomDetail}>
                <ThemedText style={styles.roomDetailLabel}>Room</ThemedText>
                <ThemedText style={styles.roomDetailValue}>
                  {listing.roomNumber}
                </ThemedText>
              </View>
              <View style={styles.roomDetail}>
                <ThemedText style={styles.roomDetailLabel}>Type</ThemedText>
                <ThemedText style={styles.roomDetailValue}>
                  {listing.type}
                </ThemedText>
              </View>
              <View style={styles.roomDetail}>
                <ThemedText style={styles.roomDetailLabel}>Size</ThemedText>
                <ThemedText style={styles.roomDetailValue}>
                  {listing.size}
                </ThemedText>
              </View>
              <View style={styles.roomDetail}>
                <ThemedText style={styles.roomDetailLabel}>Status</ThemedText>
                <ThemedText style={styles.roomDetailValue}>
                  {listing.available ? "Available" : "Occupied"}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Description</ThemedText>
            <ThemedText style={styles.description}>
              {listing.description}
            </ThemedText>
          </View>

          {/* Amenities */}
          {listing.amenities &&
            Array.isArray(listing.amenities) &&
            listing.amenities.length > 0 && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Amenities</ThemedText>
                <View style={styles.amenitiesGrid}>
                  {listing.amenities.map((amenity, index) => (
                    <View key={index} style={styles.amenityItem}>
                      <View
                        style={[
                          styles.amenityIcon,
                          {
                            backgroundColor: colors.tint + "20",
                          },
                        ]}
                      >
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color={colors.tint}
                        />
                      </View>
                      <ThemedText style={styles.amenityName}>
                        {amenity}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            )}

          {/* Pricing Breakdown */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Pricing</ThemedText>
            <View
              style={[styles.pricingCard, { backgroundColor: colors.card }]}
            >
              <View style={styles.pricingRow}>
                <ThemedText style={styles.pricingLabel}>
                  Monthly Rent
                </ThemedText>
                <ThemedText style={styles.pricingValue}>
                  ₱{listing.monthlyRent.toLocaleString()}
                </ThemedText>
              </View>
              <View style={styles.pricingRow}>
                <ThemedText style={styles.pricingLabel}>
                  Security Deposit
                </ThemedText>
                <ThemedText style={styles.pricingValue}>
                  ₱{listing.deposit.toLocaleString()}
                </ThemedText>
              </View>
              <View style={styles.pricingRow}>
                <ThemedText style={styles.pricingLabel}>Utilities</ThemedText>
                <ThemedText style={styles.pricingValue}>
                  {listing.utilities &&
                  Object.keys(listing.utilities).length > 0
                    ? "Varies by usage"
                    : "Not specified"}
                </ThemedText>
              </View>
              <View style={styles.pricingRow}>
                <ThemedText style={[styles.pricingLabel, styles.totalAmount]}>
                  Total Move-in Cost
                </ThemedText>
                <ThemedText style={[styles.pricingValue, styles.totalAmount]}>
                  ₱{(listing.monthlyRent + listing.deposit).toLocaleString()}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* House Rules */}
          {listing.rules &&
            Array.isArray(listing.rules) &&
            listing.rules.length > 0 && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>House Rules</ThemedText>
                <View
                  style={[styles.rulesCard, { backgroundColor: colors.card }]}
                >
                  {listing.rules.map((rule, index) => (
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
              </View>
            )}

          {/* Property Info */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Property Details
            </ThemedText>
            <View
              style={[styles.propertyCard, { backgroundColor: colors.card }]}
            >
              <ThemedText style={styles.propertyName}>
                {listing.property?.name || "Property"}
              </ThemedText>
              <ThemedText style={styles.propertyAddress}>
                {listing.property?.address || "Address not specified"}
              </ThemedText>
              {listing.property?.description && (
                <ThemedText style={styles.propertyDescription}>
                  {listing.property.description}
                </ThemedText>
              )}
            </View>
          </View>

          {/* Landlord Info */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Contact Information
            </ThemedText>
            <View
              style={[styles.landlordCard, { backgroundColor: colors.card }]}
            >
              <View style={styles.landlordHeader}>
                <View
                  style={[
                    styles.landlordAvatar,
                    { backgroundColor: colors.tint + "20" },
                  ]}
                >
                  <ThemedText
                    style={[styles.landlordInitials, { color: colors.tint }]}
                  >
                    {(listing.landlord?.name || "PO")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </ThemedText>
                </View>
                <View style={styles.landlordInfo}>
                  <View style={styles.landlordNameRow}>
                    <ThemedText style={styles.landlordName}>
                      {listing.landlord?.name || "Property Owner"}
                    </ThemedText>
                    {listing.landlord?.verified && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#34C759"
                      />
                    )}
                  </View>
                  <ThemedText style={styles.landlordPhone}>
                    {listing.landlord?.phone || "Contact via property"}
                  </ThemedText>
                  <ThemedText style={styles.landlordEmail}>
                    {listing.landlord?.email || "Contact via property"}
                  </ThemedText>
                </View>

                {/* Quick Contact Buttons */}
                <View style={styles.quickContactButtons}>
                  {listing.landlord?.phone && (
                    <TouchableOpacity
                      style={[
                        styles.quickContactButton,
                        { backgroundColor: "#34C759" },
                      ]}
                      onPress={quickCall}
                    >
                      <Ionicons name="call" size={16} color="white" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[
                      styles.quickContactButton,
                      { backgroundColor: colors.tint },
                    ]}
                    onPress={() => contactLandlord("inquire")}
                  >
                    <Ionicons name="chatbubble" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ThemedView>
      </ScrollView>

      {/* Bottom Actions */}
      <View
        style={[styles.bottomActions, { backgroundColor: colors.background }]}
      >
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.contactButton,
            { backgroundColor: colors.card },
          ]}
          onPress={() => contactLandlord("inquire")}
        >
          <Ionicons name="chatbubble-outline" size={20} color={colors.tint} />
          <ThemedText style={[styles.actionText, { color: colors.tint }]}>
            Contact
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.applyButton,
            { backgroundColor: colors.tint },
          ]}
          onPress={() => contactLandlord("apply")}
        >
          <Ionicons name="paper-plane" size={20} color="white" />
          <ThemedText style={[styles.actionText, { color: "white" }]}>
            Apply Now
          </ThemedText>
        </TouchableOpacity>
      </View>

      <GalleryModal />

      <MessageModal
        visible={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        landlordInfo={listing?.landlord}
        roomInfo={listing}
        messageType={messageType}
        onApply={handleApply}
        onBookmark={handleBookmark}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  imageCarousel: {
    height: 300,
    position: "relative",
  },
  carouselImage: {
    width: width,
    height: 300,
  },
  imageIndicators: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  backButton: {
    position: "absolute",
    top: 44,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteButton: {
    position: "absolute",
    top: 44,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  listingHeader: {
    marginBottom: 24,
  },
  titleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  listingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    marginRight: 16,
  },
  listingPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  locationSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 16,
    opacity: 0.7,
  },
  roomDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roomDetail: {
    alignItems: "center",
  },
  roomDetailLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  roomDetailValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  amenityItem: {
    width: (width - 48) / 2,
    alignItems: "center",
    marginBottom: 16,
  },
  amenityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  amenityName: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 4,
  },
  notIncluded: {
    fontSize: 10,
    opacity: 0.5,
    fontStyle: "italic",
  },
  pricingCard: {
    padding: 16,
    borderRadius: 12,
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  pricingLabel: {
    fontSize: 16,
  },
  pricingValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 18,
    color: "#007AFF",
  },
  rulesCard: {
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
  nearbyList: {
    gap: 12,
  },
  nearbyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  nearbyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  nearbyInfo: {
    flex: 1,
  },
  nearbyName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  nearbyDistance: {
    fontSize: 14,
    opacity: 0.6,
  },
  landlordCard: {
    padding: 16,
    borderRadius: 12,
  },
  landlordHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  landlordAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  landlordInitials: {
    fontSize: 20,
    fontWeight: "bold",
  },
  landlordInfo: {
    flex: 1,
  },
  landlordNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  landlordName: {
    fontSize: 18,
    fontWeight: "600",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    opacity: 0.8,
  },
  responseTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  bottomActions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  contactButton: {
    borderWidth: 1,
    borderColor: "#007AFF40",
  },
  applyButton: {
    // backgroundColor set dynamically
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
  },
  galleryContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  galleryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  galleryTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  galleryScroll: {
    flex: 1,
  },
  galleryImage: {
    width: width,
    height: "100%",
    resizeMode: "contain",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  propertyCard: {
    padding: 16,
    borderRadius: 12,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  propertyDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  landlordPhone: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 2,
  },
  landlordEmail: {
    fontSize: 14,
    opacity: 0.8,
  },
  quickContactButtons: {
    flexDirection: "column",
    gap: 8,
  },
  quickContactButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
