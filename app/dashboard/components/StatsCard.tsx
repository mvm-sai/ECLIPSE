import { memo } from 'react';

interface StatsCardProps {
    icon: string;
    label: string;
    value: string | number;
    unit?: string;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
    className?: string;
}

export default memo(function StatsCard({
    icon,
    label,
    value,
    unit,
    trend,
    trendValue,
    className = '',
}: StatsCardProps) {
    const trendColors = {
        up: 'text-[var(--success)]',
        down: 'text-[var(--error)]',
        stable: 'text-[var(--text-muted)]',
    };

    const trendIcons = {
        up: '↑',
        down: '↓',
        stable: '→',
    };

    return (
        <div className={`glass-card p-6 group relative overflow-hidden ${className}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="text-2xl">{icon}</div>
                {trend && trendValue && (
                    <div
                        className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg ${trendColors[trend]}`}
                        style={{
                            backgroundColor:
                                trend === 'up'
                                    ? 'rgba(34, 197, 94, 0.1)'
                                    : trend === 'down'
                                        ? 'rgba(239, 68, 68, 0.1)'
                                        : 'rgba(113, 113, 122, 0.1)',
                        }}
                    >
                        <span>{trendIcons[trend]}</span>
                        {trendValue}
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl md:text-3xl font-bold tracking-tight">
                        {value}
                    </span>
                    {unit && (
                        <span className="text-sm text-[var(--text-muted)] font-medium">
                            {unit}
                        </span>
                    )}
                </div>
                <p className="text-sm text-[var(--text-muted)]">{label}</p>
            </div>

            {/* Subtle glow on hover */}
            <div className="absolute inset-0 rounded-[16px] bg-gradient-to-br from-[var(--accent-primary)]/0 to-[var(--accent-secondary)]/0 group-hover:from-[var(--accent-primary)]/[0.02] group-hover:to-[var(--accent-secondary)]/[0.02] transition-all duration-300 pointer-events-none" />
        </div>
    );
});
