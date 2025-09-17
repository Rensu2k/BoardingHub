import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Dimensions,
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
import { deleteProperty, getUserProperties } from "@/utils/propertyHelpers";

const { width } = Dimensions.get("window");

export default function PropertiesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const loadProperties = async () => {
    try {
      setLoading(true);
      const userProperties = await getUserProperties();
      setProperties(userProperties);
    } catch (error) {
      console.error("Error loading properties:", error);
      Alert.alert("Error", "Failed to load properties. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProperties();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadProperties();
    }, [])
  );

  const handleDeleteProperty = async (propertyId, propertyName, property) => {
    // Check if property has occupied rooms before showing delete confirmation
    if (property.occupied > 0) {
      Alert.alert(
        "Cannot Delete Property",
        `"${propertyName}" cannot be deleted because it has ${property.occupied} occupied room(s). Please move out all tenants before deleting the property.`,
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Delete Property",
      `Are you sure you want to delete "${propertyName}"?\n\nThis will also delete all ${
        property.totalRooms || 0
      } room(s) in this property.\n\nThis action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProperty(propertyId);
              await loadProperties(); // Refresh the list
              Alert.alert("Success", "Property deleted successfully");
            } catch (error) {
              console.error("Error deleting property:", error);

              // Show specific error message for better user experience
              const errorMessage = error.message.includes("occupied")
                ? error.message
                : "Failed to delete property. Please try again.";

              Alert.alert("Error", errorMessage);
            }
          },
        },
      ]
    );
  };

  const getFilteredProperties = () => {
    switch (activeFilter) {
      case "Active":
        return properties.filter((p) => p.status === "active");
      case "Full":
        return properties.filter((p) => p.vacancies === 0);
      case "Vacancies":
        return properties.filter((p) => p.vacancies > 0);
      default:
        return properties;
    }
  };

  const filteredProperties = getFilteredProperties();

  const PropertyCard = ({ property }) => (
    <TouchableOpacity
      style={[styles.propertyCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/landlord/property-details/${property.id}`)}
    >
      {/* Property Image Placeholder */}
      <View
        style={[styles.propertyImage, { backgroundColor: colors.tint + "20" }]}
      >
        <Ionicons name="business-outline" size={40} color={colors.tint} />
      </View>

      <View style={styles.propertyInfo}>
        <ThemedText style={styles.propertyName}>{property.name}</ThemedText>
        <ThemedText style={styles.propertyAddress}>
          {property.address}
        </ThemedText>

        <View style={styles.propertyStats}>
          <View style={[styles.statChip, { backgroundColor: "#34C75920" }]}>
            <ThemedText style={[styles.statText, { color: "#34C759" }]}>
              {property.occupied}/{property.totalRooms} Occupied
            </ThemedText>
          </View>
          {property.vacancies > 0 && (
            <View style={[styles.statChip, { backgroundColor: "#FF950020" }]}>
              <ThemedText style={[styles.statText, { color: "#FF9500" }]}>
                {property.vacancies} Vacant
              </ThemedText>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.overflowMenu}
        onPress={() =>
          Alert.alert("Property Actions", "Choose an action", [
            {
              text: "Edit",
              onPress: () =>
                router.push(`/landlord/edit-property/${property.id}`),
            },
            {
              text: "Delete",
              style: "destructive",
              onPress: () =>
                handleDeleteProperty(property.id, property.name, property),
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ])
        }
      >
        <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Properties</ThemedText>
          <TouchableOpacity
            style={[
              styles.notificationButton,
              { backgroundColor: colors.tint + "20" },
            ]}
            onPress={() => router.push("/landlord/notifications")}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.tint}
            />
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>2</ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar Placeholder */}
        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: colors.card }]}
          onPress={() =>
            Alert.alert("Coming Soon", "Search functionality coming soon!")
          }
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.text + "60"}
          />
          <ThemedText
            style={[styles.searchText, { color: colors.text + "60" }]}
          >
            Search properties...
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {["All", "Active", "Full", "Vacancies"].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                {
                  backgroundColor:
                    filter === activeFilter ? colors.tint : colors.card,
                },
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <ThemedText
                style={[
                  styles.filterTabText,
                  { color: filter === activeFilter ? "white" : colors.text },
                ]}
              >
                {filter}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Properties List */}
        <ThemedView style={styles.propertiesSection}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ThemedText style={styles.loadingText}>
                Loading properties...
              </ThemedText>
            </View>
          ) : filteredProperties.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="business-outline"
                size={64}
                color={colors.text + "40"}
              />
              <ThemedText style={styles.emptyTitle}>
                No Properties Found
              </ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                {properties.length === 0
                  ? "Add your first property to get started"
                  : "No properties match the selected filter"}
              </ThemedText>
              {properties.length === 0 && (
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: colors.tint }]}
                  onPress={() => router.push("/landlord/add-property")}
                >
                  <ThemedText style={styles.addButtonText}>
                    Add Property
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.propertiesList}>
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </View>
          )}
        </ThemedView>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={() => router.push("/landlord/add-property")}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchText: {
    fontSize: 16,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  filterTabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 20,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  propertiesSection: {
    paddingHorizontal: 20,
  },
  propertiesList: {
    gap: 16,
  },
  propertyCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  propertyInfo: {
    flex: 1,
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
  propertyStats: {
    flexDirection: "row",
    gap: 8,
  },
  statChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statText: {
    fontSize: 12,
    fontWeight: "500",
  },
  overflowMenu: {
    padding: 8,
  },
  fab: {
    position: "absolute",
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 24,
  },
  addButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
