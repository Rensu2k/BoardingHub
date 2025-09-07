import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

const { width, height } = Dimensions.get("window");

export default function PaymentProofsScreen() {
  const [selectedProofs, setSelectedProofs] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedProof, setSelectedProof] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Mock data - replace with Firebase data later
  const paymentProofs = [
    {
      id: "1",
      tenantName: "Juan Dela Cruz",
      tenantId: "t1",
      roomNumber: "101",
      property: "Sunset Apartments",
      invoiceId: "INV-2024-001",
      billedAmount: 2800,
      uploadedAmount: 2800,
      imageUrl:
        "https://via.placeholder.com/300x400/34C759/FFFFFF?text=Payment+Proof",
      uploadedAt: "2024-01-15T14:30:00Z",
      status: "pending",
      comments: [
        {
          id: "c1",
          author: "Juan Dela Cruz",
          message: "Payment proof for January rent",
          timestamp: "2024-01-15T14:30:00Z",
          type: "upload",
        },
      ],
    },
    {
      id: "2",
      tenantName: "Maria Santos",
      tenantId: "t2",
      roomNumber: "205",
      property: "Sunset Apartments",
      invoiceId: "INV-2024-002",
      billedAmount: 2800,
      uploadedAmount: 2800,
      imageUrl:
        "https://via.placeholder.com/300x400/007AFF/FFFFFF?text=Payment+Proof",
      uploadedAt: "2024-01-16T10:15:00Z",
      status: "pending",
      comments: [
        {
          id: "c2",
          author: "Maria Santos",
          message: "GCash payment proof attached",
          timestamp: "2024-01-16T10:15:00Z",
          type: "upload",
        },
      ],
    },
    {
      id: "3",
      tenantName: "Pedro Reyes",
      tenantId: "t3",
      roomNumber: "103",
      property: "Garden Villas",
      invoiceId: "INV-2024-003",
      billedAmount: 2800,
      uploadedAmount: 2800,
      imageUrl:
        "https://via.placeholder.com/300x400/FF9500/FFFFFF?text=Payment+Proof",
      uploadedAt: "2024-01-14T16:45:00Z",
      status: "pending",
      comments: [
        {
          id: "c3",
          author: "Pedro Reyes",
          message: "Bank transfer receipt",
          timestamp: "2024-01-14T16:45:00Z",
          type: "upload",
        },
      ],
    },
    {
      id: "4",
      tenantName: "Elena Rodriguez",
      tenantId: "t4",
      roomNumber: "103",
      property: "City Center Rooms",
      invoiceId: "INV-2024-004",
      billedAmount: 3200,
      uploadedAmount: 3200,
      imageUrl:
        "https://via.placeholder.com/300x400/FF3B30/FFFFFF?text=Payment+Proof",
      uploadedAt: "2024-01-17T09:20:00Z",
      status: "pending",
      comments: [
        {
          id: "c4",
          author: "Elena Rodriguez",
          message: "Maya app payment screenshot",
          timestamp: "2024-01-17T09:20:00Z",
          type: "upload",
        },
      ],
    },
  ];

  const handleProofAction = (proof, action) => {
    switch (action) {
      case "view":
        setSelectedProof(proof);
        setShowDetailModal(true);
        break;
      case "approve":
        Alert.alert(
          "Approve Payment",
          `Approve payment proof for ${proof.tenantName}? This will mark the invoice as paid.`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Approve",
              onPress: () => {
                Alert.alert(
                  "Success",
                  "Payment approved and invoice marked as paid!"
                );
              },
            },
          ]
        );
        break;
      case "reject":
        Alert.alert(
          "Reject Payment",
          `Reject payment proof for ${proof.tenantName}?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Reject",
              onPress: () => {
                Alert.alert(
                  "Payment Rejected",
                  "Payment proof has been rejected."
                );
              },
            },
          ]
        );
        break;
      case "clarify":
        Alert.alert(
          "Request Clarification",
          `Request clarification for ${proof.tenantName}'s payment proof?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Request",
              onPress: () => {
                Alert.alert(
                  "Clarification Requested",
                  "Tenant has been notified to provide clarification."
                );
              },
            },
          ]
        );
        break;
    }
  };

  const toggleProofSelection = (proofId) => {
    setSelectedProofs((prev) =>
      prev.includes(proofId)
        ? prev.filter((id) => id !== proofId)
        : [...prev, proofId]
    );
  };

  const handleBulkApprove = () => {
    if (selectedProofs.length === 0) {
      Alert.alert("No Selection", "Please select payment proofs to approve.");
      return;
    }

    Alert.alert(
      "Bulk Approve",
      `Approve ${selectedProofs.length} selected payment proofs? This will mark all associated invoices as paid.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve All",
          onPress: () => {
            Alert.alert(
              "Success",
              `${selectedProofs.length} payments approved!`
            );
            setSelectedProofs([]);
            setSelectMode(false);
          },
        },
      ]
    );
  };

  const ProofCard = ({ proof }) => {
    const isSelected = selectedProofs.includes(proof.id);
    const uploadTime = new Date(proof.uploadedAt).toLocaleString();

    return (
      <View style={[styles.proofCard, { backgroundColor: colors.card }]}>
        {selectMode && (
          <TouchableOpacity
            style={[
              styles.checkbox,
              isSelected && { backgroundColor: colors.tint },
            ]}
            onPress={() => toggleProofSelection(proof.id)}
          >
            {isSelected && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.proofContent,
            selectMode && styles.proofContentSelectMode,
          ]}
          onPress={() => {
            if (selectMode) {
              toggleProofSelection(proof.id);
            } else {
              handleProofAction(proof, "view");
            }
          }}
        >
          <View style={styles.proofHeader}>
            <View style={styles.tenantInfo}>
              <ThemedText style={styles.tenantName}>
                {proof.tenantName}
              </ThemedText>
              <ThemedText style={styles.propertyInfo}>
                {proof.property} • Room {proof.roomNumber}
              </ThemedText>
              <ThemedText style={styles.invoiceId}>
                {proof.invoiceId}
              </ThemedText>
            </View>

            <View style={styles.proofImage}>
              <Image
                source={{ uri: proof.imageUrl }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            </View>
          </View>

          <View style={styles.proofDetails}>
            <View style={styles.amountInfo}>
              <ThemedText style={styles.amountLabel}>Billed:</ThemedText>
              <ThemedText style={styles.amountValue}>
                ₱{proof.billedAmount.toLocaleString()}
              </ThemedText>
            </View>

            <View style={styles.amountInfo}>
              <ThemedText style={styles.amountLabel}>Uploaded:</ThemedText>
              <ThemedText style={[styles.amountValue, { color: "#34C759" }]}>
                ₱{proof.uploadedAmount.toLocaleString()}
              </ThemedText>
            </View>

            <ThemedText style={styles.uploadTime}>
              Uploaded: {uploadTime}
            </ThemedText>
          </View>
        </TouchableOpacity>

        {!selectMode && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#34C75920" }]}
              onPress={() => handleProofAction(proof, "approve")}
            >
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              <ThemedText style={[styles.actionText, { color: "#34C759" }]}>
                Approve
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#FF950020" }]}
              onPress={() => handleProofAction(proof, "clarify")}
            >
              <Ionicons name="help-circle" size={16} color="#FF9500" />
              <ThemedText style={[styles.actionText, { color: "#FF9500" }]}>
                Clarify
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#FF3B3020" }]}
              onPress={() => handleProofAction(proof, "reject")}
            >
              <Ionicons name="close-circle" size={16} color="#FF3B30" />
              <ThemedText style={[styles.actionText, { color: "#FF3B30" }]}>
                Reject
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const ProofDetailModal = () => {
    const [comment, setComment] = useState("");

    if (!selectedProof) return null;

    const addComment = useCallback(() => {
      if (!comment.trim()) return;

      Alert.alert("Comment Added", "Your comment has been added to the proof.");
      setComment("");
    }, [comment]);

    const handleCommentChange = useCallback((text) => {
      setComment(text);
    }, []);

    // Clear comment when switching between proofs
    useEffect(() => {
      setComment("");
    }, [selectedProof?.id]);

    return (
      <Modal
        visible={showDetailModal}
        animationType="fade"
        presentationStyle="fullScreen"
        onRequestClose={() => {
          setShowDetailModal(false);
          setSelectedProof(null);
        }}
        key={selectedProof?.id || "modal"}
      >
        <View
          style={[styles.modalOverlay, { backgroundColor: colors.background }]}
        >
          <StatusBar
            barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
          />
          <KeyboardAvoidingView
            style={styles.modalContainer}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
          >
            {/* Modal Header */}
            <View style={[styles.modalHeader, { zIndex: 10 }]}>
              <TouchableOpacity
                style={[styles.closeButton, { zIndex: 11 }]}
                onPress={() => {
                  setShowDetailModal(false);
                  setSelectedProof(null);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>

              <View style={[styles.modalTitle, { zIndex: 11 }]}>
                <ThemedText style={styles.modalTitleText}>
                  {selectedProof.tenantName}
                </ThemedText>
                <ThemedText style={styles.modalSubtitle}>
                  {selectedProof.invoiceId}
                </ThemedText>
              </View>

              <View style={[styles.modalActions, { zIndex: 11 }]}>
                <TouchableOpacity
                  style={[
                    styles.modalActionButton,
                    { backgroundColor: "#34C75920" },
                  ]}
                  onPress={() => {
                    handleProofAction(selectedProof, "approve");
                    setShowDetailModal(false);
                    setSelectedProof(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalActionButton,
                    { backgroundColor: "#FF950020" },
                  ]}
                  onPress={() => {
                    handleProofAction(selectedProof, "clarify");
                    setShowDetailModal(false);
                    setSelectedProof(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="help-circle" size={20} color="#FF9500" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalActionButton,
                    { backgroundColor: "#FF3B3020" },
                  ]}
                  onPress={() => {
                    handleProofAction(selectedProof, "reject");
                    setShowDetailModal(false);
                    setSelectedProof(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              style={styles.scrollableContent}
              contentContainerStyle={styles.scrollableContentContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Image Viewer */}
              <View style={[styles.imageContainer, { zIndex: 1 }]}>
                <Image
                  source={{ uri: selectedProof.imageUrl }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              </View>

              {/* Metadata */}
              <View style={styles.metadataContainer}>
                <View style={styles.metadataItem}>
                  <ThemedText style={styles.metadataLabel}>Tenant:</ThemedText>
                  <ThemedText style={styles.metadataValue}>
                    {selectedProof.tenantName}
                  </ThemedText>
                </View>

                <View style={styles.metadataItem}>
                  <ThemedText style={styles.metadataLabel}>Invoice:</ThemedText>
                  <ThemedText style={styles.metadataValue}>
                    {selectedProof.invoiceId}
                  </ThemedText>
                </View>

                <View style={styles.metadataItem}>
                  <ThemedText style={styles.metadataLabel}>Amount:</ThemedText>
                  <ThemedText
                    style={[styles.metadataValue, { color: "#34C759" }]}
                  >
                    ₱{selectedProof.uploadedAmount.toLocaleString()}
                  </ThemedText>
                </View>

                <View style={styles.metadataItem}>
                  <ThemedText style={styles.metadataLabel}>
                    Uploaded:
                  </ThemedText>
                  <ThemedText style={styles.metadataValue}>
                    {new Date(selectedProof.uploadedAt).toLocaleString()}
                  </ThemedText>
                </View>
              </View>

              {/* Comments Section */}
              <View style={styles.commentsContainer}>
                <ThemedText style={styles.commentsTitle}>Comments</ThemedText>

                <ScrollView
                  style={styles.commentsList}
                  showsVerticalScrollIndicator={false}
                >
                  {selectedProof.comments.map((comment) => (
                    <View key={comment.id} style={styles.commentItem}>
                      <View style={styles.commentHeader}>
                        <ThemedText style={styles.commentAuthor}>
                          {comment.author}
                        </ThemedText>
                        <ThemedText style={styles.commentTime}>
                          {new Date(comment.timestamp).toLocaleString()}
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.commentMessage}>
                        {comment.message}
                      </ThemedText>
                    </View>
                  ))}
                </ScrollView>

                {/* Add Comment */}
                <View style={styles.addCommentContainer}>
                  <TextInput
                    key={`comment-input-${selectedProof?.id || "default"}`}
                    style={[styles.commentInput, { color: colors.text }]}
                    placeholder="Add a comment..."
                    placeholderTextColor={colors.text + "60"}
                    value={comment}
                    onChangeText={handleCommentChange}
                    multiline
                    maxLength={500}
                    returnKeyType="default"
                    blurOnSubmit={false}
                    autoFocus={false}
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      {
                        backgroundColor:
                          comment.trim().length > 0 ? colors.tint : "#CCCCCC",
                      },
                    ]}
                    onPress={addComment}
                    disabled={comment.trim().length === 0}
                  >
                    <Ionicons
                      name="send"
                      size={16}
                      color={comment.trim().length > 0 ? "white" : "#999999"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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

        <ThemedText style={styles.headerTitle}>Payment Proofs</ThemedText>

        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => {
            setSelectMode(!selectMode);
            setSelectedProofs([]);
          }}
        >
          <ThemedText style={styles.selectButtonText}>
            {selectMode ? "Cancel" : "Select"}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Bulk Actions */}
      {selectMode && (
        <View style={styles.bulkActions}>
          <ThemedText style={styles.selectionCount}>
            {selectedProofs.length} selected
          </ThemedText>

          <TouchableOpacity
            style={[styles.bulkApproveButton, { backgroundColor: colors.tint }]}
            onPress={handleBulkApprove}
          >
            <Ionicons name="checkmark-circle" size={16} color="white" />
            <ThemedText style={styles.bulkApproveText}>
              Approve Selected
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Review Payment Proofs
          </ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            {paymentProofs.length} proofs awaiting review
          </ThemedText>
        </View>

        <View style={styles.proofsList}>
          {paymentProofs.map((proof) => (
            <ProofCard key={proof.id} proof={proof} />
          ))}
        </View>

        {paymentProofs.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons
              name="images-outline"
              size={48}
              color={colors.text + "40"}
            />
            <ThemedText style={styles.emptyStateText}>
              No payment proofs to review
            </ThemedText>
          </View>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <ProofDetailModal />
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
  selectButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  bulkActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#E3F2FD",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  selectionCount: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1976D2",
  },
  bulkApproveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  bulkApproveText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
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
  proofsList: {
    gap: 16,
    paddingHorizontal: 20,
  },
  proofCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkbox: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#E5E5E7",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  proofContent: {
    // marginTop is now handled inline with proofContentSelectMode
  },
  proofContentSelectMode: {
    marginTop: 32,
  },
  proofHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  propertyInfo: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  invoiceId: {
    fontSize: 12,
    opacity: 0.6,
  },
  proofImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  proofDetails: {
    gap: 8,
  },
  amountInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  uploadTime: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
  },
  scrollableContent: {
    flex: 1,
  },
  scrollableContentContainer: {
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50, // Extra top padding for safe area
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
    backgroundColor: "#FFFFFF",
  },
  closeButton: {
    padding: 12,
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    flex: 1,
    alignItems: "center",
  },
  modalTitleText: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  modalActions: {
    flexDirection: "row",
    gap: 8,
  },
  modalActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
    minHeight: 44,
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  fullImage: {
    width: width,
    height: height * 0.6,
  },
  metadataContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F9F9F9",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  metadataItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  metadataLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  metadataValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  commentsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  commentsList: {
    flex: 1,
    marginBottom: 16,
  },
  commentItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: "600",
  },
  commentTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  commentMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  addCommentContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
    maxHeight: 80,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
