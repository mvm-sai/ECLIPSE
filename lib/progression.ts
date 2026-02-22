import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { TaskType } from '@/types';

/* ====================================================================
   CONSTANTS
   ==================================================================== */

export const XP_PER_AUTOPILOT = 10;
export const XP_PER_BRAIN_BURNER = 25;
export const XP_PER_LEVEL = 100;

export interface RankTier {
    name: string;
    minLevel: number;
    color: string;
    icon: string;
}

export const RANK_TIERS: readonly RankTier[] = [
    { name: 'Beginner', minLevel: 1, color: '#64748b', icon: '\u25C6' },
    { name: 'Builder', minLevel: 5, color: '#6366f1', icon: '\u25C8' },
    { name: 'Architect', minLevel: 10, color: '#8b5cf6', icon: '\u2726' },
    { name: 'Elite', minLevel: 20, color: '#f59e0b', icon: '\u2B21' },
    { name: 'Eclipse Master', minLevel: 35, color: '#ef4444', icon: '\u2727' },
];

export type RankName = string;


/* ====================================================================
   PURE CALCULATION FUNCTIONS
   ==================================================================== */

/**
 * Computes the level from total accumulated XP.
 * Level 1 starts at 0 XP; each subsequent level costs 100 XP.
 */
export function levelFromXp(totalXp: number): number {
    return Math.floor(totalXp / XP_PER_LEVEL) + 1;
}

/**
 * XP progress within the current level (0-99).
 */
export function xpInCurrentLevel(totalXp: number): number {
    return totalXp % XP_PER_LEVEL;
}

/**
 * Percentage progress through the current level (0-100).
 */
export function levelProgress(totalXp: number): number {
    return (xpInCurrentLevel(totalXp) / XP_PER_LEVEL) * 100;
}

/**
 * XP remaining to reach the next level.
 */
export function xpToNextLevel(totalXp: number): number {
    return XP_PER_LEVEL - xpInCurrentLevel(totalXp);
}

/**
 * Returns the rank tier for a given level.
 */
export function rankForLevel(level: number): RankTier {
    let result = RANK_TIERS[0];
    for (const tier of RANK_TIERS) {
        if (level >= tier.minLevel) {
            result = tier;
        }
    }
    return result;
}

/**
 * Returns the XP reward for completing a given task type.
 */
export function xpForTaskType(type: TaskType): number {
    return type === 'brain-burner' ? XP_PER_BRAIN_BURNER : XP_PER_AUTOPILOT;
}

/**
 * Computes the full progression snapshot from total XP.
 */
export function getProgressionSnapshot(totalXp: number) {
    const level = levelFromXp(totalXp);
    const rank = rankForLevel(level);
    const currentLevelXp = xpInCurrentLevel(totalXp);
    const progress = levelProgress(totalXp);
    const remaining = xpToNextLevel(totalXp);

    return {
        totalXp,
        level,
        rank,
        currentLevelXp,
        progress,
        remaining,
    };
}

/**
 * Checks whether completing a task at the given XP would trigger
 * a level-up, and whether the new level triggers a rank-up.
 */
export function checkLevelUp(
    currentXp: number,
    xpGained: number
): { leveledUp: boolean; newLevel: number; rankedUp: boolean; newRank: RankTier } {
    const oldLevel = levelFromXp(currentXp);
    const newLevel = levelFromXp(currentXp + xpGained);
    const leveledUp = newLevel > oldLevel;

    const oldRank = rankForLevel(oldLevel);
    const newRank = rankForLevel(newLevel);
    const rankedUp = newRank.name !== oldRank.name;

    return { leveledUp, newLevel, rankedUp, newRank };
}

/* ====================================================================
   FIRESTORE INTEGRATION
   ==================================================================== */

/**
 * Awards XP for completing a task and updates the user document.
 * Recalculates level and rank, then writes all fields atomically.
 */
export async function awardXp(
    userId: string,
    taskType: TaskType,
    currentXp: number
): Promise<{
    xpGained: number;
    leveledUp: boolean;
    rankedUp: boolean;
    snapshot: ReturnType<typeof getProgressionSnapshot>;
}> {
    const xpGained = xpForTaskType(taskType);
    const newTotalXp = currentXp + xpGained;
    const snapshot = getProgressionSnapshot(newTotalXp);
    const { leveledUp, rankedUp } = checkLevelUp(currentXp, xpGained);

    // Guard against stub Firestore during build
    if (db && typeof (db as unknown as Record<string, unknown>).type !== 'undefined') {
        const ref = doc(db, 'users', userId);
        await updateDoc(ref, {
            xp: increment(xpGained),
            level: snapshot.level,
            rank: snapshot.rank.name,
            lastActiveTime: serverTimestamp(),
        });
    }

    return { xpGained, leveledUp, rankedUp, snapshot };
}

/**
 * Increments the daily brain burner count in Firestore.
 */
export async function incrementBrainBurnerCount(userId: string): Promise<void> {
    if (db && typeof (db as unknown as Record<string, unknown>).type !== 'undefined') {
        const ref = doc(db, 'users', userId);
        await updateDoc(ref, {
            'energyProfile.brainBurnersCompletedToday': increment(1),
            lastActiveTime: serverTimestamp(),
        });
    }
}
