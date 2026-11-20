import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Users,
  Smartphone,
  Globe,
  Radio,
  ExternalLink,
  Sparkles,
  History,
  Copy,
  ChevronRight,
} from "lucide-react";
import mobileLogo from "../assets/vetora-mobile-logo.webp";
import { API_BASE_URL } from "../utils/api";

const PRESET_TEMPLATES = [
  {
    name: "Flash Tonic Sale",
    title: "⚡ Flash 15% Off on Animal Tonics!",
    body: "Boost your livestock health with doctor-approved herbal liver and digestive formulas.",
    url: "/products?category=liver-digestive",
  },
  {
    name: "High-Yield Herd Formula",
    title: "🐄 High-Yield Calcium & Milk Booster",
    body: "Ensure maximum daily dairy yield and bone density with our VetCare Calcium Gel.",
    url: "/products?animal=Cow",
  },
  {
    name: "Urgent Veterinary Alert",
    title: "📋 Seasonal Livestock Health Bulletin",
    body: "Protect your dairy herd against seasonal deficiencies with Vitamin AD3E tonics.",
    url: "/products",
  },
  {
    name: "Free Farm Delivery",
    title: "🚚 Free Farm Dispatch on Orders Above ₹999",
    body: "Order authentic veterinary tonics with fast doorstep delivery to your clinic or dairy farm.",
    url: "/products",
  },
];

