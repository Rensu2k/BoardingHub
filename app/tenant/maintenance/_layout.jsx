import { Stack } from "expo-router";

export default function MaintenanceLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="create-request" />
      <Stack.Screen name="ticket-detail/[id]" />
    </Stack>
  );
}
