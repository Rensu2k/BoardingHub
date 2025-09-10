import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
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

export default function ListingsBrowse() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    priceRange: "all",
    roomType: "all",
    amenities: [],
    availability: "available",
  });
  const [favorites, setFavorites] = useState([]);
  const [listings, setListings] = useState([]);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Mock listings data - replace with real API data
  const allListings = [
    {
      id: 1,
      title: "Cozy Single Room - Downtown",
      price: 4500,
      location: "Makati City",
      description:
        "Perfect for students and young professionals. Walking distance to MRT.",
      images: [
        "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Room+1-1",
        "https://via.placeholder.com/300x200/7ED321/FFFFFF?text=Room+1-2",
        "https://via.placeholder.com/300x200/F5A623/FFFFFF?text=Room+1-3",
      ],
      roomNumber: "A-101",
      size: "12 sqm",
      type: "Single Room",
      available: true,
      landlord: {
        name: "Ms. Maria Santos",
        phone: "+63 912 345 6789",
        email: "maria.santos@email.com",
        verified: true,
      },
      amenities: ["WiFi", "Air Conditioning", "Private Bathroom", "Study Desk"],
      rules: [
        "No smoking inside the room",
        "No pets allowed",
        "Quiet hours: 10PM - 6AM",
        "No overnight guests without prior notice",
      ],
      deposit: 9000,
      monthlyRent: 4500,
      utilities: "Excluded",
    },
    {
      id: 2,
      title: "Spacious Studio Apartment",
      price: 7000,
      location: "Quezon City",
      description:
        "Modern studio with kitchenette. Great for couples or single professionals.",
      images: [
        "https://via.placeholder.com/300x200/BD10E0/FFFFFF?text=Studio+1",
        "https://via.placeholder.com/300x200/50E3C2/FFFFFF?text=Studio+2",
      ],
      roomNumber: "B-205",
      size: "25 sqm",
      type: "Studio",
      available: true,
      landlord: {
        name: "Mr. John Dela Cruz",
        phone: "+63 917 234 5678",
        email: "john.delacruz@email.com",
        verified: true,
      },
      amenities: [
        "WiFi",
        "Air Conditioning",
        "Kitchenette",
        "Balcony",
        "Parking",
      ],
      rules: [
        "No smoking anywhere in the building",
        "Pets allowed with deposit",
        "Quiet hours: 9PM - 7AM",
        "Maximum 2 occupants",
      ],
      deposit: 14000,
      monthlyRent: 7000,
      utilities: "Included",
    },
    {
      id: 3,
      title: "Shared Double Room",
      price: 3500,
      location: "Pasig City",
      description:
        "Looking for a roommate to share this comfortable double room.",
      images: [
        "https://via.placeholder.com/300x200/F5A623/FFFFFF?text=Double+1",
      ],
      roomNumber: "C-102",
      size: "18 sqm",
      type: "Double Room",
      available: true,
      landlord: {
        name: "Ms. Ana Reyes",
        phone: "+63 920 123 4567",
        email: "ana.reyes@email.com",
        verified: false,
      },
      amenities: ["WiFi", "Air Conditioning", "Shared Bathroom", "Common Area"],
      rules: [
        "No smoking",
        "Respect roommate's privacy",
        "Keep common areas clean",
        "No loud music after 10PM",
      ],
      deposit: 7000,
      monthlyRent: 3500,
      utilities: "Split between roommates",
    },
    {
      id: 4,
      title: "Premium Single with Balcony",
      price: 6500,
      location: "BGC, Taguig",
      description:
        "High-end single room in modern building with gym and pool access.",
      images: [
        "https://via.placeholder.com/300x200/9013FE/FFFFFF?text=Premium+1",
        "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Premium+2",
      ],
      roomNumber: "D-301",
      size: "15 sqm",
      type: "Single Room",
      available: false,
      landlord: {
        name: "Mr. Robert Tan",
        phone: "+63 918 765 4321",
        email: "robert.tan@email.com",
        verified: true,
      },
      amenities: [
        "WiFi",
        "Air Conditioning",
        "Private Bathroom",
        "Balcony",
        "Gym Access",
        "Pool Access",
      ],
      rules: [
        "No smoking",
        "No pets",
        "Building rules apply",
        "Visitors must register at lobby",
      ],
      deposit: 13000,
      monthlyRent: 6500,
      utilities: "Included",
    },
  ];

  useEffect(() => {
    // Load favorites from storage (mock implementation)
    const savedFavorites = []; // In real app: AsyncStorage.getItem('favorites')
    setFavorites(savedFavorites);

    // Apply filters
    filterListings();
  }, [searchQuery, selectedFilters]);

  const filterListings = () => {
    let filtered = allListings;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Availability filter
    if (selectedFilters.availability === "available") {
      filtered = filtered.filter((listing) => listing.available);
    }

    // Price range filter
    if (selectedFilters.priceRange !== "all") {
      const ranges = {
        "under-4000": [0, 4000],
        "4000-6000": [4000, 6000],
        "6000-8000": [6000, 8000],
        "above-8000": [8000, Infinity],
      };
      const [min, max] = ranges[selectedFilters.priceRange] || [0, Infinity];
      filtered = filtered.filter(
        (listing) => listing.price >= min && listing.price < max
      );
    }

    // Room type filter
    if (selectedFilters.roomType !== "all") {
      filtered = filtered.filter((listing) =>
        listing.type
          .toLowerCase()
          .includes(selectedFilters.roomType.toLowerCase())
      );
    }

    // Amenities filter
    if (selectedFilters.amenities.length > 0) {
      filtered = filtered.filter((listing) =>
        selectedFilters.amenities.every((amenity) =>
          listing.amenities.some((listingAmenity) =>
            listingAmenity.toLowerCase().includes(amenity.toLowerCase())
          )
        )
      );
    }

    setListings(filtered);
  };

  const refreshListings = async () => {
    console.log("Refreshing listings...");
    // Simulate API call
    filterListings();
  };

  const { refreshing, onRefresh } = usePullRefresh(refreshListings);

  const toggleFavorite = (listingId) => {
    const newFavorites = favorites.includes(listingId)
      ? favorites.filter((id) => id !== listingId)
      : [...favorites, listingId];

    setFavorites(newFavorites);
    // In real app: AsyncStorage.setItem('favorites', JSON.stringify(newFavorites))
  };

  const contactLandlord = (listing) => {
    const template = `Hi ${listing.landlord.name}, I'm interested in the ${
      listing.title
    } (${
      listing.roomNumber
    }) listed at ₱${listing.price.toLocaleString()}/month. Could you please provide more details about availability and viewing schedule? Thank you!`;

    Alert.alert("Contact Landlord", template, [
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
    ]);
  };

  const renderListingCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.listingCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/tenant/browse/listing-detail/${item.id}`)}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.images[0] }} style={styles.listingImage} />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item.id)}
        >
          <Ionicons
            name={favorites.includes(item.id) ? "heart" : "heart-outline"}
            size={20}
            color={favorites.includes(item.id) ? "#FF3B30" : "white"}
          />
        </TouchableOpacity>
        {!item.available && (
          <View style={styles.occupiedBadge}>
            <ThemedText style={styles.occupiedText}>Occupied</ThemedText>
          </View>
        )}
      </View>

      <View style={styles.listingContent}>
        <View style={styles.listingHeader}>
          <ThemedText style={styles.listingTitle}>{item.title}</ThemedText>
          <ThemedText style={styles.listingPrice}>
            ₱{item.price.toLocaleString()}/mo
          </ThemedText>
        </View>

        <View style={styles.listingLocation}>
          <Ionicons
            name="location-outline"
            size={14}
            color={colors.text}
            style={{ opacity: 0.6 }}
          />
          <ThemedText style={styles.locationText}>{item.location}</ThemedText>
        </View>

        <ThemedText style={styles.listingDescription} numberOfLines={2}>
          {item.description}
        </ThemedText>

        <View style={styles.listingFooter}>
          <View style={styles.landlordInfo}>
            <Ionicons
              name="person-circle-outline"
              size={16}
              color={colors.text}
            />
            <ThemedText style={styles.landlordName}>
              {item.landlord.name}
            </ThemedText>
            {item.landlord.verified && (
              <Ionicons name="checkmark-circle" size={14} color="#34C759" />
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.contactButton,
              { backgroundColor: colors.tint + "20" },
            ]}
            onPress={() => contactLandlord(item)}
          >
            <Ionicons name="chatbubble-outline" size={14} color={colors.tint} />
            <ThemedText style={[styles.contactText, { color: colors.tint }]}>
              Contact
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Memoized filter handlers to prevent re-renders
  const handlePriceRangeChange = useCallback((range) => {
    setSelectedFilters((prev) => ({ ...prev, priceRange: range }));
  }, []);

  const handleRoomTypeChange = useCallback((type) => {
    setSelectedFilters((prev) => ({ ...prev, roomType: type }));
  }, []);

  const handleAmenityToggle = useCallback((amenity) => {
    setSelectedFilters((prev) => {
      const newAmenities = prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities: newAmenities };
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedFilters({
      priceRange: "all",
      roomType: "all",
      amenities: [],
      availability: "available",
    });
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowFilters(false);
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Browse Listings</ThemedText>
          <TouchableOpacity
            style={styles.favoriteHeaderButton}
            onPress={() =>
              Alert.alert("Favorites", "View saved listings coming soon!")
            }
          >
            <Ionicons name="heart" size={24} color="#FF3B30" />
            {favorites.length > 0 && (
              <View style={styles.favoriteBadge}>
                <ThemedText style={styles.favoriteBadgeText}>
                  {favorites.length}
                </ThemedText>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* Search & Filter Bar */}
      <ThemedView style={styles.searchSection}>
        <View style={styles.searchBar}>
          <View style={[styles.searchInput, { backgroundColor: colors.card }]}>
            <Ionicons
              name="search"
              size={20}
              color={colors.text}
              style={{ opacity: 0.5 }}
            />
            <TextInput
              style={[styles.searchText, { color: colors.text }]}
              placeholder="Search by location, title..."
              placeholderTextColor={colors.text + "50"}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: colors.tint }]}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="options" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Active Filters */}
        {(selectedFilters.priceRange !== "all" ||
          selectedFilters.roomType !== "all" ||
          selectedFilters.amenities.length > 0) && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.activeFilters}
          >
            {selectedFilters.priceRange !== "all" && (
              <View
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.tint + "20" },
                ]}
              >
                <ThemedText
                  style={[styles.filterChipText, { color: colors.tint }]}
                >
                  {selectedFilters.priceRange
                    .replace("-", " - ₱")
                    .replace("under", "Under ₱")
                    .replace("above", "Above ₱")}
                </ThemedText>
              </View>
            )}
            {selectedFilters.roomType !== "all" && (
              <View
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.tint + "20" },
                ]}
              >
                <ThemedText
                  style={[styles.filterChipText, { color: colors.tint }]}
                >
                  {selectedFilters.roomType.charAt(0).toUpperCase() +
                    selectedFilters.roomType.slice(1)}
                </ThemedText>
              </View>
            )}
            {selectedFilters.amenities.map((amenity) => (
              <View
                key={amenity}
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.tint + "20" },
                ]}
              >
                <ThemedText
                  style={[styles.filterChipText, { color: colors.tint }]}
                >
                  {amenity}
                </ThemedText>
              </View>
            ))}
          </ScrollView>
        )}
      </ThemedView>

      {/* Results */}
      <FlatList
        data={listings}
        renderItem={renderListingCard}
        keyExtractor={(item) => item.id.toString()}
        style={styles.listingsContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="home-outline"
              size={64}
              color={colors.text}
              style={{ opacity: 0.3 }}
            />
            <ThemedText style={styles.emptyTitle}>No listings found</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Try adjusting your search or filters
            </ThemedText>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      <FilterModal
        visible={showFilters}
        onClose={handleCloseModal}
        selectedFilters={selectedFilters}
        onPriceRangeChange={handlePriceRangeChange}
        onRoomTypeChange={handleRoomTypeChange}
        onAmenityToggle={handleAmenityToggle}
        onClearFilters={handleClearFilters}
        colors={colors}
        listingsCount={listings.length}
      />
    </SafeAreaView>
  );
}

// Separate FilterModal component to prevent re-renders
const FilterModal = ({
  visible,
  onClose,
  selectedFilters,
  onPriceRangeChange,
  onRoomTypeChange,
  onAmenityToggle,
  onClearFilters,
  colors,
  listingsCount,
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    presentationStyle="pageSheet"
    onRequestClose={onClose}
  >
    <SafeAreaView
      style={[styles.modalContainer, { backgroundColor: colors.background }]}
    >
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose}>
          <ThemedText style={[styles.modalAction, { color: colors.text }]}>
            Cancel
          </ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.modalTitle}>Filters</ThemedText>
        <TouchableOpacity onPress={onClearFilters}>
          <ThemedText style={[styles.modalAction, { color: colors.tint }]}>
            Clear
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.filterContent}>
        {/* Price Range */}
        <View style={styles.filterSection}>
          <ThemedText style={styles.filterTitle}>Price Range</ThemedText>
          {["all", "under-4000", "4000-6000", "6000-8000", "above-8000"].map(
            (range) => (
              <TouchableOpacity
                key={range}
                style={styles.filterOption}
                onPress={() => onPriceRangeChange(range)}
              >
                <ThemedText style={styles.filterOptionText}>
                  {range === "all"
                    ? "All Prices"
                    : range === "under-4000"
                    ? "Under ₱4,000"
                    : range === "4000-6000"
                    ? "₱4,000 - ₱6,000"
                    : range === "6000-8000"
                    ? "₱6,000 - ₱8,000"
                    : "Above ₱8,000"}
                </ThemedText>
                <Ionicons
                  name={
                    selectedFilters.priceRange === range
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={20}
                  color={colors.tint}
                />
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Room Type */}
        <View style={styles.filterSection}>
          <ThemedText style={styles.filterTitle}>Room Type</ThemedText>
          {["all", "single", "double", "studio"].map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.filterOption}
              onPress={() => onRoomTypeChange(type)}
            >
              <ThemedText style={styles.filterOptionText}>
                {type === "all"
                  ? "All Types"
                  : type.charAt(0).toUpperCase() + type.slice(1) + " Room"}
              </ThemedText>
              <Ionicons
                name={
                  selectedFilters.roomType === type
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={20}
                color={colors.tint}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Amenities */}
        <View style={styles.filterSection}>
          <ThemedText style={styles.filterTitle}>Amenities</ThemedText>
          {[
            "WiFi",
            "Air Conditioning",
            "Private Bathroom",
            "Parking",
            "Gym Access",
          ].map((amenity) => (
            <TouchableOpacity
              key={amenity}
              style={styles.filterOption}
              onPress={() => onAmenityToggle(amenity)}
            >
              <ThemedText style={styles.filterOptionText}>{amenity}</ThemedText>
              <Ionicons
                name={
                  selectedFilters.amenities.includes(amenity)
                    ? "checkbox"
                    : "square-outline"
                }
                size={20}
                color={colors.tint}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.modalFooter}>
        <TouchableOpacity
          style={[styles.applyButton, { backgroundColor: colors.tint }]}
          onPress={onClose}
        >
          <ThemedText style={styles.applyButtonText}>
            Apply Filters ({listingsCount} results)
          </ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  </Modal>
);

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
  favoriteHeaderButton: {
    position: "relative",
  },
  favoriteBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  searchSection: {
    padding: 16,
    paddingTop: 0,
  },
  searchBar: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchText: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeFilters: {
    flexDirection: "row",
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  listingsContainer: {
    flex: 1,
    padding: 16,
  },
  listingCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
  },
  listingImage: {
    width: "100%",
    height: 200,
  },
  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  occupiedBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "#FF950090",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  occupiedText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  listingContent: {
    padding: 16,
  },
  listingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    marginRight: 12,
  },
  listingPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
  },
  listingLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    opacity: 0.6,
  },
  listingDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    marginBottom: 12,
  },
  listingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  landlordInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  landlordName: {
    fontSize: 14,
    flex: 1,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  contactText: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalAction: {
    fontSize: 16,
    fontWeight: "500",
  },
  filterContent: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  filterOptionText: {
    fontSize: 16,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
  },
  applyButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
