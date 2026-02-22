"use client";

import { useEffect, useState } from "react";
import { levelProgress, xpInCurrentLevel, xpToNextLevel, XP_PER_LEVEL } from "@/lib/progression";

interface XPProgressBarProps {
    totalXp: number;
    level: number;
    animated?: boolean;
    showLabel?: boolean;
    size?: "sm" | "md" | "lg";
}

export default function XPProgressBar({
    totalXp,
    level,
    animated = true,
    showLabel = true,
    size = "md",
}: XPProgressBarProps) {
    const [displayProgress, setDisplayProgress] = useState(0);
    const progress = levelProgress(totalXp);
    const currentXp = xpInCurrentLevel(totalXp);
    const remaining = xpToNextLevel(totalXp);

    useEffect(() => {
        if (!animated) {
            setDisplayProgress(progress);
            return;
        }
        const timeout = setTimeout(() => setDisplayProgress(progress), 100);
        return () => clearTimeout(timeout);
    }, [progress, animated]);

    const heights = { sm: "h-1.5", md: "h-2", lg: "h-3" };
    const barHeight = heights[size];

    return (
        <div className="w-full">
            {showLabel && (
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[var(--text-secondary)]">
                            Level {level}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                            {currentXp} / {XP_PER_LEVEL} XP
                        </span>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)]">
                        {remaining} XP to next
                    </span>
                </div>
            )}

            <div
                className={`w-full ${barHeight} rounded-full bg-[var(--bg-hover)] overflow-hidden relative`}
            >
                {/* Track glow */}
                <div
                    className="absolute inset-0 opacity-20 rounded-full"
                    style={{
                        background: `linear-gradient(90deg, transparent, var(--accent-primary) ${displayProgress}%, transparent ${displayProgress + 5}%)`,
                    }}
                />

                {/* Fill bar */}
                <div
                    className="h-full rounded-full relative overflow-hidden"
                    style={{
                        width: `${displayProgress}%`,
                        background: "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))",
                        transition: animated ? "width 800ms cubic-bezier(0.34, 1.56, 0.64, 1)" : "none",
                    }}
                >
                    {/* Shimmer effect */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
                            backgroundSize: "200% 100%",
                            animation: "shimmer 2s ease-in-out infinite",
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
