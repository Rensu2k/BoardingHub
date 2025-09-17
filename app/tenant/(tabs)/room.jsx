import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
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
import { usePullRefresh } from "@/hooks/usePullRefresh";

const { width } = Dimensions.get("window");

export default function MyRoom() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [maintenanceDescription, setMaintenanceDescription] = useState("");
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Mock room data
  const roomData = {
    roomNumber: "A-101",
    property: "Sunshine Apartments",
    floor: "2nd Floor",
    type: "Single Room",
    size: "12 sqm",
    monthlyRent: "₱5,000",
    images: [
      "https://via.placeholder.com/400x300/4A90E2/FFFFFF?text=Room+A-101",
      "https://via.placeholder.com/400x300/7ED321/FFFFFF?text=Bathroom",
      "https://via.placeholder.com/400x300/F5A623/FFFFFF?text=View",
    ],
  };

  // Lease information
  const leaseInfo = {
    moveInDate: "Aug 15, 2024",
    leaseEndDate: "Aug 15, 2025",
    deposit: "₱10,000",
    depositPaid: true,
    rentDueDay: 15,
    leaseStatus: "active",
  };

  // Utilities data
  const utilities = {
    electricity: {
      currentReading: 2450,
      previousReading: 2300,
      consumption: 150,
      lastReadingDate: "Oct 10, 2024",
      estimatedBill: "₱1,250",
    },
    water: {
      currentReading: 120,
      previousReading: 105,
      consumption: 15,
      lastReadingDate: "Oct 8, 2024",
      estimatedBill: "₱350",
    },
  };

  // Documents
  const documents = [
    {
      id: 1,
      name: "Lease Agreement",
      type: "contract",
      dateSigned: "Aug 10, 2024",
      status: "signed",
      fileSize: "2.4 MB",
    },
    {
      id: 2,
      name: "ID Verification",
      type: "id",
      dateUploaded: "Aug 12, 2024",
      status: "verified",
      fileSize: "1.8 MB",
    },
    {
      id: 3,
      name: "Emergency Contact Form",
      type: "form",
      dateUploaded: "Aug 12, 2024",
      status: "submitted",
      fileSize: "0.9 MB",
    },
  ];

  // Maintenance requests
  const maintenanceRequests = [
    {
      id: 1,
      title: "Air Conditioning Repair",
      description: "AC unit making strange noise and not cooling properly",
      status: "in_progress",
      priority: "high",
      submittedDate: "Oct 15, 2024",
      estimatedCompletion: "Oct 18, 2024",
    },
    {
      id: 2,
      title: "Window Lock Replacement",
      description: "Window lock is broken and won't secure properly",
      status: "completed",
      priority: "medium",
      submittedDate: "Sep 20, 2024",
      completedDate: "Sep 22, 2024",
    },
  ];

  // Landlord information
  const landlord = {
    name: "Ms. Maria Santos",
    email: "maria.santos@email.com",
    phone: "+63 912 345 6789",
    responseTime: "Usually responds within 2 hours",
  };

  const refreshRoom = async () => {
    console.log("Refreshing room data...");
  };

  const { refreshing, onRefresh } = usePullRefresh(refreshRoom);

  const tabs = [
    { id: "overview", label: "Overview", icon: "home-outline" },
    { id: "lease", label: "Lease Info", icon: "document-text-outline" },
    { id: "utilities", label: "Utilities", icon: "flash-outline" },
    { id: "documents", label: "Documents", icon: "folder-outline" },
    { id: "maintenance", label: "Maintenance", icon: "construct-outline" },
  ];

  const handleContactLandlord = () => {
    Alert.alert("Contact Landlord", `Choose how to contact ${landlord.name}:`, [
      {
        text: "Call",
        onPress: () => Alert.alert("Calling", `Calling ${landlord.phone}`),
      },
      {
        text: "Email",
        onPress: () => Alert.alert("Email", `Emailing ${landlord.email}`),
      },
      {
        text: "Message",
        onPress: () => Alert.alert("Message", "Opening messaging app..."),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleViewDocument = (document) => {
    Alert.alert(
      "Document Viewer",
      `${document.name}\n\nType: ${document.type}\nSize: ${document.fileSize}\nStatus: ${document.status}`,
      [
        {
          text: "Download",
          onPress: () => Alert.alert("Download", "Document downloaded!"),
        },
        { text: "Close", style: "cancel" },
      ]
    );
  };

  const handleServiceRequest = (service) => {
    setSelectedService(service);
    setShowServiceModal(true);
  };

  const handleRequestMaintenance = () => {
    router.push("/tenant/maintenance/create-request");
  };

  const handleRequestTransfer = () => {
    setShowTransferModal(true);
  };

  const submitServiceRequest = () => {
    if (!maintenanceDescription.trim()) {
      Alert.alert(
        "Error",
        "Please provide a description of your maintenance request."
      );
      return;
    }

    Alert.alert(
      "Request Submitted",
      "Your maintenance request has been submitted successfully!",
      [
        {
          text: "OK",
          onPress: () => {
            setShowServiceModal(false);
            setMaintenanceDescription("");
          },
        },
      ]
    );
  };

  const submitTransferRequest = () => {
    Alert.alert(
      "Transfer Request",
      "Your room transfer request has been submitted!",
      [{ text: "OK", onPress: () => setShowTransferModal(false) }]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
      case "verified":
      case "signed":
        return "#34C759";
      case "in_progress":
      case "submitted":
        return "#FF9500";
      case "pending":
        return "#FF3B30";
      default:
        return "#8E8E93";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
      case "verified":
      case "signed":
        return "checkmark-circle";
      case "in_progress":
        return "time-outline";
      case "pending":
        return "clock-outline";
      default:
        return "ellipse-outline";
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "lease":
        return renderLeaseInfo();
      case "utilities":
        return renderUtilities();
      case "documents":
        return renderDocuments();
      case "maintenance":
        return renderMaintenance();
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Room Details */}
      <ThemedView style={styles.detailsSection}>
        <View style={styles.roomHeader}>
          <View>
            <ThemedText style={styles.roomNumber}>
              {roomData.roomNumber}
            </ThemedText>
            <ThemedText style={styles.roomType}>
              {roomData.type} • {roomData.floor} • {roomData.size}
            </ThemedText>
          </View>
          <View style={styles.rentInfo}>
            <ThemedText style={styles.rentAmount}>
              {roomData.monthlyRent}
            </ThemedText>
            <ThemedText style={styles.rentLabel}>per month</ThemedText>
          </View>
        </View>
      </ThemedView>

      {/* Quick Stats */}
      <ThemedView style={styles.statsSection}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Ionicons name="calendar-outline" size={24} color={colors.tint} />
            <ThemedText style={styles.statValue}>
              {leaseInfo.moveInDate}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Move-in Date</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Ionicons name="shield-outline" size={24} color="#34C759" />
            <ThemedText style={styles.statValue}>
              {leaseInfo.deposit}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Deposit</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Ionicons name="flash-outline" size={24} color="#FF9500" />
            <ThemedText style={styles.statValue}>
              {utilities.electricity.consumption}
            </ThemedText>
            <ThemedText style={styles.statLabel}>kWh Used</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Ionicons name="construct-outline" size={24} color="#FF3B30" />
            <ThemedText style={styles.statValue}>
              {
                maintenanceRequests.filter((r) => r.status === "in_progress")
                  .length
              }
            </ThemedText>
            <ThemedText style={styles.statLabel}>Open Tickets</ThemedText>
          </View>
        </View>
      </ThemedView>

      {/* Quick Actions */}
      <ThemedView style={styles.actionsSection}>
        <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.card }]}
            onPress={handleRequestMaintenance}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#FF950020" }]}>
              <Ionicons name="construct-outline" size={24} color="#FF9500" />
            </View>
            <ThemedText style={styles.actionTitle}>
              Request Maintenance
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.card }]}
            onPress={handleContactLandlord}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#007AFF20" }]}>
              <Ionicons name="chatbubble-outline" size={24} color="#007AFF" />
            </View>
            <ThemedText style={styles.actionTitle}>Message Landlord</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.card }]}
            onPress={handleRequestTransfer}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#34C75920" }]}>
              <Ionicons
                name="swap-horizontal-outline"
                size={24}
                color="#34C759"
              />
            </View>
            <ThemedText style={styles.actionTitle}>Request Transfer</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </ScrollView>
  );

  const renderLeaseInfo = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Lease Details</ThemedText>

        <View style={[styles.detailCard, { backgroundColor: colors.card }]}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.text} />
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>Move-in Date</ThemedText>
              <ThemedText style={styles.detailValue}>
                {leaseInfo.moveInDate}
              </ThemedText>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color={colors.text} />
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>Lease End Date</ThemedText>
              <ThemedText style={styles.detailValue}>
                {leaseInfo.leaseEndDate}
              </ThemedText>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="shield-outline" size={20} color={colors.text} />
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>
                Security Deposit
              </ThemedText>
              <ThemedText style={styles.detailValue}>
                {leaseInfo.deposit} {leaseInfo.depositPaid && "(Paid)"}
              </ThemedText>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="card-outline" size={20} color={colors.text} />
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>Monthly Rent</ThemedText>
              <ThemedText style={styles.detailValue}>
                {roomData.monthlyRent} (Due on {leaseInfo.rentDueDay}th of each
                month)
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
          <View style={styles.statusHeader}>
            <Ionicons
              name="document-text-outline"
              size={24}
              color={colors.tint}
            />
            <ThemedText style={styles.statusTitle}>Lease Status</ThemedText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: "#34C75920" }]}>
            <Ionicons name="checkmark-circle" size={16} color="#34C759" />
            <ThemedText style={[styles.statusText, { color: "#34C759" }]}>
              Active Lease
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </ScrollView>
  );

  const renderUtilities = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Utility Readings</ThemedText>

        {/* Electricity */}
        <View style={[styles.utilityCard, { backgroundColor: colors.card }]}>
          <View style={styles.utilityHeader}>
            <View
              style={[styles.utilityIcon, { backgroundColor: "#FF950020" }]}
            >
              <Ionicons name="flash-outline" size={24} color="#FF9500" />
            </View>
            <View style={styles.utilityInfo}>
              <ThemedText style={styles.utilityTitle}>Electricity</ThemedText>
              <ThemedText style={styles.utilitySubtitle}>
                Last reading: {utilities.electricity.lastReadingDate}
              </ThemedText>
            </View>
          </View>

          <View style={styles.utilityStats}>
            <View style={styles.utilityStat}>
              <ThemedText style={styles.utilityStatLabel}>Current</ThemedText>
              <ThemedText style={styles.utilityStatValue}>
                {utilities.electricity.currentReading} kWh
              </ThemedText>
            </View>
            <View style={styles.utilityStat}>
              <ThemedText style={styles.utilityStatLabel}>Previous</ThemedText>
              <ThemedText style={styles.utilityStatValue}>
                {utilities.electricity.previousReading} kWh
              </ThemedText>
            </View>
            <View style={styles.utilityStat}>
              <ThemedText style={styles.utilityStatLabel}>
                Consumption
              </ThemedText>
              <ThemedText
                style={[styles.utilityStatValue, { color: "#FF9500" }]}
              >
                {utilities.electricity.consumption} kWh
              </ThemedText>
            </View>
          </View>

          <View style={styles.utilityBill}>
            <ThemedText style={styles.utilityBillLabel}>
              Estimated Bill
            </ThemedText>
            <ThemedText
              style={[styles.utilityBillAmount, { color: "#FF9500" }]}
            >
              {utilities.electricity.estimatedBill}
            </ThemedText>
          </View>
        </View>

        {/* Water */}
        <View style={[styles.utilityCard, { backgroundColor: colors.card }]}>
          <View style={styles.utilityHeader}>
            <View
              style={[styles.utilityIcon, { backgroundColor: "#007AFF20" }]}
            >
              <Ionicons name="water-outline" size={24} color="#007AFF" />
            </View>
            <View style={styles.utilityInfo}>
              <ThemedText style={styles.utilityTitle}>Water</ThemedText>
              <ThemedText style={styles.utilitySubtitle}>
                Last reading: {utilities.water.lastReadingDate}
              </ThemedText>
            </View>
          </View>

          <View style={styles.utilityStats}>
            <View style={styles.utilityStat}>
              <ThemedText style={styles.utilityStatLabel}>Current</ThemedText>
              <ThemedText style={styles.utilityStatValue}>
                {utilities.water.currentReading} m³
              </ThemedText>
            </View>
            <View style={styles.utilityStat}>
              <ThemedText style={styles.utilityStatLabel}>Previous</ThemedText>
              <ThemedText style={styles.utilityStatValue}>
                {utilities.water.previousReading} m³
              </ThemedText>
            </View>
            <View style={styles.utilityStat}>
              <ThemedText style={styles.utilityStatLabel}>
                Consumption
              </ThemedText>
              <ThemedText
                style={[styles.utilityStatValue, { color: "#007AFF" }]}
              >
                {utilities.water.consumption} m³
              </ThemedText>
            </View>
          </View>

          <View style={styles.utilityBill}>
            <ThemedText style={styles.utilityBillLabel}>
              Estimated Bill
            </ThemedText>
            <ThemedText
              style={[styles.utilityBillAmount, { color: "#007AFF" }]}
            >
              {utilities.water.estimatedBill}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.tint}
          />
          <ThemedText style={styles.infoText}>
            Readings are updated monthly. Contact landlord for manual readings
            or billing questions.
          </ThemedText>
        </View>
      </ThemedView>
    </ScrollView>
  );

  const renderDocuments = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Document Library</ThemedText>

        {documents.map((doc) => (
          <TouchableOpacity
            key={doc.id}
            style={[styles.documentCard, { backgroundColor: colors.card }]}
            onPress={() => handleViewDocument(doc)}
          >
            <View style={styles.documentIcon}>
              <Ionicons
                name={
                  doc.type === "contract"
                    ? "document-text-outline"
                    : doc.type === "id"
                    ? "card-outline"
                    : "document-outline"
                }
                size={24}
                color={colors.tint}
              />
            </View>

            <View style={styles.documentInfo}>
              <ThemedText style={styles.documentName}>{doc.name}</ThemedText>
              <ThemedText style={styles.documentMeta}>
                {doc.type === "contract" ? "Signed" : "Uploaded"}:{" "}
                {doc.dateSigned || doc.dateUploaded}
              </ThemedText>
              <ThemedText style={styles.documentSize}>
                {doc.fileSize}
              </ThemedText>
            </View>

            <View style={styles.documentStatus}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(doc.status) + "20" },
                ]}
              >
                <Ionicons
                  name={getStatusIcon(doc.status)}
                  size={12}
                  color={getStatusColor(doc.status)}
                />
                <ThemedText
                  style={[
                    styles.statusText,
                    { color: getStatusColor(doc.status) },
                  ]}
                >
                  {doc.status}
                </ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#34C759" />
          <ThemedText style={styles.infoText}>
            All documents are securely stored and encrypted. Contract viewing is
            available for verification purposes.
          </ThemedText>
        </View>
      </ThemedView>
    </ScrollView>
  );

  const renderMaintenance = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>
            Maintenance Requests
          </ThemedText>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.tint }]}
            onPress={() => router.push("/tenant/maintenance")}
          >
            <Ionicons name="list" size={16} color="white" />
            <ThemedText style={styles.addButtonText}>View All</ThemedText>
          </TouchableOpacity>
        </View>

        {maintenanceRequests.map((request) => (
          <View
            key={request.id}
            style={[styles.maintenanceCard, { backgroundColor: colors.card }]}
          >
            <View style={styles.maintenanceHeader}>
              <View style={styles.maintenanceInfo}>
                <ThemedText style={styles.maintenanceTitle}>
                  {request.title}
                </ThemedText>
                <ThemedText style={styles.maintenanceDescription}>
                  {request.description}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.priorityBadge,
                  {
                    backgroundColor:
                      request.priority === "high"
                        ? "#FF3B3020"
                        : request.priority === "medium"
                        ? "#FF950020"
                        : "#34C75920",
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.priorityText,
                    {
                      color:
                        request.priority === "high"
                          ? "#FF3B30"
                          : request.priority === "medium"
                          ? "#FF9500"
                          : "#34C759",
                    },
                  ]}
                >
                  {request.priority}
                </ThemedText>
              </View>
            </View>

            <View style={styles.maintenanceStatus}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(request.status) + "20" },
                ]}
              >
                <Ionicons
                  name={getStatusIcon(request.status)}
                  size={12}
                  color={getStatusColor(request.status)}
                />
                <ThemedText
                  style={[
                    styles.statusText,
                    { color: getStatusColor(request.status) },
                  ]}
                >
                  {request.status.replace("_", " ")}
                </ThemedText>
              </View>

              <ThemedText style={styles.maintenanceDate}>
                Submitted: {request.submittedDate}
              </ThemedText>
            </View>

            {request.estimatedCompletion && (
              <View style={styles.maintenanceFooter}>
                <Ionicons name="time-outline" size={16} color={colors.text} />
                <ThemedText style={styles.estimatedCompletion}>
                  Est. completion: {request.estimatedCompletion}
                </ThemedText>
              </View>
            )}
          </View>
        ))}

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Ionicons name="construct-outline" size={20} color="#FF9500" />
          <ThemedText style={styles.infoText}>
            Maintenance requests are typically addressed within 24-48 hours.
            Urgent issues will be prioritized.
          </ThemedText>
        </View>
      </ThemedView>
    </ScrollView>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header with Room Photo and Contact */}
      <ThemedView style={styles.header}>
        <View style={styles.headerImageContainer}>
          <Image
            source={{ uri: roomData.images[0] }}
            style={styles.headerImage}
            resizeMode="cover"
          />
          <View style={styles.headerOverlay}>
            <View style={styles.headerContent}>
              <View style={styles.roomInfo}>
                <ThemedText style={styles.headerRoomNumber}>
                  {roomData.roomNumber}
                </ThemedText>
                <ThemedText style={styles.headerProperty}>
                  {roomData.property}
                </ThemedText>
              </View>
              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: colors.tint }]}
                onPress={handleContactLandlord}
              >
                <Ionicons name="call-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ThemedView>

      {/* Tab Navigation */}
      <View
        style={[styles.tabContainer, { backgroundColor: colors.background }]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && [
                  styles.activeTab,
                  { borderBottomColor: colors.tint },
                ],
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={activeTab === tab.id ? colors.tint : colors.text}
                style={{ opacity: activeTab === tab.id ? 1 : 0.6 }}
              />
              <ThemedText
                style={[
                  styles.tabLabel,
                  activeTab === tab.id && [
                    styles.activeTabLabel,
                    { color: colors.tint },
                  ],
                ]}
              >
                {tab.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>{renderTabContent()}</View>

      {/* Maintenance Request Modal */}
      <Modal
        visible={showServiceModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowServiceModal(false)}
      >
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowServiceModal(false);
                setMaintenanceDescription("");
              }}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>
              Maintenance Request
            </ThemedText>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedService && (
              <>
                <View
                  style={[
                    styles.servicePreview,
                    { backgroundColor: colors.card },
                  ]}
                >
                  <View
                    style={[
                      styles.serviceIcon,
                      { backgroundColor: selectedService.color + "20" },
                    ]}
                  >
                    <Ionicons
                      name={selectedService.icon}
                      size={32}
                      color={selectedService.color}
                    />
                  </View>
                  <ThemedText style={styles.servicePreviewTitle}>
                    {selectedService.title}
                  </ThemedText>
                  <ThemedText style={styles.servicePreviewDescription}>
                    {selectedService.description}
                  </ThemedText>
                </View>

                <View style={styles.requestForm}>
                  <ThemedText style={styles.formLabel}>
                    Describe your maintenance issue:
                  </ThemedText>
                  <TextInput
                    style={[
                      styles.textInput,
                      { backgroundColor: colors.card, color: colors.text },
                    ]}
                    placeholder="Please provide details about the issue..."
                    placeholderTextColor={colors.text + "50"}
                    multiline
                    numberOfLines={6}
                    value={maintenanceDescription}
                    onChangeText={setMaintenanceDescription}
                    textAlignVertical="top"
                  />

                  <View style={styles.prioritySection}>
                    <ThemedText style={styles.formLabel}>
                      Priority Level:
                    </ThemedText>
                    <View style={styles.priorityOptions}>
                      {["Low", "Medium", "High"].map((priority) => (
                        <TouchableOpacity
                          key={priority}
                          style={[
                            styles.priorityOption,
                            { backgroundColor: colors.card },
                          ]}
                        >
                          <ThemedText style={styles.priorityOptionText}>
                            {priority}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      { backgroundColor: colors.tint },
                    ]}
                    onPress={submitServiceRequest}
                  >
                    <ThemedText style={styles.submitButtonText}>
                      Submit Maintenance Request
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Room Transfer Modal */}
      <Modal
        visible={showTransferModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTransferModal(false)}
      >
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowTransferModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>
              Request Room Transfer
            </ThemedText>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View
              style={[styles.transferInfo, { backgroundColor: colors.card }]}
            >
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={colors.tint}
              />
              <ThemedText style={styles.transferInfoText}>
                Room transfers are subject to availability and landlord
                approval. Additional fees may apply.
              </ThemedText>
            </View>

            <View style={styles.transferForm}>
              <ThemedText style={styles.formLabel}>
                Reason for transfer:
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: colors.card, color: colors.text },
                ]}
                placeholder="Please explain why you want to transfer rooms..."
                placeholderTextColor={colors.text + "50"}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.tint }]}
                onPress={submitTransferRequest}
              >
                <ThemedText style={styles.submitButtonText}>
                  Submit Transfer Request
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 200,
    position: "relative",
  },
  headerImageContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: 20,
    paddingBottom: 30,
  },
  roomInfo: {
    flex: 1,
  },
  headerRoomNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  headerProperty: {
    fontSize: 16,
    color: "white",
    opacity: 0.9,
  },
  contactButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  tabScroll: {
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  activeTabLabel: {
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },

  // Overview Styles
  detailsSection: {
    padding: 16,
  },
  roomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  roomNumber: {
    fontSize: 24,
    fontWeight: "bold",
  },
  roomType: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  rentInfo: {
    alignItems: "flex-end",
  },
  rentAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
  },
  rentLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  statsSection: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 60) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
  },
  actionsSection: {
    padding: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },

  // Lease Info Styles
  detailCard: {
    padding: 16,
    borderRadius: 12,
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
  statusCard: {
    padding: 16,
    borderRadius: 12,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
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

  // Utilities Styles
  utilityCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  utilityHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  utilityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  utilityInfo: {
    flex: 1,
  },
  utilityTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  utilitySubtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  utilityStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  utilityStat: {
    alignItems: "center",
    flex: 1,
  },
  utilityStatLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  utilityStatValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  utilityBill: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
  },
  utilityBillLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  utilityBillAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },

  // Documents Styles
  documentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  documentSize: {
    fontSize: 12,
    opacity: 0.6,
  },
  documentStatus: {
    alignItems: "flex-end",
  },

  // Maintenance Styles
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
  maintenanceInfo: {
    flex: 1,
    marginRight: 12,
  },
  maintenanceTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  maintenanceDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
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
  maintenanceStatus: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  maintenanceDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  maintenanceFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
  },
  estimatedCompletion: {
    fontSize: 12,
    opacity: 0.7,
  },

  // Info Card
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    opacity: 0.8,
    lineHeight: 16,
  },

  // Modal Styles
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
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  servicePreview: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  serviceIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  servicePreviewTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  servicePreviewDescription: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
  requestForm: {
    flex: 1,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E5E5E7",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  prioritySection: {
    marginTop: 20,
    marginBottom: 20,
  },
  priorityOptions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  priorityOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  submitButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  transferInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  transferInfoText: {
    flex: 1,
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  transferForm: {
    flex: 1,
  },
  imageSection: {
    position: "relative",
  },
  imageCarousel: {
    height: 240,
  },
  roomImage: {
    width: width,
    height: 240,
  },
  imageIndicator: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounter: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  detailsSection: {
    padding: 16,
  },
  roomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  roomNumber: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  roomType: {
    fontSize: 16,
    opacity: 0.7,
  },
  rentInfo: {
    alignItems: "flex-end",
  },
  rentAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  rentLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  contractDetails: {
    gap: 16,
  },
  contractItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contractText: {
    flex: 1,
  },
  contractLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  contractValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  amenitiesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  amenityItem: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  unavailableAmenity: {
    opacity: 0.6,
  },
  amenityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  amenityName: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 4,
  },
  unavailableText: {
    opacity: 0.6,
  },
  unavailableLabel: {
    fontSize: 12,
    opacity: 0.5,
    fontStyle: "italic",
  },
  serviceSection: {
    padding: 16,
  },
  serviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  serviceCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 16,
  },
  rulesSection: {
    padding: 16,
    paddingBottom: 40,
  },
  rulesContainer: {
    padding: 16,
    borderRadius: 12,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
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
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  servicePreview: {
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  servicePreviewTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  servicePreviewDescription: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
  requestForm: {
    flex: 1,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
  },
  textArea: {
    minHeight: 120,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  placeholder: {
    opacity: 0.5,
    lineHeight: 20,
  },
  submitButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
