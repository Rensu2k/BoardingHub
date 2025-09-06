import { Stack } from "expo-router";

export default function AuthLayout() {
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
        name="signup"
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
