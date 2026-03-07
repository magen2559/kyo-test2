import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { FloatingLogo3D } from './FloatingLogo3D';
import { VIPCard3D } from './VIPCard3D';
import { WireframeSphere3D } from './WireframeSphere3D';
import { theme } from '../theme';

export const Showcase3D = () => {
    const [activeDisplay, setActiveDisplay] = useState<'logo' | 'card' | 'sphere'>('card');

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>3D HIGHLIGHTS</Text>
            </View>

            <View style={styles.canvasContainer}>
                <Canvas camera={{ position: [0, 0, 5] }}>
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
                    <directionalLight position={[-10, 10, -10]} intensity={0.5} color="#CBA358" />
                    <pointLight position={[0, -5, 5]} intensity={0.5} color="#00FFFF" />

                    {activeDisplay === 'logo' && <FloatingLogo3D />}
                    {activeDisplay === 'card' && <VIPCard3D />}
                    {activeDisplay === 'sphere' && <WireframeSphere3D />}
                </Canvas>
            </View>

            <View style={styles.selector}>
                <TouchableOpacity onPress={() => setActiveDisplay('logo')} style={[styles.button, activeDisplay === 'logo' && styles.activeButton]}>
                    <Text style={[styles.buttonText, activeDisplay === 'logo' && styles.activeText]}>LOGO</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveDisplay('card')} style={[styles.button, activeDisplay === 'card' && styles.activeButton]}>
                    <Text style={[styles.buttonText, activeDisplay === 'card' && styles.activeText]}>VIP CARD</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveDisplay('sphere')} style={[styles.button, activeDisplay === 'sphere' && styles.activeButton]}>
                    <Text style={[styles.buttonText, activeDisplay === 'sphere' && styles.activeText]}>SPHERE</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 24,
        paddingHorizontal: 20,
    },
    header: {
        marginBottom: 16,
    },
    title: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 12,
        letterSpacing: 2,
    },
    canvasContainer: {
        width: '100%',
        height: 250,
        backgroundColor: '#0a0a0a',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1f1f1f',
        overflow: 'hidden',
    },
    selector: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginTop: 16,
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333',
        backgroundColor: 'transparent',
    },
    activeButton: {
        borderColor: theme.colors.primary,
        backgroundColor: 'rgba(203, 163, 88, 0.1)',
    },
    buttonText: {
        color: '#888',
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 10,
        letterSpacing: 1,
    },
    activeText: {
        color: theme.colors.primary,
    }
});
