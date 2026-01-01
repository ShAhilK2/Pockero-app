import { useAuth, useUser } from "@clerk/clerk-expo";

import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Page = () => {
  const { user } = useUser();

  const { isSignedIn, signOut } = useAuth();
  const router = useRouter();

  return (
    <ScrollView
      contentContainerStyle={{ flex: 1 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text>User: {user?.emailAddresses[0]?.emailAddress}</Text>

      {isSignedIn && (
        <TouchableOpacity onPress={() => signOut()} style={styles.button}>
          <Text style={{ color: "white", alignSelf: "center" }}>Sign Out</Text>
        </TouchableOpacity>
      )}
      <View>
        {!isSignedIn && (
          // <Link href="/" asChild replace >
          //   <Text style={{ color: "#647480", alignSelf: "center" }}>
          //     Sign In or Up
          //   </Text>
          // </Link>

          <TouchableOpacity onPress={() => router.replace("/(public)")}>
            <Text style={{ color: "#647480", alignSelf: "center" }}>
              Sign in or Sign Up Page
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

export default Page;

const styles = StyleSheet.create({
  button: {
    padding: 10,
    backgroundColor: "red",
    borderRadius: 8,
    marginHorizontal: 20,

    paddingHorizontal: 20,
    paddingVertical: 15,
  },
});
