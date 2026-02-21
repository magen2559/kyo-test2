import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../theme';
import { GlassmorphismView } from './GlassmorphismView';
import { GoldButton } from './GoldButton';

interface DateTimePickerProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (date: string, time: string) => void;
}

const DATES = ['Today', 'Tomorrow', 'Oct 24', 'Oct 25', 'Oct 31', 'Nov 01'];
const TIMES = ['10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM', '12:00 AM', '12:30 AM'];

export const DateTimePicker: React.FC<DateTimePickerProps> = ({ visible, onClose, onConfirm }) => {
    const [selectedDate, setSelectedDate] = useState(DATES[0]);
    const [selectedTime, setSelectedTime] = useState(TIMES[0]);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <GlassmorphismView neonBorder style={styles.modalView}>
                    <View style={styles.header}>
                        <Text style={styles.title}>SELECT ARRIVAL</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.sectionLabel}>DATE</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
                        {DATES.map((date) => (
                            <TouchableOpacity
                                key={date}
                                style={[styles.pill, selectedDate === date && styles.pillActive]}
                                onPress={() => setSelectedDate(date)}
                            >
                                <Text style={[styles.pillText, selectedDate === date && styles.pillTextActive]}>
                                    {date.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text style={styles.sectionLabel}>TIME</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
                        {TIMES.map((time) => (
                            <TouchableOpacity
                                key={time}
                                style={[styles.pill, selectedTime === time && styles.pillActive]}
                                onPress={() => setSelectedTime(time)}
                            >
                                <Text style={[styles.pillText, selectedTime === time && styles.pillTextActive]}>
                                    {time.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <GoldButton
                        title="CONFIRM ARRIVAL"
                        onPress={() => onConfirm(selectedDate, selectedTime)}
                        style={styles.confirmButton}
                    />
                </GlassmorphismView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalView: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        paddingBottom: 40,
        backgroundColor: theme.colors.backgroundSecondary,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.heading,
        fontSize: 20,
        letterSpacing: 2,
    },
    closeText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.heading,
        fontSize: 24,
        padding: 4,
    },
    sectionLabel: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 12,
        letterSpacing: 2,
        marginBottom: 12,
    },
    scrollRow: {
        flexGrow: 0,
        marginBottom: 24,
    },
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginRight: 12,
        backgroundColor: 'transparent',
    },
    pillActive: {
        backgroundColor: theme.colors.primary,
    },
    pillText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.monospace,
        fontSize: 14,
    },
    pillTextActive: {
        color: '#000',
        fontFamily: theme.typography.fontFamily.bold,
    },
    confirmButton: {
        marginTop: 16,
    }
});
