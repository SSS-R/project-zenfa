"use client";

import { useState } from 'react';
import Spline from '@splinetool/react-spline';
export default function SplineBackground() {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className="absolute inset-0 z-0 bg-black overflow-hidden pointer-events-none">
            {/* Loading Spinner */}
            <div
                className={`absolute inset-0 flex items-center justify-center bg-black transition-opacity duration-1000 z-10 ${isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
                <div className="w-8 h-8 rounded-full border-4 border-neutral-800 border-t-[#4f9e97] animate-spin"></div>
            </div>

            {/* Spline Object */}
            <div className={`transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                <Spline
                    scene="/spline.spiral.splinecode"
                    onLoad={() => setIsLoaded(true)}
                />
            </div>

            {/* Subtle overlay gradients for depth, if needed */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
        </div>
    );
}
