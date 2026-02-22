import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { GlassHeader } from '../components/GlassHeader';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export const AboutScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const openMaps = () => {
        const query = encodeURIComponent('Kyo Club Kuala Lumpur Mandarin Oriental');
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    };

    const openLink = (url: string) => {
        Linking.openURL(url);
    };

    return (
        <ImageBackground
            source={require('../../assets/about-bg.jpg')}
            style={styles.container}
            resizeMode="cover"
        >
            <LinearGradient
                colors={['rgba(15,15,15,0.85)', 'rgba(5,5,5,0.95)', '#000']}
                style={StyleSheet.absoluteFillObject}
            />
            <GlassHeader
                title="ABOUT KYO"
                leftIcon="arrow-back"
                onLeftPress={() => navigation.goBack()}
            />

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 56 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Intro Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>THE ROOM</Text>
                    <Text style={styles.descriptionText}>
                        Uncover an underground escape within the city as you descend into our party den. Kyo is a pulsating epicentre for those seeking a vibrant and electrifying night out, featuring a massive underground space dedicated to world-class music and entertainment.
                    </Text>
                </View>

                {/* Operating Hours */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>OPERATING HOURS</Text>
                    <View style={styles.hoursContainer}>
                        <View style={styles.hourRow}>
                            <Text style={styles.hourDay}>Wed & Thu</Text>
                            <Text style={styles.hourTime}>10:00 PM - 3:00 AM</Text>
                        </View>
                        <View style={styles.hourRow}>
                            <Text style={styles.hourDay}>Fri & Sat</Text>
                            <Text style={styles.hourTime}>10:00 PM - 3:00 AM</Text>
                        </View>
                        <View style={styles.hourRow}>
                            <Text style={styles.hourDay}>Sunday</Text>
                            <Text style={styles.hourTime}>10:00 PM - 3:00 AM</Text>
                        </View>
                        <View style={[styles.hourRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                            <Text style={[styles.hourDay, { color: theme.colors.error }]}>Mon & Tue</Text>
                            <Text style={[styles.hourTime, { color: theme.colors.error }]}>CLOSED</Text>
                        </View>
                        <Text style={styles.hoursNote}>*Hours may differ during public holidays (e.g. Lunar New Year).</Text>
                    </View>
                </View>

                {/* Dress Code Image */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>HOUSE RULES & DRESS CODE</Text>
                    <View style={styles.imageContainer}>
                        <Image
                            source={require('../../assets/dress-code.jpg')}
                            style={styles.dressCodeImage}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                {/* Location */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>LOCATION</Text>
                    <TouchableOpacity style={styles.locationCard} onPress={openMaps} activeOpacity={0.8}>
                        <View style={styles.locationInfo}>
                            <Text style={styles.locationName}>Mandarin Oriental</Text>
                            <Text style={styles.locationAddress}>Kuala Lumpur City Centre,{'\n'}50088 Kuala Lumpur, Malaysia</Text>
                        </View>
                        <View style={styles.mapIconContainer}>
                            <Ionicons name="map-outline" size={24} color={theme.colors.background} />
                            <Text style={styles.mapButtonText}>OPEN MAPS</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Socials */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>CONNECT WITH US</Text>
                    <View style={styles.socialButtonsContainer}>
                        <TouchableOpacity
                            style={styles.linktreeButton}
                            onPress={() => openLink('https://linktr.ee/kyokl?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQPNTY3MDY3MzQzMzUyNDI3AAGnEnLVPmSlrO1kQ1Ep1F56yEc1HJ_n69qTj69sHVBl5XyK5NNTRImov6slAps_aem_N69EYwzncuOsYGlHB3KD9A')}
                        >
                            <Ionicons name="link-outline" size={24} color={theme.colors.background} />
                            <Text style={styles.linktreeButtonText}>FOLLOW OUR SOCIALS</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    section: {
        paddingHorizontal: 20,
        marginTop: 32,
    },
    sectionTitle: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 14,
        letterSpacing: 2,
        marginBottom: 16,
    },
    descriptionText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: 14,
        lineHeight: 22,
    },
    hoursContainer: {
        backgroundColor: '#111',
        borderRadius: 8,
        padding: 20,
        borderWidth: 1,
        borderColor: '#222',
    },
    hourRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    hourDay: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 14,
    },
    hourTime: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 13,
    },
    hoursNote: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: 12,
        marginTop: 8,
        fontStyle: 'italic',
    },
    imageContainer: {
        width: '100%',
        alignItems: 'center',
        backgroundColor: '#000',
        borderRadius: 12,
        overflow: 'hidden',
    },
    dressCodeImage: {
        width: '100%',
        height: undefined,
        aspectRatio: 0.7, // Matches typical vertical image ratio, adjust if needed
    },
    locationCard: {
        backgroundColor: theme.colors.primary,
        borderRadius: 8,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    locationInfo: {
        flex: 1,
    },
    locationName: {
        color: theme.colors.background,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 16,
        marginBottom: 4,
    },
    locationAddress: {
        color: 'rgba(0,0,0,0.7)',
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: 13,
        lineHeight: 18,
    },
    mapIconContainer: {
        alignItems: 'center',
        marginLeft: 16,
    },
    mapButtonText: {
        color: theme.colors.background,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 10,
        marginTop: 4,
    },
    socialButtonsContainer: {
        flexDirection: 'row',
    },
    linktreeButton: {
        flex: 1,
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 8,
        gap: 12,
    },
    linktreeButtonText: {
        color: theme.colors.background,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 14,
        letterSpacing: 1,
    },
});
