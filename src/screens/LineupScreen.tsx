import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, EventItem } from '../navigation/RootNavigator';
import { theme } from '../theme';
import { GlassHeader } from '../components/GlassHeader';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

type LineupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

const FILTERS = ['ALL SESSIONS', 'TECHNO', 'INDUSTRIAL', 'HOUSE'];

export const LineupScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<LineupScreenNavigationProp>();

    const [activeFilter, setActiveFilter] = useState('ALL SESSIONS');
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
                        {event.status !== 'AVAILABLE' && (
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

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.textSecondary,
    },
    filterChipActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    filterText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 10,
        letterSpacing: 1,
    },
    filterTextActive: {
        color: '#000',
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
});
