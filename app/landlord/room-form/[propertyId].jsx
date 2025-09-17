import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { addRoom, getRoomById, updateRoom } from "@/utils/roomHelpers";

const { width } = Dimensions.get("window");

const FormField = ({ label, children, required = false, error }) => (
  <View style={styles.formField}>
    <View style={styles.fieldHeader}>
      <ThemedText style={styles.fieldLabel}>
        {label}
        {required && <ThemedText style={styles.required}> *</ThemedText>}
      </ThemedText>
    </View>
    {children}
    {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
  </View>
);

const UtilityField = ({
  utility,
  config,
  utilityName,
  colors,
  updateUtility,
  errors,
}) => (
  <View style={styles.utilityField}>
    <ThemedText style={styles.utilityName}>
      {utilityName.charAt(0).toUpperCase() + utilityName.slice(1)}
    </ThemedText>

    <View style={styles.utilityTypeSelector}>
      <TouchableOpacity
        style={[
          styles.typeButton,
          config.type === "free" && { backgroundColor: "#34C759" },
        ]}
        onPress={() => updateUtility(utility, "type", "free")}
      >
        <ThemedText
          style={[
            styles.typeButtonText,
            config.type === "free" && { color: "white" },
          ]}
        >
          Free
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.typeButton,
          config.type === "flat" && { backgroundColor: colors.tint },
        ]}
        onPress={() => updateUtility(utility, "type", "flat")}
      >
        <ThemedText
          style={[
            styles.typeButtonText,
            config.type === "flat" && { color: "white" },
          ]}
        >
          Flat Rate
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.typeButton,
          config.type === "per-tenant" && { backgroundColor: colors.tint },
        ]}
        onPress={() => updateUtility(utility, "type", "per-tenant")}
      >
        <ThemedText
          style={[
            styles.typeButtonText,
            config.type === "per-tenant" && { color: "white" },
          ]}
        >
          Per Usage
        </ThemedText>
      </TouchableOpacity>
    </View>

    {config.type !== "free" && (
      <View style={styles.utilityInput}>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.card, color: colors.text },
          ]}
          placeholder={config.type === "flat" ? "Amount (₱)" : "Rate (₱)"}
          placeholderTextColor={colors.text + "60"}
          value={config.type === "flat" ? config.amount : config.rate}
          onChangeText={(value) =>
            updateUtility(
              utility,
              config.type === "flat" ? "amount" : "rate",
              value
            )
          }
          keyboardType="numeric"
        />
        <ThemedText style={styles.unitText}>
          {config.type === "flat"
            ? "₱/month"
            : utility === "electricity"
            ? "₱/kWh"
            : "₱/unit"}
        </ThemedText>
      </View>
    )}

    {config.type === "free" && (
      <View style={styles.freeUtilityIndicator}>
        <Ionicons name="checkmark-circle" size={20} color="#34C759" />
        <ThemedText style={styles.freeUtilityText}>
          This utility is included at no extra charge
        </ThemedText>
      </View>
    )}

    {errors[
      `utilities.${utility}.${config.type === "flat" ? "amount" : "rate"}`
    ] && (
      <ThemedText style={styles.errorText}>
        {
          errors[
            `utilities.${utility}.${config.type === "flat" ? "amount" : "rate"}`
          ]
        }
      </ThemedText>
    )}
  </View>
);

