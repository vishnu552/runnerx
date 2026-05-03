"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface Site {
  id: number;
  name: string;
  code: string;
}

interface RunnersInfo {
  id: number;
  siteFor: string;
  title: string;
  image: string;
  link: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface RunnersInfoForm {
  siteFor: string;
  title: string;
  image: string;
  link: string;
  sortOrder: number;
  isActive: boolean;
}

const emptyForm: RunnersInfoForm = {
  siteFor: "",
  title: "",
  image: "",
  link: "",
  sortOrder: 0,
  isActive: true,
};

export default function RunnersInfoClient({ initialSites }: { initialSites: any[] }) {
  const [items, setItems] = useState<RunnersInfo[]>([]);
  const [sites] = useState<Site[]>(initialSites);
  const [loading, setLoading] = useState(true);
  const [siteFilter, setSiteFilter] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<RunnersInfoForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  // Image upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RunnersInfo | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (siteFilter) params.set("siteFor", siteFilter);
      const res = await fetch(`/api/runners-info?${params}`);
      const data = await res.json();
      if (data.success) setItems(data.items);
    } catch {
      console.error("Failed to fetch runners info");
    } finally {
      setLoading(false);
    }
  }, [siteFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  function openCreateModal() {
    setEditingId(null);
    setForm({ ...emptyForm, siteFor: sites[0]?.code || "" });
    setImagePreview(null);
    setFormErrors({});
    setServerError("");
    setShowModal(true);
  }

  function openEditModal(item: RunnersInfo) {
    setEditingId(item.id);
    setForm({
      siteFor: item.siteFor,
      title: item.title,
      image: item.image,
      link: item.link || "",
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setImagePreview(item.image);
    setFormErrors({});
    setServerError("");
    setShowModal(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormErrors({ ...formErrors, image: "Please select an image file" });
      return;
    }

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
    if (!form.title.trim()) errors.title = "Title is required";
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
      ...form,
      link: form.link.trim() || null,
      sortOrder: Number(form.sortOrder),
    };

    try {
      const url = editingId ? `/api/runners-info/${editingId}` : "/api/runners-info";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.message || "Failed to save item");
        return;
      }
      setShowModal(false);
      fetchItems();
    } catch {
      setServerError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  function confirmDelete(item: RunnersInfo) {
    setDeleteTarget(item);
    setShowDeleteConfirm(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await fetch(`/api/runners-info/${deleteTarget.id}`, { method: "DELETE" });
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      fetchItems();
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
          <h1 className="page-title">Runners Info</h1>
          <p className="page-subtitle">Manage expanding cards for the runners information section</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          Add Card
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
            <p>Loading items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="table-empty">
            <p>No items found</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>Image</th>
                <th>Title</th>
                <th>Site</th>
                <th>Order</th>
                <th>Status</th>
                <th style={{ width: "120px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ width: "60px", height: "40px", borderRadius: "6px", overflow: "hidden", background: "#f1f5f9" }}>
                      <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  </td>
                  <td>{item.title}</td>
                  <td><span className="site-badge">{item.siteFor}</span></td>
                  <td>{item.sortOrder}</td>
                  <td>{item.isActive ? "Active" : "Inactive"}</td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn action-edit" onClick={() => openEditModal(item)}>Edit</button>
                      <button className="action-btn action-delete" onClick={() => confirmDelete(item)}>Delete</button>
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
              <h2 className="modal-title">{editingId ? "Edit Card" : "Add Card"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-field">
                <label className="modal-label">Site *</label>
                <select
                  className="modal-input"
                  value={form.siteFor}
                  onChange={(e) => setForm({ ...form, siteFor: e.target.value })}
                >
                  <option value="">Select Site</option>
                  {sites.map((site) => (
                    <option key={site.code} value={site.code}>{site.name} ({site.code})</option>
                  ))}
                </select>
              </div>

              <div className="modal-field">
                <label className="modal-label">Title *</label>
                <input
                  className="modal-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">Link</label>
                <input
                  className="modal-input"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="e.g. /route or /gallery"
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ cursor: 'pointer', border: '2px dashed #ccc', padding: '20px', textAlign: 'center' }}
                >
                  {imagePreview ? <img src={imagePreview} style={{ maxHeight: '100px' }} /> : 'Click to upload'}
                </div>
              </div>

              <div className="modal-field">
                <label className="modal-label">Sort Order</label>
                <input
                  type="number"
                  className="modal-input"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content modal-sm">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this card?</p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button onClick={handleDelete} className="btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
