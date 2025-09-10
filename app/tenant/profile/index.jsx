import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function ProfileIndex() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemedView style={{ flex: 1, padding: 16 }}>
        <ThemedText
          style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}
        >
          Profile Management
        </ThemedText>
        <ThemedText>
          This screen will contain profile editing, document management, and
          settings.
        </ThemedText>
      </ThemedView>
    </SafeAreaView>
  );
}
