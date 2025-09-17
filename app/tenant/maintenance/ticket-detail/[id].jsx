import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Linking,
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

export default function TicketDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Mock ticket data - in real app, fetch by ID
  const ticketData = {
    1: {
      id: 1,
      title: "Air Conditioning Repair",
      description:
        "AC unit making strange noise and not cooling properly. The issue started yesterday evening and has gotten progressively worse. The unit seems to be struggling to maintain temperature and there's a rattling sound coming from inside.",
      status: "in_progress",
      priority: "high",
      submittedDate: "2024-10-15T10:30:00Z",
      estimatedCompletion: "2024-10-18T14:00:00Z",
      preferredTime: "Morning (9AM - 12PM)",
      assignedTo: {
        name: "John Martinez",
        title: "HVAC Technician",
        phone: "+63 917 123 4567",
        email: "john.martinez@maintenance.com",
      },
      landlord: {
        name: "Ms. Maria Santos",
        phone: "+63 912 345 6789",
        email: "maria.santos@email.com",
      },
      lastUpdate: "2024-10-16T09:15:00Z",
      comments: [
        {
          id: 1,
          author: "You",
          message:
            "The AC has been making loud noises since yesterday evening. It's also not cooling the room effectively.",
          timestamp: "2024-10-15T10:30:00Z",
          isFromTenant: true,
        },
        {
          id: 2,
          author: "Ms. Maria Santos",
          message:
            "Thank you for reporting this. I've contacted our HVAC technician John Martinez. He will visit tomorrow morning to assess the issue.",
          timestamp: "2024-10-15T14:20:00Z",
          isFromTenant: false,
        },
        {
          id: 3,
          author: "John Martinez",
          message:
            "Initial inspection completed. The compressor bearings need replacement. I need to order the parts, which should arrive by Thursday. Will be back to complete the repair.",
          timestamp: "2024-10-16T09:15:00Z",
          isFromTenant: false,
        },
      ],
      photos: [
        {
          id: 1,
          uri: "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=AC+Unit",
          fileName: "ac_unit_1.jpg",
        },
        {
          id: 2,
          uri: "https://via.placeholder.com/300x200/7ED321/FFFFFF?text=AC+Close+Up",
          fileName: "ac_closeup_2.jpg",
        },
      ],
      canReopen: false,
    },
    2: {
      id: 2,
      title: "Leaking Faucet in Kitchen",
      description: "Kitchen sink faucet has a constant drip that won't stop",
      status: "open",
      priority: "medium",
      submittedDate: "2024-10-14T08:45:00Z",
      preferredTime: "Afternoon (1PM - 5PM)",
      assignedTo: null,
      landlord: {
        name: "Ms. Maria Santos",
        phone: "+63 912 345 6789",
        email: "maria.santos@email.com",
      },
      lastUpdate: "2024-10-14T08:45:00Z",
      comments: [
        {
          id: 1,
          author: "You",
          message:
            "The kitchen faucet has been dripping constantly. It's wasting water and making noise at night.",
          timestamp: "2024-10-14T08:45:00Z",
          isFromTenant: true,
        },
      ],
      photos: [
        {
          id: 1,
          uri: "https://via.placeholder.com/300x200/FF9500/FFFFFF?text=Leaking+Faucet",
          fileName: "faucet_leak.jpg",
        },
      ],
      canReopen: false,
    },
    3: {
      id: 3,
      title: "Window Lock Replacement",
      description: "Window lock is broken and won't secure properly",
      status: "resolved",
      priority: "medium",
      submittedDate: "2024-09-20T16:20:00Z",
      completedDate: "2024-09-22T11:30:00Z",
      preferredTime: "Morning (9AM - 12PM)",
      assignedTo: {
        name: "Carlos Rivera",
        title: "Maintenance Specialist",
        phone: "+63 918 765 4321",
        email: "carlos.rivera@maintenance.com",
      },
      landlord: {
        name: "Ms. Maria Santos",
        phone: "+63 912 345 6789",
        email: "maria.santos@email.com",
      },
      lastUpdate: "2024-09-22T11:30:00Z",
      comments: [
        {
          id: 1,
          author: "You",
          message:
            "The window lock in the bedroom is broken. I can't secure the window properly.",
          timestamp: "2024-09-20T16:20:00Z",
          isFromTenant: true,
        },
        {
          id: 2,
          author: "Ms. Maria Santos",
          message: "Carlos will visit tomorrow to replace the lock.",
          timestamp: "2024-09-20T18:45:00Z",
          isFromTenant: false,
        },
        {
          id: 3,
          author: "Carlos Rivera",
          message:
            "Lock has been replaced with a new one. Please test and confirm it's working properly.",
          timestamp: "2024-09-22T11:30:00Z",
          isFromTenant: false,
        },
        {
          id: 4,
          author: "You",
          message: "Thank you! The new lock is working perfectly.",
          timestamp: "2024-09-22T12:00:00Z",
          isFromTenant: true,
        },
      ],
      photos: [
        {
          id: 1,
          uri: "https://via.placeholder.com/300x200/5856D6/FFFFFF?text=Broken+Lock",
          fileName: "broken_lock.jpg",
        },
      ],
      canReopen: true,
      resolvedDate: "2024-09-22T11:30:00Z",
    },
  };

  const ticket = ticketData[parseInt(id)] || ticketData[1];

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "#FF9500";
      case "in_progress":
        return "#007AFF";
      case "resolved":
        return "#34C759";
      default:
        return "#8E8E93";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return "time-outline";
      case "in_progress":
        return "construct-outline";
      case "resolved":
        return "checkmark-circle-outline";
      default:
        return "ellipse-outline";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#FF3B30";
      case "medium":
        return "#FF9500";
      case "low":
        return "#34C759";
      default:
        return "#8E8E93";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const canReopenTicket = () => {
    if (ticket.status !== "resolved") return false;
    if (!ticket.resolvedDate) return false;

    const resolvedDate = new Date(ticket.resolvedDate);
    const daysSinceResolved =
      (Date.now() - resolvedDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceResolved <= 7;
  };

  const handleCallAssigned = () => {
    if (!ticket.assignedTo?.phone) return;

    Alert.alert(
      `Call ${ticket.assignedTo.name}`,
      `Do you want to call ${ticket.assignedTo.name} at ${ticket.assignedTo.phone}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call",
          onPress: () => Linking.openURL(`tel:${ticket.assignedTo.phone}`),
        },
      ]
    );
  };

  const handleCallLandlord = () => {
    Alert.alert(
      `Call ${ticket.landlord.name}`,
      `Do you want to call ${ticket.landlord.name} at ${ticket.landlord.phone}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call",
          onPress: () => Linking.openURL(`tel:${ticket.landlord.phone}`),
        },
      ]
    );
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In real app, add comment to ticket
      console.log("New comment:", newComment);

      Alert.alert("Success", "Your comment has been added successfully!");
      setNewComment("");
    } catch (error) {
      Alert.alert("Error", "Failed to add comment. Please try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReopenTicket = () => {
    Alert.alert(
      "Reopen Ticket",
      `Are you sure you want to reopen "${ticket.title}"? This will notify your landlord that the issue needs further attention.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reopen",
          style: "destructive",
          onPress: () => {
            Alert.alert("Success", "Ticket has been reopened successfully!");
          },
        },
      ]
    );
  };

  const handleImagePress = (photo) => {
    Alert.alert("Photo", `Viewing ${photo.fileName}`, [
      { text: "Close", style: "cancel" },
      {
        text: "Save to Device",
        onPress: () => Alert.alert("Saved", "Photo saved to device"),
      },
    ]);
  };

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
        <ThemedText style={styles.headerTitle}>Ticket Details</ThemedText>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Ticket Header */}
        <ThemedView
          style={[styles.ticketHeader, { backgroundColor: colors.card }]}
        >
          <View style={styles.titleRow}>
            <ThemedText style={styles.ticketTitle}>{ticket.title}</ThemedText>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(ticket.priority) + "20" },
              ]}
            >
              <ThemedText
                style={[
                  styles.priorityText,
                  { color: getPriorityColor(ticket.priority) },
                ]}
              >
                {ticket.priority.toUpperCase()}
              </ThemedText>
            </View>
          </View>

          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(ticket.status) + "20" },
              ]}
            >
              <Ionicons
                name={getStatusIcon(ticket.status)}
                size={14}
                color={getStatusColor(ticket.status)}
              />
              <ThemedText
                style={[
                  styles.statusText,
                  { color: getStatusColor(ticket.status) },
                ]}
              >
                {ticket.status.replace("_", " ").toUpperCase()}
              </ThemedText>
            </View>

            {ticket.status === "resolved" && canReopenTicket() && (
              <TouchableOpacity
                style={[styles.reopenButton, { borderColor: colors.tint }]}
                onPress={handleReopenTicket}
              >
                <Ionicons
                  name="refresh-outline"
                  size={16}
                  color={colors.tint}
                />
                <ThemedText style={[styles.reopenText, { color: colors.tint }]}>
                  Reopen
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>

          <ThemedText style={styles.ticketDescription}>
            {ticket.description}
          </ThemedText>
        </ThemedView>

        {/* Ticket Details */}
        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>Request Details</ThemedText>

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.text} />
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>Submitted</ThemedText>
              <ThemedText style={styles.detailValue}>
                {formatDate(ticket.submittedDate)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color={colors.text} />
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>Preferred Time</ThemedText>
              <ThemedText style={styles.detailValue}>
                {ticket.preferredTime}
              </ThemedText>
            </View>
          </View>

          {ticket.estimatedCompletion && (
            <View style={styles.detailRow}>
              <Ionicons
                name="hourglass-outline"
                size={20}
                color={colors.text}
              />
              <View style={styles.detailContent}>
                <ThemedText style={styles.detailLabel}>
                  Estimated Completion
                </ThemedText>
                <ThemedText style={styles.detailValue}>
                  {formatDate(ticket.estimatedCompletion)}
                </ThemedText>
              </View>
            </View>
          )}

          {ticket.completedDate && (
            <View style={styles.detailRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#34C759"
              />
              <View style={styles.detailContent}>
                <ThemedText style={styles.detailLabel}>Completed</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {formatDate(ticket.completedDate)}
                </ThemedText>
              </View>
            </View>
          )}
        </ThemedView>

        {/* Assigned Person */}
        {ticket.assignedTo && (
          <ThemedView
            style={[styles.section, { backgroundColor: colors.card }]}
          >
            <ThemedText style={styles.sectionTitle}>
              Assigned Technician
            </ThemedText>

            <View style={styles.assignedPerson}>
              <View
                style={[
                  styles.assignedAvatar,
                  { backgroundColor: colors.tint + "20" },
                ]}
              >
                <ThemedText
                  style={[styles.assignedInitials, { color: colors.tint }]}
                >
                  {ticket.assignedTo.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </ThemedText>
              </View>

              <View style={styles.assignedInfo}>
                <ThemedText style={styles.assignedName}>
                  {ticket.assignedTo.name}
                </ThemedText>
                <ThemedText style={styles.assignedTitle}>
                  {ticket.assignedTo.title}
                </ThemedText>
                <ThemedText style={styles.assignedContact}>
                  {ticket.assignedTo.phone}
                </ThemedText>
              </View>

              <TouchableOpacity
                style={[styles.callButton, { backgroundColor: colors.tint }]}
                onPress={handleCallAssigned}
              >
                <Ionicons name="call" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </ThemedView>
        )}

        {/* Photos */}
        {ticket.photos && ticket.photos.length > 0 && (
          <ThemedView
            style={[styles.section, { backgroundColor: colors.card }]}
          >
            <ThemedText style={styles.sectionTitle}>
              Photos ({ticket.photos.length})
            </ThemedText>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosContainer}
            >
              {ticket.photos.map((photo) => (
                <TouchableOpacity
                  key={photo.id}
                  style={styles.photoCard}
                  onPress={() => handleImagePress(photo)}
                >
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.photoImage}
                  />
                  <ThemedText style={styles.photoName} numberOfLines={1}>
                    {photo.fileName}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ThemedView>
        )}

        {/* Comments */}
        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>
            Comments ({ticket.comments.length})
          </ThemedText>

          <View style={styles.commentsContainer}>
            {ticket.comments.map((comment) => (
              <View
                key={comment.id}
                style={[
                  styles.commentCard,
                  {
                    backgroundColor: comment.isFromTenant
                      ? colors.tint + "10"
                      : colors.background,
                  },
                ]}
              >
                <View style={styles.commentHeader}>
                  <View style={styles.commentAuthor}>
                    <View
                      style={[
                        styles.commentAvatar,
                        {
                          backgroundColor: comment.isFromTenant
                            ? colors.tint + "20"
                            : "#34C759" + "20",
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          comment.isFromTenant ? "person" : "person-outline"
                        }
                        size={12}
                        color={comment.isFromTenant ? colors.tint : "#34C759"}
                      />
                    </View>
                    <ThemedText style={styles.commentAuthorName}>
                      {comment.author}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.commentTime}>
                    {formatDateTime(comment.timestamp)}
                  </ThemedText>
                </View>
                <ThemedText style={styles.commentMessage}>
                  {comment.message}
                </ThemedText>
              </View>
            ))}
          </View>

          {/* Add Comment */}
          <View style={styles.addCommentContainer}>
            <TextInput
              style={[
                styles.commentInput,
                { backgroundColor: colors.background, color: colors.text },
              ]}
              placeholder="Add a comment..."
              placeholderTextColor={colors.text + "60"}
              multiline
              value={newComment}
              onChangeText={setNewComment}
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor:
                    newComment.trim() && !isSubmittingComment
                      ? colors.tint
                      : colors.text + "40",
                },
              ]}
              onPress={handleSubmitComment}
              disabled={!newComment.trim() || isSubmittingComment}
            >
              <Ionicons
                name={isSubmittingComment ? "hourglass" : "send"}
                size={16}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Contact Options */}
        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>Need Help?</ThemedText>

          <TouchableOpacity
            style={styles.contactOption}
            onPress={handleCallLandlord}
          >
            <View
              style={[styles.contactIcon, { backgroundColor: "#007AFF20" }]}
            >
              <Ionicons name="call-outline" size={20} color="#007AFF" />
            </View>
            <View style={styles.contactInfo}>
              <ThemedText style={styles.contactTitle}>Call Landlord</ThemedText>
              <ThemedText style={styles.contactSubtitle}>
                {ticket.landlord.name} • {ticket.landlord.phone}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactOption}
            onPress={() => Alert.alert("Email", "Opening email app...")}
          >
            <View
              style={[styles.contactIcon, { backgroundColor: "#34C75920" }]}
            >
              <Ionicons name="mail-outline" size={20} color="#34C759" />
            </View>
            <View style={styles.contactInfo}>
              <ThemedText style={styles.contactTitle}>
                Email Landlord
              </ThemedText>
              <ThemedText style={styles.contactSubtitle}>
                {ticket.landlord.email}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.text} />
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
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
    padding: 4,
  },
  content: {
    flex: 1,
  },
  ticketHeader: {
    padding: 20,
    margin: 16,
    marginBottom: 8,
    borderRadius: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  ticketTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    marginRight: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "600",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  reopenButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 16,
    gap: 6,
  },
  reopenText: {
    fontSize: 12,
    fontWeight: "500",
  },
  ticketDescription: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  section: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  assignedPerson: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  assignedAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  assignedInitials: {
    fontSize: 16,
    fontWeight: "bold",
  },
  assignedInfo: {
    flex: 1,
  },
  assignedName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  assignedTitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  assignedContact: {
    fontSize: 12,
    opacity: 0.6,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  photosContainer: {
    paddingHorizontal: 0,
    gap: 12,
  },
  photoCard: {
    alignItems: "center",
    width: 120,
  },
  photoImage: {
    width: 120,
    height: 90,
    borderRadius: 8,
    marginBottom: 8,
  },
  photoName: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
  },
  commentsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  commentCard: {
    padding: 12,
    borderRadius: 12,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  commentAuthor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  commentAuthorName: {
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
    gap: 12,
    alignItems: "flex-end",
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  contactOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
});
