import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { theme } from '../theme';

interface GlassmorphismViewProps extends ViewProps {
    children: React.ReactNode;
    neonBorder?: boolean;
}

export const GlassmorphismView: React.FC<GlassmorphismViewProps> = ({ children, style, neonBorder, ...rest }) => {
    return (
        <View style={[styles.container, neonBorder && styles.neonBorder, style]} {...rest}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        padding: 16,
    },
    neonBorder: {
        borderColor: theme.colors.neonGlow,
        shadowColor: theme.colors.neonGlow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
    },
});
