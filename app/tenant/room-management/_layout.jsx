import { Stack } from "expo-router";

export default function RoomManagementLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="service-request" />
      <Stack.Screen name="amenities" />
      <Stack.Screen name="contract-details" />
    </Stack>
  );
}
