import { Colors } from "@/theme/constants";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import Animated, {
	Easing,
	Extrapolation,
	interpolate,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withSequence,
	withSpring,
	withTiming
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

interface SplashAnimationProps {
	onFinish: () => void;
}

export default function SplashAnimation({ onFinish }: SplashAnimationProps) {
	// ── Shared values ──────────────────────────────────────────────────────
	const bgOpacity = useSharedValue(0);
	const glowScale = useSharedValue(0.2);
	const glowOpacity = useSharedValue(0);

	const logoScale = useSharedValue(0.25);
	const logoOpacity = useSharedValue(0);

	const titleTranslateY = useSharedValue(24);
	const titleOpacity = useSharedValue(0);

	const taglineOpacity = useSharedValue(0);

	const scanX = useSharedValue(-width);
	const scanOpacity = useSharedValue(0);

	const progressWidth = useSharedValue(0);
	const progressOpacity = useSharedValue(0);

	const containerOpacity = useSharedValue(1);

	// ── Finish callback (JS thread) ────────────────────────────────────────
	const finish = useCallback(() => {
		onFinish();
	}, [onFinish]);

	// ── Animation sequence ─────────────────────────────────────────────────
	useEffect(() => {
		// 1. Bg fade in
		bgOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) });

		// 2. Ambient glow pulse from center
		glowOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
		glowScale.value = withDelay(
			200,
			withSpring(1, { damping: 16, stiffness: 60 })
		);

		// 3. Logo scales in with spring
		logoOpacity.value = withDelay(350, withTiming(1, { duration: 450 }));
		logoScale.value = withDelay(
			350,
			withSpring(1, { damping: 14, stiffness: 110 })
		);

		// 4. Title slides up
		titleOpacity.value = withDelay(700, withTiming(1, { duration: 420 }));
		titleTranslateY.value = withDelay(
			700,
			withSpring(0, { damping: 20, stiffness: 130 })
		);

		// 5. Tagline fades in
		taglineOpacity.value = withDelay(1000, withTiming(1, { duration: 400 }));

		// 6. Scan line sweeps across once
		scanOpacity.value = withDelay(1150, withTiming(0.9, { duration: 200 }));
		scanX.value = withDelay(
			1150,
			withSequence(
				withTiming(width + 80, {
					duration: 650,
					easing: Easing.inOut(Easing.quad),
				}),
				withTiming(width + 80, { duration: 0 })
			)
		);

		// 7. Progress bar fills
		progressOpacity.value = withDelay(1100, withTiming(1, { duration: 200 }));
		progressWidth.value = withDelay(
			1100,
			withTiming(1, {
				duration: 1050,
				easing: Easing.bezier(0.25, 0.1, 0.25, 1),
			})
		);

		// 8. Fade out entire screen once complete
		containerOpacity.value = withDelay(
			2450,
			withTiming(0, { duration: 480, easing: Easing.in(Easing.quad) }, (done: boolean | undefined) => {
				if (done) runOnJS(finish)();
			})
		);
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// ── Animated styles ────────────────────────────────────────────────────
	const containerStyle = useAnimatedStyle(() => ({
		opacity: containerOpacity.value,
	}));

	const bgStyle = useAnimatedStyle(() => ({
		opacity: bgOpacity.value,
	}));

	const glowStyle = useAnimatedStyle(() => ({
		opacity: glowOpacity.value,
		transform: [{ scale: glowScale.value }],
	}));

	const logoStyle = useAnimatedStyle(() => ({
		opacity: logoOpacity.value,
		transform: [{ scale: logoScale.value }],
	}));

	const titleStyle = useAnimatedStyle(() => ({
		opacity: titleOpacity.value,
		transform: [{ translateY: titleTranslateY.value }],
	}));

	const taglineStyle = useAnimatedStyle(() => ({
		opacity: taglineOpacity.value,
	}));

	const scanStyle = useAnimatedStyle(() => ({
		opacity: scanOpacity.value,
		transform: [{ translateX: scanX.value }],
	}));

	const progressBarStyle = useAnimatedStyle(() => ({
		width: interpolate(progressWidth.value, [0, 1], [0, width * 0.55], Extrapolation.CLAMP),
	}));

	const progressContainerStyle = useAnimatedStyle(() => ({
		opacity: progressOpacity.value,
	}));

	// ── Render ─────────────────────────────────────────────────────────────
	return (
		<Animated.View style={[styles.container, containerStyle]} pointerEvents="none">
			{/* Background */}
			<Animated.View style={[StyleSheet.absoluteFill, bgStyle]}>
				<LinearGradient
					colors={[Colors.background.primary, Colors.background.secondary, Colors.background.tertiary]}
					locations={[0, 0.5, 1]}
					style={StyleSheet.absoluteFill}
				/>
			</Animated.View>

			{/* Ambient glow orb */}
			<Animated.View style={[styles.glow, glowStyle]} pointerEvents="none">
				<LinearGradient
					colors={[
						"rgba(6,182,212,0.28)",
						"rgba(14,116,144,0.14)",
						"transparent",
					]}
					style={styles.glowGradient}
				/>
			</Animated.View>

			{/* Logo */}
			<Animated.View style={[styles.logoContainer, logoStyle]}>
				<Image
					source={require("@/assets/images/logo.png")}
					style={styles.logo}
					resizeMode="contain"
				/>
			</Animated.View>

			{/* App title */}
			<Animated.Text style={[styles.title, titleStyle]}>
				CineVerse
			</Animated.Text>

			{/* Tagline */}
			<Animated.Text style={[styles.tagline, taglineStyle]}>
				Discover · Watch · Explore
			</Animated.Text>

			{/* Progress bar */}
			<Animated.View style={[styles.progressContainer, progressContainerStyle]}>
				<View style={styles.progressTrack}>
					<Animated.View style={[styles.progressFill, progressBarStyle]}>
						<LinearGradient
							colors={[Colors.primary[400], Colors.primary[600]]}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 0 }}
							style={StyleSheet.absoluteFill}
						/>
					</Animated.View>
				</View>
			</Animated.View>

			{/* Scan line overlay */}
			<Animated.View style={[styles.scanLine, scanStyle]} pointerEvents="none" />
		</Animated.View>
	);
}