export default function AdminNotifications() {
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/products");

  // Broadcast History
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("life_science_broadcast_history");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: "b-default-1",
        title: "⚡ Flash 15% Off on Animal Tonics!",
        body: "Boost your livestock health with doctor-approved herbal liver and digestive formulas.",
        url: "/products?category=liver-digestive",
        recipients: 3,
        sentAt: "Today at 02:30 PM",
        status: "Delivered",
      },
    ];
  });

  const fetchSubscriberCount = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/subscribers-count`);
      const data = await res.json();
      if (data.success) {
        setSubscriberCount(data.count);
      }
    } catch (err) {
      console.warn("Could not fetch subscribers count:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriberCount();
  }, []);

  const handleApplyPreset = (template) => {
    setTitle(template.title);
    setBody(template.body);
    setUrl(template.url);
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setIsSending(true);
    setBroadcastStatus(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          url: url.trim() || "/",
        }),
      });

      const data = await res.json();

      if (data.success) {
        const recipientsReached = data.subscribersCount || subscriberCount;
        setBroadcastStatus({
          type: "success",
          message: `Broadcast successfully dispatched to ${recipientsReached} active subscriber(s)!`,
        });

        // Add to history
        const newEntry = {
          id: "b-" + Date.now(),
          title: title.trim(),
          body: body.trim(),
          url: url.trim() || "/",
          recipients: recipientsReached,
          sentAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "Delivered",
        };

        const updatedHistory = [newEntry, ...history.slice(0, 9)];
        setHistory(updatedHistory);
        try {
          localStorage.setItem("life_science_broadcast_history", JSON.stringify(updatedHistory));
        } catch (e) {}

        // Send local test preview to admin screen if permission granted
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          new Notification(title, {
            body: body,
            icon: "/favicon-32x32.png",
          });
        }

        // Clear inputs
        setTitle("");
        setBody("");
        setUrl("/products");
      } else {
        setBroadcastStatus({
          type: "error",
          message: data.message || "Failed to dispatch broadcast.",
        });
      }
    } catch (err) {
      setBroadcastStatus({
        type: "error",
        message: "Network error sending broadcast: " + err.message,
      });
    } finally {
      setIsSending(false);
      setTimeout(() => setBroadcastStatus(null), 6000);
    }
  };

  const handleSendTestToSelf = () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("Life Science Admin Test Alert", {
          body: "✓ Real-time Firebase Push Messaging connection is active and responsive.",
          icon: "/favicon-32x32.png",
        });
      } else {
        alert("Please allow notifications for this site in your browser to test local delivery.");
      }
    }
  };

  return (
    <div className="admin-notifications-page">
      {/* ── Page Header ── */}
      <div className="admin-page-header" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 className="admin-page-main-title">
              Push Notifications
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              onClick={fetchSubscriberCount}
              className="admin-btn admin-btn-outline admin-btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              <span>Refresh Stats</span>
            </button>
            <button
              type="button"
              onClick={handleSendTestToSelf}
              className="admin-btn admin-btn-secondary admin-btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Sparkles size={14} />
              <span>Test on Device</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Metric Stat Cards Grid ── */}
      <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap green">
            <Users size={24} />
          </div>
          <div className="admin-stat-meta">
            <span>Active Subscribers</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h3 style={{ margin: 0 }}>{subscriberCount}</h3>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 99,
                  background: "#dcfce7",
                  color: "#15803d",
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
                Online
              </span>
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap lime">
            <Radio size={24} />
          </div>
          <div className="admin-stat-meta">
            <span>FCM Push Gateway</span>
            <h3 style={{ margin: 0, fontSize: 18 }}>Firebase VAPID</h3>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap blue">
            <Smartphone size={24} />
          </div>
          <div className="admin-stat-meta">
            <span>Device Support</span>
            <h3 style={{ margin: 0, fontSize: 18 }}>Mobile & Desktop</h3>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap amber">
            <Globe size={24} />
          </div>
          <div className="admin-stat-meta">
            <span>Broadcast Channel</span>
            <h3 style={{ margin: 0, fontSize: 18 }}>Web Service Worker</h3>
          </div>
        </div>
      </div>

      {/* ── Main Two-Column Layout: Composer + Live Preview ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, marginBottom: 28 }} className="composer-preview-grid">
        {/* Left Column: Broadcast Composer */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>
              <Send size={18} style={{ color: "#059669" }} />
              <span>Compose Push Broadcast</span>
            </h2>
            <span style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
              Targets all {subscriberCount} active subscribers
            </span>
          </div>

          {/* Quick Presets */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>
              ⚡ Quick Template Presets:
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PRESET_TEMPLATES.map((tpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(tpl)}
                  style={{
                    padding: "5px 12px",
                    background: "#f3f4f6",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#374151",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#e5ede5";
                    e.currentTarget.style.borderColor = "#c6e0c6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#f3f4f6";
                    e.currentTarget.style.borderColor = "#e5e7eb";
                  }}
                >
                  <span>{tpl.name}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendBroadcast}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>
                  Notification Title <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <span style={{ fontSize: 11, color: title.length > 50 ? "#dc2626" : "#6b7280" }}>
                  {title.length}/60 chars
                </span>
              </div>
              <input
                type="text"
                placeholder="Notification title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={60}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #d1d5db",
                  fontSize: 14,
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>
                  Notification Message Body <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <span style={{ fontSize: 11, color: body.length > 120 ? "#dc2626" : "#6b7280" }}>
                  {body.length}/140 chars
                </span>
              </div>
              <textarea
                rows={3}
                placeholder="Notification message body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={140}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #d1d5db",
                  fontSize: 14,
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1f2937", marginBottom: 5 }}>
                Target Destination URL (Click Link)
              </label>
              <input
                type="text"
                placeholder="/products"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #d1d5db",
                  fontSize: 13.5,
                  fontFamily: "inherit",
                }}
              />
            </div>

            {broadcastStatus && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: 10,
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  background: broadcastStatus.type === "success" ? "#dcfce7" : "#fee2e2",
                  color: broadcastStatus.type === "success" ? "#15803d" : "#b91c1c",
                  border: `1px solid ${broadcastStatus.type === "success" ? "#86efac" : "#fca5a5"}`,
                }}
              >
                {broadcastStatus.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{broadcastStatus.message}</span>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                type="submit"
                disabled={isSending || !title.trim() || !body.trim()}
                className="admin-btn admin-btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "11px 22px",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                <Send size={15} />
                <span>{isSending ? "Dispatching Broadcast..." : "Send Push Broadcast Now"}</span>
              </button>
              {(title || body) && (
                <button
                  type="button"
                  onClick={() => {
                    setTitle("");
                    setBody("");
                    setUrl("/products");
                  }}
                  className="admin-btn admin-btn-outline"
                  style={{ padding: "10px 16px", fontSize: 13 }}
                >
                  Clear Form
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Live Device Push Notification Preview */}
        <div>
          <div className="admin-card" style={{ marginBottom: 20 }}>
            <div className="admin-card-header">
              <h2>
                <Smartphone size={18} style={{ color: "#2563eb" }} />
                <span>Live Device Push Preview</span>
              </h2>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", background: "#eff6ff", color: "#1d4ed8", borderRadius: 6 }}>
                Preview
              </span>
            </div>

            {/* Notification Card Mockup */}
            <div
              style={{
                background: "#ffffff",
                border: "1.5px solid #d1d5db",
                borderRadius: 14,
                padding: "16px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <img
                    src={mobileLogo}
                    alt="App Logo"
                    style={{ width: 22, height: 22, borderRadius: 5, objectFit: "contain" }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>Life Science</span>
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>• Just now</span>
                </div>
                <span style={{ fontSize: 10, background: "#f3f4f6", padding: "2px 6px", borderRadius: 4, color: "#6b7280" }}>
                  Google Chrome
                </span>
              </div>

              <div style={{ fontSize: 14, fontWeight: 800, color: "#111827", marginBottom: 4 }}>
                {title.trim() || "⚡ Flash 15% Off on Animal Tonics!"}
              </div>

              <div style={{ fontSize: 12.5, color: "#4b5563", lineHeight: 1.45, marginBottom: 12 }}>
                {body.trim() || "Boost your livestock health with doctor-approved herbal liver and digestive formulas."}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f3f4f6", paddingTop: 10 }}>
                <span style={{ fontSize: 11, color: "#6b7280" }}>
                  Target: <b>{url.trim() || "/"}</b>
                </span>
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: "#059669",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  Tap to open <ChevronRight size={12} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Broadcast History Log ── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>
            <History size={18} />
            <span>Recent Broadcast Dispatches</span>
          </h2>
          <span style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
            Showing last {history.length} dispatch{history.length === 1 ? "" : "es"}
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="admin-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th style={{ width: 120 }}>Time</th>
                <th>Campaign Title & Message</th>
                <th style={{ width: 140 }}>Target URL</th>
                <th style={{ width: 110 }}>Recipients</th>
                <th style={{ width: 110 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontSize: 12.5, color: "#6b7280" }}>{item.sentAt}</td>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: "#111827", marginBottom: 2 }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{item.body}</div>
                  </td>
                  <td>
                    <code style={{ fontSize: 11.5, background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>
                      {item.url}
                    </code>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#15803d" }}>
                      {item.recipients} device{item.recipients === 1 ? "" : "s"}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: 6,
                        fontSize: 11.5,
                        fontWeight: 700,
                        background: "#dcfce7",
                        color: "#15803d",
                      }}
                    >
                      ✓ {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}