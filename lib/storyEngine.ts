import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

/* ====================================================================
   TYPES
   ==================================================================== */

export type Alignment = "focused" | "balanced" | "driven";

export interface Chapter {
    id: number;
    title: string;
    description: string;
    unlockLevel: number;
    narrative: string;
    choice?: {
        prompt: string;
        options: { label: string; alignment: Alignment; text: string }[];
    };
}

export interface StoryProgress {
    chapter: number;
    alignment: Alignment | "neutral";
    chaptersCompleted: number[];
}

/* ====================================================================
   CHAPTER DATA
   ==================================================================== */

export const CHAPTERS: Chapter[] = [
    {
        id: 1,
        title: "The Signal",
        description: "Something shifts. You notice the noise.",
        unlockLevel: 1,
        narrative:
            "For the first time, you see the pattern clearly. Hours dissolving into feeds, tabs, half-finished tasks. Not laziness. Architecture. The systems around you were designed to scatter your attention. You are here because you chose to notice.",
        choice: {
            prompt: "What brought you here?",
            options: [
                {
                    label: "I need structure",
                    alignment: "focused",
                    text: "You recognize that raw effort is not enough. You need a framework. Something to channel the energy that keeps spilling outward.",
                },
                {
                    label: "I want balance",
                    alignment: "balanced",
                    text: "You are not broken. But the equilibrium between effort and rest has eroded. You are here to rebuild it, deliberately.",
                },
                {
                    label: "I want to push further",
                    alignment: "driven",
                    text: "The ceiling is not talent. It is consistency. You already know what you are capable of. Now you need the discipline to prove it daily.",
                },
            ],
        },
    },
    {
        id: 2,
        title: "First Light",
        description: "The first real session. Momentum begins.",
        unlockLevel: 3,
        narrative:
            "Your first deep session is not dramatic. No revelation, no breakthrough. Just twenty-five minutes of unbroken attention. And when it ends, something feels different. Not excitement. Clarity. The kind that comes from doing exactly one thing, fully.",
    },
    {
        id: 3,
        title: "The Pattern",
        description: "You begin to see your own rhythm.",
        unlockLevel: 5,
        narrative:
            "The data starts to tell a story. Not about productivity metrics. About you. When you are sharpest. When resistance is highest. When autopilot is enough and when you need challenge. This is not optimization. It is self-knowledge.",
        choice: {
            prompt: "What do you do with this knowledge?",
            options: [
                {
                    label: "Double down on peak hours",
                    alignment: "focused",
                    text: "You carve your hardest work into the hours where your mind burns cleanest. Everything else gets moved. Efficiency is a form of respect for your own time.",
                },
                {
                    label: "Spread the effort evenly",
                    alignment: "balanced",
                    text: "Peaks and valleys are natural. You design your schedule to honor both. Sustainable rhythm over unsustainable sprints.",
                },
                {
                    label: "Push through the valleys",
                    alignment: "driven",
                    text: "Comfort is the enemy of growth. You choose to train in the hours that resist you most. If you can focus when it is hard, focusing when it is easy becomes effortless.",
                },
            ],
        },
    },
    {
        id: 4,
        title: "Resistance",
        description: "The urge to quit arrives. You expected it.",
        unlockLevel: 8,
        narrative:
            "Day seven. Or twelve. Or three. It does not matter when it hits. What matters is that you expected it. The pull toward the familiar. The voice suggesting that this, too, will fade. It will not fade if you do not let it. Every system has a stress test. This is yours.",
    },
    {
        id: 5,
        title: "Compound",
        description: "Small actions, repeated, become undeniable.",
        unlockLevel: 12,
        narrative:
            "You do not feel different. You look at your progress and the graph tells a story your emotions cannot. Seventy hours of focused work. Forty challenges completed. A level of consistency you have not achieved before. This is not motivation. This is evidence.",
        choice: {
            prompt: "What is this becoming?",
            options: [
                {
                    label: "A discipline practice",
                    alignment: "focused",
                    text: "You see it clearly now. Focus is not a skill. It is a practice. Like meditation or training. The work is showing up. The results are side effects.",
                },
                {
                    label: "A way of living",
                    alignment: "balanced",
                    text: "This is not about productivity anymore. It is about how you spend your hours. The boundaries between work and rest are intentional now. That changes everything.",
                },
                {
                    label: "An edge",
                    alignment: "driven",
                    text: "Most people will never do this. Not because they cannot. Because they will not. You are building something that separates you. Not superiority. Distance from mediocrity.",
                },
            ],
        },
    },
    {
        id: 6,
        title: "The Quiet",
        description: "Focus becomes your natural state.",
        unlockLevel: 18,
        narrative:
            "You stop announcing your sessions. You stop tracking streaks for the thrill. The work has become quiet. Ordinary. Embedded in who you are. This is the real shift. Not the peak. The plateau that feels like home.",
    },
    {
        id: 7,
        title: "Eclipse",
        description: "You have become the system.",
        unlockLevel: 25,
        narrative:
            "There is no final boss. No trophy screen. Only this: the version of you that sat down on day one would not recognize the person reading this now. Not because you changed who you are. Because you stopped letting noise define it. The eclipse is not darkness. It is what happens when you position yourself directly between chaos and purpose. You block out everything that does not matter. And what remains is you.",
    },
];

/* ====================================================================
   PURE FUNCTIONS
   ==================================================================== */

/**
 * Returns the current chapter based on story state.
 */
export function getCurrentChapter(chapterId: number): Chapter | undefined {
    return CHAPTERS.find((c) => c.id === chapterId);
}

/**
 * Returns all chapters the user has access to based on level.
 */
export function getUnlockedChapters(userLevel: number): Chapter[] {
    return CHAPTERS.filter((c) => userLevel >= c.unlockLevel);
}

/**
 * Returns the next locked chapter (if any).
 */
export function getNextLockedChapter(userLevel: number): Chapter | undefined {
    return CHAPTERS.find((c) => userLevel < c.unlockLevel);
}

/**
 * Checks whether a specific chapter is unlocked.
 */
export function isChapterUnlocked(
    chapterId: number,
    userLevel: number
): boolean {
    const chapter = CHAPTERS.find((c) => c.id === chapterId);
    return chapter ? userLevel >= chapter.unlockLevel : false;
}

/**
 * Derives the dominant alignment from the current choice.
 * Neutral if no choice has been made.
 */
export function resolveAlignment(alignment: string): string {
    if (alignment === "focused" || alignment === "balanced" || alignment === "driven") {
        return alignment;
    }
    return "neutral";
}

/* ====================================================================
   FIRESTORE INTEGRATION
   ==================================================================== */

/**
 * Advances the user to a chapter and optionally records an alignment choice.
 */
export async function advanceChapter(
    userId: string,
    chapterId: number,
    alignment?: Alignment
): Promise<void> {
    if (!db || typeof (db as unknown as Record<string, unknown>).type === "undefined") return;

    const ref = doc(db, "users", userId);
    const update: Record<string, unknown> = {
        "storyState.chapter": chapterId,
        lastActiveTime: serverTimestamp(),
    };

    if (alignment) {
        update["storyState.alignment"] = alignment;
    }

    await updateDoc(ref, update);
}
