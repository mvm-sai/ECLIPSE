import type {
    EnergyData,
    EnergyStats,
    DashboardStats,
    ChartDataPoint,
    Task,
    SchedulingContext,
    SchedulingResult,
} from '@/types';
import {
    BRAIN_BURNER_DAILY_CAP,
    AUTOPILOT_WINDOW_START,
    AUTOPILOT_WINDOW_END,
    INACTIVITY_THRESHOLD_MS,
} from '@/types';

/* ====================================================================
   COGNITIVE LOAD SCHEDULER
   ==================================================================== */

/**
 * Determines whether the user has been inactive longer than
 * the re-engagement threshold (24 hours).
 */
function isInactive(lastActiveTime: Date, now: Date): boolean {
    return now.getTime() - lastActiveTime.getTime() > INACTIVITY_THRESHOLD_MS;
}

/**
 * Returns true if the current hour falls within the autopilot
 * window (3 PM - 6 PM), when cognitive load is typically lower.
 */
function isAutopilotWindow(hour: number): boolean {
    return hour >= AUTOPILOT_WINDOW_START && hour < AUTOPILOT_WINDOW_END;
}

/**
 * Returns true if the user has already hit the daily Brain Burner cap.
 */
function isBrainBurnerCapReached(completedToday: number): boolean {
    return completedToday >= BRAIN_BURNER_DAILY_CAP;
}

/**
 * Filters out Brain Burner tasks when the daily cap has been reached.
 */
function filterBrainBurnersByCapacity(
    tasks: Task[],
    completedToday: number
): Task[] {
    if (!isBrainBurnerCapReached(completedToday)) {
        return tasks;
    }
    return tasks.filter((t) => t.type !== 'brain-burner');
}

/**
 * Sorts tasks so that Autopilot tasks appear first.
 * Preserves relative ordering within each type.
 */
function prioritizeAutopilotTasks(tasks: Task[]): Task[] {
    const autopilot = tasks.filter((t) => t.type === 'autopilot');
    const other = tasks.filter((t) => t.type !== 'autopilot');
    return [...autopilot, ...other];
}

/**
 * Selects a single easy starter task for re-engagement flow.
 * Prefers Autopilot easy -> Brain Burner easy -> any easy task.
 */
function pickStarterTask(tasks: Task[]): Task | null {
    const easyAutopilot = tasks.find(
        (t) => t.type === 'autopilot' && t.difficulty === 'easy'
    );
    if (easyAutopilot) return easyAutopilot;

    const easyBrainBurner = tasks.find(
        (t) => t.type === 'brain-burner' && t.difficulty === 'easy'
    );
    if (easyBrainBurner) return easyBrainBurner;

    const anyEasy = tasks.find((t) => t.difficulty === 'easy');
    return anyEasy ?? tasks[0] ?? null;
}

/**
 * Core scheduling function.
 *
 * Applies three rules in priority order:
 *
 * 1. Re-engagement - If the user has been inactive > 24 h,
 *    return a single easy starter task.
 *
 * 2. Brain Burner cap - If 3 Brain Burners have been completed
 *    today, remove all remaining Brain Burners from the list.
 *
 * 3. Autopilot window - Between 3 PM and 6 PM, sort Autopilot
 *    tasks to the top of the list.
 */
export function scheduleTasks(
    tasks: Task[],
    context: SchedulingContext
): SchedulingResult {
    const now = new Date();

    // Rule 1: Re-engagement
    if (isInactive(context.lastActiveTime, now)) {
        const starter = pickStarterTask(tasks);
        return {
            tasks: starter ? [starter] : [],
            reason: "You have been away for a while. Here is a quick task to ease back in.",
            mode: 're-engagement',
        };
    }

    // Rule 2: Brain Burner cap
    let filtered = filterBrainBurnersByCapacity(
        tasks,
        context.brainBurnersCompletedToday
    );

    const capReached = isBrainBurnerCapReached(
        context.brainBurnersCompletedToday
    );

    // Rule 3: Autopilot window
    if (isAutopilotWindow(context.currentHour)) {
        filtered = prioritizeAutopilotTasks(filtered);
        return {
            tasks: filtered,
            reason: capReached
                ? "Brain Burner limit reached. Autopilot tasks prioritized during the afternoon window."
                : "Afternoon energy dip detected. Autopilot tasks moved to the top.",
            mode: 'autopilot',
        };
    }

    // Default: Focus mode
    return {
        tasks: filtered,
        reason: capReached
            ? "Brain Burner limit reached for today. Showing remaining Autopilot tasks."
            : "Full focus mode. All available tasks shown.",
        mode: 'focus',
    };
}

/* ====================================================================
   TASK GENERATORS (realistic mock data)
   ==================================================================== */

