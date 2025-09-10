import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="documents" />
      <Stack.Screen name="emergency-contacts" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
