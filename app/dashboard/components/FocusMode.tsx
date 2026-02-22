"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { XP_PER_AUTOPILOT } from "@/lib/progression";
import { setGhostPresence, clearGhostPresence } from "@/lib/ghostPresence";

/* ====================================================================
   TYPES
   ==================================================================== */

type TimerPreset = 25 | 50;
type FocusPhase = "idle" | "selecting" | "running" | "paused" | "completed";

interface FocusModeProps {
    isOpen: boolean;
    onClose: () => void;
    currentXp: number;
    userId: string;
    onSessionComplete: (minutesCompleted: number, xpEarned: number) => void;
    onFocusChange?: (isFocusing: boolean) => void;
}

/* ====================================================================
   HELPERS
   ==================================================================== */

function formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function circumference(radius: number): number {
    return 2 * Math.PI * radius;
}

/* ====================================================================
   COMPONENT
   ==================================================================== */

export default function FocusMode({
    isOpen,
    onClose,
    currentXp,
    userId,
    onSessionComplete,
    onFocusChange,
}: FocusModeProps) {
    const [phase, setPhase] = useState<FocusPhase>("selecting");
    const [preset, setPreset] = useState<TimerPreset>(25);
    const [secondsLeft, setSecondsLeft] = useState(25 * 60);
    const [totalSeconds, setTotalSeconds] = useState(25 * 60);
    const [exiting, setExiting] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Earned XP for completed session
    const sessionXp = preset === 25 ? XP_PER_AUTOPILOT : XP_PER_AUTOPILOT * 2;

    // Progress ring values
    const RING_R = 130;
    const RING_C = circumference(RING_R);
    const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0;
    const strokeOffset = RING_C * (1 - progress);

    // XP ring (small inner ring showing XP progress toward next 100)
    const XP_R = 100;
    const XP_C = circumference(XP_R);
    const xpProgress = ((currentXp + (phase === "completed" ? sessionXp : 0)) % 100) / 100;
    const xpOffset = XP_C * (1 - xpProgress);

    // ── Timer tick ──────────────────────────────────────────────
    useEffect(() => {
        if (phase !== "running") return;

        intervalRef.current = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current!);
                    setPhase("completed");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [phase]);

    // ── Reset on open ──────────────────────────────────────────
    useEffect(() => {
        if (isOpen) {
            setPhase("selecting");
            setPreset(25);
            setSecondsLeft(25 * 60);
            setTotalSeconds(25 * 60);
            setExiting(false);
        }
    }, [isOpen]);

    // ── Actions ────────────────────────────────────────────────
    const selectPreset = useCallback((p: TimerPreset) => {
        setPreset(p);
        setSecondsLeft(p * 60);
        setTotalSeconds(p * 60);
    }, []);

    const startTimer = useCallback(() => {
        setPhase("running");
        setGhostPresence(userId).catch(() => { });
        onFocusChange?.(true);
    }, [userId, onFocusChange]);

    const pauseTimer = useCallback(() => {
        setPhase("paused");
        if (intervalRef.current) clearInterval(intervalRef.current);
    }, []);

    const resumeTimer = useCallback(() => {
        setPhase("running");
    }, []);

    const handleExit = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        clearGhostPresence(userId).catch(() => { });
        onFocusChange?.(false);
        setExiting(true);
        setTimeout(() => {
            onClose();
            setExiting(false);
        }, 400);
    }, [onClose, userId, onFocusChange]);

    const handleComplete = useCallback(() => {
        onSessionComplete(preset, sessionXp);
        handleExit();
    }, [onSessionComplete, preset, sessionXp, handleExit]);

    // ── Keyboard escape (after handleExit declaration) ─────────
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape" && phase !== "running") {
                handleExit();
            }
        }
        if (isOpen) window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isOpen, phase, handleExit]);

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center
        ${exiting ? "animate-focus-exit" : "animate-focus-enter"}`}
            style={{ background: "var(--bg-primary)" }}
        >
            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)",
                    }}
                />
            </div>

            {/* Close / Exit (only when not actively running) */}
            {phase !== "running" && (
                <button
                    onClick={handleExit}
                    className="absolute top-6 right-6 p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all duration-300 z-10"
                    aria-label="Exit Focus Mode"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}

            {/* Ghost Mode indicator */}
            {(phase === "running" || phase === "paused") && (
                <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-card)]/50 border border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] animate-fade-in">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                    Ghost Mode
                </div>
            )}

            <div className="relative flex flex-col items-center gap-8 max-w-md w-full px-6">
                {/* ── SELECTING PHASE ─────────────────────────────── */}
                {phase === "selecting" && (
                    <div className="flex flex-col items-center gap-8 animate-fade-in">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold tracking-tight mb-2">
                                Focus Mode
                            </h2>
                            <p className="text-sm text-[var(--text-muted)]">
                                Choose your session duration
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            {([25, 50] as TimerPreset[]).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => selectPreset(p)}
                                    className={`w-28 h-28 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all duration-300
                    ${preset === p
                                            ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/40 text-[var(--accent-hover)] shadow-[0_0_30px_rgba(99,102,241,0.12)]"
                                            : "bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-secondary)]"
                                        }
                  `}
                                >
                                    <span className="text-2xl font-bold">{p}</span>
                                    <span className="text-[11px] text-[var(--text-muted)]">minutes</span>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={startTimer}
                            className="btn-primary px-10 py-3.5 text-[15px]"
                        >
                            <span>Begin Session</span>
                        </button>

                        <p className="text-[11px] text-[var(--text-muted)]">
                            +{sessionXp} XP on completion
                        </p>
                    </div>
                )}

                {/* ── RUNNING / PAUSED / COMPLETED PHASE ──────────── */}
                {(phase === "running" || phase === "paused" || phase === "completed") && (
                    <div className="flex flex-col items-center gap-8 animate-fade-in">
                        {/* Timer ring */}
                        <div className="relative w-[300px] h-[300px] flex items-center justify-center">
                            <svg
                                className="absolute inset-0 w-full h-full"
                                viewBox="0 0 300 300"
                            >
                                {/* XP ring (inner) */}
                                <circle
                                    cx="150"
                                    cy="150"
                                    r={XP_R}
                                    fill="none"
                                    stroke="var(--border-subtle)"
                                    strokeWidth="3"
                                />
                                <circle
                                    cx="150"
                                    cy="150"
                                    r={XP_R}
                                    fill="none"
                                    stroke="var(--accent-secondary)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeDasharray={XP_C}
                                    strokeDashoffset={xpOffset}
                                    opacity={0.5}
                                    transform="rotate(-90 150 150)"
                                    style={{ transition: "stroke-dashoffset 800ms ease-out" }}
                                />

                                {/* Timer ring (outer) */}
                                <circle
                                    cx="150"
                                    cy="150"
                                    r={RING_R}
                                    fill="none"
                                    stroke="var(--border-subtle)"
                                    strokeWidth="4"
                                />
                                <circle
                                    cx="150"
                                    cy="150"
                                    r={RING_R}
                                    fill="none"
                                    stroke="url(#timerGradient)"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeDasharray={RING_C}
                                    strokeDashoffset={strokeOffset}
                                    transform="rotate(-90 150 150)"
                                    style={{ transition: "stroke-dashoffset 1s linear" }}
                                />

                                <defs>
                                    <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="var(--accent-primary)" />
                                        <stop offset="100%" stopColor="var(--accent-secondary)" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            {/* Center content */}
                            <div className="relative flex flex-col items-center z-10">
                                <span
                                    className="text-5xl font-bold tracking-tight tabular-nums"
                                    style={{ fontVariantNumeric: "tabular-nums" }}
                                >
                                    {formatTime(secondsLeft)}
                                </span>
                                <span className="text-xs text-[var(--text-muted)] mt-1">
                                    {phase === "completed"
                                        ? "Session Complete"
                                        : phase === "paused"
                                            ? "Paused"
                                            : `${preset} min session`}
                                </span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                            {phase === "running" && (
                                <button
                                    onClick={pauseTimer}
                                    className="btn-secondary px-6 py-3 text-sm"
                                >
                                    Pause
                                </button>
                            )}

                            {phase === "paused" && (
                                <>
                                    <button
                                        onClick={resumeTimer}
                                        className="btn-primary px-6 py-3 text-sm"
                                    >
                                        <span>Resume</span>
                                    </button>
                                    <button
                                        onClick={handleExit}
                                        className="btn-secondary px-6 py-3 text-sm"
                                    >
                                        End
                                    </button>
                                </>
                            )}

                            {phase === "completed" && (
                                <div className="flex flex-col items-center gap-4 animate-slide-up">
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-glow)] border border-[var(--accent-primary)]/20">
                                        <span className="text-sm font-semibold accent-gradient-text">
                                            +{sessionXp} XP earned
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleComplete}
                                        className="btn-primary px-8 py-3 text-sm"
                                    >
                                        <span>Claim & Exit</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Breathing indicator (only while running) */}
                        {phase === "running" && (
                            <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] animate-fade-in">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-float" />
                                Deep work in progress
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