const GLOW_SIZE = width * 1.4;
const LOGO_SIZE = 96;

const styles = StyleSheet.create({
	container: {
		...StyleSheet.absoluteFillObject,
		alignItems: "center",
		justifyContent: "center",
		zIndex: 9999,
	},
	glow: {
		position: "absolute",
		width: GLOW_SIZE,
		height: GLOW_SIZE,
		borderRadius: GLOW_SIZE / 2,
		overflow: "hidden",
		alignSelf: "center",
		top: height / 2 - GLOW_SIZE / 2,
	},
	glowGradient: {
		flex: 1,
	},
	logoContainer: {
		width: LOGO_SIZE,
		height: LOGO_SIZE,
		marginBottom: 20,
		shadowColor: Colors.primary[400],
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.7,
		shadowRadius: 24,
		elevation: 16,
	},
	logo: {
		width: LOGO_SIZE,
		height: LOGO_SIZE,
	},
	title: {
		fontSize: 36,
		fontWeight: "800",
		letterSpacing: 6,
		color: Colors.text.primary,
		textTransform: "uppercase",
		marginBottom: 8,
		textShadowColor: Colors.primary[400],
		textShadowOffset: { width: 0, height: 0 },
		textShadowRadius: 18,
	},
	tagline: {
		fontSize: 12,
		fontWeight: "400",
		letterSpacing: 3.5,
		color: Colors.text.muted,
		textTransform: "uppercase",
		marginBottom: 56,
	},
	progressContainer: {
		position: "absolute",
		bottom: height * 0.12,
		alignItems: "center",
	},
	progressTrack: {
		width: width * 0.55,
		height: 2,
		backgroundColor: "rgba(34,211,238,0.15)",
		borderRadius: 1,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		borderRadius: 1,
		overflow: "hidden",
	},
	scanLine: {
		position: "absolute",
		top: 0,
		left: -80,
		width: 80,
		height: "100%",
		backgroundColor: "transparent",
		borderRightWidth: 1,
		borderRightColor: "rgba(34,211,238,0.25)",
		// Subtle vertical shimmer
		shadowColor: Colors.primary[300],
		shadowOffset: { width: 6, height: 0 },
		shadowOpacity: 0.3,
		shadowRadius: 18,
	},
});
