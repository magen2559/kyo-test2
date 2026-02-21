import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';
import { GlassmorphismView } from '../components/GlassmorphismView';

export const LoginScreen = () => {
    const { signIn } = useAuth();

    return (
        <View style={styles.container}>
            <GlassmorphismView neonBorder style={styles.card}>
                <Text style={styles.heading}>KYO</Text>
                <Text style={styles.subtitle}>VIP ACCESS</Text>

                <TouchableOpacity style={styles.button} onPress={signIn}>
                    <Text style={styles.buttonText}>ENTER</Text>
                </TouchableOpacity>
            </GlassmorphismView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    heading: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.heading,
        fontSize: 48,
        letterSpacing: 4,
    },
    subtitle: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 14,
        letterSpacing: 2,
        marginBottom: 48,
    },
    button: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: theme.colors.background,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 16,
        letterSpacing: 1,
    },
});
