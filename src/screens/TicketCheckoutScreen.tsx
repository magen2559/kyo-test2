import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { theme } from '../theme';
import { GlassHeader } from '../components/GlassHeader';
import { GoldButton } from '../components/GoldButton';
import { IndustrialCard } from '../components/IndustrialCard';
import { GlassmorphismView } from '../components/GlassmorphismView';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { purchaseTickets } from '../services/ticketService';
import { AlertModal } from '../components/Modals';

type TicketCheckoutProps = NativeStackScreenProps<RootStackParamList, 'TicketCheckout'>;

const PAYMENT_METHODS = [
    { id: 'fpx', name: 'FPX / Online Banking', icon: 'business-outline' as const },
    { id: 'card', name: 'Credit / Debit Card', icon: 'card-outline' as const },
    { id: 'grab', name: 'GrabPay', icon: 'wallet-outline' as const },
];

export const TicketCheckoutScreen = ({ route, navigation }: TicketCheckoutProps) => {
    const { eventId, eventTitle, eventDate, cart, totalPrice } = route.params;
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [alertModal, setAlertModal] = useState<{ visible: boolean; title: string; message: string; type: 'success' | 'error' }>({
        visible: false, title: '', message: '', type: 'success'
    });

    const handlePayment = async () => {
        if (!selectedPayment) {
            setAlertModal({ visible: true, title: 'Payment Method', message: 'Please select a payment method', type: 'error' });
            return;
        }
        if (!user) {
            setAlertModal({ visible: true, title: 'Error', message: 'You must be logged in to purchase tickets', type: 'error' });
            return;
        }

        setIsProcessing(true);
        try {
            // Purchase tickets for each cart item
            let allTickets: any[] = [];
            for (const item of cart) {
                const tickets = await purchaseTickets(user.id, eventId, item.ticketTypeId, item.quantity);
                allTickets = [...allTickets, ...tickets];
            }

            // Navigate to Digital Pass with the first ticket's QR
            setAlertModal({
                visible: true,
                title: '🎉 TICKETS SECURED',
                message: `${allTickets.length} ticket${allTickets.length > 1 ? 's' : ''} purchased for ${eventTitle}!`,
                type: 'success'
            });

            // After dismissing the modal, navigate to DigitalPass
            setTimeout(() => {
                navigation.replace('DigitalPass', {
                    bookingId: allTickets[0].id,
                    qrData: allTickets[0].qr_code_data,
                    type: 'TICKET',
                    guests: allTickets.length,
                    date: typeof eventDate === 'string' ? eventDate : new Date().toISOString(),
                    timestamp: Date.now(),
                });
            }, 2500);

        } catch (err: any) {
            setAlertModal({
                visible: true,
                title: 'Purchase Failed',
                message: err.message || 'Failed to complete purchase. Please try again.',
                type: 'error'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const serviceFee = totalPrice * 0.03; // 3% service fee
    const grandTotal = totalPrice + serviceFee;

    return (
        <View style={styles.container}>
            <GlassHeader
                title="CHECKOUT"
                leftElement={
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                }
            />

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 56 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Event Summary */}
                <GlassmorphismView neonBorder style={styles.section}>
                    <Text style={styles.sectionTitle}>EVENT</Text>
                    <Text style={styles.eventName}>{eventTitle}</Text>
                    <Text style={styles.eventDate}>{typeof eventDate === 'string' ? eventDate : ''}</Text>
                </GlassmorphismView>

                {/* Order Summary */}
                <GlassmorphismView style={styles.section}>
                    <Text style={styles.sectionTitle}>ORDER SUMMARY</Text>
                    {cart.map((item: any, index: number) => (
                        <View key={index} style={styles.orderItem}>
                            <View>
                                <Text style={styles.itemName}>{item.ticketTypeName}</Text>
                                <Text style={styles.itemQty}>×{item.quantity}</Text>
                            </View>
                            <Text style={styles.itemPrice}>RM {(item.priceEach * item.quantity).toFixed(2)}</Text>
                        </View>
                    ))}
                    <View style={styles.divider} />
                    <View style={styles.orderItem}>
                        <Text style={styles.feeLabel}>Service Fee (3%)</Text>
                        <Text style={styles.feeValue}>RM {serviceFee.toFixed(2)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.orderItem}>
                        <Text style={styles.totalLabel}>TOTAL</Text>
                        <Text style={styles.totalPrice}>RM {grandTotal.toFixed(2)}</Text>
                    </View>
                </GlassmorphismView>

                {/* Payment Methods */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PAYMENT METHOD</Text>
                    {PAYMENT_METHODS.map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            style={[
                                styles.paymentOption,
                                selectedPayment === method.id && styles.paymentOptionSelected
                            ]}
                            onPress={() => setSelectedPayment(method.id)}
                        >
                            <View style={styles.paymentLeft}>
                                <Ionicons name={method.icon} size={22} color={
                                    selectedPayment === method.id ? theme.colors.primary : theme.colors.textSecondary
                                } />
                                <Text style={[
                                    styles.paymentName,
                                    selectedPayment === method.id && { color: theme.colors.text }
                                ]}>{method.name}</Text>
                            </View>
                            <View style={[
                                styles.radioOuter,
                                selectedPayment === method.id && styles.radioOuterSelected
                            ]}>
                                {selectedPayment === method.id && <View style={styles.radioInner} />}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom CTA */}
            <View style={[styles.bottomSticky, { paddingBottom: insets.bottom || 24 }]}>
                {isProcessing ? (
                    <View style={styles.processingContainer}>
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                        <Text style={styles.processingText}>PROCESSING PAYMENT...</Text>
                    </View>
                ) : (
                    <GoldButton
                        title={`PAY RM ${grandTotal.toFixed(2)}`}
                        onPress={handlePayment}
                        style={styles.fullWidthButton}
                    />
                )}
            </View>

            <AlertModal
                visible={alertModal.visible}
                title={alertModal.title}
                message={alertModal.message}
                onClose={() => setAlertModal(prev => ({ ...prev, visible: false }))}
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
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 24,
        padding: 20,
    },
    sectionTitle: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.heading,
        fontSize: 12,
        letterSpacing: 2,
        marginBottom: 16,
    },
    eventName: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 22,
        letterSpacing: 1,
        marginBottom: 4,
    },
    eventDate: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 12,
    },
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    itemName: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 14,
    },
    itemQty: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 12,
        marginTop: 2,
    },
    itemPrice: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: 8,
        opacity: 0.3,
    },
    feeLabel: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: 12,
    },
    feeValue: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: 12,
    },
    totalLabel: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 16,
        letterSpacing: 2,
    },
    totalPrice: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 22,
    },
    paymentOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    paymentOptionSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: 'rgba(197, 160, 89, 0.06)',
    },
    paymentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    paymentName: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 14,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#444',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterSelected: {
        borderColor: theme.colors.primary,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.primary,
    },
    bottomSticky: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingTop: 16,
        backgroundColor: theme.colors.backgroundSecondary,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    fullWidthButton: {
        width: '100%',
    },
    processingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 12,
    },
    processingText: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 14,
        letterSpacing: 2,
    },
});
