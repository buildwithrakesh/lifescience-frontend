import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../utils/api";
import {
  MessageSquare,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  RefreshCw,
  Search,
  Check,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Filter,
} from "lucide-react";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    avgRating: 5.0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "pending" | "approved" | "rejected"
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const url =
        activeTab === "all"
          ? `${API_BASE_URL}/api/reviews/admin/all`
          : `${API_BASE_URL}/api/reviews/admin/all?status=${activeTab}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data || []);
        if (data.counts) {
          setCounts(data.counts);
        }
      }
    } catch (err) {
      console.warn("Could not fetch admin reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [activeTab]);

  const handleUpdateStatus = async (id, newStatus, reviewerName) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    setFeedbackMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/admin/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) =>
            (r._id === id || r.id === id)
              ? { ...r, status: newStatus, isVerified: newStatus === "approved" }
              : r
          )
        );

        // Update counts
        setCounts((prev) => {
          const next = { ...prev };
          if (newStatus === "approved") {
            next.approved += 1;
            next.pending = Math.max(0, next.pending - 1);
          } else if (newStatus === "rejected") {
            next.rejected += 1;
            next.pending = Math.max(0, next.pending - 1);
          }
          return next;
        });

        const statusLabel =
          newStatus === "approved"
            ? "✓ Verified & Published to Storefront!"
            : "Marked as Rejected (Hidden from storefront).";

        setFeedbackMsg({
          type: "success",
          message: `Review by "${reviewerName}": ${statusLabel}`,
        });
      } else {
        setFeedbackMsg({ type: "error", message: data.message || "Failed to update review status" });
      }
    } catch (err) {
      setFeedbackMsg({ type: "error", message: "Network error: " + err.message });
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
  };

  const handleDeleteReview = async (id, reviewerName) => {
    if (!window.confirm(`Are you sure you want to permanently delete the review by "${reviewerName}"?`)) {
      return;
    }

    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/admin/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r._id !== id && r.id !== id));
        setCounts((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
        setFeedbackMsg({
          type: "success",
          message: `Review by "${reviewerName}" permanently deleted.`,
        });
      } else {
        setFeedbackMsg({ type: "error", message: data.message || "Failed to delete review" });
      }
    } catch (err) {
      setFeedbackMsg({ type: "error", message: "Delete failed: " + err.message });
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
  };

  // Filter by search query
  const filteredReviews = reviews.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.product && r.product.toLowerCase().includes(q)) ||
      (r.comment && r.comment.toLowerCase().includes(q)) ||
      (r.title && r.title.toLowerCase().includes(q))
    );
  });

  return (
    <div className="admin-reviews-page">
      {/* ── Page Header ── */}
      <div className="admin-page-header" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 className="admin-page-main-title">
              Customer Reviews
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              onClick={fetchReviews}
              className="admin-btn admin-btn-outline admin-btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              <span>Refresh</span>
            </button>
            <Link
              to="/#reviews"
              target="_blank"
              className="admin-btn admin-btn-secondary admin-btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <ExternalLink size={14} />
              <span>View On Storefront</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Metric Stat Cards Grid ── */}
      <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap amber">
            <Clock size={24} />
          </div>
          <div className="admin-stat-meta">
            <span>Pending Verification</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h3 style={{ margin: 0, color: counts.pending > 0 ? "#b45309" : "inherit" }}>
                {counts.pending}
              </h3>
              {counts.pending > 0 && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 99,
                    background: "#fef3c7",
                    color: "#b45309",
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />
                  Needs Action
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap green">
            <CheckCircle2 size={24} />
          </div>
          <div className="admin-stat-meta">
            <span>Verified & Live</span>
            <h3 style={{ margin: 0 }}>{counts.approved} Published</h3>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap blue">
            <MessageSquare size={24} />
          </div>
          <div className="admin-stat-meta">
            <span>Total Submissions</span>
            <h3 style={{ margin: 0 }}>{counts.total} Reviews</h3>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap lime">
            <Star size={24} />
          </div>
          <div className="admin-stat-meta">
            <span>Average Store Rating</span>
            <h3 style={{ margin: 0 }}>{counts.avgRating} ★★★★★</h3>
          </div>
        </div>
      </div>

      {/* ── Feedback Message Banner ── */}
      {feedbackMsg && (
        <div
          style={{
            padding: "12px 18px",
            borderRadius: 12,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13.5,
            fontWeight: 700,
            background: feedbackMsg.type === "success" ? "#dcfce7" : "#fee2e2",
            color: feedbackMsg.type === "success" ? "#15803d" : "#b91c1c",
            border: `1.5px solid ${feedbackMsg.type === "success" ? "#86efac" : "#fca5a5"}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          {feedbackMsg.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedbackMsg.message}</span>
        </div>
      )}

      {/* ── Main Reviews Management Panel ── */}
      <div className="admin-card">
        {/* Controls Bar: Filter Tabs + Search Input */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 14,
            paddingBottom: 18,
            borderBottom: "1px solid var(--admin-border)",
            marginBottom: 20,
          }}
        >
          {/* Status Tabs */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`admin-btn admin-btn-sm ${activeTab === "all" ? "admin-btn-primary" : "admin-btn-outline"}`}
            >
              All ({counts.total})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`admin-btn admin-btn-sm ${activeTab === "pending" ? "admin-btn-primary" : "admin-btn-outline"}`}
              style={{
                position: "relative",
                borderColor: counts.pending > 0 && activeTab !== "pending" ? "#f59e0b" : undefined,
                color: counts.pending > 0 && activeTab !== "pending" ? "#b45309" : undefined,
              }}
            >
              Pending ({counts.pending})
              {counts.pending > 0 && (
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#ef4444",
                    marginLeft: 4,
                    display: "inline-block",
                  }}
                />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("approved")}
              className={`admin-btn admin-btn-sm ${activeTab === "approved" ? "admin-btn-primary" : "admin-btn-outline"}`}
            >
              Verified ({counts.approved})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("rejected")}
              className={`admin-btn admin-btn-sm ${activeTab === "rejected" ? "admin-btn-primary" : "admin-btn-outline"}`}
            >
              Rejected ({counts.rejected})
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: "relative", minWidth: 260 }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--admin-text-muted)",
              }}
            />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 14px 8px 34px",
                borderRadius: 8,
                border: "1.5px solid var(--admin-border)",
                fontSize: 13,
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>

        {/* Reviews Cards List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--admin-text-muted)" }}>
            <RefreshCw size={24} className="spin" style={{ margin: "0 auto 12px" }} />
            <div>Loading reviews...</div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--admin-text-muted)" }}>
            <MessageSquare size={36} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <h3 style={{ margin: "0 0 6px", color: "var(--admin-text-main)" }}>No Reviews Found</h3>
            <p style={{ margin: 0, fontSize: 13.5 }}>
              {activeTab === "pending"
                ? "All customer reviews are up to date! There are no pending reviews awaiting verification."
                : "No reviews match your current filter or search criteria."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filteredReviews.map((rev) => {
              const revId = rev._id || rev.id;
              const isPending = rev.status === "pending";
              const isApproved = rev.status === "approved";
              const isRejected = rev.status === "rejected";
              const isActioning = actionLoading[revId];

              return (
                <div
                  key={revId}
                  style={{
                    background: isPending ? "#fffbeb" : "#ffffff",
                    border: isPending ? "1.5px solid #fde68a" : "1px solid var(--admin-border)",
                    borderRadius: 14,
                    padding: "18px 22px",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: 12,
                      marginBottom: 10,
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontWeight: 800, fontSize: 15, color: "var(--admin-text-main)" }}>
                          {rev.name}
                        </span>
                        {rev.location && (
                          <span
                            style={{
                              fontSize: 12,
                              color: "var(--admin-text-muted)",
                              background: "#f3f4f6",
                              padding: "2px 8px",
                              borderRadius: 6,
                            }}
                          >
                            📍 {rev.location}
                          </span>
                        )}
                        <span style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
                          • {rev.date || "Recently"}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <div style={{ display: "flex", color: "#f59e0b", fontSize: 14 }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i}>{i < (rev.rating || 5) ? "★" : "☆"}</span>
                          ))}
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#1e40af",
                            background: "#eff6ff",
                            padding: "2px 8px",
                            borderRadius: 6,
                          }}
                        >
                          📦 {rev.product}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isApproved && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "4px 10px",
                            borderRadius: 99,
                            fontSize: 12,
                            fontWeight: 700,
                            background: "#dcfce7",
                            color: "#15803d",
                            border: "1px solid #86efac",
                          }}
                        >
                          <CheckCircle2 size={13} />
                          Verified & Live
                        </span>
                      )}
                      {isPending && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "4px 10px",
                            borderRadius: 99,
                            fontSize: 12,
                            fontWeight: 700,
                            background: "#fef3c7",
                            color: "#b45309",
                            border: "1px solid #fde68a",
                          }}
                        >
                          <Clock size={13} />
                          Pending Verification
                        </span>
                      )}
                      {isRejected && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "4px 10px",
                            borderRadius: 99,
                            fontSize: 12,
                            fontWeight: 700,
                            background: "#fee2e2",
                            color: "#b91c1c",
                            border: "1px solid #fca5a5",
                          }}
                        >
                          <XCircle size={13} />
                          Rejected (Hidden)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Review Content */}
                  <div style={{ margin: "10px 0 14px" }}>
                    {rev.title && (
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 3 }}>
                        "{rev.title}"
                      </div>
                    )}
                    <p style={{ margin: 0, fontSize: 13.5, color: "#4b5563", lineHeight: 1.5 }}>
                      {rev.comment}
                    </p>
                  </div>

                  {/* Actions Row */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid rgba(0,0,0,0.06)",
                      paddingTop: 12,
                      flexWrap: "wrap",
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
                      Helpful Upvotes: <b>{rev.helpful || 0}</b>
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {/* Approve / Verify Button */}
                      {!isApproved && (
                        <button
                          type="button"
                          disabled={isActioning}
                          onClick={() => handleUpdateStatus(revId, "approved", rev.name)}
                          className="admin-btn admin-btn-sm"
                          style={{
                            background: "#15803d",
                            color: "#ffffff",
                            border: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontWeight: 700,
                            padding: "6px 14px",
                          }}
                        >
                          <Check size={14} />
                          <span>{isActioning ? "Saving..." : "Verify & Publish"}</span>
                        </button>
                      )}

                      {/* Reject Button */}
                      {!isRejected && (
                        <button
                          type="button"
                          disabled={isActioning}
                          onClick={() => handleUpdateStatus(revId, "rejected", rev.name)}
                          className="admin-btn admin-btn-sm admin-btn-outline"
                          style={{
                            color: "#b91c1c",
                            borderColor: "#fca5a5",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontWeight: 700,
                            padding: "6px 12px",
                          }}
                        >
                          <XCircle size={14} />
                          <span>Reject</span>
                        </button>
                      )}

                      {/* Reset to Pending (if already approved or rejected) */}
                      {(isApproved || isRejected) && (
                        <button
                          type="button"
                          disabled={isActioning}
                          onClick={() => handleUpdateStatus(revId, "pending", rev.name)}
                          className="admin-btn admin-btn-sm admin-btn-outline"
                          style={{
                            color: "#6b7280",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 12,
                            padding: "6px 10px",
                          }}
                          title="Move back to Pending Verification"
                        >
                          <Clock size={12} />
                          <span>Set Pending</span>
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        type="button"
                        disabled={isActioning}
                        onClick={() => handleDeleteReview(revId, rev.name)}
                        className="admin-btn admin-btn-sm admin-btn-outline"
                        style={{
                          color: "#9ca3af",
                          borderColor: "transparent",
                          padding: "6px 8px",
                        }}
                        title="Delete Review Permanently"
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
    </div>
  );
}
