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
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

const { width } = Dimensions.get("window");

export default function ListingDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Mock listing data - in real app, fetch by ID
  const listing = {
    id: parseInt(id),
    title: "Cozy Single Room - Downtown",
    price: 4500,
    location: "Makati City",
    description:
      "Perfect for students and young professionals. Walking distance to MRT and major shopping centers. The room is fully furnished with modern amenities and offers a comfortable living space in the heart of the business district.",
    images: [
      "https://via.placeholder.com/400x300/4A90E2/FFFFFF?text=Room+View+1",
      "https://via.placeholder.com/400x300/7ED321/FFFFFF?text=Room+View+2",
      "https://via.placeholder.com/400x300/F5A623/FFFFFF?text=Room+View+3",
      "https://via.placeholder.com/400x300/BD10E0/FFFFFF?text=Room+View+4",
    ],
    roomNumber: "A-101",
    size: "12 sqm",
    type: "Single Room",
    floor: "2nd Floor",
    available: true,
    availableFrom: "January 15, 2025",
    landlord: {
      name: "Ms. Maria Santos",
      phone: "+63 912 345 6789",
      email: "maria.santos@email.com",
      verified: true,
      rating: 4.8,
      totalRatings: 23,
      responseTime: "Usually responds within 2 hours",
    },
    amenities: [
      { name: "WiFi Internet", icon: "wifi", included: true },
      { name: "Air Conditioning", icon: "snow", included: true },
      { name: "Private Bathroom", icon: "water", included: true },
      { name: "Study Desk", icon: "desktop", included: true },
      { name: "Closet", icon: "shirt", included: true },
      { name: "Window View", icon: "sunny", included: true },
      { name: "Parking", icon: "car", included: false },
      { name: "Laundry Service", icon: "shirt", included: false },
    ],
    rules: [
      "No smoking inside the room",
      "No pets allowed",
      "Quiet hours: 10PM - 6AM",
      "No overnight guests without prior notice",
      "Keep common areas clean",
      "Utilities to be paid separately",
    ],
    pricing: {
      monthlyRent: 4500,
      securityDeposit: 9000,
      advancePayment: 4500,
      utilities: "Separate (Approx. ₱800-1200/month)",
      totalMoveIn: 18000,
    },
    nearbyPlaces: [
      { name: "MRT Station", distance: "5 min walk", icon: "train" },
      { name: "SM Makati", distance: "10 min walk", icon: "storefront" },
      { name: "Ayala Center", distance: "15 min walk", icon: "business" },
      { name: "McDonald's", distance: "2 min walk", icon: "restaurant" },
    ],
  };

  const contactLandlord = (action = "inquire") => {
    const templates = {
      inquire: `Hi ${listing.landlord.name}, I'm interested in the ${
        listing.title
      } (${
        listing.roomNumber
      }) listed at ₱${listing.price.toLocaleString()}/month. Could you please provide more details about availability and viewing schedule? Thank you!`,
      apply: `Hi ${listing.landlord.name}, I would like to apply for the ${listing.title} (${listing.roomNumber}). I'm a responsible tenant and can provide all necessary documents. Please let me know the next steps. Thank you!`,
      schedule: `Hi ${listing.landlord.name}, I'm interested in viewing the ${listing.title} (${listing.roomNumber}). When would be a good time for a visit? I'm available most weekdays and weekends. Thank you!`,
    };

    Alert.alert(
      action === "apply" ? "Apply for Room" : "Contact Landlord",
      templates[action],
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Message",
          onPress: () => Alert.alert("Success", "Message sent to landlord!"),
        },
        {
          text: "Call Now",
          onPress: () =>
            Alert.alert("Calling", `Calling ${listing.landlord.phone}`),
        },
      ]
    );
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // In real app: save to AsyncStorage and sync with backend
  };

  const renderImageCarousel = () => (
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
        {listing.images.map((image, index) => (
          <TouchableOpacity key={index} onPress={() => setShowGallery(true)}>
            <Image source={{ uri: image }} style={styles.carouselImage} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Image Indicators */}
      <View style={styles.imageIndicators}>
        {listing.images.map((_, index) => (
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
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={24}
          color={isFavorite ? "#FF3B30" : "white"}
        />
      </TouchableOpacity>
    </View>
  );

  const GalleryModal = () => (
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
            {currentImageIndex + 1} of {listing.images.length}
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
          {listing.images.map((image, index) => (
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
                <ThemedText style={styles.roomDetailLabel}>Floor</ThemedText>
                <ThemedText style={styles.roomDetailValue}>
                  {listing.floor}
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
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Amenities</ThemedText>
            <View style={styles.amenitiesGrid}>
              {listing.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <View
                    style={[
                      styles.amenityIcon,
                      {
                        backgroundColor: amenity.included
                          ? colors.tint + "20"
                          : colors.text + "10",
                      },
                    ]}
                  >
                    <Ionicons
                      name={amenity.icon}
                      size={20}
                      color={amenity.included ? colors.tint : colors.text}
                      style={{ opacity: amenity.included ? 1 : 0.4 }}
                    />
                  </View>
                  <ThemedText
                    style={[
                      styles.amenityName,
                      { opacity: amenity.included ? 1 : 0.5 },
                    ]}
                  >
                    {amenity.name}
                  </ThemedText>
                  {!amenity.included && (
                    <ThemedText style={styles.notIncluded}>
                      Not included
                    </ThemedText>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Pricing Breakdown */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Pricing</ThemedText>
            <View
              style={[styles.pricingCard, { backgroundColor: colors.card }]}
            >
              {Object.entries(listing.pricing).map(([key, value]) => (
                <View key={key} style={styles.pricingRow}>
                  <ThemedText style={styles.pricingLabel}>
                    {key === "monthlyRent"
                      ? "Monthly Rent"
                      : key === "securityDeposit"
                      ? "Security Deposit"
                      : key === "advancePayment"
                      ? "Advance Payment"
                      : key === "utilities"
                      ? "Utilities"
                      : "Total Move-in Cost"}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.pricingValue,
                      key === "totalMoveIn" && styles.totalAmount,
                    ]}
                  >
                    {typeof value === "number"
                      ? `₱${value.toLocaleString()}`
                      : value}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>

          {/* House Rules */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>House Rules</ThemedText>
            <View style={[styles.rulesCard, { backgroundColor: colors.card }]}>
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

          {/* Nearby Places */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Nearby Places</ThemedText>
            <View style={styles.nearbyList}>
              {listing.nearbyPlaces.map((place, index) => (
                <View
                  key={index}
                  style={[styles.nearbyItem, { backgroundColor: colors.card }]}
                >
                  <View
                    style={[
                      styles.nearbyIcon,
                      { backgroundColor: colors.tint + "20" },
                    ]}
                  >
                    <Ionicons name={place.icon} size={20} color={colors.tint} />
                  </View>
                  <View style={styles.nearbyInfo}>
                    <ThemedText style={styles.nearbyName}>
                      {place.name}
                    </ThemedText>
                    <ThemedText style={styles.nearbyDistance}>
                      {place.distance}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Landlord Info */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Landlord</ThemedText>
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
                    {listing.landlord.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </ThemedText>
                </View>
                <View style={styles.landlordInfo}>
                  <View style={styles.landlordNameRow}>
                    <ThemedText style={styles.landlordName}>
                      {listing.landlord.name}
                    </ThemedText>
                    {listing.landlord.verified && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#34C759"
                      />
                    )}
                  </View>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#FFD60A" />
                    <ThemedText style={styles.rating}>
                      {listing.landlord.rating} ({listing.landlord.totalRatings}{" "}
                      reviews)
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.responseTime}>
                    {listing.landlord.responseTime}
                  </ThemedText>
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
});
