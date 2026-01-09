import SavedConfirmation from "@/components/saved-confirmation";
import { savedItems } from "@/db/schema";
import { COLORS } from "@/utils/Colors";
import { useUser } from "@clerk/clerk-expo";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as Crypto from "expo-crypto";
import { Stack, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

const Page = () => {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();
  const { user } = useUser();
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);

  const handleSave = async () => {
    if (!url.trim()) return;

    try {
      setIsLoading(true);
      setError("");

      // Check if URL already exists
      const existingItem = await drizzleDb
        .select()
        .from(savedItems)
        .where(eq(savedItems.url, url.trim()))
        .limit(1);

      if (existingItem.length > 0) {
        setError("This URL has already been saved");
        setIsLoading(false);
        return;
      }

      const itemId = Crypto.randomUUID();

      await drizzleDb.insert(savedItems).values({
        id: itemId,
        url: url.trim(),
        user_id: user?.id || "1",
        parsing_status: "pending",
      });

      const response = await fetch("/api/parse-url", {
        method: "POST",
        body: JSON.stringify({
          url: url.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        await drizzleDb
          .update(savedItems)
          .set({
            title: result.data.title,
            excerpt: result.data.description,
            image_url: result.data.image,
            parsing_status: "parsed",
            domain: result.data.domain,
            site_name: result.data.site_name,
            author: result.data.author,
            word_count: result.data.word_count,
            reading_time: result.data.reading_time,
            content: result.data.content,
            extracted_at: result.data.extracted_at,
          })
          .where(eq(savedItems.id, itemId));
      } else {
        await drizzleDb
          .update(savedItems)
          .set({
            parsing_status: "failed",
          })
          .where(eq(savedItems.id, itemId));
      }

      console.log(result);
      setIsSaved(true);

      // Reset after showing confirmation
      setTimeout(() => {
        setIsSaved(false);
        setUrl("");
      }, 2000);
    } catch (error) {
      console.error(error);
      setError("Failed to save URL. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => {
            return (
              <>
                {!isSaved ? (
                  <TouchableOpacity onPress={() => router.dismiss()}>
                    <Text
                      style={{
                        color: COLORS.primary,
                        fontSize: 16,
                        fontWeight: "500",
                      }}
                    >
                      Close
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </>
            );
          },
        }}
      />
      {isSaved && <SavedConfirmation onDismiss={() => router.dismiss()} />}

      {!isSaved && (
        <KeyboardAvoidingView style={styles.keyboardAvoidingView}>
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Add a URL</Text>
            <TextInput
              style={styles.formInput}
              value={url}
              onChangeText={(text) => {
                setUrl(text);
                if (error) setError("");
              }}
              placeholder="eg. https://reactnative.com"
              placeholderTextColor={COLORS.textLight}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[
                styles.formButton,
                (isLoading || !url.trim()) && styles.formButtonDisabled,
              ]}
              onPress={() => handleSave()}
              disabled={isLoading || !url.trim()}
            >
              {isLoading ? (
                <Text style={styles.formSubmitText}>Parsing ...</Text>
              ) : (
                <Text style={styles.formSubmitText}>Save to Pocktica</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.formButtonCancel}
              onPress={() => router.dismiss()}
            >
              <Text style={styles.formButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textDark,
    marginBottom: 10,
  },
  formInput: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    width: "100%",
    borderColor: COLORS.border,
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: COLORS.itemBackground,
    marginBottom: 10,
  },
  formButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  formButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  formSubmitText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    alignSelf: "center",
  },
  formButtonCancel: {
    borderWidth: 2,
    borderColor: COLORS.textLight,
    borderRadius: 12,
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  formButtonText: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: "600",
    alignSelf: "center",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "500",
    alignSelf: "flex-start",
    width: "100%",
    marginTop: -10,
  },
});
