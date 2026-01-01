import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack } from "expo-router";
import React from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";

const Layout = () => {
  const { isSignedIn } = useAuth();
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen
          name="(public)/index"
          options={{ headerShown: false, title: "Login" }}
        />

        <Stack.Screen
          name="(public)/verify-code"
          options={{
            presentation: "modal",
            headerShown: true,
            title: "Verification",
          }}
        />
      </Stack.Protected>
    </Stack>
  );
};

const RootLayout = () => {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <KeyboardProvider>
        <Layout />
      </KeyboardProvider>
    </ClerkProvider>
  );
};

export default RootLayout;
