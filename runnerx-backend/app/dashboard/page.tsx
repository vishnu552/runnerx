import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileForm } from "./components/profile-form";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(session.userId) },
    select: { id: true, name: true, email: true, role: true, createdAt: true, gender: true, dateOfBirth: true, phone: true, city: true, state: true, county: true, pinCode: true, address: true, bloodGroup: true, emergencyContactName: true, emergencyContactPhone: true, tshirtSize: true },
  });
  if (!user) redirect("/login");

  const couponCount = await prisma.coupon.count();
  const activeCoupons = await prisma.coupon.count({ where: { isActive: true } });

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user.name}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M20 21a8 8 0 10-16 0" />
            </svg>
          </div>
          <div>
            <div className="stat-label">Role</div>
            <div className="stat-value">{user.role}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 9a3 3 0 013-3h14a3 3 0 013 3" />
              <path d="M2 9v6a3 3 0 003 3h14a3 3 0 003-3V9" />
              <path d="M9 12h6" />
            </svg>
          </div>
          <div>
            <div className="stat-label">Total Coupons</div>
            <div className="stat-value">{couponCount}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <div className="stat-label">Active Coupons</div>
            <div className="stat-value">{activeCoupons}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-amber">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4" />
              <path d="M8 2v4" />
              <path d="M3 10h18" />
            </svg>
          </div>
          <div>
            <div className="stat-label">Member Since</div>
            <div className="stat-value">
              {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>
        </div>
      </div>

      <ProfileForm user={user} />
    </div>
  );
}
