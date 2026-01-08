import { COLORS } from "@/utils/Colors";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { useEffect } from "react";
import { Platform } from "react-native";

import Sentry from "@sentry/react-native";

export default function RootLayout() {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      Sentry?.setUser?.({
        id: user.id,
        email: user.emailAddresses?.[0]?.emailAddress,
      });
    } else {
      Sentry?.setUser?.(null);
    }
  }, [user]);

  return Platform.OS === "ios" ? (
    <NativeTabs tintColor={COLORS.textDark} blurEffect="systemChromeMaterial">
      <NativeTabs.Trigger name="home">
        <Label>Home</Label>
        <Icon
          sf={{ default: "house", selected: "house.fill" }}
          drawable="ic_home"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="saves">
        <Label>Saves</Label>
        <Icon
          sf={{ default: "heart", selected: "heart.fill" }}
          drawable="ic_saves"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <Label>Settings</Label>
        <Icon
          sf={{ default: "gearshape", selected: "gearshape.fill" }}
          drawable="ic_settings"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  ) : (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.textDark,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              size={24}
              color="black"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="saves"
        options={{
          title: "Saves",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "heart-sharp" : "heart-outline"}
              size={24}
              color="black"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "settings-sharp" : "settings-outline"}
              size={24}
              color="black"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
