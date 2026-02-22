'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

/* ─── Data ──────────────────────────────────────────────────────── */

const problems = [
  {
    stat: '88%',
    caption: 'of New Year resolutions fail by February',
  },
  {
    stat: '2.5h',
    caption: 'per day lost to unfocused screen time',
  },
  {
    stat: '73%',
    caption: 'of students say they lack study structure',
  },
];

const features = [
  {
    title: 'Focus Engine',
    description:
      'Structured micro-sessions that align with your cognitive rhythm. No more staring at a blank screen.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    title: 'Story-Driven Progress',
    description:
      'Your goals unfold through an evolving narrative. Every session advances your chapter, not just a bar chart.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    title: 'Brain Burners',
    description:
      'Adaptive daily challenges calibrated to your level. Streak rewards compound — consistency becomes addictive.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
      </svg>
    ),
  },
  {
    title: 'XP Economy',
    description:
      'A progression system that mirrors real-world growth. Rank up from Initiate through mastery tiers.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0013.125 10.875h-2.25A3.375 3.375 0 007.5 14.25v4.5m6-11.25V3.375c0-.621-.504-1.125-1.125-1.125h-.75A1.125 1.125 0 0010.5 3.375V6.75" />
      </svg>
    ),
  },
  {
    title: 'Energy Profiling',
    description:
      'Track cognitive load, peak hours, and attention patterns. Eclipse learns you, then optimizes for you.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: 'Zero Noise',
    description:
      'No social feeds. No vanity metrics. Eclipse is a tool, not another attention trap.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.143 17.082a24.248 24.248 0 005.714 0m-5.714 0a24.248 24.248 0 01-5.714-2.654M9.143 17.082A24.234 24.234 0 0112 17.25c.967 0 1.922-.043 2.857-.168m-5.714 0V14.25m5.714 2.832a24.244 24.244 0 005.714-2.654M14.857 17.082V14.25M3.429 14.428A23.954 23.954 0 003 12c0-1.392.119-2.755.346-4.078m.083-.178A24.258 24.258 0 0112 4.5c3.197 0 6.224.617 9 1.736m.571.342A23.963 23.963 0 0121 12a23.953 23.953 0 01-.429 2.428M21.571 6.578c.253 1.28.379 2.6.379 3.946m-18 3.904V9.514m0 4.914v3.197c0 .6.24 1.179.669 1.606" />
      </svg>
    ),
  },
];

const comparisons = [
  { label: 'Gamified Progress', eclipse: true, others: false },
  { label: 'Story-Driven Learning', eclipse: true, others: false },
  { label: 'Adaptive Difficulty', eclipse: true, others: false },
  { label: 'Cognitive Profiling', eclipse: true, others: false },
  { label: 'Privacy-First (No Social)', eclipse: true, others: false },
  { label: 'Generic To-Do Lists', eclipse: false, others: true },
  { label: 'Ad-Supported Model', eclipse: false, others: true },
];

