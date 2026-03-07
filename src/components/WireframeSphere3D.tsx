import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

export const WireframeSphere3D = () => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.3;
            meshRef.current.rotation.x += delta * 0.2;
        }
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[1.8, 16, 16]} />
            <meshStandardMaterial
                color="#00FFFF"
                wireframe={true}
                transparent={true}
                opacity={0.4}
                emissive="#00FFFF"
                emissiveIntensity={0.5}
            />
        </mesh>
    );
};
