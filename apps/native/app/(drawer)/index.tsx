import { Ionicons } from "@expo/vector-icons";
import { isNonEmptyString } from "@faceless/utils";
import { useQuery } from "@tanstack/react-query";
import { Card, Chip, useThemeColor } from "heroui-native";
import { Pressable, Text, View } from "react-native";

import { Container } from "@/components/container";
import { SignIn } from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";
import { authClient } from "@/lib/auth-client";
import { queryClient, trpc } from "@/utils/trpc";

const getStatusDescription = (
  isLoading: boolean,
  isConnected: boolean
): string => {
  if (isLoading) {
    return "Checking connection...";
  }

  if (isConnected) {
    return "Connected to API";
  }

  return "API Disconnected";
};

const StatusIcon = ({
  isLoading,
  isConnected,
  mutedColor,
  successColor,
  dangerColor,
}: {
  isLoading: boolean;
  isConnected: boolean;
  mutedColor: string;
  successColor: string;
  dangerColor: string;
}) => {
  if (isLoading) {
    return <Ionicons name="hourglass-outline" size={20} color={mutedColor} />;
  }

  if (isConnected) {
    return <Ionicons name="checkmark-circle" size={20} color={successColor} />;
  }

  return <Ionicons name="close-circle" size={20} color={dangerColor} />;
};

const Home = () => {
  const healthCheck = useQuery(trpc.healthCheck.queryOptions());
  const privateData = useQuery(trpc.privateData.queryOptions());
  const { data: healthData, isLoading } = healthCheck;
  const isConnected = healthData === "OK";
  const { data: session } = authClient.useSession();

  const mutedColor = useThemeColor("muted");
  const successColor = useThemeColor("success");
  const dangerColor = useThemeColor("danger");

  const statusDescription = getStatusDescription(isLoading, isConnected);
  const privateMessage = privateData.data?.message;

  return (
    <Container className="p-6">
      <View className="mb-6 py-4">
        <Text className="mb-2 text-4xl font-bold text-foreground">
          hackhaton-space.vercel.app
        </Text>
      </View>

      {session?.user ? (
        <Card variant="secondary" className="mb-6 p-4">
          <Text className="mb-2 text-base text-foreground">
            Welcome, <Text className="font-medium">{session.user.name}</Text>
          </Text>
          <Text className="mb-4 text-sm text-muted">{session.user.email}</Text>
          <Pressable
            className="bg-danger self-start rounded-lg px-4 py-3 active:opacity-70"
            onPress={() => {
              void authClient.signOut();
              void queryClient.invalidateQueries();
            }}
          >
            <Text className="font-medium text-foreground">Sign Out</Text>
          </Pressable>
        </Card>
      ) : null}

      <Card variant="secondary" className="p-6">
        <View className="mb-4 flex-row items-center justify-between">
          <Card.Title>System Status</Card.Title>
          <Chip
            variant="secondary"
            color={isConnected ? "success" : "danger"}
            size="sm"
          >
            <Chip.Label>{isConnected ? "LIVE" : "OFFLINE"}</Chip.Label>
          </Chip>
        </View>

        <Card className="p-4">
          <View className="flex-row items-center">
            <View
              className={`mr-3 size-3 rounded-full ${isConnected ? "bg-success" : "bg-muted"}`}
            />
            <View className="flex-1">
              <Text className="mb-1 font-medium text-foreground">
                TRPC Backend
              </Text>
              <Card.Description>{statusDescription}</Card.Description>
            </View>
            <StatusIcon
              isLoading={isLoading}
              isConnected={isConnected}
              mutedColor={mutedColor}
              successColor={successColor}
              dangerColor={dangerColor}
            />
          </View>
        </Card>
      </Card>

      <Card variant="secondary" className="mt-6 p-4">
        <Card.Title className="mb-3">Private Data</Card.Title>
        {isNonEmptyString(privateMessage) ? (
          <Card.Description>{privateMessage}</Card.Description>
        ) : null}
      </Card>

      {session?.user ? null : (
        <>
          <SignIn />
          <SignUp />
        </>
      )}
    </Container>
  );
};

export default Home;
