import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Linking, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { theme } from '../theme';
import { GlassmorphismView } from '../components/GlassmorphismView';
import { GoldButton } from '../components/GoldButton';
import { DateTimePicker } from '../components/DateTimePicker';
// import { supabase } from '../lib/supabase'; // Removed Supabase

type MapScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export interface TableData {
    id: string;
    table_number: string;
    capacity: number;
    min_spend: number;
    color: string;
    category: string;
}

const HARDCODED_TABLES: TableData[] = [
    // Standing Tables (Yellow) - 6 pax, RM1000
    ...Array.from({ length: 10 }).map((_, i) => ({
        id: `ST${i + 1}`, table_number: `ST${i + 1}`, capacity: 6, min_spend: 1000, color: '#FFD700', category: 'STANDING TABLE'
    })),
    // A-Section (Red) - 8 pax, RM1500
    ...Array.from({ length: 7 }).map((_, i) => ({
        id: `A${i + 1}`, table_number: `A${i + 1}`, capacity: 8, min_spend: 1500, color: '#FF4C4C', category: 'A-SECTION'
    })),
    // B1-B7 Section (Purple) - 10 pax, RM3000
    ...Array.from({ length: 7 }).map((_, i) => ({
        id: `B${i + 1}`, table_number: `B${i + 1}`, capacity: 10, min_spend: 3000, color: '#8A2BE2', category: 'B1-B7 SECTION'
    })),
    // B8-B9 Section (Green) - 10 pax, RM4000
    ...Array.from({ length: 2 }).map((_, i) => ({
        id: `B${i + 8}`, table_number: `B${i + 8}`, capacity: 10, min_spend: 4000, color: '#32CD32', category: 'B8-B9 SECTION'
    })),
    // C1-C3 Section (Green) - 10 pax, RM4000
    ...Array.from({ length: 3 }).map((_, i) => ({
        id: `C${i + 1}`, table_number: `C${i + 1}`, capacity: 10, min_spend: 4000, color: '#32CD32', category: 'C1-C3 SECTION'
    })),
    // HS1-HS2 Hot Seat (Green) - 10 pax, RM4000
    ...Array.from({ length: 2 }).map((_, i) => ({
        id: `HS${i + 1}`, table_number: `HS${i + 1}`, capacity: 10, min_spend: 4000, color: '#32CD32', category: 'HOT SEAT'
    })),
    // DJ1-DJ3 (Sofa) (Orange) - 8 pax, RM6000
    ...Array.from({ length: 3 }).map((_, i) => ({
        id: `DJ${i + 1}`, table_number: `DJ${i + 1}`, capacity: 8, min_spend: 6000, color: '#FF8C00', category: 'DJ SOFA'
    })),
];

