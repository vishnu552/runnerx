"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

const STATUS_STYLES: Record<string, string> = {
  SUBMITTED: "status-draft",
  REVIEWED: "status-active",
  PUBLISHED: "status-completed",
  REJECTED: "status-inactive",
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

function parseImageUrls(value: string | null): string[] {
  if (!value) return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  // Try JSON array first (matches schema comment); fall back to a single URL string.
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.filter((s) => typeof s === "string" && s);
    } catch {
      // fall through
    }
  }
  return [trimmed];
}

export default function StoryDetailClient({ id }: { id: string }) {
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/stories/${id}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.success) {
          setStory(data.story);
        } else {
          setError(data.message || "Failed to load story");
        }
      } catch {
        if (!cancelled) setError("Failed to load story");
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
          <p>Loading story...</p>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="page-content">
        <div className="page-header">
          <div>
            <Link href="/dashboard/stories" style={{ fontSize: "0.85rem", color: "var(--text-muted)", textDecoration: "none" }}>
              ← Back to Stories
            </Link>
            <h1 className="page-title">Story not found</h1>
            <p className="page-subtitle">{error || "This story could not be loaded."}</p>
          </div>
        </div>
      </div>
    );
  }

  const images = parseImageUrls(story.imageUrls);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <Link href="/dashboard/stories" style={{ fontSize: "0.85rem", color: "var(--text-muted)", textDecoration: "none" }}>
            ← Back to Stories
          </Link>
          <h1 className="page-title">{story.title || `Story #${story.id}`}</h1>
          <p className="page-subtitle">By {story.name} · {formatDateTime(story.createdAt)}</p>
        </div>
        <span className={`status-badge ${STATUS_STYLES[story.status] || "status-draft"}`}>
          {story.status}
        </span>
      </div>

      {/* Author / Meta */}
      <div className="categories-panel" style={{ marginBottom: 16 }}>
        <div className="categories-panel-header">
          <h3 className="categories-panel-title">Author & Submission</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, padding: 16 }}>
          <Field label="Story ID" value={`#${story.id}`} />
          <Field label="Name" value={story.name} />
          <Field label="Email" value={story.email} />
          <Field label="Phone" value={story.phone} />
          <Field
            label="Social Media"
            value={
              story.socialMediaUrl ? (
                <a href={story.socialMediaUrl} target="_blank" rel="noreferrer" style={{ color: "var(--accent, #6366f1)" }}>
                  {story.socialMediaUrl}
                </a>
              ) : null
            }
          />
          <Field label="Linked User" value={story.user ? `${story.user.name} (${story.user.email})` : "—"} />
          <Field label="Status" value={story.status} />
          <Field label="Submitted" value={formatDateTime(story.createdAt)} />
          <Field label="Last Updated" value={formatDateTime(story.updatedAt)} />
        </div>
      </div>

      {/* Story content */}
      <div className="categories-panel" style={{ marginBottom: 16 }}>
        <div className="categories-panel-header">
          <h3 className="categories-panel-title">Story</h3>
        </div>
        <div style={{ padding: 16 }}>
          {story.title && (
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 12 }}>{story.title}</h2>
          )}
          <p style={{ whiteSpace: "pre-wrap", fontSize: "0.95rem", lineHeight: 1.6, color: "var(--text)" }}>
            {story.content}
          </p>
        </div>
      </div>

      {/* Images */}
      {images.length > 0 && (
        <div className="categories-panel">
          <div className="categories-panel-header">
            <h3 className="categories-panel-title">Images ({images.length})</h3>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 12,
              padding: 16,
            }}
          >
            {images.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "block",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  overflow: "hidden",
                  aspectRatio: "1 / 1",
                  background: "var(--bg-elevated, transparent)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Story image ${i + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