export default function RoomFormScreen() {
  const router = useRouter();
  const { propertyId, roomId } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const isEditing = !!roomId;

  // Request permissions on component mount
  useEffect(() => {
    const requestPermissions = async () => {
      await ImagePicker.requestCameraPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    };
    requestPermissions();
  }, []);

  // Load existing room data when editing
  useEffect(() => {
    const loadRoomData = async () => {
      if (isEditing && roomId) {
        try {
          setIsLoading(true);
          const roomData = await getRoomById(roomId);

          // Populate form with existing data
          setFormData({
            number: roomData.number || "",
            type: roomData.type || "Studio",
            rent: roomData.rent ? roomData.rent.toString() : "",
            status: roomData.status || "vacant",
            utilities: {
              electricity: {
                type: roomData.utilities?.electricity?.type || "per-tenant",
                rate: roomData.utilities?.electricity?.rate
                  ? roomData.utilities.electricity.rate.toString()
                  : "12",
                amount: roomData.utilities?.electricity?.amount
                  ? roomData.utilities.electricity.amount.toString()
                  : "",
              },
              water: {
                type: roomData.utilities?.water?.type || "flat",
                rate: roomData.utilities?.water?.rate
                  ? roomData.utilities.water.rate.toString()
                  : "",
                amount: roomData.utilities?.water?.amount
                  ? roomData.utilities.water.amount.toString()
                  : "200",
              },
              wifi: {
                type: roomData.utilities?.wifi?.type || "flat",
                rate: roomData.utilities?.wifi?.rate
                  ? roomData.utilities.wifi.rate.toString()
                  : "",
                amount: roomData.utilities?.wifi?.amount
                  ? roomData.utilities.wifi.amount.toString()
                  : "500",
              },
            },
            meterIds: {
              electricity: roomData.meterIds?.electricity || "",
              water: roomData.meterIds?.water || "",
            },
            photos: roomData.photos || [],
            notes: roomData.notes || "",
          });
        } catch (error) {
          console.error("Error loading room data:", error);
          Alert.alert("Error", "Failed to load room data. Please try again.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadRoomData();
  }, [isEditing, roomId]);

  // Form state
  const [formData, setFormData] = useState({
    number: "",
    type: "Studio",
    rent: "",
    status: "vacant",
    utilities: {
      electricity: { type: "per-tenant", rate: "12", amount: "" },
      water: { type: "flat", rate: "", amount: "200" },
      wifi: { type: "flat", rate: "", amount: "500" },
    },
    meterIds: {
      electricity: "",
      water: "",
    },
    photos: [],
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const roomTypes = ["Studio", "1BR", "2BR", "3BR", "Shared Room"];
  const statusOptions = ["vacant", "occupied", "maintenance"];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.number.trim()) {
      newErrors.number = "Room number is required";
    }

    if (
      !formData.rent ||
      isNaN(parseFloat(formData.rent)) ||
      parseFloat(formData.rent) <= 0
    ) {
      newErrors.rent = "Valid rent amount is required";
    }

    // Validate utility rates
    Object.entries(formData.utilities).forEach(([utility, config]) => {
      if (config.type === "per-tenant") {
        if (
          !config.rate ||
          isNaN(parseFloat(config.rate)) ||
          parseFloat(config.rate) <= 0
        ) {
          newErrors[
            `utilities.${utility}.rate`
          ] = `Valid ${utility} rate is required`;
        }
      } else if (config.type === "flat") {
        if (
          !config.amount ||
          isNaN(parseFloat(config.amount)) ||
          parseFloat(config.amount) <= 0
        ) {
          newErrors[
            `utilities.${utility}.amount`
          ] = `Valid ${utility} amount is required`;
        }
      }
      // No validation needed for "free" type
    });

    // Validate meter IDs (only for non-free utilities)
    Object.entries(formData.meterIds).forEach(([utility, meterId]) => {
      const utilityConfig = formData.utilities[utility];
      if (utilityConfig && utilityConfig.type !== "free" && !meterId.trim()) {
        newErrors[`meterIds.${utility}`] = `${
          utility.charAt(0).toUpperCase() + utility.slice(1)
        } meter ID is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert(
        "Validation Error",
        "Please fix the errors before submitting."
      );
      return;
    }

    setIsLoading(true);

    try {
      // Prepare room data for Firebase
      const roomData = {
        ...formData,
        rent: parseFloat(formData.rent),
        utilities: Object.fromEntries(
          Object.entries(formData.utilities).map(([utility, config]) => [
            utility,
            {
              type: config.type,
              ...(config.type === "flat" && {
                amount: parseFloat(config.amount),
              }),
              ...(config.type === "per-tenant" && {
                rate: parseFloat(config.rate),
              }),
            },
          ])
        ),
        // Only include meter IDs for non-free utilities
        meterIds: Object.fromEntries(
          Object.entries(formData.meterIds).filter(
            ([utility]) => formData.utilities[utility]?.type !== "free"
          )
        ),
      };

      if (isEditing) {
        await updateRoom(roomId, roomData);
      } else {
        await addRoom(propertyId, roomData);
      }

      Alert.alert(
        "Success",
        `Room ${isEditing ? "updated" : "created"} successfully!`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error("Error saving room:", error);
      Alert.alert("Error", "Failed to save room. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = () => {
    Alert.alert("Add Photo", "Choose photo source", [
      { text: "Camera", onPress: openCamera },
      { text: "Gallery", onPress: openGallery },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const openCamera = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Camera access is required to take photos. Please enable camera permissions in your device settings."
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
      console.error("Error opening camera:", error);
      Alert.alert("Error", "Failed to open camera. Please try again.");
    }
  };

  const openGallery = async () => {
    try {
      // Request media library permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Photo library access is required to select photos. Please enable photo permissions in your device settings."
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
      console.error("Error opening gallery:", error);
      Alert.alert("Error", "Failed to open gallery. Please try again.");
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

  const updateUtility = useCallback((utility, field, value) => {
    setFormData((prev) => ({
      ...prev,
      utilities: {
        ...prev.utilities,
        [utility]: {
          ...prev.utilities[utility],
          [field]: value,
        },
      },
    }));
  }, []);

  const updateMeterId = useCallback((utility, value) => {
    setFormData((prev) => ({
      ...prev,
      meterIds: {
        ...prev.meterIds,
        [utility]: value,
      },
    }));
  }, []);

  const updateFormField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <ThemedText style={styles.headerTitle}>
            {isEditing ? "Edit Room" : "Create Room"}
          </ThemedText>

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: colors.tint },
              isLoading && { opacity: 0.6 },
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <ThemedText style={styles.saveButtonText}>
              {isLoading ? "Saving..." : "Save"}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Loading indicator when fetching room data */}
        {isLoading && isEditing && (
          <View style={styles.loadingContainer}>
            <ThemedText style={styles.loadingText}>
              Loading room data...
            </ThemedText>
          </View>
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Information */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Basic Information
            </ThemedText>

            <FormField label="Room Number" required error={errors.number}>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.card, color: colors.text },
                ]}
                placeholder="e.g., 101, A1, etc."
                placeholderTextColor={colors.text + "60"}
                value={formData.number}
                onChangeText={(value) => updateFormField("number", value)}
              />
            </FormField>

            <FormField label="Room Type" required>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.typeSelector}>
                  {roomTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeChip,
                        formData.type === type && {
                          backgroundColor: colors.tint,
                        },
                      ]}
                      onPress={() => updateFormField("type", type)}
                    >
                      <ThemedText
                        style={[
                          styles.typeChipText,
                          formData.type === type && { color: "white" },
                        ]}
                      >
                        {type}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </FormField>

            <FormField label="Monthly Rent" required error={errors.rent}>
              <View style={styles.inputWithPrefix}>
                <ThemedText style={styles.currencyPrefix}>₱</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    styles.inputWithPrefixInput,
                    { backgroundColor: colors.card, color: colors.text },
                  ]}
                  placeholder="0"
                  placeholderTextColor={colors.text + "60"}
                  value={formData.rent}
                  onChangeText={(value) => updateFormField("rent", value)}
                  keyboardType="numeric"
                />
              </View>
            </FormField>

            <FormField label="Status" required>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.typeSelector}>
                  {statusOptions.map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.typeChip,
                        formData.status === status && {
                          backgroundColor: colors.tint,
                        },
                      ]}
                      onPress={() => updateFormField("status", status)}
                    >
                      <ThemedText
                        style={[
                          styles.typeChipText,
                          formData.status === status && { color: "white" },
                        ]}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </FormField>
          </View>

          {/* Utilities */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Utilities</ThemedText>

            {Object.entries(formData.utilities).map(([utility, config]) => (
              <UtilityField
                key={utility}
                utility={utility}
                config={config}
                utilityName={utility}
                colors={colors}
                updateUtility={updateUtility}
                errors={errors}
              />
            ))}
          </View>

          {/* Meter IDs */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Meter IDs</ThemedText>

            {Object.entries(formData.meterIds).map(([utility, meterId]) => (
              <FormField
                key={utility}
                label={`${
                  utility.charAt(0).toUpperCase() + utility.slice(1)
                } Meter ID`}
                required
                error={errors[`meterIds.${utility}`]}
              >
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.card, color: colors.text },
                  ]}
                  placeholder={`Enter ${utility} meter ID`}
                  placeholderTextColor={colors.text + "60"}
                  value={meterId}
                  onChangeText={(value) => updateMeterId(utility, value)}
                />
              </FormField>
            ))}
          </View>

          {/* Photos */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Photos</ThemedText>

            <TouchableOpacity
              style={[
                styles.photoUploadButton,
                { backgroundColor: colors.card },
              ]}
              onPress={handlePhotoUpload}
            >
              <Ionicons name="camera" size={24} color={colors.tint} />
              <ThemedText style={styles.photoUploadText}>Add Photos</ThemedText>
            </TouchableOpacity>

            {formData.photos.length > 0 && (
              <View style={styles.photoPreview}>
                {formData.photos.map((photo, index) => (
                  <View key={index} style={styles.photoItem}>
                    <Image
                      source={{ uri: photo }}
                      style={styles.photoThumbnail}
                    />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => removePhoto(index)}
                    >
                      <Ionicons name="close-circle" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <FormField label="Notes">
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { backgroundColor: colors.card, color: colors.text },
                ]}
                placeholder="Add any additional notes about this room..."
                placeholderTextColor={colors.text + "60"}
                value={formData.notes}
                onChangeText={(value) => updateFormField("notes", value)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </FormField>
          </View>
        </ScrollView>
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
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  formField: {
    marginBottom: 16,
  },
  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  required: {
    color: "#FF3B30",
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  inputWithPrefix: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  inputWithPrefixInput: {
    flex: 1,
  },
  textArea: {
    height: 80,
  },
  typeSelector: {
    flexDirection: "row",
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  utilityField: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
  },
  utilityName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  utilityTypeSelector: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    alignItems: "center",
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  utilityInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  unitText: {
    fontSize: 14,
    opacity: 0.7,
  },
  photoUploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E5E7",
    borderStyle: "dashed",
    gap: 8,
  },
  photoUploadText: {
    fontSize: 16,
    fontWeight: "500",
  },
  photoPreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },
  photoItem: {
    position: "relative",
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: "absolute",
    top: -8,
    right: -8,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginTop: 4,
  },
  freeUtilityIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#E8F5E8",
    borderRadius: 8,
    marginTop: 8,
  },
  freeUtilityText: {
    fontSize: 14,
    color: "#34C759",
    fontWeight: "500",
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
});
