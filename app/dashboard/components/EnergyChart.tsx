'use client';

import { memo } from 'react';
import type { ChartDataPoint } from '@/types';

interface EnergyChartProps {
    data: ChartDataPoint[];
    title?: string;
    height?: number;
}

export default memo(function EnergyChart({
    data,
    title = 'Energy Usage',
    height = 200,
}: EnergyChartProps) {
    const maxValue = Math.max(...data.map((d) => d.value), 1);

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-[var(--text-secondary)]">
                    {title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                    kWh
                </div>
            </div>

            <div
                className="flex items-end justify-between gap-2 sm:gap-3"
                style={{ height: `${height}px` }}
            >
                {data.map((point, i) => {
                    const barHeight = (point.value / maxValue) * 100;
                    return (
                        <div
                            key={`${point.label}-${i}`}
                            className="flex-1 flex flex-col items-center gap-2 group"
                        >
                            {/* Value tooltip */}
                            <div className="text-[10px] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
                                {point.value}
                            </div>

                            {/* Bar */}
                            <div className="w-full relative" style={{ height: `${height - 40}px` }}>
                                <div
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[40px] rounded-t-lg transition-all duration-500 ease-out group-hover:opacity-90"
                                    style={{
                                        height: `${barHeight}%`,
                                        background: `linear-gradient(to top, ${point.color || 'var(--accent-primary)'}, ${point.color || 'var(--accent-primary)'}88)`,
                                        animationDelay: `${i * 75}ms`,
                                        boxShadow: `0 0 15px ${point.color || 'var(--accent-primary)'}22`,
                                    }}
                                />
                            </div>

                            {/* Label */}
                            <span className="text-[11px] text-[var(--text-muted)] font-medium">
                                {point.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
