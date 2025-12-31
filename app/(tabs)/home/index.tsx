import React from "react";
import { ScrollView, Text } from "react-native";

const Page = () => {
  return (
    <ScrollView
      contentContainerStyle={{ flex: 1 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text>Page</Text>
    </ScrollView>
  );
};

export default Page;
