import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useThemeColor } from "heroui-native";
import React from "react";
import type { ColorValue } from "react-native";
import { Pressable, Text } from "react-native";

import { ThemeToggle } from "@/components/theme-toggle";

const isStringColor = (color: ColorValue): color is string =>
  typeof color === "string";

const toIconColor = (color: ColorValue): string | undefined =>
  isStringColor(color) ? color : undefined;

const ThemeToggleHeaderRight = () => <ThemeToggle />;

const HomeDrawerIcon = ({
  size,
  color,
}: {
  size: number;
  color: ColorValue;
  focused: boolean;
}) => <Ionicons name="home-outline" size={size} color={toIconColor(color)} />;

const HomeDrawerLabel = ({
  color,
}: {
  color: ColorValue;
  focused: boolean;
}) => <Text style={{ color }}>Home</Text>;

const TabsDrawerIcon = ({
  size,
  color,
}: {
  size: number;
  color: ColorValue;
  focused: boolean;
}) => (
  <MaterialIcons name="border-bottom" size={size} color={toIconColor(color)} />
);

const TabsDrawerLabel = ({
  color,
}: {
  color: ColorValue;
  focused: boolean;
}) => <Text style={{ color }}>Tabs</Text>;

const TabsHeaderRight = () => (
  <Link href="/modal" asChild>
    <Pressable className="mr-4">
      <Ionicons name="add-outline" size={24} />
    </Pressable>
  </Link>
);

const DrawerLayout = () => {
  const themeColorForeground = useThemeColor("foreground");
  const themeColorBackground = useThemeColor("background");

  return (
    <Drawer
      screenOptions={{
        drawerStyle: { backgroundColor: themeColorBackground },
        headerRight: ThemeToggleHeaderRight,
        headerStyle: { backgroundColor: themeColorBackground },
        headerTintColor: themeColorForeground,
        headerTitleStyle: {
          color: themeColorForeground,
          fontWeight: "600",
        },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerIcon: HomeDrawerIcon,
          drawerLabel: HomeDrawerLabel,
          headerTitle: "Home",
        }}
      />
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerIcon: TabsDrawerIcon,
          drawerLabel: TabsDrawerLabel,
          headerRight: TabsHeaderRight,
          headerTitle: "Tabs",
        }}
      />
    </Drawer>
  );
};

export default DrawerLayout;
