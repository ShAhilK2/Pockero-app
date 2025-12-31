import { COLORS } from "@/utils/Colors";
import { AntDesign } from "@expo/vector-icons";
import { Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LogIn = () => {
  // return <Redirect href="/(tabs)/home" />;

  const openLink = (url: string) => {
    WebBrowser.openBrowserAsync(url);
  };

  const handleSocialProvider = (provider: string) => {};
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        // keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logo}>
              <Image
                source={require("../assets/images/pocktica.png")}
                style={styles.imageIcon}
              />
            </View>
            <Text style={styles.loginText}>Log In</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialProvider("oauth_apple")}
            >
              <AntDesign name="apple" size={24} color="black" />
              <Text style={styles.socialButtonText}>Continue with Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialProvider("oauth_google")}
            >
              <AntDesign name="google" size={24} color="black" />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.emailSection}>
            <TextInput
              style={styles.emailInput}
              placeholder="Enter your email"
              placeholderTextColor={"#666"}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
            />
            <TouchableOpacity style={styles.emailButton}>
              <Text style={styles.emailButtonText}>Next</Text>
            </TouchableOpacity>

            <Link href="/(tabs)/home" asChild>
              <TouchableOpacity style={{ marginTop: 16, alignSelf: "center" }}>
                <Text
                  style={{
                    color: COLORS.secondary,

                    fontWeight: "bold",
                  }}
                >
                  Skip for now
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

          <View style={{ marginTop: 20 }}>
            <Text
              style={{
                textAlign: "center",
                fontSize: 12,
                color: COLORS.textGray,
                lineHeight: 18,
              }}
            >
              By Proceeding, you agree to {"\n"}
              Pocktica's{" "}
              <Text
                style={{
                  textDecorationLine: "underline",
                  color: COLORS.primary,
                }}
                onPress={() => openLink("https://pocktica.com/terms")}
              >
                Terms of Service
              </Text>{" "}
              and{" "}
              <Text
                style={{
                  textDecorationLine: "underline",
                  color: COLORS.primary,
                }}
                onPress={() => openLink("https://pocktica.com/privacy")}
              >
                Privacy Notice{"\n"}
              </Text>
              Mozilla Accounts{" "}
              <Text
                style={{
                  textDecorationLine: "underline",
                  color: COLORS.primary,
                }}
                onPress={() => openLink("https://pocktica.com/terms")}
              >
                Terms of Service
              </Text>{" "}
              and{" "}
              <Text
                style={{
                  textDecorationLine: "underline",
                  color: COLORS.primary,
                }}
                onPress={() => openLink("https://pocktica.com/privacy")}
              >
                Privacy Notice
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LogIn;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 30,
    paddingTop: 80,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    height: 80,
    width: 80,
    marginBottom: 40,
  },
  imageIcon: {
    height: 80,
    width: 80,
  },
  loginText: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.textDark,
  },
  buttonContainer: {
    gap: 12,
  },
  socialButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  socialButtonText: {
    fontSize: 16,
  },
  divider: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 20,
    alignItems: "center",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  orText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  emailSection: {
    marginBottom: 30,
  },
  emailInput: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  emailButton: {
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 8,
  },
  emailButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
