import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Cross-platform haptic feedback utilities
 * 
 * Note: On Android, performAndroidHapticsAsync and impactAsync don't work
 * reliably on many devices. NotificationFeedbackType is the only reliable
 * option that works across all Android devices.
 */

// Light haptic - for subtle feedback
export const hapticLight = () => {
    if (Platform.OS === 'android') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
};

// Medium haptic - for button presses and confirmations
export const hapticMedium = () => {
    if (Platform.OS === 'android') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
};

// Heavy haptic - for important actions
export const hapticHeavy = () => {
    if (Platform.OS === 'android') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
};

// Selection haptic - for picker/list selections
export const hapticSelection = () => {
    if (Platform.OS === 'android') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
        Haptics.selectionAsync();
    }
};

// Tab press haptic - for navigation tabs
export const hapticTabPress = () => {
    if (Platform.OS === 'android') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
};

// Warning notification haptic
export const hapticWarning = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

// Success notification haptic
export const hapticSuccess = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

// Error notification haptic
export const hapticError = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};
