"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { subscribeToGhostCount } from "@/lib/ghostPresence";

interface GhostPresenceProps {
    focusActive: boolean;
}

export default function GhostPresence({ focusActive }: GhostPresenceProps) {
    const { user } = useAuth();
    const [ghostCount, setGhostCount] = useState(0);

    useEffect(() => {
        if (!user) return;
        const unsub = subscribeToGhostCount(user.uid, setGhostCount);
        return () => unsub();
    }, [user]);

    // Nothing to show if nobody else is focusing and user is not in focus mode
    if (ghostCount === 0 && !focusActive) return null;

    return (
        <div className="fixed bottom-5 left-5 z-40 animate-fade-in">
            <div className="flex items-center gap-2.5 group cursor-default">
                {/* Glowing dot */}
                <div className="relative">
                    <div
                        className={`w-2.5 h-2.5 rounded-full transition-colors duration-500 ${ghostCount > 0
                                ? "bg-[var(--accent-primary)]"
                                : "bg-[var(--text-muted)]"
                            }`}
                    />

                    {/* Pulse ring when others are focusing */}
                    {ghostCount > 0 && (
                        <div
                            className="absolute inset-0 rounded-full animate-ghost-pulse"
                            style={{
                                boxShadow: `0 0 8px var(--accent-primary), 0 0 16px rgba(99, 102, 241, 0.2)`,
                            }}
                        />
                    )}
                </div>

                {/* Label - appears on hover or when others present */}
                <span
                    className={`text-[11px] tracking-wide transition-all duration-500 ${ghostCount > 0
                            ? "text-[var(--text-secondary)] opacity-100"
                            : "text-[var(--text-muted)] opacity-0 group-hover:opacity-100"
                        }`}
                >
                    {ghostCount > 0
                        ? `${ghostCount} other${ghostCount === 1 ? "" : "s"} focusing`
                        : "No one else here"}
                </span>
            </div>
        </div>
    );
}
