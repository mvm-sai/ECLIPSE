"use client";

import { useState, useMemo, useCallback, Suspense, lazy } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "./components/Sidebar";
import StatsCard from "./components/StatsCard";
import EnergyChart from "./components/EnergyChart";
import XPProgressBar from "./components/XPProgressBar";
import RankBadge from "./components/RankBadge";
import FocusMode from "./components/FocusMode";
import GhostPresence from "./components/GhostPresence";
import StoryPanel from "./components/StoryPanel";
import ErrorBoundary from "./components/ErrorBoundary";

const AnalyticsPanel = lazy(() => import("./components/AnalyticsPanel"));

import {
    generateMockEnergyData,
    getDashboardStats,
    generateChartData,
    calculateEnergyStats,
    getScheduledTasks,
} from "@/lib/energyEngine";
import {
    awardXp,
    incrementBrainBurnerCount,
    xpForTaskType,
} from "@/lib/progression";
import type { Task } from "@/types";

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [focusModeOpen, setFocusModeOpen] = useState(false);
    const [focusActive, setFocusActive] = useState(false);
    const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
    const [xpToast, setXpToast] = useState<{ xp: number; levelUp: boolean; rankUp: boolean } | null>(null);

    const handleFocusComplete = useCallback(
        (_minutes: number, xpEarned: number) => {
            setXpToast({ xp: xpEarned, levelUp: false, rankUp: false });
            setTimeout(() => setXpToast(null), 3000);
        },
        []
    );

    const mockData = useMemo(() => generateMockEnergyData(30), []);
    const dashboardStats = useMemo(() => getDashboardStats(mockData), [mockData]);
    const chartData = useMemo(() => generateChartData(mockData, 7), [mockData]);
    const energyStats = useMemo(() => calculateEnergyStats(mockData), [mockData]);

    const scheduledResult = useMemo(() => {
        if (!user) return null;
        return getScheduledTasks({
            currentHour: new Date().getHours(),
            brainBurnersCompletedToday: user.energyProfile.brainBurnersCompletedToday,
            lastActiveTime: user.lastActiveTime,
            userLevel: user.level,
        });
    }, [user]);

    const handleCompleteTask = useCallback(
        async (task: Task) => {
            if (!user || completingTaskId) return;
            setCompletingTaskId(task.id);

            try {
                const result = await awardXp(user.uid, task.type, user.xp);
                if (task.type === "brain-burner") {
                    await incrementBrainBurnerCount(user.uid);
                }
                setXpToast({
                    xp: result.xpGained,
                    levelUp: result.leveledUp,
                    rankUp: result.rankedUp,
                });
                setTimeout(() => setXpToast(null), 3000);
            } catch {
                // Firestore unavailable in demo mode - show toast anyway
                const xp = xpForTaskType(task.type);
                setXpToast({ xp, levelUp: false, rankUp: false });
                setTimeout(() => setXpToast(null), 3000);
            } finally {
                setCompletingTaskId(null);
            }
        },
        [user, completingTaskId]
    );

    // Loading
    if (loading) {
        return (
            <div className="min-h-screen flex bg-[var(--bg-primary)]">
                {/* Sidebar skeleton */}
                <div className="hidden lg:block w-[280px] bg-[var(--bg-secondary)] border-r border-[var(--border-primary)]">
                    <div className="p-6 border-b border-[var(--border-primary)]">
                        <div className="skeleton h-9 w-32" />
                    </div>
                    <div className="p-4 space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="skeleton h-11 w-full" />
                        ))}
                    </div>
                </div>

                {/* Main content skeleton */}
                <div className="flex-1 p-6 space-y-6">
                    {/* Header skeleton */}
                    <div className="flex items-center justify-between pb-4 border-b border-[var(--border-primary)]">
                        <div className="space-y-2">
                            <div className="skeleton h-6 w-48" />
                            <div className="skeleton h-3 w-24" />
                        </div>
                        <div className="skeleton h-9 w-20 rounded-xl" />
                    </div>

                    {/* XP bar skeleton */}
                    <div className="skeleton h-16 w-full" />

                    {/* Stats grid skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="skeleton h-28" />
                        ))}
                    </div>

                    {/* Chart + Tasks skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="skeleton h-64" />
                        <div className="lg:col-span-2 skeleton h-64" />
                    </div>
                </div>
            </div>
        );
    }

    // Auth gate
    if (!user) {
        router.push("/login");
        return null;
    }

    const statsCards = [
        {
            icon: "\u26A1",
            label: "Current Energy",
            value: dashboardStats.currentEnergy,
            unit: "kWh",
            trend: energyStats.trend,
            trendValue: energyStats.trend === "up" ? "+12%" : energyStats.trend === "down" ? "-8%" : "0%",
        },
        {
            icon: "\uD83D\uDCCA",
            label: "Daily Average",
            value: dashboardStats.dailyAverage,
            unit: "kWh",
            trend: "stable" as const,
            trendValue: "Avg.",
        },
        {
            icon: "\uD83D\uDCC5",
            label: "Weekly Total",
            value: dashboardStats.weeklyTotal,
            unit: "kWh",
            trend: "up" as const,
            trendValue: "+5%",
        },
        {
            icon: "\uD83C\uDF31",
            label: "Carbon Offset",
            value: dashboardStats.carbonOffset,
            unit: "kg CO\u2082",
            trend: "up" as const,
            trendValue: "+15%",
        },
    ];

    return (
        <div className="min-h-screen flex bg-[var(--bg-primary)]">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                userName={user.displayName}
                userEmail={user.email}
                userRank={user.rank}
                userLevel={user.level}
                userXp={user.xp}
            />

            <main className="flex-1 min-w-0">
                {/* Top bar */}
                <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-primary)]">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors duration-300"
                            aria-label="Open sidebar"
                        >
                            <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-lg font-semibold">
                                Welcome back, <span className="accent-gradient-text">{user.displayName || "User"}</span>
                            </h1>
                            <p className="text-xs text-[var(--text-muted)]">
                                Level {user.level} &middot; {user.rank}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setFocusModeOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-sm font-medium text-[var(--accent-hover)] hover:bg-[var(--accent-primary)]/20 transition-all duration-300"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                            Focus
                        </button>
                        <div className="hidden md:block">
                            <RankBadge level={user.level} size="sm" showLabel={false} />
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-[var(--text-muted)]">
                            <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
                            Live
                        </div>
                    </div>
                </header>

                <div className="p-6 space-y-6 animate-fade-in">
                    {/* XP + Rank bar */}
                    <div className="glass-card-static p-5 animate-slide-up">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <RankBadge level={user.level} size="md" />
                            <div className="flex-1">
                                <XPProgressBar totalXp={user.xp} level={user.level} size="md" />
                            </div>
                        </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {statsCards.map((card, i) => (
                            <div key={card.label} className={`animate-slide-up stagger-${i + 1}`}>
                                <StatsCard {...card} />
                            </div>
                        ))}
                    </div>

                    {/* Tasks + Chart */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Tasks panel */}
                        <div className="lg:col-span-1 animate-slide-up stagger-5">
                            <div className="glass-card-static p-6 h-full">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-sm font-semibold text-[var(--text-secondary)]">
                                        Today&apos;s Tasks
                                    </h3>
                                    {scheduledResult && (
                                        <span
                                            className="text-[10px] px-2 py-1 rounded-lg font-medium uppercase tracking-wider"
                                            style={{
                                                background:
                                                    scheduledResult.mode === "focus"
                                                        ? "var(--accent-glow)"
                                                        : scheduledResult.mode === "autopilot"
                                                            ? "rgba(245, 158, 11, 0.1)"
                                                            : "rgba(34, 197, 94, 0.1)",
                                                color:
                                                    scheduledResult.mode === "focus"
                                                        ? "var(--accent-hover)"
                                                        : scheduledResult.mode === "autopilot"
                                                            ? "var(--warning)"
                                                            : "var(--success)",
                                            }}
                                        >
                                            {scheduledResult.mode}
                                        </span>
                                    )}
                                </div>

                                {scheduledResult && (
                                    <p className="text-[11px] text-[var(--text-muted)] mb-4 leading-relaxed">
                                        {scheduledResult.reason}
                                    </p>
                                )}

                                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                                    {scheduledResult?.tasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border-subtle)] hover:border-[var(--border-secondary)] transition-all duration-300 group"
                                        >
                                            <button
                                                onClick={() => handleCompleteTask(task)}
                                                disabled={completingTaskId === task.id}
                                                className="mt-0.5 w-5 h-5 rounded-md border border-[var(--border-secondary)] flex items-center justify-center flex-shrink-0
                                   hover:border-[var(--accent-primary)] hover:bg-[var(--accent-glow)] transition-all duration-300
                                   disabled:opacity-50"
                                                aria-label={`Complete ${task.title}`}
                                            >
                                                {completingTaskId === task.id ? (
                                                    <svg className="w-3 h-3 animate-spin text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-3 h-3 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                    </svg>
                                                )}
                                            </button>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium leading-tight truncate">
                                                        {task.title}
                                                    </span>
                                                    <span
                                                        className="text-[9px] px-1.5 py-0.5 rounded font-medium uppercase flex-shrink-0"
                                                        style={{
                                                            background: task.type === "brain-burner" ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)",
                                                            color: task.type === "brain-burner" ? "var(--error)" : "var(--success)",
                                                        }}
                                                    >
                                                        {task.type === "brain-burner" ? "BB" : "AP"}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-[var(--text-muted)] mt-0.5 line-clamp-1">
                                                    {task.description}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-[var(--accent-hover)]">
                                                        +{task.xpReward} XP
                                                    </span>
                                                    <span className="text-[10px] text-[var(--text-muted)]">
                                                        {task.estimatedMinutes}m
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="lg:col-span-2 animate-slide-up stagger-6">
                            <EnergyChart data={chartData} title="Weekly Energy Consumption" height={220} />
                        </div>
                    </div>

                    {/* Performance panel */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 animate-slide-up">
                            <div className="glass-card-static p-6">
                                <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-5">
                                    Energy Sources
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { name: "Solar", icon: "\u2600\uFE0F", value: "34%", color: "var(--warning)" },
                                        { name: "Wind", icon: "\uD83D\uDCA8", value: "28%", color: "var(--accent-primary)" },
                                        { name: "Hydro", icon: "\uD83D\uDCA7", value: "22%", color: "#06b6d4" },
                                        { name: "Grid", icon: "\uD83D\uDD0C", value: "16%", color: "var(--text-muted)" },
                                    ].map((source) => (
                                        <div
                                            key={source.name}
                                            className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border-subtle)] hover:border-[var(--border-secondary)] transition-all duration-300"
                                        >
                                            <div className="text-2xl">{source.icon}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium">{source.name}</div>
                                                <div className="text-xs text-[var(--text-muted)]">{source.value} of total</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="animate-slide-up stagger-2">
                            <div className="glass-card-static p-6 h-full">
                                <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-5">
                                    Performance
                                </h3>
                                <div className="space-y-5">
                                    {[
                                        { label: "Efficiency", value: `${energyStats.efficiency}%`, pct: Math.min(energyStats.efficiency, 100), gradient: "from-[var(--accent-primary)] to-[var(--accent-secondary)]" },
                                        { label: "Savings", value: `${dashboardStats.savingsPercent}%`, pct: Math.min(dashboardStats.savingsPercent, 100), gradient: "from-[var(--success)] to-emerald-400" },
                                        { label: "Peak Usage", value: `${energyStats.peakUsage} kWh`, pct: Math.min((energyStats.peakUsage / 20) * 100, 100), gradient: "from-[var(--warning)] to-amber-400" },
                                    ].map((item) => (
                                        <div key={item.label}>
                                            <div className="flex items-center justify-between text-sm mb-2">
                                                <span className="text-[var(--text-muted)]">{item.label}</span>
                                                <span className="font-medium">{item.value}</span>
                                            </div>
                                            <div className="w-full h-2 rounded-full bg-[var(--bg-hover)] overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full bg-gradient-to-r ${item.gradient} transition-all duration-1000 ease-out`}
                                                    style={{ width: `${item.pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Story panel */}
                    <div className="animate-slide-up stagger-3">
                        <ErrorBoundary>
                            <StoryPanel />
                        </ErrorBoundary>
                    </div>

                    {/* Analytics panel (lazy loaded) */}
                    <div className="animate-slide-up stagger-4">
                        <Suspense
                            fallback={
                                <div className="glass-card-static p-6 flex items-center justify-center h-40">
                                    <div className="flex items-center gap-3 text-[var(--text-muted)]">
                                        <div className="w-4 h-4 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin" />
                                        <span className="text-sm">Loading analytics...</span>
                                    </div>
                                </div>
                            }
                        >
                            <ErrorBoundary>
                                <AnalyticsPanel />
                            </ErrorBoundary>
                        </Suspense>
                    </div>
                </div>
            </main>

            {/* XP Toast */}
            {xpToast && (
                <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
                    <div
                        className="glass-card-static px-5 py-4 flex items-center gap-3"
                        style={{ boxShadow: "0 8px 32px rgba(99, 102, 241, 0.2)" }}
                    >
                        <div className="w-9 h-9 rounded-xl bg-[var(--accent-glow)] border border-[var(--accent-primary)]/20 flex items-center justify-center">
                            <span className="text-sm">
                                {xpToast.rankUp ? "\u2728" : xpToast.levelUp ? "\u2B06\uFE0F" : "\u2B50"}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold accent-gradient-text">
                                +{xpToast.xp} XP
                            </p>
                            <p className="text-[11px] text-[var(--text-muted)]">
                                {xpToast.rankUp
                                    ? "Rank up!"
                                    : xpToast.levelUp
                                        ? "Level up!"
                                        : "Task completed"}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Focus Mode overlay */}
            <FocusMode
                isOpen={focusModeOpen}
                onClose={() => setFocusModeOpen(false)}
                currentXp={user.xp}
                userId={user.uid}
                onSessionComplete={handleFocusComplete}
                onFocusChange={setFocusActive}
            />

            {/* Ghost Presence indicator */}
            <GhostPresence focusActive={focusActive} />
        </div>
    );
}
