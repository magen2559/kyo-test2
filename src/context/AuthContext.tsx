import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { registerForPushNotificationsAsync, saveUserPushToken } from '../utils/notifications';

import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

// Ensure WebBrowser is ready
WebBrowser.maybeCompleteAuthSession();

type AuthContextType = {
    session: Session | null;
    user: User | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string, name: string) => Promise<{ error: any, data?: any }>;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<{ error: any }>;
    signInWithApple: () => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    isLoading: true,
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
    signOut: async () => { },
    signInWithGoogle: async () => ({ error: null }),
    signInWithApple: async () => ({ error: null }),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handlePushRegistration = async (currentUser: User) => {
            const token = await registerForPushNotificationsAsync();
            if (token) {
                await saveUserPushToken(currentUser.id, token);
            }
        };

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
            if (session?.user) {
                handlePushRegistration(session.user);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                handlePushRegistration(session.user);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error };
    };

    const signUp = async (email: string, password: string, name: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                }
            }
        });
        return { error, data };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
    };

    const signInWithGoogle = async () => {
        try {
            const redirectUrl = Linking.createURL('/');

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                },
            });

            if (error) throw error;

            if (data?.url) {
                const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

                if (res.type === 'success' && res.url) {
                    // Extract access token or refresh token manually (Supabase doesn't automatically process success URL when custom scheme is used)
                    // Depending on platform, custom handle might be needed if auto-detectSessionInUrl is false.
                    // But with standard config and matching redirect URL in Dashboard, it typically just logs in.
                }
            }
            return { error: null };
        } catch (error) {
            console.error('Google Sign In Error:', error);
            return { error };
        }
    };

    const signInWithApple = async () => {
        try {
            const redirectUrl = Linking.createURL('/');

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'apple',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                },
            });

            if (error) throw error;

            if (data?.url) {
                const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

                if (res.type === 'success' && res.url) {
                    // Handled similarly to Google
                }
            }
            return { error: null };
        } catch (error) {
            console.error('Apple Sign In Error:', error);
            return { error };
        }
    };

    return (
        <AuthContext.Provider value={{ session, user, isLoading, signIn, signUp, signOut, signInWithGoogle, signInWithApple }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
