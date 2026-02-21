import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { theme } from '../theme';

interface IndustrialCardProps extends ViewProps {
    children: React.ReactNode;
}

export const IndustrialCard: React.FC<IndustrialCardProps> = ({ children, style, ...rest }) => {
    return (
        <View style={[styles.card, style]} {...rest}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.backgroundSecondary,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        borderRadius: 0, // Sharp corners
        overflow: 'hidden',
    },
});
