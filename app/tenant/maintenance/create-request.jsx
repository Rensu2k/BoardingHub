import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Modal,
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

export default function CreateMaintenanceRequest() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [preferredTime, setPreferredTime] = useState("");
  const [photos, setPhotos] = useState([]);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const priorities = [
    {
      id: "low",
      label: "Low",
      color: "#34C759",
      description: "Non-urgent, can wait",
    },
    {
      id: "medium",
      label: "Medium",
      color: "#FF9500",
      description: "Needs attention soon",
    },
    {
      id: "high",
      label: "High",
      color: "#FF3B30",
      description: "Urgent, needs immediate attention",
    },
  ];

  const timeSlots = [
    {
      id: "morning",
      label: "Morning (9AM - 12PM)",
      value: "Morning (9AM - 12PM)",
    },
    {
      id: "afternoon",
      label: "Afternoon (1PM - 5PM)",
      value: "Afternoon (1PM - 5PM)",
    },
    {
      id: "evening",
      label: "Evening (6PM - 8PM)",
      value: "Evening (6PM - 8PM)",
    },
    { id: "anytime", label: "Any time", value: "Any time" },
    { id: "weekends", label: "Weekends only", value: "Weekends only" },
  ];

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== "granted" || libraryStatus !== "granted") {
        Alert.alert(
          "Permissions Required",
          "Camera and photo library permissions are required to attach photos.",
          [{ text: "OK" }]
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async (source) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result;
    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    };

    if (source === "camera") {
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        ...options,
        allowsMultipleSelection: true,
      });
    }

    if (!result.canceled) {
      const newPhotos = result.assets.map((asset, index) => ({
        id: Date.now() + index,
        uri: asset.uri,
        fileName: asset.fileName || `photo_${Date.now()}_${index}.jpg`,
      }));
      setPhotos([...photos, ...newPhotos]);
    }
    setShowImagePicker(false);
  };

  const removePhoto = (photoId) => {
    setPhotos(photos.filter((photo) => photo.id !== photoId));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for your request.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Error", "Please provide a description of the issue.");
      return;
    }
    if (!preferredTime) {
      Alert.alert("Error", "Please select your preferred time for repair.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newTicket = {
        title: title.trim(),
        description: description.trim(),
        priority,
        preferredTime,
        photos: photos.map((photo) => photo.fileName),
        submittedDate: new Date().toISOString(),
        status: "open",
      };

      console.log("New maintenance request:", newTicket);

      Alert.alert(
        "Request Submitted",
        "Your maintenance request has been submitted successfully. You will receive updates as it progresses.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = title.trim() && description.trim() && preferredTime;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>
          New Maintenance Request
        </ThemedText>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Request Title *</ThemedText>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Brief description of the issue"
            placeholderTextColor={colors.text + "60"}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <ThemedText style={styles.charCount}>{title.length}/100</ThemedText>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Description *</ThemedText>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Describe the issue in detail. Include any relevant information that might help with diagnosis and repair."
            placeholderTextColor={colors.text + "60"}
            multiline
            numberOfLines={6}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
            maxLength={500}
          />
          <ThemedText style={styles.charCount}>
            {description.length}/500
          </ThemedText>
        </View>

        {/* Priority */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Priority Level</ThemedText>
          <View style={styles.priorityContainer}>
            {priorities.map((priorityOption) => (
              <TouchableOpacity
                key={priorityOption.id}
                style={[
                  styles.priorityCard,
                  {
                    backgroundColor: colors.card,
                    borderColor:
                      priority === priorityOption.id
                        ? priorityOption.color
                        : colors.border,
                    borderWidth: priority === priorityOption.id ? 2 : 1,
                  },
                ]}
                onPress={() => setPriority(priorityOption.id)}
              >
                <View style={styles.priorityHeader}>
                  <View
                    style={[
                      styles.priorityIcon,
                      { backgroundColor: priorityOption.color + "20" },
                    ]}
                  >
                    <View
                      style={[
                        styles.priorityDot,
                        { backgroundColor: priorityOption.color },
                      ]}
                    />
                  </View>
                  <ThemedText style={styles.priorityLabel}>
                    {priorityOption.label}
                  </ThemedText>
                  {priority === priorityOption.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={priorityOption.color}
                    />
                  )}
                </View>
                <ThemedText style={styles.priorityDescription}>
                  {priorityOption.description}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preferred Time */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Preferred Time for Repair *
          </ThemedText>
          <TouchableOpacity
            style={[
              styles.timeSelector,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => setShowTimeModal(true)}
          >
            <Ionicons name="time-outline" size={20} color={colors.text} />
            <ThemedText
              style={[
                styles.timeSelectorText,
                !preferredTime && { opacity: 0.6 },
              ]}
            >
              {preferredTime || "Select preferred time"}
            </ThemedText>
            <Ionicons name="chevron-down" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Photos */}
        <View style={styles.section}>
          <View style={styles.photosHeader}>
            <ThemedText style={styles.sectionTitle}>
              Photos (Optional)
            </ThemedText>
            <TouchableOpacity
              style={[styles.addPhotoButton, { borderColor: colors.tint }]}
              onPress={() => setShowImagePicker(true)}
            >
              <Ionicons name="camera-outline" size={16} color={colors.tint} />
              <ThemedText style={[styles.addPhotoText, { color: colors.tint }]}>
                Add Photo
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ThemedText style={styles.photosSubtitle}>
            Add photos to help describe the issue. This can speed up diagnosis
            and repair.
          </ThemedText>

          {photos.length > 0 && (
            <View style={styles.photosContainer}>
              {photos.map((photo) => (
                <View key={photo.id} style={styles.photoCard}>
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.photoPreview}
                  />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(photo.id)}
                  >
                    <Ionicons name="close-circle" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                  <ThemedText style={styles.photoName} numberOfLines={1}>
                    {photo.fileName}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor:
                  isFormValid && !isSubmitting
                    ? colors.tint
                    : colors.text + "40",
              },
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <ThemedText style={styles.submitButtonText}>
                Submitting...
              </ThemedText>
            ) : (
              <>
                <Ionicons name="send-outline" size={20} color="white" />
                <ThemedText style={styles.submitButtonText}>
                  Submit Request
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Time Selection Modal */}
      <Modal
        visible={showTimeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTimeModal(false)}
      >
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowTimeModal(false)}>
              <ThemedText style={[styles.modalAction, { color: colors.text }]}>
                Cancel
              </ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>Preferred Time</ThemedText>
            <TouchableOpacity onPress={() => setShowTimeModal(false)}>
              <ThemedText style={[styles.modalAction, { color: colors.tint }]}>
                Done
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.timeOptions}>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[styles.timeOption, { backgroundColor: colors.card }]}
                onPress={() => {
                  setPreferredTime(slot.value);
                  setShowTimeModal(false);
                }}
              >
                <ThemedText style={styles.timeOptionText}>
                  {slot.label}
                </ThemedText>
                {preferredTime === slot.value && (
                  <Ionicons name="checkmark" size={20} color={colors.tint} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <View style={styles.imagePickerOverlay}>
          <View
            style={[
              styles.imagePickerContainer,
              { backgroundColor: colors.card },
            ]}
          >
            <View style={styles.imagePickerHeader}>
              <ThemedText style={styles.imagePickerTitle}>Add Photo</ThemedText>
              <TouchableOpacity onPress={() => setShowImagePicker(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.imagePickerOptions}>
              <TouchableOpacity
                style={[
                  styles.imagePickerOption,
                  { backgroundColor: colors.background },
                ]}
                onPress={() => pickImage("camera")}
              >
                <Ionicons name="camera-outline" size={32} color={colors.tint} />
                <ThemedText style={styles.imagePickerOptionText}>
                  Take Photo
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.imagePickerOption,
                  { backgroundColor: colors.background },
                ]}
                onPress={() => pickImage("gallery")}
              >
                <Ionicons name="image-outline" size={32} color={colors.tint} />
                <ThemedText style={styles.imagePickerOptionText}>
                  Choose from Gallery
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerButton: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: "right",
    marginTop: 4,
  },
  priorityContainer: {
    gap: 12,
  },
  priorityCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  priorityHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  priorityIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  priorityDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginLeft: 36,
  },
  timeSelector: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    gap: 12,
  },
  timeSelectorText: {
    flex: 1,
    fontSize: 16,
  },
  photosHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addPhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 16,
    gap: 6,
  },
  addPhotoText: {
    fontSize: 14,
    fontWeight: "500",
  },
  photosSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  photosContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  photoCard: {
    width: 100,
    alignItems: "center",
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  removePhotoButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "white",
    borderRadius: 10,
  },
  photoName: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
  },
  submitSection: {
    marginTop: 32,
    marginBottom: 32,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
  timeOptions: {
    flex: 1,
    padding: 16,
  },
  timeOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  timeOptionText: {
    fontSize: 16,
  },
  imagePickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  imagePickerContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  imagePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  imagePickerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  imagePickerOptions: {
    flexDirection: "row",
    padding: 16,
    gap: 16,
  },
  imagePickerOption: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    borderRadius: 12,
    gap: 12,
  },
  imagePickerOptionText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
