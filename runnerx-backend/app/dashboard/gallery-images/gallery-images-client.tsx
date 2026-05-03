"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface Site {
  id: string;
  name: string;
  code: string;
}

interface GalleryImage {
  id: string;
  siteFor: string;
  year: string | null;
  mediaType: string;
  imagePath: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface GalleryImageForm {
  siteFor: string;
  year: string;
  mediaType: string;
  imagePath: string;
  sortOrder: number;
}

const emptyForm: GalleryImageForm = {
  siteFor: "",
  year: new Date().getFullYear().toString(),
  mediaType: "IMAGE",
  imagePath: "",
  sortOrder: 0,
};

export default function GalleryImagesClient() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [siteFilter, setSiteFilter] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GalleryImageForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  // Media upload state
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null);

  // Fetch sites for select boxes
  useEffect(() => {
    fetch("/api/sites")
      .then((res) => res.json())
      .then((data) => { if (data.success) setSites(data.sites); })
      .catch(() => console.error("Failed to fetch sites"));
  }, []);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (siteFilter) params.set("siteFor", siteFilter);
      const res = await fetch(`/api/gallery-images?${params}`);
      const data = await res.json();
      if (data.success) setImages(data.images);
    } catch {
      console.error("Failed to fetch images");
    } finally {
      setLoading(false);
    }
  }, [siteFilter]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  function openCreateModal() {
    setEditingId(null);
    setForm({ ...emptyForm, siteFor: sites[0]?.code || "", sortOrder: images.length + 1 });
    setMediaPreview(null);
    setFormErrors({});
    setServerError("");
    setShowModal(true);
  }

  function openEditModal(img: GalleryImage) {
    setEditingId(img.id);
    setForm({
      siteFor: img.siteFor,
      year: img.year || "",
      mediaType: img.mediaType,
      imagePath: img.imagePath,
      sortOrder: img.sortOrder,
    });
    setMediaPreview(img.imagePath);
    setFormErrors({});
    setServerError("");
    setShowModal(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      setFormErrors({ ...formErrors, imagePath: "Please select an image or video file" });
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setFormErrors({ ...formErrors, imagePath: "File must be less than 100MB" });
      return;
    }

    // Still use reader for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setForm({ 
      ...form, 
      imagePath: "", // We will use file input for the actual upload
      mediaType: isVideo ? "VIDEO" : "IMAGE"
    });
    setFormErrors({ ...formErrors, imagePath: "" });
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!form.siteFor) errors.siteFor = "Site is required";
    if (!editingId && (!fileInputRef.current?.files?.[0])) errors.imagePath = "Media file is required";
    if (parseInt(form.sortOrder.toString()) < 0) errors.sortOrder = "Sort order cannot be negative";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError("");

    const formData = new FormData();
    formData.append("siteFor", form.siteFor);
    formData.append("year", form.year);
    formData.append("mediaType", form.mediaType);
    formData.append("sortOrder", form.sortOrder.toString());
    
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      formData.append("file", file);
    }

    try {
      const url = editingId ? `/api/gallery-images/${editingId}` : "/api/gallery-images";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        body: formData, // Sending FormData automatically sets correct Content-Type
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.message || "Failed to save gallery item");
        return;
      }
      setShowModal(false);
      fetchImages();
    } catch {
      setServerError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  function confirmDelete(img: GalleryImage) {
    setDeleteTarget(img);
    setShowDeleteConfirm(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await fetch(`/api/gallery-images/${deleteTarget.id}`, { method: "DELETE" });
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      fetchImages();
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
          <h1 className="page-title">Gallery</h1>
          <p className="page-subtitle">Manage images and videos for the gallery page</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Upload Media
        </button>
      </div>

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

      <div className="table-wrapper">
        {loading ? (
          <div className="table-loading">
            <div className="spinner" />
            <p>Loading gallery items...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="table-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <p>No gallery items found</p>
            <button className="btn-primary btn-sm" onClick={openCreateModal}>Upload your first item</button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "120px" }}>Media</th>
                <th>Type</th>
                <th>Year</th>
                <th>Order</th>
                <th>Site</th>
                <th style={{ width: "120px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {images.map((img) => (
                <tr key={img.id}>
                  <td>
                    <div style={{
                      width: "100px",
                      height: "60px",
                      borderRadius: "6px",
                      overflow: "hidden",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      {img.mediaType === "VIDEO" ? (
                        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <video src={img.imagePath} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={img.imagePath}
                          alt="Gallery"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${img.mediaType === "VIDEO" ? "status-published" : "status-draft"}`}>
                      {img.mediaType}
                    </span>
                  </td>
                  <td>
                    <strong>{img.year || "—"}</strong>
                  </td>
                  <td>
                    <strong>{img.sortOrder}</strong>
                  </td>
                  <td>
                    <span className="site-badge">
                      {sites.find((s) => s.code === img.siteFor)?.name || img.siteFor}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn action-edit" onClick={() => openEditModal(img)} title="Edit">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="action-btn action-delete"
                        onClick={() => confirmDelete(img)}
                        disabled={deletingId === img.id}
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-sm">
            <div className="modal-header">
              <h2 className="modal-title">{editingId ? "Edit Item" : "Upload Media"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              {serverError && (
                <div className="login-alert login-alert-error" style={{ marginBottom: 16 }}>
                  <span>{serverError}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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

                <div className="modal-field">
                  <label className="modal-label">Year</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={form.year}
                    placeholder="e.g. 2025"
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-field">
                <label className="modal-label">Type</label>
                <select
                  className="modal-input"
                  value={form.mediaType}
                  onChange={(e) => setForm({ ...form, mediaType: e.target.value })}
                >
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video</option>
                </select>
              </div>

              <div className="modal-field">
                <label className="modal-label">File *</label>
                <div
                  style={{
                    border: `2px dashed ${formErrors.imagePath ? "#ef4444" : "rgba(255,255,255,0.15)"}`,
                    borderRadius: "10px",
                    padding: "24px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: "rgba(255,255,255,0.03)",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {mediaPreview ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                      {form.mediaType === "VIDEO" ? (
                        <video
                          src={mediaPreview}
                          style={{
                            maxWidth: "200px",
                            maxHeight: "120px",
                            objectFit: "contain",
                            borderRadius: "6px",
                          }}
                        />
                      ) : (
                        <img
                          src={mediaPreview}
                          alt="Preview"
                          style={{
                            maxWidth: "200px",
                            maxHeight: "120px",
                            objectFit: "contain",
                            borderRadius: "6px",
                          }}
                        />
                      )}
                      <span style={{ fontSize: "0.8rem", opacity: 0.5 }}>Click to change</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span style={{ fontSize: "0.85rem", opacity: 0.5 }}>
                        {uploading ? "Processing..." : "Click to upload image or video"}
                      </span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </div>
                {formErrors.imagePath && <span className="login-error-text">{formErrors.imagePath}</span>}
              </div>

              <div className="modal-field" style={{ marginTop: "16px" }}>
                <label className="modal-label">Sort Order</label>
                <input
                  type="number"
                  className={`modal-input ${formErrors.sortOrder ? "modal-input-error" : ""}`}
                  value={form.sortOrder}
                  min="0"
                  onChange={(e) => setForm({ ...form, sortOrder: Math.max(0, parseInt(e.target.value) || 0) })}
                />
                <span style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '4px', display: 'block' }}>
                  Lower numbers appear first
                </span>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting || uploading}>
                  {submitting ? "Saving..." : editingId ? "Update Item" : "Upload Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-content modal-sm">
            <div className="modal-header">
              <h2 className="modal-title">Delete Item</h2>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>×</button>
            </div>
            <p className="delete-confirm-text">
              Are you sure you want to delete this gallery item? This action cannot be undone.
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