export const MapScreen = () => {
    const navigation = useNavigation<MapScreenNavigationProp>();
    const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

    // Group tables by category
    const groupedTables = React.useMemo(() => {
        const groups = HARDCODED_TABLES.reduce((acc, table) => {
            if (!acc[table.category]) {
                acc[table.category] = {
                    category: table.category,
                    color: table.color,
                    min_spend: table.min_spend,
                    tables: [],
                };
            }
            acc[table.category].tables.push(table);
            return acc;
        }, {} as Record<string, { category: string; color: string; min_spend: number; tables: TableData[] }>);
        return Object.values(groups);
    }, []);

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    // Booking Flow State
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [bookingDate, setBookingDate] = useState<string | null>(null);
    const [bookingTime, setBookingTime] = useState<string | null>(null);

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
        // Updated to user's provided Google Drive PDF
        Linking.openURL('https://drive.google.com/file/d/1tyH7juVUPKy1jiXpth2e9nP2GZ0uVkB9/view?usp=sharing');
    };

    const handleProceedToCheckout = () => {
        if (!selectedTable || !bookingDate || !bookingTime) return;

        navigation.navigate('Checkout', {
            tableNumber: selectedTable.table_number,
            capacity: selectedTable.capacity || 6,
            date: bookingDate,
            time: bookingTime,
            minSpend: selectedTable.min_spend
        });
    };

    const renderTableCategory = ({ item }: { item: typeof groupedTables[0] }) => {
        const isExpanded = expandedCategories.includes(item.category);

        return (
            <View style={styles.categoryContainer}>
                <TouchableOpacity
                    style={[styles.categoryHeader, isExpanded && styles.categoryHeaderExpanded]}
                    onPress={() => toggleCategory(item.category)}
                >
                    <View style={styles.categoryHeaderLeft}>
                        <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
                        <View>
                            <Text style={styles.categoryTitle}>{item.category}</Text>
                            <Text style={styles.categorySubTitle}>MIN SPEND RM {item.min_spend}</Text>
                        </View>
                    </View>
                    <Text style={styles.expandIcon}>{isExpanded ? '−' : '+'}</Text>
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.tablesGrid}>
                        {item.tables.map(table => {
                            const isSelected = selectedTable?.id === table.id;
                            return (
                                <TouchableOpacity
                                    key={table.id}
                                    style={[
                                        styles.tableButton,
                                        isSelected && styles.tableButtonSelected
                                    ]}
                                    onPress={() => handleTableSelect(table)}
                                >
                                    <GlassmorphismView neonBorder={isSelected} style={[styles.tableCard, { borderColor: table.color, borderWidth: isSelected ? 2 : 1 }]}>
                                        <Text style={[styles.tableNumber, { color: table.color }]}>{table.table_number}</Text>
                                        <Text style={styles.tableCapacity}>{table.capacity} Pax</Text>
                                    </GlassmorphismView>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </View>
        );
    };

    const renderFooter = () => (
        <View style={styles.footerCTA}>
            <Text style={styles.footerCTAText}>Any Queries ?</Text>
            <TouchableOpacity
                onPress={() => Linking.openURL('https://linktr.ee/kyokl?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQPNTY3MDY3MzQzMzUyNDI3AAGnEnLVPmSlrO1kQ1Ep1F56yEc1HJ_n69qTj69sHVBl5XyK5NNTRImov6slAps_aem_N69EYwzncuOsYGlHB3KD9A')}
                activeOpacity={0.7}
            >
                <Text style={styles.footerLinkText}>Click link and KO with us</Text>
            </TouchableOpacity>
        </View>
    );

    const renderHeader = () => (
        <>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>RESERVE A TABLE</Text>
                <Text style={styles.headerSubtitle}>Select a table and choose your VIP experience</Text>
            </View>
            <View style={styles.mapContainer}>
                <Image
                    source={require('../../assets/vip-map.jpg.jpeg')}
                    style={styles.mapImage}
                    resizeMode="contain"
                />
            </View>
        </>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={groupedTables}
                keyExtractor={(item) => item.category}
                renderItem={renderTableCategory}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                contentContainerStyle={styles.listContent}
            />

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

                        <Text style={[styles.price, { color: selectedTable.color }]}>
                            RM {selectedTable.min_spend.toLocaleString()}.00 <Text style={styles.minSpendLabel}>MIN SPEND</Text>
                        </Text>

                        <View style={styles.actionRow}>
                            <GoldButton
                                title="VIEW MENU"
                                onPress={openBottleMenu}
                                style={styles.flexButton}
                            />

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
    categoryContainer: {
        marginBottom: 16,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    categoryHeaderExpanded: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottomWidth: 0,
    },
    categoryHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    colorIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    categoryTitle: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.heading,
        fontSize: 18,
        letterSpacing: 1,
    },
    categorySubTitle: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 10,
        marginTop: 2,
    },
    expandIcon: {
        color: theme.colors.primary,
        fontSize: 24,
        fontFamily: theme.typography.fontFamily.regular,
    },
    tablesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: 'rgba(10, 10, 10, 0.5)',
        padding: 16,
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: theme.colors.border,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        gap: 12,
        justifyContent: 'flex-start',
    },
    tableButton: {
        width: '30%', // roughly 3 columns with gap
    },
    tableButtonSelected: {
        transform: [{ scale: 1.05 }],
    },
    tableCard: {
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 80,
    },
    tableNumber: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.heading,
        fontSize: 18,
        marginBottom: 4,
    },
    tableCapacity: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 10,
    },
    mapContainer: {
        width: '100%',
        height: 250,
        backgroundColor: '#111',
        marginBottom: 16,
    },
    mapImage: {
        width: '100%',
        height: '100%',
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
    minSpendLabel: {
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    flexButton: {
        flex: 1,
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
    },
    footerCTA: {
        alignItems: 'center',
        paddingVertical: 32,
        marginTop: 16,
    },
    footerCTAText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 14,
    },
    footerLinkText: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 16,
        marginTop: 8,
        textDecorationLine: 'underline',
    },
});
