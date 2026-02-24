import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, useWindowDimensions, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { GlassHeader } from '../components/GlassHeader';
import { IndustrialCard } from '../components/IndustrialCard';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { EventItem } from '../navigation/RootNavigator';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';

const GALLERY_IMAGES = [
    { id: '1', source: require('../../assets/images/gallery/img-gallery-03.jpg'), title: 'Kyo Image 1' },
    { id: '2', source: require('../../assets/images/gallery/kyo-img-15.jpg'), title: 'Kyo Image 2' },
    { id: '3', source: require('../../assets/images/gallery/kyo-img-4.jpg'), title: 'Kyo Image 3' },
    { id: '4', source: require('../../assets/images/gallery/kyo-img-5.jpg'), title: 'Kyo Image 4' },
    { id: '5', source: require('../../assets/images/gallery/kyo-img-7.jpg'), title: 'Kyo Image 5' },
];

export const HomeScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { height } = useWindowDimensions();
    const [events, setEvents] = React.useState<EventItem[]>([]);

    const videoSource = require('../../assets/videos/kyo_hero_video.mp4');
    const player = useVideoPlayer(videoSource, player => {
        player.loop = true;
        player.muted = false; // Turned sound on per user request
        player.play();
    });

    React.useEffect(() => {
        const fetchTopEvents = async () => {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .limit(3)
                .order('created_at', { ascending: true });
            if (data) setEvents(data);
        };
        fetchTopEvents();
    }, []);

    const renderEventCard = (event: EventItem) => (
        <IndustrialCard key={event.id} style={styles.eventCard}>
            <View style={styles.eventImagePlaceholder}>
                <Image source={{ uri: event.image }} style={StyleSheet.absoluteFillObject} />
                <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' }} />
            </View>
            <View style={styles.eventDetails}>
                <Text style={styles.eventDate}>{event.date_label.replace(/\\n|\n/g, ' ').replace(/\s+/g, ' ').trim()}</Text>
                <Text style={styles.eventTitle}>{event.title}</Text>
                {event.status !== 'AVAILABLE' && (
                    <View style={[styles.limitedTag, event.status === 'SOLD OUT' && { backgroundColor: '#333' }]}>
                        <Text style={[styles.limitedText, event.status === 'SOLD OUT' && { color: theme.colors.textSecondary }]}>{event.status}</Text>
                    </View>
                )}
                <View style={styles.bookNowContainer}>
                    <Text style={styles.bookNowText}>BOOK NOW</Text>
                </View>
            </View>
        </IndustrialCard>
    );

    // Auto-scroll ref
    const flatListRef = React.useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = React.useState(0);

    React.useEffect(() => {
        if (events.length === 0) return;
        const interval = setInterval(() => {
            let nextIndex = currentIndex + 1;
            if (nextIndex >= events.length) {
                nextIndex = 0;
            }
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
            setCurrentIndex(nextIndex);
        }, 3000); // Scroll every 3 seconds

        return () => clearInterval(interval);
    }, [currentIndex, events.length]);

    return (
        <View style={styles.container}>
            <GlassHeader showLogo rightElement={<Ionicons name="person-circle" size={28} color={theme.colors.primary} />} />

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 56 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Section */}
                <View style={[styles.heroSection, { height: height * 0.70 }]}>
                    <VideoView
                        style={styles.heroImage}
                        player={player}
                        contentFit="cover"
                        nativeControls={false}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,1)']}
                        style={styles.gradientOverlay}
                    />
                </View>

                {/* About Us & Feel The Void Info Sections */}
                <View style={styles.infoContainer}>
                    <View style={styles.infoSection}>
                        <View style={styles.infoTitleLine} />
                        <Text style={styles.infoTitle}>ABOUT US</Text>
                        <Text style={styles.infoText}>
                            Uncover an underground escape within the city as you descend into our party den positioned at the basement of the Mandarin Oriental hotel. Kyo is a pulsating epicentre for those seeking a vibrant and electrifying night out in the heart of Kuala Lumpur. Music enthusiasts and party aficionados alike gravitate toward Kyo for its unrivalled fusion of dance to hip-hop. It's a melting pot where diverse musical tastes converge, ensuring that there's something for everyone.
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
                            <TouchableOpacity
                                style={[styles.outlineButton, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
                                onPress={() => navigation.navigate('WalkIn' as never)}
                            >
                                <Text style={[styles.outlineButtonText, { color: '#000' }]}>GET WALK-IN PASS</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.outlineButton}
                                onPress={() => navigation.navigate('About' as never)}
                            >
                                <Text style={styles.outlineButtonText}>VIEW MORE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.infoSection}>
                        <View style={styles.infoTitleLine} />
                        <Text style={styles.infoTitle}>FEEL THE VOID</Text>
                        <Text style={styles.infoText}>
                            Kyo is powered by Void Acoustics Tri Motion Loudspeakers, a state-of-the-art sound system with music pulsating through your soul. With that, Kyo offers an immersive sonic experience that sets the stage for unforgettable nights in the city. Void emerged as a major supplier to Ibiza, the clubbing capital of the world with the legendary DC 10, Bora Bora and Sands installing Void systems. Delivering power through the systems, Kyo is guaranteed to move people through unforgettable, immersive sound.
                        </Text>
                    </View>
                </View>

                {/* Upcoming Events Carousel */}
                <View style={[styles.sectionContainer, { marginBottom: 40 }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>UPCOMING EVENTS</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Lineup' as never)}>
                            <Text style={styles.seeMoreText}>SEE MORE</Text>
                        </TouchableOpacity>
                    </View>
                    {events.length > 0 ? (
                        <FlatList
                            ref={flatListRef}
                            data={events}
                            renderItem={({ item }) => renderEventCard(item)}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.carouselContainer}
                            snapToInterval={256} // card width (240) + margin (16)
                            decelerationRate="fast"
                        />
                    ) : (
                        <Text style={{ color: theme.colors.textSecondary, marginLeft: 20 }}>Loading events...</Text>
                    )}
                </View>

                {/* Gallery Section Placeholder */}
                <View style={[styles.sectionContainer, { marginBottom: 40 }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>GALLERY</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeMoreText}>SEE ALL</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContainer}>
                        {GALLERY_IMAGES.map((item) => (
                            <View key={item.id} style={styles.galleryPlaceholder}>
                                <Image source={item.source} style={styles.galleryImage} />
                                <View style={styles.galleryOverlay}>
                                    <Ionicons name="image-outline" size={24} color={'rgba(255,255,255,0.8)'} />
                                    <Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 4, fontSize: 10 }}>{item.title}</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
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
        position: 'relative',
    },
    heroImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    infoContainer: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 24,
        gap: 40,
    },
    infoSection: {
        width: '100%',
    },
    infoTitleLine: {
        width: 120,
        height: 3,
        backgroundColor: '#fff',
        marginBottom: 16,
    },
    infoTitle: {
        color: '#fff',
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 28,
        letterSpacing: 1,
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    infoText: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: 13,
        lineHeight: 20,
    },
    outlineButton: {
        borderWidth: 1,
        borderColor: theme.colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 28,
        alignSelf: 'flex-start',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    outlineButtonText: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 12,
        letterSpacing: 1.5,
    },
    sectionContainer: {
        marginTop: 40,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 12,
        letterSpacing: 2,
    },
    seeMoreText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 12,
        letterSpacing: 1,
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
    galleryPlaceholder: {
        width: 160,
        height: 160,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginRight: 16,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    galleryImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    galleryOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
