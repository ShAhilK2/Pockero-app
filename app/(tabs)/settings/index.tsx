import { COLORS } from "@/utils/Colors";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";

import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Switch } from "react-native-gesture-handler";
import * as ReactNativeLegal from "react-native-legal";

const Page = () => {
  const { user } = useUser();

  const { isSignedIn, signOut } = useAuth();

  const [isPro, setIsPro] = useState(false);

  const [alwaysOpenOriginalView, setAlwaysOpenOriginalView] = useState(false);
  const router = useRouter();

  const openLink = () => {
    WebBrowser.openBrowserAsync("https://expo.dev/");
  };

  const launchNotice = async () => {
    ReactNativeLegal.launchLicenseListScreen("OSS Notice");
  };
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.section}>
        <Text style={styles.sectiontitle}>Your Account: </Text>

        {user && (
          <Text style={styles.sectionEmail}>
            {user?.emailAddresses[0]?.emailAddress}
          </Text>
        )}

        <View style={styles.listContainer}>
          {!isSignedIn && (
            <TouchableOpacity
              onPress={() => router.replace("/(public)")}
              style={styles.listItem}
            >
              <Text style={[styles.itemText, { fontWeight: "bold" }]}>
                Sign in or Sign Up Page
              </Text>

              <Ionicons
                name="person-outline"
                size={24}
                color={COLORS.textDark}
              />
            </TouchableOpacity>
          )}

          {isSignedIn && (
            <>
              {!isPro && (
                <>
                  <TouchableOpacity style={styles.listItem}>
                    <Ionicons
                      name="diamond-outline"
                      size={24}
                      color={COLORS.textDark}
                    />
                    <Text
                      style={[
                        styles.itemText,
                        { flex: 1, fontWeight: "bold", marginLeft: 16 },
                      ]}
                    >
                      Go Premium
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={24}
                      color={COLORS.textDark}
                    />
                  </TouchableOpacity>
                  <View style={styles.divider} />

                  <TouchableOpacity
                    onPress={() => signOut()}
                    style={styles.listItem}
                  >
                    <Text style={[styles.itemText, { color: COLORS.red }]}>
                      Log Out
                    </Text>
                    <Ionicons
                      name="log-out-outline"
                      size={24}
                      color={COLORS.red}
                    />
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      </View>
      <View style={styles.section}>
        <View style={styles.listContainer}>
          <Text style={styles.sectiontitle}>App Customisation </Text>

          <View style={styles.listItem}>
            <View>
              <Text style={[styles.itemText]}>Always Open Original View</Text>
            </View>
            <Switch
              value={alwaysOpenOriginalView}
              onValueChange={setAlwaysOpenOriginalView}
            />
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.listItem}>
            <Text style={[styles.itemText]}>App Icon</Text>

            <Ionicons
              name="chevron-forward"
              size={24}
              color={COLORS.textDark}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.listContainer}>
          <Text style={styles.sectiontitle}>About & Support</Text>

          <TouchableOpacity onPress={() => openLink()} style={styles.listItem}>
            <Text style={[styles.itemText]}>Get help and Support</Text>

            <Ionicons
              name="information-circle-outline"
              size={24}
              color={COLORS.textDark}
            />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity onPress={() => openLink()} style={styles.listItem}>
            <Text style={[styles.itemText]}>Terms of Service</Text>

            <Ionicons
              name="document-text-outline"
              size={24}
              color={COLORS.textDark}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink()} style={styles.listItem}>
            <Text style={[styles.itemText]}>Privacy Policy</Text>

            <Ionicons
              name="document-text-outline"
              size={24}
              color={COLORS.textDark}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => launchNotice()}
            style={styles.listItem}
          >
            <Text style={[styles.itemText]}>Open source licenses</Text>

            <Ionicons
              name="document-text-outline"
              size={24}
              color={COLORS.textDark}
            />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  section: {
    marginBottom: 40,
  },
  sectiontitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    marginLeft: 16,
    color: COLORS.textDark,
  },
  sectionEmail: {
    fontSize: 14,

    marginBottom: 16,
    fontWeight: "bold",
    marginLeft: 16,
    color: COLORS.textLight,
  },
  listContainer: {
    borderRadius: 10,
    overflow: "hidden",
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.itemBackground,
    minHeight: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textDark,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#C6C6C8",
    marginLeft: 16,
  },
});
