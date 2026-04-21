"use client";

import { Fragment, useEffect, useState, useCallback } from "react";

interface Donation {
  id: number;
  donorName: string;
  donorEmail: string;
  donorPhone: string | null;
  amount: number;
  causeName: string;
  ngoName: string;
  panCardName: string | null;
  panCardNumber: string | null;
  wantsTaxExemption: boolean;
  paymentStatus: string;
  paymentId: string | null;
  razorpayOrderId: string | null;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export default function DonationsClient() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/donations?${params}`);
      const data = await res.json();
      if (data.success) setDonations(data.donations);
    } catch {
      console.error("Failed to fetch donations");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  function toggleExpand(id: number) {
    setExpandedId(expandedId === id ? null : id);
  }

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Donations</h1>
          <p className="page-subtitle">
            Contributions from supporters &mdash;{" "}
            <strong>₹{loading ? "..." : totalDonated.toLocaleString('en-IN')}</strong> total
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="table-toolbar">
        <div className="table-search-wrapper">
          <svg
            className="table-search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by donor or cause..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="table-search"
            id="donations-search"
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div className="table-loading">
            <div className="spinner" />
            <p>Loading donations...</p>
          </div>
        ) : donations.length === 0 ? (
          <div className="table-empty">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.3"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <p>No donations found</p>
          </div>
        ) : (
          <table className="data-table" id="donations-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Donor</th>
                <th>Cause</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((donation, index) => (
                <Fragment key={donation.id}>
                  <tr>
                    <td>
                      <span className="user-row-index">{index + 1}</span>
                    </td>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-sm" style={{ background: '#7c3aed', color: 'white' }}>
                          {donation.donorName.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className="user-name-text">{donation.donorName}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{donation.donorEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td>{donation.causeName}</td>
                    <td style={{ fontWeight: 700, color: '#059669' }}>
                      ₹{donation.amount.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`status-badge ${donation.paymentStatus === 'PAID' ? 'status-active' : 'status-draft'}`}>
                        {donation.paymentStatus}
                      </span>
                    </td>
                    <td>
                      {new Date(donation.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <button
                        className="action-btn action-edit"
                        onClick={() => toggleExpand(donation.id)}
                        title="View donation details"
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            transition: "transform 0.2s",
                            transform: expandedId === donation.id ? "rotate(180deg)" : "rotate(0deg)",
                          }}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  {expandedId === donation.id && (
                    <tr key={`${donation.id}-detail`} className="user-detail-row">
                      <td colSpan={7}>
                        <div className="user-detail-grid">
                          <div className="user-detail-item">
                            <span className="user-detail-label">Donor Phone</span>
                            <span className="user-detail-value">{donation.donorPhone || "—"}</span>
                          </div>
                          <div className="user-detail-item">
                            <span className="user-detail-label">NGO (Target)</span>
                            <span className="user-detail-value">{donation.ngoName}</span>
                          </div>
                          <div className="user-detail-item">
                            <span className="user-detail-label">Tax Exemption</span>
                            <span className="user-detail-value">{donation.wantsTaxExemption ? "Yes" : "No"}</span>
                          </div>
                          <div className="user-detail-item">
                            <span className="user-detail-label">PAN Info</span>
                            <span className="user-detail-value">
                              {donation.panCardName ? `${donation.panCardName} (${donation.panCardNumber || "—"})` : "—"}
                            </span>
                          </div>
                          <div className="user-detail-item">
                            <span className="user-detail-label">Payment ID</span>
                            <span className="user-detail-value" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{donation.paymentId || "—"}</span>
                          </div>
                          <div className="user-detail-item">
                            <span className="user-detail-label">Razorpay Order ID</span>
                            <span className="user-detail-value" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{donation.razorpayOrderId || "—"}</span>
                          </div>
                          {donation.user && (
                            <div className="user-detail-item">
                              <span className="user-detail-label">Logged-in User</span>
                              <span className="user-detail-value">{donation.user.name} ({donation.user.email})</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
