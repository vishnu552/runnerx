"use client";

import { Fragment, useEffect, useState, useCallback } from "react";

interface Site {
  id: string;
  name: string;
  code: string;
}

interface TemplateCategory {
  id: string;
  slug: string;
  name: string;
  distanceLabel: string;
  siteFor: string;
}

interface EventCategory {
  id: string;
  eventId: string;
  raceType: string;
  distance: number;
  price: number;
  discountPrice: number | null;
  startTime: string;
  maxParticipants: number | null;
  registeredCount: number;
  ageMin: number | null;
  ageMax: number | null;
  isActive: boolean;
  virtualSettings: any;
}

interface Event {
  id: string;
  title: string;
  slug: string;
  siteFor: string;
  description: string;
  date: string;
  registrationStart: string;
  registrationEnd: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  mapUrl: string | null;
  bannerImage: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  status: string;
  isActive: boolean;
  categories: EventCategory[];
  createdAt: string;
}

interface EventForm {
  title: string;
  slug: string;
  siteFor: string;
  description: string;
  date: string;
  registrationStart: string;
  registrationEnd: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  mapUrl: string;
  bannerImage: string;
  contactEmail: string;
  contactPhone: string;
  status: string;
  isActive: boolean;
}

interface CategoryForm {
  raceType: string;
  distance: string;
  price: string;
  discountPrice: string;
  startTime: string;
  maxParticipants: string;
  ageMin: string;
  ageMax: string;
  isActive: boolean;
  categoryId: string;
  virtualSettings: any;
}

const emptyEventForm: EventForm = {
  title: "",
  slug: "",
  siteFor: "JDH",
  description: "",
  date: "",
  registrationStart: "",
  registrationEnd: "",
  venue: "",
  address: "",
  city: "",
  state: "",
  mapUrl: "",
  bannerImage: "",
  contactEmail: "",
  contactPhone: "",
  status: "DRAFT",
  isActive: true,
};

const emptyCategoryForm: CategoryForm = {
  raceType: "3KM",
  distance: "3",
  price: "",
  discountPrice: "",
  startTime: "",
  maxParticipants: "",
  ageMin: "",
  ageMax: "",
  isActive: true,
  categoryId: "",
  virtualSettings: null,
};

const RACE_TYPE_LABELS: Record<string, string> = {
  "3KM": "3 KM",
  "5KM": "5 KM",
  "10KM": "10 KM",
  HALF_MARATHON: "Half Marathon",
};

const RACE_DISTANCES: Record<string, string> = {
  "3KM": "3",
  "5KM": "5",
  "10KM": "10",
  HALF_MARATHON: "21.1",
  VIRTUAL: "0",
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "status-draft" },
  PUBLISHED: { label: "Published", className: "status-active" },
  CANCELLED: { label: "Cancelled", className: "status-inactive" },
  COMPLETED: { label: "Completed", className: "status-completed" },
};


