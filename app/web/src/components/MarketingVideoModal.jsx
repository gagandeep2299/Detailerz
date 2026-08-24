import React from 'react';
import { X } from 'lucide-react';
import MarketingVideoPlayer from './MarketingVideoPlayer';

export default function MarketingVideoModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-white/20 bg-black shadow-2xl">
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white/80 backdrop-blur transition hover:bg-white/20 hover:text-white"
                    aria-label="Close Video"
                >
                    <X className="h-5 w-5" />
                </button>

                <MarketingVideoPlayer autoPlay={true} />
            </div>
        </div>
    );
}
