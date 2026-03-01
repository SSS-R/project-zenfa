"use client";

export default function SplineBackground() {
    return (
        <div className="absolute inset-0 z-0 bg-black overflow-hidden pointer-events-none">
            {/* Video Background */}
            <div className="absolute inset-0 flex items-center justify-center">
                <video
                    src="/build-page-hero.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover object-center"
                />
            </div>

            {/* Subtle overlay gradients for depth, if needed */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
        </div>
    );
}
