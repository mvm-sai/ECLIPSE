'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';
import { type User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { onAuthChange } from '@/lib/auth';
import type { AuthState, User } from '@/types';

interface AuthContextType extends AuthState {
    firebaseUser: FirebaseUser | null;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    firebaseUser: null,
    loading: true,
    error: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthChange((fbUser) => {
            if (fbUser && !(fbUser instanceof Error)) {
                setFirebaseUser(fbUser);
            } else {
                setFirebaseUser(null);
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // Subscribe to the Firestore user doc whenever the Firebase user changes
    useEffect(() => {
        if (!firebaseUser) {
            setUser(null);
            return;
        }

        // Firestore might be a stub during build — guard
        if (!db || typeof (db as unknown as Record<string, unknown>).type === 'undefined') {
            // Fallback: build a minimal User from FirebaseUser
            setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                xp: 0,
                level: 1,
                rank: 'Beginner',
                energyProfile: { brainBurnersCompletedToday: 0 },
                storyState: { chapter: 1, alignment: 'neutral' },
                lastActiveTime: new Date(),
                createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
            });
            setLoading(false);
            return;
        }

        const ref = doc(db, 'users', firebaseUser.uid);
        const unsub = onSnapshot(
            ref,
            (snap) => {
                if (snap.exists()) {
                    const data = snap.data();
                    setUser({
                        uid: firebaseUser.uid,
                        email: data.email ?? firebaseUser.email,
                        displayName: data.displayName ?? firebaseUser.displayName,
                        photoURL: data.photoURL ?? firebaseUser.photoURL,
                        xp: data.xp ?? 0,
                        level: data.level ?? 1,
                        rank: data.rank ?? 'Initiate',
                        energyProfile: data.energyProfile ?? {
                            brainBurnersCompletedToday: 0,
                        },
                        storyState: data.storyState ?? {
                            chapter: 1,
                            alignment: 'neutral',
                        },
                        lastActiveTime: data.lastActiveTime?.toDate?.() ?? new Date(),
                        createdAt: data.createdAt?.toDate?.() ?? new Date(),
                    });
                } else {
                    // Doc hasn't been created yet — use fallback
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL,
                        xp: 0,
                        level: 1,
                        rank: 'Beginner',
                        energyProfile: { brainBurnersCompletedToday: 0 },
                        storyState: { chapter: 1, alignment: 'neutral' },
                        lastActiveTime: new Date(),
                        createdAt: new Date(
                            firebaseUser.metadata.creationTime || Date.now()
                        ),
                    });
                }
                setError(null);
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsub();
    }, [firebaseUser]);

    return (
        <AuthContext.Provider value={{ user, firebaseUser, loading, error }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
