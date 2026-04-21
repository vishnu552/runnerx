"use client";

import { useState, useEffect, useCallback, Fragment } from "react";

interface LineItem {
  id: number;
  participantName: string;
  participantEmail: string;
  participantPhone: string;
  participantGender: string;
  participantDob: string;
  participantCity: string | null;
  participantState: string | null;
  categoryNameSnapshot: string;
  distanceSnapshot: string;
  raceTypeSnapshot: string;
  unitPriceSnapshot: number;
  discountPriceSnapshot: number | null;
  finalPriceSnapshot: number;
  isRegistrant: boolean;
}

interface Registration {
  id: number;
  eventId: number;
  userId: number | null;
  status: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  couponCode: string | null;
  paymentStatus: string;
  paymentId: string | null;
  eventTitleSnapshot: string;
  eventDateSnapshot: string;
  siteForSnapshot: string;
  lineItems: LineItem[];
  event: { id: number; title: string; siteFor: string } | null;
  user: { id: number; name: string; email: string } | null;
  createdAt: string;
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

export default function RegistrationsClient() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/registrations?${params}`);
      const data = await res.json();
      if (data.success) setRegistrations(data.registrations);
    } catch {
      console.error("Failed to fetch registrations");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Registrations</h1>
          <p className="page-subtitle">View and manage event registrations</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {registrations.length} total
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
            placeholder="Search by name, email, event..."
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
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div className="table-loading">
            <div className="spinner" />
            <p>Loading registrations...</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="table-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v-2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            <p>No registrations found</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th></th>
                <th>ID</th>
                <th>Event</th>
                <th>Registrant</th>
                <th>Participants</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => {
                const isExpanded = expandedId === reg.id;
                const primaryParticipant = reg.lineItems.find(li => li.isRegistrant) || reg.lineItems[0];
                return (
                  <Fragment key={reg.id}>
                    <tr className={isExpanded ? "row-expanded" : ""}>
                      <td>
                        <button
                          className="expand-btn"
                          onClick={() => setExpandedId(isExpanded ? null : reg.id)}
                          title={isExpanded ? "Collapse" : "Show participants"}
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
                        <span style={{ fontSize: "0.85rem", fontFamily: "monospace", color: "var(--text-muted)" }}>
                          #{reg.id}
                        </span>
                      </td>
                      <td>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{reg.eventTitleSnapshot}</span>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {new Date(reg.eventDateSnapshot).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </div>
                        </div>
                      </td>
                      <td>
                        {primaryParticipant ? (
                          <div>
                            <span style={{ fontSize: "0.85rem" }}>{primaryParticipant.participantName}</span>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {primaryParticipant.participantEmail}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td>
                        <span className="race-type-badge">{reg.lineItems.length}</span>
                      </td>
                      <td>
                        <div>
                          <span style={{ fontWeight: 600 }}>₹{reg.finalAmount.toLocaleString("en-IN")}</span>
                          {reg.discountAmount > 0 && (
                            <div style={{ fontSize: "0.75rem", color: "#22c55e" }}>
                              −₹{reg.discountAmount.toLocaleString("en-IN")}
                              {reg.couponCode && ` (${reg.couponCode})`}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${STATUS_STYLES[reg.status] || "status-draft"}`}>
                          {reg.status}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${PAYMENT_STYLES[reg.paymentStatus] || "status-draft"}`}>
                          {reg.paymentStatus}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.8rem" }}>
                        {formatDate(reg.createdAt)}
                      </td>
                    </tr>

                    {/* Expanded: participant details */}
                    {isExpanded && (
                      <tr className="expanded-row">
                        <td colSpan={9}>
                          <div className="categories-panel">
                            <div className="categories-panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <h3 className="categories-panel-title">Participants ({reg.lineItems.length})</h3>
                              {reg.paymentId && (
                                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                                  Transaction ID: <span style={{ fontFamily: "monospace", color: "var(--text)" }}>{reg.paymentId}</span>
                                </div>
                              )}
                            </div>
                            <table className="data-table categories-table">
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>Email</th>
                                  <th>Phone</th>
                                  <th>Gender</th>
                                  <th>Category</th>
                                  <th>Price</th>
                                  <th>Self?</th>
                                </tr>
                              </thead>
                              <tbody>
                                {reg.lineItems.map((li) => (
                                  <tr key={li.id}>
                                    <td style={{ fontWeight: 600 }}>{li.participantName}</td>
                                    <td>{li.participantEmail}</td>
                                    <td>{li.participantPhone}</td>
                                    <td>{li.participantGender}</td>
                                    <td>
                                      <span className="race-type-badge">
                                        {li.categoryNameSnapshot} ({li.distanceSnapshot})
                                      </span>
                                    </td>
                                    <td>
                                      {li.discountPriceSnapshot ? (
                                        <>
                                          <span style={{ textDecoration: "line-through", opacity: 0.5, marginRight: 4 }}>₹{li.unitPriceSnapshot}</span>
                                          ₹{li.finalPriceSnapshot}
                                        </>
                                      ) : (
                                        <>₹{li.finalPriceSnapshot}</>
                                      )}
                                    </td>
                                    <td>{li.isRegistrant ? "✓" : ""}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
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
    </div>
  );
}
