"use client";

import { useEffect, useState, useCallback } from "react";

interface Coupon {
  id: string;
  siteFor: string;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string | null;
  createdAt: string;
}

interface Site {
  id: string;
  name: string;
  code: string;
}

interface CouponForm {
  siteFor: string;
  code: string;
  description: string;
  discountType: string;
  discountValue: string;
  minOrderValue: string;
  maxDiscount: string;
  usageLimit: string;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
}

const emptyForm: CouponForm = {
  siteFor: "ALL",
  code: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  minOrderValue: "0",
  maxDiscount: "",
  usageLimit: "",
  isActive: true,
  validFrom: new Date().toISOString().split("T")[0],
  validUntil: "",
};

export default function CouponsClient() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [siteFilter, setSiteFilter] = useState("");

  // Fetch sites
  useEffect(() => {
    fetch("/api/sites")
      .then((res) => res.json())
      .then((data) => { if (data.success) setSites(data.sites); })
      .catch(() => console.error("Failed to fetch sites"));
  }, []);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (siteFilter) params.set("siteFor", siteFilter);
      const res = await fetch(`/api/coupons?${params}`);
      const data = await res.json();
      if (data.success) setCoupons(data.coupons);
    } catch {
      console.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setServerError("");
    setShowModal(true);
  }

  function openEditModal(coupon: Coupon) {
    setEditingId(coupon.id);
    setForm({
      siteFor: coupon.siteFor || "ALL",
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minOrderValue: String(coupon.minOrderValue ?? 0),
      maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : "",
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
      isActive: coupon.isActive,
      validFrom: coupon.validFrom?.split("T")[0] || "",
      validUntil: coupon.validUntil?.split("T")[0] || "",
    });
    setFormErrors({});
    setServerError("");
    setShowModal(true);
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!form.code.trim()) errors.code = "Code is required";
    if (!form.description.trim()) errors.description = "Description is required";
    if (!form.discountValue || parseFloat(form.discountValue) <= 0)
      errors.discountValue = "Discount must be positive";
    if (form.discountType === "PERCENTAGE" && parseFloat(form.discountValue) > 100)
      errors.discountValue = "Percentage cannot exceed 100";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError("");

    const payload = {
      siteFor: form.siteFor,
      code: form.code.toUpperCase(),
      description: form.description,
      discountType: form.discountType,
      discountValue: parseFloat(form.discountValue),
      minOrderValue: parseFloat(form.minOrderValue) || 0,
      maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : null,
      usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
      isActive: form.isActive,
      validFrom: form.validFrom || undefined,
      validUntil: form.validUntil || null,
    };

    try {
      const url = editingId ? `/api/coupons/${editingId}` : "/api/coupons";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.message || "Failed to save coupon");
        return;
      }
      setShowModal(false);
      fetchCoupons();
    } catch {
      setServerError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(id: string) {
    try {
      await fetch(`/api/coupons/${id}`, { method: "PATCH" });
      fetchCoupons();
    } catch {
      console.error("Failed to toggle status");
    }
  }

  function confirmDelete(coupon: Coupon) {
    setDeleteTarget(coupon);
    setShowDeleteConfirm(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await fetch(`/api/coupons/${deleteTarget.id}`, { method: "DELETE" });
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      fetchCoupons();
    } catch {
      console.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Coupons</h1>
          <p className="page-subtitle">Manage your discount coupons</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal} id="create-coupon-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Coupon
        </button>
      </div>

      {/* Filters */}
      <div className="table-toolbar">
        <div className="table-search-wrapper">
          <svg className="table-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search coupons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="table-search"
          />
        </div>
        <select
          value={siteFilter}
          onChange={(e) => setSiteFilter(e.target.value)}
          className="table-filter-select"
        >
          <option value="">All Sites</option>
          <option value="ALL">Global (ALL)</option>
          {sites.map(s => <option key={s.id} value={s.code}>{s.name} ({s.code})</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="table-filter-select"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div className="table-loading">
            <div className="spinner" />
            <p>Loading coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="table-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
              <path d="M2 9a3 3 0 013-3h14a3 3 0 013 3v6a3 3 0 01-3 3H5a3 3 0 01-3-3V9z" />
              <path d="M9 12h6" />
            </svg>
            <p>No coupons found</p>
            <button className="btn-primary btn-sm" onClick={openCreateModal}>Create your first coupon</button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Site</th>
                <th>Code</th>
                <th>Description</th>
                <th>Discount</th>
                <th>Usage</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td>
                    <span className={`status-badge ${coupon.siteFor === "ALL" ? "status-active" : "status-inactive"}`} style={{ padding: '4px 8px' }}>
                      {coupon.siteFor}
                    </span>
                  </td>
                  <td>
                    <span className="coupon-code-badge">{coupon.code}</span>
                  </td>
                  <td className="td-description">{coupon.description}</td>
                  <td>
                    {coupon.discountType === "PERCENTAGE"
                      ? `${coupon.discountValue}%`
                      : `₹${coupon.discountValue}`}
                  </td>
                  <td>
                    {coupon.usedCount}
                    {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                  </td>
                  <td>
                    <button
                      className={`status-badge ${coupon.isActive ? "status-active" : "status-inactive"}`}
                      onClick={() => handleToggleStatus(coupon.id)}
                      title="Click to toggle"
                    >
                      {coupon.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn action-edit" onClick={() => openEditModal(coupon)} title="Edit">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="action-btn action-delete"
                        onClick={() => confirmDelete(coupon)}
                        disabled={deletingId === coupon.id}
                        title="Delete"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingId ? "Edit Coupon" : "Create Coupon"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              {serverError && (
                <div className="login-alert login-alert-error" style={{ marginBottom: 16 }}>
                  <span>{serverError}</span>
                </div>
              )}
              <div className="modal-grid">
                <div className="modal-field">
                  <label className="modal-label">Site Selection</label>
                  <select
                    className="modal-input"
                    value={form.siteFor}
                    onChange={(e) => setForm({ ...form, siteFor: e.target.value })}
                  >
                    <option value="ALL">All Sites (Global)</option>
                    {sites.map(s => <option key={s.id} value={s.code}>{s.name} ({s.code})</option>)}
                  </select>
                </div>
                <div className="modal-field">
                  <label className="modal-label">Coupon Code</label>
                  <input
                    className={`modal-input ${formErrors.code ? "modal-input-error" : ""}`}
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SAVE20"
                  />
                  {formErrors.code && <span className="login-error-text">{formErrors.code}</span>}
                </div>
              </div>

              <div className="modal-grid">
                <div className="modal-field">
                  <label className="modal-label">Discount Type</label>
                  <select
                    className="modal-input"
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat (₹)</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label className="modal-label">Description</label>
                  <input
                    className={`modal-input ${formErrors.description ? "modal-input-error" : ""}`}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="e.g. 20% off on all orders"
                  />
                  {formErrors.description && <span className="login-error-text">{formErrors.description}</span>}
                </div>
              </div>

              <div className="modal-grid">
                <div className="modal-field">
                  <label className="modal-label">Discount Value</label>
                  <input
                    type="number"
                    step="0.01"
                    className={`modal-input ${formErrors.discountValue ? "modal-input-error" : ""}`}
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    placeholder={form.discountType === "PERCENTAGE" ? "e.g. 20" : "e.g. 100"}
                  />
                  {formErrors.discountValue && <span className="login-error-text">{formErrors.discountValue}</span>}
                </div>
                <div className="modal-field">
                  <label className="modal-label">Min Order Value</label>
                  <input
                    type="number"
                    step="0.01"
                    className="modal-input"
                    value={form.minOrderValue}
                    onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                    placeholder="e.g. 500"
                  />
                </div>
              </div>

              <div className="modal-grid">
                <div className="modal-field">
                  <label className="modal-label">Max Discount</label>
                  <input
                    type="number"
                    step="0.01"
                    className="modal-input"
                    value={form.maxDiscount}
                    onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Usage Limit</label>
                  <input
                    type="number"
                    className="modal-input"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div className="modal-grid">
                <div className="modal-field">
                  <label className="modal-label">Valid From</label>
                  <input
                    type="date"
                    className="modal-input"
                    value={form.validFrom}
                    onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Valid Until</label>
                  <input
                    type="date"
                    className="modal-input"
                    value={form.validUntil}
                    onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-field modal-checkbox-row">
                <label className="modal-checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="modal-checkbox"
                  />
                  <span>Active</span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : editingId ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && deleteTarget && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Delete Coupon</h2>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>×</button>
            </div>
            <p className="delete-confirm-text">
              Are you sure you want to delete coupon <strong>{deleteTarget.code}</strong>? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete} disabled={deletingId === deleteTarget.id}>
                {deletingId === deleteTarget.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
