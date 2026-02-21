import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../theme';
import { GlassHeader } from '../components/GlassHeader';
import { IndustrialCard } from '../components/IndustrialCard';
import { GoldButton } from '../components/GoldButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../navigation/RootNavigator';

type WalkInScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WalkIn'>;

const PAYMENT_METHODS = [
    { id: 'fpx', name: 'FPX / Online Banking', icon: 'business-outline' },
    { id: 'card', name: 'Credit / Debit Card', icon: 'card-outline' },
    { id: 'grab', name: 'GrabPay', icon: 'wallet-outline' },
];

export const WalkInScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<WalkInScreenNavigationProp>();
    const { user } = useAuth();

    const [guestCount, setGuestCount] = useState(1);
    const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0].id);
    const [isProcessing, setIsProcessing] = useState(false);

    // Fixed price per walk-in guest (e.g., Cover Charge)
    const TICKET_PRICE = 100;
    const totalAmount = guestCount * TICKET_PRICE;

    const handlePayment = async () => {
        setIsProcessing(true);

        const bookingId = `WI-${Date.now()}`;
        // Timestamp attached for the 5-minute expiry validation
        const qrData = `kyo-walkin-${bookingId}-${Date.now()}-${guestCount}`;

        // Insert into Supabase reservations table
        const { error } = await supabase.from('reservations').insert({
            user_id: user?.id || null,
            guests: guestCount,
            total_amount: totalAmount,
            deposit_paid: totalAmount, // Full payment for tickets
            type: 'WALK_IN',
            status: 'CONFIRMED',
            qr_code_data: qrData
        });

        setIsProcessing(false);

        if (error) {
            alert('Failed to process payment. Please try again.');
            return;
        }

        // Navigate directly to the Digital Pass screen
        navigation.navigate('DigitalPass', {
            bookingId,
            qrData,
            type: 'WALK-IN ENTRY',
            guests: guestCount,
            date: new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'short' }),
            timestamp: Date.now()
        });
    };

    return (
        <View style={styles.container}>
            <GlassHeader title="WALK-IN ENTRY" onLeftPress={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 56 }]}>
                <Text style={styles.sectionHeader}>INSTANT ACCESS</Text>

                <IndustrialCard style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>TICKET TYPE</Text>
                        <Text style={styles.summaryValue}>GENERAL ADMISSION</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>GUESTS (RM {TICKET_PRICE}/pax)</Text>
                        <View style={styles.stepperControl}>
                            <TouchableOpacity onPress={() => setGuestCount(Math.max(1, guestCount - 1))} style={styles.stepBtn}>
                                <Ionicons name="remove" size={16} color={theme.colors.text} />
                            </TouchableOpacity>
                            <Text style={styles.stepValue}>{guestCount}</Text>
                            <TouchableOpacity onPress={() => setGuestCount(guestCount + 1)} style={styles.stepBtn}>
                                <Ionicons name="add" size={16} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </IndustrialCard>

                <IndustrialCard style={styles.totalCard}>
                    <Text style={styles.totalLabel}>TOTAL DUE</Text>
                    <Text style={styles.totalAmount}>RM {totalAmount.toFixed(2)}</Text>
                </IndustrialCard>

                <View style={styles.depositAlert}>
                    <Ionicons name="timer-outline" size={20} color={theme.colors.primary} />
                    <Text style={styles.depositAlertText}>
                        Walk-in QR passes strictly expire 5 minutes after purchase. Please purchase when you are at the door.
                    </Text>
                </View>

                <Text style={[styles.sectionHeader, { marginTop: 32 }]}>PAYMENT METHOD</Text>
                {PAYMENT_METHODS.map((method) => (
                    <TouchableOpacity
                        key={method.id}
                        style={[
                            styles.paymentMethod,
                            selectedPayment === method.id && styles.paymentMethodActive
                        ]}
                        onPress={() => setSelectedPayment(method.id)}
                    >
                        <Ionicons
                            name={method.icon as any}
                            size={24}
                            color={selectedPayment === method.id ? theme.colors.primary : theme.colors.textSecondary}
                        />
                        <Text style={[
                            styles.paymentMethodText,
                            selectedPayment === method.id && styles.paymentMethodTextActive
                        ]}>
                            {method.name}
                        </Text>
                        <View style={styles.radioOuter}>
                            {selectedPayment === method.id && <View style={styles.radioInner} />}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <GoldButton
                    title={isProcessing ? "PROCESSING..." : `PAY RM ${totalAmount.toFixed(2)}`}
                    onPress={handlePayment}
                    disabled={isProcessing}
                    style={{ width: '100%', opacity: isProcessing ? 0.7 : 1 }}
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
    scrollContent: {
        padding: 24,
        paddingBottom: 150,
    },
    sectionHeader: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 12,
        letterSpacing: 2,
        marginBottom: 16,
    },
    summaryCard: {
        padding: 24,
        gap: 16,
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: 14,
    },
    summaryValue: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 14,
        letterSpacing: 0.5,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginVertical: 4,
    },
    stepperControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    stepBtn: {
        padding: 8,
        paddingHorizontal: 12,
    },
    stepValue: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 14,
        paddingHorizontal: 8,
    },
    totalCard: {
        backgroundColor: theme.colors.primary,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
    },
    totalLabel: {
        color: theme.colors.background,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 12,
        letterSpacing: 1,
        marginBottom: 4,
    },
    totalAmount: {
        color: theme.colors.background,
        fontFamily: theme.typography.fontFamily.heading,
        fontSize: 36,
    },
    depositAlert: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 59, 48, 0.1)', // Red warning tint
        padding: 16,
        borderRadius: 4,
        borderLeftWidth: 2,
        borderLeftColor: theme.colors.error,
        gap: 12,
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    depositAlertText: {
        flex: 1,
        color: theme.colors.error,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 12,
        lineHeight: 18,
    },
    paymentMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: theme.colors.backgroundSecondary,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 12,
    },
    paymentMethodActive: {
        borderColor: theme.colors.primary,
        backgroundColor: 'rgba(197, 160, 89, 0.05)',
    },
    paymentMethodText: {
        flex: 1,
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 14,
        marginLeft: 16,
        letterSpacing: 0.5,
    },
    paymentMethodTextActive: {
        color: theme.colors.primary,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: theme.colors.textSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.primary,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: 32,
        backgroundColor: theme.colors.background,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    }
});
