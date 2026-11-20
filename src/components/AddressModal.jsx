import React, { useState, useEffect } from "react";
import { X, MapPin, Building, Home, Stethoscope, Warehouse, CheckCircle2 } from "lucide-react";

const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab",
  "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Delhi NCR"
];

const ADDRESS_TYPES = [
  { id: "Home", label: "Home", icon: Home },
  { id: "Dairy Farm", label: "Dairy Farm", icon: Building },
  { id: "Clinic / Hospital", label: "Clinic", icon: Stethoscope },
  { id: "Warehouse", label: "Depot", icon: Warehouse }
];

export default function AddressModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    type: "Home",
    name: "",
    phone: "",
    altPhone: "",
    address: "",
    landmark: "",
    city: "",
    state: "Haryana",
    pinCode: "",
    isDefault: false
  });

  const [errors, setErrors] = useState({});

  // Reset or pre-fill form when modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || "Home",
        name: initialData.name || "",
        phone: initialData.phone || "",
        altPhone: initialData.altPhone || "",
        address: initialData.address || "",
        landmark: initialData.landmark || "",
        city: initialData.city || "",
        state: initialData.state || "Haryana",
        pinCode: initialData.pinCode || "",
        isDefault: Boolean(initialData.isDefault)
      });
    } else {
      setFormData({
        type: "Home",
        name: "",
        phone: "",
        altPhone: "",
        address: "",
        landmark: "",
        city: "",
        state: "Haryana",
        pinCode: "",
        isDefault: false
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Full Name is required";
    if (!formData.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (!/^[0-9+ -]{10,14}$/.test(formData.phone.trim())) {
      errs.phone = "Enter a valid 10-digit mobile number";
    }
    if (!formData.address.trim()) errs.address = "Street address or village is required";
    if (!formData.city.trim()) errs.city = "City or District is required";
    if (!formData.pinCode.trim()) {
      errs.pinCode = "6-digit PIN code is required";
    } else if (!/^[0-9]{6}$/.test(formData.pinCode.trim().replace(/\s+/g, ""))) {
      errs.pinCode = "PIN code must be exactly 6 digits";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card address-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <MapPin size={20} />
            </div>
            <div>
              <h3>{initialData ? "Edit Saved Address" : "Add New Delivery Address"}</h3>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Address Type Selector */}
          <div className="form-group-block">
            <label className="form-field-label">Address Type</label>
            <div className="address-type-selector">
              {ADDRESS_TYPES.map((t) => {
                const IconComponent = t.icon;
                const active = formData.type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`type-pill-btn ${active ? "active" : ""}`}
                    onClick={() => setFormData({ ...formData, type: t.id })}
                  >
                    <IconComponent size={14} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recipient Name & Phone Row */}
          <div className="modal-form-row-2">
            <div className="form-group-block">
              <label className="form-field-label">
                Recipient Name <span className="req">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`modal-input ${errors.name ? "error" : ""}`}
              />
              {errors.name && <span className="field-err-msg">{errors.name}</span>}
            </div>

            <div className="form-group-block">
              <label className="form-field-label">
                Mobile Number <span className="req">*</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`modal-input ${errors.phone ? "error" : ""}`}
              />
              {errors.phone && <span className="field-err-msg">{errors.phone}</span>}
            </div>
          </div>

          {/* Detailed Street Address */}
          <div className="form-group-block">
            <label className="form-field-label">
              Village / Ward No. / House No. / Landmark <span className="req">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Village Kheri, Near Cooperative Milk Chilling Center"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={`modal-input ${errors.address ? "error" : ""}`}
            />
            {errors.address && <span className="field-err-msg">{errors.address}</span>}
          </div>

          {/* Landmark & Alternate Phone Row */}
          <div className="modal-form-row-2">
            <div className="form-group-block">
              <label className="form-field-label">Landmark (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Opposite Veterinary Hospital"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                className="modal-input"
              />
            </div>

            <div className="form-group-block">
              <label className="form-field-label">Alternate Phone (Optional)</label>
              <input
                type="tel"
                placeholder="Secondary mobile or landline"
                value={formData.altPhone}
                onChange={(e) => setFormData({ ...formData, altPhone: e.target.value })}
                className="modal-input"
              />
            </div>
          </div>

          {/* City, State & PIN Code 3-Col Row */}
          <div className="modal-form-row-3">
            <div className="form-group-block">
              <label className="form-field-label">
                City / District <span className="req">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Karnal"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={`modal-input ${errors.city ? "error" : ""}`}
              />
              {errors.city && <span className="field-err-msg">{errors.city}</span>}
            </div>

            <div className="form-group-block">
              <label className="form-field-label">
                State <span className="req">*</span>
              </label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="modal-select"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group-block">
              <label className="form-field-label">
                PIN Code <span className="req">*</span>
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 132001"
                value={formData.pinCode}
                onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                className={`modal-input ${errors.pinCode ? "error" : ""}`}
              />
              {errors.pinCode && <span className="field-err-msg">{errors.pinCode}</span>}
            </div>
          </div>

          {/* Default Address Checkbox */}
          <div className="modal-checkbox-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              />
              <span>Set as default delivery address for future orders</span>
            </label>
          </div>

          {/* Actions: Cancel & Submit */}
          <div className="modal-actions-row">
            <button
              type="button"
              className="button button-outline modal-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="button button-lime modal-save-btn">
              <CheckCircle2 size={16} />
              {initialData ? "Update Address" : "Save Delivery Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
