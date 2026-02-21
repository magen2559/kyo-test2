import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';
import { GlassHeader } from '../components/GlassHeader';
import { IndustrialCard } from '../components/IndustrialCard';
import { Ionicons } from '@expo/vector-icons';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

const PAST_BOOKINGS = [
    { id: '1', date: 'SEP 15', title: 'TECHNO RITUAL', table: 'T-10', spend: 'RM 1500' },
    { id: '2', date: 'AUG 28', title: 'BASEMENT ACID', table: 'SOFA-3', spend: 'RM 800' },
];

export const ProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const navigation = useNavigation<ProfileScreenNavigationProp>();

    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);

    const userName = user?.user_metadata?.name || 'GUEST USER';
    const userEmail = user?.email || 'N/A';

    return (
        <View style={styles.container}>
            <GlassHeader
                title="PROFILE"
                rightElement={
                    <TouchableOpacity onPress={() => navigation.navigate('Settings' as any)}>
                        <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                }
            />

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 72 }]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
            >

                {/* Profile Identity */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="person" size={40} color={theme.colors.background} />
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.nameText}>{userName.toUpperCase()}</Text>
                        <Text style={styles.emailText}>{userEmail}</Text>
                        <View style={styles.tierBadge}>
                            <Text style={styles.tierText}>SILVER TIER</Text>
                        </View>
                    </View>
                </View>

                {/* Booking History */}
                <Text style={styles.sectionTitle}>RECENT BOOKINGS</Text>

                {PAST_BOOKINGS.map((booking) => (
                    <IndustrialCard key={booking.id} style={styles.bookingCard}>
                        <View style={styles.bookingRow}>
                            <View>
                                <Text style={styles.bookingDate}>{booking.date}</Text>
                                <Text style={styles.bookingTitle}>{booking.title}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.bookingSpend}>{booking.spend}</Text>
                                <Text style={styles.bookingTable}>{booking.table}</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.receiptBtn}>
                            <Text style={styles.receiptText}>VIEW RECEIPT</Text>
                            <Ionicons name="receipt-outline" size={14} color={theme.colors.primary} />
                        </TouchableOpacity>
                    </IndustrialCard>
                ))}

                {/* Saved Payments */}
                <Text style={[styles.sectionTitle, { marginTop: 16 }]}>SAVED PAYMENTS</Text>

                <IndustrialCard style={[styles.bookingCard, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        <View style={styles.paymentIconBox}>
                            <Ionicons name="card" size={24} color={theme.colors.text} />
                        </View>
                        <View>
                            <Text style={styles.paymentTitle}>APPLE PAY</Text>
                            <Text style={styles.paymentSubtitle}>Default Method</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </IndustrialCard>

                <TouchableOpacity
                    style={styles.settingsLauncher}
                    // @ts-ignore
                    onPress={() => navigation.navigate('Settings')}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
                        <Text style={styles.settingsLauncherText}>APP SETTINGS</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>

            </ScrollView>
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
        paddingBottom: 100, // accommodate bottom tab
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
        gap: 20,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(197, 160, 89, 0.3)',
    },
    profileInfo: {
        flex: 1,
    },
    nameText: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.heading,
        fontSize: 24,
        letterSpacing: 2,
        marginBottom: 4,
    },
    emailText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 12,
        marginBottom: 12,
    },
    tierBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    tierText: {
        color: '#A8A9AD', // Silver color
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 10,
        letterSpacing: 1,
    },
    sectionTitle: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 12,
        letterSpacing: 2,
        marginBottom: 16,
    },
    bookingCard: {
        padding: 20,
        marginBottom: 16,
    },
    bookingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    bookingDate: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 10,
        letterSpacing: 1,
        marginBottom: 4,
    },
    bookingTitle: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 14,
        letterSpacing: 1,
    },
    bookingSpend: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 14,
        marginBottom: 4,
    },
    bookingTable: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: 12,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: 16,
    },
    receiptBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    receiptText: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 10,
        letterSpacing: 1,
    },
    paymentIconBox: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    paymentTitle: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 14,
        letterSpacing: 1,
        marginBottom: 4,
    },
    paymentSubtitle: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 12,
    },
    settingsLauncher: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.backgroundSecondary,
        padding: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginTop: 24,
    },
    settingsLauncherText: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 14,
        letterSpacing: 1,
    },
});
