import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { GlassHeader } from '../components/GlassHeader';
import { IndustrialCard } from '../components/IndustrialCard';
import { GoldButton } from '../components/GoldButton';
import { Ionicons } from '@expo/vector-icons';

export const HomeScreen = () => {
    const insets = useSafeAreaInsets();

    const renderEventCard = (title: string, date: string, limited: boolean) => (
        <IndustrialCard style={styles.eventCard}>
            <View style={styles.eventImagePlaceholder} />
            <View style={styles.eventDetails}>
                <Text style={styles.eventDate}>{date}</Text>
                <Text style={styles.eventTitle}>{title}</Text>
                {limited && (
                    <View style={styles.limitedTag}>
                        <Text style={styles.limitedText}>LIMITED</Text>
                    </View>
                )}
                <View style={styles.bookNowContainer}>
                    <Text style={styles.bookNowText}>BOOK NOW</Text>
                </View>
            </View>
        </IndustrialCard>
    );

    return (
        <View style={styles.container}>
            <GlassHeader title="VIP ACCESS" rightElement={<Ionicons name="person-circle" size={28} color={theme.colors.primary} />} />

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 56 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1548&auto=format&fit=crop' }}
                        style={styles.heroImage}
                    />
                    <View style={styles.heroOverlay}>
                        <Text style={styles.heroTitle}>ABOUT US</Text>
                        <Text style={styles.heroSubtitle}>Experience the raw industrial energy of KL's most exclusive underground sanctuary.</Text>
                        <TouchableOpacity style={styles.outlineButton}>
                            <Text style={styles.outlineButtonText}>VIEW MORE</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Upcoming Events Carousel */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>UPCOMING EVENTS</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContainer}>
                        {renderEventCard('TECHNO TUESDAYS', 'OCT 24', false)}
                        {renderEventCard('DEEP HOUSE SESSIONS', 'OCT 25', true)}
                        {renderEventCard('INDUSTRIAL NIGHT', 'OCT 31', false)}
                    </ScrollView>
                </View>

                {/* Location Map Preview */}
                <View style={styles.sectionContainer}>
                    <View style={styles.locationHeader}>
                        <View>
                            <Text style={styles.locationTitle}>MANDARIN ORIENTAL</Text>
                            <Text style={styles.locationSubtitle}>Kuala Lumpur City Centre</Text>
                        </View>
                        <Ionicons name="location" size={24} color={theme.colors.primary} />
                    </View>
                    <IndustrialCard style={styles.mapPreviewCard}>
                        {/* Placeholder for actual map image or generic dark box */}
                        <View style={styles.mapDarkOverlay}>
                            <View style={styles.mapPinContainer}>
                                <Ionicons name="ellipse" size={16} color={theme.colors.primary} />
                                <View style={styles.mapPinPulse} />
                            </View>
                        </View>
                    </IndustrialCard>
                </View>

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
        paddingBottom: 20,
    },
    heroSection: {
        width: '100%',
        height: 400,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        opacity: 0.6,
    },
    heroOverlay: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
    },
    heroTitle: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 32,
        marginBottom: 8,
        letterSpacing: 1,
    },
    heroSubtitle: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: 14,
        marginBottom: 20,
        lineHeight: 20,
    },
    outlineButton: {
        borderWidth: 1,
        borderColor: theme.colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignSelf: 'flex-start',
    },
    outlineButtonText: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 12,
        letterSpacing: 1,
    },
    sectionContainer: {
        marginTop: 40,
    },
    sectionTitle: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 12,
        letterSpacing: 2,
        marginLeft: 20,
        marginBottom: 16,
    },
    carouselContainer: {
        paddingHorizontal: 20,
        gap: 16,
    },
    eventCard: {
        width: 240,
        height: 320,
        marginRight: 16,
    },
    eventImagePlaceholder: {
        flex: 1,
        backgroundColor: '#1A1A1A',
    },
    eventDetails: {
        padding: 16,
        paddingBottom: 24,
    },
    eventDate: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 12,
        marginBottom: 4,
    },
    eventTitle: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 16,
        marginBottom: 16,
    },
    limitedTag: {
        position: 'absolute',
        top: -280,
        right: 12,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 2,
    },
    limitedText: {
        color: '#000',
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 10,
    },
    bookNowContainer: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 8,
        alignItems: 'center',
    },
    bookNowText: {
        color: '#000',
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 12,
    },
    locationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    locationTitle: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 16,
    },
    locationSubtitle: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: 12,
        marginTop: 4,
    },
    mapPreviewCard: {
        marginHorizontal: 20,
        height: 150,
        backgroundColor: '#111',
    },
    mapDarkOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    mapPinContainer: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapPinPulse: {
        position: 'absolute',
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.primary,
        opacity: 0.2,
    },
});
