import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "./firebaseConfig";

// Sync user to Cloud Firestore 'users' collection
export async function syncUserToFirestore(user, additionalData = {}) {
  if (!user) return null;
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  const userData = {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || additionalData.displayName || "Life Science Customer",
    photoURL: user.photoURL || "",
    role: additionalData.role || "user",
    lastLoginAt: serverTimestamp(),
    ...additionalData,
  };

  if (!snap.exists()) {
    userData.createdAt = serverTimestamp();
  }

  await setDoc(userRef, userData, { merge: true });
  return userData;
}

// 1. Sign up with Email and Password
export async function signUpWithEmail(email, password, displayName = "") {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (displayName.trim()) {
      await updateProfile(cred.user, { displayName: displayName.trim() });
    }
    await syncUserToFirestore(cred.user, { displayName });
    return { success: true, user: cred.user };
  } catch (error) {
    return { success: false, error: error.message, code: error.code };
  }
}

// 2. Sign in with Email and Password
export async function signInWithEmail(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    await syncUserToFirestore(cred.user);
    return { success: true, user: cred.user };
  } catch (error) {
    return { success: false, error: error.message, code: error.code };
  }
}

// 3. Sign in with Google
export async function signInWithGoogle() {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    await syncUserToFirestore(cred.user);
    return { success: true, user: cred.user };
  } catch (error) {
    return { success: false, error: error.message, code: error.code };
  }
}

// 4. Sign out
export async function logOut() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 5. Subscribe to Auth State
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef).catch(() => null);
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        ...(snap?.exists() ? snap.data() : {}),
      });
    } else {
      callback(null);
    }
  });
}
