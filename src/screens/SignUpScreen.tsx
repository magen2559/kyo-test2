import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export const SignUpScreen = () => {
    const { signUp, signInWithApple, signInWithGoogle } = useAuth();
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
        <SafeAreaView style={styles.mainContainer}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.card}>
                        <View style={styles.headerContainer}>
                            <Text style={styles.headerTitle}>KYŌ HAS</Text>
                            <Text style={styles.headerTitle}>RETURNED</Text>
                            <Text style={styles.subtitle}>VIP MEMBERSHIP</Text>
                        </View>

                        {errorMsg ? <Text style={styles.errorText}>{errorMsg.toUpperCase()}</Text> : null}
                        {successMsg ? <Text style={[styles.errorText, { color: '#fff' }]}>{successMsg.toUpperCase()}</Text> : null}

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="FULL NAME"
                                placeholderTextColor="#fff"
                                value={name}
                                onChangeText={setName}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="EMAIL OR PHONE"
                                placeholderTextColor="#fff"
                                value={identifier}
                                onChangeText={setIdentifier}
                                autoCapitalize="none"
                            />

                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="PASSWORD"
                                    placeholderTextColor="#fff"
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
                                        color="#fff"
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="CONFIRM PASSWORD"
                                    placeholderTextColor="#fff"
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
                                {agreeToTerms && <Ionicons name="checkmark" size={14} color="#000" />}
                            </View>
                            <Text style={styles.checkboxText}>
                                I agree to the <Text style={styles.fontBold}>TERMS OF SERVICE &</Text>{'\n'}
                                <Text style={styles.fontBold}>PRIVACY POLICY</Text>
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.primaryButton, (!isFormValid || isLoading) && styles.buttonDisabled]}
                            onPress={handleSignUp}
                            disabled={!isFormValid || isLoading}
                        >
                            <Text style={styles.primaryButtonText}>{isLoading ? "REGISTERING..." : "CREATE ACCOUNT"}</Text>
                        </TouchableOpacity>

                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.divider} />
                        </View>

                        <TouchableOpacity
                            style={[styles.socialButton, isLoading && styles.buttonDisabled]}
                            onPress={async () => {
                                setIsLoading(true);
                                const { error } = await signInWithApple();
                                setIsLoading(false);
                                if (error) setErrorMsg(error.message);
                            }}
                            disabled={isLoading}
                        >
                            <Ionicons name="logo-apple" size={20} color="#fff" />
                            <Text style={styles.socialButtonText}>CONTINUE WITH APPLE</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.socialButton, isLoading && styles.buttonDisabled]}
                            onPress={async () => {
                                setIsLoading(true);
                                const { error } = await signInWithGoogle();
                                setIsLoading(false);
                                if (error) setErrorMsg(error.message);
                            }}
                            disabled={isLoading}
                        >
                            <Ionicons name="logo-google" size={20} color="#fff" />
                            <Text style={styles.socialButtonText}>CONTINUE WITH GOOGLE</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        paddingTop: 60,
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        left: 24,
        zIndex: 10,
        padding: 8,
    },
    card: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 24,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    headerTitle: {
        color: '#fff',
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 42,
        letterSpacing: 2,
        lineHeight: 48,
        textAlign: 'center',
    },
    subtitle: {
        color: '#fff',
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 14,
        letterSpacing: 1,
        marginTop: 12,
        textTransform: 'uppercase',
    },
    errorText: {
        color: '#FF3B30',
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 12,
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
        backgroundColor: '#000',
        borderWidth: 1,
        borderColor: '#fff',
        color: '#fff',
        fontFamily: theme.typography.fontFamily.medium,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 14,
        letterSpacing: 1,
    },
    passwordContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#000',
        borderWidth: 1,
        borderColor: '#fff',
    },
    passwordInput: {
        flex: 1,
        color: '#fff',
        fontFamily: theme.typography.fontFamily.medium,
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
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#fff',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 2,
    },
    checkboxActive: {
        backgroundColor: '#fff',
    },
    checkboxText: {
        flex: 1,
        color: '#fff',
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: 12,
        lineHeight: 18,
    },
    fontBold: {
        fontFamily: theme.typography.fontFamily.bold,
    },
    primaryButton: {
        width: '100%',
        backgroundColor: '#fff',
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#000',
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 16,
        letterSpacing: 1,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginVertical: 24,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#333',
    },
    dividerText: {
        color: '#fff',
        fontFamily: theme.typography.fontFamily.bold,
        paddingHorizontal: 16,
        fontSize: 12,
        letterSpacing: 1,
    },
    socialButton: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#fff',
        paddingVertical: 14,
        marginBottom: 16,
        borderRadius: 2,
    },
    socialButtonText: {
        color: '#fff',
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 14,
        letterSpacing: 1,
        marginLeft: 12,
    },
});
