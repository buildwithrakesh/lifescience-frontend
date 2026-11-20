import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  User, Package, MapPin, Heart, LogOut, LayoutDashboard,
  CheckCircle2, Clock, ChevronRight, Plus, Edit2, Trash2, Check,
  Bell, BellRing, BellOff, ShieldCheck
} from "lucide-react";
import AddressModal from "../components/AddressModal";
import {
  requestNotificationPermission,
  turnOffNotifications,
  isNotificationsActive,
} from "../firebase/notificationService";

export default function AccountPage({ onToast }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") || "dashboard";
  const [activeSection, setActiveSection] = useState(tabParam);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Notification Active State
  const [isNotifActive, setIsNotifActive] = useState(() => {
    return typeof window !== "undefined" ? isNotificationsActive() : false;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsNotifActive(isNotificationsActive());
    }
  }, []);

  const handleToggleNotifications = async () => {
    if (isNotifActive) {
      await turnOffNotifications();
      setIsNotifActive(false);
      if (onToast) onToast("Push notifications have been turned off.");
    } else {
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "denied") {
        alert("Push notifications are currently blocked in your browser settings. Please click the padlock or settings icon in your browser's address bar to allow notifications.");
        return;
      }
      const res = await requestNotificationPermission("visitor");
      if (res.success) {
        setIsNotifActive(true);
        if (onToast) onToast("✓ Notifications activated successfully!");
      } else {
        if (res.permission === "denied") {
          alert("Push notifications are blocked in your browser settings. Please allow notifications from your address bar.");
        } else {
          if (onToast) onToast("Could not enable notifications. Please check browser settings.");
        }
      }
    }
  };

  useEffect(() => {
    const tab = searchParams.get("tab") || "dashboard";
    setActiveSection(tab);
  }, [searchParams]);

  const handleSelectTab = (tab) => {
    setActiveSection(tab);
    setSearchParams(tab === "dashboard" ? {} : { tab });
  };

  // Profile Form State
  const [profile, setProfile] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("vetora_user_profile") || "null");
      if (saved) return saved;
    } catch (e) {
      // fallback
    }
    return {
      name: "Ramesh Kumar",
      mobile: "+91 80947 21000",
      email: "ramesh.kumar@example.com",
      farmName: "Shree Krishna Dairy & Cattle Farm"
    };
  });

  // Saved Addresses State (Persisted in localStorage)
  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("vetora_user_addresses") || "null");
      if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    } catch (e) {
      // fallback
    }
    return [
      {
        id: "addr-1",
        type: "Dairy Farm",
        name: "Ramesh Kumar (Farm Dispatch)",
        phone: "+91 80947 21000",
        address: "Village Kheri, Near Cooperative Milk Chilling Center",
        landmark: "Near Veterinary Hospital",
        city: "Karnal",
        state: "Haryana",
        pinCode: "132001",
        isDefault: true
      },
      {
        id: "addr-2",
        type: "Home",
        name: "Ramesh Kumar",
        phone: "+91 80947 21000",
        address: "House 42, Civil Lines",
        landmark: "Near City Park",
        city: "Karnal",
        state: "Haryana",
        pinCode: "132001",
        isDefault: false
      }
    ];
  });

  // Save addresses to localStorage on update
  const saveAddressesToStorage = (updated) => {
    setAddresses(updated);
    try {
      localStorage.setItem("vetora_user_addresses", JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage error:", e);
    }
  };

  // Address Handlers
  const handleOpenAddModal = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  const handleOpenEditModal = (addr) => {
    setEditingAddress(addr);
    setIsAddressModalOpen(true);
  };

  const handleDeleteAddress = (id) => {
    if (window.confirm("Are you sure you want to delete this delivery address?")) {
      const updated = addresses.filter((a) => a.id !== id);
      saveAddressesToStorage(updated);
      if (onToast) onToast("Address deleted successfully.");
    }
  };

  const handleSetDefaultAddress = (id) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id
    }));
    saveAddressesToStorage(updated);
    if (onToast) onToast("Default delivery address updated.");
  };

  const handleSaveAddress = (formData) => {
    let updated;
    if (editingAddress) {
      // Editing existing address
      updated = addresses.map((a) => {
        if (a.id === editingAddress.id) {
          return {
            ...a,
            ...formData,
            id: editingAddress.id
          };
        }
        return formData.isDefault ? { ...a, isDefault: false } : a;
      });
      if (onToast) onToast("Address updated successfully!");
    } else {
      // Adding new address
      const newAddr = {
        ...formData,
        id: "addr-" + Date.now()
      };
      if (formData.isDefault || addresses.length === 0) {
        newAddr.isDefault = true;
        updated = [newAddr, ...addresses.map((a) => ({ ...a, isDefault: false }))];
      } else {
        updated = [...addresses, newAddr];
      }
      if (onToast) onToast("New delivery address added successfully!");
    }
    saveAddressesToStorage(updated);
  };

  // Orders State (retrieved from localStorage or defaults)
  const [orders, setOrders] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("vetora_user_orders") || "[]");
      if (saved.length > 0) return saved;
    } catch (e) {
      // fallback
    }
    return [
      {
        id: "LSP2026001254",
        date: "Nov 05, 2026",
        items: [{ name: "Life Science Liv-Pro Liver Support (500ml)", qty: 2, price: 490 }],
        total: 1245,
        status: "Delivered",
        paymentMethod: "UPI"
      },
      {
        id: "LSP2026001233",
        date: "Oct 22, 2026",
        items: [{ name: "Life Science Calci-Gel (300g)", qty: 4, price: 2116 }],
        total: 2116,
        status: "Delivered",
        paymentMethod: "CARD"
      },
      {
        id: "LSP2026001190",
        date: "Oct 10, 2026",
        items: [{ name: "Life Science Mineral Mixture Jar (1kg)", qty: 3, price: 1647 }],
        total: 1647,
        status: "Delivered",
        paymentMethod: "COD"
      }
    ];
  });

  const [orderFilter, setOrderFilter] = useState("all");

  const handleProfileSave = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem("vetora_user_profile", JSON.stringify(profile));
    } catch (err) {
      // ignore
    }
    if (onToast) onToast("Profile information updated successfully!");
    else alert("Profile updated!");
  };

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === "delivered") return o.status === "Delivered";
    if (orderFilter === "processing") return o.status === "Processing";
    return true;
  });

  return (
    <div className="page-wrap account-page">
      {/* ── Page Header ── */}
      <section className="account-hero-section">
        <div className="container">
          <div className="account-user-card">
            <div className="user-avatar-badge">
              <User size={32} />
            </div>
            <div className="user-info-text">
              <span className="eyebrow">VERIFIED ACCOUNT</span>
              <h1>Welcome, {profile.name}</h1>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Dashboard Layout ── */}
      <section className="container account-main-section">
        <div className="account-split-layout">
          {/* Left Navigation Sidebar */}
          <aside className="account-nav-sidebar">
            <nav className="account-nav-menu">
              <button
                className={`account-nav-link ${activeSection === "dashboard" ? "active" : ""}`}
                onClick={(e) => {
                  handleSelectTab("dashboard");
                  if (window.innerWidth <= 900) e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                }}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>
              <button
                className={`account-nav-link ${activeSection === "orders" ? "active" : ""}`}
                onClick={(e) => {
                  handleSelectTab("orders");
                  if (window.innerWidth <= 900) e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                }}
              >
                <Package size={18} />
                <span>My Orders</span>
              </button>
              <button
                className={`account-nav-link ${activeSection === "profile" ? "active" : ""}`}
                onClick={(e) => {
                  handleSelectTab("profile");
                  if (window.innerWidth <= 900) e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                }}
              >
                <User size={18} />
                <span>My Profile</span>
              </button>
              <button
                className={`account-nav-link ${activeSection === "addresses" ? "active" : ""}`}
                onClick={(e) => {
                  handleSelectTab("addresses");
                  if (window.innerWidth <= 900) e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                }}
              >
                <MapPin size={18} />
                <span>Saved Addresses</span>
                {addresses.length > 0 && <small className="nav-counter-pill">{addresses.length}</small>}
              </button>
              <button
                className={`account-nav-link ${activeSection === "notifications" ? "active" : ""}`}
                onClick={(e) => {
                  handleSelectTab("notifications");
                  if (window.innerWidth <= 900) e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                }}
              >
                <Bell size={18} />
                <span>Notifications</span>
                <small
                  className="nav-counter-pill"
                  style={{
                    background: isNotifActive ? "#d1fae5" : "#f3f4f6",
                    color: isNotifActive ? "#065f46" : "#6b7280",
                    fontWeight: 800,
                  }}
                >
                  {isNotifActive ? "On" : "Off"}
                </small>
              </button>
              <Link to="/wishlist" className="account-nav-link">
                <Heart size={18} />
                <span>My Wishlist</span>
              </Link>
              <button
                className="account-nav-link logout-btn"
                onClick={() => {
                  if (onToast) onToast("Logged out of session.");
                  else alert("Logged out.");
                }}
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </nav>
          </aside>

          {/* Right Content Area */}
          <main className="account-content-pane">
            {/* 1. DASHBOARD OVERVIEW */}
            {activeSection === "dashboard" && (
              <div className="dashboard-view">
                <div className="dashboard-stats-row">
                  <div className="stat-card">
                    <span className="stat-num">{orders.length}</span>
                    <span className="stat-lbl">Total Orders Placed</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-num">{addresses.length}</span>
                    <span className="stat-lbl">Saved Addresses</span>
                  </div>
                </div>

                {/* Notification Settings Banner */}
                <div className="account-notif-card">
                  <div className="account-notif-left">
                    <div className={`account-notif-icon-wrap ${isNotifActive ? "active" : ""}`}>
                      {isNotifActive ? <BellRing size={20} /> : <BellOff size={20} />}
                    </div>
                    <div className="account-notif-details">
                      <h4>Order & Health Push Alerts</h4>
                      <p>
                        {isNotifActive
                          ? "Push notifications are active on this device. You will receive live parcel dispatches and healthcare updates."
                          : "Enable notifications to receive instant order tracking updates, parcel dispatches, and exclusive veterinary discounts."}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                    <label className="toggle-switch" title={isNotifActive ? "Click to Turn Off" : "Click to Turn On"}>
                      <input
                        type="checkbox"
                        checked={isNotifActive}
                        onChange={handleToggleNotifications}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <button
                      type="button"
                      onClick={handleToggleNotifications}
                      className={`btn-account-notif ${isNotifActive ? "turn-off" : ""}`}
                    >
                      {isNotifActive ? "Turn Off" : "Enable Alerts"}
                    </button>
                  </div>
                </div>

                <div className="dashboard-recent-orders">
                  <div className="sub-header-row">
                    <h3>Recent Orders</h3>
                    <button
                      className="text-link"
                      onClick={() => handleSelectTab("orders")}
                    >
                      View All Orders <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="orders-cards-list">
                    {orders.slice(0, 2).map((ord) => (
                      <div className="order-item-card" key={ord.id}>
                        <div className="order-card-header">
                          <div>
                            <span className="order-id">Order #{ord.id}</span>
                            <span className="order-date">Placed on {ord.date}</span>
                          </div>
                          <span className={`order-status-badge ${ord.status.toLowerCase()}`}>
                            {ord.status === "Delivered" ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                            {ord.status}
                          </span>
                        </div>
                        <div className="order-card-body">
                          {ord.items.map((it, idx) => (
                            <div className="order-prod-item" key={idx}>
                              <span>{it.name} × {it.qty}</span>
                              <b>₹{it.price * it.qty}</b>
                            </div>
                          ))}
                        </div>
                        <div className="order-card-footer">
                          <span>Paid via {ord.paymentMethod}</span>
                          <b>Total: ₹{ord.total}</b>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. MY ORDERS VIEW */}
            {activeSection === "orders" && (
              <div className="orders-view">
                <div className="sub-header-row">
                  <h2>My Orders History</h2>
                  <div className="orders-filter-pills">
                    <button
                      className={`pill-btn ${orderFilter === "all" ? "active" : ""}`}
                      onClick={() => setOrderFilter("all")}
                    >
                      All Orders ({orders.length})
                    </button>
                    <button
                      className={`pill-btn ${orderFilter === "delivered" ? "active" : ""}`}
                      onClick={() => setOrderFilter("delivered")}
                    >
                      Delivered
                    </button>
                    <button
                      className={`pill-btn ${orderFilter === "processing" ? "active" : ""}`}
                      onClick={() => setOrderFilter("processing")}
                    >
                      Processing
                    </button>
                  </div>
                </div>

                <div className="orders-cards-list">
                  {filteredOrders.map((ord) => (
                    <div className="order-item-card" key={ord.id}>
                      <div className="order-card-header">
                        <div>
                          <span className="order-id">Order #{ord.id}</span>
                          <span className="order-date">Placed on {ord.date}</span>
                        </div>
                        <span className={`order-status-badge ${ord.status.toLowerCase()}`}>
                          {ord.status === "Delivered" ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                          {ord.status}
                        </span>
                      </div>
                      <div className="order-card-body">
                        {ord.items.map((it, idx) => (
                          <div className="order-prod-item" key={idx}>
                            <span>{it.name} × {it.qty}</span>
                            <b>₹{it.price * it.qty}</b>
                          </div>
                        ))}
                      </div>
                      <div className="order-card-footer">
                        <span>Paid via {ord.paymentMethod}</span>
                        <b>Total: ₹{ord.total}</b>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. MY PROFILE VIEW */}
            {activeSection === "profile" && (
              <div className="profile-view">
                <h2>My Profile</h2>
                <p className="section-desc">Manage your personal and farm details for faster checkout.</p>
                <form onSubmit={handleProfileSave} className="profile-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input
                      type="tel"
                      value={profile.mobile}
                      onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Farm / Organization Name</label>
                    <input
                      type="text"
                      value={profile.farmName}
                      onChange={(e) => setProfile({ ...profile, farmName: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="button button-lime">
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {/* 4. MY ADDRESSES VIEW */}
            {activeSection === "addresses" && (
              <div className="addresses-view">
                <div className="sub-header-row">
                  <div>
                    <h2>Saved Delivery Addresses</h2>
                    <p className="section-desc">Manage farm, home, and clinic delivery locations for orders.</p>
                  </div>
                  <button
                    type="button"
                    className="button button-lime mini-btn"
                    onClick={handleOpenAddModal}
                  >
                    <Plus size={15} /> Add New Address
                  </button>
                </div>

                {addresses.length > 0 ? (
                  <div className="addresses-grid">
                    {addresses.map((addr) => (
                      <div className={`address-card ${addr.isDefault ? "is-default-card" : ""}`} key={addr.id}>
                        <div className="address-header">
                          <span className="address-type-tag">{addr.type}</span>
                          {addr.isDefault ? (
                            <span className="default-pill">Default Delivery</span>
                          ) : (
                            <button
                              type="button"
                              className="set-default-btn"
                              onClick={() => handleSetDefaultAddress(addr.id)}
                            >
                              Set as Default
                            </button>
                          )}
                        </div>

                        <h4>{addr.name}</h4>
                        <p className="address-street">{addr.address}</p>
                        {addr.landmark && <p className="address-landmark">Landmark: {addr.landmark}</p>}
                        <p className="address-city-state">{addr.city}, {addr.state} – <b>{addr.pinCode}</b></p>
                        <p className="phone-line">Phone: <b>{addr.phone}</b></p>

                        <div className="address-actions-row">
                          <button
                            type="button"
                            className="action-link-btn"
                            onClick={() => handleOpenEditModal(addr)}
                          >
                            <Edit2 size={13} /> Edit
                          </button>
                          <button
                            type="button"
                            className="action-link-btn delete"
                            onClick={() => handleDeleteAddress(addr.id)}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-addresses-box">
                    <div className="empty-icon-circle">
                      <MapPin size={32} />
                    </div>
                    <h3>No Saved Addresses Yet</h3>
                    <p>Add your farm or clinic address to enjoy fast 1-click checkout and instant dispatch.</p>
                    <button
                      type="button"
                      className="button button-lime"
                      onClick={handleOpenAddModal}
                    >
                      <Plus size={16} /> Add Your First Address
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 5. NOTIFICATIONS TAB */}
            {activeSection === "notifications" && (
              <div className="notif-tab-panel">
                <div className="notif-tab-header">
                  <h3>Notification Settings</h3>
                </div>

                {/* Master Push Notification Card */}
                <div
                  className="account-notif-card"
                  style={{
                    background: isNotifActive ? "#fbfdfa" : "#f8fafc",
                    border: `1.5px solid ${isNotifActive ? "#bbf7d0" : "#e2e8f0"}`,
                    marginBottom: "20px"
                  }}
                >
                  <div className="account-notif-left">
                    <div className={`account-notif-icon-wrap ${isNotifActive ? "active" : ""}`}>
                      {isNotifActive ? <BellRing size={22} /> : <BellOff size={22} />}
                    </div>
                    <div className="account-notif-details">
                      <h4>Push Notifications</h4>
                      <p>
                        {isNotifActive
                          ? "Real-time push notifications are enabled on this device. You will receive all order tracking updates, parcel dispatches, and veterinary offers."
                          : "Notifications are currently turned off. Turn them on to receive instant order tracking updates, dispatches, and veterinary alerts."}
                      </p>
                    </div>
                  </div>
                  <div className="toggle-switch-wrap">
                    <span className={`toggle-status-text ${isNotifActive ? "active" : ""}`}>
                      {isNotifActive ? "Active" : "Disabled"}
                    </span>
                    <label className="toggle-switch" title={isNotifActive ? "Click to Turn Off" : "Click to Turn On"}>
                      <input
                        type="checkbox"
                        checked={isNotifActive}
                        onChange={handleToggleNotifications}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                {!isNotifActive && (
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "12px 16px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      fontSize: "12px",
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <ShieldCheck size={16} style={{ color: "#0d4a2b", flexShrink: 0 }} />
                    <span>
                      Push notifications are disabled in your store account (no push messages will be sent). To also revoke browser-level permission, click the lock/settings icon in your browser address bar.
                    </span>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </section>

      {/* ── Address Modal Dialog ── */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSave={handleSaveAddress}
        initialData={editingAddress}
      />
    </div>
  );
}
