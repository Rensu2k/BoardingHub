import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { TenantHeader } from "@/components/tenant";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { usePullRefresh } from "@/hooks/usePullRefresh";

export default function MaintenanceIndex() {
  const [activeFilter, setActiveFilter] = useState("all");
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Mock maintenance tickets data
  const allTickets = [
    {
      id: 1,
      title: "Air Conditioning Repair",
      description: "AC unit making strange noise and not cooling properly",
      status: "in_progress",
      priority: "high",
      submittedDate: "2024-10-15T10:30:00Z",
      estimatedCompletion: "2024-10-18T14:00:00Z",
      preferredTime: "Morning (9AM - 12PM)",
      assignedTo: "John Martinez - HVAC Technician",
      assignedPhone: "+63 917 123 4567",
      lastUpdate: "2024-10-16T09:15:00Z",
      comments: [
        {
          id: 1,
          author: "You",
          message:
            "The AC has been making loud noises since yesterday evening.",
          timestamp: "2024-10-15T10:30:00Z",
          isFromTenant: true,
        },
        {
          id: 2,
          author: "Ms. Maria Santos",
          message:
            "I've contacted our HVAC technician. He will visit tomorrow morning to assess the issue.",
          timestamp: "2024-10-15T14:20:00Z",
          isFromTenant: false,
        },
        {
          id: 3,
          author: "John Martinez",
          message:
            "Initial inspection completed. Need to order replacement parts. Will be back on Thursday.",
          timestamp: "2024-10-16T09:15:00Z",
          isFromTenant: false,
        },
      ],
      photos: ["photo1.jpg", "photo2.jpg"],
      canReopen: false,
    },
    {
      id: 2,
      title: "Leaking Faucet in Kitchen",
      description: "Kitchen sink faucet has a constant drip that won't stop",
      status: "open",
      priority: "medium",
      submittedDate: "2024-10-14T08:45:00Z",
      preferredTime: "Afternoon (1PM - 5PM)",
      assignedTo: null,
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
      photos: ["faucet1.jpg"],
      canReopen: false,
    },
    {
      id: 3,
      title: "Window Lock Replacement",
      description: "Window lock is broken and won't secure properly",
      status: "resolved",
      priority: "medium",
      submittedDate: "2024-09-20T16:20:00Z",
      completedDate: "2024-09-22T11:30:00Z",
      preferredTime: "Morning (9AM - 12PM)",
      assignedTo: "Carlos Rivera - Maintenance",
      assignedPhone: "+63 918 765 4321",
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
      ],
      photos: ["window1.jpg"],
      canReopen: true,
      resolvedDate: "2024-09-22T11:30:00Z",
    },
    {
      id: 4,
      title: "Ceiling Light Not Working",
      description: "Living room ceiling light stopped working suddenly",
      status: "resolved",
      priority: "low",
      submittedDate: "2024-10-01T19:15:00Z",
      completedDate: "2024-10-02T10:20:00Z",
      preferredTime: "Any time",
      assignedTo: "Mike Santos - Electrician",
      assignedPhone: "+63 919 876 5432",
      lastUpdate: "2024-10-02T10:20:00Z",
      comments: [
        {
          id: 1,
          author: "You",
          message:
            "The ceiling light in the living room stopped working. I checked the bulb and it seems fine.",
          timestamp: "2024-10-01T19:15:00Z",
          isFromTenant: true,
        },
        {
          id: 2,
          author: "Mike Santos",
          message: "Fixed the wiring issue. Light should work normally now.",
          timestamp: "2024-10-02T10:20:00Z",
          isFromTenant: false,
        },
      ],
      photos: [],
      canReopen: false, // More than 7 days ago
      resolvedDate: "2024-10-02T10:20:00Z",
    },
  ];

  const filters = [
    { id: "all", label: "All", count: allTickets.length },
    {
      id: "open",
      label: "Open",
      count: allTickets.filter((t) => t.status === "open").length,
    },
    {
      id: "in_progress",
      label: "In Progress",
      count: allTickets.filter((t) => t.status === "in_progress").length,
    },
    {
      id: "resolved",
      label: "Resolved",
      count: allTickets.filter((t) => t.status === "resolved").length,
    },
  ];

  const filteredTickets = useMemo(() => {
    if (activeFilter === "all") return allTickets;
    return allTickets.filter((ticket) => ticket.status === activeFilter);
  }, [activeFilter, allTickets]);

  const refreshTickets = async () => {
    console.log("Refreshing maintenance tickets...");
    // Simulate API call
  };

  const { refreshing, onRefresh } = usePullRefresh(refreshTickets);

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

  const handleTicketPress = (ticket) => {
    router.push(`/tenant/maintenance/ticket-detail/${ticket.id}`);
  };

  const handleCreateRequest = () => {
    router.push("/tenant/maintenance/create-request");
  };

  const handleReopenTicket = (ticket) => {
    Alert.alert(
      "Reopen Ticket",
      `Are you sure you want to reopen "${ticket.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reopen",
          onPress: () => {
            Alert.alert("Success", "Ticket has been reopened successfully!");
          },
        },
      ]
    );
  };

  const canReopenTicket = (ticket) => {
    if (ticket.status !== "resolved") return false;
    if (!ticket.resolvedDate) return false;

    const resolvedDate = new Date(ticket.resolvedDate);
    const daysSinceResolved =
      (Date.now() - resolvedDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceResolved <= 7;
  };

  const renderTicketCard = (ticket) => (
    <TouchableOpacity
      key={ticket.id}
      style={[styles.ticketCard, { backgroundColor: colors.card }]}
      onPress={() => handleTicketPress(ticket)}
      activeOpacity={0.7}
    >
      <View style={styles.ticketHeader}>
        <View style={styles.ticketTitleRow}>
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
              size={12}
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

          {ticket.status === "resolved" && canReopenTicket(ticket) && (
            <TouchableOpacity
              style={styles.reopenButton}
              onPress={(e) => {
                e.stopPropagation();
                handleReopenTicket(ticket);
              }}
            >
              <Ionicons name="refresh-outline" size={14} color={colors.tint} />
              <ThemedText style={[styles.reopenText, { color: colors.tint }]}>
                Reopen
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ThemedText style={styles.ticketDescription} numberOfLines={2}>
        {ticket.description}
      </ThemedText>

      <View style={styles.ticketFooter}>
        <View style={styles.ticketMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.text} />
            <ThemedText style={styles.metaText}>
              {formatDate(ticket.submittedDate)}
            </ThemedText>
          </View>

          {ticket.assignedTo && (
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={14} color={colors.text} />
              <ThemedText style={styles.metaText}>
                {ticket.assignedTo.split(" - ")[0]}
              </ThemedText>
            </View>
          )}

          {ticket.photos && ticket.photos.length > 0 && (
            <View style={styles.metaItem}>
              <Ionicons name="camera-outline" size={14} color={colors.text} />
              <ThemedText style={styles.metaText}>
                {ticket.photos.length} photo
                {ticket.photos.length > 1 ? "s" : ""}
              </ThemedText>
            </View>
          )}
        </View>

        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.text}
          style={{ opacity: 0.5 }}
        />
      </View>

      {ticket.estimatedCompletion && ticket.status === "in_progress" && (
        <View style={styles.estimatedCompletion}>
          <Ionicons name="time-outline" size={14} color="#FF9500" />
          <ThemedText style={styles.estimatedText}>
            Est. completion: {formatDate(ticket.estimatedCompletion)}
          </ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <TenantHeader
        title="Maintenance Requests"
        rightComponent={
          <TouchableOpacity onPress={handleCreateRequest}>
            <Ionicons name="add" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />

      {/* Filter Tabs */}
      <View
        style={[styles.filterContainer, { backgroundColor: colors.background }]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterTab,
                activeFilter === filter.id && [
                  styles.activeFilterTab,
                  { backgroundColor: colors.tint },
                ],
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <ThemedText
                style={[
                  styles.filterTabText,
                  activeFilter === filter.id && styles.activeFilterTabText,
                ]}
              >
                {filter.label}
              </ThemedText>
              <View
                style={[
                  styles.filterBadge,
                  activeFilter === filter.id
                    ? { backgroundColor: "rgba(255,255,255,0.3)" }
                    : { backgroundColor: colors.tint + "20" },
                ]}
              >
                <ThemedText
                  style={[
                    styles.filterBadgeText,
                    activeFilter === filter.id
                      ? { color: "white" }
                      : { color: colors.tint },
                  ]}
                >
                  {filter.count}
                </ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Quick Stats */}
      <View
        style={[styles.statsContainer, { backgroundColor: colors.background }]}
      >
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Ionicons name="time-outline" size={20} color="#FF9500" />
          <ThemedText style={styles.statNumber}>
            {allTickets.filter((t) => t.status === "open").length}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Open</ThemedText>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Ionicons name="construct-outline" size={20} color="#007AFF" />
          <ThemedText style={styles.statNumber}>
            {allTickets.filter((t) => t.status === "in_progress").length}
          </ThemedText>
          <ThemedText style={styles.statLabel}>In Progress</ThemedText>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#34C759" />
          <ThemedText style={styles.statNumber}>
            {allTickets.filter((t) => t.status === "resolved").length}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Resolved</ThemedText>
        </View>
      </View>

      {/* Tickets List */}
      <ScrollView
        style={styles.ticketsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
      >
        <View style={styles.ticketsContainer}>
          {filteredTickets.length > 0 ? (
            filteredTickets.map(renderTicketCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="construct-outline"
                size={64}
                color={colors.text}
                style={{ opacity: 0.3 }}
              />
              <ThemedText style={styles.emptyTitle}>
                No{" "}
                {activeFilter === "all" ? "" : activeFilter.replace("_", " ")}{" "}
                tickets
              </ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                {activeFilter === "all"
                  ? "You haven't created any maintenance requests yet."
                  : `No tickets with ${activeFilter.replace("_", " ")} status.`}
              </ThemedText>
              {activeFilter === "all" && (
                <TouchableOpacity
                  style={[
                    styles.createButton,
                    { backgroundColor: colors.tint },
                  ]}
                  onPress={handleCreateRequest}
                >
                  <Ionicons name="add" size={20} color="white" />
                  <ThemedText style={styles.createButtonText}>
                    Create Request
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={handleCreateRequest}
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
  filterContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
    backgroundColor: "#F5F5F5",
  },
  activeFilterTab: {
    // backgroundColor set dynamically
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  activeFilterTabText: {
    color: "white",
  },
  filterBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  ticketsList: {
    flex: 1,
  },
  ticketsContainer: {
    padding: 16,
  },
  ticketCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  ticketHeader: {
    marginBottom: 12,
  },
  ticketTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: "600",
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
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  reopenButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  reopenText: {
    fontSize: 12,
    fontWeight: "500",
  },
  ticketDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
    marginBottom: 12,
  },
  ticketFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ticketMeta: {
    flexDirection: "row",
    gap: 12,
    flex: 1,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    opacity: 0.7,
  },
  estimatedCompletion: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
  },
  estimatedText: {
    fontSize: 12,
    color: "#FF9500",
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
    marginBottom: 24,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
