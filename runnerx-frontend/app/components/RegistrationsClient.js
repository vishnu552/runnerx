"use client";

import { useState } from "react";
import { authenticatedFetch } from "@/app/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function getBannerUrl(bannerImage) {
  if (!bannerImage) return null;
  if (bannerImage.startsWith("http")) return bannerImage;
  return `${API_URL}${bannerImage}`;
}

export default function RegistrationsClient({
  registrations: initialRegistrations,
}) {
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [activeTab, setActiveTab] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSiblings, setSelectedSiblings] = useState([]);
  const [selectedReg, setSelectedReg] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [updateType, setUpdateType] = useState("TSHIRT");
  const [bibCheckStatus, setBibCheckStatus] = useState(null); // null, 'checking', 'available', 'unavailable'
  const [bibPaying, setBibPaying] = useState(false);
  const [showTshirtChart, setShowTshirtChart] = useState(false);

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const openModal = (type, item, reg) => {
    setActiveTab(type);
    setSelectedItem(item);
    setSelectedReg(reg);
    // Find all sibling line items for the same participant
    const siblings = reg.lineItems.filter(
      (li) =>
        (li.participantName || "").toLowerCase().trim() ===
          (item.participantName || "").toLowerCase().trim() &&
        (li.participantEmail || "").toLowerCase().trim() ===
          (item.participantEmail || "").toLowerCase().trim() &&
        (li.participantPhone || "").trim() ===
          (item.participantPhone || "").trim(),
    );
    setSelectedSiblings(siblings);
    if (type === "edit") {
      const initialData = {
        tshirtSize: item.tshirtSize || "",
        bibNumber: "", // For VIP bib we start fresh
      };
      setFormData(initialData);
      setUpdateType("TSHIRT");
      setBibCheckStatus(null);
    }
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setActiveTab(null);
    setSelectedItem(null);
    setSelectedSiblings([]);
    setSelectedReg(null);
    setMessage(null);
    document.body.style.overflow = "auto";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateTshirt = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage({ type: "info", text: "Saving T-Shirt size..." });
    try {
      const results = await Promise.all(
        selectedSiblings.map((li) =>
          authenticatedFetch(`/api/auth/registrations/line-item/${li.id}`, {
            method: "PATCH",
            body: JSON.stringify({
              tshirtSize: formData.tshirtSize,
              isProfileUpdated: true,
            }),
          }).then((r) => r.json()),
        ),
      );
      if (results.every((r) => r.success)) {
        setMessage({
          type: "success",
          text: "T-Shirt size updated successfully! Refreshing...",
        });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage({ type: "error", text: "Failed to update T-Shirt size" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error occurred" });
    } finally {
      setSaving(false);
    }
  };

  const checkBibAvailability = async () => {
    const bib = formData.bibNumber?.trim();
    if (!bib) return;
    setBibCheckStatus("checking");
    try {
      const res = await fetch(
        `${API_URL}/api/bibs/check?eventId=${selectedReg.eventId}&bib=${bib}`,
      );
      const data = await res.json();
      setBibCheckStatus(data.available ? "available" : "unavailable");
    } catch (err) {
      setBibCheckStatus("error");
    }
  };

  const handlePayForBib = async () => {
    if (bibCheckStatus !== "available") return;
    setBibPaying(true);
    setMessage({ type: "info", text: "Initiating payment..." });

    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) throw new Error("Razorpay SDK failed to load");

      // Create order
      const res = await authenticatedFetch(`/api/bibs/purchase`, {
        method: "POST",
        body: JSON.stringify({
          lineItemId: selectedItem.id,
          bibNumber: formData.bibNumber.trim(),
          eventId: selectedReg.eventId,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to create payment order");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.razorpayOrder.amount,
        currency: data.razorpayOrder.currency,
        name: "RunnerX Kota Marathon",
        description: `VIP Bib #${formData.bibNumber}`,
        order_id: data.razorpayOrder.id,
        handler: async function (response) {
          setMessage({ type: "info", text: "Verifying payment..." });
          const verifyRes = await authenticatedFetch(`/api/bibs/verify`, {
            method: "POST",
            body: JSON.stringify({
              ...response,
              lineItemId: selectedItem.id,
              bibNumber: formData.bibNumber.trim(),
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setMessage({
              type: "success",
              text: "VIP Bib purchased successfully! Refreshing...",
            });
            setTimeout(() => window.location.reload(), 1500);
          } else {
            setMessage({ type: "error", text: "Payment verification failed." });
            setBibPaying(false);
          }
        },
        prefill: {
          name: selectedItem.participantName,
          email: selectedItem.participantEmail,
          contact: selectedItem.participantPhone,
        },
        theme: { color: "#ffc83c" },
        modal: { ondismiss: () => setBibPaying(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Payment initiation failed",
      });
      setBibPaying(false);
    }
  };

  return (
    <>
      <style>{`
        .reg-ticket {
          background: var(--card-bg, #fff);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          transition: box-shadow 0.2s;
          display: flex;
          flex-direction: column;
        }
        .reg-ticket:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.10); }

        /* Top row: image on left + event info on right */
        .ticket-top {
          display: flex;
          align-items: stretch;
          border-bottom: 2px dashed var(--border);
        }
        .ticket-poster {
          width: 200px;
          min-width: 200px;
          height: 160px;
          object-fit: cover;
          display: block;
          border-right: 1px solid var(--border);
          background: var(--surface);
        }
        .ticket-poster-placeholder {
          width: 200px;
          min-width: 200px;
          height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-right: 1px solid var(--border);
          color: #ffc83c;
        }
        .ticket-info {
          flex: 1;
          min-width: 0;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
        }
        .ticket-event-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text);
          text-transform: uppercase;
          font-style: italic;
          font-family: var(--font-heading, sans-serif);
          line-height: 1.2;
          margin: 0;
          overflow-wrap: anywhere;
        }
        .ticket-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .ticket-badges {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 2px;
        }
        .badge {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 20px;
          white-space: nowrap;
        }
        .badge-green { background: rgba(34,197,94,0.12); color: #22c55e; border: 1px solid rgba(34,197,94,0.3); }
        .badge-yellow { background: rgba(234,179,8,0.12); color: #d97706; border: 1px solid rgba(234,179,8,0.3); }
        .badge-red { background: rgba(239,68,68,0.12); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); }

        /* Participant rows */
        .participant-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 20px;
          border-bottom: 1px solid var(--border);
          position: relative;
        }
        .participant-row:last-child { border-bottom: none; }
        .participant-avatar {
          width: 42px; height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffc83c 0%, #ff8c00 100%);
          color: #000;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem; font-weight: 800;
          flex-shrink: 0;
        }
        .participant-info { flex: 1; min-width: 0; }
        .participant-name {
          font-weight: 700; font-size: 0.95rem;
          color: var(--text);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .participant-sub {
          font-size: 0.78rem; color: var(--text-muted);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .participant-chips {
          display: flex; gap: 6px; margin-top: 4px; flex-wrap: wrap;
        }
        .chip-cat {
          font-size: 0.68rem; font-weight: 700;
          padding: 2px 8px; border-radius: 6px;
          background: rgba(255,200,60,0.12); color: #b45309;
          border: 1px solid rgba(255,200,60,0.3);
        }
        .chip-bib {
          font-size: 0.68rem; font-weight: 700;
          padding: 2px 8px; border-radius: 6px;
          background: rgba(99,102,241,0.1); color: #6366f1;
          border: 1px solid rgba(99,102,241,0.25);
        }
        .chip-you {
          font-size: 0.62rem; font-weight: 700;
          padding: 2px 7px; border-radius: 4px;
          background: rgba(255,200,60,0.1); color: #d97706;
          border: 1px solid rgba(255,200,60,0.3);
          text-transform: uppercase;
        }

        /* Action buttons — side on desktop, below on mobile */
        .action-btns {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-shrink: 0;
          align-items: stretch;
          min-width: 180px;
        }
        .action-btn {
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          transition: opacity 0.15s, transform 0.1s;
          text-decoration: none;
        }
        .action-btn:active { transform: scale(0.97); }
        .action-btn-view {
          background: var(--surface-alt, #f3f4f6);
          color: var(--text);
          border: 1px solid var(--border);
        }
        .action-btn-view:hover { background: var(--border); }
        .action-btn-edit {
          background: #ffc83c;
          color: #000;
        }
        .action-btn-edit:hover { opacity: 0.88; }
        .action-btn-disabled {
          background: var(--surface-alt, #f3f4f6);
          color: var(--text-muted);
          border: 1px solid var(--border);
          cursor: not-allowed;
          opacity: 0.55;
        }
        .action-btn-result {
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          color: #fff;
        }
        .action-btn-result:hover { opacity: 0.88; }

        /* Order footer */
        .ticket-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 10px 20px;
          background: var(--surface, #f9fafb);
          border-top: 1px solid var(--border);
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .ticket-footer span { overflow-wrap: anywhere; min-width: 0; }

        /* Responsive: stack image above info on mobile */
        @media (max-width: 800px) {
          .ticket-top { flex-direction: column; }
          .ticket-poster, .ticket-poster-placeholder {
            width: 100%;
            min-width: 100%;
            height: 140px;
            border-right: none;
            border-bottom: 1px solid var(--border);
          }
          .ticket-poster-placeholder { font-size: 2rem; }
          .ticket-event-title { font-size: 1.05rem; }

          .participant-row {
            flex-direction: column;
            align-items: flex-start;
            padding: 12px 14px;
            gap: 10px;
          }
          .participant-row .participant-top {
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
          }
          .participant-name,
          .participant-sub {
            white-space: normal;
            overflow-wrap: anywhere;
          }
          .action-btns {
            flex-direction: row;
            flex-wrap: wrap;
            min-width: unset;
            width: 100%;
          }
          .action-btn {
            flex: 1 1 auto;
            min-width: 0;
            font-size: 0.72rem;
            padding: 8px 10px;
          }
          .ticket-footer { flex-direction: column; gap: 6px; align-items: flex-start; padding: 10px 14px; }
        }

        .modal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 600px) {
          .modal-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {registrations.map((reg) => {
          const now = new Date();
          const regEnd = reg.event?.registrationEnd
            ? new Date(reg.event.registrationEnd)
            : null;
          const isRegClosed = regEnd ? now > regEnd : true;
          const isEventCompleted = reg.event?.status === "COMPLETED";
          const bannerUrl = getBannerUrl(reg.event?.bannerImage);

          return (
            <div key={reg.id} className="reg-ticket">
              {/* ── Top Row: Image (left) + Event Info (right) ── */}
              <div className="ticket-top">
                {bannerUrl ? (
                  <img
                    src={bannerUrl}
                    alt={reg.eventTitleSnapshot}
                    className="ticket-poster"
                  />
                ) : (
                  <div className="ticket-poster-placeholder">🏃</div>
                )}

                <div className="ticket-info">
                  <h3 className="ticket-event-title">
                    {reg.eventTitleSnapshot}
                  </h3>
                  <div className="ticket-meta">
                    <span>
                      📅{" "}
                      {new Date(reg.eventDateSnapshot).toLocaleDateString(
                        "en-IN",
                        {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </span>
                    <span>
                      🕐 Booked{" "}
                      {new Date(reg.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="ticket-badges">
                    <span
                      className={`badge ${reg.status === "CONFIRMED" ? "badge-green" : reg.status === "CANCELLED" ? "badge-red" : "badge-yellow"}`}
                    >
                      {reg.status}
                    </span>
                    <span
                      className={`badge ${reg.paymentStatus === "PAID" ? "badge-green" : "badge-yellow"}`}
                    >
                      {reg.paymentStatus}
                    </span>
                    {isRegClosed && (
                      <span className="badge badge-red">
                        Registration Closed
                      </span>
                    )}
                    {isEventCompleted && (
                      <span
                        className="badge"
                        style={{
                          background: "rgba(99,102,241,0.1)",
                          color: "#6366f1",
                          border: "1px solid rgba(99,102,241,0.25)",
                        }}
                      >
                        Event Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Participant Rows (grouped by person) ── */}
              {(() => {
                // Group line items by participant identity
                const grouped = [];
                const keyMap = {};
                reg.lineItems.forEach((li) => {
                  const key = `${(li.participantName || "").toLowerCase().trim()}|${(li.participantEmail || "").toLowerCase().trim()}|${(li.participantPhone || "").trim()}`;
                  if (keyMap[key] !== undefined) {
                    grouped[keyMap[key]].items.push(li);
                  } else {
                    keyMap[key] = grouped.length;
                    grouped.push({ key, items: [li] });
                  }
                });

                return grouped.map((group) => {
                  // Sort: ground categories first, then virtual
                  const sorted = [...group.items].sort((a, b) => {
                    const aVirtual = (
                      a.raceTypeSnapshot ||
                      a.distanceSnapshot ||
                      ""
                    )
                      .toLowerCase()
                      .includes("virtual")
                      ? 1
                      : 0;
                    const bVirtual = (
                      b.raceTypeSnapshot ||
                      b.distanceSnapshot ||
                      ""
                    )
                      .toLowerCase()
                      .includes("virtual")
                      ? 1
                      : 0;
                    return aVirtual - bVirtual;
                  });
                  const primary = sorted[0];
                  const isRegistrant = sorted.some((li) => li.isRegistrant);
                  const isProfileUpdated = sorted.some(
                    (li) => li.isProfileUpdated,
                  );

                  return (
                    <div key={group.key} className="participant-row">
                      <div
                        className="participant-top"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <div className="participant-info">
                          <div className="participant-name">
                            {primary.participantName}
                          </div>
                          <div className="participant-sub">
                            {primary.participantEmail} •{" "}
                            {primary.participantPhone}
                          </div>
                          <div className="participant-chips">
                            {sorted.map((li) => {
                              let catName = li.categoryNameSnapshot;
                              const isVirtual = (
                                li.raceTypeSnapshot ||
                                li.distanceSnapshot ||
                                ""
                              )
                                .toLowerCase()
                                .includes("virtual");
                              if (
                                isVirtual &&
                                !catName.toLowerCase().startsWith("virtual")
                              ) {
                                catName = `Virtual ${catName}`;
                              }
                              return (
                                <span key={li.id} className="chip-cat">
                                  {catName} ·{" "}
                                  {li.distanceSnapshot || li.raceTypeSnapshot}
                                </span>
                              );
                            })}
                            {(sorted.find((li) => li.tshirtSize) ||
                              primary) && (
                              <span className="chip-cat">
                                T-shirt:{" "}
                                {sorted.find((li) => li.tshirtSize)
                                  ?.tshirtSize || "—"}
                              </span>
                            )}
                            {sorted.map((li) =>
                              li.bibNumber ? (
                                <span key={`bib-${li.id}`} className="chip-bib">
                                  BIB #{li.bibNumber}
                                </span>
                              ) : null,
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons — single set per participant */}
                      <div className="action-btns">
                        <button
                          className="action-btn action-btn-view"
                          onClick={() => openModal("view", primary, reg)}
                        >
                          👁 View Details
                        </button>
                        {/* {isRegClosed ? (
                          <button className="action-btn action-btn-disabled" disabled title="Registration period has closed">
                            🔒 Change &amp; Upgrade Entry
                          </button>
                        ) : isProfileUpdated ? (
                          <button className="action-btn action-btn-disabled" disabled title="You have already updated this entry once">
                            🔒 Change &amp; Upgrade Entry
                          </button>
                        ) : (
                          <button
                            className="action-btn action-btn-edit"
                            onClick={() => openModal('edit', primary, reg)}
                          >
                            ✎ Change &amp; Upgrade Entry
                          </button>
                        )} */}
                      </div>
                    </div>
                  );
                });
              })()}

              {/* ── Order Footer ── */}
              <div className="ticket-footer">
                <span>
                  Total:{" "}
                  <strong>₹{reg.finalAmount?.toLocaleString("en-IN")}</strong>
                  {reg.couponCode && " · Discount applied"}
                </span>
                <span style={{ fontFamily: "monospace" }}>
                  Order: {reg.razorpayOrderId || `#${reg.orderId || reg.id}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Modal Overlay ── */}
      {activeTab && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "var(--card-bg, #fff)",
              width: "100%",
              maxWidth: "620px",
              borderRadius: "18px",
              overflow: "hidden",
              boxShadow: "0 30px 60px -12px rgba(0,0,0,0.35)",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                padding: "18px 24px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background:
                  activeTab === "edit"
                    ? "linear-gradient(90deg,#ffc83c22,transparent)"
                    : undefined,
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    fontStyle: "italic",
                    fontFamily: "var(--font-heading, sans-serif)",
                    margin: 0,
                  }}
                >
                  {activeTab === "view"
                    ? "👁 Participant Details"
                    : "✎ Change & Upgrade Entry"}
                </h2>
                {selectedItem && (
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                      margin: "2px 0 0",
                    }}
                  >
                    {selectedItem.participantName} ·{" "}
                    {selectedReg?.eventTitleSnapshot}
                  </p>
                )}
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.6rem",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: "24px", overflowY: "auto" }}>
              {activeTab === "view" ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  <DetailItem
                    label="Full Name"
                    value={selectedItem.participantName}
                  />
                  <DetailItem
                    label="Email"
                    value={selectedItem.participantEmail}
                  />
                  <DetailItem
                    label="Phone"
                    value={selectedItem.participantPhone}
                  />
                  <DetailItem
                    label="Gender"
                    value={selectedItem.participantGender}
                  />
                  <DetailItem
                    label="Date of Birth"
                    value={
                      selectedItem.participantDob
                        ? new Date(
                            selectedItem.participantDob,
                          ).toLocaleDateString("en-IN")
                        : "—"
                    }
                  />
                  <DetailItem
                    label="T-Shirt Size"
                    value={
                      selectedItem.tshirtSize ||
                      selectedSiblings.find((li) => li.tshirtSize)?.tshirtSize
                    }
                  />
                  <div style={{ gridColumn: "span 2" }}>
                    <DetailItem
                      label={
                        selectedSiblings.length > 1 ? "Categories" : "Category"
                      }
                      value={selectedSiblings
                        .map(
                          (li) =>
                            `${li.categoryNameSnapshot} · ${li.distanceSnapshot || li.raceTypeSnapshot}`,
                        )
                        .join("  |  ")}
                    />
                  </div>
                  {selectedSiblings
                    .filter((li) => li.bibNumber)
                    .map((li) => (
                      <DetailItem
                        key={li.id}
                        label={`BIB (${li.categoryNameSnapshot})`}
                        value={`#${li.bibNumber}`}
                        highlight
                      />
                    ))}
                  <div style={{ gridColumn: "span 2" }}>
                    <DetailItem
                      label="Address"
                      value={
                        [
                          selectedItem.participantAddress,
                          selectedItem.participantCity,
                          selectedItem.participantState,
                          selectedItem.participantPinCode,
                        ]
                          .filter(Boolean)
                          .join(", ") || "—"
                      }
                    />
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  {message && (
                    <div
                      style={{
                        padding: "12px 14px",
                        borderRadius: "10px",
                        fontSize: "0.88rem",
                        background:
                          message.type === "error"
                            ? "#fee2e2"
                            : message.type === "success"
                              ? "#dcfce7"
                              : "#e0f2fe",
                        color:
                          message.type === "error"
                            ? "#b91c1c"
                            : message.type === "success"
                              ? "#15803d"
                              : "#0369a1",
                        border: `1px solid ${message.type === "error" ? "#fecaca" : message.type === "success" ? "#bbf7d0" : "#bae6fd"}`,
                      }}
                    >
                      {message.text}
                    </div>
                  )}

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.73rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        marginBottom: "8px",
                        color: "var(--text-muted)",
                      }}
                    >
                      What do you want to change?
                    </label>
                    <select
                      value={updateType}
                      onChange={(e) => {
                        setUpdateType(e.target.value);
                        setBibCheckStatus(null);
                      }}
                      className="form-input w-full"
                      style={{
                        padding: "12px",
                        fontSize: "1rem",
                        fontWeight: 600,
                      }}
                    >
                      <option value="TSHIRT">Change T-Shirt Size</option>
                      <option value="BIB">VIP/Custom Bib Number (₹100)</option>
                    </select>
                  </div>

                  {updateType === "TSHIRT" && (
                    <div
                      style={{
                        background: "var(--surface-alt)",
                        padding: "20px",
                        borderRadius: "12px",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "0.73rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          marginBottom: "8px",
                          color: "var(--text-muted)",
                        }}
                      >
                        Select New T-Shirt Size
                        <button
                          type="button"
                          onClick={() => setShowTshirtChart(true)}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            color: "#00a0ff",
                            display: "flex",
                            alignItems: "center",
                          }}
                          title="View Size Chart"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                          </svg>
                        </button>
                      </label>
                      <select
                        name="tshirtSize"
                        value={formData.tshirtSize}
                        onChange={handleInputChange}
                        className="form-input w-full"
                        style={{ padding: "12px" }}
                        required
                      >
                        <option value="">— Select Size —</option>
                        <option value="XXS - 32 Inch">XXS - 32 Inch</option>
                        <option value="XS - 34 Inch">XS - 34 Inch</option>
                        <option value="S - 36 Inch">S - 36 Inch</option>
                        <option value="M - 38 Inch">M - 38 Inch</option>
                        <option value="L - 40 Inch">L - 40 Inch</option>
                        <option value="XL - 42 Inch">XL - 42 Inch</option>
                        <option value="XXL - 44 Inch">XXL - 44 Inch</option>
                      </select>
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                          marginTop: "12px",
                        }}
                      >
                        * Note: T-shirt sizes are subject to availability on the
                        event day.
                      </p>
                    </div>
                  )}

                  {updateType === "BIB" && (
                    <div
                      style={{
                        background: "var(--surface-alt)",
                        padding: "20px",
                        borderRadius: "12px",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div
                        style={{
                          marginBottom: "20px",
                          padding: "12px",
                          background: "rgba(99,102,241,0.1)",
                          borderRadius: "8px",
                          border: "1px solid rgba(99,102,241,0.2)",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "0.8rem",
                            color: "#6366f1",
                            margin: 0,
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                        >
                          Currently Allocated Bib
                        </p>
                        <p
                          style={{
                            fontSize: "1.4rem",
                            fontWeight: 900,
                            color: "#4f46e5",
                            margin: "4px 0 0",
                          }}
                        >
                          {selectedItem.bibNumber
                            ? `#${selectedItem.bibNumber}`
                            : "Not Allocated Yet"}
                        </p>
                      </div>

                      <label
                        style={{
                          display: "block",
                          fontSize: "0.73rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          marginBottom: "8px",
                          color: "var(--text-muted)",
                        }}
                      >
                        Enter Desired VIP Bib Number
                      </label>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <input
                          type="text"
                          name="bibNumber"
                          value={formData.bibNumber}
                          onChange={(e) => {
                            handleInputChange(e);
                            setBibCheckStatus(null);
                          }}
                          placeholder="e.g. 9999"
                          className="form-input"
                          style={{
                            flex: 1,
                            padding: "12px",
                            fontSize: "1.2rem",
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                          }}
                        />
                        <button
                          onClick={checkBibAvailability}
                          disabled={
                            !formData.bibNumber?.trim() ||
                            bibCheckStatus === "checking"
                          }
                          style={{
                            padding: "0 20px",
                            background: "#1a1a2e",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Check
                        </button>
                      </div>

                      {bibCheckStatus === "checking" && (
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--text-muted)",
                            marginTop: "10px",
                            fontWeight: 600,
                          }}
                        >
                          Checking availability...
                        </p>
                      )}
                      {bibCheckStatus === "available" && (
                        <p
                          style={{
                            fontSize: "0.9rem",
                            color: "#16a34a",
                            marginTop: "10px",
                            fontWeight: 700,
                          }}
                        >
                          ✓ VIP Bib #{formData.bibNumber} is available!
                        </p>
                      )}
                      {bibCheckStatus === "unavailable" && (
                        <p
                          style={{
                            fontSize: "0.9rem",
                            color: "#dc2626",
                            marginTop: "10px",
                            fontWeight: 700,
                          }}
                        >
                          ✗ Bib #{formData.bibNumber} is already taken. Try
                          another.
                        </p>
                      )}
                      {bibCheckStatus === "error" && (
                        <p
                          style={{
                            fontSize: "0.9rem",
                            color: "#dc2626",
                            marginTop: "10px",
                            fontWeight: 700,
                          }}
                        >
                          Failed to check availability.
                        </p>
                      )}

                      <div
                        style={{
                          marginTop: "24px",
                          paddingTop: "16px",
                          borderTop: "1px dashed var(--border)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--text-muted)",
                              margin: 0,
                              fontWeight: 600,
                              textTransform: "uppercase",
                            }}
                          >
                            VIP Bib Price
                          </p>
                          <p
                            style={{
                              fontSize: "1.4rem",
                              fontWeight: 900,
                              color: "var(--text)",
                              margin: 0,
                            }}
                          >
                            ₹100
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div
              style={{
                padding: "18px 24px",
                borderTop: "1px solid var(--border)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={closeModal}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "transparent",
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "var(--text)",
                }}
              >
                Close
              </button>
              {activeTab === "edit" && updateType === "TSHIRT" && (
                <button
                  onClick={handleUpdateTshirt}
                  disabled={saving || !formData.tshirtSize}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#ffc83c",
                    color: "#000",
                    fontWeight: 700,
                    cursor:
                      saving || !formData.tshirtSize
                        ? "not-allowed"
                        : "pointer",
                    opacity: saving || !formData.tshirtSize ? 0.7 : 1,
                  }}
                >
                  {saving ? "Saving..." : "Save T-Shirt Size"}
                </button>
              )}
              {activeTab === "edit" && updateType === "BIB" && (
                <button
                  onClick={handlePayForBib}
                  disabled={bibPaying || bibCheckStatus !== "available"}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "8px",
                    border: "none",
                    background:
                      bibCheckStatus === "available"
                        ? "#16a34a"
                        : "var(--surface-alt)",
                    color:
                      bibCheckStatus === "available"
                        ? "#fff"
                        : "var(--text-muted)",
                    fontWeight: 700,
                    cursor:
                      bibCheckStatus === "available" && !bibPaying
                        ? "pointer"
                        : "not-allowed",
                  }}
                >
                  {bibPaying ? "Processing..." : "Pay ₹100 & Upgrade"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* T-Shirt Size Chart Modal */}
      {showTshirtChart && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            backdropFilter: "blur(5px)",
          }}
          onClick={() => setShowTshirtChart(false)}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "600px",
              width: "100%",
              background: "white",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTshirtChart(false)}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "white",
                border: "none",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                fontSize: "1.5rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                zIndex: 1,
              }}
            >
              ×
            </button>
            <img
              src="/tshirt_chart.jpeg"
              alt="T-Shirt Size Chart"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        </div>
      )}
    </>
  );
}

function DetailItem({ label, value, highlight }) {
  return (
    <div>
      <p
        style={{
          fontSize: "0.68rem",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          fontWeight: 700,
          marginBottom: "4px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "0.95rem",
          fontWeight: 600,
          color: highlight ? "#6366f1" : "var(--text)",
          margin: 0,
        }}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function InputGroup({
  label,
  name,
  value,
  onChange,
  required = false,
  type = "text",
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "0.73rem",
          fontWeight: 700,
          textTransform: "uppercase",
          marginBottom: "6px",
          color: "var(--text-muted)",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="form-input w-full"
        style={{ padding: "10px", fontSize: "0.93rem" }}
      />
    </div>
  );
}
