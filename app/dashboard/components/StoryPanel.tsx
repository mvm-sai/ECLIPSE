"use client";

import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
    CHAPTERS,
    getCurrentChapter,
    getUnlockedChapters,
    getNextLockedChapter,
    advanceChapter,
} from "@/lib/storyEngine";
import type { Alignment, Chapter } from "@/lib/storyEngine";

export default function StoryPanel() {
    const { user } = useAuth();
    const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
    const [choosingAlignment, setChoosingAlignment] = useState(false);
    const [transitioning, setTransitioning] = useState(false);

    const userLevel = user?.level ?? 1;
    const currentChapterId = user?.storyState?.chapter ?? 1;
    const currentAlignment = user?.storyState?.alignment ?? "neutral";

    const unlockedChapters = useMemo(
        () => getUnlockedChapters(userLevel),
        [userLevel]
    );

    const nextLocked = useMemo(
        () => getNextLockedChapter(userLevel),
        [userLevel]
    );

    const activeChapter = useMemo(() => {
        const id = selectedChapter ?? currentChapterId;
        return getCurrentChapter(id) ?? CHAPTERS[0];
    }, [selectedChapter, currentChapterId]);

    const isCurrentChapter = activeChapter.id === currentChapterId;
    const hasChoice = activeChapter.choice && isCurrentChapter;

    const handleSelectChapter = useCallback((chapter: Chapter) => {
        setTransitioning(true);
        setChoosingAlignment(false);
        setTimeout(() => {
            setSelectedChapter(chapter.id);
            setTransitioning(false);
        }, 200);
    }, []);

    const handleAlignmentChoice = useCallback(
        async (alignment: Alignment) => {
            if (!user) return;
            setChoosingAlignment(false);

            // Advance to next chapter
            const nextId = activeChapter.id + 1;
            const nextChapter = CHAPTERS.find((c) => c.id === nextId);
            if (nextChapter && userLevel >= nextChapter.unlockLevel) {
                await advanceChapter(user.uid, nextId, alignment).catch(() => { });
                setSelectedChapter(nextId);
            } else {
                await advanceChapter(user.uid, activeChapter.id, alignment).catch(() => { });
            }
        },
        [user, activeChapter, userLevel]
    );

    const handleContinue = useCallback(async () => {
        if (!user) return;
        if (hasChoice) {
            setChoosingAlignment(true);
            return;
        }
        // No choice - advance directly
        const nextId = activeChapter.id + 1;
        const nextChapter = CHAPTERS.find((c) => c.id === nextId);
        if (nextChapter && userLevel >= nextChapter.unlockLevel) {
            await advanceChapter(user.uid, nextId).catch(() => { });
            setSelectedChapter(nextId);
        }
    }, [user, activeChapter, hasChoice, userLevel]);

    if (!user) return null;

    const alignmentColors: Record<string, string> = {
        focused: "var(--accent-primary)",
        balanced: "var(--success)",
        driven: "var(--warning)",
        neutral: "var(--text-muted)",
    };

    return (
        <div className="glass-card-static p-6 h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-[var(--text-secondary)]">
                    Your Story
                </h3>
                {currentAlignment !== "neutral" && (
                    <span
                        className="text-[10px] px-2 py-1 rounded-lg font-medium uppercase tracking-wider"
                        style={{
                            background: `${alignmentColors[currentAlignment]}15`,
                            color: alignmentColors[currentAlignment],
                        }}
                    >
                        {currentAlignment}
                    </span>
                )}
            </div>

            {/* Chapter timeline */}
            <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1">
                {CHAPTERS.map((ch) => {
                    const unlocked = userLevel >= ch.unlockLevel;
                    const isCurrent = ch.id === activeChapter.id;
                    return (
                        <button
                            key={ch.id}
                            onClick={() => unlocked && handleSelectChapter(ch)}
                            disabled={!unlocked}
                            className={`flex-shrink-0 w-7 h-7 rounded-lg text-[10px] font-semibold flex items-center justify-center transition-all duration-300
                ${isCurrent
                                    ? "bg-[var(--accent-primary)] text-white shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                                    : unlocked
                                        ? "bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--accent-primary)]/20 cursor-pointer"
                                        : "bg-[var(--bg-primary)] text-[var(--text-muted)]/40 cursor-not-allowed"
                                }
              `}
                            title={unlocked ? ch.title : `Unlocks at Level ${ch.unlockLevel}`}
                        >
                            {unlocked ? ch.id : (
                                <svg className="w-3 h-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Active chapter content */}
            <div
                className={`transition-opacity duration-200 ${transitioning ? "opacity-0" : "opacity-100"
                    }`}
            >
                <div className="mb-4">
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
                        Chapter {activeChapter.id}
                    </p>
                    <h4 className="text-base font-semibold text-[var(--text-primary)] mb-1">
                        {activeChapter.title}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)]">
                        {activeChapter.description}
                    </p>
                </div>

                {/* Narrative text */}
                <div className="relative mb-5">
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-[var(--accent-primary)]/20" />
                    <p className="pl-4 text-[13px] text-[var(--text-secondary)] leading-relaxed">
                        {activeChapter.narrative}
                    </p>
                </div>

                {/* Alignment choice */}
                {choosingAlignment && activeChapter.choice && (
                    <div className="animate-slide-up space-y-3">
                        <p className="text-xs font-medium text-[var(--text-secondary)] mb-3">
                            {activeChapter.choice.prompt}
                        </p>
                        {activeChapter.choice.options.map((option) => (
                            <button
                                key={option.alignment}
                                onClick={() => handleAlignmentChoice(option.alignment)}
                                className="w-full text-left p-3 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border-subtle)] hover:border-[var(--border-secondary)] transition-all duration-300 group"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <div
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ background: alignmentColors[option.alignment] }}
                                    />
                                    <span className="text-sm font-medium text-[var(--text-primary)]">
                                        {option.label}
                                    </span>
                                    <span
                                        className="text-[9px] uppercase tracking-wider font-medium ml-auto"
                                        style={{ color: alignmentColors[option.alignment] }}
                                    >
                                        {option.alignment}
                                    </span>
                                </div>
                                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed pl-3.5 group-hover:text-[var(--text-secondary)] transition-colors duration-300">
                                    {option.text}
                                </p>
                            </button>
                        ))}
                    </div>
                )}

                {/* Continue / Next chapter prompt */}
                {!choosingAlignment && isCurrentChapter && (
                    <div className="flex items-center justify-between">
                        {(hasChoice || activeChapter.id < CHAPTERS.length) && (
                            <button
                                onClick={handleContinue}
                                className="text-xs font-medium text-[var(--accent-hover)] hover:text-[var(--accent-primary)] transition-colors duration-300 flex items-center gap-1"
                            >
                                {hasChoice ? "Make your choice" : "Continue"}
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}

                {/* Next locked chapter hint */}
                {nextLocked && !choosingAlignment && (
                    <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
                        <p className="text-[11px] text-[var(--text-muted)]">
                            Next: <span className="text-[var(--text-secondary)]">{nextLocked.title}</span>
                            {" "}  &middot; Level {nextLocked.unlockLevel}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
