import { COLORS } from "@/utils/Colors";
import { useSignIn, useSignUp, useSSO } from "@clerk/clerk-expo";
import { OAuthStrategy } from "@clerk/types";
import { AntDesign } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import { Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  Alert,
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

export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

const LogIn = () => {
  const router = useRouter();
  useWarmUpBrowser();

  const { startSSOFlow } = useSSO();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const [email, setEmail] = useState("");

  const openLink = (url: string) => {
    WebBrowser.openBrowserAsync(url);
  };

  const handleSocialProvider = async (strategy: OAuthStrategy) => {
    try {
      // Create redirect URL with proper scheme
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: "pocktica",
        path: "oauth-native-callback",
      });

      console.log("Redirect URL:", redirectUrl); // Debug log
      console.log("Strategy:", strategy);

      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl,
      });

      if (createdSessionId) {
        await setActive?.({
          session: createdSessionId,
        });
      } else {
        // Handle missing requirements (MFA, etc.)
        console.log("No session created - missing requirements");
      }
    } catch (error: any) {
      console.error("SSO flow failed:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));

      Alert.alert(
        "Authentication Error",
        error?.errors?.[0]?.message || "Failed to sign in. Please try again."
      );
    }
  };

  const handleGoogleSignIn = () => {
    handleSocialProvider("oauth_google");
  };

  const handleAppleSignIn = () => {
    handleSocialProvider("oauth_apple");
  };

  const handleVerificationWithCodeViaEmail = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    try {
      const signInAttempt = await signIn!.create({
        identifier: email,
      });

      await signIn!.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId:
          signInAttempt?.supportedFirstFactors?.find(
            (factor) => factor.strategy === "email_code"
          )?.emailAddressId ?? "",
      });

      router.push({
        pathname: "/verify-code",
        params: { email, mode: "signin" },
      });
    } catch (err: any) {
      if (err.errors?.[0]?.code === "form_identifier_not_found") {
        try {
          await signUp!.create({
            emailAddress: email,
          });

          await signUp!.prepareEmailAddressVerification({
            strategy: "email_code",
          });

          router.push({
            pathname: "/verify-code",
            params: { email, mode: "signup" },
          });
        } catch (signUpErr: any) {
          console.error("Sign up error:", signUpErr);
          Alert.alert(
            "Error",
            signUpErr.errors?.[0]?.message || "Failed to send verification code"
          );
        }
      } else {
        console.error("Sign in error:", err);
        Alert.alert(
          "Error",
          err.errors?.[0]?.message || "Failed to send verification code"
        );
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logo}>
              <Image
                source={require("../../assets/images/pocktica.png")}
                style={styles.imageIcon}
              />
            </View>
            <Text style={styles.loginText}>Log In</Text>
          </View>

          <View style={styles.buttonContainer}>
            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleAppleSignIn}
              >
                <AntDesign name="apple" size={24} color="black" />
                <Text style={styles.socialButtonText}>Continue with Apple</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleSignIn}
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
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity
              style={styles.emailButton}
              onPress={handleVerificationWithCodeViaEmail}
            >
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
