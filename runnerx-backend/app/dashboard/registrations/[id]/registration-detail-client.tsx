"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface LineItem {
  id: number;
  registrationId: number;
  eventCategoryId: number;
  status: string;
  uniqueRegId: string | null;
  participantName: string;
  participantEmail: string;
  participantPhone: string;
  participantGender: string;
  participantDob: string;
  participantCity: string | null;
  participantState: string | null;
  participantCountry: string | null;
  participantPinCode: string | null;
  participantAddress: string | null;
  isRegistrant: boolean;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  bibNumber: string | null;
  isCustomBib: boolean;
  tshirtSize: string | null;
  tshirtChangeCount: number;
  isProfileUpdated: boolean;
  categoryNameSnapshot: string;
  distanceSnapshot: string;
  raceTypeSnapshot: string;
  unitPriceSnapshot: number;
  discountPriceSnapshot: number | null;
  finalPriceSnapshot: number;
  createdAt: string;
  updatedAt: string;
}

interface Registration {
  id: number;
  eventId: number;
  userId: number | null;
  orderId: number | null;
  status: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  couponCode: string | null;
  paymentStatus: string;
  paymentId: string | null;
  razorpayOrderId: string | null;
  eventTitleSnapshot: string;
  eventDateSnapshot: string;
  siteForSnapshot: string;
  createdAt: string;
  updatedAt: string;
  lineItems: LineItem[];
  event: { id: number; title: string; siteFor: string; date: string } | null;
  user: { id: number; name: string; email: string } | null;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "status-draft",
  CONFIRMED: "status-active",
  CANCELLED: "status-inactive",
  REFUNDED: "status-completed",
};

const PAYMENT_STYLES: Record<string, string> = {
  UNPAID: "status-draft",
  PAID: "status-active",
  FAILED: "status-inactive",
  REFUNDED: "status-completed",
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

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function money(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  return `₹${Number(n).toLocaleString("en-IN")}`;
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

export default function RegistrationDetailClient({ id }: { id: string }) {
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/registrations/${id}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.success) {
          setRegistration(data.registration);
        } else {
          setError(data.message || "Failed to load registration");
        }
      } catch {
        if (!cancelled) setError("Failed to load registration");
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
          <p>Loading registration...</p>
        </div>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="page-content">
        <div className="page-header">
          <div>
            <Link href="/dashboard/registrations" style={{ fontSize: "0.85rem", color: "var(--text-muted)", textDecoration: "none" }}>
              ← Back to Registrations
            </Link>
            <h1 className="page-title">Registration not found</h1>
            <p className="page-subtitle">{error || "This registration could not be loaded."}</p>
          </div>
        </div>
      </div>
    );
  }

  const reg = registration;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <Link href="/dashboard/registrations" style={{ fontSize: "0.85rem", color: "var(--text-muted)", textDecoration: "none" }}>
            ← Back to Registrations
          </Link>
          <h1 className="page-title">Registration #{reg.id}</h1>
          <p className="page-subtitle">{reg.eventTitleSnapshot} · {formatDate(reg.eventDateSnapshot)}</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className={`status-badge ${STATUS_STYLES[reg.status] || "status-draft"}`}>{reg.status}</span>
          <span className={`status-badge ${PAYMENT_STYLES[reg.paymentStatus] || "status-draft"}`}>{reg.paymentStatus}</span>
        </div>
      </div>

      {/* Order info */}
      <div className="categories-panel" style={{ marginBottom: 16 }}>
        <div className="categories-panel-header">
          <h3 className="categories-panel-title">Order Details</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, padding: 16 }}>
          <Field label="Registration ID" value={`#${reg.id}`} />
          <Field label="Event" value={reg.event ? `${reg.event.title} (#${reg.event.id})` : reg.eventTitleSnapshot} />
          <Field label="Event Date (snapshot)" value={formatDate(reg.eventDateSnapshot)} />
          <Field label="Site (snapshot)" value={reg.siteForSnapshot} />
          <Field label="User" value={reg.user ? `${reg.user.name} (${reg.user.email})` : "Guest"} />
          <Field label="User ID" value={reg.userId ?? "—"} />
          <Field label="Order ID" value={reg.orderId ?? "—"} />
          <Field label="Status" value={reg.status} />
          <Field label="Payment Status" value={reg.paymentStatus} />
          <Field label="Payment ID" value={reg.paymentId ? <span style={{ fontFamily: "monospace" }}>{reg.paymentId}</span> : "—"} />
          <Field label="Razorpay Order ID" value={reg.razorpayOrderId ? <span style={{ fontFamily: "monospace" }}>{reg.razorpayOrderId}</span> : "—"} />
          <Field label="Coupon Code" value={reg.couponCode ?? "—"} />
          <Field label="Total Amount" value={money(reg.totalAmount)} />
          <Field label="Discount Amount" value={money(reg.discountAmount)} />
          <Field label="Final Amount" value={<strong>{money(reg.finalAmount)}</strong>} />
          <Field label="Created At" value={formatDateTime(reg.createdAt)} />
          <Field label="Updated At" value={formatDateTime(reg.updatedAt)} />
        </div>
      </div>

      {/* Participants (line items) */}
      <div className="categories-panel">
        <div className="categories-panel-header">
          <h3 className="categories-panel-title">Participants ({reg.lineItems.length})</h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
          {reg.lineItems.map((li, idx) => (
            <div
              key={li.id}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 16,
                background: "var(--bg-elevated, transparent)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: "1rem" }}>
                    {idx + 1}. {li.participantName}
                  </span>
                  {li.isRegistrant && (
                    <span className="status-badge status-active" style={{ fontSize: "0.7rem" }}>Registrant</span>
                  )}
                  <span className={`status-badge ${STATUS_STYLES[li.status] || "status-draft"}`} style={{ fontSize: "0.7rem" }}>
                    {li.status}
                  </span>
                </div>
                {li.uniqueRegId && (
                  <span style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    {li.uniqueRegId}
                  </span>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
                <Field label="Email" value={li.participantEmail} />
                <Field label="Phone" value={li.participantPhone} />
                <Field label="Gender" value={li.participantGender} />
                <Field label="Date of Birth" value={formatDate(li.participantDob)} />
                <Field label="City" value={li.participantCity} />
                <Field label="State" value={li.participantState} />
                <Field label="Country" value={li.participantCountry} />
                <Field label="Pin Code" value={li.participantPinCode} />
                <Field label="Address" value={li.participantAddress} />
                <Field label="Emergency Contact Name" value={li.emergencyContactName} />
                <Field label="Emergency Contact Phone" value={li.emergencyContactPhone} />
                <Field label="T-Shirt Size" value={li.tshirtSize} />
                <Field label="Bib Number" value={li.bibNumber} />
                <Field label="Category" value={li.categoryNameSnapshot} />
                <Field label="Distance" value={li.distanceSnapshot} />
                <Field label="Race Type" value={li.raceTypeSnapshot} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
