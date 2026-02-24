import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, TextInput, RefreshControl, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, EventItem } from '../navigation/RootNavigator';
import { theme } from '../theme';
import { GlassHeader } from '../components/GlassHeader';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

type LineupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

const FILTERS = ['Events'];

const INTERNATIONAL_ACTS = [
    { id: '1', name: 'Big Shaq', image: require('../../assets/images/international_acts/act_1.jpeg') },
    { id: '2', name: 'Jazzy Jeff', image: require('../../assets/images/international_acts/act_2.jpeg') },
    { id: '3', name: 'Dash Berlin', image: require('../../assets/images/international_acts/act_3.jpeg') },
    { id: '4', name: 'Kid Ink', image: require('../../assets/images/international_acts/act_4.jpeg') },
    { id: '5', name: 'Act 5', image: require('../../assets/images/international_acts/act_5.jpeg') },
    { id: '6', name: 'Act 6', image: require('../../assets/images/international_acts/act_6.jpeg') },
    { id: '7', name: 'Act 7', image: require('../../assets/images/international_acts/act_7.jpeg') },
    { id: '8', name: 'Act 8', image: require('../../assets/images/international_acts/act_8.jpeg') },
    { id: '9', name: 'Act 9', image: require('../../assets/images/international_acts/act_9.jpeg') },
    { id: '10', name: 'Act 10', image: require('../../assets/images/international_acts/act_10.jpeg') },
];

export const LineupScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<LineupScreenNavigationProp>();

    const [activeFilter, setActiveFilter] = useState('Events');
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [events, setEvents] = useState<EventItem[]>([]);

    const fetchEvents = async () => {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: true });

        if (data) {
            setEvents(data);
        } else if (error) {
            console.error('Error fetching events:', error);
        }
    };

    React.useEffect(() => {
        fetchEvents();
    }, []);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchEvents();
        setRefreshing(false);
    }, []);

    const renderEvent = (event: EventItem) => (
        <TouchableOpacity
            key={event.id}
            activeOpacity={0.9}
            // @ts-ignore: EventDetail is in RootStack, so Typescript might complain on MainTabs prop, but this works in React Navigation natively
            onPress={() => navigation.navigate('EventDetail', { event })}
        >
            <ImageBackground
                source={{ uri: event.image }}
                style={styles.eventContainer}
                imageStyle={styles.eventImage}
            >
                <View style={styles.eventOverlay}>
                    <View style={styles.eventHeaderRow}>
                        <View style={styles.dateBadge}>
                            <Text style={styles.dateText}>{event.date_label}</Text>
                        </View>
                        {event.status !== 'AVAILABLE' && !event.is_past && (
                            <View style={[
                                styles.statusBadge,
                                event.status === 'SOLD OUT' && styles.statusBadgeSoldOut
                            ]}>
                                <Text style={[
                                    styles.statusText,
                                    event.status === 'SOLD OUT' && styles.statusTextSoldOut
                                ]}>{event.status}</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.eventFooterArea}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        <View style={styles.techDataRow}>
                            <Ionicons name="radio-button-on" size={12} color={theme.colors.textSecondary} />
                            <Text style={styles.techDataText}>{event.stage}</Text>
                            <Ionicons name="pulse" size={12} color={theme.colors.textSecondary} style={{ marginLeft: 8 }} />
                            <Text style={styles.techDataText}>{event.bpm}</Text>
                        </View>
                    </View>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
        let matchesFilter = true;

        if (activeFilter === 'Upcoming Events') {
            matchesFilter = !event.is_past;
        } else if (activeFilter === 'Events') {
            matchesFilter = !!event.is_past;
        }

        return matchesSearch && matchesFilter;
    });

    return (
        <View style={styles.container}>
            <GlassHeader title="LINEUP" leftIcon="flash" />

            <View style={[styles.controlsContainer, { marginTop: insets.top + 56 }]}>
                <View style={styles.searchRow}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="SEARCH EVENTS"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <TouchableOpacity style={styles.calendarButton}>
                        <Ionicons name="calendar" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.filterContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                        {FILTERS.map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                style={[
                                    styles.filterChip,
                                    activeFilter === filter && styles.filterChipActive
                                ]}
                                onPress={() => setActiveFilter(filter)}
                            >
                                <Text style={[
                                    styles.filterText,
                                    activeFilter === filter && styles.filterTextActive
                                ]}>{filter}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.feedContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                }
            >
                {activeFilter === 'Events' && (
                    <View style={styles.internationalActsSection}>
                        <View style={styles.internationalActsDivider} />
                        <Text style={styles.internationalActsHeader}>
                            INTERNATIONAL ACTS THAT TOOK THE STAGE
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.internationalActsScroll}>
                            {INTERNATIONAL_ACTS.map((act) => (
                                <View key={act.id} style={styles.internationalActCard}>
                                    <Image source={act.image} style={styles.internationalActImage} />
                                    <Text style={styles.internationalActName}>{act.name}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {filteredEvents.map(renderEvent)}
                <View style={{ height: 100 }} /> {/* Padding for FAB */}
            </ScrollView>

            <TouchableOpacity style={[styles.fab, { bottom: 20 }]} activeOpacity={0.8}>
                <Ionicons name="add" size={32} color="#000" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    controlsContainer: {
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingBottom: 16,
    },
    searchRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    searchInput: {
        flex: 1,
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 12,
        marginLeft: 8,
        paddingVertical: 12,
    },
    calendarButton: {
        width: 48,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterContainer: {
        height: 32,
        justifyContent: 'center',
    },
    filterScroll: {
        paddingHorizontal: 20,
        alignItems: 'center',
        gap: 12,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    filterChipActive: {
        borderBottomColor: theme.colors.primary,
    },
    filterText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 12,
        letterSpacing: 1,
    },
    filterTextActive: {
        color: theme.colors.primary,
    },
    feedContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        gap: 16,
    },
    eventContainer: {
        width: '100%',
        height: 400,
        borderRadius: 4,
        overflow: 'hidden',
    },
    eventImage: {
        opacity: 0.7,
    },
    eventOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'space-between',
        padding: 20,
    },
    eventHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    dateBadge: {
        alignItems: 'center',
    },
    dateText: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 14,
        lineHeight: 18,
        textAlign: 'center',
    },
    statusBadge: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 2,
    },
    statusBadgeSoldOut: {
        backgroundColor: '#333333',
    },
    statusText: {
        color: '#000',
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 10,
        letterSpacing: 1,
    },
    statusTextSoldOut: {
        color: theme.colors.textSecondary,
    },
    eventFooterArea: {
        width: '100%',
    },
    eventTitle: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 28,
        marginBottom: 8,
        letterSpacing: 1,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    techDataRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    techDataText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 11,
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    fab: {
        position: 'absolute',
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    internationalActsSection: {
        marginBottom: 24,
        marginTop: 8,
    },
    internationalActsDivider: {
        width: 100,
        height: 2,
        backgroundColor: '#fff',
        marginBottom: 12,
    },
    internationalActsHeader: {
        color: '#fff',
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 24,
        textTransform: 'uppercase',
        marginBottom: 16,
        lineHeight: 28,
        letterSpacing: 1,
    },
    internationalActsScroll: {
        gap: 12,
        paddingRight: 16,
    },
    internationalActCard: {
        width: 200,
        alignItems: 'flex-start',
    },
    internationalActImage: {
        width: 200,
        height: 160,
        backgroundColor: '#222',
        borderWidth: 1,
        borderColor: '#333',
    },
    internationalActName: {
        color: '#fff',
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: 14,
        marginTop: 8,
        textAlign: 'left',
    },
});
