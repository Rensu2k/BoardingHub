import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import StatusChip from "@/components/landlord/StatusChip";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { getTenantById } from "@/utils/tenantHelpers";

const { width, height } = Dimensions.get("window");

export default function TenantProfileScreen() {
  const [activeTab, setActiveTab] = useState("overview");
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Load tenant data from Firebase
  const loadTenantData = async () => {
    try {
      setLoading(true);
      const tenantData = await getTenantById(id);
      setTenant({
        ...tenantData,
        // Add mock data for features not yet implemented
        deposit: tenantData.deposit || 5600,
        notes: tenantData.notes || "No additional notes available.",
        documents: tenantData.documents || [],
        payments: tenantData.payments || [],
        maintenanceRequests: tenantData.maintenanceRequests || [],
      });
    } catch (error) {
      console.error("Error loading tenant data:", error);
      Alert.alert("Error", "Failed to load tenant details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load tenant data when screen focuses
  useFocusEffect(
    useCallback(() => {
      if (id) {
        loadTenantData();
      }
    }, [id])
  );

  // Show loading screen
  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading tenant details...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // Show error if tenant not found
  if (!tenant) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.errorContainer}>
          <Ionicons name="person-outline" size={48} color={colors.text + "40"} />
          <ThemedText style={styles.errorText}>Tenant not found</ThemedText>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.tint }]}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.retryButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const tabs = [
    { key: "overview", label: "Overview", icon: "person-outline" },
    { key: "payments", label: "Payments", icon: "card-outline" },
    { key: "documents", label: "Documents", icon: "document-outline" },
    { key: "maintenance", label: "Maintenance", icon: "construct-outline" },
  ];

  const handleAction = (action) => {
    switch (action) {
      case "message":
        Alert.alert("Message Tenant", `Send message to ${tenant.name}?`);
        break;
      case "create-bill":
        Alert.alert("Create Bill", `Create new bill for ${tenant.name}?`);
        break;
      case "move-out":
        Alert.alert("Move Out", `Process move-out for ${tenant.name}?`);
        break;
      case "move-in":
        Alert.alert("Move In", `Process move-in for ${tenant.name}?`);
        break;
    }
  };

  const OverviewTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Contact Information */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Contact Information</ThemedText>

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="call-outline" size={20} color={colors.tint} />
          </View>
          <View style={styles.infoContent}>
            <ThemedText style={styles.infoLabel}>Phone</ThemedText>
            <ThemedText style={styles.infoValue}>{tenant.phone}</ThemedText>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="mail-outline" size={20} color={colors.tint} />
          </View>
          <View style={styles.infoContent}>
            <ThemedText style={styles.infoLabel}>Email</ThemedText>
            <ThemedText style={styles.infoValue}>{tenant.email}</ThemedText>
          </View>
        </View>
      </View>

      {/* Emergency Contact */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Emergency Contact</ThemedText>

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="person-outline" size={20} color={colors.tint} />
          </View>
          <View style={styles.infoContent}>
            <ThemedText style={styles.infoLabel}>Name</ThemedText>
            <ThemedText style={styles.infoValue}>
              {tenant.emergencyContact?.name || "Not provided"}
            </ThemedText>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="heart-outline" size={20} color={colors.tint} />
          </View>
          <View style={styles.infoContent}>
            <ThemedText style={styles.infoLabel}>Relationship</ThemedText>
            <ThemedText style={styles.infoValue}>
              {tenant.emergencyContact?.relationship || "Not provided"}
            </ThemedText>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="call-outline" size={20} color={colors.tint} />
          </View>
          <View style={styles.infoContent}>
            <ThemedText style={styles.infoLabel}>Phone</ThemedText>
            <ThemedText style={styles.infoValue}>
              {tenant.emergencyContact?.phone || "Not provided"}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Lease Information */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Lease Information</ThemedText>

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="calendar-outline" size={20} color={colors.tint} />
          </View>
          <View style={styles.infoContent}>
            <ThemedText style={styles.infoLabel}>Lease Start</ThemedText>
            <ThemedText style={styles.infoValue}>
              {tenant.leaseStart ? new Date(tenant.leaseStart).toLocaleDateString() : "Not set"}
            </ThemedText>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="calendar-outline" size={20} color={colors.tint} />
          </View>
          <View style={styles.infoContent}>
            <ThemedText style={styles.infoLabel}>Lease End</ThemedText>
            <ThemedText style={styles.infoValue}>
              {tenant.leaseEnd ? new Date(tenant.leaseEnd).toLocaleDateString() : "Not set"}
            </ThemedText>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="shield-outline" size={20} color={colors.tint} />
          </View>
          <View style={styles.infoContent}>
            <ThemedText style={styles.infoLabel}>Security Deposit</ThemedText>
            <ThemedText style={styles.infoValue}>
              ₱{(tenant.deposit || 0).toLocaleString()}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Notes */}
      {tenant.notes && (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Notes</ThemedText>
          <ThemedText style={styles.notesText}>{tenant.notes}</ThemedText>
        </View>
      )}

      {/* Actions */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Actions</ThemedText>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#007AFF20" }]}
            onPress={() => handleAction("message")}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#007AFF" />
            <ThemedText style={[styles.actionButtonText, { color: "#007AFF" }]}>
              Message
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#34C75920" }]}
            onPress={() => handleAction("create-bill")}
          >
            <Ionicons name="receipt-outline" size={20} color="#34C759" />
            <ThemedText style={[styles.actionButtonText, { color: "#34C759" }]}>
              Create Bill
            </ThemedText>
          </TouchableOpacity>

          {tenant.status === "active" ? (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#FF950020" }]}
              onPress={() => handleAction("move-out")}
            >
              <Ionicons name="log-out-outline" size={20} color="#FF9500" />
              <ThemedText
                style={[styles.actionButtonText, { color: "#FF9500" }]}
              >
                Move Out
              </ThemedText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#34C75920" }]}
              onPress={() => handleAction("move-in")}
            >
              <Ionicons name="log-in-outline" size={20} color="#34C759" />
              <ThemedText
                style={[styles.actionButtonText, { color: "#34C759" }]}
              >
                Move In
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );

  const PaymentsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Payment History</ThemedText>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAction("create-bill")}
          >
            <Ionicons name="add" size={20} color={colors.tint} />
          </TouchableOpacity>
        </View>

        {tenant.payments && tenant.payments.length > 0 ? (
          tenant.payments.map((payment) => (
            <View
              key={payment.id}
              style={[styles.paymentCard, { backgroundColor: colors.card }]}
            >
              <View style={styles.paymentHeader}>
                <View>
                  <ThemedText style={styles.paymentType}>
                    {payment.type}
                  </ThemedText>
                  <ThemedText style={styles.paymentDate}>
                    {new Date(payment.date).toLocaleDateString()}
                  </ThemedText>
                </View>
                <View style={styles.paymentRight}>
                  <ThemedText style={styles.paymentAmount}>
                    ₱{payment.amount.toLocaleString()}
                  </ThemedText>
                  <StatusChip status={payment.status} size="small" />
                </View>
              </View>
              <ThemedText style={styles.paymentMethod}>
                Via {payment.method}
              </ThemedText>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={48} color={colors.text + "40"} />
            <ThemedText style={styles.emptyStateText}>
              No payment history available
            </ThemedText>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const DocumentsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Documents</ThemedText>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              Alert.alert("Upload Document", "Document upload coming soon!")
            }
          >
            <Ionicons name="add" size={20} color={colors.tint} />
          </TouchableOpacity>
        </View>

        {tenant.documents && tenant.documents.length > 0 ? (
          tenant.documents.map((document) => (
            <TouchableOpacity
              key={document.id}
              style={[styles.documentCard, { backgroundColor: colors.card }]}
              onPress={() =>
                Alert.alert("View Document", `Open ${document.type}?`)
              }
            >
              <View style={styles.documentIcon}>
                {document.type === "ID Photo" && document.url ? (
                  <Image
                    source={{ uri: document.url }}
                    style={styles.documentThumbnail}
                  />
                ) : (
                  <Ionicons
                    name={
                      document.type === "Contract"
                        ? "document-outline"
                        : "image-outline"
                    }
                    size={24}
                    color={colors.tint}
                  />
                )}
              </View>

              <View style={styles.documentInfo}>
                <ThemedText style={styles.documentType}>
                  {document.type}
                </ThemedText>
                <ThemedText style={styles.documentDate}>
                  Uploaded: {new Date(document.uploadDate).toLocaleDateString()}
                </ThemedText>
                {document.filename && (
                  <ThemedText style={styles.documentFilename}>
                    {document.filename}
                  </ThemedText>
                )}
              </View>

              <TouchableOpacity style={styles.documentAction}>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.text + "60"}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={48} color={colors.text + "40"} />
            <ThemedText style={styles.emptyStateText}>
              No documents uploaded yet
            </ThemedText>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const MaintenanceTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>
            Maintenance Requests
          </ThemedText>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              Alert.alert(
                "New Request",
                "Create maintenance request coming soon!"
              )
            }
          >
            <Ionicons name="add" size={20} color={colors.tint} />
          </TouchableOpacity>
        </View>

        {tenant.maintenanceRequests && tenant.maintenanceRequests.length > 0 ? (
          tenant.maintenanceRequests.map((request) => (
            <View
              key={request.id}
              style={[styles.maintenanceCard, { backgroundColor: colors.card }]}
            >
              <View style={styles.maintenanceHeader}>
                <ThemedText style={styles.maintenanceIssue}>
                  {request.issue}
                </ThemedText>
                <StatusChip status={request.status} size="small" />
              </View>

              <View style={styles.maintenanceDetails}>
                <View style={styles.maintenanceRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={colors.text + "60"}
                  />
                  <ThemedText style={styles.maintenanceText}>
                    {new Date(request.date).toLocaleDateString()}
                  </ThemedText>
                </View>

                <View style={styles.maintenanceRow}>
                  <Ionicons
                    name="flag-outline"
                    size={16}
                    color={colors.text + "60"}
                  />
                  <ThemedText style={styles.maintenanceText}>
                    {request.priority.charAt(0).toUpperCase() +
                      request.priority.slice(1)}{" "}
                    Priority
                  </ThemedText>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="construct-outline" size={48} color={colors.text + "40"} />
            <ThemedText style={styles.emptyStateText}>
              No maintenance requests yet
            </ThemedText>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "payments":
        return <PaymentsTab />;
      case "documents":
        return <DocumentsTab />;
      case "maintenance":
        return <MaintenanceTab />;
      default:
        return <OverviewTab />;
    }
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

        <View style={styles.headerContent}>
          <View
            style={[styles.avatar, { backgroundColor: colors.tint + "20" }]}
          >
            <Ionicons name="person-outline" size={32} color={colors.tint} />
          </View>
          <View style={styles.headerInfo}>
            <ThemedText style={styles.tenantName}>{tenant.name}</ThemedText>
            <ThemedText style={styles.roomInfo}>
              {tenant.roomNumber ? `Room ${tenant.roomNumber}` : "No room assigned"}
            </ThemedText>
          </View>
          <StatusChip status={tenant.status} />
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabs}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  activeTab === tab.key && { borderBottomColor: colors.tint },
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Ionicons
                  name={tab.icon}
                  size={20}
                  color={
                    activeTab === tab.key ? colors.tint : colors.text + "60"
                  }
                />
                <ThemedText
                  style={[
                    styles.tabText,
                    {
                      color:
                        activeTab === tab.key
                          ? colors.tint
                          : colors.text + "60",
                    },
                  ]}
                >
                  {tab.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Tab Content */}
      {renderTabContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  backButton: {
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  roomInfo: {
    fontSize: 16,
    opacity: 0.7,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  tabContent: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  addButton: {
    padding: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  actionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  paymentCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  paymentType: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 14,
    opacity: 0.7,
  },
  paymentRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#34C759",
  },
  paymentMethod: {
    fontSize: 14,
    opacity: 0.7,
  },
  documentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
  },
  documentThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  documentInfo: {
    flex: 1,
  },
  documentType: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  documentFilename: {
    fontSize: 12,
    opacity: 0.6,
  },
  documentAction: {
    padding: 4,
  },
  maintenanceCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  maintenanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  maintenanceIssue: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 12,
  },
  maintenanceDetails: {
    gap: 8,
  },
  maintenanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  maintenanceText: {
    fontSize: 14,
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 16,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 12,
    textAlign: "center",
  },
});
