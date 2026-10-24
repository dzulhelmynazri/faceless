import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useThemeColor } from "heroui-native";
import type { ColorValue } from "react-native";

const isStringColor = (color: ColorValue): color is string =>
  typeof color === "string";

const toIconColor = (color: ColorValue): string | undefined =>
  isStringColor(color) ? color : undefined;

const HomeTabBarIcon = ({
  color,
  size,
}: {
  focused: boolean;
  color: ColorValue;
  size: number;
}) => <Ionicons name="home" size={size} color={toIconColor(color)} />;

const ExploreTabBarIcon = ({
  color,
  size,
}: {
  focused: boolean;
  color: ColorValue;
  size: number;
}) => <Ionicons name="compass" size={size} color={toIconColor(color)} />;

const TabLayout = () => {
  const themeColorForeground = useThemeColor("foreground");
  const themeColorBackground = useThemeColor("background");

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: themeColorBackground,
        },
        headerTintColor: themeColorForeground,
        headerTitleStyle: {
          color: themeColorForeground,
          fontWeight: "600",
        },
        tabBarStyle: {
          backgroundColor: themeColorBackground,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: HomeTabBarIcon,
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          tabBarIcon: ExploreTabBarIcon,
          title: "Explore",
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
