import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  SlidersHorizontal,
  Package,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { apiFetch } from "../utils/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 26,
    activeProducts: 26,
    totalOrders: 0,
    totalUsers: 1,
    totalSliders: 3,
    totalRevenue: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/admin/dashboard");
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn("Could not load dashboard stats:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-main-title">Dashboard Overview</h1>
        </div>
      </div>

      {/* ── Stat Cards Grid (Clickable Navigation Chips) ── */}
      <div className="admin-stats-grid">
        <Link
          to="/admin/sliders"
          className="admin-stat-card"
          title="Manage Homepage Hero Sliders"
        >
          <div className="admin-stat-icon-wrap green">
            <SlidersHorizontal size={24} />
          </div>
          <div className="admin-stat-meta">
            <span>Hero Sliders</span>
            <h3>{stats.totalSliders} Active</h3>
          </div>
        </Link>

        <Link
          to="/admin/products"
          className="admin-stat-card"
          title="Manage Products Catalog"
        >
          <div className="admin-stat-icon-wrap lime">
            <Package size={24} />
          </div>
          <div className="admin-stat-meta">
            <span>Total Catalog</span>
            <h3>{stats.totalProducts} Products</h3>
          </div>
        </Link>

        <Link
          to="/admin/orders"
          className="admin-stat-card"
          title="View All Orders"
        >
          <div className="admin-stat-icon-wrap blue">
            <ShoppingBag size={24} />
          </div>
          <div className="admin-stat-meta">
            <span>Total Orders</span>
            <h3>{stats.totalOrders} Placed</h3>
          </div>
        </Link>

        <Link
          to="/admin/orders"
          className="admin-stat-card"
          title="View Revenue & Orders"
        >
          <div className="admin-stat-icon-wrap amber">
            <TrendingUp size={24} />
          </div>
          <div className="admin-stat-meta">
            <span>Gross Revenue</span>
            <h3>₹{stats.totalRevenue.toLocaleString("en-IN")}</h3>
          </div>
        </Link>
      </div>
    </div>
  );
}
