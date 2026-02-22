import {
    doc,
    setDoc,
    deleteDoc,
    collection,
    query,
    where,
    onSnapshot,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

/* ====================================================================
   GHOST PRESENCE SERVICE
   
   Firestore collection: ghostPresence/{uid}
     - isFocusing: boolean
     - timestamp: FieldValue (server timestamp)
   ==================================================================== */

const COLLECTION = "ghostPresence";

/**
 * Sets the current user as focusing in the ghost presence collection.
 */
export async function setGhostPresence(uid: string): Promise<void> {
    if (!db || typeof (db as unknown as Record<string, unknown>).type === "undefined") return;

    const ref = doc(db, COLLECTION, uid);
    await setDoc(ref, {
        isFocusing: true,
        timestamp: serverTimestamp(),
    });
}

/**
 * Clears the current user from the ghost presence collection.
 */
export async function clearGhostPresence(uid: string): Promise<void> {
    if (!db || typeof (db as unknown as Record<string, unknown>).type === "undefined") return;

    const ref = doc(db, COLLECTION, uid);
    await deleteDoc(ref);
}

/**
 * Subscribes to the count of OTHER users currently focusing.
 * Excludes the current user from the count.
 *
 * Returns an unsubscribe function.
 */
export function subscribeToGhostCount(
    currentUid: string,
    onCount: (count: number) => void
): () => void {
    if (!db || typeof (db as unknown as Record<string, unknown>).type === "undefined") {
        onCount(0);
        return () => { };
    }

    const q = query(
        collection(db, COLLECTION),
        where("isFocusing", "==", true)
    );

    const unsub = onSnapshot(
        q,
        (snapshot) => {
            const others = snapshot.docs.filter((d) => d.id !== currentUid);
            onCount(others.length);
        },
        () => {
            // Firestore error (permissions, offline, etc.) - fail silently
            onCount(0);
        }
    );

    return unsub;
}
