import { RssArticle, rssArticles, savedItems } from "@/db/schema";
import { COLORS } from "@/utils/Colors";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "@clerk/clerk-expo";
import * as Crypto from "expo-crypto";
import { useRouter } from "expo-router";

interface ArticleFeedProps {
  maxItems?: number;
  feedSource?: "expo" | "react-native";
  title?: string;
}

interface ArticleCardprops {
  article: RssArticle;
  onSave: (article: RssArticle) => void;
  variant?: "compact" | "featured";
}

const ArticleCard = ({
  article,
  onSave,
  variant = "compact",
}: ArticleCardprops) => {
  const hasImage = article.image_url && article.image_url.length > 0;
  const handlePress = () => {
    if (article.url) {
      Linking.openURL(article.url);
    }
  };
  if (variant === "featured") {
    return (
      <TouchableOpacity style={styles.featuredCard} onPress={handlePress}>
        {hasImage && (
          <Image
            source={{ uri: article.image_url || "" }}
            style={styles.featuredImage}
          />
        )}

        <View style={styles.featuredContent}>
          <Text style={styles.featuredTitle} numberOfLines={2}>
            {article.title}
          </Text>

          <View style={styles.cardAction}>
            <View style={styles.featuredMeta}>
              <Text style={styles.metaText}>{article.source} ᐧ </Text>
              <Text style={styles.metaText}>
                {article.estimated_read_time} min read
              </Text>
            </View>

            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onSave(article);
              }}
              style={styles.actionButton}
            >
              <Image
                source={require("../assets/images/pocktica.png")}
                style={{ width: 24, height: 24 }}
              />
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.compactCard} onPress={handlePress}>
      <View style={styles.compactContent}>
        <View style={styles.compactTopRow}>
          <View style={styles.compactTitleContainer}>
            <Text style={styles.compactTitle} numberOfLines={2}>
              {article.title}
            </Text>
          </View>
          {hasImage && (
            <Image
              source={{ uri: article.image_url || "" }}
              style={styles.compactImage}
            />
          )}
        </View>
        <View style={styles.cardAction}>
          <View style={styles.featuredMeta}>
            <Text style={styles.metaText}>{article.source} ᐧ </Text>
            <Text style={styles.metaText}>
              {article.estimated_read_time} min read
            </Text>
          </View>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onSave(article);
            }}
            style={styles.actionButton}
          >
            <Image
              source={require("../assets/images/pocktica.png")}
              style={{ width: 20, height: 20 }}
            />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ArticlesFeed = ({
  maxItems = 10,
  feedSource = "react-native",
  title = "React Native Articles",
}: ArticleFeedProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [articles, setArticles] = useState<RssArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const db = useSQLiteContext();

  const drizzleDb = drizzle(db);

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadArticles();
  }, []);

  const renderHeader = () => {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: RssArticle; index: number }) => {
    const handleOnSave = async (article: RssArticle) => {
      try {
        const existing = await drizzleDb
          .select()
          .from(savedItems)
          .where(eq(savedItems.url, article.url));

        console.log("🚀 Existing: ", existing);

        if (existing.length > 0) {
          console.log("Already Existed");
          return;
        }

        const response = await fetch("/api/parse-url", {
          method: "POST",
          body: JSON.stringify({ url: article.url }),
        });
        const finalResult = await response.json();
        console.log("🚀 Final Result: ", finalResult);

        await drizzleDb.insert(savedItems).values({
          id: Crypto.randomUUID(),

          url: article.url,
          title: article.title,
          excerpt: article.description,
          image_url: article.image_url,
          domain: new URL(article.url).hostname,

          reading_time: article.estimated_read_time,
          user_id: user?.id || "1",
          parsing_status: "parsed",
          content: finalResult.data.content,
        });

        router.push("/(modal)/success");
      } catch (error) {
        console.log(error);
      }
    };
    if (index === 0) {
      return (
        <>
          {renderHeader()}
          <ArticleCard
            article={item}
            onSave={handleOnSave}
            variant="featured"
          />
          <View style={styles.separator} />
          {articles.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ paddingHorizontal: 24 }}
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {articles.slice(1).map((article) => {
                return (
                  <View style={styles.compactCardWrapper} key={article.id}>
                    <ArticleCard
                      article={article}
                      onSave={handleOnSave}
                      variant="compact"
                    />
                  </View>
                );
              })}
            </ScrollView>
          )}
        </>
      );
    }
    return null;
  };

  const loadArticles = async () => {
    try {
      setIsLoading(true);
      const cachedArticles = await drizzleDb
        .select()
        .from(rssArticles)
        .orderBy(desc(rssArticles.published_date))
        .limit(maxItems);

      console.log("🚀 Cached Articles: ", cachedArticles);

      if (cachedArticles.length > 0) {
        setArticles(cachedArticles);
        setIsLoading(false);
      } else {
        await fetchArticleData();
      }
    } catch (error) {
      console.error("Error loading articles:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchArticleData = async () => {
    try {
      setIsLoading(true);
      const result = await fetch("/api/rss-feed" + "?url=" + feedSource);
      const finalResult = await result.json();
      console.log(finalResult);

      if (finalResult.success) {
        await drizzleDb.delete(rssArticles);

        const insertData = finalResult.data.items.map((item: any) => ({
          id: Crypto.randomUUID(),
          title: item.title,
          url: item.url,
          description: item.description,
          published_date: item.publishedDate,
          author: item.author,
          category: item.category,
          image_url: item.image,
          source: item.source,
          estimated_read_time: item.estimatedReadTime,
          feed_url: finalResult.data.feedUrl,
          is_saved: false,
        }));

        await drizzleDb.insert(rssArticles).values(insertData);

        const articles = await drizzleDb.select().from(rssArticles);
        loadArticles();
      }
    } catch (error) {
      console.error("Error fetching article data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchArticleData();
  };

  if (isLoading || articles.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 18, color: "#666" }}>Loading articles...</Text>
      </View>
    );
  }
  return (
    <FlatList
      data={articles}
      style={styles.container}
      renderItem={renderItem}
      keyExtractor={(item: any) => item.id}
      contentContainerStyle={{ flexGrow: 1 }}
      contentInsetAdjustmentBehavior="automatic"
      onRefresh={handleRefresh}
      refreshing={isRefreshing}
      //   showsVerticalScrollIndicator={false}
      //   ListHeaderComponent={renderHeader}
      //   horizontal={true}
    />
  );
};

export default ArticlesFeed;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  articleTitle: { fontSize: 32 },
  loadingContainer: {
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeader: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textDark,
  },
  separator: {
    height: 16,
  },
  featuredCard: {
    backgroundColor: COLORS.white,
    boxShadow: "0 0px 10px 0px rgba(0, 0, 0, 0.1)",
    elevation: 4,
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: "hidden",

    // paddingHorizontal: 16,
  },
  featuredImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#F5F5F5",
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textDark,
    lineHeight: 26,
    marginBottom: 8,
  },
  cardAction: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  featuredMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 12,
    color: COLORS.textGray,
    fontWeight: "500",
  },
  compactCardWrapper: {
    width: 280,
    marginRight: 16,
    marginVertical: 4,
  },
  compactCard: {
    backgroundColor: COLORS.white,
    boxShadow: "0 0px 10px 0px rgba(0, 0, 0, 0.1)",
    elevation: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  compactContent: {
    padding: 12,
  },
  compactTopRow: {
    flexDirection: "row",
    alignSelf: "flex-start",
    marginBottom: 8,
    gap: 12,
  },
  compactTitleContainer: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textDark,
    lineHeight: 20,
  },
  compactImage: {
    width: 60,
    height: 40,
    borderRadius: 8,
  },
});
