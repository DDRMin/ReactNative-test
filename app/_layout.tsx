import { SavedMoviesProvider } from "@/contexts/SavedMoviesContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";

export default function RootLayout() {
	return (
		<SafeAreaProvider>
			<SavedMoviesProvider>
				<StatusBar style="light" />
				<Stack>
					<Stack.Screen
						name="(tabs)"
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="movies/[id]"
						options={{ title: "Movie Details", headerShown: false }}
					/>
					<Stack.Screen
						name="movies/now-playing"
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="genre/[id]"
						options={{ headerShown: false }}
					/>
				</Stack>
			</SavedMoviesProvider>
		</SafeAreaProvider>
	);
}
