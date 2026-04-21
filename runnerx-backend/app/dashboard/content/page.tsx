"use client";

import { useState, useEffect, useCallback } from "react";

interface ContentBlock {
  id: string;
  siteFor: string;
  page: string;
  section: string;
  key: string;
  value: string;
  type: string;
  sortOrder: number;
  isActive: boolean;
  updatedAt: string;
}

interface GroupedContent {
  [section: string]: ContentBlock[];
}

const PAGES = [
  { value: "global", label: "Global (Shared)", desc: "Brand info, contact details, standard assets." },
  { value: "home", label: "Home Page", desc: "Hero banners, overview, generic home strings." },
  { value: "about", label: "About Page", desc: "Mission, vision, team bios, and timeline." },
  { value: "faq", label: "FAQ Page", desc: "Frequently asked questions and answers." },
  { value: "contact", label: "Contact Page", desc: "Contact forms, addresses, and social links." },
  { value: "gallery", label: "Gallery Page", desc: "Event photos and showcase." },
  { value: "route", label: "Route & Venue Page", desc: "Course maps, landmarks, and aid stations." },
  { value: "privacy", label: "Privacy Policy", desc: "Privacy policy legal document." },
  { value: "terms", label: "Terms & Conditions", desc: "Terms & conditions legal document." },
];

const TYPE_LABELS: Record<string, string> = {
  TEXT: "Text",
  IMAGE: "Image URL",
  HTML: "HTML",
  JSON: "JSON",
  LINK: "Link URL",
};

function humanizeKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function humanizeSection(section: string): string {
  return section
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ContentManagerPage() {
  const [view, setView] = useState<"list" | "edit">("list");
  const [sites, setSites] = useState<{ id: string; name: string; code: string }[]>([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  
  const [content, setContent] = useState<ContentBlock[]>([]);
  const [grouped, setGrouped] = useState<GroupedContent>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [saveAll, setSaveAll] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch sites on mount
  useEffect(() => {
    fetch("/api/sites")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.sites) {
          setSites(data.sites);
          if (data.sites.length > 0) {
            setSelectedSite(data.sites[0].code);
          }
        }
      });
  }, []);

  const fetchContent = useCallback(async () => {
    if (!selectedSite || !selectedPage) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/page-content?siteFor=${selectedSite}&page=${selectedPage}`
      );
      const data = await res.json();
      if (data.success) {
        setContent(data.content);
        // Group by section
        const groups: GroupedContent = {};
        for (const item of data.content) {
          if (!groups[item.section]) groups[item.section] = [];
          groups[item.section].push(item);
        }
        setGrouped(groups);
        setEditedValues({});
      }
    } catch {
      setMessage({ type: "error", text: "Failed to fetch content" });
    } finally {
      setLoading(false);
    }
  }, [selectedSite, selectedPage]);

  // Only fetch when arriving on 'edit' view or changing site while in edit view
  useEffect(() => {
    if (view === "edit" && selectedPage) {
      fetchContent();
    }
  }, [fetchContent, view, selectedPage]);

  function handleEditPage(pageValue: string) {
    setSelectedPage(pageValue);
    setView("edit");
  }

  function handleBackToList() {
    setView("list");
    setSelectedPage(null);
    setContent([]);
    setGrouped({});
    setEditedValues({});
    setMessage(null);
  }

  function handleValueChange(id: string, value: string) {
    setEditedValues((prev) => ({ ...prev, [id]: value }));
  }

  async function handleFileUpload(id: string, file?: File) {
    if (!file) return;

    setUploading(id);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        handleValueChange(id, data.url);
        setMessage({ type: "success", text: "Image uploaded successfully!" });
      } else {
        setMessage({ type: "error", text: data.message || "Upload failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Connection error during upload" });
    } finally {
      setUploading(null);
    }
  }

  async function handleSaveItem(item: ContentBlock) {
    const newValue = editedValues[item.id];
    if (newValue === undefined) return;

    setSaving(item.id);
    setMessage(null);
    try {
      const res = await fetch(`/api/page-content/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: newValue }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Saved: ${item.section}.${item.key}` });
        setContent((prev) =>
          prev.map((c) => (c.id === item.id ? { ...c, value: newValue } : c))
        );
        setEditedValues((prev) => {
          const updated = { ...prev };
          delete updated[item.id];
          return updated;
        });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to save" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save" });
    } finally {
      setSaving(null);
    }
  }

  async function handleSaveAll() {
    const changedItems = content.filter((c) => editedValues[c.id] !== undefined);
    if (changedItems.length === 0) return;

    setSaveAll(true);
    setMessage(null);
    try {
      const items = changedItems.map((item) => ({
        siteFor: item.siteFor,
        page: item.page,
        section: item.section,
        key: item.key,
        value: editedValues[item.id],
        type: item.type,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
      }));

      const res = await fetch("/api/page-content/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Saved ${data.count} changes!` });
        setEditedValues({});
        fetchContent();
      } else {
        setMessage({ type: "error", text: data.message || "Failed to save" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save" });
    } finally {
      setSaveAll(false);
    }
  }

  const hasChanges = Object.keys(editedValues).length > 0;
  const activePageObj = PAGES.find(p => p.value === selectedPage);

  function renderInput(item: ContentBlock) {
    const currentValue =
      editedValues[item.id] !== undefined ? editedValues[item.id] : item.value;
    const isChanged = editedValues[item.id] !== undefined;

    if (item.type === "IMAGE") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <input
              type="text"
              className="form-input"
              value={currentValue}
              onChange={(e) => handleValueChange(item.id, e.target.value)}
              placeholder="Paste Image URL or Upload below..."
              style={{ 
                flex: 1,
                padding: "12px 16px",
                fontSize: "1rem",
                borderColor: isChanged ? "#f59e0b" : undefined 
              }}
            />
            {isChanged && (
              <button
                className="btn btn-primary"
                onClick={() => handleSaveItem(item)}
                disabled={saving === item.id}
                style={{ whiteSpace: "nowrap", minWidth: "80px" }}
              >
                {saving === item.id ? "..." : "Save"}
              </button>
            )}
          </div>
          
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "16px", 
            background: "rgba(255,255,255,0.03)", 
            padding: "12px", 
            borderRadius: "8px", 
            border: "1px dashed var(--border)",
            marginTop: "4px"
          }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
               <input 
                  type="file" 
                  accept="image/*"
                  id={`upload-${item.id}`}
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(item.id, e.target.files?.[0])}
               />
               <label 
                  htmlFor={`upload-${item.id}`} 
                  className="btn btn-sm btn-outline" 
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
               >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  {uploading === item.id ? "Uploading..." : "Upload Local Image"}
               </label>
               <span style={{ marginLeft: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {uploading === item.id ? "Processing..." : "Select PNG, JPG, or SVG"}
               </span>
            </div>
            {currentValue && (
              <div style={{ 
                width: "80px", 
                height: "50px", 
                borderRadius: "6px", 
                overflow: 'hidden', 
                border: "1px solid var(--border)", 
                background: "var(--surface)",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img src={currentValue} alt="Preview" style={{ width: "100%", height: "100%", objectFit: 'cover' }} />
              </div>
            )}
          </div>
        </div>
      );
    }

    if (item.type === "HTML" || item.type === "JSON") {
      return (
        <div style={{ position: "relative" }}>
          <textarea
            className="form-textarea content-code-editor"
            value={currentValue}
            onChange={(e) => handleValueChange(item.id, e.target.value)}
            rows={item.type === "JSON" ? 10 : 16}
            spellCheck={false}
            style={{
              fontFamily: "monospace",
              fontSize: "0.95rem",
              width: "100%",
              borderColor: isChanged ? "#f59e0b" : undefined,
              padding: "16px",
            }}
          />
          {isChanged && (
            <button
              className="btn-content-save-inline"
              onClick={() => handleSaveItem(item)}
              disabled={saving === item.id}
            >
              {saving === item.id ? "..." : "Save"}
            </button>
          )}
        </div>
      );
    }

    if (
      item.value.length > 100 ||
      item.key.includes("text") ||
      item.key.includes("paragraph") ||
      item.key.includes("subtitle") ||
      item.key.includes("desc") ||
      item.key.includes("bio") ||
      item.key.includes("disclaimer") ||
      item.key.includes("notice") ||
      item.key.includes("items")
    ) {
      return (
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", width: "100%" }}>
          <textarea
            className="form-textarea"
            value={currentValue}
            onChange={(e) => handleValueChange(item.id, e.target.value)}
            rows={5}
            style={{ 
              flex: 1, 
              padding: "12px 16px",
              fontSize: "1rem",
              lineHeight: 1.5,
              borderColor: isChanged ? "#f59e0b" : undefined 
            }}
          />
          {isChanged && (
            <button
              className="btn btn-primary"
              onClick={() => handleSaveItem(item)}
              disabled={saving === item.id}
              style={{ whiteSpace: "nowrap", minWidth: "80px", alignSelf: "flex-start" }}
            >
              {saving === item.id ? "..." : "Save"}
            </button>
          )}
        </div>
      );
    }

    return (
      <div style={{ display: "flex", gap: "12px", alignItems: "center", width: "100%" }}>
        <input
          type="text"
          className="form-input"
          value={currentValue}
          onChange={(e) => handleValueChange(item.id, e.target.value)}
          style={{ 
            flex: 1,
            padding: "12px 16px",
            fontSize: "1rem",
            borderColor: isChanged ? "#f59e0b" : undefined 
          }}
        />
        {isChanged && (
          <button
            className="btn btn-primary"
            onClick={() => handleSaveItem(item)}
            disabled={saving === item.id}
            style={{ whiteSpace: "nowrap", minWidth: "80px" }}
          >
            {saving === item.id ? "..." : "Save"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title">Content Manager</h1>
          <p className="page-subtitle">
            Manage all dynamic text, images, and content for your public-facing pages.
          </p>
        </div>
        <div className="form-group" style={{ minWidth: "220px", marginBottom: 0 }}>
          <label className="form-label">Manage Content For Site</label>
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

      {/* Message Notifications */}
      {message && (
        <div
          className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}
          style={{ marginBottom: "24px" }}
        >
          {message.text}
          <button
            style={{ marginLeft: "auto", background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "1.1rem" }}
            onClick={() => setMessage(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* VIEW: LIST (Data Table) */}
      {view === "list" && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "30%" }}>Page Name</th>
                <th style={{ width: "15%" }}>Key</th>
                <th style={{ width: "40%" }}>Description</th>
                <th style={{ width: "15%", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {PAGES.map((p) => (
                <tr key={p.value}>
                  <td style={{ fontWeight: 600, color: "var(--text)", fontSize: "1.05rem" }}>{p.label}</td>
                  <td><span className="badge" style={{ background: "var(--surface-alt)", color: "var(--text-secondary)" }}>{p.value}</span></td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>{p.desc}</td>
                  <td style={{ textAlign: "right" }}>
                    <button 
                      className="btn btn-sm btn-primary" 
                      onClick={() => handleEditPage(p.value)}
                      style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        gap: "6px",
                        transition: "all 0.2s ease",
                        padding: "8px 16px"
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW: EDIT (Form) */}
      {view === "edit" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", paddingBottom: "16px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <button className="btn btn-outline" onClick={handleBackToList}>
                ← Back to Pages
              </button>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "var(--text)" }}>
                  Editing: {activePageObj?.label}
                </h2>
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
                  {content.length} content blocks available for "{selectedPage}"
                </div>
              </div>
            </div>
            
            {hasChanges && (
              <button
                className="btn btn-primary"
                onClick={handleSaveAll}
                disabled={saveAll}
                style={{ minWidth: "140px", padding: "10px 24px", fontSize: "1rem" }}
              >
                {saveAll ? "Saving..." : `Save All (${Object.keys(editedValues).length})`}
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", background: "var(--surface)", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <span style={{ display: "inline-block", animation: "spin 1s linear infinite", marginRight: "8px" }}>⏳</span>
              Loading content...
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", background: "var(--surface)", borderRadius: "8px", border: "1px solid var(--border)" }}>
              No content found for this page. Seed the database or create content blocks.
            </div>
          ) : (
            Object.entries(grouped).map(([section, items]) => (
              <div key={section} className="content-section-card" style={{ marginBottom: "24px" }}>
                <div className="content-section-header">
                  <h3 className="content-section-title" style={{ fontSize: "1.3rem" }}>{humanizeSection(section)}</h3>
                  <span className="content-section-count">{items.length} fields</span>
                </div>
                <div className="content-section-body">
                  {items
                    .filter((item) => {
                      // Hide fields that are now managed by InfoSections
                      if (["faq", "terms", "privacy"].includes(selectedPage || "")) {
                        if (item.key === "items" || item.key === "body") return false;
                      }
                      return true;
                    })
                    .map((item) => (
                      <div key={item.id} className="content-field" style={{ marginBottom: "24px" }}>
                      <div className="content-field-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <label className="form-label" style={{ marginBottom: 0, fontSize: "1.1rem", color: "var(--text)", fontWeight: 600 }}>
                          {humanizeKey(item.key)}
                        </label>
                        <span className="content-type-badge">{TYPE_LABELS[item.type] || item.type}</span>
                      </div>
                      {renderInput(item)}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