function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function EventsClient() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sites, setSites] = useState<Site[]>([]);

  // Template categories for linking
  const [templateCategories, setTemplateCategories] = useState<TemplateCategory[]>([]);

  // Fetch sites for select boxes
  useEffect(() => {
    fetch("/api/sites")
      .then((res) => res.json())
      .then((data) => { if (data.success) setSites(data.sites); })
      .catch(() => console.error("Failed to fetch sites"));
  }, []);

  // Fetch template categories for the current event's site when category modal opens
  async function fetchTemplateCategories(siteFor: string) {
    try {
      const res = await fetch(`/api/categories?siteFor=${siteFor}&active=false`);
      const data = await res.json();
      if (data.success) setTemplateCategories(data.categories);
    } catch {
      console.error("Failed to fetch template categories");
    }
  }

  // Event Modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(emptyEventForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  // Category Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryEventId, setCategoryEventId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(emptyCategoryForm);
  const [categoryFormErrors, setCategoryFormErrors] = useState<Record<string, string>>({});
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [categoryServerError, setCategoryServerError] = useState("");

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);

  // Expanded rows for viewing categories
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/events?${params}`);
      const data = await res.json();
      if (data.success) setEvents(data.events);
    } catch {
      console.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ─── Event CRUD ─────────────────────────────────────────────
  function openCreateModal() {
    setEditingId(null);
    setForm(emptyEventForm);
    setFormErrors({});
    setServerError("");
    setShowModal(true);
  }

  function openEditModal(event: Event) {
    setEditingId(event.id);
    setForm({
      title: event.title,
      slug: event.slug,
      siteFor: event.siteFor,
      description: event.description,
      date: event.date?.split("T")[0] || "",
      registrationStart: event.registrationStart?.split("T")[0] || "",
      registrationEnd: event.registrationEnd?.split("T")[0] || "",
      venue: event.venue,
      address: event.address,
      city: event.city,
      state: event.state,
      mapUrl: event.mapUrl || "",
      bannerImage: event.bannerImage || "",
      contactEmail: event.contactEmail || "",
      contactPhone: event.contactPhone || "",
      status: event.status,
      isActive: event.isActive,
    });
    setFormErrors({});
    setServerError("");
    setShowModal(true);
  }

  function validateEvent(): boolean {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = "Title is required";
    if (!form.slug.trim()) errors.slug = "Slug is required";
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug))
      errors.slug = "Slug must be lowercase with hyphens only";
    if (!form.description.trim()) errors.description = "Description is required";
    if (!form.date) errors.date = "Date is required";
    if (!form.registrationStart) errors.registrationStart = "Required";
    if (!form.registrationEnd) errors.registrationEnd = "Required";
    if (!form.venue.trim()) errors.venue = "Venue is required";
    if (!form.address.trim()) errors.address = "Address is required";
    if (!form.city.trim()) errors.city = "City is required";
    if (!form.state.trim()) errors.state = "State is required";
    if (!form.siteFor) errors.siteFor = "Site is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleEventSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateEvent()) return;

    setSubmitting(true);
    setServerError("");

    const payload = {
      title: form.title,
      slug: form.slug,
      siteFor: form.siteFor,
      description: form.description,
      date: form.date,
      registrationStart: form.registrationStart,
      registrationEnd: form.registrationEnd,
      venue: form.venue,
      address: form.address,
      city: form.city,
      state: form.state,
      mapUrl: form.mapUrl || null,
      bannerImage: form.bannerImage || null,
      contactEmail: form.contactEmail || null,
      contactPhone: form.contactPhone || null,
      status: form.status,
      isActive: form.isActive,
    };

    try {
      const url = editingId ? `/api/events/${editingId}` : "/api/events";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.message || "Failed to save event");
        return;
      }
      setShowModal(false);
      fetchEvents();
    } catch {
      setServerError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  function confirmDelete(event: Event) {
    setDeleteTarget(event);
    setShowDeleteConfirm(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await fetch(`/api/events/${deleteTarget.id}`, { method: "DELETE" });
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      fetchEvents();
    } catch {
      console.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  // ─── Category CRUD ──────────────────────────────────────────
  function openAddCategory(eventId: string) {
    setCategoryEventId(eventId);
    setEditingCategoryId(null);
    setCategoryForm(emptyCategoryForm);
    setCategoryFormErrors({});
    setCategoryServerError("");
    // Find the event to get its siteFor
    const ev = events.find(e => e.id === eventId);
    if (ev) fetchTemplateCategories(ev.siteFor);
    setShowCategoryModal(true);
  }

  function openEditCategory(eventId: string, cat: EventCategory) {
    setCategoryEventId(eventId);
    setEditingCategoryId(cat.id);
    setCategoryForm({
      raceType: cat.raceType,
      distance: String(cat.distance),
      price: String(cat.price),
      discountPrice: cat.discountPrice != null ? String(cat.discountPrice) : "",
      startTime: cat.startTime ? cat.startTime.slice(0, 16) : "",
      maxParticipants: cat.maxParticipants != null ? String(cat.maxParticipants) : "",
      ageMin: cat.ageMin != null ? String(cat.ageMin) : "",
      ageMax: cat.ageMax != null ? String(cat.ageMax) : "",
      isActive: cat.isActive,
      categoryId: (cat as EventCategory & { categoryId?: string }).categoryId || "",
      virtualSettings: cat.virtualSettings || null,
    });
    setCategoryFormErrors({});
    setCategoryServerError("");
    // Find the event to get its siteFor
    const ev = events.find(e => e.id === eventId);
    if (ev) fetchTemplateCategories(ev.siteFor);
    setShowCategoryModal(true);
  }

  function validateCategory(): boolean {
    const errors: Record<string, string> = {};
    const isVirtual = categoryForm.raceType === "VIRTUAL";

    if (!isVirtual) {
      if (!categoryForm.price || parseFloat(categoryForm.price) < 0)
        errors.price = "Price must be non-negative";
    }

    if (!categoryForm.startTime) errors.startTime = "Start time is required";
    setCategoryFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleCategorySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateCategory() || !categoryEventId) return;

    setCategorySubmitting(true);
    setCategoryServerError("");

    const isVirtual = categoryForm.raceType === "VIRTUAL";

    const payload = {
      raceType: categoryForm.raceType,
      distance: isVirtual ? 0 : parseFloat(categoryForm.distance),
      price: isVirtual ? 0 : parseFloat(categoryForm.price),
      discountPrice: !isVirtual && categoryForm.discountPrice
        ? parseFloat(categoryForm.discountPrice)
        : null,
      startTime: categoryForm.startTime,
      maxParticipants: !isVirtual && categoryForm.maxParticipants
        ? parseInt(categoryForm.maxParticipants)
        : null,
      ageMin: categoryForm.ageMin ? parseInt(categoryForm.ageMin) : null,
      ageMax: categoryForm.ageMax ? parseInt(categoryForm.ageMax) : null,
      isActive: categoryForm.isActive,
      categoryId: categoryForm.categoryId || null,
      virtualSettings: categoryForm.virtualSettings || null,
    };

    try {
      const url = editingCategoryId
        ? `/api/events/${categoryEventId}/categories/${editingCategoryId}`
        : `/api/events/${categoryEventId}/categories`;
      const method = editingCategoryId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setCategoryServerError(data.message || "Failed to save category");
        return;
      }
      setShowCategoryModal(false);
      fetchEvents();
    } catch {
      setCategoryServerError("Network error");
    } finally {
      setCategorySubmitting(false);
    }
  }

  async function handleDeleteCategory(eventId: string, categoryId: string) {
    if (!confirm("Delete this race category?")) return;
    try {
      await fetch(`/api/events/${eventId}/categories/${categoryId}`, {
        method: "DELETE",
      });
      fetchEvents();
    } catch {
      console.error("Failed to delete category");
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Events</h1>
          <p className="page-subtitle">Manage your marathon events</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal} id="create-event-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Event
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
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="table-search"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="table-filter-select"
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div className="table-loading">
            <div className="spinner" />
            <p>Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="table-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
            <p>No events found</p>
            <button className="btn-primary btn-sm" onClick={openCreateModal}>Create your first event</button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th></th>
                <th>Event</th>
                <th>Site</th>
                <th>Date</th>
                <th>City</th>
                <th>Categories</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const isExpanded = expandedId === event.id;
                const statusInfo = STATUS_LABELS[event.status] || STATUS_LABELS.DRAFT;
                return (
                  <Fragment key={event.id}>
                    <tr className={isExpanded ? "row-expanded" : ""}>
                      <td>
                        <button
                          className="expand-btn"
                          onClick={() => setExpandedId(isExpanded ? null : event.id)}
                          title={isExpanded ? "Collapse" : "Expand categories"}
                        >
                          <svg
                            width="16" height="16"
                            viewBox="0 0 24 24"
                            fill="none" stroke="currentColor"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </button>
                      </td>
                      <td>
                        <div className="event-title-cell">
                          <span className="event-name">{event.title}</span>
                          <span className="event-venue-label">{event.venue}</span>
                        </div>
                      </td>
                      <td>
                        <span className="site-badge">{sites.find((s) => s.code === event.siteFor)?.name || event.siteFor}</span>
                      </td>
                      <td>{formatDate(event.date)}</td>
                      <td>{event.city}</td>
                      <td>
                        <div className="category-badges">
                          {event.categories.length > 0
                            ? event.categories.map((c) => (
                                <span key={c.id} className="race-type-badge">
                                  {RACE_TYPE_LABELS[c.raceType] || c.raceType}
                                </span>
                              ))
                            : <span className="text-muted">None</span>}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="action-btn action-edit" onClick={() => openEditModal(event)} title="Edit">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            className="action-btn action-delete"
                            onClick={() => confirmDelete(event)}
                            disabled={deletingId === event.id}
                            title="Deactivate"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Expanded row for categories */}
                    {isExpanded && (
                      <tr className="expanded-row">
                        <td colSpan={8}>
                          <div className="categories-panel">
                            <div className="categories-panel-header">
                              <h3 className="categories-panel-title">Race Categories</h3>
                              <div style={{ display: "flex", gap: 8 }}>
                                {events.filter(e => e.id !== event.id && e.categories.length > 0).length > 0 && (
                                  <select
                                    className="table-filter-select"
                                    defaultValue=""
                                    onChange={async (e) => {
                                      const sourceEventId = e.target.value;
                                      if (!sourceEventId) return;
                                      if (!confirm("Clone all categories from the selected event? Existing categories won't be affected.")) {
                                        e.target.value = "";
                                        return;
                                      }
                                      const sourceEvent = events.find(ev => ev.id === sourceEventId);
                                      if (!sourceEvent) return;
                                      for (const cat of sourceEvent.categories) {
                                        try {
                                          await fetch(`/api/events/${event.id}/categories`, {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                              raceType: cat.raceType,
                                              distance: cat.distance,
                                              price: cat.price,
                                              discountPrice: cat.discountPrice,
                                              startTime: cat.startTime,
                                              maxParticipants: cat.maxParticipants,
                                              ageMin: cat.ageMin,
                                              ageMax: cat.ageMax,
                                              isActive: true,
                                              categoryId: (cat as EventCategory & { categoryId?: string }).categoryId || null,
                                            }),
                                          });
                                        } catch { /* skip duplicates */ }
                                      }
                                      e.target.value = "";
                                      fetchEvents();
                                    }}
                                    style={{ fontSize: "0.8rem" }}
                                  >
                                    <option value="">Clone from event...</option>
                                    {events.filter(e => e.id !== event.id && e.categories.length > 0).map(e => (
                                      <option key={e.id} value={e.id}>{e.title} ({e.categories.length} cats)</option>
                                    ))}
                                  </select>
                                )}
                                <button className="btn-primary btn-sm" onClick={() => openAddCategory(event.id)}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                  </svg>
                                  Add Category
                                </button>
                              </div>
                            </div>
                            {event.categories.length === 0 ? (
                              <p className="text-muted" style={{ padding: "12px 0" }}>No categories added yet. Add race categories to this event.</p>
                            ) : (
                              <table className="data-table categories-table">
                                <thead>
                                  <tr>
                                    <th>Race Type</th>
                                    <th>Distance</th>
                                    <th>Price (₹)</th>
                                    <th>Discount (₹)</th>
                                    <th>Start Time</th>
                                    <th>Slots</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {event.categories.map((cat) => (
                                    <tr key={cat.id}>
                                      <td>
                                        <span className="race-type-badge">
                                          {RACE_TYPE_LABELS[cat.raceType] || cat.raceType}
                                        </span>
                                      </td>
                                      <td>{cat.raceType === "VIRTUAL" ? "Any" : `${cat.distance} km`}</td>
                                      <td>₹
                                        {cat.raceType === "VIRTUAL" && Array.isArray(cat.virtualSettings) 
                                          ? `Options (${cat.virtualSettings.length})`
                                          : cat.price.toLocaleString("en-IN")
                                        }
                                      </td>
                                      <td>
                                        {cat.raceType === "VIRTUAL"
                                          ? "See details"
                                          : (cat.discountPrice != null
                                              ? <span className="discount-price">₹{cat.discountPrice.toLocaleString("en-IN")}</span>
                                              : "—")
                                        }
                                      </td>
                                      <td>
                                        {cat.startTime
                                          ? new Date(cat.startTime).toLocaleString("en-IN", {
                                              day: "2-digit",
                                              month: "short",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })
                                          : "—"}
                                      </td>
                                      <td>
                                        {cat.registeredCount}
                                        {cat.maxParticipants ? ` / ${cat.maxParticipants}` : ""}
                                      </td>
                                      <td>
                                        <span className={`status-badge ${cat.isActive ? "status-active" : "status-inactive"}`}>
                                          {cat.isActive ? "Active" : "Inactive"}
                                        </span>
                                      </td>
                                      <td>
                                        <div className="action-btns">
                                          <button
                                            className="action-btn action-edit"
                                            onClick={() => openEditCategory(event.id, cat)}
                                            title="Edit"
                                          >
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                          </button>
                                          <button
                                            className="action-btn action-delete"
                                            onClick={() => handleDeleteCategory(event.id, cat.id)}
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
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Event Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <h2 className="modal-title">{editingId ? "Edit Event" : "Create Event"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleEventSubmit}>
              {serverError && (
                <div className="login-alert login-alert-error" style={{ marginBottom: 16 }}>
                  <span>{serverError}</span>
                </div>
              )}

              {/* Title & Slug */}
              <div className="modal-grid">
                <div className="modal-field">
                  <label className="modal-label">Event Title</label>
                  <input
                    className={`modal-input ${formErrors.title ? "modal-input-error" : ""}`}
                    value={form.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setForm({
                        ...form,
                        title,
                        slug: editingId ? form.slug : generateSlug(title),
                      });
                    }}
                    placeholder="e.g. Mumbai Marathon 2026"
                  />
                  {formErrors.title && <span className="login-error-text">{formErrors.title}</span>}
                </div>
                <div className="modal-field">
                  <label className="modal-label">Slug</label>
                  <input
                    className={`modal-input ${formErrors.slug ? "modal-input-error" : ""}`}
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="mumbai-marathon-2026"
                  />
                  {formErrors.slug && <span className="login-error-text">{formErrors.slug}</span>}
                </div>
              </div>

              {/* Site For */}
              <div className="modal-field">
                <label className="modal-label">Site For</label>
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

              {/* Description */}
              <div className="modal-field">
                <label className="modal-label">Description</label>
                <textarea
                  className={`modal-input modal-textarea ${formErrors.description ? "modal-input-error" : ""}`}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the marathon event..."
                  rows={3}
                />
                {formErrors.description && <span className="login-error-text">{formErrors.description}</span>}
              </div>

              {/* Date & Registration */}
              <div className="modal-grid modal-grid-3">
                <div className="modal-field">
                  <label className="modal-label">Event Date</label>
                  <input
                    type="date"
                    className={`modal-input ${formErrors.date ? "modal-input-error" : ""}`}
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                  {formErrors.date && <span className="login-error-text">{formErrors.date}</span>}
                </div>
                <div className="modal-field">
                  <label className="modal-label">Registration Start</label>
                  <input
                    type="date"
                    className={`modal-input ${formErrors.registrationStart ? "modal-input-error" : ""}`}
                    value={form.registrationStart}
                    onChange={(e) => setForm({ ...form, registrationStart: e.target.value })}
                  />
                  {formErrors.registrationStart && <span className="login-error-text">{formErrors.registrationStart}</span>}
                </div>
                <div className="modal-field">
                  <label className="modal-label">Registration End</label>
                  <input
                    type="date"
                    className={`modal-input ${formErrors.registrationEnd ? "modal-input-error" : ""}`}
                    value={form.registrationEnd}
                    onChange={(e) => setForm({ ...form, registrationEnd: e.target.value })}
                  />
                  {formErrors.registrationEnd && <span className="login-error-text">{formErrors.registrationEnd}</span>}
                </div>
              </div>

              {/* Venue & Address */}
              <div className="modal-grid">
                <div className="modal-field">
                  <label className="modal-label">Venue</label>
                  <input
                    className={`modal-input ${formErrors.venue ? "modal-input-error" : ""}`}
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    placeholder="e.g. Azad Maidan"
                  />
                  {formErrors.venue && <span className="login-error-text">{formErrors.venue}</span>}
                </div>
                <div className="modal-field">
                  <label className="modal-label">Address</label>
                  <input
                    className={`modal-input ${formErrors.address ? "modal-input-error" : ""}`}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Full address"
                  />
                  {formErrors.address && <span className="login-error-text">{formErrors.address}</span>}
                </div>
              </div>

              {/* City & State */}
              <div className="modal-grid">
                <div className="modal-field">
                  <label className="modal-label">City</label>
                  <input
                    className={`modal-input ${formErrors.city ? "modal-input-error" : ""}`}
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. Mumbai"
                  />
                  {formErrors.city && <span className="login-error-text">{formErrors.city}</span>}
                </div>
                <div className="modal-field">
                  <label className="modal-label">State</label>
                  <input
                    className={`modal-input ${formErrors.state ? "modal-input-error" : ""}`}
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="e.g. Maharashtra"
                  />
                  {formErrors.state && <span className="login-error-text">{formErrors.state}</span>}
                </div>
              </div>

              {/* Contact & Map */}
              <div className="modal-grid">
                <div className="modal-field">
                  <label className="modal-label">Contact Email</label>
                  <input
                    type="email"
                    className="modal-input"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Contact Phone</label>
                  <input
                    className="modal-input"
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="modal-grid">
                <div className="modal-field">
                  <label className="modal-label">Map URL</label>
                  <input
                    className="modal-input"
                    value={form.mapUrl}
                    onChange={(e) => setForm({ ...form, mapUrl: e.target.value })}
                    placeholder="Google Maps link (optional)"
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Banner Image URL</label>
                  <input
                    className="modal-input"
                    value={form.bannerImage}
                    onChange={(e) => setForm({ ...form, bannerImage: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              {/* Status & Active */}
              <div className="modal-grid">
                <div className="modal-field">
                  <label className="modal-label">Status</label>
                  <select
                    className="modal-input"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                <div className="modal-field modal-checkbox-row" style={{ alignSelf: "end" }}>
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
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : editingId ? "Update Event" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create/Edit Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editingCategoryId ? "Edit Category" : "Add Race Category"}</h2>
              <button className="modal-close" onClick={() => setShowCategoryModal(false)}>×</button>
            </div>
            <form onSubmit={handleCategorySubmit}>
              {categoryServerError && (
                <div className="login-alert login-alert-error" style={{ marginBottom: 16 }}>
                  <span>{categoryServerError}</span>
                </div>
              )}

              {/* Template Category Link */}
              <div className="modal-field">
                <label className="modal-label">Link to Category Page (Template)</label>
                <select
                  className="modal-input"
                  value={categoryForm.categoryId}
                  onChange={(e) => {
                    const tmpl = templateCategories.find(c => c.id === e.target.value);
                    setCategoryForm({
                      ...categoryForm,
                      categoryId: e.target.value,
                    });
                  }}
                >
                  <option value="">— None (no page link) —</option>
                  {templateCategories.map(tc => (
                    <option key={tc.id} value={tc.id}>{tc.name} ({tc.distanceLabel})</option>
                  ))}
                </select>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4, display: "block" }}>Links this event category to a category page for hero/tabs content.</span>
              </div>

              <div className="modal-grid">
                <div className="modal-field">
                  <label className="modal-label">Race Type</label>
                  <select
                    className="modal-input"
                    value={categoryForm.raceType}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        raceType: e.target.value,
                        distance: RACE_DISTANCES[e.target.value] || categoryForm.distance,
                      })
                    }
                    disabled={!!editingCategoryId}
                  >
                    <option value="3KM">3 KM</option>
                    <option value="5KM">5 KM</option>
                    <option value="10KM">10 KM</option>
                    <option value="HALF_MARATHON">Half Marathon (21.1 KM)</option>
                    <option value="VIRTUAL">Virtual</option>
                  </select>
                </div>
                {categoryForm.raceType !== "VIRTUAL" && (
                  <div className="modal-field">
                    <label className="modal-label">Distance (km)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="modal-input"
                      value={categoryForm.distance}
                      onChange={(e) => setCategoryForm({ ...categoryForm, distance: e.target.value })}
                    />
                  </div>
                )}
              </div>

              {categoryForm.raceType !== "VIRTUAL" && (
                <div className="modal-grid">
                  <div className="modal-field">
                    <label className="modal-label">Price (₹)</label>
                    <input
                      type="number"
                      step="1"
                      className={`modal-input ${categoryFormErrors.price ? "modal-input-error" : ""}`}
                      value={categoryForm.price}
                      onChange={(e) => setCategoryForm({ ...categoryForm, price: e.target.value })}
                      placeholder="e.g. 500"
                    />
                    {categoryFormErrors.price && <span className="login-error-text">{categoryFormErrors.price}</span>}
                  </div>
                  <div className="modal-field">
                    <label className="modal-label">Discount Price (₹)</label>
                    <input
                      type="number"
                      step="1"
                      className="modal-input"
                      value={categoryForm.discountPrice}
                      onChange={(e) => setCategoryForm({ ...categoryForm, discountPrice: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                </div>
              )}

              <div className="modal-grid">
                <div className="modal-field">
                  <label className="modal-label">Start Time</label>
                  <input
                    type="datetime-local"
                    className={`modal-input ${categoryFormErrors.startTime ? "modal-input-error" : ""}`}
                    value={categoryForm.startTime}
                    onChange={(e) => setCategoryForm({ ...categoryForm, startTime: e.target.value })}
                  />
                  {categoryFormErrors.startTime && <span className="login-error-text">{categoryFormErrors.startTime}</span>}
                </div>
                {categoryForm.raceType !== "VIRTUAL" && (
                  <div className="modal-field">
                    <label className="modal-label">Max Participants</label>
                    <input
                      type="number"
                      className="modal-input"
                      value={categoryForm.maxParticipants}
                      onChange={(e) => setCategoryForm({ ...categoryForm, maxParticipants: e.target.value })}
                      placeholder="Unlimited"
                    />
                  </div>
                )}
              </div>

              <div className="modal-grid">
                <div className="modal-field">
                  <label className="modal-label">Min Age</label>
                  <input
                    type="number"
                    className="modal-input"
                    value={categoryForm.ageMin}
                    onChange={(e) => setCategoryForm({ ...categoryForm, ageMin: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Max Age</label>
                  <input
                    type="number"
                    className="modal-input"
                    value={categoryForm.ageMax}
                    onChange={(e) => setCategoryForm({ ...categoryForm, ageMax: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>
              
              {/* Virtual Category Options */}
              {categoryForm.raceType === "VIRTUAL" && (
                <div className="modal-field" style={{ marginTop: "16px", padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid var(--border)" }}>
                  <label className="modal-label" style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                     Virtual Category Sub-Options
                  </label>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "16px" }}>Select which race distances are available for this virtual event and set their prices.</p>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {templateCategories.map(tc => {
                      const settings = Array.isArray(categoryForm.virtualSettings) ? categoryForm.virtualSettings : [];
                      const existing = settings.find((s: any) => s.categoryId === tc.id);
                      const isChecked = !!existing;

                      return (
                        <div key={tc.id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px", gap: "12px", alignItems: "center", padding: "8px", background: isChecked ? "rgba(0,160,255,0.05)" : "transparent", borderRadius: "6px" }}>
                          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "0.9rem" }}>
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={(e) => {
                                let newSettings = [...settings];
                                if (e.target.checked) {
                                  newSettings.push({ categoryId: tc.id, categoryName: tc.name, price: 0, discountPrice: null });
                                } else {
                                  newSettings = newSettings.filter((s: any) => s.categoryId !== tc.id);
                                }
                                setCategoryForm({ ...categoryForm, virtualSettings: newSettings });
                              }}
                            />
                            <span>{tc.name} ({tc.distanceLabel})</span>
                          </label>
                          
                          {isChecked && (
                            <>
                              <input 
                                type="number" 
                                placeholder="Price ₹"
                                className="modal-input" 
                                style={{ padding: "6px 10px", height: "34px", fontSize: "0.85rem" }}
                                value={existing.price || ""}
                                onChange={(e) => {
                                  const newSettings = settings.map((s: any) => 
                                    s.categoryId === tc.id ? { ...s, price: parseFloat(e.target.value) || 0 } : s
                                  );
                                  setCategoryForm({ ...categoryForm, virtualSettings: newSettings });
                                }}
                              />
                              <input 
                                type="number" 
                                placeholder="Discount ₹"
                                className="modal-input" 
                                style={{ padding: "6px 10px", height: "34px", fontSize: "0.85rem" }}
                                value={existing.discountPrice || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const newSettings = settings.map((s: any) => 
                                    s.categoryId === tc.id ? { ...s, discountPrice: val ? parseFloat(val) : null } : s
                                  );
                                  setCategoryForm({ ...categoryForm, virtualSettings: newSettings });
                                }}
                              />
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="modal-field modal-checkbox-row">
                <label className="modal-checkbox-label">
                  <input
                    type="checkbox"
                    checked={categoryForm.isActive}
                    onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                    className="modal-checkbox"
                  />
                  <span>Active</span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCategoryModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={categorySubmitting}>
                  {categorySubmitting ? "Saving..." : editingCategoryId ? "Update Category" : "Add Category"}
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
              <h2 className="modal-title">Deactivate Event</h2>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>×</button>
            </div>
            <p className="delete-confirm-text">
              Are you sure you want to deactivate <strong>{deleteTarget.title}</strong>? The event will be marked inactive.
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete} disabled={deletingId === deleteTarget.id}>
                {deletingId === deleteTarget.id ? "Deactivating..." : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
