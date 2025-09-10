import { OfflineIndicator } from "@/components/tenant";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function TenantLayout() {
  return (
    <View style={{ flex: 1 }}>
      <OfflineIndicator />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="browse" />
        <Stack.Screen name="payments" />
        <Stack.Screen name="room-management" />
        <Stack.Screen name="profile" />
      </Stack>
    </View>
  );
}
