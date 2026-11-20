import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

// ── FCM Push Notification Token Storage ──
export async function saveFCMToken(token, userId = null) {
  if (!token) return;
  try {
    const tokenRef = doc(db, "fcmTokens", token);
    await setDoc(
      tokenRef,
      {
        token,
        userId: userId || "anonymous",
        platform: "web",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // If logged in, also record in user's profile
    if (userId) {
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, { fcmToken: token }, { merge: true });
    }
  } catch (error) {
    console.warn("Could not save FCM token to Firestore:", error);
  }
}

// ── Orders in Firestore ──
export async function createFirestoreOrder(orderData, userId = null) {
  try {
    const ordersCol = collection(db, "orders");
    const docRef = await addDoc(ordersCol, {
      ...orderData,
      userId: userId || null,
      status: "confirmed",
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getUserFirestoreOrders(userId) {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, "orders"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.warn("Error fetching user orders from Firestore:", error);
    return [];
  }
}

// ── Real-Time In-App & Push Notification Listener ──
export function subscribeToNotifications(userId, callback) {
  if (!userId) return () => {};
  const q = query(
    collection(db, "notifications"),
    where("userId", "in", [userId, "all"]),
    orderBy("createdAt", "desc"),
    limit(15)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(list);
    },
    (error) => {
      console.warn("Notifications subscription error:", error);
    }
  );
}
