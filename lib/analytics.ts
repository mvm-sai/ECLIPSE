/* ====================================================================
   ANALYTICS ENGINE
   
   Pure computation functions for the analytics dashboard.
   All data is generated deterministically from mock seeds.
   ==================================================================== */

/* ── Types ──────────────────────────────────────────────────────────── */

export interface FocusSession {
    date: Date;
    durationMinutes: number;
    type: "brain-burner" | "autopilot";
    depthScore: number; // 0-100
}

export interface HeatmapCell {
    day: number; // 0-6 (Sun-Sat)
    hour: number; // 0-23
    intensity: number; // 0-1
    sessions: number;
}

export interface XPTrendPoint {
    label: string;
    xp: number;
    level: number;
}

export interface DepthBucket {
    label: string;
    count: number;
    percentage: number;
    color: string;
}

export interface TaskRatio {
    brainBurner: number;
    autopilot: number;
    total: number;
}

export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    last30Days: boolean[]; // true = active day
}

/* ── Mock Session Generator ─────────────────────────────────────────── */

function seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
        s = (s * 16807 + 0) % 2147483647;
        return s / 2147483647;
    };
}

export function generateMockSessions(days: number = 30): FocusSession[] {
    const sessions: FocusSession[] = [];
    const now = new Date();
    const rand = seededRandom(42);

    for (let d = 0; d < days; d++) {
        const date = new Date(now);
        date.setDate(date.getDate() - d);
        date.setHours(0, 0, 0, 0);

        // 1-4 sessions per day, some days skipped
        if (rand() < 0.15) continue; // 15% chance of no sessions
        const sessCount = Math.floor(rand() * 4) + 1;

        for (let s = 0; s < sessCount; s++) {
            const hour = 8 + Math.floor(rand() * 12); // 8am - 8pm
            const sessionDate = new Date(date);
            sessionDate.setHours(hour, Math.floor(rand() * 60));

            const isBrainBurner = rand() > 0.55;
            sessions.push({
                date: sessionDate,
                durationMinutes: isBrainBurner
                    ? rand() > 0.5 ? 50 : 25
                    : 25,
                type: isBrainBurner ? "brain-burner" : "autopilot",
                depthScore: Math.floor(40 + rand() * 60),
            });
        }
    }

    return sessions;
}

/* ── Focus Heatmap ──────────────────────────────────────────────────── */

export function computeHeatmap(sessions: FocusSession[]): HeatmapCell[] {
    const grid = new Map<string, { sessions: number; totalMinutes: number }>();

    // Initialize all cells
    for (let day = 0; day < 7; day++) {
        for (let hour = 6; hour < 22; hour++) {
            grid.set(`${day}-${hour}`, { sessions: 0, totalMinutes: 0 });
        }
    }

    sessions.forEach((s) => {
        const day = s.date.getDay();
        const hour = s.date.getHours();
        if (hour < 6 || hour >= 22) return;
        const key = `${day}-${hour}`;
        const cell = grid.get(key);
        if (cell) {
            cell.sessions++;
            cell.totalMinutes += s.durationMinutes;
        }
    });

    const maxMinutes = Math.max(
        ...Array.from(grid.values()).map((v) => v.totalMinutes),
        1
    );

    const cells: HeatmapCell[] = [];
    grid.forEach((val, key) => {
        const [day, hour] = key.split("-").map(Number);
        cells.push({
            day,
            hour,
            intensity: val.totalMinutes / maxMinutes,
            sessions: val.sessions,
        });
    });

    return cells;
}

/* ── XP Trend ───────────────────────────────────────────────────────── */

export function computeXPTrend(
    sessions: FocusSession[],
    days: number = 30
): XPTrendPoint[] {
    const now = new Date();
    const points: XPTrendPoint[] = [];
    let cumulativeXP = 0;

    for (let d = days - 1; d >= 0; d--) {
        const date = new Date(now);
        date.setDate(date.getDate() - d);
        const dayStr = date.toDateString();

        const daySessions = sessions.filter(
            (s) => s.date.toDateString() === dayStr
        );
        daySessions.forEach((s) => {
            cumulativeXP += s.type === "brain-burner" ? 25 : 10;
        });

        const label = `${date.getMonth() + 1}/${date.getDate()}`;
        points.push({
            label,
            xp: cumulativeXP,
            level: Math.floor(cumulativeXP / 100) + 1,
        });
    }

    return points;
}

/* ── Focus Depth ────────────────────────────────────────────────────── */

export function computeDepthDistribution(
    sessions: FocusSession[]
): DepthBucket[] {
    const buckets = [
        { label: "Shallow", min: 0, max: 50, count: 0, color: "#64748b" },
        { label: "Moderate", min: 50, max: 70, count: 0, color: "#6366f1" },
        { label: "Deep", min: 70, max: 85, count: 0, color: "#8b5cf6" },
        { label: "Flow State", min: 85, max: 101, count: 0, color: "#22c55e" },
    ];

    sessions.forEach((s) => {
        const bucket = buckets.find(
            (b) => s.depthScore >= b.min && s.depthScore < b.max
        );
        if (bucket) bucket.count++;
    });

    const total = Math.max(sessions.length, 1);

    return buckets.map((b) => ({
        label: b.label,
        count: b.count,
        percentage: Math.round((b.count / total) * 100),
        color: b.color,
    }));
}

/* ── Task Ratio ─────────────────────────────────────────────────────── */

export function computeTaskRatio(sessions: FocusSession[]): TaskRatio {
    const brainBurner = sessions.filter((s) => s.type === "brain-burner").length;
    const autopilot = sessions.filter((s) => s.type === "autopilot").length;
    return { brainBurner, autopilot, total: sessions.length };
}

/* ── Consistency Streak ─────────────────────────────────────────────── */

export function computeStreaks(
    sessions: FocusSession[],
    days: number = 30
): StreakData {
    const now = new Date();
    const activeDays: boolean[] = [];

    for (let d = days - 1; d >= 0; d--) {
        const date = new Date(now);
        date.setDate(date.getDate() - d);
        const dayStr = date.toDateString();
        activeDays.push(sessions.some((s) => s.date.toDateString() === dayStr));
    }

    // Current streak (from today backwards)
    let currentStreak = 0;
    for (let i = activeDays.length - 1; i >= 0; i--) {
        if (activeDays[i]) currentStreak++;
        else break;
    }

    // Longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    activeDays.forEach((active) => {
        if (active) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else {
            tempStreak = 0;
        }
    });

    return { currentStreak, longestStreak, last30Days: activeDays };
}
