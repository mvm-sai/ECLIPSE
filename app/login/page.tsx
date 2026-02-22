'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, signInWithGoogle, signInAsGuest } from '@/lib/auth';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await signIn(email, password);
            router.push('/dashboard');
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Failed to sign in';
            if (
                message.includes('user-not-found') ||
                message.includes('wrong-password') ||
                message.includes('invalid-credential')
            ) {
                setError('Invalid email or password.');
            } else if (message.includes('too-many-requests')) {
                setError('Too many attempts. Please try again later.');
            } else {
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleLogin() {
        setError(null);
        setLoading(true);
        try {
            await signInWithGoogle();
            router.push('/dashboard');
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Google sign-in failed';
            if (message.includes('popup-closed-by-user')) {
                setError(null);
            } else {
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleGuestLogin() {
        setError(null);
        setLoading(true);
        try {
            await signInAsGuest();
            router.push('/dashboard');
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Guest sign-in failed'
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div
                    className="absolute top-[20%] left-[50%] translate-x-[-50%] w-[500px] h-[500px] rounded-full opacity-[0.04]"
                    style={{
                        background:
                            'radial-gradient(circle, var(--accent-primary), transparent 70%)',
                    }}
                />
            </div>

            <div className="w-full max-w-md relative z-10 animate-slide-up">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center justify-center gap-3 mb-10 group"
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        <span className="text-white font-bold text-xl">E</span>
                    </div>
                    <span className="text-2xl font-bold tracking-tight">Eclipse</span>
                </Link>

                {/* Card */}
                <div className="glass-card p-8 md:p-10">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
                        <p className="text-[var(--text-muted)] text-sm">
                            Sign in to access your energy dashboard
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-[var(--error)]/10 border border-[var(--error)]/20 text-[var(--error)] text-sm animate-slide-down">
                            {error}
                        </div>
                    )}

                    {/* Google OAuth */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[var(--border-secondary)] bg-[var(--bg-tertiary)] text-sm font-medium text-[var(--text-primary)]
                       hover:bg-[var(--bg-hover)] hover:border-[var(--accent-primary)]/40 transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-[var(--border-primary)]" />
                        <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                            or
                        </span>
                        <div className="flex-1 h-px bg-[var(--border-primary)]" />
                    </div>

                    {/* Email form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="you@example.com"
                                autoComplete="email"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full text-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            <span className="flex items-center justify-center gap-2">
                                {loading && (
                                    <svg
                                        className="animate-spin w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                        />
                                    </svg>
                                )}
                                {loading ? 'Signing in...' : 'Sign In'}
                            </span>
                        </button>
                    </form>

                    {/* Guest login */}
                    <button
                        type="button"
                        onClick={handleGuestLogin}
                        disabled={loading}
                        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium
                       text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]
                       transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                        </svg>
                        Continue as Guest
                    </button>

                    <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
                        Don&apos;t have an account?{' '}
                        <Link
                            href="/signup"
                            className="text-[var(--accent-hover)] hover:text-[var(--accent-primary)] font-medium transition-colors duration-300"
                        >
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
