import React, { useState, useEffect } from "react";
import {
  SlidersHorizontal,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Upload,
  Eye,
  RefreshCw,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { API_BASE_URL, apiFetch, resolveImageUrl } from "../utils/api";
import slider1 from "../assets/sliders/slider1.webp";
import slider2 from "../assets/sliders/slider2.webp";
import slider3 from "../assets/sliders/slider3.webp";

// Preset default Cloudinary images for easy quick selection
const PRESET_IMAGES = [
  { label: "Slider 1 (Veterinary Care)", url: "https://res.cloudinary.com/duqwahasz/image/upload/v1795069481/lifescience/sliders/iyeldcpl7lcwpwfhuhf7.jpg", localSrc: slider1 },
  { label: "Slider 2 (Dairy & Herd)", url: "https://res.cloudinary.com/duqwahasz/image/upload/v1795069418/lifescience/sliders/abvz8nmedyrri0gksr8c.jpg", localSrc: slider2 },
  { label: "Slider 3 (Vital Tonics)", url: "https://res.cloudinary.com/duqwahasz/image/upload/v1795069538/lifescience/sliders/o2a8goctmeqm4louf4yt.jpg", localSrc: slider3 },
];

export default function AdminSliders() {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    imageUrl: "https://res.cloudinary.com/duqwahasz/image/upload/f_auto,q_auto,w_1600/v1794643875/lifescience/sliders/slider1.png",
    link: "/products",
    badgeText: "CLINICAL NUTRITION",
    buttonText: "Explore Formulations",
    isActive: true,
    sortOrder: 0,
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const loadSliders = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      let res;
      try {
        res = await apiFetch("/api/admin/sliders");
      } catch (adminErr) {
        // Fallback to public endpoint if admin token isn't attached or expired
        res = await apiFetch("/api/sliders");
      }
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setSliders(res.data);
        return;
      }
    } catch (err) {
      console.warn("Could not fetch sliders from API, using cached/fallback sliders:", err.message);
    }

    // Fallback: check cached sliders or use active default sliders
    try {
      const cached = localStorage.getItem("vetora_cached_sliders");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSliders(parsed);
          return;
        }
      }
      setSliders([
        {
          _id: "s1",
          title: "Life Science Pharmaceutical",
          subtitle: "Building a healthier tomorrow for livestock, poultry, and companion pets across India.",
          imageUrl: "https://res.cloudinary.com/duqwahasz/image/upload/v1795069481/lifescience/sliders/iyeldcpl7lcwpwfhuhf7.jpg",
          link: "/products",
          badgeText: "CLINICAL VETERINARY SCIENCE",
          buttonText: "Explore Products",
          isActive: true,
          sortOrder: 0,
        },
        {
          _id: "s2",
          title: "High-Yield Herd Wellness & Dairy Nutrition",
          subtitle: "Precision ionic calcium gels, lactation boosters, and mineral complexes for high-producing dairy animals.",
          imageUrl: "https://res.cloudinary.com/duqwahasz/image/upload/v1795069418/lifescience/sliders/abvz8nmedyrri0gksr8c.jpg",
          link: "/products?animal=Cattle",
          badgeText: "DAIRY & LIVESTOCK",
          buttonText: "View Dairy Range",
          isActive: true,
          sortOrder: 1,
        },
        {
          _id: "s3",
          title: "Phyto-Herbal Liver & Gut Vitality Tonics",
          subtitle: "Standardized herbal hepatoprotective tonics and micro-encapsulated gut probiotics for complete vital recovery.",
          imageUrl: "https://res.cloudinary.com/duqwahasz/image/upload/v1795069538/lifescience/sliders/o2a8goctmeqm4louf4yt.jpg",
          link: "/products?category=liver-digestive",
          badgeText: "VITAL CARE & TONICS",
          buttonText: "Discover Tonics",
          isActive: true,
          sortOrder: 2,
        },
      ]);
    } catch (e) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSliders();
  }, []);

  const openAddModal = () => {
    setEditingSlider(null);
    setFormData({
      title: "Life Science Pharmaceutical",
      subtitle: "Building a healthier tomorrow for livestock, poultry, and companion pets across India.",
      imageUrl: "https://res.cloudinary.com/duqwahasz/image/upload/v1795069481/lifescience/sliders/iyeldcpl7lcwpwfhuhf7.jpg",
      link: "/products",
      badgeText: "CLINICAL VETERINARY SCIENCE",
      buttonText: "Explore Products",
      isActive: true,
      sortOrder: sliders.length,
    });
    setModalOpen(true);
  };

  const openEditModal = (slider) => {
    setEditingSlider(slider);
    setFormData({
      title: slider.title || "",
      subtitle: slider.subtitle || "",
      imageUrl: slider.imageUrl || "",
      link: slider.link || "/products",
      badgeText: slider.badgeText || "",
      buttonText: slider.buttonText || "Explore Products",
      isActive: slider.isActive !== undefined ? slider.isActive : true,
      sortOrder: slider.sortOrder || 0,
    });
    setModalOpen(true);
  };

  // Toggle active state with 1 click
  const handleToggleActive = async (slider) => {
    try {
      const updated = { isActive: !slider.isActive };
      const res = await apiFetch(`/api/admin/sliders/${slider._id}`, {
        method: "PUT",
        body: JSON.stringify(updated),
      });

      if (res.success) {
        setSliders((prev) =>
          prev.map((s) => (s._id === slider._id ? { ...s, isActive: !slider.isActive } : s))
        );
        showToast(`Slider "${slider.title}" set to ${!slider.isActive ? "Active" : "Inactive"}`);
        // Clear cached sliders in client storage so customer storefront updates
        localStorage.removeItem("vetora_cached_sliders");
      }
    } catch (err) {
      alert("Error updating slider status: " + err.message);
    }
  };

  // Delete slider
  const handleDelete = async (slider) => {
    if (!window.confirm(`Are you sure you want to delete slider "${slider.title}"?`)) {
      return;
    }

    try {
      const res = await apiFetch(`/api/admin/sliders/${slider._id}`, {
        method: "DELETE",
      });

      if (res.success) {
        setSliders((prev) => prev.filter((s) => s._id !== slider._id));
        showToast("Slider deleted successfully");
        localStorage.removeItem("vetora_cached_sliders");
      }
    } catch (err) {
      alert("Error deleting slider: " + err.message);
    }
  };

  // Move slider up or down
  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sliders.length) return;

    const newSliders = [...sliders];
    const temp = newSliders[index];
    newSliders[index] = newSliders[targetIndex];
    newSliders[targetIndex] = temp;

    // Update sortOrder on objects
    const reordered = newSliders.map((s, idx) => ({ ...s, sortOrder: idx }));
    setSliders(reordered);

    try {
      await apiFetch("/api/admin/sliders/reorder", {
        method: "PUT",
        body: JSON.stringify({
          orders: reordered.map((s) => ({ id: s._id, sortOrder: s.sortOrder })),
        }),
      });
      localStorage.removeItem("vetora_cached_sliders");
      showToast("Slider order updated");
    } catch (err) {
      console.warn("Reorder error:", err);
    }
  };

  // Handle image upload from computer
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const body = new FormData();
    body.append("image", file);

    const token = localStorage.getItem("vetora_admin_token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/upload?type=slider`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Upload failed");

      if (json.success && json.data.url) {
        setFormData((prev) => ({ ...prev, imageUrl: json.data.url }));
        showToast("Image uploaded successfully!");
      }
    } catch (err) {
      alert("Image upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Submit form (create or edit)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.imageUrl) {
      alert("Please provide or upload a slider image");
      return;
    }

    try {
      if (editingSlider) {
        const res = await apiFetch(`/api/admin/sliders/${editingSlider._id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        if (res.success) {
          showToast("Slider updated successfully");
        }
      } else {
        const res = await apiFetch("/api/admin/sliders", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        if (res.success) {
          showToast("New slider added successfully");
        }
      }

      setModalOpen(false);
      localStorage.removeItem("vetora_cached_sliders");
      loadSliders();
    } catch (err) {
      alert("Failed to save slider: " + err.message);
    }
  };

  // Resolve thumbnail preview URL
  const getPreviewSrc = (url) => {
    if (url === "/uploads/sliders/slider1.png") return slider1;
    if (url === "/uploads/sliders/slider2.png") return slider2;
    if (url === "/uploads/sliders/slider3.png") return slider3;
    return resolveImageUrl(url, slider1);
  };

  return (
    <div>
      {/* Toast Notification */}
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
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Check size={18} color="#6ca338" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── Page Header Card ── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-page-main-title">Hero Sliders</h2>
          </div>

          <div className="admin-header-actions">
            <button
              type="button"
              onClick={loadSliders}
              className="admin-btn admin-btn-outline admin-btn-sm"
              title="Refresh sliders"
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              <span>Refresh</span>
            </button>
            <button type="button" onClick={openAddModal} className="admin-btn admin-btn-primary">
              <Plus size={16} />
              <span>Add New Slider</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: "12px 16px",
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: 10,
              color: "#b91c1c",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ── Sliders List ── */}
        {loading && sliders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--admin-text-muted)" }}>
            Loading sliders from backend...
          </div>
        ) : sliders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--admin-text-muted)" }}>
            No sliders found. Click "Add New Slider" to create one.
          </div>
        ) : (
          <div className="admin-sliders-list">
            {sliders.map((slider, index) => (
              <div className="admin-slider-item" key={slider._id}>
                {/* Order Controls */}
                <div className="admin-slider-order">
                  <div className="admin-order-badge">#{index + 1}</div>
                  <div className="admin-order-arrows">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, -1)}
                      className="admin-icon-btn"
                      title="Move Up"
                      style={{ padding: 4, opacity: index === 0 ? 0.3 : 1 }}
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={index === sliders.length - 1}
                      onClick={() => handleMove(index, 1)}
                      className="admin-icon-btn"
                      title="Move Down"
                      style={{ padding: 4, opacity: index === sliders.length - 1 ? 0.3 : 1 }}
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>
                </div>

                {/* Thumbnail Preview */}
                <div className="admin-slider-thumb-wrap">
                  <img
                    src={getPreviewSrc(slider.imageUrl)}
                    alt={slider.title}
                    className="admin-slider-thumb"
                  />
                  {slider.badgeText && (
                    <span className="admin-slider-thumb-badge">{slider.badgeText}</span>
                  )}
                </div>

                {/* Info */}
                <div className="admin-slider-info">
                  <div className="admin-slider-title-row">
                    {slider.badgeText && (
                      <span className="admin-slider-badge-tag">{slider.badgeText}</span>
                    )}
                    <h3 className="admin-slider-title">{slider.title}</h3>
                  </div>
                  <p className="admin-slider-sub">{slider.subtitle}</p>
                  <div className="admin-slider-meta-row">
                    <span className="admin-slider-meta-tag">
                      Target: <b>{slider.link || "/products"}</b>
                    </span>
                    {slider.buttonText && (
                      <span className="admin-slider-meta-tag">
                        Button: <b>{slider.buttonText}</b>
                      </span>
                    )}
                    <span className="admin-slider-url-tag" title={slider.imageUrl}>
                      Image: <code>{slider.imageUrl}</code>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="admin-slider-actions">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(slider)}
                    className={`admin-status-badge ${slider.isActive ? "active" : "inactive"}`}
                    style={{ cursor: "pointer", border: "none" }}
                    title="Click to toggle status"
                  >
                    {slider.isActive ? <Check size={12} /> : <X size={12} />}
                    <span>{slider.isActive ? "Active on Site" : "Inactive"}</span>
                  </button>

                  <div className="admin-action-btn-group">
                    <button
                      type="button"
                      onClick={() => openEditModal(slider)}
                      className="admin-icon-btn"
                      title="Edit slider"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(slider)}
                      className="admin-icon-btn delete"
                      title="Delete slider"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingSlider ? "Edit Hero Slider" : "Add New Hero Slider"}</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="admin-icon-btn"
                style={{ border: "none" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                {/* Live Banner Preview Box with real-time text & CTA overlay */}
                <div style={{ marginBottom: 6 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--admin-text-muted)" }}>
                    Live Preview
                  </label>
                  <div className="admin-slider-live-preview-box">
                    <img
                      src={getPreviewSrc(formData.imageUrl)}
                      alt="Preview"
                      className="admin-slider-preview-img"
                    />
                    <div className="admin-slider-preview-gradient" />
                    <div className="admin-slider-preview-content">
                      {formData.badgeText && (
                        <span className="admin-slider-preview-badge">
                          <span className="admin-slider-preview-dot" />
                          {formData.badgeText}
                        </span>
                      )}
                      <h4 className="admin-slider-preview-title">
                        {formData.title || "Slider Headline Title"}
                      </h4>
                      {formData.subtitle && (
                        <p className="admin-slider-preview-sub">{formData.subtitle}</p>
                      )}
                      {(formData.buttonText || formData.link) && (
                        <span className="admin-slider-preview-btn">
                          {formData.buttonText || "Explore Products"} →
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preset image selector */}
                <div className="admin-form-group">
                  <label>Preset Images</label>
                  <div className="admin-preset-grid">
                    {PRESET_IMAGES.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setFormData((p) => ({ ...p, imageUrl: preset.url }))}
                        className={`admin-preset-btn ${formData.imageUrl === preset.url ? "active" : ""}`}
                      >
                        Slider #{idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Or Custom Upload */}
                <div className="admin-form-group">
                  <label>Banner Image</label>
                  <div className="admin-slider-upload-row">
                    <label className="admin-slider-upload-btn">
                      <Upload size={14} />
                      <span>{uploading ? "Uploading..." : "Select File"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        style={{ display: "none" }}
                      />
                    </label>
                    <input
                      type="text"
                      className="admin-slider-url-input"
                      placeholder="Or enter image URL"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    />
                  </div>
                </div>

                {/* Title */}
                <div className="admin-form-group">
                  <label>Slider Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Slider title"
                  />
                </div>

                {/* Subtitle */}
                <div className="admin-form-group">
                  <label>Subtitle</label>
                  <textarea
                    rows={2}
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Subtitle description"
                  />
                </div>

                {/* Badge Tag & Button Text Row */}
                <div className="admin-form-row-2col">
                  <div className="admin-form-group">
                    <label>Badge Tag Text</label>
                    <input
                      type="text"
                      value={formData.badgeText}
                      onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                      placeholder="Badge text"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>CTA Button Text</label>
                    <input
                      type="text"
                      value={formData.buttonText}
                      onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                      placeholder="CTA button text"
                    />
                  </div>
                </div>

                {/* Target Page Link */}
                <div className="admin-form-group">
                  <label>Target Page Link</label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="/products"
                  />
                </div>

                {/* Active Checkbox */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, padding: "8px 12px", background: "#f5f9f6", borderRadius: 8, border: "1px solid #dce8de" }}>
                  <input
                    type="checkbox"
                    id="slider-active-cb"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ width: 18, height: 18, accentColor: "var(--admin-primary)", cursor: "pointer" }}
                  />
                  <label htmlFor="slider-active-cb" style={{ fontSize: 13, fontWeight: 700, cursor: "pointer", color: "var(--admin-primary)" }}>
                    Show this slider on the live website (Active)
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="admin-btn admin-btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editingSlider ? "Save Changes" : "Create Slider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
