import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 1. Entry Point */}
      <Stack.Screen name="index" />

      {/* 2. Authentication */}
      <Stack.Screen name="signup" />

      {/* 3. Main Screens */}
      <Stack.Screen name="home" />

      {/* 4. Map Screen */}
      <Stack.Screen name="map" />

      {/* 5. Trusted Contacts Screen (Updated Name) */}
      <Stack.Screen name="TrustedContacts" />

      {/* 6. User Profile Screen (Updated Name) */}
      <Stack.Screen name="Profile" />

      {/* Agar onboarding wali screen abhi bhi rakhni hai toh */}
      <Stack.Screen name="personal-info" />

      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}
