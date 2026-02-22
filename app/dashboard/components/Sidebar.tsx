'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOutUser } from '@/lib/auth';

interface NavItem {
    label: string;
    icon: string;
    sectionId: string;
}

const navItems: NavItem[] = [
    { label: 'Overview', icon: '📊', sectionId: 'section-overview' },
    { label: 'Analytics', icon: '📈', sectionId: 'section-analytics' },
    { label: 'Sources', icon: '⚡', sectionId: 'section-sources' },
    { label: 'Reports', icon: '📋', sectionId: 'section-reports' },
    { label: 'Settings', icon: '⚙️', sectionId: 'section-settings' },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    userName: string | null;
    userEmail: string | null;
    userRank: string;
    userLevel: number;
    userXp: number;
}

export default function Sidebar({
    isOpen,
    onClose,
    userName,
    userEmail,
    userRank,
    userLevel,
    userXp,
}: SidebarProps) {
    const router = useRouter();
    const [activeItem, setActiveItem] = useState('Overview');

    function handleSignOut() {
        // Fire and forget the sign out network request
        signOutUser().catch(console.error);
        // Force the redirect instantly so the UI never hangs
        window.location.href = '/';
    }

    const handleNavClick = useCallback((item: NavItem) => {
        setActiveItem(item.label);
        const el = document.getElementById(item.sectionId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        // Close mobile sidebar after navigation
        onClose();
    }, [onClose]);

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 h-full w-[280px] bg-[var(--bg-secondary)] border-r border-[var(--border-primary)]
          z-50 transition-transform duration-300 ease-in-out flex flex-col
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                {/* Logo */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--border-primary)]">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                            <span className="text-white font-bold text-lg">E</span>
                        </div>
                        <span className="text-lg font-bold tracking-tight">Eclipse</span>
                    </Link>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors duration-300"
                        aria-label="Close sidebar"
                    >
                        <svg
                            className="w-5 h-5 text-[var(--text-muted)]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => handleNavClick(item)}
                            aria-current={activeItem === item.label ? 'page' : undefined}
                            className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-300 text-left
                ${activeItem === item.label
                                    ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-hover)] border border-[var(--accent-primary)]/20'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] border border-transparent'
                                }
              `}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-[var(--border-primary)]">
                    {/* Rank & Level badge */}
                    <div className="mx-4 mb-3 px-3 py-2 rounded-xl bg-[var(--accent-glow)] border border-[var(--accent-primary)]/20">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-[var(--accent-hover)] font-semibold">
                                {userRank}
                            </span>
                            <span className="text-[var(--text-muted)]">
                                Lv. {userLevel}
                            </span>
                        </div>
                        <div className="mt-1.5 w-full h-1.5 rounded-full bg-[var(--bg-hover)] overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] transition-all duration-500"
                                style={{
                                    width: `${Math.min((userXp % 100), 100)}%`,
                                }}
                            />
                        </div>
                        <div className="mt-1 text-[10px] text-[var(--text-muted)] text-right">
                            {userXp} XP
                        </div>
                    </div>

                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-semibold">
                                {userName?.charAt(0)?.toUpperCase() ||
                                    userEmail?.charAt(0)?.toUpperCase() ||
                                    'U'}
                            </span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                                {userName || 'User'}
                            </p>
                            <p className="text-xs text-[var(--text-muted)] truncate">
                                {userEmail || 'Guest'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--error)]/10 hover:text-[var(--error)] transition-all duration-300 border border-transparent hover:border-[var(--error)]/20 relative z-50 cursor-pointer pointer-events-auto"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                        </svg>
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
}

