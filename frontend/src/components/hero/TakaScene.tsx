"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Sparkles } from "@react-three/drei";
import {
    EnergyBeam,
    EmberParticles,
    TakaSymbol
} from "./AnimatedComponents";
import { GLTF_GPU, GLTF_RAM, GLTF_CPU, GLTF_Motherboard } from "./ModelComponents";

const LOOP_DISTANCE = 30; // -15 to +15

export default function TakaScene() {
    return (
        <group>
            {/* Central Energy Beam - The "Scanner" */}
            <EnergyBeam />
            <EmberParticles count={250} />

            {/* Global Sparkles for depth */}
            <Sparkles count={50} scale={15} size={2} speed={0.4} opacity={0.3} noise={0.2} color="#4f9e97" />

            {/* Fixed Loop Items */}
            <LoopItem offset={0} ItemComponent={GLTF_GPU} />
            <LoopItem offset={7.5} ItemComponent={GLTF_RAM} />
            <LoopItem offset={15} ItemComponent={GLTF_CPU} />
            <LoopItem offset={22.5} ItemComponent={GLTF_Motherboard} />
        </group>
    );
}

function LoopItem({ offset, ItemComponent }: { offset: number; ItemComponent: any }) {
    const groupRef = useRef<THREE.Group>(null);
    const speed = 2.0;

    useFrame((state) => {
        if (!groupRef.current) return;

        // Calculate a perfectly smooth loop from -15 to +15
        const time = state.clock.elapsedTime;
        let x = ((time * speed + offset) % LOOP_DISTANCE);

        // Handle negative modulo correctly in JS
        if (x < 0) x += LOOP_DISTANCE;

        x -= (LOOP_DISTANCE / 2); // Shift to target range [-15, 15]

        groupRef.current.position.x = x;
        // Strict horizontal movement - No Y or Z drift
        groupRef.current.position.y = 0;
        groupRef.current.position.z = 0;
    });

    return (
        <group ref={groupRef}>
            {/* Left side (Taka) will be clipped when x > 0 by its own material */}
            <group>
                <TakaSymbol position={[0, 0, 0]} scale={0.8} />
                {/* Trail of extra coins to make a "busy line" */}
                <TakaSymbol position={[-2, 0, 0]} scale={0.8} />
                <TakaSymbol position={[-4, 0, 0]} scale={0.8} />
                <TakaSymbol position={[-6, 0, 0]} scale={0.8} />
            </group>

            {/* Right side (Component) will be clipped when x < 0 by its own material */}
            <group>
                <ItemComponent opacity={1} />
            </group>
        </group>
    );
}
