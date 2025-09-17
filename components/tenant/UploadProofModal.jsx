import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { queueUpload } from "@/utils/uploadQueue";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";


const UploadProofModal = ({
  visible,
  onClose,
  bill,
  onUploadComplete,
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [note, setNote] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    // Check network status (simplified - in real app use NetInfo)
    setIsOffline(false);
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== "granted" || libraryStatus !== "granted") {
        Alert.alert(
          "Permissions Required",
          "Camera and photo library permissions are required to upload payment proof.",
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
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const queueUploadForOffline = async (uploadData) => {
    try {
      await queueUpload(uploadData);
      return true;
    } catch (error) {
      console.error("Error queuing upload:", error);
      return false;
    }
  };

  const simulateUpload = async (imageUri, noteText) => {
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      uploadId: `upload_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      Alert.alert("Error", "Please select an image to upload.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadData = {
        billId: bill.id,
        invoiceId: bill.invoiceId,
        imageUri: selectedImage.uri,
        note: note.trim(),
        billAmount: bill.amount,
      };

      let result;
      if (isOffline) {
        // Queue for offline upload
        result = await queueUploadForOffline(uploadData);
        if (result) {
          Alert.alert(
            "Queued for Upload",
            "Your payment proof has been queued and will be uploaded when you're back online.",
            [{ text: "OK" }]
          );
        }
      } else {
        // Upload immediately
        result = await simulateUpload(selectedImage.uri, note);

        if (result.success) {
          Alert.alert(
            "Upload Successful",
            "Your payment proof has been submitted and is pending review.",
            [{ text: "OK" }]
          );

          // Call completion callback
          if (onUploadComplete) {
            onUploadComplete({
              ...uploadData,
              uploadId: result.uploadId,
              status: "pending_review",
              submittedAt: result.timestamp,
            });
          }
        }
      }

      // Reset form and close modal
      setSelectedImage(null);
      setNote("");
      onClose();

    } catch (error) {
      Alert.alert("Upload Failed", "There was an error uploading your payment proof. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    if (selectedImage || note.trim()) {
      Alert.alert(
        "Discard Changes",
        "Are you sure you want to discard your changes?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              setSelectedImage(null);
              setNote("");
              onClose();
            },
          },
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: colors.background },
        ]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { backgroundColor: colors.background, borderBottomColor: colors.border },
          ]}
        >
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Upload Payment Proof</ThemedText>
          <View style={styles.headerButton} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Bill Summary */}
          <ThemedView
            style={[styles.billSummary, { backgroundColor: colors.card }]}
          >
            <ThemedText style={styles.invoiceId}>{bill.invoiceId}</ThemedText>
            <ThemedText style={styles.billAmount}>
              ₱{bill.amount.toLocaleString()}
            </ThemedText>
            <ThemedText style={styles.billMonth}>{bill.month}</ThemedText>
          </ThemedView>

          {/* Image Selection */}
          {!selectedImage ? (
            <View style={styles.imageSelection}>
              <ThemedText style={styles.sectionTitle}>Select Payment Proof</ThemedText>
              <View style={styles.uploadOptions}>
                <TouchableOpacity
                  style={[styles.uploadOption, { backgroundColor: colors.card }]}
                  onPress={() => pickImage("camera")}
                >
                  <Ionicons name="camera-outline" size={32} color={colors.tint} />
                  <ThemedText style={styles.uploadOptionTitle}>Take Photo</ThemedText>
                  <ThemedText style={styles.uploadOptionSubtitle}>
                    Capture receipt with camera
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.uploadOption, { backgroundColor: colors.card }]}
                  onPress={() => pickImage("gallery")}
                >
                  <Ionicons name="image-outline" size={32} color={colors.tint} />
                  <ThemedText style={styles.uploadOptionTitle}>Choose from Gallery</ThemedText>
                  <ThemedText style={styles.uploadOptionSubtitle}>
                    Select existing photo
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.uploadOption, { backgroundColor: colors.card }]}
                  onPress={() => Alert.alert("Coming Soon", "Document upload will be available soon.")}
                >
                  <Ionicons name="document-outline" size={32} color={colors.tint} />
                  <ThemedText style={styles.uploadOptionTitle}>Upload Document</ThemedText>
                  <ThemedText style={styles.uploadOptionSubtitle}>
                    PDF or other file types
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* Image Preview */
            <View style={styles.imagePreview}>
              <ThemedText style={styles.sectionTitle}>Payment Proof Preview</ThemedText>
              <View style={[styles.previewContainer, { backgroundColor: colors.card }]}>
                <View style={styles.previewImageContainer}>
                  <View style={styles.previewImage}>
                    <ThemedText style={styles.previewPlaceholder}>
                      Image Preview
                    </ThemedText>
                    <ThemedText style={styles.previewFileName}>
                      {selectedImage.uri.split('/').pop()}
                    </ThemedText>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.changeImageButton}
                  onPress={() => setSelectedImage(null)}
                >
                  <Ionicons name="refresh-outline" size={16} color={colors.tint} />
                  <ThemedText style={[styles.changeImageText, { color: colors.tint }]}>
                    Change Image
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Note Input */}
          <View style={styles.noteSection}>
            <ThemedText style={styles.sectionTitle}>Additional Notes (Optional)</ThemedText>
            <TextInput
              style={[
                styles.noteInput,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Add any additional notes about your payment..."
              placeholderTextColor={colors.text + "80"}
              multiline
              numberOfLines={4}
              value={note}
              onChangeText={setNote}
              maxLength={500}
            />
            <ThemedText style={[styles.charCount, { color: colors.text + "60" }]}>
              {note.length}/500
            </ThemedText>
          </View>

          {/* Upload Status */}
          {isOffline && (
            <View style={[styles.statusBanner, { backgroundColor: colors.warning + "20" }]}>
              <Ionicons name="wifi-outline" size={20} color={colors.warning} />
              <ThemedText style={[styles.statusText, { color: colors.warning }]}>
                You're offline. This will be queued for upload when connection is restored.
              </ThemedText>
            </View>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <View style={[styles.progressContainer, { backgroundColor: colors.card }]}>
              <ThemedText style={styles.progressText}>
                Uploading payment proof...
              </ThemedText>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${uploadProgress}%`, backgroundColor: colors.tint },
                  ]}
                />
              </View>
              <ThemedText style={[styles.progressPercent, { color: colors.tint }]}>
                {uploadProgress}%
              </ThemedText>
            </View>
          )}
        </ScrollView>

        {/* Submit Button */}
        <View
          style={[
            styles.footer,
            { backgroundColor: colors.background, borderTopColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: isUploading || !selectedImage ? colors.text + "40" : colors.tint,
              },
            ]}
            onPress={handleSubmit}
            disabled={isUploading || !selectedImage}
          >
            {isUploading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Ionicons name="cloud-upload-outline" size={20} color="white" />
            )}
            <ThemedText style={styles.submitButtonText}>
              {isUploading
                ? "Uploading..."
                : isOffline
                ? "Queue for Upload"
                : "Submit Payment Proof"
              }
            </ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = {
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 24,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  billSummary: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: "center",
  },
  invoiceId: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  billAmount: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  billMonth: {
    fontSize: 14,
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  imageSelection: {
    marginBottom: 24,
  },
  uploadOptions: {
    gap: 12,
  },
  uploadOption: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  uploadOptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
  },
  uploadOptionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
  imagePreview: {
    marginBottom: 24,
  },
  previewContainer: {
    padding: 16,
    borderRadius: 12,
  },
  previewImageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },
  previewPlaceholder: {
    fontSize: 16,
    color: "#666",
  },
  previewFileName: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  changeImageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 8,
  },
  changeImageText: {
    fontSize: 14,
    fontWeight: "500",
  },
  noteSection: {
    marginBottom: 24,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: "top",
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  statusText: {
    flex: 1,
    fontSize: 14,
  },
  progressContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  progressText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
};

export default UploadProofModal;
