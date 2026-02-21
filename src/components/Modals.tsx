import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

interface BaseModalProps {
    visible: boolean;
    title: string;
    message: string;
    onClose: () => void;
}

interface AlertModalProps extends BaseModalProps {
    type?: 'success' | 'error' | 'info';
    buttonText?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
    visible,
    title,
    message,
    onClose,
    type = 'info',
    buttonText = 'OK'
}) => {

    let iconName: keyof typeof Ionicons.glyphMap = 'information-circle-outline';
    let iconColor = theme.colors.text;

    if (type === 'success') {
        iconName = 'checkmark-circle-outline';
        iconColor = theme.colors.primary;
    } else if (type === 'error') {
        iconName = 'alert-circle-outline';
        iconColor = '#FF3B30';
    }

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <BlurView intensity={70} tint="dark" style={styles.overlay}>
                <View style={styles.card}>
                    <Ionicons name={iconName} size={48} color={iconColor} style={styles.icon} />
                    <Text style={styles.title}>{title.toUpperCase()}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <TouchableOpacity style={[styles.button, { borderColor: iconColor }]} onPress={onClose}>
                        <Text style={[styles.buttonText, { color: iconColor }]}>{buttonText.toUpperCase()}</Text>
                    </TouchableOpacity>
                </View>
            </BlurView>
        </Modal>
    );
};

interface ConfirmModalProps extends BaseModalProps {
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    visible,
    title,
    message,
    onClose,
    onConfirm,
    confirmText = 'CONFIRM',
    cancelText = 'CANCEL',
    isDestructive = false
}) => {
    const mainColor = isDestructive ? '#FF3B30' : theme.colors.primary;

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <BlurView intensity={70} tint="dark" style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>{title.toUpperCase()}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>{cancelText.toUpperCase()}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.confirmButton, { backgroundColor: isDestructive ? 'rgba(255, 59, 48, 0.15)' : 'rgba(197, 160, 89, 0.15)', borderColor: mainColor }]}
                            onPress={() => {
                                onConfirm();
                                onClose();
                            }}
                        >
                            <Text style={[styles.confirmButtonText, { color: mainColor }]}>{confirmText.toUpperCase()}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </BlurView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        width: width - 48,
        backgroundColor: theme.colors.backgroundSecondary,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    icon: {
        marginBottom: 16,
    },
    title: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.heading,
        fontSize: 20,
        letterSpacing: 2,
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 32,
    },
    button: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    buttonText: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 14,
        letterSpacing: 1,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    cancelButtonText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 14,
        letterSpacing: 1,
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    confirmButtonText: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 14,
        letterSpacing: 1,
    },
});