const BRAIN_BURNER_POOL: Omit<Task, 'id' | 'status' | 'createdAt'>[] = [
    {
        title: "Solve the Logic Grid",
        description: "A 4x4 deduction puzzle. Read the clues, eliminate impossibilities, find the answer.",
        type: 'brain-burner',
        difficulty: 'hard',
        xpReward: 50,
        estimatedMinutes: 15,
        tags: ['logic', 'deduction'],
    },
    {
        title: "Memory Matrix",
        description: "Memorize a pattern of highlighted cells, then reproduce it from memory.",
        type: 'brain-burner',
        difficulty: 'medium',
        xpReward: 35,
        estimatedMinutes: 8,
        tags: ['memory', 'spatial'],
    },
    {
        title: "Sequence Break",
        description: "Identify the missing element in increasingly complex number sequences.",
        type: 'brain-burner',
        difficulty: 'medium',
        xpReward: 30,
        estimatedMinutes: 10,
        tags: ['pattern', 'math'],
    },
    {
        title: "Word Forge",
        description: "Create the longest possible word from a set of scrambled letters.",
        type: 'brain-burner',
        difficulty: 'easy',
        xpReward: 20,
        estimatedMinutes: 5,
        tags: ['language', 'vocabulary'],
    },
    {
        title: "Cipher Decode",
        description: "Decrypt a substitution cipher using frequency analysis and pattern matching.",
        type: 'brain-burner',
        difficulty: 'hard',
        xpReward: 55,
        estimatedMinutes: 20,
        tags: ['cryptography', 'analysis'],
    },
];

const AUTOPILOT_POOL: Omit<Task, 'id' | 'status' | 'createdAt'>[] = [
    {
        title: "Daily Reflection",
        description: "Write three things you learned today in one sentence each.",
        type: 'autopilot',
        difficulty: 'easy',
        xpReward: 10,
        estimatedMinutes: 3,
        tags: ['reflection', 'journaling'],
    },
    {
        title: "Flashcard Review",
        description: "Review 10 spaced-repetition flashcards from your active deck.",
        type: 'autopilot',
        difficulty: 'easy',
        xpReward: 15,
        estimatedMinutes: 5,
        tags: ['review', 'spaced-repetition'],
    },
    {
        title: "Inbox Zero",
        description: "Process pending notifications and mark items as done or deferred.",
        type: 'autopilot',
        difficulty: 'easy',
        xpReward: 10,
        estimatedMinutes: 4,
        tags: ['organization', 'cleanup'],
    },
    {
        title: "Quick Quiz",
        description: "Answer 5 multiple-choice questions on a topic you are studying.",
        type: 'autopilot',
        difficulty: 'medium',
        xpReward: 20,
        estimatedMinutes: 6,
        tags: ['quiz', 'assessment'],
    },
    {
        title: "Progress Snapshot",
        description: "Review your weekly stats and identify one area to improve.",
        type: 'autopilot',
        difficulty: 'easy',
        xpReward: 10,
        estimatedMinutes: 3,
        tags: ['review', 'planning'],
    },
];

/**
 * Generates a realistic set of tasks for the current session,
 * drawing from both Brain Burner and Autopilot pools.
 */
export function generateDailyTasks(): Task[] {
    const now = new Date();
    const tasks: Task[] = [];

    BRAIN_BURNER_POOL.forEach((template, i) => {
        tasks.push({
            ...template,
            id: `bb-${i}-${now.getTime()}`,
            status: 'pending',
            createdAt: now,
        });
    });

    AUTOPILOT_POOL.forEach((template, i) => {
        tasks.push({
            ...template,
            id: `ap-${i}-${now.getTime()}`,
            status: 'pending',
            createdAt: now,
        });
    });

    return tasks;
}

/**
 * Convenience: generate tasks and immediately run them through the scheduler.
 */
export function getScheduledTasks(context: SchedulingContext): SchedulingResult {
    const allTasks = generateDailyTasks();
    const pendingTasks = allTasks.filter((t) => t.status === 'pending');
    return scheduleTasks(pendingTasks, context);
}


/* ====================================================================
   ENERGY DATA ANALYTICS (retained from Part 1)
   ==================================================================== */

const HOURS_IN_DAY = 24;
const DAYS_IN_WEEK = 7;
const DAYS_IN_MONTH = 30;

export function calculateEnergyStats(data: EnergyData[]): EnergyStats {
    if (data.length === 0) {
        return {
            totalEnergy: 0,
            averageDaily: 0,
            peakUsage: 0,
            efficiency: 0,
            trend: 'stable',
            periodStart: new Date(),
            periodEnd: new Date(),
        };
    }

    const values = data.map((d) => d.value);
    const totalEnergy = values.reduce((sum, v) => sum + v, 0);
    const peakUsage = Math.max(...values);
    const uniqueDays = new Set(
        data.map((d) => new Date(d.timestamp).toDateString())
    ).size;
    const averageDaily = uniqueDays > 0 ? totalEnergy / uniqueDays : 0;

    const midpoint = Math.floor(data.length / 2);
    const firstHalf = values.slice(0, midpoint).reduce((s, v) => s + v, 0);
    const secondHalf = values.slice(midpoint).reduce((s, v) => s + v, 0);
    const trend: EnergyStats['trend'] =
        secondHalf > firstHalf * 1.05
            ? 'up'
            : secondHalf < firstHalf * 0.95
                ? 'down'
                : 'stable';

    const efficiency = peakUsage > 0 ? (averageDaily / peakUsage) * 100 : 0;
    const timestamps = data.map((d) => new Date(d.timestamp).getTime());

    return {
        totalEnergy: Math.round(totalEnergy * 100) / 100,
        averageDaily: Math.round(averageDaily * 100) / 100,
        peakUsage: Math.round(peakUsage * 100) / 100,
        efficiency: Math.round(efficiency * 100) / 100,
        trend,
        periodStart: new Date(Math.min(...timestamps)),
        periodEnd: new Date(Math.max(...timestamps)),
    };
}

