"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Center, Sparkles, useTexture } from "@react-three/drei";
import * as THREE from "three";

// ============== Energy Beam (Lightning Scanner) ==============
export function EnergyBeam() {
    const beamRef = useRef<THREE.Group>(null);
    const glowMatRef = useRef<THREE.ShaderMaterial>(null);
    const outerGlowMatRef = useRef<THREE.ShaderMaterial>(null);

    const numStrands = 25;

    // Generate geometries and properties for multiple strands
    const strands = useMemo(() => {
        return Array.from({ length: numStrands }).map((_, i) => {
            // Randomize properties for each strand to create chaotic overlap
            const thickness = 0.01 + Math.random() * 0.03; // thin strands between 0.01 and 0.04 thick
            const geo = new THREE.PlaneGeometry(thickness, 15, 1, 128); // high vertical segments for smooth jaggedness

            // Color distribution: 10% white, 50% soft teal, 40% standard teal
            let color = "#4f9e97"; // standard teal
            const rand = Math.random();
            if (rand < 0.1) {
                color = "#ffffff"; // pure white
            } else if (rand < 0.6) {
                color = "#88ffeb"; // soft teal
            }

            return {
                geo,
                thickness,
                speed: 10 + Math.random() * 20, // speed multiplier (10 to 30)
                amplitude: 0.05 + Math.random() * 0.15, // how wide the lightning strikes (0.05 to 0.2)
                offset: Math.random() * 1000, // random phase offset
                opacity: 0.3 + Math.random() * 0.6, // varied opacity
                color
            };
        });
    }, []);

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        // Deform vertices for all lightning strands
        strands.forEach(strand => {
            for (let i = 0; i < strand.geo.attributes.position.count; i++) {
                const y = strand.geo.attributes.position.getY(i);
                const isLeft = i % 2 === 0;

                // Combining multiple sine waves for chaotic high-frequency noise
                const noise =
                    (Math.sin(y * 8 + time * strand.speed * 0.8 + strand.offset) * strand.amplitude) +
                    (Math.sin(y * 22 - time * strand.speed * 1.5 + strand.offset * 2) * (strand.amplitude * 0.5)) +
                    (Math.sin(y * 45 + time * strand.speed * 2 + strand.offset * 3) * (strand.amplitude * 0.2));

                const baseX = isLeft ? -(strand.thickness / 2) : (strand.thickness / 2);
                strand.geo.attributes.position.setX(i, baseX + noise);
            }
            strand.geo.attributes.position.needsUpdate = true;
        });

        // Pulse the inner/outer glows
        if (glowMatRef.current) {
            glowMatRef.current.uniforms.opacity.value = 0.6 + Math.sin(time * 30) * 0.2;
        }
        if (outerGlowMatRef.current) {
            outerGlowMatRef.current.uniforms.opacity.value = 0.3 + Math.sin(time * 15) * 0.1;
        }
    });

    // Custom shader for a smooth horizontal gradient fade (center to edges)
    const createGradientShader = (colorHex: string) => {
        return new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(colorHex) },
                opacity: { value: 1.0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform float opacity;
                varying vec2 vUv;
                
                void main() {
                    // Distance from the horizontal center (0.5)
                    float distFromCenter = abs(vUv.x - 0.5) * 2.0; 
                    
                    // Fade out smoothly using smoothstep
                    float alpha = smoothstep(1.0, 0.0, distFromCenter) * opacity;
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });
    };

    const innerGlowShader = useMemo(() => createGradientShader("#4f9e97"), []);
    const outerGlowShader = useMemo(() => createGradientShader("#1a4d48"), []);

    return (
        <group ref={beamRef} position={[0, 0, 0]}>
            {/* Core Lightning Strands (Pure White with hint of Teal) */}
            {strands.map((strand, idx) => (
                <mesh key={idx} geometry={strand.geo}>
                    <meshBasicMaterial color={strand.color} transparent opacity={strand.opacity} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
                </mesh>
            ))}

            {/* Tight Inner Teal Glow */}
            <mesh position={[0, 0, -0.01]}>
                <planeGeometry args={[0.5, 15]} /> {/* Made slightly wider for better gradient */}
                <primitive object={innerGlowShader} ref={glowMatRef} attach="material" />
            </mesh>

            {/* Huge Diffuse Outer Aura */}
            <mesh position={[0, 0, -0.02]}>
                <planeGeometry args={[2.5, 15]} /> {/* Made slightly wider for better gradient */}
                <primitive object={outerGlowShader} ref={outerGlowMatRef} attach="material" />
            </mesh>

            {/* Dense starfield of ambient sparks near the beam */}
            <Sparkles count={400} scale={[0.8, 10, 2]} position={[0, 0, 0]} size={2} speed={3} opacity={0.6} color="#88ffeb" />
            <Sparkles count={200} scale={[0.1, 10, 2]} position={[0, 0, 0]} size={4} speed={5} opacity={1} color="#ffffff" />
        </group>
    );
}

