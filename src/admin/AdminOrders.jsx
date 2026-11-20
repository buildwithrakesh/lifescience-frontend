import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { apiFetch } from "../utils/api";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/admin/orders?status=${statusFilter}`);
      if (res.success && res.data?.orders) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.warn("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await apiFetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
        showToast(`Order status updated to ${newStatus}`);
      }
    } catch (err) {
      alert("Error updating order: " + err.message);
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === "delivered") {
      return (
        <span className="admin-status-badge active">
          <CheckCircle2 size={12} /> Delivered
        </span>
      );
    }
    if (s === "shipped") {
      return (
        <span className="admin-status-badge" style={{ background: "#dbeafe", color: "#1d4ed8" }}>
          <Truck size={12} /> Shipped
        </span>
      );
    }
    if (s === "cancelled") {
      return (
        <span className="admin-status-badge inactive">
          <XCircle size={12} /> Cancelled
        </span>
      );
    }
    return (
      <span className="admin-status-badge" style={{ background: "#fef3c7", color: "#b45309" }}>
        <Clock size={12} /> {status || "Processing"}
      </span>
    );
  };

  return (
    <div>
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "#12452c",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            zIndex: 9999,
          }}
        >
          {toastMsg}
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-page-main-title">Customer Orders</h2>
          </div>

          <div className="admin-header-actions">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-select"
            >
              <option value="all">All Orders</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              type="button"
              onClick={loadOrders}
              className="admin-btn admin-btn-outline admin-btn-sm"
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {loading && orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--admin-text-muted)" }}>
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--admin-text-muted)" }}>
            No orders found in this category.
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr style={{ background: "#f0f6f2", textAlign: "left", color: "var(--admin-primary)" }}>
                  <th style={{ padding: "12px 14px" }}>Order ID</th>
                  <th style={{ padding: "12px 14px" }}>Customer</th>
                  <th style={{ padding: "12px 14px" }}>Items</th>
                  <th style={{ padding: "12px 14px" }}>Total</th>
                  <th style={{ padding: "12px 14px" }}>Status</th>
                  <th style={{ padding: "12px 14px", textAlign: "right" }}>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} style={{ borderBottom: "1px solid var(--admin-border)" }}>
                    <td style={{ padding: "14px", fontWeight: 800, color: "var(--admin-primary)" }}>
                      {o.orderId}
                      <div style={{ fontSize: 11, color: "var(--admin-text-muted)", fontWeight: 500 }}>
                        {new Date(o.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td style={{ padding: "14px" }}>
                      <div style={{ fontWeight: 700 }}>{o.shippingAddress?.fullName || "Guest Customer"}</div>
                      <small style={{ color: "var(--admin-text-muted)" }}>
                        {o.shippingAddress?.phone} · {o.shippingAddress?.city}
                      </small>
                    </td>
                    <td style={{ padding: "14px" }}>
                      {o.items?.length || 0} item{o.items?.length !== 1 ? "s" : ""}
                    </td>
                    <td style={{ padding: "14px", fontWeight: 800 }}>
                      ₹{o.totalAmount?.toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: "14px" }}>{getStatusBadge(o.status)}</td>
                    <td style={{ padding: "14px", textAlign: "right" }}>
                      <select
                        value={o.status || "confirmed"}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 8,
                          border: "1.5px solid var(--admin-border)",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
