"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface Site {
  id: string;
  name: string;
  code: string;
}

interface Sponsor {
  id: string;
  siteFor: string;
  title: string | null;
  image: string;
  createdAt: string;
}

interface SponsorForm {
  siteFor: string;
  title: string;
  image: string;
}

const emptyForm: SponsorForm = {
  siteFor: "",
  title: "",
  image: "",
};

export default function SponsorsClient() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [siteFilter, setSiteFilter] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SponsorForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  // Image upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Sponsor | null>(null);

  // Fetch sites for select boxes
  useEffect(() => {
    fetch("/api/sites")
      .then((res) => res.json())
      .then((data) => { if (data.success) setSites(data.sites); })
      .catch(() => console.error("Failed to fetch sites"));
  }, []);

  const fetchSponsors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (siteFilter) params.set("siteFor", siteFilter);
      const res = await fetch(`/api/sponsors?${params}`);
      const data = await res.json();
      if (data.success) setSponsors(data.sponsors);
    } catch {
      console.error("Failed to fetch sponsors");
    } finally {
      setLoading(false);
    }
  }, [siteFilter]);

  useEffect(() => {
    fetchSponsors();
  }, [fetchSponsors]);

  function openCreateModal() {
    setEditingId(null);
    setForm({ ...emptyForm, siteFor: sites[0]?.code || "" });
    setImagePreview(null);
    setFormErrors({});
    setServerError("");
    setShowModal(true);
  }

  function openEditModal(sponsor: Sponsor) {
    setEditingId(sponsor.id);
    setForm({
      siteFor: sponsor.siteFor,
      title: sponsor.title || "",
      image: sponsor.image,
    });
    setImagePreview(sponsor.image);
    setFormErrors({});
    setServerError("");
    setShowModal(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setFormErrors({ ...formErrors, image: "Please select an image file" });
      return;
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      setFormErrors({ ...formErrors, image: "Image must be less than 20MB" });
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setForm({ ...form, image: base64 });
      setImagePreview(base64);
      setFormErrors({ ...formErrors, image: "" });
      setUploading(false);
    };
    reader.readAsDataURL(file);
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!form.siteFor) errors.siteFor = "Site is required";
    if (!form.image.trim()) errors.image = "Image is required";
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
      title: form.title.trim() || null,
      image: form.image,
    };

    try {
      const url = editingId ? `/api/sponsors/${editingId}` : "/api/sponsors";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.message || "Failed to save sponsor");
        return;
      }
      setShowModal(false);
      fetchSponsors();
    } catch {
      setServerError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  function confirmDelete(sponsor: Sponsor) {
    setDeleteTarget(sponsor);
    setShowDeleteConfirm(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await fetch(`/api/sponsors/${deleteTarget.id}`, { method: "DELETE" });
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      fetchSponsors();
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
          <h1 className="page-title">Sponsors</h1>
          <p className="page-subtitle">Manage sponsor logos and images</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal} id="create-sponsor-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Sponsor
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="table-toolbar">
        <div></div>
        <select
          value={siteFilter}
          onChange={(e) => setSiteFilter(e.target.value)}
          className="table-filter-select"
        >
          <option value="">All Sites</option>
          {sites.map((site) => (
            <option key={site.code} value={site.code}>{site.name} ({site.code})</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div className="table-loading">
            <div className="spinner" />
            <p>Loading sponsors...</p>
          </div>
        ) : sponsors.length === 0 ? (
          <div className="table-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <p>No sponsors found</p>
            <button className="btn-primary btn-sm" onClick={openCreateModal}>Add your first sponsor</button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>Image</th>
                <th>Title</th>
                <th>Site</th>
                <th>Added</th>
                <th style={{ width: "120px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sponsors.map((sponsor) => (
                <tr key={sponsor.id}>
                  <td>
                    <div style={{
                      width: "60px",
                      height: "40px",
                      borderRadius: "6px",
                      overflow: "hidden",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sponsor.image}
                        alt={sponsor.title || "Sponsor"}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    </div>
                  </td>
                  <td>
                    {sponsor.title || <span style={{ opacity: 0.4, fontStyle: "italic" }}>No title</span>}
                  </td>
                  <td>
                    <span className="site-badge">
                      {sites.find((s) => s.code === sponsor.siteFor)?.name || sponsor.siteFor}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.85rem", opacity: 0.6 }}>
                    {new Date(sponsor.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn action-edit" onClick={() => openEditModal(sponsor)} title="Edit">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="action-btn action-delete"
                        onClick={() => confirmDelete(sponsor)}
                        disabled={deletingId === sponsor.id}
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
        <div className="modal-overlay">
          <div className="modal-content modal-sm">
            <div className="modal-header">
              <h2 className="modal-title">{editingId ? "Edit Sponsor" : "Add Sponsor"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              {serverError && (
                <div className="login-alert login-alert-error" style={{ marginBottom: 16 }}>
                  <span>{serverError}</span>
                </div>
              )}

              {/* Site For */}
              <div className="modal-field">
                <label className="modal-label">Site *</label>
                <select
                  className={`modal-input ${formErrors.siteFor ? "modal-input-error" : ""}`}
                  value={form.siteFor}
                  onChange={(e) => setForm({ ...form, siteFor: e.target.value })}
                >
                  <option value="">Select Site</option>
                  {sites.map((site) => (
                    <option key={site.code} value={site.code}>{site.name} ({site.code})</option>
                  ))}
                </select>
                {formErrors.siteFor && <span className="login-error-text">{formErrors.siteFor}</span>}
              </div>

              {/* Image Upload */}
              <div className="modal-field">
                <label className="modal-label">Sponsor Image / Logo *</label>
                <div
                  style={{
                    border: `2px dashed ${formErrors.image ? "#ef4444" : "rgba(255,255,255,0.15)"}`,
                    borderRadius: "10px",
                    padding: "24px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: "rgba(255,255,255,0.03)",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                          maxWidth: "200px",
                          maxHeight: "120px",
                          objectFit: "contain",
                          borderRadius: "6px",
                        }}
                      />
                      <span style={{ fontSize: "0.8rem", opacity: 0.5 }}>Click to change</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                      <span style={{ fontSize: "0.85rem", opacity: 0.5 }}>
                        {uploading ? "Processing..." : "Click to upload image"}
                      </span>
                      <span style={{ fontSize: "0.75rem", opacity: 0.3 }}>PNG, JPG, SVG up to 5MB</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </div>
                {formErrors.image && <span className="login-error-text">{formErrors.image}</span>}
              </div>

              {/* Title (Optional) */}
              <div className="modal-field" style={{ marginTop: "16px" }}>
                <label className="modal-label">Title <span style={{ opacity: 0.4, fontWeight: 400 }}>(optional)</span></label>
                <input
                  className="modal-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Title Sponsor, Hydration Partner..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting || uploading}>
                  {submitting ? "Saving..." : editingId ? "Update Sponsor" : "Add Sponsor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-content modal-sm">
            <div className="modal-header">
              <h2 className="modal-title">Delete Sponsor</h2>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>×</button>
            </div>
            <p className="delete-confirm-text">
              Are you sure you want to delete {deleteTarget.title ? <strong>{deleteTarget.title}</strong> : "this sponsor"}? This action cannot be undone.
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
