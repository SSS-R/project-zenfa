"use client";

import dynamic from 'next/dynamic';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
    ssr: false,
    loading: () => (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-0">
            <div className="w-8 h-8 rounded-full border-4 border-neutral-800 border-t-[#4f9e97] animate-spin"></div>
        </div>
    ),
});

export default function SplineBackground() {
    return (
        <div className="absolute inset-0 z-0 bg-black overflow-hidden pointer-events-none">
            <Spline scene="/spline.spiral.splinecode" />
            {/* Subtle overlay gradients for depth, if needed */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
        </div>
    );
}
