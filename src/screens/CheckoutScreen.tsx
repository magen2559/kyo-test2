import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../theme';
import { GlassHeader } from '../components/GlassHeader';
import { IndustrialCard } from '../components/IndustrialCard';
import { GoldButton } from '../components/GoldButton';
import { Ionicons } from '@expo/vector-icons';
import { generateWhatsAppLink } from '../utils/whatsapp';
import { Linking } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { AlertModal } from '../components/Modals';
import { supabase } from '../lib/supabase';

interface CheckoutRouteParams {
    tableNumber: string;
    capacity: number;
    date: string;
    time: string;
    minSpend: number;
}

const PAYMENT_METHODS = [
    { id: 'fpx', name: 'FPX / Online Banking', icon: 'business-outline' },
    { id: 'card', name: 'Credit / Debit Card', icon: 'card-outline' },
    { id: 'grab', name: 'GrabPay', icon: 'wallet-outline' },
];

const PACKAGES = [
    { id: 'p1', name: 'DOM PÉRIGNON LUMINOUS x2', price: 3500 },
    { id: 'p2', name: 'CLASE AZUL REPOSADO x2', price: 4200 },
    { id: 'p3', name: 'MACALLAN 18YR DOUBLE CASK', price: 2800 },
];

const ADDONS = [
    { id: 'a1', name: 'BIRTHDAY LED SIGNAGE', price: 150 },
    { id: 'a2', name: 'SPARKLER SHOW', price: 300 },
];

