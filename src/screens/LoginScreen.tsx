import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type AuthScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

export const LoginScreen = () => {
    const { signIn, signInWithApple, signInWithGoogle } = useAuth();
    const navigation = useNavigation<AuthScreenNavigationProp>();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!identifier || !password) return;
        setErrorMsg('');
        setIsLoading(true);
        const { error } = await signIn(identifier, password);
        setIsLoading(false);
        if (error) {
            setErrorMsg(error.message);
        }
    };

    return (
        <SafeAreaView style={styles.mainContainer}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.card}>
                        <View style={styles.headerContainer}>
                            <Text style={styles.headerTitle}>KYŌ HAS</Text>
                            <Text style={styles.headerTitle}>RETURNED</Text>
                        </View>

                        {errorMsg ? <Text style={styles.errorText}>{errorMsg.toUpperCase()}</Text> : null}

                        <View style={styles.inputContainer}>
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
                        </View>

                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>FORGOT PASSWORD?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.primaryButton, (!identifier || !password || isLoading) && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={!identifier || !password || isLoading}
                        >
                            <Text style={styles.primaryButtonText}>{isLoading ? "AUTHENTICATING..." : "LOGIN"}</Text>
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

                        <TouchableOpacity
                            style={styles.signUpContainer}
                            onPress={() => navigation.navigate('SignUp')}
                        >
                            <Text style={styles.signUpText}>DON'T HAVE AN ACCOUNT? <Text style={styles.signUpLink}>SIGN UP</Text></Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            BY LOGGING IN, YOU AGREE TO OUR{'\n'}
                            <Text style={styles.footerLink}>TERMS OF SERVICE</Text> & <Text style={styles.footerLink}>PRIVACY POLICY</Text>
                        </Text>
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
    },
    card: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 24,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    headerTitle: {
        color: '#fff',
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 42,
        letterSpacing: 2,
        lineHeight: 48,
        textAlign: 'center',
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
        marginBottom: 16,
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 32,
    },
    forgotPasswordText: {
        color: '#fff',
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 12,
        letterSpacing: 0.5,
    },
    primaryButton: {
        width: '100%',
        backgroundColor: '#fff',
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
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
        marginBottom: 32,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#fff',
    },
    dividerText: {
        color: '#fff',
        fontFamily: theme.typography.fontFamily.medium,
        paddingHorizontal: 16,
        fontSize: 12,
        letterSpacing: 1,
    },
    socialButton: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        borderWidth: 1,
        borderColor: '#fff',
        paddingVertical: 14,
        marginBottom: 16,
        gap: 12,
    },
    socialButtonText: {
        color: '#fff',
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 12,
        letterSpacing: 1,
    },
    signUpContainer: {
        marginTop: 16,
        alignItems: 'center',
    },
    signUpText: {
        color: '#fff',
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 12,
        letterSpacing: 1,
    },
    signUpLink: {
        color: '#fff',
        fontFamily: theme.typography.fontFamily.bold,
    },
    footer: {
        marginTop: 32,
        alignItems: 'center',
    },
    footerText: {
        color: '#fff',
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 10,
        textAlign: 'center',
        letterSpacing: 1,
        lineHeight: 16,
    },
    footerLink: {
        color: '#fff',
        textDecorationLine: 'underline',
    }
});
