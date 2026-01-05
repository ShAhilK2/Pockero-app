import { COLORS } from "@/utils/Colors";
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

interface ArticleFeedProps {
  maxItems?: number;
  feedSource?: "expo" | "react-native";
  title?: string;
}

interface Article {
  id: string;
  title: string;
  url: string;
  description: string;
  publishedDate: string;
  category: string;
  image: string;
  source: string;
  estimatedReadTime: number;
}

interface ArticleCardprops {
  article: Article;
  onSave: (article: Article) => void;
  variant?: "compact" | "featured";
}

const ArticleCard = ({
  article,
  onSave,
  variant = "compact",
}: ArticleCardprops) => {
  const hasImage = article.image && article.image.length > 0;
  const handlePress = () => {
    if (article.url) {
      Linking.openURL(article.url);
    }
  };
  if (variant === "featured") {
    return (
      <TouchableOpacity style={styles.featuredCard} onPress={handlePress}>
        {hasImage && (
          <Image source={{ uri: article.image }} style={styles.featuredImage} />
        )}

        <View style={styles.featuredContent}>
          <Text style={styles.featuredTitle} numberOfLines={2}>
            {article.title}
          </Text>

          <View style={styles.cardAction}>
            <View style={styles.featuredMeta}>
              <Text style={styles.metaText}>{article.source} ᐧ </Text>
              <Text style={styles.metaText}>
                {article.estimatedReadTime} min read
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
              source={{ uri: article.image }}
              style={styles.compactImage}
            />
          )}
        </View>
        <View style={styles.cardAction}>
          <View style={styles.featuredMeta}>
            <Text style={styles.metaText}>{article.source} ᐧ </Text>
            <Text style={styles.metaText}>
              {article.estimatedReadTime} min read
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
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const renderHeader = () => {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: Article; index: number }) => {
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

  const fetchArticleData = async () => {
    try {
      setIsLoading(true);
      const result = await fetch("/api/rss-feed" + "?url=" + feedSource);
      const data = await result.json();
      console.log(data);

      if (data.success) {
        setArticles(data?.data?.items);
      }
    } catch (error) {
      console.error("Error fetching article data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {};

  const handleOnSave = () => {};

  useEffect(() => {
    fetchArticleData();
  }, []);

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
