import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Stack } from "expo-router";
import { openDatabaseSync, SQLiteProvider } from "expo-sqlite";
import React, { Suspense } from "react";
import { ActivityIndicator, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import migrations from "../drizzle/migrations";

const DATABASE_NAME = "pocktica";

const Layout = () => {
  const { isSignedIn } = useAuth();
  const db = openDatabaseSync(DATABASE_NAME);
  useDrizzleStudio(db);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      <Stack.Screen
        name="(modal)/success"
        options={
          Platform.OS === "ios"
            ? {
                presentation: "formSheet",
                sheetAllowedDetents: [0.5, 1],
                sheetGrabberVisible: false,
                headerShadowVisible: false,
                title: "",
                contentStyle: { height: "100%" },
              }
            : {
                presentation: "transparentModal",
                headerShown: false,
                sheetAllowedDetents: [0.5, 1],
                sheetGrabberVisible: false,
                headerShadowVisible: false,

                animation: "fade",
                contentStyle: {
                  backgroundColor: "transparent",
                },
              }
        }
      />

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
  const expoDb = openDatabaseSync(DATABASE_NAME);
  const db = drizzle(expoDb);

  const { success, error } = useMigrations(db, migrations);

  console.log("success", success);
  console.log("error", error);

  console.log("Migrations completed successfully ✅🚀");

  return (
    <ClerkProvider tokenCache={tokenCache}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <Suspense fallback={<ActivityIndicator />}>
            <SQLiteProvider
              useSuspense
              databaseName={DATABASE_NAME}
              options={{ enableChangeListener: true }}
            >
              <Layout />
            </SQLiteProvider>
          </Suspense>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </ClerkProvider>
  );
};

export default RootLayout;
