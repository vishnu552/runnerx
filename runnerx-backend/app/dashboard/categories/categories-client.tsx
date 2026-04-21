"use client";
// @ts-nocheck

import { useState, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { ImageUpload } from "@/components/image-upload";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

interface CategoryTab {
  id: string;
  title: string;
  body: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface Category {
  id: string;
  slug: string;
  name: string;
  distanceLabel: string;
  icon: string | null;
  heroImage: string | null;
  tagline: string | null;
  order: number;
  isActive: boolean;
  tabs: CategoryTab[];
}

const SITES = [
  { code: "KTA", name: "Kota" },
  { code: "JDH", name: "Jodhpur" },
  { code: "UDR", name: "Udaipur" },
];

interface AlertMessage {
  type: "success" | "error";
  text: string;
}

export default function CategoriesClient() {
  const [siteFor, setSiteFor] = useState("KTA");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<AlertMessage | null>(null);
  const [activeTab, setActiveTab] = useState("category"); // "category" | "create" | "tabs"

  // Tab editing
  const [editingTab, setEditingTab] = useState<CategoryTab | null>(null);
  const [showNewTab, setShowNewTab] = useState(false);
  const [tabBody, setTabBody] = useState("");
  const editorRef = useRef(null);
  const joditConfig = useMemo(() => ({ readonly: false, height: 400 }), []);

  useEffect(() => {
    fetchCategories();
  }, [siteFor]);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch(`/api/categories?siteFor=${siteFor}&active=false`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
        if (selectedCategory) {
          const updated = data.categories.find((c: Category) => c.id === selectedCategory.id);
          if (updated) setSelectedCategory(updated);
        }
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
    setLoading(false);
  }

  // ─── Create Category ───
  async function handleCreateCategory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const data = {
      siteFor,
      slug: fd.get("slug") as string,
      name: fd.get("name") as string,
      distanceLabel: fd.get("distanceLabel") as string,
      heroImage: (fd.get("heroImage") as string) || null,
      tagline: (fd.get("tagline") as string) || null,
      order: parseInt(fd.get("order") as string) || 0,
      icon: (fd.get("icon") as string) || null,
    };

    setSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setMessage({ type: "success", text: "Category created successfully!" });
        fetchCategories();
        form.reset();
        setActiveTab("category");
      } else {
        setMessage({ type: "error", text: result.message || "Failed to create category" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to create category" });
    }
    setSaving(false);
  }

  // ─── Update Category fields ───
  async function handleUpdateCategory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedCategory) return;

    const form = e.currentTarget;
    const fd = new FormData(form);

    const data: Record<string, unknown> = {
      name: fd.get("name") as string,
      distanceLabel: fd.get("distanceLabel") as string,
      icon: (fd.get("icon") as string) || null,
      heroImage: (fd.get("heroImage") as string) || null,
      tagline: (fd.get("tagline") as string) || null,
      order: parseInt(fd.get("order") as string) || 0,
      isActive: fd.get("isActive") === "on",
    };

    setSaving(true);
    try {
      const res = await fetch(`/api/categories/${selectedCategory.slug}?siteFor=${siteFor}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setMessage({ type: "success", text: "Category updated successfully!" });
        fetchCategories();
      } else {
        setMessage({ type: "error", text: result.message || "Failed to update" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to update category" });
    }
    setSaving(false);
  }

  // ─── Delete Category ───
  async function handleDeleteCategory() {
    if (!selectedCategory || !confirm(`Delete category "${selectedCategory.name}"? This will also delete all its tabs.`)) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/categories/${selectedCategory.slug}?siteFor=${siteFor}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        setMessage({ type: "success", text: "Category deleted!" });
        setSelectedCategory(null);
        fetchCategories();
      } else {
        setMessage({ type: "error", text: result.message || "Failed to delete" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to delete category" });
    }
    setSaving(false);
  }

  // ─── Tab CRUD ───
  async function handleCreateTab(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedCategory) return;

    const form = e.currentTarget;
    const fd = new FormData(form);

    const data = {
      title: fd.get("title") as string,
      body: tabBody,
      icon: (fd.get("icon") as string) || null,
      sortOrder: parseInt(fd.get("sortOrder") as string) || 0,
    };

    setSaving(true);
    try {
      const res = await fetch(`/api/categories/${selectedCategory.slug}/tabs?siteFor=${siteFor}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setMessage({ type: "success", text: "Tab created!" });
        setShowNewTab(false);
        form.reset();
        fetchCategories();
      } else {
        setMessage({ type: "error", text: result.message || "Failed to create tab" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to create tab" });
    }
    setSaving(false);
  }

  async function handleUpdateTab(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedCategory || !editingTab) return;

    const form = e.currentTarget;
    const fd = new FormData(form);

    const data = {
      title: fd.get("title") as string,
      body: tabBody,
      icon: (fd.get("icon") as string) || null,
      sortOrder: parseInt(fd.get("sortOrder") as string) || 0,
      isActive: fd.get("isActive") === "on",
    };

    setSaving(true);
    try {
      const res = await fetch(`/api/categories/${selectedCategory.slug}/tabs/${editingTab.id}?siteFor=${siteFor}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setMessage({ type: "success", text: "Tab updated!" });
        setEditingTab(null);
        fetchCategories();
      } else {
        setMessage({ type: "error", text: result.message || "Failed to update tab" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to update tab" });
    }
    setSaving(false);
  }

  async function handleDeleteTab(tabId: string) {
    if (!selectedCategory || !confirm("Delete this tab?")) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/categories/${selectedCategory.slug}/tabs/${tabId}?siteFor=${siteFor}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        setMessage({ type: "success", text: "Tab deleted!" });
        if (editingTab?.id === tabId) setEditingTab(null);
        fetchCategories();
      } else {
        setMessage({ type: "error", text: result.message || "Failed to delete tab" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to delete tab" });
    }
    setSaving(false);
  }

  // ─── Render Helpers ───
  function renderCategoryForm(cat: Category | null, isCreate: boolean) {
    return (
      <form
        onSubmit={isCreate ? handleCreateCategory : handleUpdateCategory}
        key={cat?.id || "create"}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <div className="form-grid">
          {isCreate && (
            <div className="form-group">
              <label className="form-label">Slug *</label>
              <input name="slug" className="input" placeholder="e.g. 3km" required />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input name="name" className="input" placeholder="e.g. 3K Fun Run" defaultValue={cat?.name || ""} required />
          </div>
          <div className="form-group">
            <label className="form-label">Distance Label *</label>
            <input name="distanceLabel" className="input" placeholder="e.g. 3K" defaultValue={cat?.distanceLabel || ""} required />
          </div>
          <div className="form-group">
            <label className="form-label">Icon (emoji)</label>
            <input name="icon" className="input" placeholder="🎉" defaultValue={cat?.icon || ""} />
          </div>
          <div className="form-group">
            <label className="form-label">Order</label>
            <input name="order" type="number" className="input" placeholder="1" defaultValue={cat?.order ?? 0} />
          </div>
          <div className="form-group">
            <label className="form-label">Tagline</label>
            <input name="tagline" className="input" placeholder="Run for Joy!" defaultValue={cat?.tagline || ""} />
          </div>
          <div className="form-group">
            <label className="form-label">Hero Image URL</label>
            <ImageUpload name="heroImage" defaultValue={cat?.heroImage} />
          </div>
        </div>

        <div style={{ padding: "12px 16px", background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: 8, fontSize: "0.85rem", color: "#3b82f6", display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <span>Pricing, discounts, and race timing are managed per-event in the <strong>Events</strong> section.</span>
        </div>

        {!isCreate && (
          <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input name="isActive" type="checkbox" defaultChecked={cat?.isActive ?? true} id="isActive" />
            <label htmlFor="isActive" className="form-label" style={{ margin: 0 }}>Active</label>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid var(--border)" }}>
          <div>
            {!isCreate && (
              <button type="button" onClick={handleDeleteCategory} className="btn btn-outline" style={{ color: "#ef4444", borderColor: "#ef4444" }}>
                Delete Category
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {isCreate && (
              <button type="button" onClick={() => setActiveTab("category")} className="btn btn-outline">Cancel</button>
            )}
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? "Saving..." : isCreate ? "Create Category" : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    );
  }

  function renderTabEditor(tab: CategoryTab | null, isCreate: boolean) {
    return (
      <form
        onSubmit={isCreate ? handleCreateTab : handleUpdateTab}
        key={tab?.id || "new-tab"}
        style={{ display: "flex", flexDirection: "column", gap: 16, background: "var(--bg-alt)", borderRadius: 8, padding: 20, border: "1px solid var(--border)" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4 style={{ margin: 0 }}>{isCreate ? "New Tab" : `Edit: ${tab?.title}`}</h4>
          <button
            type="button"
            onClick={() => { isCreate ? setShowNewTab(false) : setEditingTab(null); setTabBody(""); }}
            className="btn btn-sm btn-outline"
          >
            ✕ Close
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px", gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input name="title" className="input" placeholder="e.g. About This Race" defaultValue={tab?.title || ""} required />
          </div>
          <div className="form-group">
            <label className="form-label">Icon</label>
            <input name="icon" className="input" placeholder="📋" defaultValue={tab?.icon || ""} />
          </div>
          <div className="form-group">
            <label className="form-label">Order</label>
            <input name="sortOrder" type="number" className="input" defaultValue={tab?.sortOrder ?? 0} />
          </div>
        </div>

        <div className="form-group" style={{ maxWidth: '100%', overflow: 'hidden' }}>
          <label className="form-label">Body (HTML) *</label>
          <JoditEditor
            ref={editorRef}
            value={tabBody}
            config={joditConfig}
            tabIndex={1}
            onBlur={(newContent) => setTabBody(newContent)}
            onChange={(newContent) => {}}
          />
        </div>

        {!isCreate && (
          <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input name="isActive" type="checkbox" defaultChecked={tab?.isActive ?? true} id={`tab-active-${tab?.id}`} />
            <label htmlFor={`tab-active-${tab?.id}`} className="form-label" style={{ margin: 0 }}>Active</label>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
            {saving ? "Saving..." : isCreate ? "Create Tab" : "Update Tab"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div>
          <h1>Categories</h1>
          <p className="page-subtitle">Manage race categories and their tab content for each site</p>
        </div>
        <select
          value={siteFor}
          onChange={e => { setSiteFor(e.target.value); setSelectedCategory(null); }}
          className="input"
          style={{ width: "auto", minWidth: 150 }}
        >
          {SITES.map(site => (
            <option key={site.code} value={site.code}>{site.name}</option>
          ))}
        </select>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`} style={{ marginBottom: 24 }}>
          {message.text}
          <button onClick={() => setMessage(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: "1rem" }}>✕</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>
        {/* Left: Category List */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Categories</span>
            <button
              onClick={() => { setSelectedCategory(null); setActiveTab("create"); setEditingTab(null); setShowNewTab(false); setTabBody(""); }}
              className="btn btn-sm btn-primary"
            >
              + New
            </button>
          </div>
          <div style={{ maxHeight: 600, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
            ) : categories.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)" }}>No categories found</div>
            ) : (
              categories.map(cat => (
                <div
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat); setActiveTab("category"); setEditingTab(null); setShowNewTab(false); setMessage(null); setTabBody(""); }}
                  style={{
                    padding: "14px 20px",
                    borderBottom: "1px solid var(--border)",
                    cursor: "pointer",
                    background: selectedCategory?.id === cat.id ? "var(--bg-alt)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    opacity: cat.isActive ? 1 : 0.5,
                  }}
                >
                    <span style={{ fontSize: "1.2rem" }}>{cat.icon || "🏃"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{cat.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {cat.distanceLabel} · {cat.tabs?.length || 0} tabs
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Edit / Create Form */}
        <div className="card">
          {activeTab === "create" ? (
            <>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", marginBottom: 24 }}>
                <h3 style={{ margin: 0 }}>Create New Category</h3>
              </div>
              {renderCategoryForm(null, true)}
            </>
          ) : selectedCategory ? (
            <>
              {/* Category Header */}
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: "1.5rem" }}>{selectedCategory.icon || "🏃"}</span>
                  <div>
                    <h3 style={{ margin: 0 }}>{selectedCategory.name}</h3>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      {selectedCategory.slug} · {selectedCategory.distanceLabel}
                      {selectedCategory.tagline && ` · "${selectedCategory.tagline}"`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sub-tabs: Category Info | Tabs */}
              <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "2px solid var(--border)" }}>
                <button
                  onClick={() => { setActiveTab("category"); setEditingTab(null); setShowNewTab(false); setTabBody(""); }}
                  style={{
                    padding: "10px 20px",
                    background: "none",

                    border: "none",
                    borderBottom: activeTab === "category" ? "2px solid var(--primary)" : "2px solid transparent",
                    color: activeTab === "category" ? "var(--primary)" : "var(--text-muted)",
                    fontWeight: 600,
                    cursor: "pointer",
                    marginBottom: -2,
                  }}
                >
                  Category Info
                </button>
                <button
                  onClick={() => { setActiveTab("tabs"); setEditingTab(null); setShowNewTab(false); setTabBody(""); }}
                  style={{
                    padding: "10px 20px",
                    background: "none",
                    border: "none",
                    borderBottom: activeTab === "tabs" ? "2px solid var(--primary)" : "2px solid transparent",
                    color: activeTab === "tabs" ? "var(--primary)" : "var(--text-muted)",
                    fontWeight: 600,
                    cursor: "pointer",
                    marginBottom: -2,
                  }}
                >
                  Page Tabs ({selectedCategory.tabs?.length || 0})
                </button>
              </div>

              {activeTab === "category" && renderCategoryForm(selectedCategory, false)}

              {activeTab === "tabs" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Tab list */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-muted)" }}>
                      Content tabs displayed on the category page
                    </span>
                    <button
                      onClick={() => { setShowNewTab(true); setEditingTab(null); setTabBody(""); }}
                      className="btn btn-sm btn-primary"
                    >
                      + Add Tab
                    </button>
                  </div>

                  {showNewTab && renderTabEditor(null, true)}

                  {(!selectedCategory.tabs || selectedCategory.tabs.length === 0) && !showNewTab ? (
                    <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", background: "var(--bg-alt)", borderRadius: 8 }}>
                      No tabs yet. Click "+ Add Tab" to create the first section.
                    </div>
                  ) : (
                    selectedCategory.tabs?.map(tab => (
                      <div key={tab.id}>
                        {editingTab?.id === tab.id ? (
                          renderTabEditor(tab, false)
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              padding: "14px 16px",
                              background: "var(--bg-alt)",
                              borderRadius: 8,
                              border: "1px solid var(--border)",
                              opacity: tab.isActive ? 1 : 0.5,
                            }}
                          >
                            <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{tab.icon || "📄"}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{tab.title}</div>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                Order: {tab.sortOrder} · {tab.body.length} chars
                                {!tab.isActive && " · Inactive"}
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                              <button
                                onClick={() => { setEditingTab(tab); setShowNewTab(false); setTabBody(tab.body); }}
                                className="btn btn-sm btn-outline"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteTab(tab.id)}
                                className="btn btn-sm btn-outline"
                                style={{ color: "#ef4444", borderColor: "#ef4444" }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "var(--text-muted)" }}>
              Select a category from the left to edit its content
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
