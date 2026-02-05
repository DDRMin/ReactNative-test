import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Dimensions,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import YoutubePlayer from 'react-native-youtube-iframe';

interface TrailerModalProps {
    visible: boolean;
    videoId: string | null;
    onClose: () => void;
    movieTitle?: string;
}

const { width } = Dimensions.get('window');
const VIDEO_HEIGHT = width * 0.5625; // 16:9 aspect ratio

const TrailerModal = ({ visible, videoId, onClose, movieTitle }: TrailerModalProps) => {
    const [playing, setPlaying] = useState(true);

    // Reanimated shared values (runs on UI thread)
    const fadeAnim = useSharedValue(0);
    const scaleAnim = useSharedValue(0.9);

    useEffect(() => {
        if (visible) {
            setPlaying(true);
            fadeAnim.value = withTiming(1, { duration: 300 });
            scaleAnim.value = withSpring(1, { damping: 15, stiffness: 150 });
        }
    }, [visible]);

    const handleClose = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        fadeAnim.value = withTiming(0, { duration: 200 });
        scaleAnim.value = withTiming(0.9, { duration: 200 }, (finished) => {
            if (finished) {
                runOnJS(setPlaying)(false);
                runOnJS(onClose)();
            }
        });
    }, [onClose]);

    const onStateChange = useCallback((state: string) => {
        if (state === "ended") {
            setPlaying(false);
            handleClose();
        }
    }, [handleClose]);

    // Animated styles (computed on UI thread)
    const backdropStyle = useAnimatedStyle(() => ({
        opacity: fadeAnim.value,
    }));

    const cardStyle = useAnimatedStyle(() => ({
        opacity: fadeAnim.value,
        transform: [{ scale: scaleAnim.value }],
    }));

    if (!videoId) return null;

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Tappable backdrop to close */}
            <TouchableWithoutFeedback onPress={handleClose}>
                <Animated.View style={[styles.backdrop, backdropStyle]}>
                    <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                </Animated.View>
            </TouchableWithoutFeedback>

            {/* Content Container - won't close when tapped */}
            <View style={styles.contentContainer} pointerEvents="box-none">

                {/* Close hint at top */}
                <Animated.View style={[styles.hintContainer, backdropStyle]}>
                    <Text style={styles.hintText}>Tap outside to close</Text>
                </Animated.View>

                {/* Video Player Card */}
                <Animated.View style={[styles.videoCard, cardStyle]}>
                    {/* Video Header */}
                    <View style={styles.videoHeader}>
                        <View style={styles.headerLeft}>
                            <View style={styles.liveIndicator}>
                                <View style={styles.liveDot} />
                                <Text style={styles.liveText}>TRAILER</Text>
                            </View>
                            {movieTitle && (
                                <Text style={styles.movieTitle} numberOfLines={1}>
                                    {movieTitle}
                                </Text>
                            )}
                        </View>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleClose}
                            activeOpacity={0.7}
                        >
                            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                            <Ionicons name="close" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* YouTube Player */}
                    <View style={styles.videoWrapper}>
                        <YoutubePlayer
                            height={VIDEO_HEIGHT}
                            width={width - 32}
                            play={playing}
                            videoId={videoId}
                            onChangeState={onStateChange}
                            forceAndroidAutoplay
                            webViewStyle={styles.webView}
                        />
                    </View>

                    {/* Video Footer */}
                    <LinearGradient
                        colors={['rgba(5, 8, 16, 0.9)', 'rgba(5, 8, 16, 1)']}
                        style={styles.videoFooter}
                    >
                        <View style={styles.footerContent}>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="share-outline" size={20} color="#67e8f9" />
                                <Text style={styles.actionText}>Share</Text>
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="expand-outline" size={20} color="#67e8f9" />
                                <Text style={styles.actionText}>Fullscreen</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Swipe down hint */}
                <Animated.View style={[styles.bottomHint, backdropStyle]}>
                    <View style={styles.swipeIndicator} />
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    hintContainer: {
        position: 'absolute',
        top: 60,
        alignItems: 'center',
    },
    hintText: {
        color: 'rgba(103, 232, 249, 0.5)',
        fontSize: 12,
        fontWeight: '500',
    },
    videoCard: {
        width: width - 32,
        backgroundColor: '#050810',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.2)',
        shadowColor: '#22d3ee',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 20,
    },
    videoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'rgba(8, 145, 178, 0.1)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(34, 211, 238, 0.1)',
    },
    headerLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 6,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#ef4444',
    },
    liveText: {
        color: '#ef4444',
        fontSize: 10,
        fontWeight: '700',
    },
    movieTitle: {
        color: '#ecfeff',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    videoWrapper: {
        backgroundColor: '#000',
    },
    webView: {
        borderRadius: 0,
    },
    videoFooter: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    footerContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 24,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    actionText: {
        color: '#67e8f9',
        fontSize: 13,
        fontWeight: '500',
    },
    divider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(34, 211, 238, 0.2)',
    },
    bottomHint: {
        position: 'absolute',
        bottom: 40,
        alignItems: 'center',
    },
    swipeIndicator: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(103, 232, 249, 0.3)',
    },
});

export default TrailerModal;
