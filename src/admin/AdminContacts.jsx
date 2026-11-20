import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../utils/api";
import {
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  CheckCheck,
  RefreshCw,
  Search,
  Trash2,
  ExternalLink,
  Filter,
  AlertCircle,
  MessageCircle,
  User,
  Calendar,
  Check,
  X,
  Inbox,
  Send,
  Eye,
  Sparkles,
} from "lucide-react";

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    unread: 0,
    read: 0,
    responded: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "unread" | "read" | "responded"
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [deleteConfirmContact, setDeleteConfirmContact] = useState(null);
  const [viewModalContact, setViewModalContact] = useState(null);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const url =
        activeTab === "all"
          ? `${API_BASE_URL}/api/contacts/admin/all`
          : `${API_BASE_URL}/api/contacts/admin/all?status=${activeTab}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setContacts(data.data || []);
        if (data.counts) {
          setCounts(data.counts);
        }
      }
    } catch (err) {
      console.warn("Could not fetch admin contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [activeTab]);

  // Status update handler
  const handleUpdateStatus = async (id, newStatus, contactName) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    setFeedbackMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/contacts/admin/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setContacts((prev) =>
          prev.map((c) =>
            c._id === id || c.id === id ? { ...c, status: newStatus } : c
          )
        );

        // Update counts dynamically
        setCounts((prev) => {
          const next = { ...prev };
          if (newStatus === "responded") {
            next.responded = (next.responded || 0) + 1;
            next.unread = Math.max(0, (next.unread || 1) - 1);
          } else if (newStatus === "read") {
            next.read = (next.read || 0) + 1;
            next.unread = Math.max(0, (next.unread || 1) - 1);
          } else if (newStatus === "unread") {
            next.unread = (next.unread || 0) + 1;
          }
          return next;
        });

        const statusLabels = {
          responded: "marked as Responded",
          read: "marked as Read",
          unread: "marked as Unread",
        };

        setFeedbackMsg({
          type: "success",
          message: `Inquiry from "${contactName}" ${statusLabels[newStatus] || "updated"}.`,
        });

        if (viewModalContact && (viewModalContact._id === id || viewModalContact.id === id)) {
          setViewModalContact((prev) => ({ ...prev, status: newStatus }));
        }
      } else {
        setFeedbackMsg({
          type: "error",
          message: data.message || "Failed to update inquiry status.",
        });
      }
    } catch (err) {
      setFeedbackMsg({
        type: "error",
        message: "Network error occurred while updating status.",
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Delete message handler
  const handleDeleteContact = async (id, contactName) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/contacts/admin/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setContacts((prev) => prev.filter((c) => c._id !== id && c.id !== id));
        setCounts((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
        setFeedbackMsg({
          type: "success",
          message: `Inquiry from "${contactName}" deleted successfully.`,
        });
        setDeleteConfirmContact(null);
        if (viewModalContact && (viewModalContact._id === id || viewModalContact.id === id)) {
          setViewModalContact(null);
        }
      } else {
        setFeedbackMsg({
          type: "error",
          message: data.message || "Failed to delete inquiry.",
        });
      }
    } catch (err) {
      setFeedbackMsg({
        type: "error",
        message: "Network error occurred while deleting inquiry.",
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  // WhatsApp helper
  const openWhatsApp = (contact) => {
    const rawPhone = contact.phone || "";
    const cleanPhone = rawPhone.replace(/[^0-9]/g, "");
    const phoneWithCountry = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
    const text = encodeURIComponent(
      `Hello ${contact.name}, thank you for reaching out to Life Science Pharmaceutical regarding "${contact.subject}". How can our veterinary team assist you today?`
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${text}`, "_blank");
    // Optionally auto-mark as responded
    if (contact.status !== "responded") {
      handleUpdateStatus(contact._id || contact.id, "responded", contact.name);
    }
  };

  // Filter contacts by search query
  const filteredContacts = contacts.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.subject && c.subject.toLowerCase().includes(q)) ||
      (c.message && c.message.toLowerCase().includes(q))
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "unread":
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: "700",
              background: "#fef3c7",
              color: "#92400e",
              border: "1px solid #fde68a",
            }}
          >
            <Clock size={12} />
            <span>Unread</span>
          </span>
        );
      case "read":
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: "700",
              background: "#eff6ff",
              color: "#1e40af",
              border: "1px solid #bfdbfe",
            }}
          >
            <Check size={12} />
            <span>Read</span>
          </span>
        );
      case "responded":
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: "700",
              background: "#ecfdf5",
              color: "#065f46",
              border: "1px solid #a7f3d0",
            }}
          >
            <CheckCheck size={12} />
            <span>Responded</span>
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Recently";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ maxWidth: "1240px", margin: "0 auto", paddingBottom: "40px" }}>
      {/* ── Page Header ── */}
      <div className="admin-page-header">
        <div>
          <div className="admin-breadcrumb">
            <Link to="/admin">Dashboard</Link>
            <span>/</span>
            <b>Customer Inquiries</b>
          </div>
          <div className="admin-page-title">
            <h1 className="admin-page-main-title">Customer Inquiries</h1>
          </div>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="admin-btn admin-btn-outline admin-btn-sm"
            onClick={fetchContacts}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>
          <a
            href="/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn-outline admin-btn-sm"
          >
            <ExternalLink size={14} />
            <span>Live Contact Page</span>
          </a>
        </div>
      </div>

      {/* ── Feedback Notification ── */}
      {feedbackMsg && (
        <div
          style={{
            padding: "12px 18px",
            borderRadius: "12px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: feedbackMsg.type === "success" ? "#ecfdf5" : "#fef2f2",
            border: `1.5px solid ${feedbackMsg.type === "success" ? "#a7f3d0" : "#fecaca"}`,
            color: feedbackMsg.type === "success" ? "#065f46" : "#991b1b",
            fontSize: "13.5px",
            fontWeight: "600",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {feedbackMsg.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{feedbackMsg.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "inherit",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Metrics Cards Grid ── */}
      <div className="admin-stats-grid" style={{ marginBottom: "24px" }}>
        {/* Total Inquiries */}
        <div
          className="admin-stat-card"
          onClick={() => setActiveTab("all")}
          style={{ cursor: "pointer", borderColor: activeTab === "all" ? "var(--admin-primary)" : undefined }}
        >
          <div className="admin-stat-icon-wrap lime">
            <Inbox size={22} />
          </div>
          <div className="admin-stat-meta">
            <span>Total Inquiries</span>
            <h3>{counts.total}</h3>
          </div>
        </div>

        {/* Unread Inquiries */}
        <div
          className="admin-stat-card"
          onClick={() => setActiveTab("unread")}
          style={{
            cursor: "pointer",
            borderColor: activeTab === "unread" ? "#f59e0b" : undefined,
            background: counts.unread > 0 ? "#fffdf5" : "#ffffff",
          }}
        >
          <div className="admin-stat-icon-wrap amber">
            <Clock size={22} />
          </div>
          <div className="admin-stat-meta">
            <span>Unread Messages</span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3 style={{ color: counts.unread > 0 ? "#d97706" : "inherit" }}>{counts.unread}</h3>
              {counts.unread > 0 && (
                <span
                  style={{
                    fontSize: "11px",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    background: "#fef3c7",
                    color: "#b45309",
                    fontWeight: "800",
                  }}
                >
                  NEW
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Responded */}
        <div
          className="admin-stat-card"
          onClick={() => setActiveTab("responded")}
          style={{ cursor: "pointer", borderColor: activeTab === "responded" ? "#10b981" : undefined }}
        >
          <div className="admin-stat-icon-wrap green">
            <CheckCheck size={22} />
          </div>
          <div className="admin-stat-meta">
            <span>Responded</span>
            <h3>{counts.responded}</h3>
          </div>
        </div>

        {/* Read / In Review */}
        <div
          className="admin-stat-card"
          onClick={() => setActiveTab("read")}
          style={{ cursor: "pointer", borderColor: activeTab === "read" ? "#3b82f6" : undefined }}
        >
          <div className="admin-stat-icon-wrap blue">
            <Check size={22} />
          </div>
          <div className="admin-stat-meta">
            <span>Read / Reviewed</span>
            <h3>{counts.read}</h3>
          </div>
        </div>
      </div>

      {/* ── Main Inquiries Box ── */}
      <div className="admin-card">
        {/* Status Filter Tabs & Search Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px",
            borderBottom: "1px solid var(--admin-border)",
            paddingBottom: "16px",
            marginBottom: "20px",
          }}
        >
          {/* Filter Pills */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              className={`pill-btn ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: activeTab === "all" ? "1.5px solid var(--admin-primary)" : "1.5px solid var(--admin-border)",
                background: activeTab === "all" ? "var(--admin-primary)" : "#ffffff",
                color: activeTab === "all" ? "#ffffff" : "var(--admin-text-main)",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              All Messages ({counts.total})
            </button>
            <button
              type="button"
              className={`pill-btn ${activeTab === "unread" ? "active" : ""}`}
              onClick={() => setActiveTab("unread")}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: activeTab === "unread" ? "1.5px solid #d97706" : "1.5px solid var(--admin-border)",
                background: activeTab === "unread" ? "#fef3c7" : "#ffffff",
                color: activeTab === "unread" ? "#92400e" : "var(--admin-text-main)",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Unread ({counts.unread})
            </button>
            <button
              type="button"
              className={`pill-btn ${activeTab === "read" ? "active" : ""}`}
              onClick={() => setActiveTab("read")}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: activeTab === "read" ? "1.5px solid #2563eb" : "1.5px solid var(--admin-border)",
                background: activeTab === "read" ? "#eff6ff" : "#ffffff",
                color: activeTab === "read" ? "#1e40af" : "var(--admin-text-main)",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Read ({counts.read})
            </button>
            <button
              type="button"
              className={`pill-btn ${activeTab === "responded" ? "active" : ""}`}
              onClick={() => setActiveTab("responded")}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: activeTab === "responded" ? "1.5px solid #059669" : "1.5px solid var(--admin-border)",
                background: activeTab === "responded" ? "#ecfdf5" : "#ffffff",
                color: activeTab === "responded" ? "#065f46" : "var(--admin-text-main)",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Responded ({counts.responded})
            </button>
          </div>

          {/* Search Box */}
          <div
            style={{
              position: "relative",
              minWidth: "260px",
              flex: "1 1 260px",
              maxWidth: "380px",
            }}
          >
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--admin-text-muted)",
              }}
            />
            <input
              type="text"
              placeholder="Search inquiries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 32px 8px 36px",
                borderRadius: "10px",
                border: "1.5px solid var(--admin-border)",
                fontSize: "13px",
                outline: "none",
                background: "#fdfefe",
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--admin-text-muted)",
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── Inquiries List ── */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--admin-text-muted)" }}>
            <RefreshCw size={28} className="spin" style={{ margin: "0 auto 12px" }} />
            <p style={{ margin: 0, fontWeight: "600" }}>Loading contact inquiries...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "#fafcfb",
              borderRadius: "14px",
              border: "1.5px dashed var(--admin-border)",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#f0fdf4",
                color: "var(--admin-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Inbox size={28} />
            </div>
            <h3 style={{ margin: "0 0 6px", fontSize: "16px", color: "var(--admin-primary)" }}>
              No messages found
            </h3>
            <p style={{ margin: "0 auto 16px", color: "var(--admin-text-muted)", fontSize: "13.5px", maxWidth: "400px" }}>
              {searchQuery
                ? `No contact inquiries matched "${searchQuery}". Try a different keyword.`
                : activeTab === "all"
                ? "There are currently no customer inquiries submitted."
                : `No inquiries with status "${activeTab}".`}
            </p>
            {searchQuery && (
              <button
                type="button"
                className="admin-btn admin-btn-outline admin-btn-sm"
                onClick={() => setSearchQuery("")}
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filteredContacts.map((contact) => {
              const contactId = contact._id || contact.id;
              const isWorking = actionLoading[contactId];
              const initials = contact.name
                ? contact.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "LS";

              return (
                <div
                  key={contactId}
                  style={{
                    padding: "20px",
                    borderRadius: "14px",
                    border: `1.5px solid ${
                      contact.status === "unread" ? "#fde68a" : "var(--admin-border)"
                    }`,
                    background: contact.status === "unread" ? "#fffdf5" : "#ffffff",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                  }}
                >
                  {/* Top Row: User Meta + Status Badge */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "12px",
                          background: contact.status === "unread" ? "#fef3c7" : "#e8f5e9",
                          color: contact.status === "unread" ? "#92400e" : "#1b5e20",
                          fontWeight: "800",
                          fontSize: "14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {initials}
                      </div>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#1c2e22" }}>
                            {contact.name}
                          </h4>
                          {contact.subject && (
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "6px",
                                background: "#f1f5f9",
                                color: "#475569",
                                fontSize: "11.5px",
                                fontWeight: "700",
                              }}
                            >
                              🏷️ {contact.subject}
                            </span>
                          )}
                        </div>

                        {/* Contact details row */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            flexWrap: "wrap",
                            fontSize: "12.5px",
                            color: "var(--admin-text-muted)",
                            marginTop: "4px",
                          }}
                        >
                          {contact.phone && (
                            <a
                              href={`tel:${contact.phone}`}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                color: "inherit",
                                textDecoration: "none",
                                fontWeight: "600",
                              }}
                              title="Click to Call"
                            >
                              <Phone size={12} />
                              <span>{contact.phone}</span>
                            </a>
                          )}
                          {contact.email && (
                            <a
                              href={`mailto:${contact.email}`}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                color: "inherit",
                                textDecoration: "none",
                              }}
                              title="Click to Email"
                            >
                              <Mail size={12} />
                              <span>{contact.email}</span>
                            </a>
                          )}
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <Calendar size={12} />
                            <span>{formatDate(contact.createdAt)}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {getStatusBadge(contact.status)}
                    </div>
                  </div>

                  {/* Message Body */}
                  <div
                    style={{
                      padding: "14px 16px",
                      background: contact.status === "unread" ? "#ffffff" : "#f8faf9",
                      borderRadius: "10px",
                      border: "1px solid var(--admin-border)",
                      fontSize: "13.5px",
                      lineHeight: "1.6",
                      color: "#334155",
                      marginBottom: "16px",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {contact.message}
                  </div>

                  {/* Bottom Action Bar */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    {/* Left: Quick Communication Triggers */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      {contact.phone && (
                        <button
                          type="button"
                          onClick={() => openWhatsApp(contact)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "7px 14px",
                            borderRadius: "8px",
                            background: "#25d366",
                            color: "#ffffff",
                            border: "none",
                            fontSize: "12.5px",
                            fontWeight: "700",
                            cursor: "pointer",
                            transition: "background 0.2s",
                          }}
                          title="Open WhatsApp Chat with prefilled message"
                        >
                          <MessageCircle size={14} />
                          <span>WhatsApp Reply</span>
                        </button>
                      )}

                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}?subject=Re:%20${encodeURIComponent(
                            contact.subject || "Life Science Inquiry"
                          )}&body=Dear%20${encodeURIComponent(contact.name)}%2C%0A%0AThank%20you%20for%20contacting%20Life%20Science%20Pharmaceutical.`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "7px 14px",
                            borderRadius: "8px",
                            background: "#ffffff",
                            color: "var(--admin-text-main)",
                            border: "1.5px solid var(--admin-border)",
                            fontSize: "12.5px",
                            fontWeight: "700",
                            cursor: "pointer",
                            textDecoration: "none",
                          }}
                          onClick={() => {
                            if (contact.status !== "responded") {
                              handleUpdateStatus(contactId, "responded", contact.name);
                            }
                          }}
                        >
                          <Mail size={14} />
                          <span>Email Reply</span>
                        </a>
                      )}
                    </div>

                    {/* Right: Status Change and Delete Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      {contact.status !== "read" && (
                        <button
                          type="button"
                          disabled={isWorking}
                          onClick={() => handleUpdateStatus(contactId, "read", contact.name)}
                          className="admin-btn admin-btn-outline admin-btn-sm"
                          title="Mark inquiry as read"
                        >
                          <Check size={13} />
                          <span>Mark Read</span>
                        </button>
                      )}

                      {contact.status !== "responded" && (
                        <button
                          type="button"
                          disabled={isWorking}
                          onClick={() => handleUpdateStatus(contactId, "responded", contact.name)}
                          className="admin-btn admin-btn-primary admin-btn-sm"
                          title="Mark inquiry as answered"
                          style={{ background: "#059669", borderColor: "#059669" }}
                        >
                          <CheckCheck size={13} />
                          <span>Mark Responded</span>
                        </button>
                      )}

                      {contact.status === "responded" && (
                        <button
                          type="button"
                          disabled={isWorking}
                          onClick={() => handleUpdateStatus(contactId, "unread", contact.name)}
                          className="admin-btn admin-btn-outline admin-btn-sm"
                          title="Re-open inquiry as unread"
                        >
                          <Clock size={13} />
                          <span>Mark Unread</span>
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={isWorking}
                        onClick={() => setDeleteConfirmContact(contact)}
                        className="admin-icon-btn delete"
                        title="Delete inquiry"
                        style={{ padding: "7px", borderRadius: "8px" }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirmContact && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirmContact(null)}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: "440px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3 style={{ color: "var(--admin-danger)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Trash2 size={18} />
                <span>Delete Inquiry?</span>
              </h3>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => setDeleteConfirmContact(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body">
              <p style={{ margin: 0, fontSize: "14px", color: "var(--admin-text-main)" }}>
                Are you sure you want to permanently delete the inquiry message from{" "}
                <b>{deleteConfirmContact.name}</b>?
              </p>
              <div
                style={{
                  padding: "10px 14px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  fontSize: "12.5px",
                  color: "#991b1b",
                }}
              >
                Subject: <b>{deleteConfirmContact.subject || "General Inquiry"}</b>
              </div>
            </div>

            <div
              className="admin-modal-footer"
              style={{
                padding: "14px 20px",
                borderTop: "1px solid var(--admin-border)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                type="button"
                className="admin-btn admin-btn-outline"
                onClick={() => setDeleteConfirmContact(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn"
                style={{ background: "var(--admin-danger)", color: "#ffffff", border: "none" }}
                onClick={() =>
                  handleDeleteContact(
                    deleteConfirmContact._id || deleteConfirmContact.id,
                    deleteConfirmContact.name
                  )
                }
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
