"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
    {
        id: 1,
        quote: "I built a full gaming rig in under 2 minutes. Every part was compatible and the prices were the lowest I found anywhere.",
        name: "Rafid A.",
        location: "Dhaka",
        rating: 5
    },
    {
        id: 2,
        quote: "Never thought AI could pick better parts than I could. The score breakdown and trade-off explanations are seriously impressive.",
        name: "Tanha S.",
        location: "Chittagong",
        rating: 5
    },
    {
        id: 3,
        quote: "Saved me ৳5,000 compared to what the shop guy at IDB quoted me. Showed him the PDF and he matched the price.",
        name: "Mahir K.",
        location: "Sylhet",
        rating: 5
    },
    {
        id: 4,
        quote: "Best part? I had no idea what RAM to pick. The AI explained why it chose DDR5 instead of DDR4 for my use case.",
        name: "Nusrat J.",
        location: "Rajshahi",
        rating: 5
    }
];

export function Testimonials() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    return (
        <section className="py-24 bg-black relative z-10 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        What Builders Are Saying
                    </h2>
                </motion.div>

                <div className="relative max-w-5xl mx-auto">
                    {/* Controls - Desktop */}
                    <button
                        onClick={prevSlide}
                        className="hidden md:flex absolute -left-16 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/50 text-white hover:bg-[#4f9e97]/20 hover:text-[#4f9e97] hover:border-[#4f9e97]/50 transition-all z-20"
                        aria-label="Previous testimonial"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <button
                        onClick={nextSlide}
                        className="hidden md:flex absolute -right-16 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/50 text-white hover:bg-[#4f9e97]/20 hover:text-[#4f9e97] hover:border-[#4f9e97]/50 transition-all z-20"
                        aria-label="Next testimonial"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Cards Container */}
                    <div className="overflow-hidden px-4 md:px-0 py-8">
                        <motion.div
                            className="flex gap-6"
                            initial={false}
                            animate={{ x: `calc(-${currentIndex * 100}% - ${currentIndex * 1.5}rem)` }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            {testimonials.map((t) => (
                                <div
                                    key={t.id}
                                    className="glass-card p-8 min-w-full md:min-w-[calc(50%-0.75rem)] lg:min-w-[calc(33.333%-1rem)] flex-shrink-0 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex gap-1 mb-6">
                                            {[...Array(t.rating)].map((_, i) => (
                                                <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                                            ))}
                                        </div>
                                        <p className="text-neutral-300 italic text-lg leading-relaxed mb-8">
                                            &quot;{t.quote}&quot;
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#4f9e97] to-neutral-800 flex items-center justify-center font-bold text-white shadow-inner">
                                            {t.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">{t.name}</div>
                                            <div className="text-neutral-500 text-sm">{t.location}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Pagination Dots */}
                    <div className="flex justify-center gap-3 mt-8">
                        {testimonials.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`transition-all duration-300 rounded-full ${currentIndex === idx
                                        ? "w-8 h-2.5 bg-[#4f9e97] shadow-[0_0_10px_rgba(79,158,151,0.5)]"
                                        : "w-2.5 h-2.5 bg-neutral-800 hover:bg-neutral-600"
                                    }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
