import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../theme';
import { GlassHeader } from '../components/GlassHeader';
import { IndustrialCard } from '../components/IndustrialCard';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';

interface DigitalPassRouteParams {
    bookingId: string;
    qrData: string;
    type: string;
    guests: number;
    date: string;
    timestamp?: number;
}

const { width } = Dimensions.get('window');

export const DigitalPassScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const route = useRoute();

    const params = route.params as DigitalPassRouteParams;
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // 5 minutes expiry for WALK-IN
    const EXPIRY_MS = 5 * 60 * 1000;

    useEffect(() => {
        if (params.timestamp && params.type === 'WALK-IN ENTRY') {
            const calculateTimeLeft = () => {
                const now = Date.now();
                const diff = (params.timestamp! + EXPIRY_MS) - now;

                if (diff <= 0) {
                    setTimeLeft(0);
                } else {
                    setTimeLeft(Math.floor(diff / 1000));
                }
            };

            calculateTimeLeft();
            const interval = setInterval(calculateTimeLeft, 1000);
            return () => clearInterval(interval);
        }
    }, [params.timestamp, params.type]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const isExpired = timeLeft === 0;

    return (
        <View style={styles.container}>
            <GlassHeader title="DIGITAL PASS" onLeftPress={() => navigation.navigate('MainTabs' as never)} />

            <View style={[styles.content, { paddingTop: insets.top + 56 }]}>

                <Text style={styles.instruction}>
                    Present this QR code to the door staff for scanning.
                </Text>

                <View style={styles.cardWrapper}>
                    <IndustrialCard style={[styles.passCard, isExpired && styles.expiredCard]}>

                        <View style={styles.passHeader}>
                            <Text style={styles.passType}>{params.type}</Text>
                            <Text style={styles.bookingId}>{params.bookingId}</Text>
                        </View>

                        <View style={styles.qrContainer}>
                            {isExpired ? (
                                <View style={styles.expiredOverlay}>
                                    <Ionicons name="close-circle" size={48} color={theme.colors.error} />
                                    <Text style={styles.expiredTitle}>PASS EXPIRED</Text>
                                    <Text style={styles.expiredDesc}>Walk-in tickets are only valid for 5 minutes after purchase.</Text>
                                </View>
                            ) : (
                                <View style={styles.qrFrame}>
                                    <QRCode
                                        value={params.qrData}
                                        size={width * 0.55}
                                        color={theme.colors.background}
                                        backgroundColor="#FFF"
                                    />
                                    {/* Scan Line Animation could go here */}
                                </View>
                            )}
                        </View>

                        {timeLeft !== null && !isExpired && (
                            <View style={styles.timerRow}>
                                <Ionicons name="timer-outline" size={20} color={theme.colors.error} />
                                <Text style={styles.timerText}>
                                    Expires in: <Text style={styles.timerBold}>{formatTime(timeLeft)}</Text>
                                </Text>
                            </View>
                        )}

                        <View style={styles.divider} />

                        <View style={styles.detailsGrid}>
                            <View style={styles.detailCol}>
                                <Text style={styles.detailLabel}>DATE</Text>
                                <Text style={styles.detailValue}>{params.date}</Text>
                            </View>
                            <View style={styles.detailCol}>
                                <Text style={styles.detailLabel}>GUESTS</Text>
                                <Text style={styles.detailValue}>{params.guests} PAX</Text>
                            </View>
                        </View>

                    </IndustrialCard>
                </View>

                {isExpired && (
                    <TouchableOpacity
                        style={styles.repurchaseBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.repurchaseText}>PURCHASE NEW PASS</Text>
                    </TouchableOpacity>
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
        alignItems: 'center',
        padding: 24,
    },
    instruction: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 14,
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 40,
        paddingHorizontal: 20,
        lineHeight: 20,
    },
    cardWrapper: {
        width: '100%',
        alignItems: 'center',
    },
    passCard: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: '#111',
        padding: 0,
        overflow: 'hidden',
    },
    expiredCard: {
        borderColor: theme.colors.error,
        opacity: 0.8,
    },
    passHeader: {
        backgroundColor: theme.colors.primary,
        padding: 20,
        alignItems: 'center',
    },
    passType: {
        color: '#000',
        fontFamily: theme.typography.fontFamily.heading,
        fontSize: 24,
        letterSpacing: 1,
    },
    bookingId: {
        color: 'rgba(0,0,0,0.6)',
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 12,
        marginTop: 4,
    },
    qrContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
    },
    qrFrame: {
        padding: 16,
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 8,
    },
    expiredOverlay: {
        alignItems: 'center',
        justifyContent: 'center',
        height: width * 0.55,
    },
    expiredTitle: {
        color: theme.colors.error,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 20,
        marginTop: 12,
        marginBottom: 8,
    },
    expiredDesc: {
        color: '#666',
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 12,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#222',
        paddingVertical: 12,
        gap: 8,
    },
    timerText: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 14,
    },
    timerBold: {
        color: theme.colors.error,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 16,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginHorizontal: 20,
    },
    detailsGrid: {
        flexDirection: 'row',
        padding: 24,
    },
    detailCol: {
        flex: 1,
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: 'rgba(255, 255, 255, 0.1)',
    },
    detailLabel: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 10,
        letterSpacing: 2,
        marginBottom: 8,
    },
    detailValue: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 16,
    },
    repurchaseBtn: {
        marginTop: 32,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        borderRadius: 4,
    },
    repurchaseText: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 12,
        letterSpacing: 1,
    }
});
