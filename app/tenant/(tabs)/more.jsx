import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
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
import { auth, db } from "@/constants/firebase";
import { useColorScheme } from "@/hooks/useColorScheme";
import { usePullRefresh } from "@/hooks/usePullRefresh";

export default function More() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  const { refreshing, onRefresh } = usePullRefresh(refreshProfile);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            router.replace("/auth/login");
          } catch (error) {
            console.error("Error signing out:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  const menuSections = [
    {
      title: "Account",
      items: [
        {
          id: 1,
          title: "Personal Information",
          icon: "person-outline",
          action: () => Alert.alert("Profile", "Edit profile coming soon!"),
        },
        {
          id: 2,
          title: "Payment Methods",
          icon: "card-outline",
          action: () => Alert.alert("Payment", "Payment methods coming soon!"),
        },
        {
          id: 3,
          title: "Documents",
          icon: "document-outline",
          action: () =>
            Alert.alert("Documents", "Document management coming soon!"),
        },
        {
          id: 4,
          title: "Emergency Contacts",
          icon: "call-outline",
          action: () =>
            Alert.alert("Contacts", "Emergency contacts coming soon!"),
        },
      ],
    },
    {
      title: "Property",
      items: [
        {
          id: 5,
          title: "Lease Agreement",
          icon: "document-text-outline",
          action: () => Alert.alert("Lease", "Lease agreement coming soon!"),
        },
        {
          id: 6,
          title: "House Rules",
          icon: "list-outline",
          action: () => Alert.alert("Rules", "House rules coming soon!"),
        },
        {
          id: 7,
          title: "Property Info",
          icon: "home-outline",
          action: () => Alert.alert("Property", "Property info coming soon!"),
        },
        {
          id: 8,
          title: "Amenities",
          icon: "star-outline",
          action: () => Alert.alert("Amenities", "Amenities list coming soon!"),
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          id: 9,
          title: "Contact Landlord",
          icon: "chatbubble-outline",
          action: () => Alert.alert("Contact", "Contact landlord coming soon!"),
        },
        {
          id: 10,
          title: "Help & FAQ",
          icon: "help-circle-outline",
          action: () => Alert.alert("Help", "Help & FAQ coming soon!"),
        },
        {
          id: 11,
          title: "Report Issue",
          icon: "flag-outline",
          action: () => Alert.alert("Report", "Report issue coming soon!"),
        },
        {
          id: 12,
          title: "Feedback",
          icon: "thumbs-up-outline",
          action: () => Alert.alert("Feedback", "Feedback form coming soon!"),
        },
      ],
    },
  ];

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, { backgroundColor: colors.card }]}
      onPress={item.action}
    >
      <View style={styles.menuItemLeft}>
        <View
          style={[styles.menuIcon, { backgroundColor: colors.tint + "20" }]}
        >
          <Ionicons name={item.icon} size={20} color={colors.tint} />
        </View>
        <ThemedText style={styles.menuTitle}>{item.title}</ThemedText>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.text}
        style={{ opacity: 0.5 }}
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ThemedText>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>More</ThemedText>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => Alert.alert("Notifications", "No new notifications")}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>
      </ThemedView>

      <ScrollView
        style={styles.scrollView}
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
        {/* Profile Section */}
        <ThemedView style={styles.profileSection}>
          <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
            <View
              style={[styles.avatar, { backgroundColor: colors.tint + "20" }]}
            >
              <ThemedText style={[styles.avatarText, { color: colors.tint }]}>
                {userProfile?.firstName?.charAt(0) || "T"}
                {userProfile?.lastName?.charAt(0) || "U"}
              </ThemedText>
            </View>
            <View style={styles.profileInfo}>
              <ThemedText style={styles.profileName}>
                {userProfile
                  ? `${userProfile.firstName} ${userProfile.lastName}`
                  : "Tenant User"}
              </ThemedText>
              <ThemedText style={styles.profileEmail}>
                {userProfile?.email || "tenant@example.com"}
              </ThemedText>
              <View style={styles.roomBadge}>
                <Ionicons name="home" size={14} color={colors.tint} />
                <ThemedText style={[styles.roomText, { color: colors.tint }]}>
                  Room A-101
                </ThemedText>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() =>
                Alert.alert("Edit Profile", "Edit profile coming soon!")
              }
            >
              <Ionicons name="create-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Quick Stats */}
        <ThemedView style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <ThemedText style={styles.statValue}>8</ThemedText>
              <ThemedText style={styles.statLabel}>Months</ThemedText>
              <ThemedText style={styles.statSubLabel}>Tenancy</ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <ThemedText style={styles.statValue}>12</ThemedText>
              <ThemedText style={styles.statLabel}>Bills Paid</ThemedText>
              <ThemedText style={styles.statSubLabel}>This Year</ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <ThemedText style={styles.statValue}>₱40K</ThemedText>
              <ThemedText style={styles.statLabel}>Total Paid</ThemedText>
              <ThemedText style={styles.statSubLabel}>This Year</ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Settings */}
        <ThemedView style={styles.settingsSection}>
          <ThemedText style={styles.sectionTitle}>Settings</ThemedText>
          <View style={styles.settingsList}>
            <View
              style={[styles.settingItem, { backgroundColor: colors.card }]}
            >
              <View style={styles.settingInfo}>
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={colors.text}
                />
                <ThemedText style={styles.settingTitle}>
                  Push Notifications
                </ThemedText>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{
                  false: colors.text + "30",
                  true: colors.tint + "50",
                }}
                thumbColor={notificationsEnabled ? colors.tint : colors.text}
              />
            </View>
            <View
              style={[styles.settingItem, { backgroundColor: colors.card }]}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="moon-outline" size={20} color={colors.text} />
                <ThemedText style={styles.settingTitle}>Dark Mode</ThemedText>
              </View>
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{
                  false: colors.text + "30",
                  true: colors.tint + "50",
                }}
                thumbColor={darkModeEnabled ? colors.tint : colors.text}
              />
            </View>
          </View>
        </ThemedView>

        {/* Menu Sections */}
        {menuSections.map((section, index) => (
          <ThemedView key={index} style={styles.menuSection}>
            <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
            <View style={styles.menuList}>
              {section.items.map(renderMenuItem)}
            </View>
          </ThemedView>
        ))}

        {/* Logout */}
        <ThemedView style={styles.logoutSection}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.card }]}
            onPress={handleLogout}
          >
            <View style={styles.logoutIcon}>
              <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            </View>
            <ThemedText style={[styles.logoutText, { color: "#FF3B30" }]}>
              Logout
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* App Info */}
        <ThemedView style={styles.appInfoSection}>
          <ThemedText style={styles.appVersion}>BoardingHub v1.0.0</ThemedText>
          <ThemedText style={styles.appCopyright}>
            © 2024 BoardingHub. All rights reserved.
          </ThemedText>
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
    padding: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  notificationButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    padding: 16,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  roomBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  roomText: {
    fontSize: 12,
    fontWeight: "500",
  },
  editProfileButton: {
    padding: 8,
  },
  statsSection: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  statSubLabel: {
    fontSize: 10,
    opacity: 0.6,
  },
  settingsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  settingsList: {
    gap: 1,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  menuSection: {
    padding: 16,
  },
  menuList: {
    gap: 1,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  logoutSection: {
    padding: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  logoutIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#FF3B3020",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "500",
  },
  appInfoSection: {
    padding: 16,
    alignItems: "center",
    paddingBottom: 40,
  },
  appVersion: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    opacity: 0.5,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
