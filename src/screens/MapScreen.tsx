import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { theme } from '../theme';
import { GlassmorphismView } from '../components/GlassmorphismView';
import { GoldButton } from '../components/GoldButton';
import { DateTimePicker } from '../components/DateTimePicker';
import { supabase } from '../lib/supabase';

type MapScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export interface TableData {
    id: string;
    table_number: string;
    capacity: number;
    coordinate_data: { x: number; y: number; z: number };
    status?: 'available' | 'booked'; // Tracked via bookings
}

export const MapScreen = () => {
    const navigation = useNavigation<MapScreenNavigationProp>();
    const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
    const [tables, setTables] = useState<TableData[]>([]);
    const [loading, setLoading] = useState(true);

    // Booking Flow State
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [bookingDate, setBookingDate] = useState<string | null>(null);
    const [bookingTime, setBookingTime] = useState<string | null>(null);

    useEffect(() => {
        fetchTables();

        const subscription = supabase
            .channel('public:tables')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, payload => {
                fetchTables();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const fetchTables = async () => {
        const { data, error } = await supabase.from('tables').select('*');
        if (data) {
            const mappedTables = data.map(t => ({
                ...t,
                status: 'available',
            })) as TableData[];
            // Sort by table number for better display
            mappedTables.sort((a, b) => a.table_number.localeCompare(b.table_number));
            setTables(mappedTables);
        }
        setLoading(false);
    };

    const handleTableSelect = (table: TableData) => {
        setSelectedTable(table);
        // Reset date/time when selecting a new table
        setBookingDate(null);
        setBookingTime(null);
    };

    const handleDateConfirm = (date: string, time: string) => {
        setBookingDate(date);
        setBookingTime(time);
        setDatePickerVisible(false);
    };

    const openBottleMenu = () => {
        // Placeholder link to a PDF menu
        Linking.openURL('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
    };

    const handleProceedToCheckout = () => {
        if (!selectedTable || !bookingDate || !bookingTime) return;

        navigation.navigate('Checkout', {
            tableNumber: selectedTable.table_number,
            capacity: selectedTable.capacity || 6,
            date: bookingDate,
            time: bookingTime,
            minSpend: 2000 // In a real app, this comes from the table data
        });
    };

    const renderTableItem = ({ item }: { item: TableData }) => {
        const isSelected = selectedTable?.id === item.id;
        return (
            <TouchableOpacity
                style={[
                    styles.tableButton,
                    isSelected && styles.tableButtonSelected
                ]}
                onPress={() => handleTableSelect(item)}
            >
                <GlassmorphismView neonBorder={isSelected} style={styles.tableCard}>
                    <Text style={styles.tableNumber}>{item.table_number}</Text>
                    <Text style={styles.tableCapacity}>{item.capacity} Pax</Text>
                </GlassmorphismView>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>CLUB LAYOUT</Text>
                <Text style={styles.headerSubtitle}>Select a table to book</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={tables}
                    keyExtractor={(item) => item.id}
                    renderItem={renderTableItem}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.row}
                />
            )}

            {/* Overlay Booking Information (Sticky Footer) */}
            {selectedTable && (
                <View style={styles.stickyFooterContainer}>
                    <View style={styles.stickyFooterContent}>
                        <View style={styles.overlayHeader}>
                            <View>
                                <Text style={styles.heading}>TABLE {selectedTable.table_number.toUpperCase()}</Text>
                                <Text style={styles.subtitle}>PRIVATE VIP AREA • {selectedTable.capacity || 6} PAX</Text>
                                {bookingDate && bookingTime && (
                                    <Text style={styles.timeLine}>{bookingDate} @ {bookingTime}</Text>
                                )}
                            </View>
                            <TouchableOpacity onPress={() => setSelectedTable(null)}>
                                <Text style={styles.cancelText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.price}>RM 2,000.00</Text>

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.menuGhostButton} onPress={openBottleMenu}>
                                <Text style={styles.menuGhostText}>VIEW BOTTLE MENU</Text>
                            </TouchableOpacity>

                            {(!bookingDate || !bookingTime) ? (
                                <GoldButton
                                    title="SELECT DATE & TIME"
                                    onPress={() => setDatePickerVisible(true)}
                                    style={styles.flexButton}
                                />
                            ) : (
                                <GoldButton
                                    title="PROCEED TO CHECKOUT"
                                    onPress={handleProceedToCheckout}
                                    style={styles.flexButton}
                                />
                            )}
                        </View>
                    </View>
                </View>
            )}

            <DateTimePicker
                visible={isDatePickerVisible}
                onClose={() => setDatePickerVisible(false)}
                onConfirm={handleDateConfirm}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        padding: 24,
        paddingTop: 48,
        backgroundColor: 'rgba(10, 10, 10, 0.8)',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerTitle: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.heading,
        fontSize: 28,
        letterSpacing: 2,
    },
    headerSubtitle: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: 14,
        marginTop: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100, // Space for overlay
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    tableButton: {
        flex: 1,
        marginHorizontal: 8,
    },
    tableButtonSelected: {
        transform: [{ scale: 1.05 }],
    },
    tableCard: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
    },
    tableNumber: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.heading,
        fontSize: 24,
        marginBottom: 8,
    },
    tableCapacity: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 14,
    },
    stickyFooterContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.backgroundSecondary,
        borderTopWidth: 1,
        borderTopColor: theme.colors.primary,
        paddingBottom: 24, // extra padding for safe area
    },
    stickyFooterContent: {
        padding: 24,
    },
    overlayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    heading: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.heading,
        fontSize: 24,
        marginBottom: 4,
        letterSpacing: 1,
    },
    subtitle: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 12,
        letterSpacing: 1,
    },
    price: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.heading,
        fontSize: 32,
        marginBottom: 20,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    flexButton: {
        flex: 1,
    },
    menuGhostButton: {
        flex: 0.8,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuGhostText: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 10,
        letterSpacing: 0.5,
    },
    timeLine: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 14,
        marginTop: 8,
    },
    cancelText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.heading,
        fontSize: 20,
        padding: 4,
    }
});
