import { COLORS } from "@/utils/Colors";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

export default function RootLayout() {
  return (
    <NativeTabs blurEffect="systemChromeMaterial" tintColor={COLORS.textDark}>
      <NativeTabs.Trigger name="home">
        <Label>Home</Label>
        <Icon
          sf={{ default: "house", selected: "house.fill" }}
          drawable="ic_home"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="saves">
        <Label>Saves</Label>
        <Icon
          sf={{ default: "heart", selected: "heart.fill" }}
          drawable="ic_saves"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Label>Settings</Label>
        <Icon
          sf={{ default: "gearshape", selected: "gearshape.fill" }}
          drawable="ic_settings"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
