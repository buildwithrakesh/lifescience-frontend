import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  SlidersHorizontal,
  Package,
  Sparkles,
  Percent,
  ShoppingBag,
  Bell,
  MessageSquare,
  Mail,
  Users,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useAdminAuth } from "./AdminAuthContext";
import mobileLogo from "../assets/vetora-mobile-logo.webp";
import "./adminStyles.css";

export default function AdminLayout() {
  const { adminUser, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const navLinks = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Hero Sliders", path: "/admin/sliders", icon: SlidersHorizontal },
    { name: "Products", path: "/admin/products", icon: Package },
    { name: "Featured Posters", path: "/admin/featured-posters", icon: Sparkles },
    { name: "Offers", path: "/admin/offers", icon: Percent },
    { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
    { name: "Reviews", path: "/admin/reviews", icon: MessageSquare },
    { name: "Messages", path: "/admin/messages", icon: Mail },
    { name: "Push Notifications", path: "/admin/notifications", icon: Bell },
  ];

  return (
    <div className="admin-shell">
      {/* ── Mobile Sidebar Backdrop Overlay ── */}
      <div
        className={`admin-sidebar-overlay ${mobileMenuOpen ? "open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? "open" : ""}`}>
        <div className="admin-sidebar-brand">
          <img
            src={mobileLogo}
            alt="Life Science"
            style={{ width: 38, height: 38, borderRadius: 10, objectFit: "contain" }}
          />
          <div className="admin-brand-info">
            <h2>Life Science</h2>
          </div>
          {/* Mobile Close Button on the sliding sidebar */}
          <button
            type="button"
            className="admin-sidebar-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close sidebar navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="admin-nav">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === "/admin"
                ? location.pathname === "/admin" || location.pathname === "/admin/"
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-item ${isActive ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" target="_blank" className="admin-footer-btn" title="View Customer Storefront">
            <ExternalLink size={16} />
            <span>View Website</span>
          </Link>
          <button type="button" onClick={handleLogout} className="admin-footer-btn logout-btn">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle admin navigation"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="admin-page-title">
              <h1>Admin Panel</h1>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
