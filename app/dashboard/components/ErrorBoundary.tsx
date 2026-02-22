"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Catches unhandled runtime errors in child components.
 * Shows a calm, branded fallback UI instead of a blank screen.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(_error: Error, _info: ErrorInfo) {
        // Production: send to error reporting service
        // No console.log — keep prod clean
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="min-h-[200px] flex items-center justify-center p-8">
                    <div className="text-center max-w-sm">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[var(--accent-glow)] border border-[var(--accent-primary)]/20 flex items-center justify-center">
                            <span className="text-lg">&#x26A0;</span>
                        </div>
                        <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">
                            Something went wrong
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] mb-4">
                            This section encountered an error. Try refreshing the page.
                        </p>
                        <button
                            onClick={() => this.setState({ hasError: false, error: null })}
                            className="text-xs font-medium text-[var(--accent-hover)] hover:text-[var(--accent-primary)] transition-colors duration-300"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
