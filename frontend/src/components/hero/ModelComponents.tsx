"use client";

import { useGLTF } from "@react-three/drei";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Preload models to prevent pop-in
useGLTF.preload("/models/geforce_rtx_3080_graphics_card.glb");
useGLTF.preload("/models/kingston_hyperx_fury_black_ram_module.glb");
useGLTF.preload("/models/intel_core_i9_12900k.glb");
useGLTF.preload("/models/gigabyte_trx40_aorus_xtreme.glb");

// Helper to center and normalize models
function ModelWrapper({ children, scale = 1, rotation = [0, 0, 0], opacity = 1 }: any) {
    const ref = useRef<THREE.Group>(null);

    // Appear everything to the right of x=0
    // Normal (1, 0, 0) means the plane faces right, keeping right side visible, culling left.
    const clipPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(1, 0, 0), 0), []);

    useFrame((state) => {
        if (ref.current) {
            // Slow rotation for the 3D visual effect
            ref.current.rotation.y += 0.01;
            ref.current.rotation.x += 0.005;

            // Apply opacity and clipping planes
            ref.current.traverse((child: any) => {
                if (child.isMesh && child.material) {
                    child.material.transparent = true;
                    child.material.opacity = opacity;
                    child.material.clippingPlanes = [clipPlane];
                    child.material.needsUpdate = true;
                }
            });
        }
    });

    return (
        <group ref={ref} rotation={rotation} scale={scale}>
            {children}
        </group>
    );
}

export function GLTF_GPU({ opacity = 1 }: { opacity?: number }) {
    const { scene } = useGLTF("/models/geforce_rtx_3080_graphics_card.glb");
    const clone = useMemo(() => scene.clone(), [scene]);

    return (
        <ModelWrapper scale={0.08} opacity={opacity} rotation={[0, Math.PI / 2, 0]}>
            <primitive object={clone} />
        </ModelWrapper>
    );
}

export function GLTF_RAM({ opacity = 1 }: { opacity?: number }) {
    const { scene } = useGLTF("/models/kingston_hyperx_fury_black_ram_module.glb");
    const clone = useMemo(() => scene.clone(), [scene]);

    return (
        <ModelWrapper scale={0.3} opacity={opacity} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
            <primitive object={clone} />
        </ModelWrapper>
    );
}

export function GLTF_CPU({ opacity = 1 }: { opacity?: number }) {
    const { scene } = useGLTF("/models/intel_core_i9_12900k.glb");
    const clone = useMemo(() => scene.clone(), [scene]);

    return (
        <ModelWrapper scale={8} opacity={opacity} rotation={[Math.PI / 2, 0, 0]}>
            <primitive object={clone} />
        </ModelWrapper>
    );
}

export function GLTF_Motherboard({ opacity = 1 }: { opacity?: number }) {
    const { scene } = useGLTF("/models/gigabyte_trx40_aorus_xtreme.glb");
    const clone = useMemo(() => scene.clone(), [scene]);

    return (
        <ModelWrapper scale={0.4} opacity={opacity} rotation={[Math.PI / 4, 0, 0]}>
            <primitive object={clone} />
        </ModelWrapper>
    );
}
