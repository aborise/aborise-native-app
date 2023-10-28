import { Stack } from "expo-router/stack";
import { View } from "react-native";
import { ActivityIndicator } from "react-native";
import { useAsyncStateReadonly } from "~/composables/useAsyncState";
import { ensureDataLoaded } from "~/shared/ensureDataLoaded";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#f4511e",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    />
  );
}
