import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { theme } from '../theme';
import { GlassHeader } from '../components/GlassHeader';
import { IndustrialCard } from '../components/IndustrialCard';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

type Tab = 'SCANNER' | 'GUESTLIST';

export const AdminDashboardScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState<Tab>('SCANNER');

    // Camera state
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Guestlist state
    const [guests, setGuests] = useState<any[]>([]);
    const [loadingGuests, setLoadingGuests] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (activeTab === 'GUESTLIST') {
            fetchGuests();
        }
    }, [activeTab]);

    const fetchGuests = async () => {
        setLoadingGuests(true);
        const { data, error } = await supabase
            .from('reservations')
            .select(`
                *,
                user_profiles ( name, phone ),
                events ( title )
            `)
            .order('created_at', { ascending: false });

        if (data) setGuests(data);
        setLoadingGuests(false);
    };

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        if (scanned || isProcessing) return;
        setScanned(true);
        setIsProcessing(true);

        try {
            if (!data.startsWith('kyo-')) {
                throw new Error('Invalid QR Code Format');
            }

            const parts = data.split('-');

            if (data.includes('walkin')) {
                // Format: kyo-walkin-WI-TIMESTAMP-TIMESTAMP-GUESTS
                // Parts:
                // 0: kyo
                // 1: walkin
                // 2: WI
                // 3: 17088... (Booking ID Timestamp)
                // 4: 17088... (Creation Timestamp for 5 min check)
                // 5: GUEST_COUNT
                const bookingTimestampPart = parts[3];
                const timestamp = parseInt(parts[4]);
                const guestCount = parts[5];
                const now = Date.now();
                const diff = (now - timestamp) / 1000 / 60; // minutes

                if (diff > 5) {
                    Alert.alert('EXPIRED', `This walk-in pass expired ${Math.floor(diff - 5)} minutes ago.`);
                    return; // Don't auto-reset scanned here, wait for manual 'next scan'
                }

                const bookingId = `WI-${bookingTimestampPart}`;

                Alert.alert(
                    'WALK-IN VERIFIED',
                    `Valid for ${guestCount} pax.\nTimestamp check passed.`,
                    [{ text: 'DONE', style: 'cancel' }]
                );
            } else if (parts[1] === 'TCK') {
                // Ticket logic
                // Format: kyo-TCK-TIMESTAMP-USERID
                const ticketId = `TCK-${parts[2]}`;
                Alert.alert(
                    'TICKET DETECTED',
                    `ID: ${ticketId}\nVerifying with database...`,
                    [{ text: 'VERIFY', onPress: () => verifyTicket(ticketId) }]
                );
            } else {
                // Regular booking logic
                // Format: kyo-BK-TIMESTAMP-USERID
                const bookingId = `${parts[1]}-${parts[2]}`; // BK-Timestamp
                Alert.alert(
                    'BOOKING DETECTED',
                    `ID: ${bookingId}\nVerifying with database...`,
                    [{ text: 'VERIFY', onPress: () => verifyBooking(bookingId) }]
                );
            }
        } catch (err: any) {
            Alert.alert('SCAN ERROR', err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const logEntry = async (ticketId: string | null, reservationId: string | null, eventId: string | null, result: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !eventId) return; // Need staff id and event id at minimum

        await supabase.from('entry_logs').insert({
            ticket_id: ticketId,
            reservation_id: reservationId,
            event_id: eventId,
            staff_user_id: user.id,
            result: result
        });
    };

    const verifyTicket = async (ticketId: string) => {
        setIsProcessing(true);
        const { data, error } = await supabase
            .from('tickets')
            .select('*, ticket_types(name), events(id, title)')
            .like('qr_code_data', `%${ticketId}%`)
            .single();

        setIsProcessing(false);

        if (error || !data) {
            Alert.alert('NOT FOUND', 'Could not find a ticket matching this QR code.');
            return;
        }

        if (data.status === 'USED') {
            await logEntry(data.id, null, data.event_id, 'DUPLICATE');
            Alert.alert('ALREADY USED', `Ticket ${ticketId} has already been scanned.`);
            return;
        }

        if (data.status === 'CANCELLED') {
            await logEntry(data.id, null, data.event_id, 'DENIED');
            Alert.alert('CANCELLED', `Ticket ${ticketId} is cancelled.`);
            return;
        }

        Alert.alert(
            'TICKET FOUND',
            `Event: ${data.events?.title}\nType: ${data.ticket_types?.name}`,
            [
                { text: 'CANCEL', style: 'cancel' },
                { text: 'CHECK IN', onPress: () => processTicketCheckIn(data) }
            ]
        );
    };

    const processTicketCheckIn = async (ticket: any) => {
        setIsProcessing(true);

        const { error: updateError } = await supabase
            .from('tickets')
            .update({ status: 'USED', used_at: new Date().toISOString() })
            .eq('id', ticket.id);

        if (updateError) {
            setIsProcessing(false);
            Alert.alert('ERROR', 'Failed to check in ticket.');
            return;
        }

        await logEntry(ticket.id, null, ticket.event_id, 'APPROVED');
        setIsProcessing(false);
        Alert.alert('SUCCESS', 'Ticket has been checked in.');
    };

    const verifyBooking = async (bookingId: string) => {
        setIsProcessing(true);
        const { data, error } = await supabase
            .from('reservations')
            .select('*, events(id, title)')
            .like('qr_code_data', `%${bookingId}%`) // Match any QR containing this booking ID
            .single();

        setIsProcessing(false);

        if (error || !data) {
            Alert.alert('NOT FOUND', 'Could not find a booking matching this QR code.');
            return;
        }

        if (data.status === 'CHECKED_IN') {
            await logEntry(null, data.id, data.event_id, 'DUPLICATE');
            Alert.alert('ALREADY CHECKED IN', `Booking ${bookingId} was already checked in.`);
            return;
        }

        Alert.alert(
            'BOOKING FOUND',
            `Event: ${data.events?.title || 'No Event'}\nGuests: ${data.guests}\nType: ${data.type}`,
            [
                { text: 'CANCEL', style: 'cancel' },
                { text: 'CHECK IN', onPress: () => processCheckIn(data) }
            ]
        );
    };

    const processCheckIn = async (reservation: any) => {
        setIsProcessing(true);
        const { error } = await supabase
            .from('reservations')
            .update({ status: 'CHECKED_IN' })
            .eq('id', reservation.id);

        if (error) {
            setIsProcessing(false);
            Alert.alert('ERROR', 'Failed to check in guest. Please try again.');
        } else {
            await logEntry(null, reservation.id, reservation.event_id, 'APPROVED');
            setIsProcessing(false);
            Alert.alert('SUCCESS', 'Guest has been checked in.');
            fetchGuests(); // Refresh the list
        }
    };

    const renderGuestItem = ({ item }: { item: any }) => (
        <IndustrialCard style={styles.guestCard}>
            <View style={styles.guestRow}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.guestName}>{item.user_profiles?.name || 'GUEST'}</Text>
                    <Text style={styles.guestDetail}>{item.events?.title || 'WALK-IN'}</Text>
                    <Text style={styles.guestSub}>{item.guests} PAX • {item.type}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: item.status === 'CHECKED_IN' ? '#2ECC71' : theme.colors.primary }
                    ]}>
                        <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                    <TouchableOpacity style={styles.manualBtn}>
                        <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>
        </IndustrialCard>
    );

    if (!permission) {
        return <View style={styles.loadingContainer}><ActivityIndicator color={theme.colors.primary} /></View>;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <GlassHeader title="ADMIN" onLeftPress={() => navigation.goBack()} />
                <View style={styles.centered}>
                    <Ionicons name="camera-outline" size={64} color={theme.colors.textSecondary} />
                    <Text style={styles.permissionText}>Camera permission is required to scan tickets.</Text>
                    <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
                        <Text style={styles.permissionBtnText}>GRANT PERMISSION</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <GlassHeader title="ADMIN DASHBOARD" onLeftPress={() => navigation.goBack()} />

            <View style={[styles.tabBar, { marginTop: insets.top + 56 }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'SCANNER' && styles.activeTab]}
                    onPress={() => setActiveTab('SCANNER')}
                >
                    <Ionicons name="scan-outline" size={18} color={activeTab === 'SCANNER' ? '#000' : '#FFF'} />
                    <Text style={[styles.tabText, activeTab === 'SCANNER' && styles.activeTabText]}>SCANNER</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'GUESTLIST' && styles.activeTab]}
                    onPress={() => setActiveTab('GUESTLIST')}
                >
                    <Ionicons name="people-outline" size={18} color={activeTab === 'GUESTLIST' ? '#000' : '#FFF'} />
                    <Text style={[styles.tabText, activeTab === 'GUESTLIST' && styles.activeTabText]}>GUESTLIST</Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'SCANNER' ? (
                <View style={styles.scannerContainer}>
                    <CameraView
                        style={styles.camera}
                        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                        barcodeScannerSettings={{
                            barcodeTypes: ["qr"],
                        }}
                    >
                        <View style={styles.overlay}>
                            <View style={styles.unfocusedContainer} />
                            <View style={styles.middleContainer}>
                                <View style={styles.unfocusedContainer} />
                                <View style={styles.focusedContainer}>
                                    <View style={[styles.corner, styles.cornerTL]} />
                                    <View style={[styles.corner, styles.cornerTR]} />
                                    <View style={[styles.corner, styles.cornerBL]} />
                                    <View style={[styles.corner, styles.cornerBR]} />
                                </View>
                                <View style={styles.unfocusedContainer} />
                            </View>
                            <View style={styles.unfocusedContainer} />
                        </View>
                    </CameraView>

                    {scanned && (
                        <TouchableOpacity style={styles.scanAgainBtn} onPress={() => setScanned(false)}>
                            <Text style={styles.scanAgainText}>SCAN NEXT TICKET</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.statusInfo}>
                        <Text style={styles.statusInfoText}>
                            Position the QR code within the frame to verify guest tickets.
                        </Text>
                    </View>
                </View>
            ) : (
                <View style={styles.guestlistContainer}>
                    <FlatList
                        data={guests}
                        renderItem={renderGuestItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        refreshing={loadingGuests}
                        onRefresh={fetchGuests}
                        ListEmptyComponent={
                            <View style={styles.emptyList}>
                                <Text style={styles.emptyText}>No check-ins recorded for today.</Text>
                            </View>
                        }
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    permissionText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.medium,
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 32,
    },
    permissionBtn: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 4,
    },
    permissionBtnText: {
        color: '#000',
        fontFamily: theme.typography.fontFamily.bold,
        letterSpacing: 1,
    },
    tabBar: {
        flexDirection: 'row',
        padding: 12,
        gap: 12,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    activeTab: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    tabText: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 12,
        letterSpacing: 1,
    },
    activeTabText: {
        color: '#000',
    },
    scannerContainer: {
        flex: 1,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    unfocusedContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    middleContainer: {
        flexDirection: 'row',
        height: width * 0.7,
    },
    focusedContainer: {
        width: width * 0.7,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: theme.colors.primary,
    },
    cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
    cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
    cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
    cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
    scanAgainBtn: {
        position: 'absolute',
        bottom: 120,
        alignSelf: 'center',
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 4,
        elevation: 5,
    },
    scanAgainText: {
        color: '#000',
        fontFamily: theme.typography.fontFamily.bold,
        letterSpacing: 1,
    },
    statusInfo: {
        backgroundColor: '#111',
        padding: 24,
        alignItems: 'center',
    },
    statusInfoText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 12,
        textAlign: 'center',
    },
    guestlistContainer: {
        flex: 1,
    },
    listContent: {
        padding: 16,
    },
    guestCard: {
        padding: 16,
        marginBottom: 12,
    },
    guestRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    guestName: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 16,
        letterSpacing: 0.5,
    },
    guestDetail: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 12,
        marginTop: 2,
    },
    guestSub: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 10,
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
        marginBottom: 8,
    },
    statusText: {
        color: '#000',
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 10,
    },
    manualBtn: {
        padding: 4,
    },
    emptyList: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.medium,
    }
});
