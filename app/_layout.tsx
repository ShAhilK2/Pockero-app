import React from "react";

import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
};

const RootLayout = () => {
  return (
    <KeyboardProvider>
      <Layout />
    </KeyboardProvider>
  );
};

export default RootLayout;
