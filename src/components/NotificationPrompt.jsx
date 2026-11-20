import React, { useState, useEffect } from "react";
import { Bell, BellRing, Check, X } from "lucide-react";

export default function NotificationPrompt({ isOpen, onClose, onPermissionChange }) {
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Lazily prewarm Service Worker only when the prompt is actually open
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    import("../firebase/notificationService")
      .then((mod) => {
        if (!cancelled) mod.prewarmServiceWorker();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const handleAllow = async () => {
    setErrorMsg("");

    try {
      const { requestNotificationPermission } = await import("../firebase/notificationService");
      const result = await requestNotificationPermission("visitor");

      if (result.success) {
        // Instant feedback: show success immediately and close
        setSuccess(true);
        if (onPermissionChange) onPermissionChange("granted");
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 850);
      } else {
        if (result.permission === "denied") {
          setErrorMsg("ब्राउज़र में नोटिफिकेशन ब्लॉक है। कृपया एड्रेस बार से चालू करें।");
        } else {
          setErrorMsg(result.message || result.error || "नोटिफिकेशन चालू नहीं हो सका।");
        }
      }
    } catch (err) {
      console.error("[Push Prompt Error]:", err);
      setErrorMsg("नोटिफिकेशन चालू नहीं हो सका।");
    }
  };

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("life_science_notif_dismissed", "true");
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="notif-backdrop" onClick={handleDismiss}>
      <div
        className="notif-card notif-card-clean"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notif-title"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="notif-close-btn"
          aria-label="Close"
        >
          <X size={15} />
        </button>

        {/* Floating Bell Icon */}
        <div className="notif-badge-icon notif-badge-clean">
          <Bell size={26} className="notif-bell-animated" />
        </div>

        <div className="notif-content">
          <h3 id="notif-title" className="notif-title notif-title-clean">
            नोटिफिकेशन चालू करें
          </h3>

          <p className="notif-desc notif-desc-clean">
            ऑर्डर ट्रैकिंग और नए डिस्काउंट ऑफर्स के तुरंत अपडेट पाने के लिए नोटिफिकेशन चालू करें।
            <br />
            <span style={{ fontSize: "11.5px", color: "#6e8476", display: "inline-block", marginTop: "3px" }}>
              (Allow notifications to get instant order & offer updates.)
            </span>
          </p>

          {/* Success State */}
          {success && (
            <div className="notif-success-box">
              <Check size={18} color="#16a34a" />
              <span>नोटिफिकेशन चालू हो गए!</span>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                borderRadius: 10,
                padding: "8px 12px",
                fontSize: 12,
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Action Buttons */}
          {!success && (
            <div className="notif-actions">
              <button
                type="button"
                onClick={handleAllow}
                className="notif-btn-allow"
              >
                <BellRing size={16} />
                <span>Allow Notifications</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="notif-btn-later"
              >
                Later
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
