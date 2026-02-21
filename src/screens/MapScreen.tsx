import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { theme } from '../theme';
import { GlassmorphismView } from '../components/GlassmorphismView';
import { supabase } from '../lib/supabase';

export interface TableData {
    id: string;
    table_number: string;
    capacity: number;
    coordinate_data: { x: number; y: number; z: number };
    status?: 'available' | 'booked'; // Tracked via bookings
}

export const MapScreen = () => {
    const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
    const [tables, setTables] = useState<TableData[]>([]);
    const [loading, setLoading] = useState(true);

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

            {/* Overlay Booking Information */}
            {selectedTable && (
                <View style={styles.overlayContainer}>
                    <GlassmorphismView neonBorder style={styles.overlayCard}>
                        <View style={styles.overlayHeader}>
                            <View>
                                <Text style={styles.heading}>TABLE {selectedTable.table_number.toUpperCase()}</Text>
                                <Text style={styles.subtitle}>Capacity: {selectedTable.capacity || 6} Pax</Text>
                            </View>
                            <TouchableOpacity onPress={() => setSelectedTable(null)}>
                                <Text style={styles.cancelText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.price}>Min Spend: RM 2,000</Text>

                        <TouchableOpacity style={styles.button}>
                            <Text style={styles.buttonText}>BOOK NOW</Text>
                        </TouchableOpacity>
                    </GlassmorphismView>
                </View>
            )}
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
    overlayContainer: {
        position: 'absolute',
        bottom: 24,
        left: 24,
        right: 24,
    },
    overlayCard: {
        padding: 20,
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
    },
    subtitle: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: 14,
    },
    price: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 18,
        marginBottom: 16,
    },
    button: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: theme.colors.background,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 14,
    },
    cancelText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.heading,
        fontSize: 20,
        padding: 4,
    }
});
