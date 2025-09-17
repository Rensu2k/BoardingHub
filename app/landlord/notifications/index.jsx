import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import TenantApplicationModal from "@/components/landlord/TenantApplicationModal";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  getLandlordNotifications,
  markNotificationAsRead,
} from "@/utils/notificationHelpers";

export default function NotificationsScreen() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Load notifications when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const landlordNotifications = await getLandlordNotifications();
      setNotifications(landlordNotifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterOptions = [
    { key: "all", label: "All", count: notifications.length },
    {
      key: "application",
      label: "Applications",
      count: notifications.filter((n) => n.type === "application").length,
    },
    {
      key: "due",
      label: "Due",
      count: notifications.filter((n) => n.type === "due").length,
    },
    {
      key: "payment",
      label: "Payment",
      count: notifications.filter((n) => n.type === "payment").length,
    },
    {
      key: "system",
      label: "System",
      count: notifications.filter((n) => n.type === "system").length,
    },
  ];

  const filteredNotifications =
    selectedFilter === "all"
      ? notifications
      : notifications.filter((n) => n.type === selectedFilter);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "application":
        return "person-add";
      case "due":
        return "alert-circle";
      case "payment":
        return "cash";
      case "system":
        return "settings";
      default:
        return "notifications";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "application":
        return "#FF9500";
      case "due":
        return "#FF3B30";
      case "payment":
        return "#34C759";
      case "system":
        return "#007AFF";
      default:
        return colors.tint;
    }
  };

  const handleNotificationPress = async (notification) => {
    // Mark notification as read
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
      loadNotifications(); // Refresh the list
    }

    // Navigate to appropriate context based on notification type
    switch (notification.contextType) {
      case "application":
        // Show application details modal
        setSelectedApplication({
          ...notification.applicationData,
          notificationId: notification.id,
        });
        setShowApplicationModal(true);
        break;
      case "invoice":
        router.push(`/landlord/billing/invoice/${notification.contextId}`);
        break;
      case "proof":
        router.push("/landlord/payment-proofs");
        break;
      case "maintenance":
        // Navigate to maintenance screen (to be implemented)
        break;
      default:
        // Stay on notifications screen
        break;
    }
  };

  const handleApplicationStatusUpdate = (newStatus) => {
    // Refresh notifications to show updated status
    loadNotifications();
  };

  const renderFilterChip = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        {
          backgroundColor:
            selectedFilter === item.key ? colors.tint : colors.card,
          borderColor:
            selectedFilter === item.key ? colors.tint : colors.border,
        },
      ]}
      onPress={() => setSelectedFilter(item.key)}
    >
      <ThemedText
        style={[
          styles.filterChipText,
          { color: selectedFilter === item.key ? "white" : colors.text },
        ]}
      >
        {item.label} ({item.count})
      </ThemedText>
    </TouchableOpacity>
  );

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        {
          backgroundColor: colors.card,
          borderLeftColor: getNotificationColor(item.type),
        },
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationIcon}>
        <Ionicons
          name={getNotificationIcon(item.type)}
          size={24}
          color={getNotificationColor(item.type)}
        />
        {!item.isRead && (
          <View style={[styles.unreadDot, { backgroundColor: colors.tint }]} />
        )}
      </View>

      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <ThemedText style={styles.notificationTitle}>{item.title}</ThemedText>
          <ThemedText style={styles.notificationTime}>
            {new Date(item.timestamp).toLocaleString()}
          </ThemedText>
        </View>

        <ThemedText style={styles.notificationMessage}>
          {item.message}
        </ThemedText>

        <View style={styles.notificationMeta}>
          <ThemedText style={styles.notificationTenant}>
            {item.tenantName} • Room {item.roomNumber}
          </ThemedText>
          <ThemedText style={styles.notificationProperty}>
            {item.property}
          </ThemedText>
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.tabIconDefault}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Notifications</ThemedText>
        <TouchableOpacity
          style={styles.composeButton}
          onPress={() => router.push("/landlord/notifications/compose")}
        >
          <Ionicons name="create-outline" size={24} color={colors.tint} />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <FlatList
          data={filterOptions}
          renderItem={renderFilterChip}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.notificationsList}
        refreshing={loading}
        onRefresh={loadNotifications}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="notifications-off-outline"
              size={64}
              color={colors.tabIconDefault}
            />
            <ThemedText style={styles.emptyStateTitle}>
              No notifications
            </ThemedText>
            <ThemedText style={styles.emptyStateMessage}>
              You're all caught up! New notifications will appear here.
            </ThemedText>
          </View>
        }
      />

      {/* Application Details Modal */}
      <TenantApplicationModal
        visible={showApplicationModal}
        onClose={() => {
          setShowApplicationModal(false);
          setSelectedApplication(null);
        }}
        applicationData={selectedApplication}
        notificationId={selectedApplication?.notificationId}
        onStatusUpdate={handleApplicationStatusUpdate}
      />
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
    fontSize: 20,
    fontWeight: "600",
  },
  composeButton: {
    padding: 8,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  filtersList: {
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  notificationsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationIcon: {
    position: "relative",
    marginRight: 12,
  },
  unreadDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    opacity: 0.8,
  },
  notificationMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationTenant: {
    fontSize: 12,
    opacity: 0.7,
  },
  notificationProperty: {
    fontSize: 12,
    opacity: 0.6,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.6,
    lineHeight: 22,
  },
});
