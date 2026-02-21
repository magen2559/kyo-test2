import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../theme';

interface GoldButtonProps extends TouchableOpacityProps {
    title: string;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}

export const GoldButton: React.FC<GoldButtonProps> = ({ title, style, textStyle, ...rest }) => {
    return (
        <TouchableOpacity style={[styles.button, style]} activeOpacity={0.8} {...rest}>
            <Text style={[styles.text, textStyle]}>{title.toUpperCase()}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 0, // Sharp corners as requested in design
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#000000', // Dark text on gold button for high contrast
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 14,
        letterSpacing: 1.5,
    },
});
