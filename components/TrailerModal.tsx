import React, { useState, useCallback } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface TrailerModalProps {
    visible: boolean;
    videoId: string | null;
    onClose: () => void;
}

const { width } = Dimensions.get('window');

const TrailerModal = ({ visible, videoId, onClose }: TrailerModalProps) => {
    const [playing, setPlaying] = useState(true);

    const onStateChange = useCallback((state: string) => {
        if (state === "ended") {
            setPlaying(false);
            onClose();
        }
    }, [onClose]);

    if (!videoId) return null;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close-circle" size={40} color="white" />
                </TouchableOpacity>

                <View style={styles.videoContainer}>
                    <YoutubePlayer
                        height={width * 0.5625} // 16:9 aspect ratio
                        width={width}
                        play={playing}
                        videoId={videoId}
                        onChangeState={onStateChange}
                        forceAndroidAutoplay
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    videoContainer: {
        width: '100%',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 60,
        right: 20,
        zIndex: 10,
    }
});

export default TrailerModal;
