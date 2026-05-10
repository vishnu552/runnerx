"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

const STATUS_STYLES: Record<string, string> = {
  NEW: "status-draft",
  READ: "status-active",
  REPLIED: "status-completed",
  CLOSED: "status-inactive",
};

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>
        {label}
      </span>
      <span style={{ fontSize: "0.9rem", color: "var(--text)", wordBreak: "break-word" }}>
        {value === null || value === undefined || value === "" ? <span style={{ color: "var(--text-muted)" }}>—</span> : value}
      </span>
    </div>
  );
}

export default function ContactInquiryDetailClient({ id }: { id: string }) {
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/contact/${id}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.success) {
          setInquiry(data.inquiry);
        } else {
          setError(data.message || "Failed to load inquiry");
        }
      } catch {
        if (!cancelled) setError("Failed to load inquiry");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="page-content">
        <div className="table-loading">
          <div className="spinner" />
          <p>Loading inquiry...</p>
        </div>
      </div>
    );
  }

  if (error || !inquiry) {
    return (
      <div className="page-content">
        <div className="page-header">
          <div>
            <Link href="/dashboard/contact-inquiries" style={{ fontSize: "0.85rem", color: "var(--text-muted)", textDecoration: "none" }}>
              ← Back to Inquiries
            </Link>
            <h1 className="page-title">Inquiry not found</h1>
            <p className="page-subtitle">{error || "This inquiry could not be loaded."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <Link href="/dashboard/contact-inquiries" style={{ fontSize: "0.85rem", color: "var(--text-muted)", textDecoration: "none" }}>
            ← Back to Inquiries
          </Link>
          <h1 className="page-title">{inquiry.subject || `Inquiry #${inquiry.id}`}</h1>
          <p className="page-subtitle">From {inquiry.name} · {formatDateTime(inquiry.createdAt)}</p>
        </div>
        <span className={`status-badge ${STATUS_STYLES[inquiry.status] || "status-draft"}`}>
          {inquiry.status}
        </span>
      </div>

      {/* Sender info */}
      <div className="categories-panel" style={{ marginBottom: 16 }}>
        <div className="categories-panel-header">
          <h3 className="categories-panel-title">Sender</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, padding: 16 }}>
          <Field label="Inquiry ID" value={`#${inquiry.id}`} />
          <Field label="Name" value={inquiry.name} />
          <Field
            label="Email"
            value={
              <a href={`mailto:${inquiry.email}`} style={{ color: "var(--accent, #6366f1)" }}>
                {inquiry.email}
              </a>
            }
          />
          <Field
            label="Phone"
            value={
              inquiry.phone ? (
                <a href={`tel:${inquiry.phone}`} style={{ color: "var(--accent, #6366f1)" }}>
                  {inquiry.phone}
                </a>
              ) : null
            }
          />
          <Field label="Site" value={inquiry.siteFor} />
          <Field label="Subject" value={inquiry.subject} />
          <Field label="Status" value={inquiry.status} />
          <Field label="Received" value={formatDateTime(inquiry.createdAt)} />
          <Field label="Last Updated" value={formatDateTime(inquiry.updatedAt)} />
        </div>
      </div>

      {/* Message */}
      <div className="categories-panel">
        <div className="categories-panel-header">
          <h3 className="categories-panel-title">Message</h3>
        </div>
        <div style={{ padding: 16 }}>
          <p style={{ whiteSpace: "pre-wrap", fontSize: "0.95rem", lineHeight: 1.6, color: "var(--text)" }}>
            {inquiry.message}
          </p>
        </div>
      </div>
    </div>
  );
}
