import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

interface GlassHeaderProps {
    title: string;
    onLeftPress?: () => void;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightElement?: React.ReactNode;
}

export const GlassHeader: React.FC<GlassHeaderProps> = ({ title, onLeftPress, leftIcon, rightElement }) => {
    const insets = useSafeAreaInsets();

    return (
        <BlurView
            intensity={80}
            tint="dark"
            style={[styles.container, { paddingTop: insets.top }]}
        >
            <View style={styles.content}>
                {onLeftPress ? (
                    <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
                        <Ionicons name={leftIcon || "chevron-back"} size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.iconPlaceholder} />
                )}

                <Text style={styles.title}>{title.toUpperCase()}</Text>

                {rightElement ? (
                    <View style={styles.iconButton}>
                        {rightElement}
                    </View>
                ) : (
                    <View style={styles.iconPlaceholder} />
                )}
            </View>
            <View style={styles.bottomBorder} />
        </BlurView>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        position: 'absolute',
        top: 0,
        zIndex: 100,
    },
    content: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    title: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 16,
        letterSpacing: 2,
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconPlaceholder: {
        width: 40,
    },
    bottomBorder: {
        height: 1,
        backgroundColor: theme.colors.primary,
        width: '100%',
        opacity: 0.5,
    },
});
