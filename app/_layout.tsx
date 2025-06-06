import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          animation: "slide_from_left",
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
