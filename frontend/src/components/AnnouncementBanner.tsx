'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react';

export function AnnouncementBanner() {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [dismissed, setDismissed] = useState<string[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load dismissed IDs
        const saved = localStorage.getItem('dismissedAnnouncements');
        if (saved) {
            try {
                setDismissed(JSON.parse(saved));
            } catch (e) {
                console.error(e);
            }
        }

        // Fetch announcements
        const fetchAnnouncements = async () => {
            try {
                const res = await fetch('http://localhost:8001/announcements');
                if (res.ok) {
                    const data = await res.json();
                    setAnnouncements(data);
                }
            } catch (e) {
                console.error('Failed to load announcements', e);
            }
        };

        fetchAnnouncements();
    }, []);

    const dismiss = (id: string) => {
        const newDismissed = [...dismissed, id];
        setDismissed(newDismissed);
        localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
    };

    if (!mounted || announcements.length === 0) return null;

    // Filter out dismissed
    const activeAds = announcements.filter(a => !dismissed.includes(a.id));

    if (activeAds.length === 0) return null;

    return (
        <div className="w-full z-50 flex flex-col">
            {activeAds.map(ann => {
                let bgColor = 'bg-blue-600';
                let Icon = Info;

                if (ann.type === 'error') {
                    bgColor = 'bg-red-600';
                    Icon = XCircle;
                } else if (ann.type === 'warning') {
                    bgColor = 'bg-yellow-600';
                    Icon = AlertTriangle;
                } else if (ann.type === 'success') {
                    bgColor = 'bg-green-600';
                    Icon = CheckCircle;
                }

                return (
                    <div key={ann.id} className={`${bgColor} text-white px-4 py-2 flex items-center justify-center relative text-sm font-medium`}>
                        <div className="flex items-center gap-2 max-w-4xl w-full mx-auto justify-center px-8">
                            <Icon size={16} className="shrink-0" />
                            <span className="text-center">
                                {ann.title && <strong>{ann.title}: </strong>}
                                {ann.message}
                            </span>
                        </div>
                        <button
                            onClick={() => dismiss(ann.id)}
                            className="absolute right-4 hover:bg-white/20 p-1 rounded transition-colors"
                            aria-label="Dismiss"
                        >
                            <X size={16} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
