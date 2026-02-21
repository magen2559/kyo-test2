import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, FlatList } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { theme } from '../theme';
import { GlassHeader } from '../components/GlassHeader';
import { GlassmorphismView } from '../components/GlassmorphismView';
import { GoldButton } from '../components/GoldButton';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type EventDetailProps = NativeStackScreenProps<RootStackParamList, 'EventDetail'>;

// Mock Ticket Data
const TICKET_TIERS = [
    { id: '1', name: 'EARLY BIRD', price: 'RM 120.00', status: 'SOLD OUT' },
    { id: '2', name: 'PRE-SALE', price: 'RM 150.00', status: 'AVAILABLE' },
    { id: '3', name: 'DOOR', price: 'RM 180.00', status: 'AVAILABLE' },
];

export const EventDetailScreen = ({ route, navigation }: EventDetailProps) => {
    const { event } = route.params;
    const insets = useSafeAreaInsets();

    const handleBuyTicket = () => {
        // Placeholder for ticket checkout flow
    };

    const renderTicketTier = ({ item }: { item: typeof TICKET_TIERS[0] }) => (
        <View style={styles.ticketTier}>
            <View>
                <Text style={styles.ticketName}>{item.name}</Text>
                <Text style={styles.ticketPrice}>{item.price}</Text>
            </View>
            <TouchableOpacity
                style={[
                    styles.buyButtonSmall,
                    item.status === 'SOLD OUT' && styles.buyButtonDisabled
                ]}
                disabled={item.status === 'SOLD OUT'}
            >
                <Text style={[
                    styles.buyButtonSmallText,
                    item.status === 'SOLD OUT' && styles.buyButtonDisabledText
                ]}>
                    {item.status === 'SOLD OUT' ? 'SOLD OUT' : 'BUY'}
                </Text>
            </TouchableOpacity>
        </View>
    );

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
                                <Ionicons name="calendar-outline" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="share-social-outline" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.heroOverlay}>
                        <Text style={styles.heroTitle}>{event.title}</Text>
                        <View style={styles.techDataRow}>
                            <Ionicons name="calendar" size={12} color={theme.colors.primary} />
                            <Text style={styles.techDataText}>FRI 24 OCT</Text>
                            <Ionicons name="time" size={12} color={theme.colors.primary} style={{ marginLeft: 12 }} />
                            <Text style={styles.techDataText}>11:00 PM LATE</Text>
                        </View>
                    </View>
                </ImageBackground>

                <View style={styles.contentContainer}>
                    <GlassmorphismView neonBorder style={styles.infoCard}>
                        <Text style={styles.sectionTitle}>LINEUP</Text>
                        <Text style={styles.paragraph}>
                            STEPHAN BODZIN (LIVE) {'\n'}
                            OLIVER HUNTEMANN {'\n'}
                            VICTOR RUIZ
                        </Text>

                        <View style={styles.divider} />

                        <Text style={styles.sectionTitle}>DETAILS</Text>
                        <Text style={styles.paragraph}>
                            Main Room: {event.stage}{'\n'}
                            Genre: Techno / Industrial{'\n'}
                            Pace: {event.bpm}
                        </Text>

                        <View style={styles.divider} />

                        <Text style={styles.sectionTitle}>DRESS CODE</Text>
                        <Text style={styles.paragraph}>
                            Strictly all black / minimal. No shorts, slippers, or singlet. Right of admission reserved.
                        </Text>
                    </GlassmorphismView>

                    <Text style={styles.ticketsHeader}>TICKETS</Text>

                    {TICKET_TIERS.map((tier) => (
                        <View key={tier.id}>
                            {renderTicketTier({ item: tier })}
                        </View>
                    ))}

                    <View style={{ height: 40 }} />
                </View>
            </ScrollView>

            <View style={[styles.bottomSticky, { paddingBottom: insets.bottom || 24 }]}>
                <GoldButton
                    title="BUY TICKETS"
                    onPress={handleBuyTicket}
                    style={styles.fullWidthButton}
                />
            </View>
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
    fullWidthButton: {
        width: '100%',
    },
});
