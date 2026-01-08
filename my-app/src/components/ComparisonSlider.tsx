"use client";
import { useState, useRef, useEffect } from "react";

interface Props {
    before: string;
    after: string;
}

export default function ComparisonSlider({ before, after }: Props) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = (event: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ("touches" in event ? event.touches[0].clientX : event.clientX) - rect.left;
        const position = Math.max(0, Math.min(100, (x / rect.width) * 100));

        setSliderPosition(position);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full select-none cursor-ew-resize group"
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={handleMove}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            onTouchMove={handleMove}
        >
            {/* Layer 1: The RESULT (With Checkerboard for transparency) */}
            <div className="absolute inset-0 w-full h-full bg-[url('https://res.cloudinary.com/dexdumfqy/image/upload/v1601664188/transparent-bg.jpg')] bg-repeat">
                {/* We put the processed image here */}
                <img src={after} alt="After" className="w-full h-full object-contain" />
            </div>

            {/* Layer 2: The ORIGINAL (Clipped by slider) */}
            <div
                className="absolute inset-0 h-full overflow-hidden bg-slate-900"
                style={{ width: `${sliderPosition}%` }}
            >
                <img src={before} alt="Before" className="w-full h-full object-contain object-left" style={{ width: `${10000 / sliderPosition}%` }} />

                {/* Label */}
                <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                    Original
                </div>
            </div>

            {/* Label for Result */}
            <div className="absolute top-4 right-4 bg-blue-600/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                Removed Background
            </div>

            {/* The Slider Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
