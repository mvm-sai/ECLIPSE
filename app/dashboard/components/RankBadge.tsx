"use client";

import { memo } from "react";
import { rankForLevel, RANK_TIERS } from "@/lib/progression";

interface RankBadgeProps {
    level: number;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
}

export default memo(function RankBadge({
    level,
    size = "md",
    showLabel = true,
}: RankBadgeProps) {
    const rank = rankForLevel(level);
    const tierIndex = RANK_TIERS.findIndex((t) => t.name === rank.name);
    const nextTier = RANK_TIERS[tierIndex + 1];

    const sizes = {
        sm: { badge: "w-8 h-8", icon: "text-sm", text: "text-xs" },
        md: { badge: "w-11 h-11", icon: "text-lg", text: "text-sm" },
        lg: { badge: "w-14 h-14", icon: "text-2xl", text: "text-base" },
    };

    const s = sizes[size];

    return (
        <div className="flex items-center gap-3">
            {/* Badge circle */}
            <div
                className={`${s.badge} rounded-xl flex items-center justify-center relative`}
                style={{
                    background: `linear-gradient(135deg, ${rank.color}20, ${rank.color}08)`,
                    border: `1px solid ${rank.color}30`,
                    boxShadow: `0 0 20px ${rank.color}10`,
                }}
            >
                <span className={s.icon} style={{ color: rank.color }}>
                    {rank.icon}
                </span>

                {/* Subtle pulse ring on higher tiers */}
                {tierIndex >= 2 && (
                    <div
                        className="absolute inset-0 rounded-xl animate-pulse-glow"
                        style={{
                            boxShadow: `0 0 12px ${rank.color}15`,
                        }}
                    />
                )}
            </div>

            {/* Label */}
            {showLabel && (
                <div className="min-w-0">
                    <p
                        className={`${s.text} font-semibold leading-tight`}
                        style={{ color: rank.color }}
                    >
                        {rank.name}
                    </p>
                    {nextTier && (
                        <p className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5">
                            Level {nextTier.minLevel} for {nextTier.name}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
});
