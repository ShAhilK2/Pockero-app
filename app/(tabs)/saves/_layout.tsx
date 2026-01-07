import { COLORS } from "@/utils/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function SavesLayout() {
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: COLORS.white } }}>
      <Stack.Screen
        name="index"
        options={{
          title: "Saves",
          headerLargeTitle: true,
          headerLargeTitleShadowVisible: false,
          headerRight: () => {
            return (
              <TouchableOpacity>
                <Ionicons name="add" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            );
          },
        }}
      />
    </Stack>
  );
}
