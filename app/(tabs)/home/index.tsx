import ArticlesFeed from "@/components/artic-feed";
import { COLORS } from "@/utils/Colors";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const Page = () => {
  const [isLoading, setIsLoading] = useState(false);
  const translateY1 = useSharedValue(0);
  const translateY2 = useSharedValue(0);
  const translateY3 = useSharedValue(0);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY1.value }],
  }));
  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY2.value }],
  }));
  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY3.value }],
  }));

  useEffect(() => {
    if (isLoading) {
      // Create a bounce sequence: up then down
      const bounceSequence = withSequence(
        withTiming(-35, { duration: 350, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 350, easing: Easing.in(Easing.quad) }),
        withTiming(0, { duration: 800 })
      );

      // Stagger the animations with delays
      translateY1.value = withRepeat(bounceSequence, -1); // -1 means infinite

      // Delay second shape
      setTimeout(() => {
        translateY2.value = withRepeat(bounceSequence, -1);
      }, 150);

      // Delay third shape
      setTimeout(() => {
        translateY3.value = withRepeat(bounceSequence, -1);
      }, 450);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <ScrollView
        contentContainerStyle={styles.container}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.content}>
          <View style={styles.loadingContainer}>
            <View style={styles.loadingShapes}>
              <Animated.View
                style={[styles.shapes, styles.circle, animatedStyle1]}
              />
              <Animated.View
                style={[styles.shapes, styles.triangle, animatedStyle2]}
              />
              <Animated.View
                style={[styles.shapes, styles.square, animatedStyle3]}
              />
            </View>
            <Text style={styles.loadingText}>Loading ... </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ArticlesFeed
      maxItems={10}
      feedSource="react-native"
      title="React Native Articles"
    />
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingShapes: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
  },
  shapes: {
    width: 40,
    height: 40,
  },
  circle: {
    borderRadius: 20,
    backgroundColor: "#E85A4F",
  },
  triangle: {
    borderStyle: "solid",
    borderBottomColor: "#F4A261",
    backgroundColor: "transparent",
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderBottomWidth: 35,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  square: {
    backgroundColor: "#2A9D8F",
    width: 40,
    height: 40,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textDark,
  },
});
