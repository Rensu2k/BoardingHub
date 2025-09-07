import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

const { width } = Dimensions.get("window");

export default function SelectPeriodScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  const router = useRouter();
  const { propertyId, propertyName, selectedRooms } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const selectedRoomsData = JSON.parse(selectedRooms || "[]");

  // Generate billing periods for the next 12 months
  const generateBillingPeriods = () => {
    const periods = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const periodDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const periodEndDate = new Date(
        now.getFullYear(),
        now.getMonth() + i + 1,
        0
      );

      periods.push({
        id: `period_${i}`,
        month: periodDate.toLocaleString("default", { month: "long" }),
        year: periodDate.getFullYear(),
        billingMonth: periodDate.getMonth(),
        billingYear: periodDate.getFullYear(),
        startDate: periodDate.toISOString().split("T")[0],
        endDate: periodEndDate.toISOString().split("T")[0],
        displayName: `${periodDate.toLocaleString("default", {
          month: "long",
        })} ${periodDate.getFullYear()}`,
        isCurrentMonth: i === 0,
      });
    }

    return periods;
  };

  const billingPeriods = generateBillingPeriods();

  const handleNext = () => {
    if (!selectedPeriod) {
      Alert.alert(
        "Selection Required",
        "Please select a billing period to continue."
      );
      return;
    }

    router.push({
      pathname: "/landlord/billing/adjust-charges",
      params: {
        propertyId,
        propertyName,
        selectedRooms,
        billingPeriod: JSON.stringify(selectedPeriod),
      },
    });
  };

  const PeriodCard = ({ period }) => {
    const isSelected = selectedPeriod?.id === period.id;

    return (
      <TouchableOpacity
        style={[
          styles.periodCard,
          {
            backgroundColor: colors.card,
            borderColor: isSelected ? colors.tint : "transparent",
            borderWidth: isSelected ? 2 : 0,
          },
        ]}
        onPress={() => setSelectedPeriod(period)}
      >
        <View style={styles.periodHeader}>
          <View style={styles.periodInfo}>
            <ThemedText style={styles.periodMonth}>{period.month}</ThemedText>
            <ThemedText style={styles.periodYear}>{period.year}</ThemedText>
          </View>

          {isSelected && (
            <View
              style={[
                styles.selectionIndicator,
                { backgroundColor: colors.tint },
              ]}
            >
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          )}
        </View>

        <View style={styles.periodDetails}>
          <ThemedText style={styles.periodRange}>
            {new Date(period.startDate).toLocaleDateString()} -{" "}
            {new Date(period.endDate).toLocaleDateString()}
          </ThemedText>

          {period.isCurrentMonth && (
            <View style={styles.currentMonthBadge}>
              <ThemedText style={styles.currentMonthText}>
                Current Month
              </ThemedText>
            </View>
          )}
        </View>
      </TouchableOpacity>
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

        <ThemedText style={styles.headerTitle}>
          Select Billing Period
        </ThemedText>

        <View style={styles.stepIndicator}>
          <ThemedText style={styles.stepText}>3 of 6</ThemedText>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: "50%" }]} />
        </View>
        <View style={styles.progressSteps}>
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <View
              key={step}
              style={[
                styles.progressStep,
                step <= 3 && styles.progressStepActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Choose Billing Period
          </ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Select the month for which you're generating bills (
            {selectedRoomsData.length} rooms selected)
          </ThemedText>
        </View>

        <View style={styles.periodsList}>
          {billingPeriods.map((period) => (
            <PeriodCard key={period.id} period={period} />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: colors.tint }]}
          onPress={handleNext}
        >
          <ThemedText style={styles.nextButtonText}>Next</ThemedText>
          <Ionicons name="arrow-forward" size={20} color="white" />
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
  stepIndicator: {
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  stepText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E5E5E7",
    borderRadius: 2,
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 2,
  },
  progressSteps: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressStep: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E5E7",
  },
  progressStepActive: {
    backgroundColor: "#007AFF",
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
  periodsList: {
    gap: 12,
    paddingHorizontal: 20,
  },
  periodCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  periodInfo: {
    flex: 1,
  },
  periodMonth: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  periodYear: {
    fontSize: 16,
    opacity: 0.7,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  periodDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  periodRange: {
    fontSize: 14,
    opacity: 0.8,
    flex: 1,
  },
  currentMonthBadge: {
    backgroundColor: "#34C759",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentMonthText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
    backgroundColor: "#FFFFFF",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