export const CheckoutScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = useAuth();

    const params = (route.params as CheckoutRouteParams) || {
        tableNumber: 'T-25',
        capacity: 6,
        date: 'OCT 24',
        time: '11:00 PM',
        minSpend: 2000
    };

    // New States for Phase 4
    const [guestCount, setGuestCount] = useState(params.capacity);
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [promoCode, setPromoCode] = useState('');
    const [discountApplied, setDiscountApplied] = useState(0);

    const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0].id);
    const [isProcessing, setIsProcessing] = useState(false);

    // Modal State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{ title: string, message: string, type: 'success' | 'error' | 'info', onClose?: () => void }>({
        title: '', message: '', type: 'info'
    });

    // Calculations
    const packageTotal = PACKAGES.find(p => p.id === selectedPackage)?.price || 0;
    const addonsTotal = selectedAddons.reduce((sum, id) => {
        const addon = ADDONS.find(a => a.id === id);
        return sum + (addon ? addon.price : 0);
    }, 0);

    // If they select packages/addons that exceed min spend, it replaces min spend
    const subtotal = Math.max(params.minSpend, packageTotal + addonsTotal);
    const discountedSubtotal = Math.max(0, subtotal - discountApplied);
    const depositAmount = discountedSubtotal * 0.20; // 20% Deposit

    const handleApplyPromo = () => {
        if (promoCode.toUpperCase() === 'VIP500') {
            setDiscountApplied(500);
            setAlertConfig({
                title: 'PROMO APPLIED',
                message: 'RM 500 discount has been applied to your deposit.',
                type: 'success',
                onClose: () => setAlertVisible(false)
            });
            setAlertVisible(true);
        } else {
            setDiscountApplied(0);
            setAlertConfig({
                title: 'INVALID CODE',
                message: 'The promo code entered is not valid.',
                type: 'error',
                onClose: () => setAlertVisible(false)
            });
            setAlertVisible(true);
        }
    };

    const toggleAddon = (id: string) => {
        if (selectedAddons.includes(id)) {
            setSelectedAddons(selectedAddons.filter(a => a !== id));
        } else {
            setSelectedAddons([...selectedAddons, id]);
        }
    };

    const handlePayment = async () => {
        setIsProcessing(true);

        const userName = user?.user_metadata?.name || 'VIP Guest';
        const userPhone = user?.user_metadata?.phone || '+60123456789';

        const bookingId = `BK-${Date.now()}`;
        const qrData = `kyo-${bookingId}-${user?.id || 'guest'}`;

        const { error } = await supabase.from('reservations').insert({
            user_id: user?.id || null,
            guests: guestCount,
            total_amount: subtotal,
            deposit_paid: depositAmount,
            type: 'TABLE',
            status: 'CONFIRMED',
            qr_code_data: qrData
        });

        setIsProcessing(false);

        if (error) {
            setAlertConfig({
                title: 'BOOKING FAILED',
                message: error.message || 'There was an error saving your booking. Please try again.',
                type: 'error',
                onClose: () => setAlertVisible(false)
            });
            setAlertVisible(true);
            return;
        }

        const waLink = generateWhatsAppLink(
            userName,
            userPhone,
            params.tableNumber,
            params.date,
            params.time,
            depositAmount
        );

        setAlertConfig({
            title: 'PAYMENT SUCCESSFUL',
            message: 'Your deposit has been received. You will now be redirected to WhatsApp to complete your reservation.',
            type: 'success',
            onClose: () => {
                setAlertVisible(false);
                Linking.openURL(waLink).catch(err => {
                    console.error("Couldn't open WhatsApp", err);
                });
                navigation.goBack();
            }
        });
        setAlertVisible(true);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <GlassHeader title="CHECKOUT" onLeftPress={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 56 }]}>

                <Text style={styles.sectionHeader}>BOOKING SUMMARY</Text>
                <IndustrialCard style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>TABLE</Text>
                        <Text style={styles.summaryValue}>{params.tableNumber.toUpperCase()}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>ARRIVAL</Text>
                        <Text style={styles.summaryValue}>{params.date} @ {params.time}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>GUESTS</Text>
                        <View style={styles.stepperControl}>
                            <TouchableOpacity onPress={() => setGuestCount(Math.max(1, guestCount - 1))} style={styles.stepBtn}>
                                <Ionicons name="remove" size={16} color={theme.colors.text} />
                            </TouchableOpacity>
                            <Text style={styles.stepValue}>{guestCount}</Text>
                            <TouchableOpacity onPress={() => setGuestCount(Math.min(params.capacity + 4, guestCount + 1))} style={styles.stepBtn}>
                                <Ionicons name="add" size={16} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </IndustrialCard>

                <Text style={[styles.sectionHeader, { marginTop: 32 }]}>BOTTLE PRE-ORDERS</Text>
                {PACKAGES.map((pkg) => (
                    <TouchableOpacity
                        key={pkg.id}
                        style={[
                            styles.packageCard,
                            selectedPackage === pkg.id && styles.packageCardActive
                        ]}
                        onPress={() => setSelectedPackage(selectedPackage === pkg.id ? null : pkg.id)}
                    >
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.packageName, selectedPackage === pkg.id && styles.textActive]}>{pkg.name}</Text>
                            <Text style={styles.packagePrice}>RM {pkg.price.toFixed(2)}</Text>
                        </View>
                        <View style={styles.radioOuter}>
                            {selectedPackage === pkg.id && <View style={styles.radioInner} />}
                        </View>
                    </TouchableOpacity>
                ))}

                <Text style={[styles.sectionHeader, { marginTop: 32 }]}>VIP ADD-ONS</Text>
                {ADDONS.map((addon) => {
                    const isSelected = selectedAddons.includes(addon.id);
                    return (
                        <TouchableOpacity
                            key={addon.id}
                            style={[
                                styles.packageCard,
                                isSelected && styles.packageCardActive
                            ]}
                            onPress={() => toggleAddon(addon.id)}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.packageName, isSelected && styles.textActive]}>{addon.name}</Text>
                                <Text style={styles.packagePrice}>+ RM {addon.price.toFixed(2)}</Text>
                            </View>
                            <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                                {isSelected && <Ionicons name="checkmark" size={14} color={theme.colors.background} />}
                            </View>
                        </TouchableOpacity>
                    );
                })}

                <Text style={[styles.sectionHeader, { marginTop: 32 }]}>PROMO CODE</Text>
                <View style={styles.promoRow}>
                    <TextInput
                        style={styles.promoInput}
                        placeholder="ENTER CODE"
                        placeholderTextColor={theme.colors.textSecondary}
                        autoCapitalize="characters"
                        value={promoCode}
                        onChangeText={setPromoCode}
                    />
                    <TouchableOpacity style={styles.promoApplyBtn} onPress={handleApplyPromo}>
                        <Text style={styles.promoApplyText}>APPLY</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.depositAlert}>
                    <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
                    <Text style={styles.depositAlertText}>
                        A 20% deposit is required. Minimum spend: RM {params.minSpend.toFixed(2)}.
                    </Text>
                </View>

                <IndustrialCard style={styles.totalCard}>
                    {discountApplied > 0 && <Text style={styles.discountText}>DISCOUNT: -RM {discountApplied.toFixed(2)}</Text>}
                    <Text style={styles.totalLabel}>TOTAL DEPOSIT DUE</Text>
                    <Text style={styles.totalAmount}>RM {depositAmount.toFixed(2)}</Text>
                </IndustrialCard>

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
                    title={isProcessing ? "PROCESSING..." : `PAY RM ${depositAmount.toFixed(2)}`}
                    onPress={handlePayment}
                    disabled={isProcessing}
                    style={{ width: '100%', opacity: isProcessing ? 0.7 : 1 }}
                />
            </View>

            <AlertModal
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={alertConfig.onClose || (() => setAlertVisible(false))}
            />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 150, // Space for footer
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
    packageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 12,
        borderRadius: 4,
    },
    packageCardActive: {
        borderColor: theme.colors.primary,
        backgroundColor: 'rgba(197, 160, 89, 0.05)',
    },
    packageName: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 12,
        letterSpacing: 1,
        marginBottom: 4,
    },
    packagePrice: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 12,
    },
    textActive: {
        color: theme.colors.primary,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: theme.colors.textSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 2,
    },
    checkboxActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    promoRow: {
        flexDirection: 'row',
        marginBottom: 32,
        gap: 12,
    },
    promoInput: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: theme.colors.border,
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.monospace,
        paddingHorizontal: 16,
        fontSize: 14,
        borderRadius: 4,
        textTransform: 'uppercase',
    },
    promoApplyBtn: {
        backgroundColor: 'rgba(197, 160, 89, 0.1)',
        borderWidth: 1,
        borderColor: theme.colors.primary,
        justifyContent: 'center',
        paddingHorizontal: 24,
        borderRadius: 4,
    },
    promoApplyText: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 12,
        letterSpacing: 1,
    },
    depositAlert: {
        flexDirection: 'row',
        backgroundColor: 'rgba(197, 160, 89, 0.1)',
        padding: 16,
        borderRadius: 4,
        borderLeftWidth: 2,
        borderLeftColor: theme.colors.primary,
        gap: 12,
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    depositAlertText: {
        flex: 1,
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: 12,
        lineHeight: 18,
    },
    totalCard: {
        backgroundColor: theme.colors.primary,
        padding: 24,
        alignItems: 'center',
    },
    discountText: {
        color: '#000',
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 12,
        marginBottom: 8,
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
