"use client";

import Spline from '@splinetool/react-spline';

export default function SplineBackground() {
    return (
        <div className="absolute inset-0 z-0 bg-black overflow-hidden pointer-events-none">
            <Spline scene="/spline.spiral.splinecode" />
            {/* Subtle overlay gradients for depth, if needed */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
        </div>
    );
}
