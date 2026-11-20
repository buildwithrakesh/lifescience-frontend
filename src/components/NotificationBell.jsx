import React, { useState, useEffect } from "react";
import { Bell, BellRing } from "lucide-react";
import NotificationPrompt from "./NotificationPrompt";

export default function NotificationBell({ onOpenPrompt }) {
  const [permission, setPermission] = useState("default");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const checkPermission = () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  const handleClick = () => {
    if (onOpenPrompt) {
      onOpenPrompt();
    } else {
      setIsModalOpen(true);
    }
  };

  const isGranted = permission === "granted";

  return (
    <>
      <div className="notif-bell-wrap">
        <button
          type="button"
          onClick={handleClick}
          className={`notif-bell-btn ${isGranted ? "active" : ""}`}
          title={isGranted ? "Push Notifications Active" : "Enable Push Notifications"}
          aria-label="Push notifications toggle"
        >
          {isGranted ? <BellRing size={19} /> : <Bell size={19} />}
          <span className={`notif-dot ${isGranted ? "granted" : "pending"}`} />
        </button>
      </div>

      {!onOpenPrompt && (
        <NotificationPrompt
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onPermissionChange={(perm) => setPermission(perm)}
        />
      )}
    </>
  );
}
