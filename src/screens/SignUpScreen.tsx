import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';
import { GlassmorphismView } from '../components/GlassmorphismView';
import { GoldButton } from '../components/GoldButton';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export const SignUpScreen = () => {
    const { signUp } = useAuth();
    const navigation = useNavigation();

    const [name, setName] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async () => {
        if (!name || !identifier || !password || password !== confirmPassword || !agreeToTerms) return;
        setErrorMsg('');
        setSuccessMsg('');
        setIsLoading(true);
        const { error, data } = await signUp(identifier, password, name);
        setIsLoading(false);

        if (error) {
            setErrorMsg(error.message);
        } else if (data?.user && !data.session) {
            setSuccessMsg('Account created! Please check your email to verify.');
        }
    };

    const isFormValid = name && identifier && password && confirmPassword === password && agreeToTerms;

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>

                <GlassmorphismView neonBorder style={styles.card}>
                    <Text style={styles.heading}>JOIN KYO</Text>
                    <Text style={styles.subtitle}>VIP MEMBERSHIP</Text>

                    {errorMsg ? <Text style={styles.errorText}>{errorMsg.toUpperCase()}</Text> : null}
                    {successMsg ? <Text style={[styles.errorText, { color: theme.colors.primary }]}>{successMsg.toUpperCase()}</Text> : null}

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="FULL NAME"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={name}
                            onChangeText={setName}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="EMAIL OR PHONE"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={identifier}
                            onChangeText={setIdentifier}
                            autoCapitalize="none"
                        />

                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="PASSWORD"
                                placeholderTextColor={theme.colors.textSecondary}
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons
                                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color={theme.colors.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="CONFIRM PASSWORD"
                                placeholderTextColor={theme.colors.textSecondary}
                                secureTextEntry={!showPassword}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.checkboxContainer}
                        onPress={() => setAgreeToTerms(!agreeToTerms)}
                    >
                        <View style={[styles.checkbox, agreeToTerms && styles.checkboxActive]}>
                            {agreeToTerms && <Ionicons name="checkmark" size={14} color={theme.colors.background} />}
                        </View>
                        <Text style={styles.checkboxText}>
                            I AGREE TO THE <Text style={styles.linkText}>TERMS OF SERVICE</Text> & <Text style={styles.linkText}>PRIVACY POLICY</Text>
                        </Text>
                    </TouchableOpacity>

                    <GoldButton
                        title={isLoading ? "REGISTERING..." : "CREATE ACCOUNT"}
                        onPress={handleSignUp}
                        disabled={!isFormValid || isLoading}
                        style={[styles.signUpButton, (!isFormValid || isLoading) && styles.buttonDisabled]}
                    />

                </GlassmorphismView>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        paddingTop: 60, // Space for back button
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 24,
        zIndex: 10,
        padding: 8,
    },
    card: {
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 24,
    },
    heading: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.heading,
        fontSize: 36,
        letterSpacing: 4,
    },
    subtitle: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 12,
        letterSpacing: 2,
        marginBottom: 24,
    },
    errorText: {
        color: '#FF3B30',
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 10,
        marginBottom: 24,
        textAlign: 'center',
        letterSpacing: 1,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 24,
        gap: 16,
    },
    input: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: theme.colors.border,
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.monospace,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 14,
        letterSpacing: 1,
    },
    passwordContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    passwordInput: {
        flex: 1,
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.monospace,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 14,
        letterSpacing: 1,
    },
    eyeIcon: {
        padding: 14,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 32,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: theme.colors.textSecondary,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    checkboxText: {
        flex: 1,
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 10,
        letterSpacing: 0.5,
        lineHeight: 16,
    },
    linkText: {
        color: theme.colors.primary,
        textDecorationLine: 'underline',
    },
    signUpButton: {
        width: '100%',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});
