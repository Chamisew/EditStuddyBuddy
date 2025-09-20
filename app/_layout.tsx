import { Stack } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import { AuthProvider, useAuth } from "../hooks/useAuth";

function RootLayoutNav() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      {user ? (
        // 👇 show Home (you can later add (tabs) here if you want)
        <>
          <Stack.Screen name="home" />
          <Stack.Screen name="quizzes" />
          <Stack.Screen name="quiz" />
          <Stack.Screen name="global-chat" />
          <Stack.Screen name="ai-chatbot" />
          <Stack.Screen name="helpdesk" />
          <Stack.Screen name="helpdesk-apply" />
          <Stack.Screen name="helpdesk-admin" />
          <Stack.Screen name="chat-menu" />
          <Stack.Screen name="admin" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="upload-resource" />
          <Stack.Screen name="upload-video" />
          <Stack.Screen name="chat" />
          <Stack.Screen name="escape-room" />
          <Stack.Screen name="escape-room-level" />
          <Stack.Screen name="escape-room-qr" />
          <Stack.Screen name="create-game" />
          <Stack.Screen name="play-quiz-game" />
          <Stack.Screen name="play-memory-game" />
          <Stack.Screen name="play-word-puzzle" />
        </>
      ) : (
        <>
          <Stack.Screen name="signin" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="admin-setup" />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
