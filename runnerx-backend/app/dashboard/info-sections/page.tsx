"use client";

import { useState, useEffect, useCallback } from "react";

interface InfoSection {
  id: number;
  siteFor: string;
  pageType: string;
  heading: string;
  content: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const PAGE_TYPES = [
  { value: "FAQ", label: "FAQ", desc: "Questions & Answers", icon: "❓" },
  { value: "TERMS", label: "Terms & Conditions", desc: "Legal terms for participation", icon: "📋" },
  { value: "PRIVACY", label: "Privacy Policy", desc: "Data privacy & cookie policies", icon: "🔒" },
  { value: "POLICY", label: "Dashboard Policies", desc: "General policies shown in user dashboard", icon: "🛡️" },
];

export default function InfoSectionsPage() {
  const [sites, setSites] = useState<{ id: string; name: string; code: string }[]>([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [selectedPageType, setSelectedPageType] = useState("FAQ");
  const [sections, setSections] = useState<InfoSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formHeading, setFormHeading] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formActive, setFormActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/sites")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.sites) {
          setSites(data.sites);
          if (data.sites.length > 0) setSelectedSite(data.sites[0].code);
        }
      });
  }, []);

  const fetchSections = useCallback(async () => {
    if (!selectedSite) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/info-sections/all?siteFor=${selectedSite}&pageType=${selectedPageType}`
      );
      const data = await res.json();
      if (data.success) {
        setSections(data.sections);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to fetch sections" });
    } finally {
      setLoading(false);
    }
  }, [selectedSite, selectedPageType]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  function resetForm() {
    setEditingId(null);
    setFormHeading("");
    setFormContent("");
    setFormSortOrder(sections.length);
    setFormActive(true);
    setShowForm(false);
  }

  function handleAdd() {
    resetForm();
    setFormSortOrder(sections.length);
    setShowForm(true);
  }

  function handleEdit(section: InfoSection) {
    setEditingId(section.id);
    setFormHeading(section.heading);
    setFormContent(section.content);
    setFormSortOrder(section.sortOrder);
    setFormActive(section.isActive);
    setShowForm(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formHeading.trim() || !formContent.trim()) {
      setMessage({ type: "error", text: "Heading and content are required" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const url = editingId
        ? `/api/info-sections/${editingId}`
        : "/api/info-sections";
      const method = editingId ? "PUT" : "POST";

      const payload: Record<string, unknown> = {
        heading: formHeading,
        content: formContent,
        sortOrder: formSortOrder,
        isActive: formActive,
      };

      if (!editingId) {
        payload.siteFor = selectedSite;
        payload.pageType = selectedPageType;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({
          type: "success",
          text: editingId ? "Section updated!" : "Section created!",
        });
        resetForm();
        fetchSections();
      } else {
        setMessage({ type: "error", text: data.message || "Failed to save" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this section?")) return;

    try {
      const res = await fetch(`/api/info-sections/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Section deleted" });
        fetchSections();
        if (editingId === id) resetForm();
      } else {
        setMessage({ type: "error", text: data.message || "Failed to delete" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to delete" });
    }
  }

  async function handleToggleActive(section: InfoSection) {
    try {
      const res = await fetch(`/api/info-sections/${section.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !section.isActive }),
      });
      const data = await res.json();
      if (data.success) fetchSections();
    } catch {
      setMessage({ type: "error", text: "Failed to toggle" });
    }
  }

  const activePageType = PAGE_TYPES.find((p) => p.value === selectedPageType);
  const headingLabel = selectedPageType === "FAQ" ? "Question" : "Section Heading";
  const contentLabel = selectedPageType === "FAQ" ? "Answer" : "Section Content";

  return (
    <div className="page-content">
      {/* Header */}
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1 className="page-title">Info Sections</h1>
          <p className="page-subtitle">
            Manage FAQ, Terms & Conditions, and Privacy Policy content.
            Each section has a heading and description — no HTML or JSON needed.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
          <div className="form-group" style={{ marginBottom: 0, minWidth: "180px" }}>
            <label className="form-label">Site</label>
            <select
              className="form-select"
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
            >
              {sites.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}
          style={{ marginBottom: "20px" }}
        >
          {message.text}
          <button
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontSize: "1.1rem",
            }}
            onClick={() => setMessage(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Page type tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        {PAGE_TYPES.map((pt) => (
          <button
            key={pt.value}
            onClick={() => {
              setSelectedPageType(pt.value);
              resetForm();
            }}
            className={`btn ${selectedPageType === pt.value ? "btn-primary" : "btn-outline"}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              fontSize: "0.95rem",
            }}
          >
            <span>{pt.icon}</span>
            <span>{pt.label}</span>
          </button>
        ))}
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div
          className="card"
          style={{
            padding: "28px",
            marginBottom: "24px",
            borderLeft: "4px solid var(--primary)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
              {editingId ? "Edit Section" : `Add New ${activePageType?.label} Section`}
            </h2>
            <button
              className="btn btn-outline"
              onClick={resetForm}
              style={{ padding: "6px 14px", fontSize: "0.85rem" }}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label className="form-label" style={{ fontSize: "1rem", fontWeight: 600 }}>
                {headingLabel} *
              </label>
              <input
                type="text"
                className="form-input"
                value={formHeading}
                onChange={(e) => setFormHeading(e.target.value)}
                placeholder={
                  selectedPageType === "FAQ"
                    ? "e.g. How do I register for the marathon?"
                    : "e.g. 1. Registration & Participation"
                }
                style={{ fontSize: "1rem", padding: "12px 16px" }}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label className="form-label" style={{ fontSize: "1rem", fontWeight: 600 }}>
                {contentLabel} *
              </label>
              <textarea
                className="form-textarea"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder={
                  selectedPageType === "FAQ"
                    ? "Type the answer here. You can use multiple lines for clarity."
                    : "Type the section content. Use line breaks for paragraphs."
                }
                rows={8}
                style={{
                  fontSize: "1rem",
                  padding: "14px 16px",
                  lineHeight: 1.6,
                  width: "100%",
                }}
                required
              />
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Tip: Use blank lines to separate paragraphs. Content will display with proper formatting.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "flex-end",
                flexWrap: "wrap",
              }}
            >
              <div className="form-group" style={{ marginBottom: 0, width: "120px" }}>
                <label className="form-label">Sort Order</label>
                <input
                  type="number"
                  className="form-input"
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(Number(e.target.value))}
                  style={{ padding: "10px 14px" }}
                />
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  padding: "10px 0",
                }}
              >
                <input
                  type="checkbox"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: "pointer" }}
                />
                Active (visible on site)
              </label>

              <div style={{ marginLeft: "auto" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ minWidth: "140px", padding: "10px 24px" }}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Section"
                    : "Add Section"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Sections List */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text)" }}>
          {activePageType?.icon} {activePageType?.label}{" "}
          <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
            ({sections.length} sections)
          </span>
        </h3>
        {!showForm && (
          <button className="btn btn-primary" onClick={handleAdd}>
            + Add Section
          </button>
        )}
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--text-muted)",
            background: "var(--surface)",
            borderRadius: "8px",
            border: "1px solid var(--border)",
          }}
        >
          Loading…
        </div>
      ) : sections.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--text-muted)",
            background: "var(--surface)",
            borderRadius: "8px",
            border: "1px solid var(--border)",
          }}
        >
          <p style={{ fontSize: "2rem", marginBottom: "12px" }}>
            {activePageType?.icon}
          </p>
          <p>
            No {activePageType?.label} sections yet for this site.
            <br />
            Click "Add Section" to get started.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {sections.map((section, idx) => (
            <div
              key={section.id}
              className="card"
              style={{
                padding: 0,
                overflow: "hidden",
                border: "1px solid var(--border)",
                opacity: section.isActive ? 1 : 0.5,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  padding: "16px 20px",
                  gap: "16px",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        background: "var(--surface-alt)",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontFamily: "monospace",
                      }}
                    >
                      #{section.sortOrder}
                    </span>
                    {!section.isActive && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          color: "#ef4444",
                          background: "#fef2f2",
                          padding: "2px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        HIDDEN
                      </span>
                    )}
                  </div>
                  <h4
                    style={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "var(--text)",
                      marginBottom: "6px",
                    }}
                  >
                    {section.heading}
                  </h4>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {section.content}
                  </p>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    flexShrink: 0,
                    alignItems: "center",
                  }}
                >
                  <button
                    className="btn btn-outline"
                    onClick={() => handleToggleActive(section)}
                    title={section.isActive ? "Hide" : "Show"}
                    style={{ padding: "6px 10px", fontSize: "0.8rem" }}
                  >
                    {section.isActive ? "👁" : "👁‍🗨"}
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => handleEdit(section)}
                    style={{ padding: "6px 10px", fontSize: "0.8rem" }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => handleDelete(section.id)}
                    style={{
                      padding: "6px 10px",
                      fontSize: "0.8rem",
                      color: "#ef4444",
                      borderColor: "#fecaca",
                    }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
