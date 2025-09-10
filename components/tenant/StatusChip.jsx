import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";

export default function StatusChip({ status, customColors = {} }) {
  const getStatusConfig = (status) => {
    const defaultColors = {
      paid: { bg: "#34C75920", text: "#34C759" },
      overdue: { bg: "#FF3B3020", text: "#FF3B30" },
      due_soon: { bg: "#FF950020", text: "#FF9500" },
      pending: { bg: "#8E8E9320", text: "#8E8E93" },
    };

    const colors = { ...defaultColors, ...customColors };

    const config = colors[status] || colors.pending;

    const statusText =
      {
        paid: "Paid",
        overdue: "Overdue",
        due_soon: "Due Soon",
        pending: "Pending",
      }[status] || "Unknown";

    return { ...config, text: statusText };
  };

  const { bg, text, text: textColor } = getStatusConfig(status);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ThemedText style={[styles.text, { color: textColor }]}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
});