/* ─── Component ─────────────────────────────────────────────────── */

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--bg-primary)]">
      {/* ── Ambient ─────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-30%] left-[50%] translate-x-[-50%] w-[800px] h-[800px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, var(--accent-primary), transparent 65%)' }}
        />
        <div className="absolute bottom-[-20%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, var(--accent-secondary), transparent 65%)' }}
        />
      </div>

      {/* ── Nav ──────────────────────────────────────────────────── */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-16 lg:px-24 py-5">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <span className="text-white font-semibold text-sm">E</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
            Eclipse
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="w-20 h-9 rounded-lg bg-[var(--bg-card)] animate-pulse" />
          ) : user ? (
            <Link href="/dashboard" className="btn-primary text-sm px-5 py-2.5 inline-flex items-center">
              <span>Dashboard</span>
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-300 px-4 py-2 hidden sm:inline-block">
                Sign in
              </Link>
              <Link href="/signup" className="btn-primary text-sm px-5 py-2.5 inline-flex items-center">
                <span>Get Started</span>
              </Link>
            </>
          )}
        </div>
      </nav>


      {/* ══════════════════════════════════════════════════════════
           SECTION 1 — HERO
         ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-16 lg:px-24 pt-20 md:pt-32 pb-28 md:pb-40">
        <div className="max-w-3xl mx-auto text-center">
          {/* Eclipse Ring Logo */}
          <div className="flex justify-center mb-12 animate-slide-up">
            <div className="relative w-28 h-28 md:w-36 md:h-36">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-2 border-[var(--accent-primary)]/30 animate-ring-spin" />
              {/* Middle ring */}
              <div className="absolute inset-3 rounded-full border border-[var(--accent-primary)]/20 animate-ring-spin-reverse" />
              {/* Inner glow core */}
              <div className="absolute inset-6 md:inset-8 rounded-full bg-[var(--bg-primary)] border border-[var(--accent-primary)]/40 animate-eclipse-pulse flex items-center justify-center">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] opacity-80" />
              </div>
              {/* Orbital dot */}
              <div className="absolute inset-0 animate-ring-spin" style={{ animationDuration: '8s' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]" />
              </div>
            </div>
          </div>

          <h1 className="animate-slide-up stagger-2 text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold leading-[1.08] tracking-[-0.03em] mb-6">
            Reclaim Your
            <br />
            <span className="accent-gradient-text">Attention.</span>
          </h1>

          <p className="animate-slide-up stagger-3 text-base md:text-lg text-[var(--text-secondary)] max-w-lg mx-auto mb-10 leading-relaxed font-normal">
            Eclipse turns goals into structured progress — through focus
            sessions, story-driven challenges, and a system that learns how
            you think.
          </p>

          <div className="animate-slide-up stagger-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className="btn-primary text-[15px] px-8 py-3.5 w-full sm:w-auto text-center">
              <span>Get Started</span>
            </Link>
            <Link href="/login" className="btn-secondary text-[15px] px-8 py-3.5 w-full sm:w-auto text-center">
              Sign In
            </Link>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════
           SECTION 2 — PROBLEM
         ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-16 lg:px-24 pb-28 md:pb-36">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14 animate-slide-up">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent-primary)] font-medium mb-4">
              The Problem
            </p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-[-0.02em] leading-tight">
              Productivity tools weren&apos;t built
              <br className="hidden sm:block" />
              for how your brain actually works.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {problems.map((item, i) => (
              <div
                key={item.stat}
                className={`glass-card-static p-8 text-center animate-slide-up stagger-${i + 2}`}
              >
                <div className="text-3xl md:text-4xl font-bold accent-gradient-text mb-2">
                  {item.stat}
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {item.caption}
                </p>
              </div>
            ))}
          </div>

          <p className="text-center text-[var(--text-muted)] text-sm mt-10 max-w-md mx-auto leading-relaxed animate-slide-up stagger-5">
            The issue isn&apos;t motivation — it&apos;s architecture. Most
            tools give you a blank canvas when you need a blueprint.
          </p>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════
           SECTION 3 — FEATURES
         ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-16 lg:px-24 pb-28 md:pb-36">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 animate-slide-up">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent-primary)] font-medium mb-4">
              How It Works
            </p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-[-0.02em]">
              Built around cognition, not checklists.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`glass-card p-7 animate-slide-up stagger-${i + 1}`}
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/15 flex items-center justify-center text-[var(--accent-hover)] mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold mb-2 text-[var(--text-primary)]">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════
           SECTION 4 — BLUE OCEAN DIFFERENTIATION
         ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-16 lg:px-24 pb-28 md:pb-36">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14 animate-slide-up">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent-primary)] font-medium mb-4">
              Differentiation
            </p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-[-0.02em]">
              Not another to-do app.
            </h2>
          </div>

          <div className="glass-card-static overflow-hidden animate-slide-up stagger-2">
            {/* Header row */}
            <div className="grid grid-cols-3 text-xs uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium border-b border-[var(--border-subtle)]">
              <div className="p-4 md:p-5" />
              <div className="p-4 md:p-5 text-center text-[var(--accent-hover)]">Eclipse</div>
              <div className="p-4 md:p-5 text-center">Others</div>
            </div>

            {/* Rows */}
            {comparisons.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-3 text-sm ${i < comparisons.length - 1
                    ? 'border-b border-[var(--border-subtle)]'
                    : ''
                  }`}
              >
                <div className="p-4 md:p-5 text-[var(--text-secondary)]">
                  {row.label}
                </div>
                <div className="p-4 md:p-5 flex justify-center">
                  {row.eclipse ? (
                    <svg className="w-5 h-5 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <span className="w-5 h-5 flex items-center justify-center text-[var(--text-muted)]">—</span>
                  )}
                </div>
                <div className="p-4 md:p-5 flex justify-center">
                  {row.others ? (
                    <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <span className="w-5 h-5 flex items-center justify-center text-[var(--text-muted)]">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════
           SECTION 5 — FINAL CTA
         ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-16 lg:px-24 pb-24 md:pb-32">
        <div className="max-w-2xl mx-auto text-center animate-slide-up">
          <div className="glass-card-static p-10 md:p-16 relative overflow-hidden">
            {/* Subtle glow behind card */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                background:
                  'radial-gradient(ellipse at center, var(--accent-primary), transparent 70%)',
              }}
            />

            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold tracking-[-0.02em] mb-4">
                Start building momentum.
              </h2>
              <p className="text-[var(--text-secondary)] text-sm md:text-base max-w-md mx-auto mb-8 leading-relaxed">
                Join Eclipse and transform scattered potential into structured
                progress. Free to start. No credit card.
              </p>
              <Link
                href="/signup"
                className="btn-primary text-[15px] px-10 py-4 inline-flex items-center"
              >
                <span>Get Started — Free</span>
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-[var(--border-subtle)] px-6 md:px-16 lg:px-24 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
            <div className="w-5 h-5 rounded bg-[var(--accent-primary)] flex items-center justify-center">
              <span className="text-white text-[10px] font-semibold">E</span>
            </div>
            © 2026 Eclipse
          </div>
          <div className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
            <span className="hover:text-[var(--text-secondary)] transition-colors duration-300 cursor-pointer">
              Privacy
            </span>
            <span className="hover:text-[var(--text-secondary)] transition-colors duration-300 cursor-pointer">
              Terms
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