// ============== Ember Particles (Sparks off the transformation) ==============
export function EmberParticles({ count = 300 }: { count?: number }) {
    const particlesRef = useRef<THREE.Points>(null);

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const velocities: number[] = [];

        for (let i = 0; i < count; i++) {
            // Start scattered slightly up and down the beam, not just exactly y=0
            positions[i * 3] = (Math.random() - 0.5) * 0.1;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 8; // Spread vertically
            positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;

            // Explode outwards and to the right
            velocities.push(
                Math.random() * 0.04 + 0.01, // Positive x velocity
                (Math.random() - 0.5) * 0.03,
                (Math.random() - 0.5) * 0.05
            );
        }

        return { positions, velocities };
    }, [count]);

    // Constants from TakaScene for perfect syncing
    const LOOP_DISTANCE = 30;
    const NUM_ITEMS = 4;
    const ITEM_SPACING = LOOP_DISTANCE / NUM_ITEMS; // 7.5

    useFrame((state) => {
        if (particlesRef.current) {
            const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
            const time = state.clock.elapsedTime;

            // Calculate if ANY item is currently crossing x=0
            // In TakaScene: x = ((time * speed + offset) % LOOP_DISTANCE) - (LOOP_DISTANCE/2)
            // Items are spaced by 7.5 units. An item crosses 0 when (time * speed) is a multiple of 7.5.
            const speed = 2.0;
            const phase = (time * speed) % ITEM_SPACING;

            // The item is at center exactly when phase is 0 (or ITEM_SPACING)
            const distToCenter = Math.min(phase, ITEM_SPACING - phase);

            // Trigger is active when an item is very close to the center
            const isTriggered = distToCenter < 1.0;

            for (let i = 0; i < count; i++) {
                // Normal particle movement
                positions[i * 3] += particles.velocities[i * 3];
                positions[i * 3 + 1] += particles.velocities[i * 3 + 1];
                positions[i * 3 + 2] += particles.velocities[i * 3 + 2];

                // Reset only if they travel too far right or up/down
                if (positions[i * 3] > 3 || Math.abs(positions[i * 3 + 1]) > 5) {

                    // Always respawn
                    positions[i * 3] = (Math.random() - 0.5) * 0.05;

                    if (isTriggered) {
                        // Spray tightly from the center (welding point)
                        positions[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
                    } else {
                        // Ambient spray across the beam
                        positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
                    }

                    positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
                }
            }

            particlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={particles.positions}
                    itemSize={3}
                    args={[particles.positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.03}
                color="#88ffeb"
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
                sizeAttenuation
            />
        </points>
    );
}

// ============== Taka Symbol (Currency) ==============
export function TakaSymbol({
    position,
    rotation = [0, 0, 0],
    scale = 1,
    opacity = 1
}: {
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
    opacity?: number;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const texture = useTexture("/taka_coin.png");

    // Disappear everything to the right of x=0
    // Normal (-1, 0, 0) means the plane faces left, keeping left side visible, culling right.
    const clipPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0), []);

    // Randomize starting rotation so coins don't look completely identical in a line
    const initialYRotation = useMemo(() => Math.random() * Math.PI, []);

    useFrame((state) => {
        if (groupRef.current) {
            // Rotate slowly around the Y axis for 3D depth
            groupRef.current.rotation.y += 0.015;
        }
    });

    return (
        <group position={position} rotation={rotation} scale={scale}>
            {/* Coin Mesh */}
            <mesh ref={groupRef as any} rotation={[Math.PI / 2, initialYRotation, 0]}>
                <cylinderGeometry args={[0.6, 0.6, 0.1, 64]} />
                <meshStandardMaterial
                    map={texture}
                    color="#ffffff"
                    metalness={0.8}
                    roughness={0.2}
                    transparent
                    opacity={opacity}
                    clippingPlanes={[clipPlane]}
                />
            </mesh>
        </group>
    );
}
