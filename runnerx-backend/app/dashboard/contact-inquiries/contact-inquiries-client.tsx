"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Inquiry {
  id: number;
  siteFor: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
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

export default function ContactInquiriesClient() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/contact?${params}`);
      const data = await res.json();
      if (data.success) setInquiries(data.inquiries);
    } catch {
      console.error("Failed to fetch inquiries");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contact Inquiries</h1>
          <p className="page-subtitle">Messages from the contact form</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {inquiries.length} total
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
            placeholder="Search by name, email, subject..."
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
          <option value="NEW">New</option>
          <option value="READ">Read</option>
          <option value="REPLIED">Replied</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div className="table-loading">
            <div className="spinner" />
            <p>Loading inquiries...</p>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="table-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <p>No inquiries found</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th></th>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Site</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((q) => (
                <tr key={q.id}>
                  <td>
                    <button
                      className="expand-btn"
                      onClick={() => router.push(`/dashboard/contact-inquiries/${q.id}`)}
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
                      #{q.id}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.85rem", fontWeight: 600 }}>{q.name}</td>
                  <td style={{ fontSize: "0.85rem" }}>{q.email}</td>
                  <td style={{ fontSize: "0.85rem" }}>
                    {q.subject || <span style={{ color: "var(--text-muted)" }}>—</span>}
                  </td>
                  <td>
                    <span className="race-type-badge">{q.siteFor}</span>
                  </td>
                  <td style={{ fontSize: "0.8rem" }}>{formatDate(q.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
