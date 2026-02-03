import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack>
        <Stack.Screen
		  name="(tabs)"
		  options={{ headerShown: false }}
        />
		<Stack.Screen
		  name="movies/[id]"
		  options={{ title: "Movie Details" , headerShown: false}}
		/>
		<Stack.Screen
		  name="genre/[id]"
		  options={{ headerShown: false }}
		/>
      </Stack>
    </SafeAreaProvider>
  );
}
