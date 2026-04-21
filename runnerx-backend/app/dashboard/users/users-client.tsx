"use client";

import { Fragment, useEffect, useState, useCallback } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  gender: string | null;
  dateOfBirth: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  bloodGroup: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  tshirtSize: string | null;
  createdAt: string;
}

export default function UsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/users?${params}`);
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id);
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">
            Registered users &mdash;{" "}
            <strong>{loading ? "..." : users.length}</strong> total
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
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="table-search"
            id="users-search"
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div className="table-loading">
            <div className="spinner" />
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
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
              <circle cx="12" cy="8" r="4" />
              <path d="M20 21a8 8 0 10-16 0" />
            </svg>
            <p>No users found</p>
          </div>
        ) : (
          <table className="data-table" id="users-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
                <th>Gender</th>
                <th>Joined</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <Fragment key={user.id}>
                  <tr>
                    <td>
                      <span className="user-row-index">{index + 1}</span>
                    </td>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="user-name-text">{user.name}</span>
                      </div>
                    </td>
                    <td className="td-description">{user.email}</td>
                    <td>{user.phone || <span className="text-muted">—</span>}</td>
                    <td>
                      {user.city
                        ? `${user.city}${user.state ? `, ${user.state}` : ""}`
                        : <span className="text-muted">—</span>}
                    </td>
                    <td>{user.gender || <span className="text-muted">—</span>}</td>
                    <td>
                      {new Date(user.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <button
                        className="action-btn action-edit"
                        onClick={() => toggleExpand(user.id)}
                        title="View profile details"
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
                            transform: expandedId === user.id ? "rotate(180deg)" : "rotate(0deg)",
                          }}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  {expandedId === user.id && (
                    <tr key={`${user.id}-detail`} className="user-detail-row">
                      <td colSpan={8}>
                        <div className="user-detail-grid">
                          <div className="user-detail-item">
                            <span className="user-detail-label">Date of Birth</span>
                            <span className="user-detail-value">
                              {user.dateOfBirth
                                ? new Date(user.dateOfBirth).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                                : "Not provided"}
                            </span>
                          </div>
                          <div className="user-detail-item">
                            <span className="user-detail-label">Blood Group</span>
                            <span className="user-detail-value">{user.bloodGroup || "Not provided"}</span>
                          </div>
                          <div className="user-detail-item">
                            <span className="user-detail-label">T-Shirt Size</span>
                            <span className="user-detail-value">{user.tshirtSize || "Not provided"}</span>
                          </div>
                          <div className="user-detail-item">
                            <span className="user-detail-label">Emergency Contact</span>
                            <span className="user-detail-value">
                              {user.emergencyContactName
                                ? `${user.emergencyContactName} (${user.emergencyContactPhone || "—"})`
                                : "Not provided"}
                            </span>
                          </div>
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
