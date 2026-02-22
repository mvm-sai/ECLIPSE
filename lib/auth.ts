import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInAnonymously,
    signOut,
    onAuthStateChanged,
    updateProfile,
    type User as FirebaseUser,
    type NextOrObserver,
} from 'firebase/auth';
import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import { DEFAULT_USER_DOC } from '@/types';

/**
 * Create or merge the Firestore user document at users/{uid}.
 * On first signup the full default schema is written; on subsequent
 * logins only lastActiveTime is bumped.
 */
async function ensureUserDoc(
    fbUser: FirebaseUser,
    extra?: { displayName?: string }
) {
    const ref = doc(db, 'users', fbUser.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        await setDoc(ref, {
            ...DEFAULT_USER_DOC,
            displayName: extra?.displayName ?? fbUser.displayName ?? null,
            email: fbUser.email ?? null,
            photoURL: fbUser.photoURL ?? null,
            createdAt: serverTimestamp(),
            lastActiveTime: serverTimestamp(),
        });
    } else {
        await setDoc(ref, { lastActiveTime: serverTimestamp() }, { merge: true });
    }
}

// ── Email + Password ────────────────────────────────────────────────

export async function signUp(
    email: string,
    password: string,
    displayName?: string
) {
    const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );

    if (displayName) {
        await updateProfile(userCredential.user, { displayName });
    }

    await ensureUserDoc(userCredential.user, { displayName });
    return userCredential.user;
}

export async function signIn(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
    );
    await ensureUserDoc(userCredential.user);
    return userCredential.user;
}

// ── Google OAuth ────────────────────────────────────────────────────

export async function signInWithGoogle() {
    if (!googleProvider) {
        throw new Error('Google Auth provider is not configured.');
    }
    const result = await signInWithPopup(auth, googleProvider);
    await ensureUserDoc(result.user);
    return result.user;
}

// ── Guest / Anonymous ───────────────────────────────────────────────

export async function signInAsGuest() {
    const userCredential = await signInAnonymously(auth);
    await ensureUserDoc(userCredential.user, { displayName: 'Guest' });
    return userCredential.user;
}

// ── Sign Out ────────────────────────────────────────────────────────

export async function signOutUser() {
    await signOut(auth);
}

// ── Auth State Listener ─────────────────────────────────────────────

export function onAuthChange(callback: NextOrObserver<FirebaseUser>) {
    if (
        !auth ||
        typeof (auth as unknown as Record<string, unknown>).onAuthStateChanged ===
        'undefined'
    ) {
        if (typeof callback === 'function') {
            callback(null as unknown as FirebaseUser);
        }
        return () => { };
    }
    return onAuthStateChanged(auth, callback);
}
