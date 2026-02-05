import { Colors } from '@/theme/constants';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export type SortOption = 'popular' | 'top_rated' | 'newest';

export interface FilterState {
    sortBy: SortOption;
    year: number | null;
    genres: number[];
}

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    filters: FilterState;
    onApply: (filters: FilterState) => void;
    genres: { id: number; name: string }[];
    resultCount?: number;
}

const SORT_OPTIONS: { key: SortOption; label: string; icon: string }[] = [
    { key: 'popular', label: 'Popular', icon: 'flame' },
    { key: 'top_rated', label: 'Top Rated', icon: 'star' },
    { key: 'newest', label: 'Newest', icon: 'calendar' },
];

// Generate year options from current year to 1990
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [null, ...Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i)];

export default function FilterModal({
    visible,
    onClose,
    filters,
    onApply,
    genres,
    resultCount,
}: FilterModalProps) {
    const [localFilters, setLocalFilters] = React.useState<FilterState>(filters);

    React.useEffect(() => {
        if (visible) {
            setLocalFilters(filters);
        }
    }, [visible, filters]);

    const handleSortChange = (sort: SortOption) => {
        Haptics.selectionAsync();
        setLocalFilters(prev => ({ ...prev, sortBy: sort }));
    };

    const handleYearChange = (year: number | null) => {
        Haptics.selectionAsync();
        setLocalFilters(prev => ({ ...prev, year }));
    };

    const handleGenreToggle = (genreId: number) => {
        Haptics.selectionAsync();
        setLocalFilters(prev => ({
            ...prev,
            genres: prev.genres.includes(genreId)
                ? prev.genres.filter(id => id !== genreId)
                : [...prev.genres, genreId],
        }));
    };

    const handleReset = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setLocalFilters({ sortBy: 'popular', year: null, genres: [] });
    };

    const handleApply = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onApply(localFilters);
        onClose();
    };

    const hasActiveFilters = localFilters.sortBy !== 'popular' ||
        localFilters.year !== null ||
        localFilters.genres.length > 0;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <Animated.View
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(150)}
                    style={StyleSheet.absoluteFill}
                >
                    <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    </Pressable>
                </Animated.View>

                <Animated.View
                    entering={SlideInDown.duration(350).easing(Easing.out(Easing.cubic))}
                    exiting={SlideOutDown.duration(250).easing(Easing.in(Easing.cubic))}
                    style={styles.modalContainer}
                >
                    <BlurView intensity={40} tint="dark" style={styles.modalBlur}>
                        <View style={styles.modalContent}>
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.title}>Filters</Text>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Ionicons name="close" size={24} color={Colors.text.secondary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                style={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                                bounces={false}
                            >
                                {/* Sort By Section */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Sort By</Text>
                                    <View style={styles.sortOptions}>
                                        {SORT_OPTIONS.map(option => (
                                            <TouchableOpacity
                                                key={option.key}
                                                style={[
                                                    styles.sortButton,
                                                    localFilters.sortBy === option.key && styles.sortButtonActive,
                                                ]}
                                                onPress={() => handleSortChange(option.key)}
                                            >
                                                <Ionicons
                                                    name={option.icon as any}
                                                    size={16}
                                                    color={localFilters.sortBy === option.key ? Colors.primary[400] : Colors.text.muted}
                                                />
                                                <Text style={[
                                                    styles.sortButtonText,
                                                    localFilters.sortBy === option.key && styles.sortButtonTextActive,
                                                ]}>
                                                    {option.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Year Section */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Year</Text>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.yearScroll}
                                    >
                                        {YEAR_OPTIONS.map((year, index) => (
                                            <TouchableOpacity
                                                key={year ?? 'any'}
                                                style={[
                                                    styles.yearChip,
                                                    localFilters.year === year && styles.yearChipActive,
                                                ]}
                                                onPress={() => handleYearChange(year)}
                                            >
                                                <Text style={[
                                                    styles.yearChipText,
                                                    localFilters.year === year && styles.yearChipTextActive,
                                                ]}>
                                                    {year ?? 'Any'}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                {/* Genres Section */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Genres</Text>
                                    <View style={styles.genreGrid}>
                                        {genres.map(genre => (
                                            <TouchableOpacity
                                                key={genre.id}
                                                style={[
                                                    styles.genreChip,
                                                    localFilters.genres.includes(genre.id) && styles.genreChipActive,
                                                ]}
                                                onPress={() => handleGenreToggle(genre.id)}
                                            >
                                                <Text style={[
                                                    styles.genreChipText,
                                                    localFilters.genres.includes(genre.id) && styles.genreChipTextActive,
                                                ]}>
                                                    {genre.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </ScrollView>

                            {/* Footer Actions */}
                            <View style={styles.footer}>
                                <TouchableOpacity
                                    style={styles.resetButton}
                                    onPress={handleReset}
                                    disabled={!hasActiveFilters}
                                >
                                    <Text style={[
                                        styles.resetButtonText,
                                        !hasActiveFilters && styles.resetButtonTextDisabled,
                                    ]}>
                                        Reset
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.applyButton}
                                    onPress={handleApply}
                                >
                                    <Text style={styles.applyButtonText}>
                                        Apply{resultCount !== undefined ? ` (${resultCount})` : ''}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </BlurView>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
        maxHeight: height * 0.75,
    },
    modalBlur: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
    },
    modalContent: {
        backgroundColor: 'rgba(10, 15, 25, 0.95)',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderBottomWidth: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text.primary,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    scrollContent: {
        maxHeight: height * 0.5,
    },
    section: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text.secondary,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sortOptions: {
        flexDirection: 'row',
        gap: 10,
    },
    sortButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    sortButtonActive: {
        backgroundColor: 'rgba(34, 211, 238, 0.15)',
        borderColor: Colors.primary[500],
    },
    sortButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.text.muted,
    },
    sortButtonTextActive: {
        color: Colors.primary[400],
    },
    yearScroll: {
        gap: 8,
    },
    yearChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    yearChipActive: {
        backgroundColor: 'rgba(34, 211, 238, 0.15)',
        borderColor: Colors.primary[500],
    },
    yearChipText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.text.muted,
    },
    yearChipTextActive: {
        color: Colors.primary[400],
    },
    genreGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    genreChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    genreChipActive: {
        backgroundColor: 'rgba(167, 139, 250, 0.2)',
        borderColor: Colors.accent.violet,
    },
    genreChipText: {
        fontSize: 13,
        fontWeight: '500',
        color: Colors.text.muted,
    },
    genreChipTextActive: {
        color: Colors.accent.violet,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.08)',
    },
    resetButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    resetButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text.secondary,
    },
    resetButtonTextDisabled: {
        color: Colors.text.dimmed,
    },
    applyButton: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        backgroundColor: Colors.primary[500],
    },
    applyButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#000',
    },
});
