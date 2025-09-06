import { Stack } from "expo-router";

export default function TenantLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: "transparent",
        },
        headerTintColor: "transparent",
        headerTitle: "",
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{
          headerShown: false,
          headerStyle: {
            backgroundColor: "transparent",
          },
          headerTintColor: "transparent",
          headerTitle: "",
          title: "",
        }}
      />
    </Stack>
  );
}
