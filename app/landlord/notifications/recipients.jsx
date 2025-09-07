import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function RecipientsScreen() {
  const [selectedTenants, setSelectedTenants] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const { subject, message, templateId } = params;

  // Mock tenants data
  const tenants = [
    {
      id: "t1",
      name: "Juan Dela Cruz",
      roomNumber: "101",
      property: "Sunset Apartments",
      email: "juan.delacruz@email.com",
      phone: "+63 917 123 4567",
      avatar: "https://via.placeholder.com/40x40/007AFF/FFFFFF?text=JD",
    },
    {
      id: "t2",
      name: "Maria Santos",
      roomNumber: "205",
      property: "Sunset Apartments",
      email: "maria.santos@email.com",
      phone: "+63 917 234 5678",
      avatar: "https://via.placeholder.com/40x40/34C759/FFFFFF?text=MS",
    },
    {
      id: "t3",
      name: "Pedro Reyes",
      roomNumber: "305",
      property: "Sunset Apartments",
      email: "pedro.reyes@email.com",
      phone: "+63 917 345 6789",
      avatar: "https://via.placeholder.com/40x40/FF9500/FFFFFF?text=PR",
    },
    {
      id: "t4",
      name: "Ana Garcia",
      roomNumber: "102",
      property: "Sunset Apartments",
      email: "ana.garcia@email.com",
      phone: "+63 917 456 7890",
      avatar: "https://via.placeholder.com/40x40/FF3B30/FFFFFF?text=AG",
    },
    {
      id: "t5",
      name: "Carlos Mendoza",
      roomNumber: "202",
      property: "Sunset Apartments",
      email: "carlos.mendoza@email.com",
      phone: "+63 917 567 8901",
      avatar: "https://via.placeholder.com/40x40/5856D6/FFFFFF?text=CM",
    },
  ];

  const toggleTenantSelection = (tenantId) => {
    if (selectedTenants.includes(tenantId)) {
      setSelectedTenants(selectedTenants.filter((id) => id !== tenantId));
      setSelectAll(false);
    } else {
      setSelectedTenants([...selectedTenants, tenantId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedTenants([]);
      setSelectAll(false);
    } else {
      setSelectedTenants(tenants.map((tenant) => tenant.id));
      setSelectAll(true);
    }
  };

  const handlePreview = () => {
    if (selectedTenants.length === 0) {
      Alert.alert("No Recipients", "Please select at least one recipient.");
      return;
    }

    const selectedTenantData = tenants.filter((tenant) =>
      selectedTenants.includes(tenant.id)
    );

    router.push({
      pathname: "/landlord/notifications/preview",
      params: {
        subject: subject,
        message: message,
        templateId: templateId,
        recipients: JSON.stringify(selectedTenantData),
        recipientIds: JSON.stringify(selectedTenants),
      },
    });
  };

  const renderTenantItem = ({ item }) => {
    const isSelected = selectedTenants.includes(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.tenantItem,
          {
            backgroundColor: colors.card,
            borderColor: isSelected ? colors.tint : colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => toggleTenantSelection(item.id)}
      >
        <View style={styles.tenantInfo}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: isSelected ? colors.tint + "20" : "#F2F2F7" },
            ]}
          >
            <ThemedText style={styles.avatarText}>
              {item.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </ThemedText>
          </View>

          <View style={styles.tenantDetails}>
            <ThemedText style={styles.tenantName}>{item.name}</ThemedText>
            <ThemedText style={styles.tenantRoom}>
              Room {item.roomNumber} • {item.property}
            </ThemedText>
            <ThemedText style={styles.tenantContact}>
              {item.phone} • {item.email}
            </ThemedText>
          </View>
        </View>

        <View style={styles.selectionIndicator}>
          {isSelected ? (
            <Ionicons name="checkmark-circle" size={24} color={colors.tint} />
          ) : (
            <View
              style={[styles.unselectedCircle, { borderColor: colors.border }]}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Select Recipients</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {selectedTenants.length} of {tenants.length} selected
          </ThemedText>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Select All Button */}
      <View style={styles.selectAllContainer}>
        <TouchableOpacity
          style={[
            styles.selectAllButton,
            {
              backgroundColor: selectAll ? colors.tint : colors.card,
              borderColor: selectAll ? colors.tint : colors.border,
            },
          ]}
          onPress={toggleSelectAll}
        >
          <Ionicons
            name={selectAll ? "checkmark-circle" : "ellipse-outline"}
            size={20}
            color={selectAll ? "white" : colors.text}
          />
          <ThemedText
            style={[
              styles.selectAllText,
              { color: selectAll ? "white" : colors.text },
            ]}
          >
            Select All Tenants
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Recipients List */}
      <FlatList
        data={tenants}
        renderItem={renderTenantItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.tenantsList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="people-outline"
              size={64}
              color={colors.tabIconDefault}
            />
            <ThemedText style={styles.emptyStateTitle}>
              No tenants found
            </ThemedText>
            <ThemedText style={styles.emptyStateMessage}>
              You don't have any tenants to send notifications to.
            </ThemedText>
          </View>
        }
      />

      {/* Bottom Actions */}
      <View
        style={[styles.bottomActions, { backgroundColor: colors.background }]}
      >
        <TouchableOpacity
          style={[
            styles.previewButton,
            {
              backgroundColor:
                selectedTenants.length > 0 ? colors.tint : "#CCCCCC",
            },
          ]}
          onPress={handlePreview}
          disabled={selectedTenants.length === 0}
        >
          <ThemedText
            style={[
              styles.previewButtonText,
              {
                color: selectedTenants.length > 0 ? "white" : "#999999",
              },
            ]}
          >
            Preview Message ({selectedTenants.length})
          </ThemedText>
          <Ionicons
            name="eye-outline"
            size={20}
            color={selectedTenants.length > 0 ? "white" : "#999999"}
          />
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  selectAllContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  selectAllButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectAllText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
  },
  tenantsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tenantItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  tenantInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  tenantDetails: {
    flex: 1,
  },
  tenantName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  tenantRoom: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 2,
  },
  tenantContact: {
    fontSize: 12,
    opacity: 0.6,
  },
  selectionIndicator: {
    marginLeft: 12,
  },
  unselectedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
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
  bottomActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
  },
  previewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
});
