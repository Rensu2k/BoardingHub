import { Stack } from "expo-router";

export default function PaymentsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="upload-proof" />
      <Stack.Screen name="payment-history" />
      <Stack.Screen name="bill-detail/[id]" />
    </Stack>
  );
}
