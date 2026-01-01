import { COLORS } from "@/utils/Colors";
import { useSignIn, useSignUp } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { SafeAreaView } from "react-native-safe-area-context";

const VerifyCode = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { email, mode } = params; // mode: 'signin' or 'signup'

  const {
    signIn,
    setActive: setActiveSignIn,
    isLoaded: signInLoaded,
  } = useSignIn();
  const {
    signUp,
    setActive: setActiveSignUp,
    isLoaded: signUpLoaded,
  } = useSignUp();

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Ensure Clerk is loaded
  useEffect(() => {
    if (mode === "signin" && !signInLoaded) {
      console.log("SignIn not loaded yet");
    }
    if (mode === "signup" && !signUpLoaded) {
      console.log("SignUp not loaded yet");
    }
  }, [signInLoaded, signUpLoaded, mode]);

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      Alert.alert("Error", "Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "signin") {
        console.log("Starting sign in verification...");

        if (!signIn) {
          throw new Error("SignIn not initialized");
        }

        // Verify sign in code
        const completeSignIn = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code: code,
        });

        console.log("Sign in verification status:", completeSignIn.status);

        if (completeSignIn.status === "complete") {
          console.log("Sign in complete, setting active session...");
          await setActiveSignIn!({ session: completeSignIn.createdSessionId });
          console.log("Session activated successfully");

          // Small delay to ensure session is set
          setTimeout(() => {
            router.replace("/(tabs)/home");
          }, 100);
        } else {
          console.log("Sign in incomplete, status:", completeSignIn.status);
          Alert.alert("Error", "Verification incomplete. Please try again.");
        }
      } else if (mode === "signup") {
        console.log("Starting sign up verification...");

        if (!signUp) {
          throw new Error("SignUp not initialized");
        }

        console.log("SignUp object:", {
          status: signUp.status,
          emailAddress: signUp.emailAddress,
          verifications: signUp.verifications,
        });

        // Verify sign up code
        const completeSignUp = await signUp.attemptEmailAddressVerification({
          code: code,
        });

        console.log("Sign up verification status:", completeSignUp.status);
        console.log("Created session ID:", completeSignUp.createdSessionId);

        if (completeSignUp.status === "complete") {
          console.log("Sign up complete, setting active session...");

          // Set the active session
          await setActiveSignUp!({ session: completeSignUp.createdSessionId });
          console.log("Session activated successfully");

          // Small delay to ensure session is set
          setTimeout(() => {
            router.replace("/(tabs)/home");
          }, 100);
        } else if (completeSignUp.status === "missing_requirements") {
          console.log("Missing requirements:", completeSignUp.missingFields);
          Alert.alert(
            "Additional Info Required",
            "Please complete your profile setup."
          );
          // You might want to navigate to a profile completion page here
        } else {
          console.log("Sign up incomplete, status:", completeSignUp.status);
          Alert.alert("Error", "Verification incomplete. Please try again.");
        }
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      console.error("Error details:", JSON.stringify(err, null, 2));

      const errorMessage =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        "Invalid verification code. Please try again.";

      Alert.alert("Verification Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);

    try {
      if (mode === "signin") {
        console.log("Resending sign in code...");

        if (!signIn) {
          throw new Error("SignIn not initialized");
        }

        // Find the email factor
        const emailFactor = signIn?.supportedFirstFactors?.find(
          (factor: any) => factor.strategy === "email_code"
        );

        if (!emailFactor) {
          throw new Error("Email verification method not available");
        }

        // Resend sign in code
        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: emailFactor?.emailAddressId,
        });

        console.log("Sign in code resent successfully");
      } else if (mode === "signup") {
        console.log("Resending sign up code...");

        if (!signUp) {
          throw new Error("SignUp not initialized");
        }

        // Resend sign up code
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });

        console.log("Sign up code resent successfully");
      }

      Alert.alert("Success", `Verification code sent to ${email}`);
      setCode(""); // Clear the input
    } catch (err: any) {
      console.error("Resend error:", err);
      console.error("Resend error details:", JSON.stringify(err, null, 2));

      const errorMessage =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        "Failed to resend code. Please try again.";

      Alert.alert("Resend Failed", errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  // Show loading if Clerk isn't ready
  if (
    (mode === "signin" && !signInLoaded) ||
    (mode === "signup" && !signUpLoaded)
  ) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
        <View
          style={[
            styles.container,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Image
              source={require("../../assets/images/pocktica.png")}
              style={styles.imageIcon}
            />
          </View>
          <Text style={styles.loginText}>Verify Code</Text>
          <Text style={styles.subText}>
            Enter the 6-digit code sent to{"\n"}
            <Text style={styles.emailText}>{email}</Text>
          </Text>

          <View style={styles.otpContainer}>
            <OtpInput
              numberOfDigits={6}
              onTextChange={(text) => setCode(text)}
              focusColor={COLORS.primary}
              onFilled={(text) => setCode(text)}
              theme={{
                pinCodeContainerStyle: styles.pinCodeContainer,
                focusedPinCodeContainerStyle: styles.focusedPinCodeContainer,
              }}
            />
          </View>

          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResendCode}
            disabled={isResending || isLoading}
          >
            {isResending ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={styles.resendText}>Resend Code</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (isLoading || code.length !== 6) && styles.submitButtonDisabled,
            ]}
            onPress={handleVerifyCode}
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Verify & Continue</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default VerifyCode;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 12,
  },
  subText: {
    fontSize: 16,
    color: COLORS.textGray,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  emailText: {
    fontWeight: "600",
    color: COLORS.textDark,
  },
  otpContainer: {
    width: "100%",
    marginBottom: 20,
  },
  pinCodeContainer: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  focusedPinCodeContainer: {
    borderColor: COLORS.primary,
  },
  resendButton: {
    marginTop: 20,
    alignItems: "center",
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: "center",
  },
  resendText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    marginTop: 20,
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: "100%",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    marginTop: 16,
    alignItems: "center",
    paddingVertical: 12,
  },
  backButtonText: {
    color: COLORS.textGray,
    fontSize: 14,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textGray,
  },
});
