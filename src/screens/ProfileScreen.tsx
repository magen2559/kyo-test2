import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';
import { GlassmorphismView } from '../components/GlassmorphismView';

export const ProfileScreen = () => {
    const { user, signOut } = useAuth();

    return (
        <View style={styles.container}>
            <GlassmorphismView style={styles.card}>
                <Text style={styles.heading}>MY PROFILE</Text>
                <View style={styles.divider} />

                <View style={styles.infoRow}>
                    <Text style={styles.label}>EMAIL</Text>
                    <Text style={styles.value}>{user?.email || 'N/A'}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>MEMBERSHIP</Text>
                    <Text style={[styles.value, styles.goldText]}>GOLD TIER</Text>
                </View>

                <TouchableOpacity style={styles.button} onPress={signOut}>
                    <Text style={styles.buttonText}>SIGN OUT</Text>
                </TouchableOpacity>
            </GlassmorphismView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: 24,
    },
    card: {
        marginTop: 48,
    },
    heading: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.heading,
        fontSize: 24,
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginBottom: 24,
    },
    infoRow: {
        marginBottom: 20,
    },
    label: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: 12,
        marginBottom: 4,
    },
    value: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 16,
    },
    goldText: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    button: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    buttonText: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 14,
    },
});
