"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Story {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone: string | null;
  socialMediaUrl: string | null;
  title: string | null;
  content: string;
  imageUrls: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: { id: number; name: string; email: string } | null;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StoriesClient() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/stories?${params}`);
      const data = await res.json();
      if (data.success) setStories(data.stories);
    } catch {
      console.error("Failed to fetch stories");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stories</h1>
          <p className="page-subtitle">User-submitted stories</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {stories.length} total
          </span>
        </div>
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
            placeholder="Search by name, email, title..."
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
          <option value="SUBMITTED">Submitted</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="PUBLISHED">Published</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div className="table-loading">
            <div className="spinner" />
            <p>Loading stories...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="table-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p>No stories found</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th></th>
                <th>ID</th>
                <th>Title</th>
                <th>Author</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {stories.map((s) => (
                <tr key={s.id}>
                  <td>
                    <button
                      className="expand-btn"
                      onClick={() => router.push(`/dashboard/stories/${s.id}`)}
                      title="View details"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.85rem", fontFamily: "monospace", color: "var(--text-muted)" }}>
                      #{s.id}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                      {s.title || <span style={{ color: "var(--text-muted)" }}>Untitled</span>}
                    </span>
                  </td>
                  <td>
                    <div>
                      <span style={{ fontSize: "0.85rem" }}>{s.name}</span>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{s.email}</div>
                    </div>
                  </td>
                  <td style={{ fontSize: "0.8rem" }}>{formatDate(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
