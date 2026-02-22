'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp, signInWithGoogle } from '@/lib/auth';

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);

        try {
            await signUp(email, password, name || undefined);
            router.push('/dashboard');
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Failed to create account';
            if (message.includes('email-already-in-use')) {
                setError('An account with this email already exists.');
            } else if (message.includes('weak-password')) {
                setError('Password is too weak. Use at least 6 characters.');
            } else if (message.includes('invalid-email')) {
                setError('Please enter a valid email address.');
            } else {
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleSignup() {
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

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div
                    className="absolute top-[20%] left-[50%] translate-x-[-50%] w-[500px] h-[500px] rounded-full opacity-[0.04]"
                    style={{
                        background:
                            'radial-gradient(circle, var(--accent-secondary), transparent 70%)',
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
                        <h1 className="text-2xl font-bold mb-2">Create your account</h1>
                        <p className="text-[var(--text-muted)] text-sm">
                            Start your free trial — no credit card required
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
                        onClick={handleGoogleSignup}
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
                                htmlFor="name"
                                className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
                            >
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input-field"
                                placeholder="John Doe"
                                autoComplete="name"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="signup-email"
                                className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
                            >
                                Email
                            </label>
                            <input
                                id="signup-email"
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
                                htmlFor="signup-password"
                                className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
                            >
                                Password
                            </label>
                            <input
                                id="signup-password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                                autoComplete="new-password"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="confirm-password"
                                className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
                            >
                                Confirm Password
                            </label>
                            <input
                                id="confirm-password"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                                autoComplete="new-password"
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
                                {loading ? 'Creating account...' : 'Create Account'}
                            </span>
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="text-[var(--accent-hover)] hover:text-[var(--accent-primary)] font-medium transition-colors duration-300"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
