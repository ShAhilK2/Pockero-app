import SavedItemCard from "@/components/saved-item-card";
import { SavedItem, savedItems } from "@/db/schema";
import { COLORS } from "@/utils/Colors";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { and, desc, eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { Stack, useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useState } from "react";

import {
  FlatList,
  Platform,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const Page = () => {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { user } = useAuth();
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);

  const loadItems = async (query: string = "") => {
    try {
      setIsLoading(true);

      const result = await drizzleDb
        .select()
        .from(savedItems)
        .where(
          and(
            eq(savedItems.is_deleted, false),
            or(
              eq(savedItems.user_id, user?.id || ""),
              eq(savedItems.user_id, user?.id || "1")
            )
          )
        )
        .orderBy(desc(savedItems.created_at));

      setItems(result);

      console.log("result : ", result);
    } catch (error) {
      console.log("Error loading items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavourite = async (item: SavedItem) => {
    try {
      await drizzleDb
        .update(savedItems)
        .set({
          is_favorite: !item.is_favorite,
        })
        .where(eq(savedItems.id, item.id));

      setItems((prevItems) =>
        prevItems.map(
          (
            prevItem // ✅ Renamed to avoid confusion
          ) =>
            prevItem.id === item.id // ✅ Now comparing correctly
              ? { ...prevItem, is_favorite: !prevItem.is_favorite }
              : prevItem
        )
      );
    } catch (error) {
      console.error(error);
    }
  };
  const handleShare = async (item: SavedItem) => {
    try {
      await Share.share({
        message: item.title || "Check out this article :" + item.url,
      });
    } catch (error) {
      console.error(error);
    }
  };
  const handleMore = async (item: SavedItem) => {};

  useFocusEffect(
    useCallback(() => {
      loadItems(searchQuery);
    }, [])
  );

  // Debounced search
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    const timeoutId = setTimeout(() => {
      loadItems(text);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <>
      {Platform.OS === "ios" && (
        <Stack.Screen
          options={{
            headerSearchBarOptions: {
              placeholder: "Search",
            },
          }}
        />
      )}

      {/* Android: Custom search bar */}
      {Platform.OS === "android" && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons
              name="search"
              size={20}
              color={COLORS.textDark}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholderTextColor={COLORS.textDark}
              placeholder="Search"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
              <Ionicons
                name="close-circle"
                size={20}
                color={COLORS.textDark}
                style={styles.clearIcon}
                onPress={() => {
                  setSearchQuery("");
                  loadItems("");
                }}
              />
            )}
          </View>
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SavedItemCard
            item={item}
            onToggleFavorite={() => handleToggleFavourite(item)}
            onShare={() => handleShare(item)}
            onMore={() => handleMore(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        contentInsetAdjustmentBehavior={"automatic"}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={() => (
          <>
            {isLoading ? (
              <View style={styles.emptystate}>
                <Text style={styles.emptystateText}>Loading...</Text>
              </View>
            ) : (
              items.length === 0 && (
                <View style={styles.emptystate}>
                  <Ionicons
                    name="heart"
                    color={COLORS.textLight}
                    size={48}
                    style={{ marginBottom: 20 }}
                  />
                  <Text style={styles.emptystateText}> No Saves Found </Text>

                  <Text style={styles.emptystateDescription}>
                    Your saved articles will appear here
                  </Text>
                </View>
              )
            )}
          </>
        )}
      />
    </>
  );
};

export default Page;

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 20,
  },
  separator: {
    height: 12,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
    paddingVertical: 0, // Remove default padding
  },
  clearIcon: {
    marginLeft: 8,
    padding: 4,
  },
  itemContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  emptystate: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
  },
  emptystateText: {
    fontSize: 22,
    fontWeight: "500",
    color: COLORS.textDark,
    marginBottom: 8,
  },
  emptystateDescription: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textDark,
  },
});
