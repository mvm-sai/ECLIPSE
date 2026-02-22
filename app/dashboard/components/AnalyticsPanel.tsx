"use client";

import { useMemo } from "react";
import {
    generateMockSessions,
    computeHeatmap,
    computeXPTrend,
    computeDepthDistribution,
    computeTaskRatio,
    computeStreaks,
} from "@/lib/analytics";

/* ====================================================================
   ANALYTICS PANEL
   All charts rendered as lightweight inline SVGs - no external library.
   ==================================================================== */

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOUR_RANGE = Array.from({ length: 16 }, (_, i) => i + 6); // 6-21

export default function AnalyticsPanel() {
    const sessions = useMemo(() => generateMockSessions(30), []);
    const heatmap = useMemo(() => computeHeatmap(sessions), [sessions]);
    const xpTrend = useMemo(() => computeXPTrend(sessions, 30), [sessions]);
    const depthDist = useMemo(
        () => computeDepthDistribution(sessions),
        [sessions]
    );
    const ratio = useMemo(() => computeTaskRatio(sessions), [sessions]);
    const streaks = useMemo(() => computeStreaks(sessions, 30), [sessions]);

    // XP Trend chart bounds
    const maxXP = Math.max(...xpTrend.map((p) => p.xp), 1);
    const trendW = 500;
    const trendH = 120;

    function xpToY(xp: number): number {
        return trendH - (xp / maxXP) * (trendH - 10) - 5;
    }

    const trendPath = xpTrend
        .map((p, i) => {
            const x = (i / (xpTrend.length - 1)) * trendW;
            const y = xpToY(p.xp);
            return `${i === 0 ? "M" : "L"}${x},${y}`;
        })
        .join(" ");

    const trendAreaPath = `${trendPath} L${trendW},${trendH} L0,${trendH} Z`;

    // Ratio arc
    const bbPct = ratio.total > 0 ? ratio.brainBurner / ratio.total : 0.5;

    return (
        <div className="space-y-6">
            {/* Section header */}
            <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Analytics</h2>
                <span className="text-[11px] text-[var(--text-muted)]">Last 30 days</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ── Focus Heatmap ────────────────────────────────── */}
                <div className="glass-card-static p-5">
                    <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4">
                        Focus Heatmap
                    </h3>
                    <div className="overflow-x-auto">
                        <div className="min-w-[400px]">
                            {/* Day labels */}
                            <div className="flex items-center mb-1">
                                <div className="w-8" />
                                {HOUR_RANGE.filter((_, i) => i % 2 === 0).map((h) => (
                                    <div
                                        key={h}
                                        className="text-[9px] text-[var(--text-muted)] text-center"
                                        style={{ width: `${100 / 8}%` }}
                                    >
                                        {h > 12 ? `${h - 12}p` : h === 12 ? "12p" : `${h}a`}
                                    </div>
                                ))}
                            </div>

                            {/* Grid */}
                            {DAY_LABELS.map((dayLabel, dayIdx) => (
                                <div key={dayLabel} className="flex items-center gap-0.5 mb-0.5">
                                    <div className="w-8 text-[9px] text-[var(--text-muted)] text-right pr-2">
                                        {dayLabel}
                                    </div>
                                    {HOUR_RANGE.map((hour) => {
                                        const cell = heatmap.find(
                                            (c) => c.day === dayIdx && c.hour === hour
                                        );
                                        const intensity = cell?.intensity ?? 0;
                                        return (
                                            <div
                                                key={hour}
                                                className="flex-1 aspect-square rounded-sm transition-colors duration-300"
                                                style={{
                                                    background:
                                                        intensity > 0
                                                            ? `rgba(99, 102, 241, ${0.15 + intensity * 0.7})`
                                                            : "var(--bg-hover)",
                                                    boxShadow:
                                                        intensity > 0.6
                                                            ? `0 0 6px rgba(99, 102, 241, ${intensity * 0.3})`
                                                            : "none",
                                                }}
                                                title={
                                                    cell
                                                        ? `${cell.sessions} session${cell.sessions !== 1 ? "s" : ""}`
                                                        : "No sessions"
                                                }
                                            />
                                        );
                                    })}
                                </div>
                            ))}

                            {/* Legend */}
                            <div className="flex items-center justify-end gap-1 mt-2">
                                <span className="text-[9px] text-[var(--text-muted)]">Less</span>
                                {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
                                    <div
                                        key={v}
                                        className="w-2.5 h-2.5 rounded-sm"
                                        style={{
                                            background: `rgba(99, 102, 241, ${0.15 + v * 0.7})`,
                                        }}
                                    />
                                ))}
                                <span className="text-[9px] text-[var(--text-muted)]">More</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Monthly XP Trend ─────────────────────────────── */}
                <div className="glass-card-static p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-[var(--text-secondary)]">
                            XP Growth
                        </h3>
                        <div className="text-right">
                            <p className="text-lg font-bold accent-gradient-text">
                                {xpTrend[xpTrend.length - 1]?.xp ?? 0}
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)]">Total XP</p>
                        </div>
                    </div>
                    <svg
                        viewBox={`0 0 ${trendW} ${trendH}`}
                        className="w-full"
                        preserveAspectRatio="none"
                    >
                        <defs>
                            <linearGradient id="xpArea" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="xpLine" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="var(--accent-primary)" />
                                <stop offset="100%" stopColor="var(--accent-secondary)" />
                            </linearGradient>
                        </defs>
                        <path d={trendAreaPath} fill="url(#xpArea)" />
                        <path
                            d={trendPath}
                            fill="none"
                            stroke="url(#xpLine)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <div className="flex justify-between mt-2">
                        <span className="text-[9px] text-[var(--text-muted)]">
                            {xpTrend[0]?.label}
                        </span>
                        <span className="text-[9px] text-[var(--text-muted)]">
                            {xpTrend[xpTrend.length - 1]?.label}
                        </span>
                    </div>
                </div>

                {/* ── Focus Depth ──────────────────────────────────── */}
                <div className="glass-card-static p-5">
                    <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4">
                        Focus Depth
                    </h3>
                    <div className="space-y-3">
                        {depthDist.map((bucket) => (
                            <div key={bucket.label}>
                                <div className="flex items-center justify-between text-sm mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ background: bucket.color }}
                                        />
                                        <span className="text-[var(--text-secondary)] text-xs">
                                            {bucket.label}
                                        </span>
                                    </div>
                                    <span className="text-xs font-medium">
                                        {bucket.percentage}%
                                    </span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-[var(--bg-hover)] overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{
                                            width: `${bucket.percentage}%`,
                                            background: bucket.color,
                                            boxShadow: `0 0 8px ${bucket.color}40`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── BB vs AP Ratio + Streak ──────────────────────── */}
                <div className="glass-card-static p-5">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Ratio */}
                        <div>
                            <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4">
                                Task Ratio
                            </h3>
                            <div className="flex items-center justify-center">
                                <svg viewBox="0 0 100 100" className="w-24 h-24">
                                    {/* Background circle */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke="var(--bg-hover)"
                                        strokeWidth="8"
                                    />
                                    {/* BB arc */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke="var(--accent-primary)"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={`${bbPct * 251.3} ${251.3}`}
                                        transform="rotate(-90 50 50)"
                                        style={{ transition: "stroke-dasharray 1s ease-out" }}
                                    />
                                    <text
                                        x="50"
                                        y="47"
                                        textAnchor="middle"
                                        className="text-[10px] font-bold"
                                        fill="var(--text-primary)"
                                    >
                                        {Math.round(bbPct * 100)}%
                                    </text>
                                    <text
                                        x="50"
                                        y="58"
                                        textAnchor="middle"
                                        className="text-[6px]"
                                        fill="var(--text-muted)"
                                    >
                                        Brain Burner
                                    </text>
                                </svg>
                            </div>
                            <div className="flex items-center justify-center gap-4 mt-3">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                                    <span className="text-[10px] text-[var(--text-muted)]">
                                        BB ({ratio.brainBurner})
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-[var(--bg-hover)]" />
                                    <span className="text-[10px] text-[var(--text-muted)]">
                                        AP ({ratio.autopilot})
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Streak */}
                        <div>
                            <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4">
                                Consistency
                            </h3>
                            <div className="text-center mb-3">
                                <p className="text-3xl font-bold accent-gradient-text">
                                    {streaks.currentStreak}
                                </p>
                                <p className="text-[10px] text-[var(--text-muted)]">
                                    day streak
                                </p>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] text-[var(--text-muted)]">
                                    Longest: {streaks.longestStreak}d
                                </span>
                            </div>
                            {/* 30-day grid */}
                            <div className="grid grid-cols-10 gap-0.5">
                                {streaks.last30Days.map((active, i) => (
                                    <div
                                        key={i}
                                        className="aspect-square rounded-sm"
                                        style={{
                                            background: active
                                                ? "var(--accent-primary)"
                                                : "var(--bg-hover)",
                                            opacity: active ? 0.7 + (i / 30) * 0.3 : 1,
                                            boxShadow: active
                                                ? "0 0 4px rgba(99, 102, 241, 0.3)"
                                                : "none",
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
