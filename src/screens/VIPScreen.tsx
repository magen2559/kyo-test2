import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { GlassHeader } from '../components/GlassHeader';
import { IndustrialCard } from '../components/IndustrialCard';
import { GoldButton } from '../components/GoldButton';
import { Ionicons } from '@expo/vector-icons';

const REWARDS = [
    { id: '1', title: 'FREE COVER CHARGE', points: 500, type: 'ENTRY' },
    { id: '2', title: '1X BOTTLE UPGRADE', points: 1500, type: 'BOTTLE' },
    { id: '3', title: 'PRIVATE VIP ROOM', points: 5000, type: 'EXPERIENCE' },
];

export const VIPScreen = () => {
    const insets = useSafeAreaInsets();

    // Mock user points
    const userPoints = 2150;
    const nextTier = "GOLD";
    const pointsToNext = 5000 - userPoints;
    const progress = (userPoints / 5000) * 100;

    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);

    return (
        <View style={styles.container}>
            <GlassHeader title="VIP CLUB" leftIcon="diamond" />

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 72 }]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
            >

                {/* Tier & Points Card */}
                <ImageBackground
                    source={{ uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1548&auto=format&fit=crop' }}
                    style={styles.membershipCard}
                    imageStyle={{ opacity: 0.3 }}
                >
                    <View style={styles.cardOverlay}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.tierName}>SILVER TIER</Text>
                            <Ionicons name="scan-outline" size={24} color={theme.colors.primary} />
                        </View>

                        <View style={styles.pointsDisplay}>
                            <Text style={styles.pointsValue}>{userPoints.toLocaleString()}</Text>
                            <Text style={styles.pointsLabel}>KYO POINTS</Text>
                        </View>

                        <View style={styles.progressSection}>
                            <View style={styles.progressRow}>
                                <Text style={styles.progressText}>{pointsToNext} PTS TO {nextTier}</Text>
                                <Text style={styles.progressText}>{Math.floor(progress)}%</Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                            </View>
                        </View>
                    </View>
                </ImageBackground>

                {/* Action Buttons */}
                <View style={styles.actionButtonsRow}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="arrow-up-circle-outline" size={20} color={theme.colors.primary} />
                        <Text style={styles.actionButtonText}>UPGRADE TIER</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
                        <Text style={styles.actionButtonText}>VIEW HISTORY</Text>
                    </TouchableOpacity>
                </View>

                {/* Rewards List */}
                <Text style={styles.sectionTitle}>REDEEM REWARDS</Text>

                {REWARDS.map((reward) => (
                    <IndustrialCard key={reward.id} style={styles.rewardCard}>
                        <View style={styles.rewardHeader}>
                            <View style={styles.rewardTypeBadge}>
                                <Text style={styles.rewardTypeText}>{reward.type}</Text>
                            </View>
                            <Text style={styles.rewardCost}>{reward.points} PTS</Text>
                        </View>
                        <Text style={styles.rewardTitle}>{reward.title}</Text>
                        <GoldButton
                            title="REDEEM"
                            style={styles.redeemBtn}
                            disabled={userPoints < reward.points}
                        />
                    </IndustrialCard>
                ))}

                <View style={{ height: 40 }} />
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
        paddingBottom: 100,
    },
    membershipCard: {
        width: '100%',
        height: 220,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.primary,
        marginBottom: 32,
    },
    cardOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 24,
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tierName: {
        color: '#A8A9AD', // Silver text
        fontFamily: theme.typography.fontFamily.heading,
        fontSize: 20,
        letterSpacing: 2,
    },
    pointsDisplay: {
        alignItems: 'center',
    },
    pointsValue: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 48,
    },
    pointsLabel: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 12,
        letterSpacing: 2,
    },
    progressSection: {
        marginTop: 16,
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 10,
        letterSpacing: 1,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: 3,
    },
    sectionTitle: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 12,
        letterSpacing: 2,
        marginBottom: 16,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingVertical: 14,
        borderRadius: 8,
        gap: 8,
    },
    actionButtonText: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 10,
        letterSpacing: 1,
    },
    rewardCard: {
        padding: 20,
        marginBottom: 16,
    },
    rewardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    rewardTypeBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    rewardTypeText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 10,
        letterSpacing: 1,
    },
    rewardCost: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 14,
    },
    rewardTitle: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.heading,
        fontSize: 18,
        letterSpacing: 1,
        marginBottom: 20,
    },
    redeemBtn: {
        width: '100%',
    },
});
