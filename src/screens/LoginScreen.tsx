import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Image, ImageBackground } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';
import { GlassmorphismView } from '../components/GlassmorphismView';
import { GoldButton } from '../components/GoldButton';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { LinearGradient } from 'expo-linear-gradient';

type AuthScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

export const LoginScreen = () => {
    const { signIn } = useAuth();
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
        <ImageBackground
            source={require('../../assets/login-bg-v2.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <LinearGradient
                colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']}
                style={StyleSheet.absoluteFillObject}
            />
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <GlassmorphismView style={styles.card}>
                        <Image source={require('../../assets/kyo-logo.png')} style={styles.logo} />

                        {errorMsg ? <Text style={styles.errorText}>{errorMsg.toUpperCase()}</Text> : null}

                        <View style={styles.inputContainer}>
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
                        </View>

                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>FORGOT PASSWORD?</Text>
                        </TouchableOpacity>

                        <GoldButton
                            title={isLoading ? "AUTHENTICATING..." : "LOGIN"}
                            onPress={handleLogin}
                            disabled={!identifier || !password || isLoading}
                            style={[styles.loginButton, (!identifier || !password || isLoading) && styles.buttonDisabled]}
                        />

                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.divider} />
                        </View>

                        <TouchableOpacity style={styles.socialButton}>
                            <Ionicons name="logo-apple" size={20} color={theme.colors.text} />
                            <Text style={styles.socialButtonText}>CONTINUE WITH APPLE</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialButton}>
                            <Ionicons name="logo-google" size={20} color={theme.colors.text} />
                            <Text style={styles.socialButtonText}>CONTINUE WITH GOOGLE</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.signUpContainer}
                            onPress={() => navigation.navigate('SignUp')}
                        >
                            <Text style={styles.signUpText}>DON'T HAVE AN ACCOUNT? <Text style={styles.signUpLink}>SIGN UP</Text></Text>
                        </TouchableOpacity>
                    </GlassmorphismView>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            BY LOGGING IN, YOU AGREE TO OUR{'\n'}
                            <Text style={styles.footerLink}>TERMS OF SERVICE</Text> & <Text style={styles.footerLink}>PRIVACY POLICY</Text>
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
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
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 24,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 24,
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 32,
    },
    forgotPasswordText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 12,
        letterSpacing: 1,
    },
    loginButton: {
        width: '100%',
        marginBottom: 32,
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
        backgroundColor: theme.colors.border,
    },
    dividerText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.monospace,
        paddingHorizontal: 16,
        fontSize: 12,
        letterSpacing: 1,
    },
    socialButton: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingVertical: 14,
        marginBottom: 16,
        gap: 12,
    },
    socialButtonText: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 12,
        letterSpacing: 1,
    },
    signUpContainer: {
        marginTop: 16,
    },
    signUpText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 12,
        letterSpacing: 1,
    },
    signUpLink: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    footer: {
        marginTop: 32,
        alignItems: 'center',
    },
    footerText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 10,
        textAlign: 'center',
        letterSpacing: 1,
        lineHeight: 16,
    },
    footerLink: {
        color: theme.colors.text,
        textDecorationLine: 'underline',
    }
});
