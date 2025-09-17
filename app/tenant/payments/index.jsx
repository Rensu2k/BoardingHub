import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TenantHeader } from "@/components/tenant";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function PaymentsIndex() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const navigationOptions = [
    {
      title: "My Bills",
      subtitle: "View and manage current bills",
      icon: "receipt-outline",
      route: "/tenant/(tabs)/bills",
      color: "#FF9500",
    },
    {
      title: "Payment History",
      subtitle: "View past payments and download receipts",
      icon: "time-outline",
      route: "/tenant/payments/payment-history",
      color: "#34C759",
    },
    {
      title: "Upload Payment Proof",
      subtitle: "Submit payment verification",
      icon: "cloud-upload-outline",
      route: "/tenant/(tabs)/bills", // Will navigate to bills then they can select one
      color: "#007AFF",
    },
  ];

  const handleNavigation = (route) => {
    router.push(route);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <TenantHeader title="Payments" />

      <ThemedView style={styles.content}>
        <View style={styles.welcomeSection}>
          <ThemedText style={styles.welcomeTitle}>
            Payment Management
          </ThemedText>
          <ThemedText style={styles.welcomeSubtitle}>
            Manage your bills, view payment history, and download receipts
          </ThemedText>
        </View>

        <View style={styles.optionsContainer}>
          {navigationOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.optionCard, { backgroundColor: colors.card }]}
              onPress={() => handleNavigation(option.route)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: option.color + "20" },
                ]}
              >
                <Ionicons name={option.icon} size={24} color={option.color} />
              </View>
              <View style={styles.optionContent}>
                <ThemedText style={styles.optionTitle}>
                  {option.title}
                </ThemedText>
                <ThemedText style={styles.optionSubtitle}>
                  {option.subtitle}
                </ThemedText>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.text}
                style={{ opacity: 0.5 }}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <View style={styles.infoHeader}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={colors.tint}
            />
            <ThemedText style={[styles.infoTitle, { color: colors.tint }]}>
              Quick Tips
            </ThemedText>
          </View>
          <View style={styles.infoContent}>
            <ThemedText style={styles.infoText}>
              • Upload payment proof immediately after payment for faster
              processing
            </ThemedText>
            <ThemedText style={styles.infoText}>
              • Download receipts for approved payments as PDF documents
            </ThemedText>
            <ThemedText style={styles.infoText}>
              • All payment records are immutable once approved by your landlord
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  infoContent: {
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});
