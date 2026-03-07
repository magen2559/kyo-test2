import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { theme } from '../theme';
import { GlassmorphismView } from '../components/GlassmorphismView';
import { GoldButton } from '../components/GoldButton';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchTicketTypes, TicketType } from '../services/ticketService';

type EventDetailProps = NativeStackScreenProps<RootStackParamList, 'EventDetail'>;

export const EventDetailScreen = ({ route, navigation }: EventDetailProps) => {
    const { event } = route.params;
    const insets = useSafeAreaInsets();
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});

    useEffect(() => {
        loadTicketTypes();
    }, []);

    const loadTicketTypes = async () => {
        try {
            const types = await fetchTicketTypes(event.id);
            setTicketTypes(types);
        } catch (err) {
            console.error('Failed to load ticket types:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = (ticketTypeId: string, delta: number) => {
        setSelectedTickets(prev => {
            const current = prev[ticketTypeId] || 0;
            const newQty = Math.max(0, Math.min(current + delta, 10)); // Max 10 per type
            if (newQty === 0) {
                const { [ticketTypeId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [ticketTypeId]: newQty };
        });
    };

    const totalTickets = Object.values(selectedTickets).reduce((sum, q) => sum + q, 0);
    const totalPrice = ticketTypes.reduce((sum, tt) => {
        const qty = selectedTickets[tt.id] || 0;
        return sum + (qty * tt.price);
    }, 0);

    const handleBuyTickets = () => {
        if (totalTickets === 0) return;
        // Build cart and navigate to TicketCheckout
        const cart = ticketTypes
            .filter(tt => (selectedTickets[tt.id] || 0) > 0)
            .map(tt => ({
                ticketTypeId: tt.id,
                ticketTypeName: tt.name,
                quantity: selectedTickets[tt.id],
                priceEach: tt.price,
            }));

        navigation.navigate('TicketCheckout', {
            eventId: event.id,
            eventTitle: event.title,
            eventImage: event.image,
            eventDate: (event as any).event_date || event.date_label,
            cart,
            totalPrice,
        });
    };

    // Parse lineup
    const lineup: string[] = Array.isArray((event as any).lineup)
        ? (event as any).lineup
        : [];

    // Format date
    const eventDate = (event as any).event_date
        ? new Date((event as any).event_date).toLocaleDateString('en-MY', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
        })
        : event.date_label;

    const eventTime = (event as any).event_date
        ? new Date((event as any).event_date).toLocaleTimeString('en-MY', {
            hour: '2-digit', minute: '2-digit'
        })
        : '';

    const renderTicketTier = (tt: TicketType) => {
        const isSoldOut = tt.status === 'SOLD_OUT' || tt.remaining <= 0;
        const qty = selectedTickets[tt.id] || 0;

        return (
            <View key={tt.id} style={styles.ticketTier}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.ticketName}>{tt.name}</Text>
                    <Text style={styles.ticketPrice}>RM {tt.price.toFixed(2)}</Text>
                    {!isSoldOut && (
                        <Text style={styles.ticketRemaining}>
                            {tt.remaining <= 20 ? `Only ${tt.remaining} left` : `${tt.remaining} available`}
                        </Text>
                    )}
                </View>
                {isSoldOut ? (
                    <View style={[styles.buyButtonSmall, styles.buyButtonDisabled]}>
                        <Text style={[styles.buyButtonSmallText, styles.buyButtonDisabledText]}>SOLD OUT</Text>
                    </View>
                ) : (
                    <View style={styles.quantitySelector}>
                        <TouchableOpacity
                            style={styles.qtyButton}
                            onPress={() => updateQuantity(tt.id, -1)}
                            disabled={qty === 0}
                        >
                            <Ionicons name="remove" size={18} color={qty === 0 ? '#444' : theme.colors.primary} />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{qty}</Text>
                        <TouchableOpacity
                            style={styles.qtyButton}
                            onPress={() => updateQuantity(tt.id, 1)}
                            disabled={qty >= tt.remaining}
                        >
                            <Ionicons name="add" size={18} color={qty >= tt.remaining ? '#444' : theme.colors.primary} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <ImageBackground
                    source={{ uri: event.image }}
                    style={styles.heroImage}
                >
                    <View style={[styles.headerActions, { paddingTop: insets.top + 16 }]}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                        <View style={styles.headerRight}>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="share-social-outline" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.heroOverlay}>
                        <Text style={styles.heroTitle}>{event.title}</Text>
                        <View style={styles.techDataRow}>
                            <Ionicons name="calendar" size={12} color={theme.colors.primary} />
                            <Text style={styles.techDataText}>{eventDate}</Text>
                            {eventTime ? (
                                <>
                                    <Ionicons name="time" size={12} color={theme.colors.primary} style={{ marginLeft: 12 }} />
                                    <Text style={styles.techDataText}>{eventTime}</Text>
                                </>
                            ) : null}
                        </View>
                    </View>
                </ImageBackground>

                <View style={styles.contentContainer}>
                    <GlassmorphismView neonBorder style={styles.infoCard}>
                        {/* Description */}
                        {(event as any).description ? (
                            <>
                                <Text style={styles.sectionTitle}>ABOUT</Text>
                                <Text style={styles.paragraph}>{(event as any).description}</Text>
                                <View style={styles.divider} />
                            </>
                        ) : null}

                        {/* Lineup */}
                        <Text style={styles.sectionTitle}>LINEUP</Text>
                        <Text style={styles.paragraph}>
                            {lineup.length > 0 ? lineup.join('\n') : 'TBA'}
                        </Text>

                        <View style={styles.divider} />

                        <Text style={styles.sectionTitle}>DETAILS</Text>
                        <Text style={styles.paragraph}>
                            {(event as any).venue_room ? `Room: ${(event as any).venue_room}\n` : ''}
                            {(event as any).genre ? `Genre: ${(event as any).genre}\n` : ''}
                            Stage: {event.stage}{'\n'}
                            Pace: {event.bpm}
                        </Text>

                        <View style={styles.divider} />

                        <Text style={styles.sectionTitle}>DRESS CODE</Text>
                        <Text style={styles.paragraph}>
                            Strictly all black / minimal. No shorts, slippers, or singlet. Right of admission reserved.
                        </Text>
                    </GlassmorphismView>

                    <Text style={styles.ticketsHeader}>TICKETS</Text>

                    {loading ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginTop: 20 }} />
                    ) : ticketTypes.length > 0 ? (
                        ticketTypes.map(renderTicketTier)
                    ) : (
                        <Text style={styles.noTicketsText}>No tickets available for this event yet.</Text>
                    )}

                    <View style={{ height: 40 }} />
                </View>
            </ScrollView>

            {totalTickets > 0 && (
                <View style={[styles.bottomSticky, { paddingBottom: insets.bottom || 24 }]}>
                    <View style={styles.cartSummary}>
                        <Text style={styles.cartText}>{totalTickets} ticket{totalTickets > 1 ? 's' : ''}</Text>
                        <Text style={styles.cartPrice}>RM {totalPrice.toFixed(2)}</Text>
                    </View>
                    <GoldButton
                        title="PROCEED TO CHECKOUT"
                        onPress={handleBuyTickets}
                        style={styles.fullWidthButton}
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
    heroImage: {
        width: '100%',
        height: 400,
        justifyContent: 'space-between',
    },
    headerActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 16,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    heroOverlay: {
        padding: 24,
        paddingBottom: 40,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    heroTitle: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 36,
        letterSpacing: 2,
        marginBottom: 12,
    },
    techDataRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    techDataText: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 12,
        marginLeft: 6,
        letterSpacing: 1,
    },
    contentContainer: {
        padding: 24,
        marginTop: -20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        backgroundColor: theme.colors.background,
    },
    infoCard: {
        padding: 24,
        marginBottom: 32,
    },
    sectionTitle: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.heading,
        fontSize: 18,
        letterSpacing: 2,
        marginBottom: 12,
    },
    paragraph: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 12,
        lineHeight: 20,
        letterSpacing: 0.5,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: 24,
    },
    ticketsHeader: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.heading,
        fontSize: 24,
        letterSpacing: 2,
        marginBottom: 16,
    },
    noTicketsText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: 14,
        marginTop: 8,
    },
    ticketTier: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    ticketName: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 14,
        letterSpacing: 1,
        marginBottom: 4,
    },
    ticketPrice: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 18,
    },
    ticketRemaining: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 10,
        marginTop: 2,
    },
    quantitySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(197, 160, 89, 0.08)',
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 4,
    },
    qtyButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyText: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 16,
        minWidth: 24,
        textAlign: 'center',
    },
    buyButtonSmall: {
        backgroundColor: 'rgba(197, 160, 89, 0.1)',
        borderWidth: 1,
        borderColor: theme.colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 2,
    },
    buyButtonDisabled: {
        borderColor: theme.colors.textSecondary,
        backgroundColor: 'transparent',
    },
    buyButtonSmallText: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 10,
        letterSpacing: 1,
    },
    buyButtonDisabledText: {
        color: theme.colors.textSecondary,
    },
    bottomSticky: {
        paddingHorizontal: 24,
        paddingTop: 16,
        backgroundColor: theme.colors.backgroundSecondary,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    cartSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    cartText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 14,
    },
    cartPrice: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 18,
    },
    fullWidthButton: {
        width: '100%',
    },
});