export function getDashboardStats(data: EnergyData[]): DashboardStats {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - DAYS_IN_WEEK);
    const monthStart = new Date(todayStart);
    monthStart.setDate(monthStart.getDate() - DAYS_IN_MONTH);

    const todayData = data.filter((d) => new Date(d.timestamp) >= todayStart);
    const weekData = data.filter((d) => new Date(d.timestamp) >= weekStart);
    const monthData = data.filter((d) => new Date(d.timestamp) >= monthStart);

    const currentEnergy = todayData.reduce((sum, d) => sum + d.value, 0);
    const weeklyTotal = weekData.reduce((sum, d) => sum + d.value, 0);
    const monthlyTotal = monthData.reduce((sum, d) => sum + d.value, 0);

    const dailyValues: number[] = [];
    for (let i = 0; i < DAYS_IN_MONTH; i++) {
        const dayStart = new Date(todayStart);
        dayStart.setDate(dayStart.getDate() - i);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        const dayTotal = data
            .filter((d) => {
                const t = new Date(d.timestamp);
                return t >= dayStart && t < dayEnd;
            })
            .reduce((sum, d) => sum + d.value, 0);
        dailyValues.push(dayTotal);
    }

    const dailyAverage =
        dailyValues.length > 0
            ? dailyValues.reduce((s, v) => s + v, 0) / dailyValues.length
            : 0;

    const carbonFactor = 0.42;
    const carbonOffset = monthlyTotal * carbonFactor;
    const savingsPercent =
        dailyAverage > 0
            ? Math.max(0, ((dailyAverage - currentEnergy) / dailyAverage) * 100)
            : 0;

    return {
        currentEnergy: Math.round(currentEnergy * 100) / 100,
        dailyAverage: Math.round(dailyAverage * 100) / 100,
        weeklyTotal: Math.round(weeklyTotal * 100) / 100,
        monthlyTotal: Math.round(monthlyTotal * 100) / 100,
        savingsPercent: Math.round(savingsPercent * 100) / 100,
        carbonOffset: Math.round(carbonOffset * 100) / 100,
    };
}

export function generateChartData(
    data: EnergyData[],
    days: number = DAYS_IN_WEEK
): ChartDataPoint[] {
    const now = new Date();
    const points: ChartDataPoint[] = [];

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const colors = [
        '#6366f1',
        '#8b5cf6',
        '#a78bfa',
        '#c4b5fd',
        '#818cf8',
        '#7c3aed',
        '#6d28d9',
    ];

    for (let i = days - 1; i >= 0; i--) {
        const dayStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - i
        );
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const dayTotal = data
            .filter((d) => {
                const t = new Date(d.timestamp);
                return t >= dayStart && t < dayEnd;
            })
            .reduce((sum, d) => sum + d.value, 0);

        points.push({
            label: dayLabels[dayStart.getDay()],
            value: Math.round(dayTotal * 100) / 100,
            color: colors[i % colors.length],
        });
    }

    return points;
}

export function generateMockEnergyData(
    days: number = DAYS_IN_MONTH
): EnergyData[] {
    const data: EnergyData[] = [];
    const now = new Date();
    const categories: EnergyData['category'][] = [
        'solar',
        'wind',
        'hydro',
        'grid',
    ];
    const sources = [
        'Panel Array A',
        'Turbine North',
        'Hydro Station',
        'Grid Import',
    ];

    for (let d = 0; d < days; d++) {
        const hoursToGenerate =
            HOURS_IN_DAY - Math.floor(Math.random() * (HOURS_IN_DAY / 4));
        for (let h = 0; h < hoursToGenerate; h++) {
            const timestamp = new Date(now);
            timestamp.setDate(timestamp.getDate() - d);
            timestamp.setHours(h, 0, 0, 0);

            const catIndex = Math.floor(Math.random() * categories.length);
            const baseValue = 2 + Math.random() * 8;
            const timeMultiplier =
                h >= 6 && h <= 18
                    ? 1.5 + Math.random() * 0.5
                    : 0.5 + Math.random() * 0.3;

            data.push({
                id: `energy-${d}-${h}-${catIndex}`,
                userId: 'mock-user',
                value: Math.round(baseValue * timeMultiplier * 100) / 100,
                unit: 'kWh',
                timestamp,
                source: sources[catIndex],
                category: categories[catIndex],
            });
        }
    }

    return data;
}
