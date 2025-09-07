import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

const { width } = Dimensions.get("window");

export default function SelectPropertyScreen() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Mock properties data - replace with Firebase data later
  const properties = [
    {
      id: "1",
      name: "Sunset Apartments",
      address: "123 Main St, Cebu City",
      totalRooms: 15,
      occupiedRooms: 13,
      vacantRooms: 2,
      image: null,
    },
    {
      id: "2",
      name: "Garden Villas",
      address: "456 Oak Ave, Mandaue",
      totalRooms: 8,
      occupiedRooms: 8,
      vacantRooms: 0,
      image: null,
    },
    {
      id: "3",
      name: "City Center Rooms",
      address: "789 Pine St, Cebu City",
      totalRooms: 12,
      occupiedRooms: 7,
      vacantRooms: 5,
      image: null,
    },
  ];

  const handleNext = () => {
    if (!selectedProperty) {
      Alert.alert(
        "Selection Required",
        "Please select a property to continue."
      );
      return;
    }
    router.push({
      pathname: "/landlord/billing/select-rooms",
      params: {
        propertyId: selectedProperty.id,
        propertyName: selectedProperty.name,
      },
    });
  };

  const PropertyCard = ({ property }) => {
    const isSelected = selectedProperty?.id === property.id;

    return (
      <TouchableOpacity
        style={[
          styles.propertyCard,
          {
            backgroundColor: colors.card,
            borderColor: isSelected ? colors.tint : "transparent",
            borderWidth: isSelected ? 2 : 0,
          },
        ]}
        onPress={() => setSelectedProperty(property)}
      >
        <View style={styles.propertyHeader}>
          <View
            style={[
              styles.propertyAvatar,
              { backgroundColor: colors.tint + "20" },
            ]}
          >
            <Ionicons name="business-outline" size={24} color={colors.tint} />
          </View>

          <View style={styles.propertyInfo}>
            <ThemedText style={styles.propertyName}>{property.name}</ThemedText>
            <ThemedText style={styles.propertyAddress}>
              {property.address}
            </ThemedText>
          </View>

          {isSelected && (
            <View
              style={[
                styles.selectionIndicator,
                { backgroundColor: colors.tint },
              ]}
            >
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          )}
        </View>

        <View style={styles.propertyStats}>
          <View style={styles.stat}>
            <Ionicons name="bed-outline" size={16} color={colors.text + "60"} />
            <ThemedText style={styles.statText}>
              {property.totalRooms} Rooms
            </ThemedText>
          </View>

          <View style={styles.stat}>
            <Ionicons name="people-outline" size={16} color="#34C759" />
            <ThemedText style={styles.statText}>
              {property.occupiedRooms} Occupied
            </ThemedText>
          </View>

          <View style={styles.stat}>
            <Ionicons name="home-outline" size={16} color="#007AFF" />
            <ThemedText style={styles.statText}>
              {property.vacantRooms} Vacant
            </ThemedText>
          </View>
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

        <ThemedText style={styles.headerTitle}>Select Property</ThemedText>

        <View style={styles.stepIndicator}>
          <ThemedText style={styles.stepText}>1 of 6</ThemedText>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: "16.67%" }]} />
        </View>
        <View style={styles.progressSteps}>
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <View
              key={step}
              style={[
                styles.progressStep,
                step === 1 && styles.progressStepActive,
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
            Choose Property for Billing
          </ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Select the property where you want to generate bills
          </ThemedText>
        </View>

        <View style={styles.propertiesList}>
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </View>

        {properties.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons
              name="business-outline"
              size={48}
              color={colors.text + "40"}
            />
            <ThemedText style={styles.emptyStateText}>
              No properties available
            </ThemedText>
          </View>
        )}
      </ScrollView>

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
  propertiesList: {
    gap: 16,
    paddingHorizontal: 20,
  },
  propertyCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  propertyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  propertyStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 14,
    opacity: 0.8,
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
