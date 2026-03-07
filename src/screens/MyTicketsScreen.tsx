import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { theme } from '../theme';
import { GlassHeader } from '../components/GlassHeader';
import { IndustrialCard } from '../components/IndustrialCard';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { fetchMyTickets, fetchMyReservations, Ticket } from '../services/ticketService';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const MyTicketsScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavProp>();
    const { user } = useAuth();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'tickets' | 'reservations'>('tickets');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (!user) return;
        try {
            const [tkts, rsvs] = await Promise.all([
                fetchMyTickets(user.id),
                fetchMyReservations(user.id),
            ]);
            setTickets(tkts);
            setReservations(rsvs);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'VALID': case 'CONFIRMED': return '#4CAF50';
            case 'USED': return theme.colors.textSecondary;
            case 'CANCELLED': return theme.colors.error;
            default: return theme.colors.textSecondary;
        }
    };

    const renderTicket = ({ item }: { item: Ticket }) => (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('DigitalPass', {
                bookingId: item.id,
                qrData: item.qr_code_data,
                type: 'TICKET',
                guests: 1,
                date: item.event?.event_date || item.purchased_at,
                timestamp: new Date(item.purchased_at).getTime(),
            })}
        >
            <IndustrialCard style={styles.ticketCard}>
                <View style={styles.ticketContent}>
                    <View style={styles.ticketMain}>
                        <Text style={styles.ticketEventName}>{item.event?.title || 'Event'}</Text>
                        <Text style={styles.ticketTypeName}>{item.ticket_type?.name || 'Ticket'}</Text>
                        <Text style={styles.ticketDate}>
                            {new Date(item.purchased_at).toLocaleDateString('en-MY', {
                                day: 'numeric', month: 'short', year: 'numeric'
                            })}
                        </Text>
                    </View>
                    <View style={styles.ticketRight}>
                        <View style={[styles.statusBadge, { borderColor: getStatusColor(item.status) }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                        </View>
                        <Ionicons name="qr-code-outline" size={20} color={theme.colors.primary} style={{ marginTop: 8 }} />
                    </View>
                </View>
            </IndustrialCard>
        </TouchableOpacity>
    );

    const renderReservation = ({ item }: { item: any }) => (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('DigitalPass', {
                bookingId: item.id,
                qrData: item.qr_code_data,
                type: item.type || 'TABLE',
                guests: item.guests,
                date: item.event?.event_date || item.created_at,
                timestamp: new Date(item.created_at).getTime(),
            })}
        >
            <IndustrialCard style={styles.ticketCard}>
                <View style={styles.ticketContent}>
                    <View style={styles.ticketMain}>
                        <Text style={styles.ticketEventName}>{item.event?.title || 'Reservation'}</Text>
                        <Text style={styles.ticketTypeName}>
                            Table {item.table?.table_number || '—'} · {item.guests} guests
                        </Text>
                        <Text style={styles.ticketDate}>
                            {new Date(item.created_at).toLocaleDateString('en-MY', {
                                day: 'numeric', month: 'short', year: 'numeric'
                            })}
                        </Text>
                    </View>
                    <View style={styles.ticketRight}>
                        <View style={[styles.statusBadge, { borderColor: getStatusColor(item.status) }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                        </View>
                        <Ionicons name="qr-code-outline" size={20} color={theme.colors.primary} style={{ marginTop: 8 }} />
                    </View>
                </View>
            </IndustrialCard>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <GlassHeader
                title="MY PASSES"
                onLeftPress={() => navigation.goBack()}
                leftIcon="arrow-back"
            />

            <View style={[styles.content, { paddingTop: insets.top + 56 }]}>
                {/* Tab Switcher */}
                <View style={styles.tabBar}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'tickets' && styles.tabActive]}
                        onPress={() => setActiveTab('tickets')}
                    >
                        <Ionicons name="ticket-outline" size={16} color={activeTab === 'tickets' ? theme.colors.primary : theme.colors.textSecondary} />
                        <Text style={[styles.tabText, activeTab === 'tickets' && styles.tabTextActive]}>TICKETS</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'reservations' && styles.tabActive]}
                        onPress={() => setActiveTab('reservations')}
                    >
                        <Ionicons name="restaurant-outline" size={16} color={activeTab === 'reservations' ? theme.colors.primary : theme.colors.textSecondary} />
                        <Text style={[styles.tabText, activeTab === 'reservations' && styles.tabTextActive]}>TABLES</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={activeTab === 'tickets' ? tickets : reservations}
                        renderItem={activeTab === 'tickets' ? renderTicket : renderReservation}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                tintColor={theme.colors.primary}
                            />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons
                                    name={activeTab === 'tickets' ? 'ticket-outline' : 'restaurant-outline'}
                                    size={48}
                                    color={theme.colors.textSecondary}
                                />
                                <Text style={styles.emptyTitle}>
                                    {activeTab === 'tickets' ? 'No Tickets Yet' : 'No Reservations Yet'}
                                </Text>
                                <Text style={styles.emptyText}>
                                    {activeTab === 'tickets'
                                        ? 'Browse events and purchase tickets to see them here.'
                                        : 'Book a table to see your reservations here.'}
                                </Text>
                            </View>
                        }
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
    },
    tabBar: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 8,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    tabActive: {
        borderColor: theme.colors.primary,
        backgroundColor: 'rgba(197, 160, 89, 0.08)',
    },
    tabText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 12,
        letterSpacing: 2,
    },
    tabTextActive: {
        color: theme.colors.primary,
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    ticketCard: {
        marginBottom: 12,
        padding: 16,
    },
    ticketContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    ticketMain: {
        flex: 1,
    },
    ticketEventName: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 16,
        marginBottom: 4,
    },
    ticketTypeName: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 12,
        marginBottom: 4,
    },
    ticketDate: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 10,
    },
    ticketRight: {
        alignItems: 'flex-end',
    },
    statusBadge: {
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 2,
    },
    statusText: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 10,
        letterSpacing: 1,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyTitle: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 18,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});
