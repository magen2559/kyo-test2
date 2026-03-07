import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { GlassHeader } from '../components/GlassHeader';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from '../components/Modals';
import { scheduleLocalFOMOAlert } from '../utils/notifications';
import { supabase } from '../lib/supabase';

const SETTING_ITEMS = [
    { id: 'notifications', title: 'PUSH NOTIFICATIONS', type: 'toggle', value: true },
    { id: 'marketing', title: 'MARKETING EMAILS', type: 'toggle', value: false },
    { id: 'language', title: 'LANGUAGE', type: 'link', value: 'ENGLISH' },
    { id: 'help', title: 'HELP & SUPPORT', type: 'link' },
    { id: 'privacy', title: 'PRIVACY POLICY', type: 'link' },
    { id: 'terms', title: 'TERMS OF SERVICE', type: 'link' },
];

export const SettingsScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { signOut } = useAuth();

    const [settings, setSettings] = React.useState<Record<string, any>>({
        notifications: true,
        marketing: false,
    });

    React.useEffect(() => {
        const fetchSettings = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('user_profiles')
                    .select('notification_enabled')
                    .eq('id', user.id)
                    .single();
                if (data) {
                    setSettings(prev => ({ ...prev, notifications: data.notification_enabled }));
                }
            }
        };
        fetchSettings();
    }, []);

    const [confirmVisible, setConfirmVisible] = React.useState(false);
    const [confirmConfig, setConfirmConfig] = React.useState({
        title: '',
        message: '',
        confirmText: '',
        isDestructive: false,
        onConfirm: () => { }
    });

    const toggleSetting = async (id: string) => {
        const newVal = !settings[id];
        setSettings(prev => ({ ...prev, [id]: newVal }));

        if (id === 'notifications') {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from('user_profiles')
                    .update({ notification_enabled: newVal })
                    .eq('id', user.id);
            }
        }
    };

    return (
        <View style={styles.container}>
            <GlassHeader title="SETTINGS" onLeftPress={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 56 }]}>

                <View style={styles.section}>
                    {SETTING_ITEMS.map((item, index) => (
                        <View key={item.id}>
                            <TouchableOpacity
                                style={styles.settingRow}
                                disabled={item.type === 'toggle'}
                            >
                                <Text style={styles.settingTitle}>{item.title}</Text>

                                {item.type === 'toggle' ? (
                                    <Switch
                                        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                                        thumbColor={settings[item.id] ? '#fff' : '#ccc'}
                                        ios_backgroundColor={theme.colors.border}
                                        onValueChange={() => toggleSetting(item.id)}
                                        value={settings[item.id]}
                                    />
                                ) : (
                                    <View style={styles.linkRight}>
                                        {item.value && <Text style={styles.settingValue}>{item.value}</Text>}
                                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                                    </View>
                                )}
                            </TouchableOpacity>
                            {index < SETTING_ITEMS.length - 1 && <View style={styles.divider} />}
                        </View>
                    ))}
                </View>

                {/* Developer Tools to Test Push Notifications */}
                <View style={styles.dangerZone}>
                    <Text style={styles.sectionHeader}>DEVELOPER TOOLS</Text>
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={styles.settingRow}
                            onPress={() => scheduleLocalFOMOAlert()}
                        >
                            <Text style={styles.settingTitle}>TEST FOMO ALERT</Text>
                            <Ionicons name="notifications-outline" size={20} color={theme.colors.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.dangerZone}>
                    <Text style={styles.sectionHeader}>ACCOUNT</Text>
                    <View style={styles.section}>
                        <View style={styles.settingRow}>
                            <Text style={styles.settingTitle}>AGE VERIFICATION</Text>
                            <View style={styles.linkRight}>
                                <Text style={styles.settingValue}>VERIFIED 21+</Text>
                                <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.settingRow} onPress={() => {
                            setConfirmConfig({
                                title: 'SIGN OUT',
                                message: 'Are you sure you want to sign out of your VIP account?',
                                confirmText: 'SIGN OUT',
                                isDestructive: true,
                                onConfirm: signOut
                            });
                            setConfirmVisible(true);
                        }}>
                            <Text style={styles.signOutText}>SIGN OUT</Text>
                            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.settingRow} onPress={() => {
                            setConfirmConfig({
                                title: 'DELETE ACCOUNT',
                                message: 'This action is permanent and cannot be undone. All your VIP points and upcoming reservations will be lost.',
                                confirmText: 'DELETE PERMANENTLY',
                                isDestructive: true,
                                onConfirm: () => console.log('Delete logic')
                            });
                            setConfirmVisible(true);
                        }}>
                            <Text style={styles.deleteText}>DELETE ACCOUNT</Text>
                            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.versionInfo}>
                    <Text style={styles.versionText}>KYO APP v1.0.0</Text>
                    <Text style={styles.versionText}>STEALTH INDUSTRIAL ENGINE</Text>
                </View>

            </ScrollView>

            <ConfirmModal
                visible={confirmVisible}
                title={confirmConfig.title}
                message={confirmConfig.message}
                confirmText={confirmConfig.confirmText}
                isDestructive={confirmConfig.isDestructive}
                onConfirm={confirmConfig.onConfirm}
                onClose={() => setConfirmVisible(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        padding: 24,
    },
    sectionHeader: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 12,
        letterSpacing: 2,
        marginBottom: 16,
        marginLeft: 4,
    },
    section: {
        backgroundColor: theme.colors.backgroundSecondary,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
        marginBottom: 32,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingVertical: 20,
    },
    settingTitle: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 14,
        letterSpacing: 1,
    },
    settingValue: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 12,
        marginRight: 8,
    },
    linkRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginLeft: 16,
    },
    dangerZone: {
        marginTop: 16,
    },
    signOutText: {
        color: '#FF3B30',
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 14,
        letterSpacing: 1,
    },
    deleteText: {
        color: '#FF3B30',
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 14,
        letterSpacing: 1,
    },
    versionInfo: {
        alignItems: 'center',
        marginTop: 32,
        marginBottom: 64,
        gap: 8,
    },
    versionText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 10,
        letterSpacing: 2,
        opacity: 0.5,
    },
});
