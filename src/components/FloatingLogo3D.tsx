import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

export const FloatingLogo3D = () => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.5;
            meshRef.current.rotation.x += delta * 0.2;
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
        }
    });

    return (
        <mesh ref={meshRef}>
            {/* Using a rough geometric "K" or abstract crystal shape */}
            <octahedronGeometry args={[1.5, 0]} />
            <meshStandardMaterial
                color="#CBA358"
                metalness={0.8}
                roughness={0.2}
                wireframe={false}
            />
        </mesh>
    );
};
