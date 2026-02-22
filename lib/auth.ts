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

/* ====================================================================
   DEMO MODE
   When Firebase is not configured (no API key), the app runs in demo
   mode with a mock user. This lets the full UI work offline.
   ==================================================================== */

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const IS_DEMO =
    !apiKey ||
    apiKey.includes('your_api_key') ||
    apiKey === 'undefined' ||
    !auth ||
    Object.keys(auth).length === 0;

// Event emitter for demo auth state changes
type DemoAuthCallback = (user: FirebaseUser | null) => void;
let demoCallbacks: DemoAuthCallback[] = [];
let demoUser: FirebaseUser | null = null;

function createDemoFirebaseUser(name: string, email: string): FirebaseUser {
    return {
        uid: 'demo-user-001',
        email,
        displayName: name,
        photoURL: null,
        emailVerified: true,
        isAnonymous: false,
        metadata: { creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString() },
        providerData: [],
        refreshToken: '',
        tenantId: null,
        phoneNumber: null,
        providerId: 'demo',
        delete: async () => { },
        getIdToken: async () => 'demo-token',
        getIdTokenResult: async () => ({} as never),
        reload: async () => { },
        toJSON: () => ({}),
    } as unknown as FirebaseUser;
}

function setDemoUser(user: FirebaseUser | null) {
    demoUser = user;
    demoCallbacks.forEach((cb) => cb(user));
}

/* ====================================================================
   ENSURE USER DOC
   ==================================================================== */

async function ensureUserDoc(
    fbUser: FirebaseUser,
    extra?: { displayName?: string }
) {
    if (IS_DEMO) return; // Skip Firestore in demo mode

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
    if (IS_DEMO) {
        const user = createDemoFirebaseUser(displayName || 'Demo User', email);
        setDemoUser(user);
        return user;
    }

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
    if (IS_DEMO) {
        const user = createDemoFirebaseUser('Demo User', email);
        setDemoUser(user);
        return user;
    }

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
    if (IS_DEMO) {
        const user = createDemoFirebaseUser('Demo User', 'demo@eclipse.app');
        setDemoUser(user);
        return user;
    }

    if (!googleProvider) {
        throw new Error('Google Auth provider is not configured.');
    }
    const result = await signInWithPopup(auth, googleProvider);
    await ensureUserDoc(result.user);
    return result.user;
}

// ── Guest / Anonymous ───────────────────────────────────────────────

export async function signInAsGuest() {
    if (IS_DEMO) {
        const user = createDemoFirebaseUser('Guest', 'guest@eclipse.app');
        setDemoUser(user);
        return user;
    }

    const userCredential = await signInAnonymously(auth);
    await ensureUserDoc(userCredential.user, { displayName: 'Guest' });
    return userCredential.user;
}

// ── Sign Out ────────────────────────────────────────────────────────

export async function signOutUser() {
    // Always clear demo user just in case we are stuck in demo mode
    setDemoUser(null);

    try {
        if (IS_DEMO) return;
        await signOut(auth);
    } catch (e) {
        console.warn('Sign out error:', e);
    }
}

// ── Auth State Listener ─────────────────────────────────────────────

export function onAuthChange(callback: NextOrObserver<FirebaseUser>) {
    if (IS_DEMO) {
        const cb = callback as DemoAuthCallback;
        demoCallbacks.push(cb);
        // Fire immediately with current state
        cb(demoUser);
        return () => {
            demoCallbacks = demoCallbacks.filter((c) => c !== cb);
        };
    }

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

