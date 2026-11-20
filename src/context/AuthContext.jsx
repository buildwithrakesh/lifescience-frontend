import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  logOut,
  onAuthChange,
} from "../firebase/authService";
import { requestNotificationPermission, listenToForegroundMessages } from "../firebase/notificationService";

const AuthContext = createContext(null);

export function AuthProvider({ children, showToast }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fcmToken, setFcmToken] = useState(null);

  useEffect(() => {
    // 1. Listen to Firebase Auth state
    const unsubscribeAuth = onAuthChange((user) => {
      setCurrentUser(user);
      setLoading(false);

      // Auto-request push notifications or sync token when user signs in
      if (user && "Notification" in window && Notification.permission === "granted") {
        requestNotificationPermission(user.uid).then((res) => {
          if (res.token) setFcmToken(res.token);
        });
      }
    });

    // 2. Listen to foreground FCM Push Notifications
    const unsubscribeFCM = listenToForegroundMessages((payload) => {
      const title = payload.notification?.title || "Life Science Pharmaceutical";
      const body = payload.notification?.body || "New update received";
      if (showToast) {
        showToast(`${title}: ${body}`);
      }
    });

    return () => {
      unsubscribeAuth();
      if (typeof unsubscribeFCM === "function") unsubscribeFCM();
    };
  }, [showToast]);

  const handleGoogleSignIn = async () => {
    const res = await signInWithGoogle();
    if (res.success && showToast) {
      showToast(`Welcome, ${res.user.displayName || "Valued Customer"}!`);
    }
    return res;
  };

  const handleEmailSignUp = async (email, password, name) => {
    const res = await signUpWithEmail(email, password, name);
    if (res.success && showToast) {
      showToast(`Account created successfully! Welcome to Life Science.`);
    }
    return res;
  };

  const handleEmailSignIn = async (email, password) => {
    const res = await signInWithEmail(email, password);
    if (res.success && showToast) {
      showToast(`Signed in successfully!`);
    }
    return res;
  };

  const handleSignOut = async () => {
    const res = await logOut();
    if (res.success && showToast) {
      showToast("Signed out successfully.");
    }
    return res;
  };

  const enableNotifications = async () => {
    const res = await requestNotificationPermission(currentUser?.uid);
    if (res.success && showToast) {
      showToast("Push notifications enabled! You'll receive real-time updates.");
    } else if (!res.success && showToast) {
      showToast("Could not enable notifications: " + (res.message || res.error));
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        fcmToken,
        signInWithGoogle: handleGoogleSignIn,
        signUpWithEmail: handleEmailSignUp,
        signInWithEmail: handleEmailSignIn,
        signOut: handleSignOut,
        enableNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
