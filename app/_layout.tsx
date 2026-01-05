import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Stack } from "expo-router";
import { openDatabaseSync, SQLiteProvider } from "expo-sqlite";
import React, { Suspense } from "react";
import { ActivityIndicator } from "react-native";
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
    </ClerkProvider>
  );
};

export default RootLayout;
