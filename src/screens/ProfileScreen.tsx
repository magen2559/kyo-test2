import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';
import { GlassHeader } from '../components/GlassHeader';
import { IndustrialCard } from '../components/IndustrialCard';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const navigation = useNavigation<ProfileScreenNavigationProp>();

    const [refreshing, setRefreshing] = React.useState(false);
    const [bookings, setBookings] = React.useState<any[]>([]);
    const [isAdmin, setIsAdmin] = React.useState(false);

    const [isEditing, setIsEditing] = React.useState(false);
    const [profile, setProfile] = React.useState({
        name: user?.user_metadata?.name || '',
        phone: '',
        music_preferences: ''
    });

    const fetchProfile = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('user_profiles')
            .select('name, phone, music_preferences, role, is_admin')
            .eq('id', user.id)
            .single();

        if (data) {
            setIsAdmin(data.is_admin || data.role === 'admin' || data.role === 'staff');
            setProfile({
                name: data.name || user?.user_metadata?.name || '',
                phone: data.phone || '',
                music_preferences: Array.isArray(data.music_preferences) ? data.music_preferences.join(', ') : (data.music_preferences || '')
            });
        }
    };

    const fetchBookings = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from('reservations')
            .select(`
                *,
                events ( title, date_label ),
                venue_tables ( table_number )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (data) setBookings(data);
    };

    React.useEffect(() => {
        fetchProfile();
        fetchBookings();
    }, [user]);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchProfile();
        await fetchBookings();
        setRefreshing(false);
    }, [user]);

    const handleSaveProfile = async () => {
        setIsEditing(false);
        if (!user) return;
        await supabase.from('user_profiles').update({
            name: profile.name,
            phone: profile.phone,
            music_preferences: profile.music_preferences.split(',').map(s => s.trim()).filter(Boolean)
        }).eq('id', user.id);
    };

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
                        {!isEditing ? (
                            <>
                                <Text style={styles.nameText}>{(profile.name || 'GUEST USER').toUpperCase()}</Text>
                                <Text style={styles.emailText}>{userEmail}</Text>
                                {profile.phone ? <Text style={styles.emailText}>{profile.phone}</Text> : null}
                                <View style={styles.tierBadge}>
                                    <Text style={styles.tierText}>SILVER TIER</Text>
                                </View>
                            </>
                        ) : (
                            <View style={{ width: '100%', gap: 8, marginBottom: 8 }}>
                                <TextInput
                                    style={styles.input}
                                    value={profile.name}
                                    onChangeText={(t) => setProfile(prev => ({ ...prev, name: t }))}
                                    placeholder="Name"
                                    placeholderTextColor="#666"
                                />
                                <TextInput
                                    style={styles.input}
                                    value={profile.phone}
                                    onChangeText={(t) => setProfile(prev => ({ ...prev, phone: t }))}
                                    placeholder="Phone"
                                    placeholderTextColor="#666"
                                />
                                <TextInput
                                    style={styles.input}
                                    value={profile.music_preferences}
                                    onChangeText={(t) => setProfile(prev => ({ ...prev, music_preferences: t }))}
                                    placeholder="Music Preferences"
                                    placeholderTextColor="#666"
                                />
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.editBtn}
                            onPress={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                        >
                            <Text style={styles.editBtnText}>{isEditing ? 'SAVE PROFILE' : 'EDIT PROFILE'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Booking History */}
                <Text style={styles.sectionTitle}>MY PASSES & BOOKINGS</Text>

                <TouchableOpacity
                    style={[styles.settingsLauncher, { marginTop: 0, marginBottom: 16 }]}
                    onPress={() => navigation.navigate('MyTickets' as any)}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Ionicons name="ticket-outline" size={24} color={theme.colors.primary} />
                        <Text style={[styles.settingsLauncherText, { color: theme.colors.primary }]}>VIEW ALL TICKETS & PASSES</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
                </TouchableOpacity>

                {bookings.length === 0 && (
                    <Text style={{ color: theme.colors.textSecondary, marginBottom: 24 }}>No bookings found.</Text>
                )}

                {bookings.map((booking) => {
                    const isWalkIn = booking.type === 'WALK_IN';
                    const title = isWalkIn ? 'WALK-IN ENTRY' : booking.events?.title || 'EVENT';
                    const date = isWalkIn ? new Date(booking.created_at).toLocaleDateString() : booking.events?.date_label?.replace('\n', ' ');
                    const table = isWalkIn ? 'ENTRY ONLY' : booking.venue_tables?.table_number || 'TBA';

                    return (
                        <IndustrialCard key={booking.id} style={styles.bookingCard}>
                            <View style={styles.bookingRow}>
                                <View>
                                    <Text style={styles.bookingDate}>{date}</Text>
                                    <Text style={styles.bookingTitle}>{title}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.bookingSpend}>RM {booking.total_amount}</Text>
                                    <Text style={styles.bookingTable}>{table}</Text>
                                </View>
                            </View>
                            <View style={styles.divider} />
                            <TouchableOpacity
                                style={styles.receiptBtn}
                                onPress={() => navigation.navigate('DigitalPass', {
                                    bookingId: booking.id.substring(0, 8).toUpperCase(),
                                    qrData: booking.qr_code_data,
                                    type: isWalkIn ? 'WALK-IN ENTRY' : 'VIP TABLE',
                                    guests: booking.guests,
                                    date: date,
                                    // Only attach timestamp for walk-ins so the timer runs
                                    timestamp: isWalkIn ? new Date(booking.created_at).getTime() : undefined
                                })}
                            >
                                <Text style={styles.receiptText}>VIEW DIGITAL PASS</Text>
                                <Ionicons name="qr-code-outline" size={14} color={theme.colors.primary} />
                            </TouchableOpacity>
                        </IndustrialCard>
                    );
                })}

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

                {isAdmin && (
                    <TouchableOpacity
                        style={[styles.settingsLauncher, { backgroundColor: 'rgba(197, 160, 89, 0.1)', borderColor: theme.colors.primary, marginTop: 16 }]}
                        onPress={() => navigation.navigate('AdminDashboard' as any)}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <Ionicons name="shield-checkmark-outline" size={24} color={theme.colors.primary} />
                            <Text style={[styles.settingsLauncherText, { color: theme.colors.primary }]}>ADMIN PANEL</Text>
                        </View>
                        <View style={styles.adminBadge}>
                            <Text style={styles.adminBadgeText}>STAFF</Text>
                        </View>
                    </TouchableOpacity>
                )}

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
        marginRight: 20,
        borderWidth: 2,
        borderColor: 'rgba(197, 160, 89, 0.3)',
    },
    profileInfo: {
        flex: 1,
        alignItems: 'flex-start',
    },
    input: {
        width: '100%',
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: theme.colors.border,
        color: '#fff',
        paddingHorizontal: 12,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 14,
        borderRadius: 4,
    },
    editBtn: {
        marginTop: 8,
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        borderRadius: 4,
    },
    editBtnText: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 10,
        letterSpacing: 1,
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
    adminBadge: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    adminBadgeText: {
        color: '#000',
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 10,
    },
});
