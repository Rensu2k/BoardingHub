import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function OfflineSettings() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Offline settings state
  const [offlineSettings, setOfflineSettings] = useState({
    // Auto Download
    autoDownloadBills: true,
    autoDownloadReceipts: true,
    autoDownloadDocuments: false,
    autoDownloadMessages: true,

    // Sync Settings
    autoSyncOnWifi: true,
    autoSyncOnCellular: false,
    backgroundSync: true,

    // Cache Settings
    cacheImages: true,
    cacheBills: true,
    cacheMessages: true,

    // Data Usage
    compressImages: true,
    lowDataMode: false,
  });

  const [cacheInfo, setCacheInfo] = useState({
    totalCacheSize: "45.2 MB",
    billsCache: "12.1 MB",
    imagesCache: "28.4 MB",
    messagesCache: "4.7 MB",
    lastClearDate: "2024-01-15",
  });

  const [storageInfo, setStorageInfo] = useState({
    totalStorage: "64 GB",
    usedStorage: "23.4 GB",
    availableStorage: "40.6 GB",
    appStorage: "156 MB",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);

  // Simulate getting storage info
  useEffect(() => {
    // In a real app, you'd get actual device storage info
    const updateStorageInfo = () => {
      // Mock storage calculation
      setStorageInfo((prev) => ({
        ...prev,
        // Update with real values
      }));
    };

    updateStorageInfo();
  }, []);

  const handleSettingToggle = (key) => {
    setOfflineSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real app, this would save to backend and update local settings
      console.log("Offline settings saved:", offlineSettings);

      Alert.alert(
        "Settings Saved",
        "Your offline preferences have been updated successfully.",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = (cacheType = "all") => {
    const cacheTypeMap = {
      all: "all cached data",
      bills: "bill cache",
      images: "image cache",
      messages: "message cache",
    };

    Alert.alert(
      "Clear Cache",
      `This will delete ${cacheTypeMap[cacheType]} to free up storage space. You can always re-download this data when needed.\n\nAre you sure you want to continue?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Cache",
          style: "destructive",
          onPress: async () => {
            setIsClearingCache(true);
            try {
              // Simulate cache clearing
              await new Promise((resolve) => setTimeout(resolve, 2000));

              // Update cache info
              setCacheInfo((prev) => {
                const newInfo = { ...prev };
                const currentDate = new Date().toISOString().split("T")[0];

                switch (cacheType) {
                  case "all":
                    newInfo.totalCacheSize = "0 MB";
                    newInfo.billsCache = "0 MB";
                    newInfo.imagesCache = "0 MB";
                    newInfo.messagesCache = "0 MB";
                    break;
                  case "bills":
                    newInfo.billsCache = "0 MB";
                    break;
                  case "images":
                    newInfo.imagesCache = "0 MB";
                    break;
                  case "messages":
                    newInfo.messagesCache = "0 MB";
                    break;
                }

                // Recalculate total if not clearing all
                if (cacheType !== "all") {
                  const bills = parseFloat(newInfo.billsCache);
                  const images = parseFloat(newInfo.imagesCache);
                  const messages = parseFloat(newInfo.messagesCache);
                  newInfo.totalCacheSize = `${(
                    bills +
                    images +
                    messages
                  ).toFixed(1)} MB`;
                }

                newInfo.lastClearDate = currentDate;
                return newInfo;
              });

              Alert.alert(
                "Cache Cleared",
                "Cache has been cleared successfully."
              );
            } catch (error) {
              Alert.alert("Error", "Failed to clear cache. Please try again.");
            } finally {
              setIsClearingCache(false);
            }
          },
        },
      ]
    );
  };

  const handleForceSync = async () => {
    Alert.alert(
      "Force Sync",
      "This will sync all your data now. This may use cellular data if WiFi is not available.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sync Now",
          onPress: async () => {
            // Simulate sync process
            try {
              await new Promise((resolve) => setTimeout(resolve, 3000));
              Alert.alert(
                "Sync Complete",
                "All data has been synced successfully."
              );
            } catch (error) {
              Alert.alert(
                "Sync Failed",
                "Failed to sync data. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const getStoragePercentage = () => {
    const used = parseFloat(storageInfo.usedStorage);
    const total = parseFloat(storageInfo.totalStorage);
    return (used / total) * 100;
  };

  const offlineSections = [
    {
      title: "Auto Download",
      description: "Automatically download content for offline access",
      items: [
        {
          key: "autoDownloadBills",
          title: "Bills & Invoices",
          description: "Download new bills automatically",
          icon: "receipt-outline",
        },
        {
          key: "autoDownloadReceipts",
          title: "Payment Receipts",
          description: "Download payment confirmations",
          icon: "checkmark-circle-outline",
        },
        {
          key: "autoDownloadDocuments",
          title: "Documents",
          description: "Download lease and property documents",
          icon: "document-outline",
        },
        {
          key: "autoDownloadMessages",
          title: "Messages",
          description: "Download messages for offline reading",
          icon: "chatbubble-outline",
        },
      ],
    },
    {
      title: "Sync Settings",
      description: "Control when data synchronization occurs",
      items: [
        {
          key: "autoSyncOnWifi",
          title: "Auto Sync on WiFi",
          description: "Automatically sync when connected to WiFi",
          icon: "wifi-outline",
        },
        {
          key: "autoSyncOnCellular",
          title: "Auto Sync on Cellular",
          description: "Sync using mobile data (may incur charges)",
          icon: "cellular-outline",
        },
        {
          key: "backgroundSync",
          title: "Background Sync",
          description: "Sync data when app is in background",
          icon: "refresh-outline",
        },
      ],
    },
    {
      title: "Cache Settings",
      description: "Manage offline storage and caching",
      items: [
        {
          key: "cacheImages",
          title: "Cache Images",
          description: "Store images locally for faster loading",
          icon: "image-outline",
        },
        {
          key: "cacheBills",
          title: "Cache Bills",
          description: "Store bill data offline",
          icon: "receipt-outline",
        },
        {
          key: "cacheMessages",
          title: "Cache Messages",
          description: "Store messages for offline access",
          icon: "chatbubble-outline",
        },
      ],
    },
    {
      title: "Data Usage",
      description: "Optimize data consumption and quality",
      items: [
        {
          key: "compressImages",
          title: "Compress Images",
          description: "Reduce image quality to save data",
          icon: "contract-outline",
        },
        {
          key: "lowDataMode",
          title: "Low Data Mode",
          description: "Minimize data usage across the app",
          icon: "speedometer-outline",
        },
      ],
    },
  ];

  const renderOfflineItem = (item) => (
    <View
      key={item.key}
      style={[styles.offlineItem, { backgroundColor: colors.background }]}
    >
      <View style={styles.offlineInfo}>
        <View style={styles.offlineIcon}>
          <Ionicons
            name={item.icon}
            size={20}
            color={offlineSettings[item.key] ? colors.tint : colors.text + "60"}
          />
        </View>
        <View style={styles.offlineContent}>
          <ThemedText style={styles.offlineTitle}>{item.title}</ThemedText>
          <ThemedText style={styles.offlineDescription}>
            {item.description}
          </ThemedText>
        </View>
      </View>
      <Switch
        value={offlineSettings[item.key]}
        onValueChange={() => handleSettingToggle(item.key)}
        trackColor={{
          false: colors.text + "30",
          true: colors.tint + "50",
        }}
        thumbColor={offlineSettings[item.key] ? colors.tint : colors.text}
      />
    </View>
  );

  const renderSection = (section) => (
    <ThemedView
      key={section.title}
      style={[styles.section, { backgroundColor: colors.card }]}
    >
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
        <ThemedText style={styles.sectionDescription}>
          {section.description}
        </ThemedText>
      </View>
      <View style={styles.sectionContent}>
        {section.items.map(renderOfflineItem)}
      </View>
    </ThemedView>
  );

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
        <ThemedText style={styles.headerTitle}>Offline & Data</ThemedText>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveSettings}
          disabled={isLoading}
        >
          <ThemedText style={[styles.saveText, { color: colors.tint }]}>
            {isLoading ? "Saving..." : "Save"}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Storage Overview */}
        <ThemedView
          style={[styles.storageCard, { backgroundColor: colors.card }]}
        >
          <View style={styles.storageHeader}>
            <View style={styles.storageIcon}>
              <Ionicons name="server-outline" size={24} color={colors.tint} />
            </View>
            <View style={styles.storageInfo}>
              <ThemedText style={styles.storageTitle}>
                Device Storage
              </ThemedText>
              <ThemedText style={styles.storageSubtitle}>
                {storageInfo.usedStorage} of {storageInfo.totalStorage} used
              </ThemedText>
            </View>
          </View>

          <View style={styles.storageBar}>
            <View
              style={[
                styles.storageProgress,
                {
                  width: `${getStoragePercentage()}%`,
                  backgroundColor: colors.tint,
                },
              ]}
            />
          </View>

          <View style={styles.storageDetails}>
            <View style={styles.storageDetailItem}>
              <ThemedText style={styles.storageDetailLabel}>
                Available
              </ThemedText>
              <ThemedText style={styles.storageDetailValue}>
                {storageInfo.availableStorage}
              </ThemedText>
            </View>
            <View style={styles.storageDetailItem}>
              <ThemedText style={styles.storageDetailLabel}>
                App Data
              </ThemedText>
              <ThemedText style={styles.storageDetailValue}>
                {storageInfo.appStorage}
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Cache Management */}
        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Cache Management
            </ThemedText>
            <ThemedText style={styles.sectionDescription}>
              Manage cached data to free up storage space
            </ThemedText>
          </View>

          <View style={styles.cacheGrid}>
            <View style={styles.cacheItem}>
              <ThemedText style={styles.cacheValue}>
                {cacheInfo.totalCacheSize}
              </ThemedText>
              <ThemedText style={styles.cacheLabel}>Total Cache</ThemedText>
            </View>
            <View style={styles.cacheItem}>
              <ThemedText style={styles.cacheValue}>
                {cacheInfo.billsCache}
              </ThemedText>
              <ThemedText style={styles.cacheLabel}>Bills</ThemedText>
            </View>
            <View style={styles.cacheItem}>
              <ThemedText style={styles.cacheValue}>
                {cacheInfo.imagesCache}
              </ThemedText>
              <ThemedText style={styles.cacheLabel}>Images</ThemedText>
            </View>
            <View style={styles.cacheItem}>
              <ThemedText style={styles.cacheValue}>
                {cacheInfo.messagesCache}
              </ThemedText>
              <ThemedText style={styles.cacheLabel}>Messages</ThemedText>
            </View>
          </View>

          <View style={styles.cacheActions}>
            <TouchableOpacity
              style={[
                styles.cacheButton,
                {
                  backgroundColor: colors.tint + "20",
                  borderColor: colors.tint,
                },
              ]}
              onPress={() => handleClearCache("all")}
              disabled={isClearingCache}
            >
              <Ionicons name="trash-outline" size={20} color={colors.tint} />
              <ThemedText
                style={[styles.cacheButtonText, { color: colors.tint }]}
              >
                {isClearingCache ? "Clearing..." : "Clear All Cache"}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ThemedText style={styles.cacheNote}>
            Last cleared:{" "}
            {new Date(cacheInfo.lastClearDate).toLocaleDateString()}
          </ThemedText>
        </ThemedView>

        {/* Offline Settings Sections */}
        {offlineSections.map(renderSection)}

        {/* Sync Actions */}
        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Sync Actions</ThemedText>
            <ThemedText style={styles.sectionDescription}>
              Manually control data synchronization
            </ThemedText>
          </View>

          <View style={styles.syncActions}>
            <TouchableOpacity
              style={[
                styles.syncButton,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.text + "30",
                },
              ]}
              onPress={handleForceSync}
            >
              <Ionicons name="refresh-outline" size={20} color={colors.text} />
              <View style={styles.syncButtonContent}>
                <ThemedText style={styles.syncButtonTitle}>
                  Force Sync Now
                </ThemedText>
                <ThemedText style={styles.syncButtonDescription}>
                  Sync all data immediately
                </ThemedText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.syncButton,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.text + "30",
                },
              ]}
              onPress={() =>
                Alert.alert(
                  "Sync Status",
                  "Last sync: 2 minutes ago\nNext sync: In 28 minutes"
                )
              }
            >
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={colors.text}
              />
              <View style={styles.syncButtonContent}>
                <ThemedText style={styles.syncButtonTitle}>
                  Sync Status
                </ThemedText>
                <ThemedText style={styles.syncButtonDescription}>
                  View sync information
                </ThemedText>
              </View>
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Data Usage Tips */}
        <View style={[styles.tipsCard, { backgroundColor: colors.card }]}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={20} color={colors.tint} />
            <ThemedText style={styles.tipsTitle}>Data Saving Tips</ThemedText>
          </View>
          <View style={styles.tipsList}>
            <ThemedText style={styles.tipText}>
              • Enable "Low Data Mode" to reduce overall data usage
            </ThemedText>
            <ThemedText style={styles.tipText}>
              • Use WiFi for auto-sync to avoid cellular charges
            </ThemedText>
            <ThemedText style={styles.tipText}>
              • Clear cache regularly to free up storage space
            </ThemedText>
            <ThemedText style={styles.tipText}>
              • Compress images when on limited data plans
            </ThemedText>
          </View>
        </View>
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
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  saveButton: {
    padding: 4,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  storageCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  storageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  storageIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#007AFF20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  storageInfo: {
    flex: 1,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  storageSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  storageBar: {
    height: 8,
    backgroundColor: "#E5E5E7",
    borderRadius: 4,
    marginBottom: 16,
    overflow: "hidden",
  },
  storageProgress: {
    height: "100%",
  },
  storageDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  storageDetailItem: {
    alignItems: "center",
  },
  storageDetailLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  storageDetailValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  sectionContent: {
    gap: 1,
  },
  offlineItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
  },
  offlineInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 16,
  },
  offlineIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#F0F0F0",
  },
  offlineContent: {
    flex: 1,
  },
  offlineTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  offlineDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 18,
  },
  cacheGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  cacheItem: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
  },
  cacheValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cacheLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
  },
  cacheActions: {
    marginBottom: 12,
  },
  cacheButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  cacheButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cacheNote: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: "center",
  },
  syncActions: {
    gap: 12,
  },
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  syncButtonContent: {
    flex: 1,
  },
  syncButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  syncButtonDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  tipsCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  tipsList: {
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
});
