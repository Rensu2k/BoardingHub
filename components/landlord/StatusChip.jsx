import { ThemedText } from "@/components/ThemedText";
import { StyleSheet, View } from "react-native";

export default function StatusChip({ status, size = "small", style }) {
  const getStatusConfig = (status) => {
    const statusLower = status?.toLowerCase();

    switch (statusLower) {
      case "paid":
      case "active":
        return {
          bg: "#34C75920",
          text: "#34C759",
          text: status,
        };
      case "pending":
        return {
          bg: "#FF950020",
          text: "#FF9500",
          text: status,
        };
      case "overdue":
      case "inactive":
        return {
          bg: "#FF3B3020",
          text: "#FF3B30",
          text: status,
        };
      case "vacant":
        return {
          bg: "#007AFF20",
          text: "#007AFF",
          text: status,
        };
      case "occupied":
        return {
          bg: "#FF950020",
          text: "#FF9500",
          text: status,
        };
      case "maintenance":
        return {
          bg: "#FFCC0020",
          text: "#FFCC00",
          text: status,
        };
      default:
        return {
          bg: "#8E8E9320",
          text: "#8E8E93",
          text: status || "Unknown",
        };
    }
  };

  const config = getStatusConfig(status);
  const isSmall = size === "small";

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: config.bg,
          paddingHorizontal: isSmall ? 8 : 12,
          paddingVertical: isSmall ? 4 : 6,
        },
        style,
      ]}
    >
      <ThemedText
        style={[
          styles.chipText,
          {
            color: config.text,
            fontSize: isSmall ? 12 : 14,
          },
        ]}
      >
        {config.text.charAt(0).toUpperCase() + config.text.slice(1)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  chipText: {
    fontWeight: "500",
  },
});
