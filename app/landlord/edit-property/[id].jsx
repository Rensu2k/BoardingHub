import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
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
import { getUserProperties, updateProperty } from "@/utils/propertyHelpers";

const { width } = Dimensions.get("window");

const InputField = ({ label, value, onChangeText, placeholder, keyboardType = "default", multiline = false, colors }) => (
  <View style={styles.inputContainer}>
    <ThemedText style={styles.inputLabel}>{label}</ThemedText>
    <TextInput
      style={[
        styles.textInput,
        { 
          backgroundColor: colors.card, 
          color: colors.text,
          height: multiline ? 80 : 50,
        }
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.text + "60"}
      keyboardType={keyboardType}
      multiline={multiline}
      textAlignVertical={multiline ? "top" : "center"}
    />
  </View>
);

export default function EditPropertyScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    totalRooms: "",
    amenities: [],
    propertyType: "Apartment",
    contactNumber: "",
    rules: "",
    photos: [],
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Request permissions on component mount
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        console.log('Camera or media library permissions not granted');
      }
    })();
  }, []);

  const propertyTypes = ["Apartment", "House", "Condo", "Boarding House", "Studio"];
  const availableAmenities = [
    "WiFi",
    "Air Conditioning",
    "Parking",
    "Laundry",
    "Kitchen",
    "Security",
    "Gym",
    "Pool",
    "Garden",
    "Balcony",
  ];

  useEffect(() => {
    loadPropertyData();
  }, [id]);

  const loadPropertyData = async () => {
    try {
      setInitialLoading(true);
      const properties = await getUserProperties();
      const property = properties.find(p => p.id === id);
      
      if (property) {
        setFormData({
          name: property.name || "",
          address: property.address || "",
          description: property.description || "",
          totalRooms: property.totalRooms?.toString() || "",
          amenities: property.amenities || [],
          propertyType: property.propertyType || "Apartment",
          contactNumber: property.contactNumber || "",
          rules: property.rules || "",
          photos: property.photos || [],
        });
      } else {
        Alert.alert("Error", "Property not found", [
          { text: "OK", onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error("Error loading property:", error);
      Alert.alert("Error", "Failed to load property data", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleAmenity = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  // Photo upload functions
  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable camera access in your device settings to take photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        addPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const openGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable photo library access in your device settings to select photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        addPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
    }
  };

  const addPhoto = (uri) => {
    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, uri],
    }));
  };

  const removePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const showImagePicker = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Property name is required");
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert("Error", "Address is required");
      return false;
    }
    if (!formData.totalRooms || isNaN(formData.totalRooms) || parseInt(formData.totalRooms) <= 0) {
      Alert.alert("Error", "Please enter a valid number of rooms");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updateData = {
        ...formData,
        totalRooms: parseInt(formData.totalRooms),
        updatedAt: new Date(),
      };

      await updateProperty(id, updateData);
      
      Alert.alert(
        "Success",
        "Property updated successfully!",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error("Error updating property:", error);
      Alert.alert("Error", "Failed to update property. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedView style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Edit Property</ThemedText>
          <View style={styles.placeholder} />
        </ThemedView>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading property data...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Edit Property</ThemedText>
        <View style={styles.placeholder} />
      </ThemedView>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <ThemedView style={styles.formContainer}>
            {/* Basic Information */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Basic Information</ThemedText>
              
              <InputField
                label="Property Name *"
                value={formData.name}
                onChangeText={(value) => handleInputChange("name", value)}
                placeholder="Enter property name"
                colors={colors}
              />

              <InputField
                label="Address *"
                value={formData.address}
                onChangeText={(value) => handleInputChange("address", value)}
                placeholder="Enter full address"
                multiline
                colors={colors}
              />

              <InputField
                label="Description"
                value={formData.description}
                onChangeText={(value) => handleInputChange("description", value)}
                placeholder="Brief description of the property"
                multiline
                colors={colors}
              />

              {/* Photo Upload Section */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Property Photos</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
                  {formData.photos.map((photo, index) => (
                    <View key={index} style={styles.photoContainer}>
                      <Image source={{ uri: photo }} style={styles.photoPreview} />
                      <TouchableOpacity
                        style={styles.removePhotoButton}
                        onPress={() => removePhoto(index)}
                      >
                        <Ionicons name="close-circle" size={24} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={[styles.addPhotoButton, { borderColor: colors.text + "40" }]}
                    onPress={showImagePicker}
                  >
                    <Ionicons name="camera" size={32} color={colors.text + "60"} />
                    <ThemedText style={[styles.addPhotoText, { color: colors.text + "60" }]}>
                      Add Photo
                    </ThemedText>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Property Type</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
                  {propertyTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeChip,
                        {
                          backgroundColor: formData.propertyType === type ? colors.tint : colors.card,
                        },
                      ]}
                      onPress={() => handleInputChange("propertyType", type)}
                    >
                      <ThemedText
                        style={[
                          styles.typeChipText,
                          { color: formData.propertyType === type ? "white" : colors.text },
                        ]}
                      >
                        {type}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Room Information */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Room Information</ThemedText>
              
              <InputField
                label="Total Rooms *"
                value={formData.totalRooms}
                onChangeText={(value) => handleInputChange("totalRooms", value)}
                placeholder="Enter number of rooms"
                keyboardType="numeric"
                colors={colors}
              />
            </View>

            {/* Amenities */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Amenities</ThemedText>
              <View style={styles.amenitiesGrid}>
                {availableAmenities.map((amenity) => (
                  <TouchableOpacity
                    key={amenity}
                    style={[
                      styles.amenityChip,
                      {
                        backgroundColor: formData.amenities.includes(amenity) ? colors.tint : colors.card,
                        borderColor: formData.amenities.includes(amenity) ? colors.tint : colors.text + "20",
                      },
                    ]}
                    onPress={() => toggleAmenity(amenity)}
                  >
                    <ThemedText
                      style={[
                        styles.amenityText,
                        { color: formData.amenities.includes(amenity) ? "white" : colors.text },
                      ]}
                    >
                      {amenity}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Contact & Rules */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Additional Information</ThemedText>
              
              <InputField
                label="Contact Number"
                value={formData.contactNumber}
                onChangeText={(value) => handleInputChange("contactNumber", value)}
                placeholder="Enter contact number"
                keyboardType="phone-pad"
                colors={colors}
              />

              <InputField
                label="House Rules"
                value={formData.rules}
                onChangeText={(value) => handleInputChange("rules", value)}
                placeholder="Enter house rules and policies"
                multiline
                colors={colors}
              />
            </View>
          </ThemedView>
        </ScrollView>

        {/* Submit Button */}
        <ThemedView style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              { 
                backgroundColor: colors.tint,
                opacity: loading ? 0.7 : 1,
              },
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <ThemedText style={styles.submitButtonText}>
              {loading ? "Updating Property..." : "Update Property"}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </KeyboardAvoidingView>
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
    padding: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  placeholder: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  formContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  textInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  row: {
    flexDirection: "row",
  },
  typeScroll: {
    flexDirection: "row",
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  amenityChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 14,
    fontWeight: "500",
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 16,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  photoScroll: {
    flexDirection: "row",
  },
  photoContainer: {
    position: "relative",
    marginRight: 12,
  },
  photoPreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "white",
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  addPhotoText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
});
