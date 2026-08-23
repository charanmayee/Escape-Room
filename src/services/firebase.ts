import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { LeaderboardEntry } from "../types";

// Initialize Firebase App instance
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firestore instance
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Save / Update entry in Firestore Leaderboard
export async function saveLeaderboardEntry(entry: LeaderboardEntry): Promise<void> {
  try {
    const cleanPlayer = entry.player?.trim() || "Anonymous Operative";
    // Deduplicate by sanitized player name
    const docId = `player_${cleanPlayer.toLowerCase().replace(/[^a-z0-9_-]/g, "_")}`;
    const lbRef = doc(db, "leaderboard", docId);

    const snap = await getDoc(lbRef);
    if (snap.exists()) {
      const existing = snap.data() as LeaderboardEntry;
      if (
        entry.score > (existing.score || 0) ||
        (entry.score === existing.score && (entry.rooms_completed || 0) > (existing.rooms_completed || 0)) ||
        (entry.score === existing.score && (entry.rooms_completed || 0) === (existing.rooms_completed || 0) && (entry.time_remaining || 0) > (existing.time_remaining || 0))
      ) {
        await setDoc(lbRef, entry, { merge: true });
      }
    } else {
      await setDoc(lbRef, entry);
    }
  } catch (err) {
    console.warn("Could not save score directly to Firestore leaderboard:", err);
  }
}

// Subscribe to Live Real-Time Firestore Leaderboard
export function subscribeLeaderboard(
  onUpdate: (entries: LeaderboardEntry[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  try {
    const lbCol = collection(db, "leaderboard");
    const q = query(lbCol, orderBy("score", "desc"), limit(100));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: LeaderboardEntry[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as LeaderboardEntry;
          if (data && data.player) {
            list.push(data);
          }
        });

        // Secondary sorting for ties (Rooms completed -> Time remaining)
        list.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          if ((b.rooms_completed || 0) !== (a.rooms_completed || 0)) {
            return (b.rooms_completed || 0) - (a.rooms_completed || 0);
          }
          return (b.time_remaining || 0) - (a.time_remaining || 0);
        });

        onUpdate(list);
      },
      (error) => {
        console.warn("Firestore leaderboard subscription error:", error);
        if (onError) onError(error);
      }
    );
  } catch (e) {
    console.warn("Failed to attach Firestore snapshot listener:", e);
    return () => {};
  }
}

// Save active checkpoint / session
export async function saveGameCheckpoint(sessionId: string, sessionData: any): Promise<void> {
  try {
    const ref = doc(db, "game_sessions", sessionId);
    await setDoc(ref, { ...sessionData, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn("Failed to persist game checkpoint to Firestore:", err);
  }
}
