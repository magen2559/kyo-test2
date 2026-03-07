import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

export const VIPCard3D = () => {
    const meshRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (meshRef.current) {
            // Gentle floating and tilting
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
            meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
            meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.5) * 0.2;
        }
    });

    return (
        <group ref={meshRef}>
            {/* Main Card Body */}
            <mesh>
                <boxGeometry args={[3.2, 2.0, 0.05]} />
                <meshStandardMaterial
                    color="#111111"
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>
            {/* Gold Trim/Edge */}
            <mesh position={[0, 0, -0.01]}>
                <boxGeometry args={[3.25, 2.05, 0.04]} />
                <meshStandardMaterial color="#CBA358" metalness={1} roughness={0.2} />
            </mesh>
            {/* Simulate a magnetic strip or chip on the back */}
            <mesh position={[0, 0.5, -0.035]}>
                <boxGeometry args={[3.2, 0.3, 0.02]} />
                <meshStandardMaterial color="#000000" roughness={0.8} />
            </mesh>
        </group>
    );
};
