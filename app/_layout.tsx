import SplashAnimation from "@/components/SplashAnimation";
import { SavedMoviesProvider } from "@/contexts/SavedMoviesContext";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";

// Keep the native splash up until we're ready to show our custom animation
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [appReady, setAppReady] = useState(false);
	const [splashDone, setSplashDone] = useState(false);

	// Hide the native splash as soon as the JS bundle is loaded so our
	// custom animation takes over immediately
	useEffect(() => {
		SplashScreen.hideAsync().then(() => setAppReady(true));
	}, []);

	const handleSplashFinish = useCallback(() => {
		setSplashDone(true);
	}, []);

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

				{/* Cinematic intro — rendered above the navigator, unmounts after animation */}
				{appReady && !splashDone && (
					<SplashAnimation onFinish={handleSplashFinish} />
				)}
			</SavedMoviesProvider>
		</SafeAreaProvider>
	);
}
